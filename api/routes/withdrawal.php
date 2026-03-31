<?php
// ================================
// TRO – Withdrawal Routes
// ================================

$db = getDB();
$payload = requireAuth();
$userId = $payload['user_id'];

if ($path === 'wallet/balance') {
    $stmt = $db->prepare('SELECT * FROM wallets WHERE user_id = ?');
    $stmt->execute([$userId]);
    jsonSuccess($stmt->fetch() ?: ['main_wallet' => 0, 'fund_wallet' => 0]);
}

if ($path === 'withdrawal/history') {
    $stmt = $db->prepare('SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC');
    $stmt->execute([$userId]);
    jsonSuccess($stmt->fetchAll());
}

if ($path === 'withdrawal/request') {
    $body = getBody();
    $amount = (float)($body['amount'] ?? 0);
    $walletAddress = trim($body['wallet_address'] ?? '');
    $walletType = $body['wallet_type'] ?? 'main';

    if ($amount < 10) jsonError('Minimum withdrawal is $10 USDT');
    if (!$walletAddress || strlen($walletAddress) < 30) jsonError('Invalid wallet address');

    // Get withdrawal fee from settings
    $stmt = $db->prepare("SELECT value FROM settings WHERE slug = 'withdrawal_fee' LIMIT 1");
    $stmt->execute();
    $feePercent = (float)($stmt->fetch()['value'] ?? 2);
    $fee = $amount * ($feePercent / 100);
    $payable = $amount - $fee;

    // Check balance
    $stmt = $db->prepare('SELECT main_wallet FROM wallets WHERE user_id = ?');
    $stmt->execute([$userId]);
    $wallet = $stmt->fetch();
    if (!$wallet || $wallet['main_wallet'] < $amount) jsonError('Insufficient balance');

    // Deduct balance
    $db->prepare('UPDATE wallets SET main_wallet = main_wallet - ?, updated_at=NOW() WHERE user_id = ?')
       ->execute([$amount, $userId]);

    // Create withdrawal record
    $stmt = $db->prepare('INSERT INTO withdrawals (user_id, amount, tx_charge, payable, wallet_address, wallet_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, "pending", NOW(), NOW())');
    $stmt->execute([$userId, $amount, $fee, $payable, $walletAddress, $walletType]);

    // Log transaction
    $db->prepare('INSERT INTO transactions (user_id, tx_type, type, amount, status, remarks, created_at, updated_at) VALUES (?, "withdrawal", "debit", ?, "pending", "Withdrawal request", NOW(), NOW())')
       ->execute([$userId, $amount]);

    jsonSuccess(['message' => 'Withdrawal request submitted']);
}
