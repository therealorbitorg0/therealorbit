-- ================================
-- TRO – Additional SQL Setup
-- Run this AFTER importing therealorbit_db_clean.sql
-- ================================

-- Add missing columns to users table if not present
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `kyc_status` varchar(50) DEFAULT 'not_submitted' AFTER `active_status`,
  ADD COLUMN IF NOT EXISTS `status` tinyint DEFAULT 1 AFTER `kyc_status`;

-- Make sure kyc_documents has all needed columns
ALTER TABLE `kyc_documents`
  ADD COLUMN IF NOT EXISTS `full_name` varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `dob` date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `aadhaar_number` varchar(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `pan_number` varchar(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `address` text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `aadhaar_front` varchar(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `aadhaar_back` varchar(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `pan_card` varchar(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `selfie` varchar(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `rejection_reason` text DEFAULT NULL;

-- Add tx_hash to investments if missing
ALTER TABLE `investments`
  ADD COLUMN IF NOT EXISTS `tx_hash` varchar(255) DEFAULT NULL AFTER `amount`;

-- Add slug/value to settings if not already correct schema
-- The settings table should have slug + value columns
CREATE TABLE IF NOT EXISTS `settings` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `value` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Plan Settings
INSERT IGNORE INTO `settings` (`slug`, `value`) VALUES
('entry_amount', '167'),
('wallet_address', 'YOUR_ADMIN_USDT_TRC20_ADDRESS'),
('referral_percent', '15'),
('pension_amount', '100'),
('fast_income_bonus', '100'),
('fast_income_requirement', '4'),
('group_size', '10000'),
('min_monthly_referrals', '2'),
('withdrawal_fee', '2'),
('min_withdrawal', '10'),
('site_name', 'The Real Orbit'),
('site_email', 'support@tro.com'),
('maintenance', '0'),
('maintenance_message', 'Site is under maintenance. Please check back soon.'),
('announcement', ''),
('announcement_active', '0');

-- Default group cycles A-Z
INSERT IGNORE INTO `group_cycles` (`name`, `slug`, `status`, `created_at`, `updated_at`) VALUES
('Group A', 'group-a', 1, NOW(), NOW()),
('Group B', 'group-b', 0, NOW(), NOW()),
('Group C', 'group-c', 0, NOW(), NOW()),
('Group D', 'group-d', 0, NOW(), NOW()),
('Group E', 'group-e', 0, NOW(), NOW()),
('Group F', 'group-f', 0, NOW(), NOW()),
('Group G', 'group-g', 0, NOW(), NOW()),
('Group H', 'group-h', 0, NOW(), NOW()),
('Group I', 'group-i', 0, NOW(), NOW()),
('Group J', 'group-j', 0, NOW(), NOW());

-- Update admin password to 'admin123' (bcrypt)
-- Change this immediately after first login!
UPDATE `admins` SET `password` = '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE `email` = 'admin@gmail.com';
-- The above hash = 'password' (Laravel default). Use the one already in your SQL or reset it.

-- Create storage directory placeholder
-- (Create these directories manually on your server)
-- storage/uploads/kyc/
-- storage/uploads/banners/
