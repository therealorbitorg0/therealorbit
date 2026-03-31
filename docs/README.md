# 🪐 TRO – The Real Orbit Platform
### Version 1.0.0 | Global Reward Platform

---

## 📋 Overview

TRO (The Real Orbit) is a global reward-based platform for passive income generation through structured participation. This is a **normal web application** accessible from any browser (Safari, Chrome, Firefox).

### Core Features
- **Registration & KYC** — Secure onboarding with Aadhaar + PAN verification + live selfie
- **Investment** — 167 USDT one-time entry via USDT TRC-20
- **Monthly Pension** — $100/month on group completion (10,000 IDs)
- **Referral Income** — 15% direct referral (no multi-level)
- **Fast Income** — $100 bonus for 4 referrals in a month
- **Admin Panel** — Full management dashboard for operators

---

## 📁 Project Structure

```
tro-platform/
│
├── index.html              # Main SPA entry point
├── .htaccess               # Apache rewrite rules (shared hosting)
├── firebase.json           # Firebase hosting config
├── firestore.rules         # Firestore security rules
│
├── src/
│   ├── main.js             # App entry point + globals
│   ├── router.js           # Client-side SPA router
│   │
│   ├── styles/
│   │   └── global.css      # Full design system
│   │
│   ├── utils/
│   │   ├── api.js          # API layer (PHP/MySQL + Firebase)
│   │   └── helpers.js      # Toast, modal, formatters, auth
│   │
│   └── pages/
│       ├── home.js         # Landing page
│       ├── auth.js         # Login, Register, Forgot Password
│       ├── kyc.js          # KYC with live camera + doc upload
│       ├── dashboard.js    # User dashboard
│       ├── plan.js         # Plan page with toggle (dark/light)
│       ├── invest.js       # Investment page
│       ├── withdraw.js     # Withdrawal page
│       ├── team.js         # Team + Transactions + Profile
│       │
│       └── admin/
│           ├── login.js    # Admin login
│           ├── dashboard.js # Admin dashboard
│           ├── users.js    # Users + KYC + Withdrawals + Transactions
│           ├── plan.js     # Plan settings + Site settings + Groups + Banners
│           └── (re-exports for each route)
│
├── api/
│   ├── index.php           # PHP API router
│   └── routes/
│       ├── auth.php        # Registration, Login, OTP, Profile
│       ├── kyc.php         # KYC submission & status
│       ├── dashboard.php   # Stats, team, transactions
│       ├── investment.php  # Investment activation
│       ├── withdrawal.php  # Withdrawal requests
│       ├── referral.php    # Claim income, directs
│       └── admin.php       # Full admin API
│
├── firebase/
│   └── config.js           # Firebase configuration
│
└── docs/
    └── README.md           # This file
```

---

## 🚀 Deployment

### Option A — Shared Hosting (cPanel / Apache)

1. **Upload files** to your public_html or subdomain folder
2. **Import Database** — Import `therealorbit_db_clean.sql` in phpMyAdmin
3. **Configure API** — Edit `api/index.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'your_db_name');
   define('DB_USER', 'your_db_user');
   define('DB_PASS', 'your_db_password');
   define('JWT_SECRET', 'change-this-to-random-string');
   ```
4. **Create storage directory**:
   ```
   storage/
   └── uploads/
       ├── kyc/
       └── banners/
   ```
   Set permissions: `chmod 755 storage/uploads/`
5. **Update config** in `index.html`:
   ```js
   window.TRO_CONFIG = { apiBase: '/api', useFirebase: false };
   ```
6. **Access site** at your domain — everything works!

### Option B — Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Edit `firebase/config.js` with your Firebase project credentials
4. Update `index.html` config:
   ```js
   window.TRO_CONFIG = { apiBase: 'https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net', useFirebase: true };
   ```
5. Deploy: `firebase deploy --only hosting`

> **Note:** Firebase option requires Cloud Functions for the API backend. The PHP API is for shared hosting.

---

## 🔑 Admin Access

**Default Admin Login:**
- Email: `admin@gmail.com`
- Password: `admin123` (change immediately after first login!)

Admin URL: `yourdomain.com/#admin/login`

---

## 📱 Pages & Routes

