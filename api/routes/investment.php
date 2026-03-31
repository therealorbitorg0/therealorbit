<?php
// ================================
// TRO – Investment Routes
// ================================

$db = getDB();
$payload = requireAuth();
$userId = $payload['user_id'];

switch ($path) {

    case 'investment/plan':
        // Get plan settings from DB
        $stmt = $db->prepare("SELECT * FROM settings WHERE slug IN ('entry_amount','wallet_address','referral_percent','pension_amount','group_size')");
        $stmt->execute();
        $settings = [];
        foreach ($stmt->fetchAll() as $row) {
            $settings[$row['slug']] = $row['value'];
        }
        jsonSuccess($settings);
        break;

    case 'investment/activate':
        $body = getBody();
        $txHash = trim($body['tx_hash'] ?? '');

        if (!$txHash || strlen($txHash) < 10) jsonError('Invalid transaction hash');

        // Check already invested
        $stmt = $db->prepare('SELECT id FROM investments WHERE user_id = ? AND status = 1');
        $stmt->execute([$userId]);
        if ($stmt->fetch()) jsonError('You already have an active investment');

        // Check duplicate tx hash
        $stmt = $db->prepare('SELECT id FROM investments WHERE tx_hash = ?');
        $stmt->execute([$txHash]);
        if ($stmt->fetch()) jsonError('Transaction hash already used');

        // Get entry amount from settings
        $stmt = $db->prepare("SELECT value FROM settings WHERE slug = 'entry_amount' LIMIT 1");
        $stmt->execute();
        $entryAmount = (float)($stmt->fetch()['value'] ?? 167);

        // Create investment (pending admin approval)
        $stmt = $db->prepare('INSERT INTO investments (user_id, amount, tx_hash, status, created_at, updated_at) VALUES (?, ?, ?, 0, NOW(), NOW())');
        $stmt->execute([$userId, $entryAmount, $txHash]);
        $investId = $db->lastInsertId();

        // Log transaction
        $db->prepare('INSERT INTO transactions (user_id, tx_type, type, amount, tx_id, status, remarks, created_at, updated_at) VALUES (?, "deposit", "debit", ?, ?, "pending", "Investment deposit", NOW(), NOW())')
           ->execute([$userId, $entryAmount, $txHash]);

        jsonSuccess(['message' => 'Investment submitted. Pending admin verification.', 'investment_id' => $investId]);
        break;

    case 'investment/history':
        $stmt = $db->prepare('SELECT * FROM investments WHERE user_id = ? ORDER BY created_at DESC');
        $stmt->execute([$userId]);
        jsonSuccess($stmt->fetchAll());
        break;
}
