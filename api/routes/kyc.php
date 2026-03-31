<?php
// ================================
// TRO – KYC Routes (kyc.php)
// ================================

$db = getDB();
$payload = requireAuth();
$userId = $payload['user_id'];

switch ($path) {
    
    case 'kyc/status':
        $stmt = $db->prepare('SELECT status, rejection_reason, created_at FROM kyc_documents WHERE user_id = ? ORDER BY id DESC LIMIT 1');
        $stmt->execute([$userId]);
        $kyc = $stmt->fetch();
        jsonSuccess(['status' => $kyc['status'] ?? null, 'rejection_reason' => $kyc['rejection_reason'] ?? null]);
        break;
    
    case 'kyc/step1':
        // Check if already submitted
        $stmt = $db->prepare('SELECT status FROM kyc_documents WHERE user_id = ? ORDER BY id DESC LIMIT 1');
        $stmt->execute([$userId]);
        $existing = $stmt->fetch();
        if ($existing && $existing['status'] === 'approved') jsonError('KYC already approved');
        
        $fullName = trim($_POST['full_name'] ?? '');
        $dob = trim($_POST['dob'] ?? '');
        $aadhaar = preg_replace('/\D/', '', $_POST['aadhaar_number'] ?? '');
        $pan = strtoupper(trim($_POST['pan_number'] ?? ''));
        $address = trim($_POST['address'] ?? '');
        
        if (!$fullName || !$dob || !$aadhaar || !$pan) jsonError('All fields required');
        if (strlen($aadhaar) !== 12) jsonError('Invalid Aadhaar number');
        if (!preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/', $pan)) jsonError('Invalid PAN format');
        
        // Upload files
        $uploadDir = UPLOAD_PATH . 'kyc/' . $userId . '/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
        
        $docPaths = [];
        $docFields = ['aadhaar_front', 'aadhaar_back', 'pan_card', 'selfie'];
        
        foreach ($docFields as $field) {
            if (isset($_FILES[$field]) && $_FILES[$field]['error'] === 0) {
                $ext = pathinfo($_FILES[$field]['name'], PATHINFO_EXTENSION) ?: 'jpg';
                $filename = $field . '_' . time() . '.' . $ext;
                $dest = $uploadDir . $filename;
                
                if (move_uploaded_file($_FILES[$field]['tmp_name'], $dest)) {
                    $docPaths[$field] = 'kyc/' . $userId . '/' . $filename;
                }
            }
        }
        
        // Delete old KYC if rejected
        $db->prepare('DELETE FROM kyc_documents WHERE user_id = ? AND status = "rejected"')->execute([$userId]);
        
        // Insert KYC record
        $stmt = $db->prepare('
            INSERT INTO kyc_documents (user_id, full_name, dob, aadhaar_number, pan_number, address, aadhaar_front, aadhaar_back, pan_card, selfie, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "pending", NOW(), NOW())
        ');
        $stmt->execute([
            $userId, $fullName, $dob, $aadhaar, $pan, $address,
            $docPaths['aadhaar_front'] ?? null,
            $docPaths['aadhaar_back'] ?? null,
            $docPaths['pan_card'] ?? null,
            $docPaths['selfie'] ?? null,
        ]);
        
        // Update user KYC status
        $db->prepare('UPDATE users SET updated_at=NOW() WHERE id=?')->execute([$userId]);
        
        jsonSuccess(['message' => 'KYC submitted successfully', 'status' => 'pending']);
        break;
    
    case 'kyc/documents':
        $stmt = $db->prepare('SELECT * FROM kyc_documents WHERE user_id = ? ORDER BY id DESC LIMIT 1');
        $stmt->execute([$userId]);
        jsonSuccess(['documents' => $stmt->fetch() ?: null]);
        break;
}