| Route | Description |
|-------|-------------|
| `#home` | Landing page |
| `#login` | User login |
| `#register` | User registration |
| `#forgot-password` | Password reset |
| `#plan` | Plan page (dark/light toggle) |
| `#dashboard` | User dashboard (auth required) |
| `#kyc` | KYC verification (auth required) |
| `#invest` | Investment page (auth required) |
| `#withdraw` | Withdrawal page (auth required) |
| `#team` | My team (auth required) |
| `#transactions` | Transaction history (auth required) |
| `#profile` | Profile settings (auth required) |
| `#admin/login` | Admin login |
| `#admin/dashboard` | Admin dashboard |
| `#admin/users` | User management |
| `#admin/kyc` | KYC approvals |
| `#admin/withdrawals` | Withdrawal approvals |
| `#admin/transactions` | All transactions |
| `#admin/groups` | Group management |
| `#admin/plan` | Plan settings (fully customizable) |
| `#admin/settings` | Site settings |
| `#admin/banners` | Banner management |

---

## ⚙️ Plan Customization (Admin)

All plan values are fully customizable from **Admin → Plan Settings**:

| Setting | Default | Description |
|---------|---------|-------------|
| Entry Amount | 167 USDT | One-time investment |
| Referral % | 15% | Direct referral commission |
| Monthly Pension | $100 | Pension per completed group |
| Fast Income Bonus | $100 | Bonus for 4 referrals/month |
| Fast Income Requirement | 4 | Referrals needed for fast income |
| Group Size | 10,000 | Members needed to complete group |
| Min Monthly Referrals | 2 | Referrals needed to maintain pension |
| Withdrawal Fee | 2% | Deducted from withdrawal amount |
| Min Withdrawal | $10 | Minimum withdrawal amount |

---

## 🔐 KYC Flow

1. User registers → automatically redirected to KYC
2. **Step 1** — Personal info (name, DOB, Aadhaar, PAN, address)
3. **Step 2** — Upload Aadhaar front, Aadhaar back, PAN card
4. **Step 3** — Live selfie via device camera
5. **Step 4** — Review & submit
6. Admin reviews → approves/rejects with reason
7. User can invest only after KYC approval

---

## 💰 Income Logic

### Monthly Pension ($100)
- Group must reach 10,000 members
- User must bring ≥ 2 direct referrals that month
- Distributed manually by admin via **Admin → Plan → Distribute Pension**

### Referral Income (15%)
- Earned on every direct referral's 167 USDT investment
- Must be claimed once per month (expires if not claimed)
- Claim via Dashboard → Quick Actions → Claim Income

### Fast Income ($100)
- Bring 4+ direct referrals in a calendar month
- Automatic — no group completion needed

---

## 🛡️ Security Notes

1. **JWT Secret** — Change `JWT_SECRET` in `api/index.php` before launch
2. **Admin Password** — Change default admin password immediately
3. **OTP Debug** — Remove `debug_otp` from `auth/forgot-password` response in production
4. **HTTPS** — Always deploy on HTTPS
5. **File Uploads** — Uploads are stored outside web root where possible; validate MIME types
6. **SQL Injection** — All queries use PDO prepared statements

---

## 📧 Email Setup (PHP Mailer)

For OTP emails, add PHP Mailer to `api/routes/auth.php`:

```php
// Install: composer require phpmailer/phpmailer
use PHPMailer\PHPMailer\PHPMailer;

$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = 'smtp.gmail.com';
$mail->SMTPAuth = true;
$mail->Username = 'your@gmail.com';
$mail->Password = 'your-app-password';
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->Port = 587;
$mail->setFrom('noreply@tro.com', 'TRO Platform');
$mail->addAddress($email);
$mail->Subject = 'TRO Password Reset OTP';
$mail->Body = "Your OTP: $otp (valid 10 minutes)";
$mail->send();
```

---

## 🗄️ Database Tables Used

| Table | Purpose |
|-------|---------|
| `users` | All user accounts |
| `kyc_documents` | KYC submissions |
| `wallets` | User wallet balances |
| `incomes` | Income tracking |
| `transactions` | All transactions |
| `investments` | Investment records |
| `withdrawals` | Withdrawal requests |
| `user_groups` | User ↔ Group mapping |
| `group_cycles` | Groups A–Z |
| `settings` | Plan + site settings |
| `banners` | Homepage banners |
| `admins` | Admin accounts |
| `otps` | OTP for password reset |

---

## 🎨 Design Customization

The entire design uses CSS variables in `src/styles/global.css`:

```css
:root {
  --gold: #FFD166;          /* Primary accent */
  --orbit-deep: #060D1A;    /* Background */
  --accent-cyan: #00D4FF;   /* Secondary accent */
  --accent-green: #06D6A0;  /* Success */
  --accent-red: #EF233C;    /* Error/danger */
}
```

Change these variables to instantly retheme the entire platform.

---

## 📞 Support

For technical support or customization, refer to the project documentation or contact the development team.

**Important:** This platform involves financial transactions. Always test thoroughly on staging before going live. Ensure legal compliance in your jurisdiction.

---

*TRO Platform v1.0.0 — Built with vanilla JS SPA + PHP API*
