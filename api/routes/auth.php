<?php
// ================================
// TRO – Auth Routes
// ================================

$db = getDB();

switch ($path) {

    // ===========================
    // REGISTER
    // ===========================
    case 'auth/register':
        $body = getBody();
        
        $name = trim($body['name'] ?? '');
        $email = strtolower(trim($body['email'] ?? ''));
        $mobile = trim($body['mobile'] ?? '');
        $password = $body['password'] ?? '';
        $sponsorId = trim($body['sponsor_id'] ?? '');
        $countryCode = trim($body['country_code'] ?? '+91');
        
        // Validate
        if (!$name || !$email || !$mobile || !$password) jsonError('All fields required');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) jsonError('Invalid email');
        if (strlen($password) < 8) jsonError('Password must be at least 8 characters');
        
        // Check duplicate
        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) jsonError('Email already registered');
        
        // Verify sponsor
        $sponsorDbId = null;
        if ($sponsorId) {
            $stmt = $db->prepare('SELECT id FROM users WHERE user_id = ?');
            $stmt->execute([$sponsorId]);
            $sponsor = $stmt->fetch();
            if ($sponsor) $sponsorDbId = $sponsor['id'];
        }
        
        // Generate unique user ID
        $userId = 'TRO' . strtoupper(substr(md5(time() . $email), 0, 8));
        
        // Hash password
        $hashedPwd = password_hash($password, PASSWORD_BCRYPT);
        
        // Insert user
        $stmt = $db->prepare('
            INSERT INTO users (name, email, mobile, country_code, password, user_id, sponsor_id, kyc_status, active_status, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, "not_submitted", 0, 1, NOW(), NOW())
        ');
        $stmt->execute([$name, $email, $mobile, $countryCode, $hashedPwd, $userId, $sponsorDbId ?: null]);
        $newUserId = $db->lastInsertId();
        
        // Create wallet
        $db->prepare('INSERT INTO wallets (user_id, main_wallet, fund_wallet, created_at, updated_at) VALUES (?, 0, 0, NOW(), NOW())')->execute([$newUserId]);
        
        // Create income record
        $db->prepare('INSERT INTO incomes (user_id, direct_income, pension_income, created_at, updated_at) VALUES (?, 0, 0, NOW(), NOW())')->execute([$newUserId]);
        
        // Fetch new user
        $stmt = $db->prepare('SELECT id, name, email, mobile, user_id, sponsor_id, kyc_status, active_status, created_at FROM users WHERE id = ?');
        $stmt->execute([$newUserId]);
        $user = $stmt->fetch();
        $user['kyc_status'] = 'not_submitted';
        
        $token = generateJWT(['user_id' => $newUserId, 'email' => $email]);
        
        jsonSuccess(['token' => $token, 'user' => $user]);
        break;

    // ===========================
    // LOGIN
    // ===========================
    case 'auth/login':
        $body = getBody();
        $email = strtolower(trim($body['email'] ?? ''));
        $password = $body['password'] ?? '';
        
        if (!$email || !$password) jsonError('Email and password required');
        
        $stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password'])) {
            jsonError('Invalid email or password', 401);
        }
        
        if ($user['status'] != 1) jsonError('Your account has been blocked', 403);
        
        // Fetch KYC status
        $stmt = $db->prepare('SELECT status FROM kyc_documents WHERE user_id = ? ORDER BY id DESC LIMIT 1');
        $stmt->execute([$user['id']]);
        $kyc = $stmt->fetch();
        $user['kyc_status'] = $kyc['status'] ?? 'not_submitted';
        
        unset($user['password'], $user['pw'], $user['tx_password'], $user['remember_token']);
        
        $token = generateJWT(['user_id' => $user['id'], 'email' => $user['email']]);
        
        jsonSuccess(['token' => $token, 'user' => $user]);
        break;

    // ===========================
    // LOGOUT
    // ===========================
    case 'auth/logout':
        $payload = requireAuth();
        jsonSuccess(['message' => 'Logged out successfully']);
        break;

    // ===========================
    // GET PROFILE
    // ===========================
    case 'auth/profile':
        if ($method === 'GET') {
            $payload = requireAuth();
            $stmt = $db->prepare('SELECT id, name, email, mobile, user_id, sponsor_id, eth_address, country_code, active_status, created_at FROM users WHERE id = ?');
            $stmt->execute([$payload['user_id']]);
            $user = $stmt->fetch();
            if (!$user) jsonError('User not found', 404);
            
            // Get KYC status
            $stmt = $db->prepare('SELECT status FROM kyc_documents WHERE user_id = ? ORDER BY id DESC LIMIT 1');
            $stmt->execute([$payload['user_id']]);
            $kyc = $stmt->fetch();
            $user['kyc_status'] = $kyc['status'] ?? 'not_submitted';
            
            jsonSuccess(['user' => $user]);
        } elseif ($method === 'PUT') {
            $payload = requireAuth();
            $body = getBody();
            
            $name = trim($body['name'] ?? '');
            $mobile = trim($body['mobile'] ?? '');
            $ethAddress = trim($body['eth_address'] ?? '');
            
            $stmt = $db->prepare('UPDATE users SET name=?, mobile=?, eth_address=?, updated_at=NOW() WHERE id=?');
            $stmt->execute([$name, $mobile, $ethAddress, $payload['user_id']]);
            
            $stmt = $db->prepare('SELECT id, name, email, mobile, user_id, eth_address FROM users WHERE id = ?');
            $stmt->execute([$payload['user_id']]);
            $user = $stmt->fetch();
            
            jsonSuccess(['user' => $user]);
        }
        break;

    // ===========================
    // CHANGE PASSWORD
    // ===========================
    case 'auth/change-password':
        $payload = requireAuth();
        $body = getBody();
        
        $current = $body['current_password'] ?? '';
        $newPwd = $body['password'] ?? '';
        
        if (!$current || !$newPwd || strlen($newPwd) < 8) jsonError('Invalid password data');
        
        $stmt = $db->prepare('SELECT password FROM users WHERE id = ?');
        $stmt->execute([$payload['user_id']]);
        $user = $stmt->fetch();
        
        if (!password_verify($current, $user['password'])) jsonError('Current password incorrect', 400);
        
        $hashed = password_hash($newPwd, PASSWORD_BCRYPT);
        $db->prepare('UPDATE users SET password=?, updated_at=NOW() WHERE id=?')->execute([$hashed, $payload['user_id']]);
        
        jsonSuccess(['message' => 'Password updated successfully']);
        break;

    // ===========================
    // FORGOT PASSWORD (OTP)
    // ===========================
    case 'auth/forgot-password':
        $body = getBody();
        $email = strtolower(trim($body['email'] ?? ''));
        
        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if (!$stmt->fetch()) jsonError('No account found with this email');
        
        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $expires = date('Y-m-d H:i:s', time() + 600); // 10 min
        
        $db->prepare('DELETE FROM otps WHERE email = ?')->execute([$email]);
        $db->prepare('INSERT INTO otps (email, otp, expires_at, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())')->execute([$email, $otp, $expires]);
        
        // TODO: Send email with OTP using PHP Mailer
        // For now, return OTP in response (DEVELOPMENT ONLY — remove in production!)
        // mail($email, 'TRO Password Reset OTP', "Your OTP is: $otp (valid for 10 minutes)");
        
        jsonSuccess(['message' => 'OTP sent to email', 'debug_otp' => $otp]); // Remove debug_otp in production
        break;

    // ===========================
    // VERIFY OTP
    // ===========================
    case 'auth/verify-otp':
        $body = getBody();
        $email = strtolower(trim($body['email'] ?? ''));
        $otp = trim($body['otp'] ?? '');
        
        $stmt = $db->prepare('SELECT * FROM otps WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1');
        $stmt->execute([$email, $otp]);
        $record = $stmt->fetch();
        
        if (!$record) jsonError('Invalid or expired OTP', 400);
        
        $db->prepare('DELETE FROM otps WHERE email = ?')->execute([$email]);
        
        jsonSuccess(['message' => 'OTP verified', 'verified' => true]);
        break;

    default:
        jsonError('Route not found', 404);
}
