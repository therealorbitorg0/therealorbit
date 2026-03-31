<?php
// ================================
// TRO – Dashboard Routes
// ================================

$db = getDB();
$payload = requireAuth();
$userId = $payload['user_id'];

switch ($path) {

    case 'dashboard/stats':
        // Wallet
        $stmt = $db->prepare('SELECT * FROM wallets WHERE user_id = ?');
        $stmt->execute([$userId]);
        $wallet = $stmt->fetch() ?: ['main_wallet' => 0, 'fund_wallet' => 0];

        // Incomes
        $stmt = $db->prepare('SELECT * FROM incomes WHERE user_id = ?');
        $stmt->execute([$userId]);
        $incomes = $stmt->fetch() ?: ['direct_income' => 0, 'pension_income' => 0];

        // Total directs
        $stmt = $db->prepare('SELECT COUNT(*) as cnt FROM users WHERE sponsor_id = ?');
        $stmt->execute([$userId]);
        $totalDirects = $stmt->fetch()['cnt'] ?? 0;

        // This month directs
        $stmt = $db->prepare('SELECT COUNT(*) as cnt FROM users WHERE sponsor_id = ? AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())');
        $stmt->execute([$userId]);
        $monthDirects = $stmt->fetch()['cnt'] ?? 0;

        // Fast income count (4+ = eligible)
        $fastIncomeCount = $monthDirects;

        // User group
        $stmt = $db->prepare('SELECT ug.*, gc.name FROM user_groups ug LEFT JOIN group_cycles gc ON ug.group_id = gc.id WHERE ug.user_id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $userGroup = $stmt->fetch();

        // Group member count
        $groupInfo = [];
        if ($userGroup) {
            $stmt = $db->prepare('SELECT COUNT(*) as cnt FROM user_groups WHERE group_id = ?');
            $stmt->execute([$userGroup['group_id']]);
            $groupInfo = [
                'name' => $userGroup['name'] ?? 'Group A',
                'current_members' => $stmt->fetch()['cnt'] ?? 0,
            ];
        }

        // User info
        $stmt = $db->prepare('SELECT id, name, email, user_id, kyc_status, eth_address FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        jsonSuccess([
            'wallet' => $wallet,
            'incomes' => $incomes,
            'total_directs' => $totalDirects,
            'monthly_directs' => $monthDirects,
            'fast_income_count' => $fastIncomeCount,
            'group' => $groupInfo,
            'user' => $user,
        ]);
        break;

    case 'dashboard/team':
        $stmt = $db->prepare('
            SELECT u.id, u.name, u.email, u.user_id, u.mobile, u.active_status, u.created_at,
                   kd.status as kyc_status
            FROM users u
            LEFT JOIN kyc_documents kd ON kd.user_id = u.id AND kd.id = (SELECT MAX(id) FROM kyc_documents WHERE user_id = u.id)
            WHERE u.sponsor_id = ?
            ORDER BY u.created_at DESC
        ');
        $stmt->execute([$userId]);
        $team = $stmt->fetchAll();

        jsonSuccess(['team' => $team]);
        break;

    case 'dashboard/transactions':
        $page = max(1, (int)($_GET['page'] ?? 1));
        $type = $_GET['type'] ?? '';
        $perPage = 15;
        $offset = ($page - 1) * $perPage;

        $where = 'WHERE user_id = ?';
        $params = [$userId];
        if ($type) { $where .= ' AND tx_type = ?'; $params[] = $type; }

        $countStmt = $db->prepare("SELECT COUNT(*) as cnt FROM transactions $where");
        $countStmt->execute($params);
        $total = $countStmt->fetch()['cnt'];

        $stmt = $db->prepare("SELECT * FROM transactions $where ORDER BY created_at DESC LIMIT $perPage OFFSET $offset");
        $stmt->execute($params);
        $transactions = $stmt->fetchAll();

        jsonSuccess([
            'data' => $transactions,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
        ]);
        break;

    case 'dashboard/incomes':
        $stmt = $db->prepare('SELECT * FROM incomes WHERE user_id = ?');
        $stmt->execute([$userId]);
        jsonSuccess(['incomes' => $stmt->fetch() ?: []]);
        break;

    case 'dashboard/pension':
        $stmt = $db->prepare('SELECT COUNT(*) as cnt FROM users WHERE sponsor_id = ? AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())');
        $stmt->execute([$userId]);
        $monthlyDirects = $stmt->fetch()['cnt'] ?? 0;

        // Is group complete?
        $stmt = $db->prepare('SELECT ug.*, gc.status as group_status FROM user_groups ug LEFT JOIN group_cycles gc ON ug.group_id = gc.id WHERE ug.user_id = ?');
        $stmt->execute([$userId]);
        $groupInfo = $stmt->fetch();

        jsonSuccess([
            'monthly_directs' => $monthlyDirects,
            'group_complete' => ($groupInfo['group_status'] ?? 0) == 1,
            'eligible' => $monthlyDirects >= 2,
        ]);
        break;

    case 'dashboard/group':
        $stmt = $db->prepare('SELECT ug.*, gc.name, gc.status FROM user_groups ug LEFT JOIN group_cycles gc ON ug.group_id = gc.id WHERE ug.user_id = ?');
        $stmt->execute([$userId]);
        $group = $stmt->fetch();

        if ($group) {
            $stmt = $db->prepare('SELECT COUNT(*) as cnt FROM user_groups WHERE group_id = ?');
            $stmt->execute([$group['group_id']]);
            $group['current_members'] = $stmt->fetch()['cnt'] ?? 0;
        }

        jsonSuccess(['group' => $group ?: []]);
        break;
}
