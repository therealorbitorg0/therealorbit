<?php
// ================================
// TRO – PHP API Router
// ================================
// Place this file as: api/index.php
// For shared hosting, configure .htaccess to route /api/* here

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ===========================
// CONFIG
// ===========================
define('DB_HOST', 'localhost');
define('DB_NAME', 'therealorbit_db');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('JWT_SECRET', 'your-super-secret-jwt-key-change-this');
define('UPLOAD_PATH', __DIR__ . '/../storage/uploads/');
define('UPLOAD_URL', '/storage/uploads/');

// ===========================
// DATABASE
// ===========================
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER, DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            jsonError('Database connection failed', 500);
        }
    }
    return $pdo;
}

// ===========================
// JWT
// ===========================
function generateJWT($payload, $isAdmin = false) {
    $header = base64url_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload['iat'] = time();
    $payload['exp'] = time() + (60 * 60 * 24 * 7); // 7 days
    $payload['is_admin'] = $isAdmin;
    $payloadEncoded = base64url_encode(json_encode($payload));
    $signature = base64url_encode(hash_hmac('sha256', "$header.$payloadEncoded", JWT_SECRET, true));
    return "$header.$payloadEncoded.$signature";
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $payload, $signature] = $parts;
    $expectedSig = base64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    if (!hash_equals($expectedSig, $signature)) return null;
    $data = json_decode(base64url_decode($payload), true);
    if ($data['exp'] < time()) return null;
    return $data;
}

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}

// ===========================
// AUTH MIDDLEWARE
// ===========================
function requireAuth() {
    $token = getBearerToken();
    if (!$token) jsonError('Unauthorized', 401);
    $payload = verifyJWT($token);
    if (!$payload || !isset($payload['user_id'])) jsonError('Invalid token', 401);
    return $payload;
}

function requireAdminAuth() {
    $payload = requireAuth();
    if (empty($payload['is_admin'])) jsonError('Admin access required', 403);
    return $payload;
}

function getBearerToken() {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
        return $matches[1];
    }
    return null;
}

// ===========================
// RESPONSE HELPERS
// ===========================
function jsonSuccess($data = [], $code = 200) {
    http_response_code($code);
    echo json_encode(['success' => true, ...(is_array($data) ? $data : ['data' => $data])]);
    exit;
}

function jsonError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

function getBody() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// ===========================
// ROUTER
// ===========================
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^/api#', '', $path);
$path = trim($path, '/');

// Auth routes
if ($path === 'auth/register' && $method === 'POST') require __DIR__ . '/routes/auth.php';
elseif ($path === 'auth/login' && $method === 'POST') require __DIR__ . '/routes/auth.php';
elseif ($path === 'auth/logout' && $method === 'POST') require __DIR__ . '/routes/auth.php';
elseif ($path === 'auth/profile' && $method === 'GET') require __DIR__ . '/routes/auth.php';
elseif ($path === 'auth/profile' && $method === 'PUT') require __DIR__ . '/routes/auth.php';
elseif ($path === 'auth/change-password' && $method === 'POST') require __DIR__ . '/routes/auth.php';
elseif ($path === 'auth/forgot-password' && $method === 'POST') require __DIR__ . '/routes/auth.php';
elseif ($path === 'auth/verify-otp' && $method === 'POST') require __DIR__ . '/routes/auth.php';

// KYC routes
elseif ($path === 'kyc/status' && $method === 'GET') require __DIR__ . '/routes/kyc.php';
elseif ($path === 'kyc/step1' && $method === 'POST') require __DIR__ . '/routes/kyc.php';
elseif ($path === 'kyc/documents' && $method === 'GET') require __DIR__ . '/routes/kyc.php';

// Dashboard routes
elseif ($path === 'dashboard/stats' && $method === 'GET') require __DIR__ . '/routes/dashboard.php';
elseif ($path === 'dashboard/team' && $method === 'GET') require __DIR__ . '/routes/dashboard.php';
elseif ($path === 'dashboard/transactions' && $method === 'GET') require __DIR__ . '/routes/dashboard.php';
elseif ($path === 'dashboard/incomes' && $method === 'GET') require __DIR__ . '/routes/dashboard.php';
elseif ($path === 'dashboard/pension' && $method === 'GET') require __DIR__ . '/routes/dashboard.php';
elseif ($path === 'dashboard/group' && $method === 'GET') require __DIR__ . '/routes/dashboard.php';

// Investment routes
elseif ($path === 'investment/plan' && $method === 'GET') require __DIR__ . '/routes/investment.php';
elseif ($path === 'investment/activate' && $method === 'POST') require __DIR__ . '/routes/investment.php';
elseif ($path === 'investment/history' && $method === 'GET') require __DIR__ . '/routes/investment.php';

// Withdrawal routes
elseif ($path === 'withdrawal/request' && $method === 'POST') require __DIR__ . '/routes/withdrawal.php';
elseif ($path === 'withdrawal/history' && $method === 'GET') require __DIR__ . '/routes/withdrawal.php';
elseif ($path === 'wallet/balance' && $method === 'GET') require __DIR__ . '/routes/withdrawal.php';

// Referral routes
elseif ($path === 'referral/claim' && $method === 'POST') require __DIR__ . '/routes/referral.php';
elseif ($path === 'referral/directs' && $method === 'GET') require __DIR__ . '/routes/referral.php';
elseif ($path === 'referral/fast-income' && $method === 'GET') require __DIR__ . '/routes/referral.php';

// Admin routes
elseif ($path === 'admin/login' && $method === 'POST') require __DIR__ . '/routes/admin.php';
elseif (str_starts_with($path, 'admin/')) require __DIR__ . '/routes/admin.php';

else jsonError('Route not found', 404);
