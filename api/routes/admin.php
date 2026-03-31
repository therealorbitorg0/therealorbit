<?php
// ================================
// TRO – Admin Routes
// ================================

$db = getDB();

// Admin Login (no auth required)
if ($path === 'admin/login') {
    $body = getBody();
    $email = strtolower(trim($body['email'] ?? ''));
    $password = $body['password'] ?? '';

    if (!$email || !$password) jsonError('Email and password required');

    $stmt = $db->prepare('SELECT * FROM admins WHERE email = ?');
    $stmt->execute([$email]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password'])) {
        jsonError('Invalid credentials', 401);
    }

    if ($admin['status'] != 1) jsonError('Admin account disabled', 403);

    unset($admin['password'], $admin['remember_token']);
    $token = generateJWT(['user_id' => $admin['id'], 'email' => $admin['email']], true);

    jsonSuccess(['token' => $token, 'admin' => $admin]);
}

// All other admin routes require admin auth
$payload = requireAdminAuth();

switch ($path) {

    // ===========================
    // ADMIN DASHBOARD
    // ===========================
    case 'admin/dashboard':
        $stats = [];

        $stmt = $db->query('SELECT COUNT(*) as cnt FROM users'); $stats['total_users'] = $stmt->fetch()['cnt'];
        $stmt = $db->query('SELECT COUNT(*) as cnt FROM users WHERE active_status = 1'); $stats['active_users'] = $stmt->fetch()['cnt'];
        $stmt = $db->query('SELECT COUNT(*) as cnt FROM users WHERE DATE(created_at) = CURDATE()'); $stats['new_users_today'] = $stmt->fetch()['cnt'];
        $stmt = $db->query("SELECT COUNT(*) as cnt FROM kyc_documents WHERE status = 'pending'"); $stats['pending_kyc'] = $stmt->fetch()['cnt'];
        $stmt = $db->query("SELECT COUNT(*) as cnt FROM withdrawals WHERE status = 'pending'"); $stats['pending_withdrawals'] = $stmt->fetch()['cnt'];
        $stmt = $db->query('SELECT COALESCE(SUM(amount), 0) as total FROM investments WHERE status = 1'); $stats['total_invested'] = $stmt->fetch()['total'];
        $stmt = $db->query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE tx_type = 'pension' AND status = 'completed'"); $stats['total_pension_paid'] = $stmt->fetch()['total'];

        // Recent users
        $stmt = $db->prepare('SELECT u.id, u.name, u.email, u.created_at, kd.status as kyc_status FROM users u LEFT JOIN kyc_documents kd ON kd.user_id = u.id AND kd.id = (SELECT MAX(id) FROM kyc_documents WHERE user_id = u.id) ORDER BY u.created_at DESC LIMIT 10');
        $stmt->execute();
        $stats['recent_users'] = $stmt->fetchAll();

        // Recent transactions
        $stmt = $db->prepare('SELECT t.*, u.name as user_name FROM transactions t LEFT JOIN users u ON u.id = t.user_id ORDER BY t.created_at DESC LIMIT 10');
        $stmt->execute();
        $stats['recent_transactions'] = $stmt->fetchAll();

        jsonSuccess($stats);
        break;

    // ===========================
    // USERS
    // ===========================
    case 'admin/users':
        if ($method === 'GET') {
            $page = max(1, (int)($_GET['page'] ?? 1));
            $search = trim($_GET['search'] ?? '');
            $perPage = 20;
            $offset = ($page - 1) * $perPage;

            $where = '1=1';
            $params = [];
            if ($search) {
                $where .= ' AND (u.name LIKE ? OR u.email LIKE ? OR u.user_id LIKE ?)';
                $params = ["%$search%", "%$search%", "%$search%"];
            }

            $countStmt = $db->prepare("SELECT COUNT(*) as cnt FROM users u WHERE $where");
            $countStmt->execute($params);
            $total = $countStmt->fetch()['cnt'];

            $stmt = $db->prepare("
                SELECT u.id, u.name, u.email, u.mobile, u.user_id, u.sponsor_id, u.active_status, u.status, u.created_at,
                       kd.status as kyc_status
                FROM users u
                LEFT JOIN kyc_documents kd ON kd.user_id = u.id AND kd.id = (SELECT MAX(id) FROM kyc_documents WHERE user_id = u.id)
                WHERE $where
                ORDER BY u.created_at DESC
                LIMIT $perPage OFFSET $offset
            ");
            $stmt->execute($params);

            jsonSuccess([
                'data' => $stmt->fetchAll(),
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($total / $perPage),
            ]);
        }
        break;

    // ===========================
    // SINGLE USER
    // ===========================
    default:
        // /admin/users/{id}
        if (preg_match('#^admin/users/(\d+)$#', $path, $m)) {
            $uid = (int)$m[1];
            if ($method === 'GET') {
                $stmt = $db->prepare('SELECT u.*, kd.status as kyc_status FROM users u LEFT JOIN kyc_documents kd ON kd.user_id = u.id AND kd.id = (SELECT MAX(id) FROM kyc_documents WHERE user_id = u.id) WHERE u.id = ?');
                $stmt->execute([$uid]);
                $user = $stmt->fetch();
                if (!$user) jsonError('User not found', 404);
                unset($user['password'], $user['pw'], $user['tx_password']);
                jsonSuccess($user);
            } elseif ($method === 'PUT') {
                $body = getBody();
                $db->prepare('UPDATE users SET name=?, mobile=?, status=?, updated_at=NOW() WHERE id=?')
                   ->execute([$body['name'], $body['mobile'], $body['status'] ?? 1, $uid]);
                jsonSuccess(['message' => 'User updated']);
            }
        }

        // /admin/users/{id}/block
        elseif (preg_match('#^admin/users/(\d+)/block$#', $path, $m)) {
            $uid = (int)$m[1];
            $stmt = $db->prepare('SELECT status FROM users WHERE id = ?');
            $stmt->execute([$uid]);
            $current = $stmt->fetch()['status'] ?? 1;
            $newStatus = $current == 1 ? 0 : 1;
            $db->prepare('UPDATE users SET status=?, updated_at=NOW() WHERE id=?')->execute([$newStatus, $uid]);
            jsonSuccess(['message' => 'User status updated', 'status' => $newStatus]);
        }

        // ===========================
        // KYC ADMIN
        // ===========================
        elseif ($path === 'admin/kyc') {
            $status = $_GET['status'] ?? 'pending';
            $stmt = $db->prepare('SELECT kd.*, u.name as user_name, u.email as user_email FROM kyc_documents kd LEFT JOIN users u ON u.id = kd.user_id WHERE kd.status = ? ORDER BY kd.created_at DESC');
            $stmt->execute([$status]);
            jsonSuccess($stmt->fetchAll());
        }

        elseif (preg_match('#^admin/kyc/(\d+)/approve$#', $path, $m)) {
            $uid = (int)$m[1];
            $db->prepare('UPDATE kyc_documents SET status="approved", updated_at=NOW() WHERE user_id = ?')->execute([$uid]);
            $db->prepare('UPDATE users SET active_status=1, active_date=NOW(), updated_at=NOW() WHERE id=?')->execute([$uid]);
            jsonSuccess(['message' => 'KYC approved']);
        }

        elseif (preg_match('#^admin/kyc/(\d+)/reject$#', $path, $m)) {
            $uid = (int)$m[1];
            $body = getBody();
            $reason = trim($body['reason'] ?? '');
            $db->prepare('UPDATE kyc_documents SET status="rejected", rejection_reason=?, updated_at=NOW() WHERE user_id = ?')->execute([$reason, $uid]);
            jsonSuccess(['message' => 'KYC rejected']);
        }

        // KYC doc view
        elseif (preg_match('#^admin/kyc/(\d+)/doc/(.+)$#', $path, $m)) {
            $kycId = (int)$m[1];
            $docType = $m[2];
            $stmt = $db->prepare('SELECT * FROM kyc_documents WHERE id = ?');
            $stmt->execute([$kycId]);
            $kyc = $stmt->fetch();
            if (!$kyc || !isset($kyc[$docType])) jsonError('Document not found', 404);
            $filePath = UPLOAD_PATH . $kyc[$docType];
            if (!file_exists($filePath)) jsonError('File not found', 404);
            $mime = mime_content_type($filePath);
            header('Content-Type: ' . $mime);
            header('Content-Disposition: inline');
            readfile($filePath);
            exit;
        }

        // ===========================
        // WITHDRAWALS ADMIN
        // ===========================
        elseif ($path === 'admin/withdrawals') {
            $status = $_GET['status'] ?? 'pending';
            $stmt = $db->prepare('SELECT w.*, u.name as user_name, u.email as user_email FROM withdrawals w LEFT JOIN users u ON u.id = w.user_id WHERE w.status = ? ORDER BY w.created_at DESC');
            $stmt->execute([$status]);
            jsonSuccess($stmt->fetchAll());
        }

        elseif (preg_match('#^admin/withdrawals/(\d+)/approve$#', $path, $m)) {
            $wid = (int)$m[1];
            $db->prepare('UPDATE withdrawals SET status="approved", updated_at=NOW() WHERE id=?')->execute([$wid]);
            // Update transaction
            $stmt = $db->prepare('SELECT user_id, amount FROM withdrawals WHERE id = ?');
            $stmt->execute([$wid]);
            $wd = $stmt->fetch();
            $db->prepare('UPDATE transactions SET status="completed" WHERE user_id=? AND tx_type="withdrawal" AND status="pending" ORDER BY id DESC LIMIT 1')
               ->execute([$wd['user_id']]);
            jsonSuccess(['message' => 'Withdrawal approved']);
        }

        elseif (preg_match('#^admin/withdrawals/(\d+)/reject$#', $path, $m)) {
            $wid = (int)$m[1];
            $body = getBody();
            $reason = $body['reason'] ?? '';
            $stmt = $db->prepare('SELECT user_id, amount FROM withdrawals WHERE id = ?');
            $stmt->execute([$wid]);
            $wd = $stmt->fetch();
            // Refund amount
            $db->prepare('UPDATE wallets SET main_wallet = main_wallet + ?, updated_at=NOW() WHERE user_id=?')->execute([$wd['amount'], $wd['user_id']]);
            $db->prepare('UPDATE withdrawals SET status="rejected", remarks=?, updated_at=NOW() WHERE id=?')->execute([$reason, $wid]);
            jsonSuccess(['message' => 'Withdrawal rejected, amount refunded']);
        }

        // ===========================
        // TRANSACTIONS ADMIN
        // ===========================
        elseif ($path === 'admin/transactions') {
            $page = max(1, (int)($_GET['page'] ?? 1));
            $perPage = 20;
            $offset = ($page - 1) * $perPage;

            $stmt = $db->query('SELECT COUNT(*) as cnt FROM transactions');
            $total = $stmt->fetch()['cnt'];

            $stmt = $db->prepare('SELECT t.*, u.name as user_name FROM transactions t LEFT JOIN users u ON u.id = t.user_id ORDER BY t.created_at DESC LIMIT ' . $perPage . ' OFFSET ' . $offset);
            $stmt->execute();

            jsonSuccess([
                'data' => $stmt->fetchAll(),
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($total / $perPage),
            ]);
        }

        // ===========================
        // GROUPS ADMIN
        // ===========================
        elseif ($path === 'admin/groups') {
            $stmt = $db->prepare('SELECT gc.*, (SELECT COUNT(*) FROM user_groups ug WHERE ug.group_id = gc.id) as member_count FROM group_cycles gc ORDER BY gc.id');
            $stmt->execute();
            jsonSuccess($stmt->fetchAll());
        }

        // ===========================
        // PLAN SETTINGS
        // ===========================
        elseif ($path === 'admin/plan') {
            if ($method === 'GET') {
                $stmt = $db->query('SELECT slug, value FROM settings');
                $settings = [];
                foreach ($stmt->fetchAll() as $row) $settings[$row['slug']] = $row['value'];
                jsonSuccess($settings);
            } elseif ($method === 'PUT') {
                $body = getBody();
                foreach ($body as $slug => $value) {
                    $stmt = $db->prepare('INSERT INTO settings (slug, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?');
                    $stmt->execute([$slug, $value, $value]);
                }
                jsonSuccess(['message' => 'Plan settings updated']);
            }
        }

        // ===========================
        // SITE SETTINGS
        // ===========================
        elseif ($path === 'admin/settings') {
            if ($method === 'GET') {
                $stmt = $db->query('SELECT slug, value FROM settings');
                $settings = [];
                foreach ($stmt->fetchAll() as $row) $settings[$row['slug']] = $row['value'];
                jsonSuccess($settings);
            } elseif ($method === 'PUT') {
                $body = getBody();
                foreach ($body as $slug => $value) {
                    $stmt = $db->prepare('INSERT INTO settings (slug, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?');
                    $stmt->execute([$slug, $value, $value]);
                }
                jsonSuccess(['message' => 'Settings saved']);
            }
        }

        // ===========================
        // PENSION DISTRIBUTION
        // ===========================
        elseif ($path === 'admin/pension/distribute') {
            // Get pension amount from settings
            $stmt = $db->prepare("SELECT value FROM settings WHERE slug = 'pension_amount' LIMIT 1");
            $stmt->execute();
            $pensionAmount = (float)($stmt->fetch()['value'] ?? 100);

            // Get min monthly referrals
            $stmt = $db->prepare("SELECT value FROM settings WHERE slug = 'min_monthly_referrals' LIMIT 1");
            $stmt->execute();
            $minRef = (int)($stmt->fetch()['value'] ?? 2);

            // Find eligible users (active investment + completed group + min monthly referrals)
            $stmt = $db->prepare("
                SELECT u.id
                FROM users u
                INNER JOIN investments i ON i.user_id = u.id AND i.status = 1
                INNER JOIN user_groups ug ON ug.user_id = u.id
                INNER JOIN group_cycles gc ON gc.id = ug.group_id AND gc.status = 1
                WHERE (
                    SELECT COUNT(*) FROM users r WHERE r.sponsor_id = u.id
                    AND MONTH(r.created_at) = MONTH(NOW()) AND YEAR(r.created_at) = YEAR(NOW())
                ) >= $minRef
            ");
            $stmt->execute();
            $eligible = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $count = count($eligible);

            foreach ($eligible as $uid) {
                $db->prepare('UPDATE wallets SET main_wallet = main_wallet + ?, updated_at=NOW() WHERE user_id=?')->execute([$pensionAmount, $uid]);
                $db->prepare('UPDATE incomes SET pension_income = pension_income + ?, updated_at=NOW() WHERE user_id=?')->execute([$pensionAmount, $uid]);
                $db->prepare('INSERT INTO transactions (user_id, tx_type, type, amount, status, remarks, created_at, updated_at) VALUES (?, "pension", "credit", ?, "completed", "Monthly pension", NOW(), NOW())')
                   ->execute([$uid, $pensionAmount]);
            }

            jsonSuccess(['message' => "Pension distributed to $count users", 'count' => $count]);
        }

        // ===========================
        // BANNERS
        // ===========================
        elseif ($path === 'admin/banners') {
            if ($method === 'GET') {
                $stmt = $db->query('SELECT * FROM banners ORDER BY id DESC');
                jsonSuccess($stmt->fetchAll());
            } elseif ($method === 'POST') {
                $title = trim($_POST['title'] ?? 'Banner');
                if (!isset($_FILES['image']) || $_FILES['image']['error'] !== 0) jsonError('Image required');

                $uploadDir = UPLOAD_PATH . 'banners/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

                $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION) ?: 'jpg';
                $filename = 'banner_' . time() . '.' . $ext;
                $dest = $uploadDir . $filename;

                if (!move_uploaded_file($_FILES['image']['tmp_name'], $dest)) jsonError('Upload failed');

                $stmt = $db->prepare('INSERT INTO banners (title, image, status, created_at, updated_at) VALUES (?, ?, 1, NOW(), NOW())');
                $stmt->execute([$title, 'banners/' . $filename]);
                jsonSuccess(['message' => 'Banner uploaded', 'id' => $db->lastInsertId()]);
            }
        }

        elseif (preg_match('#^admin/banners/(\d+)$#', $path, $m) && $method === 'DELETE') {
            $bid = (int)$m[1];
            $stmt = $db->prepare('SELECT image FROM banners WHERE id = ?');
            $stmt->execute([$bid]);
            $banner = $stmt->fetch();
            if ($banner && $banner['image']) {
                $file = UPLOAD_PATH . $banner['image'];
                if (file_exists($file)) unlink($file);
            }
            $db->prepare('DELETE FROM banners WHERE id = ?')->execute([$bid]);
            jsonSuccess(['message' => 'Banner deleted']);
        }

        else {
            jsonError('Admin route not found', 404);
        }
}
