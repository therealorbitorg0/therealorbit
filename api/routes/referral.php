<?php
// ================================
// TRO – Referral Routes
// ================================

$db = getDB();
$payload = requireAuth();
$userId = $payload['user_id'];

switch ($path) {

    case 'referral/directs':
        $stmt = $db->prepare('SELECT id, name, email, user_id, active_status, created_at FROM users WHERE sponsor_id = ? ORDER BY created_at DESC');
        $stmt->execute([$userId]);
        jsonSuccess(['directs' => $stmt->fetchAll()]);
        break;

    case 'referral/fast-income':
        $stmt = $db->prepare('SELECT COUNT(*) as cnt FROM users WHERE sponsor_id = ? AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())');
        $stmt->execute([$userId]);
        $count = $stmt->fetch()['cnt'] ?? 0;
        jsonSuccess(['count' => $count, 'eligible' => $count >= 4, 'needed' => 4]);
        break;

    case 'referral/claim':
        // Check already claimed this month
        $stmt = $db->prepare("SELECT id FROM transactions WHERE user_id = ? AND tx_type = 'referral_claim' AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())");
        $stmt->execute([$userId]);
        if ($stmt->fetch()) jsonError('Already claimed this month');

        // Get unclaimed referral income
        $stmt = $db->prepare('SELECT direct_income FROM incomes WHERE user_id = ?');
        $stmt->execute([$userId]);
        $income = $stmt->fetch();
        $amount = (float)($income['direct_income'] ?? 0);

        if ($amount <= 0) jsonError('No income available to claim');

        // Transfer to main wallet
        $db->prepare('UPDATE wallets SET main_wallet = main_wallet + ?, updated_at=NOW() WHERE user_id = ?')->execute([$amount, $userId]);

        // Reset direct income
        $db->prepare('UPDATE incomes SET direct_income = 0, updated_at=NOW() WHERE user_id = ?')->execute([$userId]);

        // Log transaction
        $db->prepare('INSERT INTO transactions (user_id, tx_type, type, amount, status, remarks, created_at, updated_at) VALUES (?, "referral_claim", "credit", ?, "completed", "Referral income claim", NOW(), NOW())')
           ->execute([$userId, $amount]);

        jsonSuccess(['message' => 'Income claimed successfully', 'amount' => $amount]);
        break;
}
