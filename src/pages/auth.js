// ================================
// TRO – Auth Pages (Login / Register / Forgot)
// ================================

import { AuthAPI } from '../utils/api.js';
import { showToast, validateEmail, setButtonLoading } from '../utils/helpers.js';
import { navigate } from '../router.js';

// ===========================
// SHARED AUTH LAYOUT
// ===========================

function authLayout(content) {
  return `
    <div class="bg-grid"></div>
    <div class="bg-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
    </div>
    
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;position:relative;z-index:1">
      <div style="width:100%;max-width:480px">
        
        <!-- Logo -->
        <div style="text-align:center;margin-bottom:40px">
          <div onclick="navigate('home')" style="
            display:inline-block;cursor:pointer;
            font-family:var(--font-display);font-size:2rem;font-weight:800;
            background:linear-gradient(135deg,var(--gold),var(--accent-cyan));
            -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          ">🪐 TRO</div>
          <p style="color:var(--text-secondary);font-size:0.85rem;margin-top:4px">The Real Orbit</p>
        </div>
        
        <!-- Auth Card -->
        <div class="card" style="padding:36px 32px">
          ${content}
        </div>
        
      </div>
    </div>
  `;
}

// ===========================
// LOGIN PAGE
// ===========================

function renderLogin() {
  document.getElementById('app').innerHTML = authLayout(`
    <h2 style="font-family:var(--font-display);font-size:1.6rem;font-weight:800;margin-bottom:6px">Welcome Back</h2>
    <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:28px">Sign in to your TRO account</p>
    
    <div id="login-form">
      <div class="form-group">
        <label class="form-label">Email Address <span class="required">*</span></label>
        <input type="email" id="login-email" class="form-input" placeholder="your@email.com" autocomplete="email">
        <span class="form-error" id="login-email-error"></span>
      </div>
      
      <div class="form-group">
        <label class="form-label" style="display:flex;justify-content:space-between">
          <span>Password <span class="required">*</span></span>
          <a onclick="navigate('forgot-password')" style="color:var(--gold);cursor:pointer;font-size:0.8rem">Forgot password?</a>
        </label>
        <div style="position:relative">
          <input type="password" id="login-password" class="form-input" placeholder="••••••••" style="padding-right:44px" autocomplete="current-password">
          <button onclick="togglePwd('login-password',this)" style="
            position:absolute;right:12px;top:50%;transform:translateY(-50%);
            background:transparent;color:var(--text-muted);font-size:1rem;
          ">👁️</button>
        </div>
        <span class="form-error" id="login-password-error"></span>
      </div>
      
      <button id="login-btn" class="btn btn-primary btn-full btn-lg" onclick="handleLogin()" style="margin-top:8px">
        Sign In
      </button>
    </div>
    
    <div style="text-align:center;margin-top:24px">
      <p style="color:var(--text-secondary);font-size:0.9rem">
        Don't have an account?
        <a onclick="navigate('register')" style="color:var(--gold);cursor:pointer;font-weight:600"> Register Now</a>
      </p>
    </div>
    
    <!-- Admin Link -->
    <div style="text-align:center;margin-top:16px;padding-top:16px;border-top:1px solid var(--glass-border)">
      <a onclick="navigate('admin/login')" style="color:var(--text-muted);font-size:0.8rem;cursor:pointer">
        Admin Login →
      </a>
    </div>
  `);
  
  // Enter key
  document.getElementById('login-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  
  window.handleLogin = async () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    
    // Clear errors
    document.querySelectorAll('.form-error').forEach(e => e.textContent = '');
    document.querySelectorAll('.form-input').forEach(e => e.classList.remove('error'));
    
    let valid = true;
    
    if (!email || !validateEmail(email)) {
      document.getElementById('login-email').classList.add('error');
      document.getElementById('login-email-error').textContent = 'Enter a valid email address';
      valid = false;
    }
    
    if (!password || password.length < 6) {
      document.getElementById('login-password').classList.add('error');
      document.getElementById('login-password-error').textContent = 'Password must be at least 6 characters';
      valid = false;
    }
    
    if (!valid) return;
    
    setButtonLoading(btn, true, 'Signing in…');
    
    const res = await AuthAPI.login(email, password);
    
    setButtonLoading(btn, false);
    
    if (res.success) {
      localStorage.setItem('tro_token', res.data.token);
      localStorage.setItem('tro_user', JSON.stringify(res.data.user));
      showToast('Welcome back! 🎉', 'success', 'Login Successful');
      
      // Check KYC status
      const user = res.data.user;
      if (user.kyc_status !== 'approved') {
        setTimeout(() => navigate('kyc'), 500);
      } else {
        setTimeout(() => navigate('dashboard'), 500);
      }
    } else {
      showToast(res.error || 'Invalid credentials', 'error', 'Login Failed');
    }
  };
}

// ===========================
// REGISTER PAGE
// ===========================

function renderRegister() {
  // Get referral code from URL
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref') || '';
  
  document.getElementById('app').innerHTML = authLayout(`
    <h2 style="font-family:var(--font-display);font-size:1.6rem;font-weight:800;margin-bottom:6px">Create Account</h2>
    <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:28px">Join TRO and start your orbit</p>
    
    <!-- Step Indicator -->
    <div style="display:flex;gap:8px;margin-bottom:28px">
      <div id="step-dot-1" style="flex:1;height:3px;border-radius:3px;background:var(--gold);transition:all 0.3s"></div>
      <div id="step-dot-2" style="flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,0.1);transition:all 0.3s"></div>
    </div>
    
    <!-- Step 1: Basic Info -->
    <div id="reg-step-1">
      <div class="form-group">
        <label class="form-label">Full Name <span class="required">*</span></label>
        <input type="text" id="reg-name" class="form-input" placeholder="John Doe" autocomplete="name">
        <span class="form-error" id="reg-name-error"></span>
      </div>
      
      <div class="form-group">
        <label class="form-label">Email Address <span class="required">*</span></label>
        <input type="email" id="reg-email" class="form-input" placeholder="your@email.com" autocomplete="email">
        <span class="form-error" id="reg-email-error"></span>
      </div>
      
      <div class="form-group">
        <label class="form-label">Mobile Number <span class="required">*</span></label>
        <div style="display:flex;gap:8px">
          <select id="reg-country-code" class="form-input" style="width:120px;flex-shrink:0">
            <option value="+91">🇮🇳 +91</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
            <option value="+971">🇦🇪 +971</option>
            <option value="+60">🇲🇾 +60</option>
            <option value="+65">🇸🇬 +65</option>
            <option value="+92">🇵🇰 +92</option>
            <option value="+880">🇧🇩 +880</option>
          </select>
          <input type="tel" id="reg-mobile" class="form-input" placeholder="9876543210" style="flex:1">
        </div>
        <span class="form-error" id="reg-mobile-error"></span>
      </div>
      
      <div class="form-group">
        <label class="form-label">Referral Code</label>
        <input type="text" id="reg-ref" class="form-input" placeholder="Referral code (optional)" value="${refCode}">
        <span class="form-hint">Enter sponsor's referral code if you have one</span>
      </div>
      
      <button class="btn btn-primary btn-full btn-lg" onclick="goRegStep2()" style="margin-top:4px">
        Continue →
      </button>
    </div>
    
    <!-- Step 2: Password -->
    <div id="reg-step-2" style="display:none">
      <div class="form-group">
        <label class="form-label">Create Password <span class="required">*</span></label>
        <div style="position:relative">
          <input type="password" id="reg-password" class="form-input" placeholder="Minimum 8 characters" style="padding-right:44px" autocomplete="new-password">
          <button onclick="togglePwd('reg-password',this)" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:transparent;color:var(--text-muted)">👁️</button>
        </div>
        
        <!-- Password strength -->
        <div id="pwd-strength" style="margin-top:8px;display:none">
          <div style="height:4px;border-radius:2px;background:rgba(255,255,255,0.1);margin-bottom:4px;overflow:hidden">
            <div id="pwd-bar" style="height:100%;border-radius:2px;transition:width 0.3s,background 0.3s;width:0"></div>
          </div>
          <span id="pwd-label" style="font-size:0.75rem;color:var(--text-muted)"></span>
        </div>
        
        <span class="form-error" id="reg-password-error"></span>
      </div>
      
      <div class="form-group">
        <label class="form-label">Confirm Password <span class="required">*</span></label>
        <div style="position:relative">
          <input type="password" id="reg-confirm" class="form-input" placeholder="Re-enter password" style="padding-right:44px">
          <button onclick="togglePwd('reg-confirm',this)" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:transparent;color:var(--text-muted)">👁️</button>
        </div>
        <span class="form-error" id="reg-confirm-error"></span>
      </div>
      
      <div class="form-group" style="display:flex;gap:10px;align-items:flex-start">
        <input type="checkbox" id="reg-terms" style="margin-top:4px;width:16px;height:16px;cursor:pointer;accent-color:var(--gold)">
        <label for="reg-terms" style="font-size:0.85rem;color:var(--text-secondary);cursor:pointer;line-height:1.5">
          I agree to the <a style="color:var(--gold)">Terms & Conditions</a> and understand the 
          <a style="color:var(--gold)">No Refund Policy</a>
        </label>
      </div>
      
      <div style="display:flex;gap:12px;margin-top:8px">
        <button class="btn btn-secondary btn-lg" onclick="goRegStep1()" style="flex:1">← Back</button>
        <button id="reg-btn" class="btn btn-primary btn-lg" onclick="handleRegister()" style="flex:2">Create Account 🚀</button>
      </div>
    </div>
    
    <div style="text-align:center;margin-top:24px">
      <p style="color:var(--text-secondary);font-size:0.9rem">
        Already have an account?
        <a onclick="navigate('login')" style="color:var(--gold);cursor:pointer;font-weight:600"> Sign In</a>
      </p>
    </div>
  `);
  
  // Password strength meter
  document.getElementById('reg-password').addEventListener('input', function() {
    const val = this.value;
    const bar = document.getElementById('pwd-bar');
    const label = document.getElementById('pwd-label');
    const wrap = document.getElementById('pwd-strength');
    
    if (!val) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    
    const levels = [
      { width: '25%', color: '#EF233C', text: 'Weak' },
      { width: '50%', color: '#FFD166', text: 'Fair' },
      { width: '75%', color: '#06B6D4', text: 'Good' },
      { width: '100%', color: '#06D6A0', text: 'Strong' },
    ];
    
    const lv = levels[Math.max(0, score - 1)];
    bar.style.width = lv.width;
    bar.style.background = lv.color;
    label.textContent = lv.text;
    label.style.color = lv.color;
  });
  
  window.goRegStep2 = () => {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const mobile = document.getElementById('reg-mobile').value.trim();
    
    document.querySelectorAll('.form-error').forEach(e => e.textContent = '');
    document.querySelectorAll('.form-input').forEach(e => e.classList.remove('error'));
    
    let valid = true;
    
    if (!name || name.length < 2) {
      document.getElementById('reg-name').classList.add('error');
      document.getElementById('reg-name-error').textContent = 'Enter your full name';
      valid = false;
    }
    
    if (!email || !validateEmail(email)) {
      document.getElementById('reg-email').classList.add('error');
      document.getElementById('reg-email-error').textContent = 'Enter a valid email';
      valid = false;
    }
    
    if (!mobile || mobile.length < 7) {
      document.getElementById('reg-mobile').classList.add('error');
      document.getElementById('reg-mobile-error').textContent = 'Enter valid mobile number';
      valid = false;
    }
    
    if (!valid) return;
    
    document.getElementById('reg-step-1').style.display = 'none';
    document.getElementById('reg-step-2').style.display = 'block';
    document.getElementById('step-dot-2').style.background = 'var(--gold)';
  };
  
  window.goRegStep1 = () => {
    document.getElementById('reg-step-2').style.display = 'none';
    document.getElementById('reg-step-1').style.display = 'block';
    document.getElementById('step-dot-2').style.background = 'rgba(255,255,255,0.1)';
  };
  
  window.handleRegister = async () => {
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const terms = document.getElementById('reg-terms').checked;
    const btn = document.getElementById('reg-btn');
    
    document.querySelectorAll('.form-error').forEach(e => e.textContent = '');
    
    let valid = true;
    
    if (!password || password.length < 8) {
      document.getElementById('reg-password').classList.add('error');
      document.getElementById('reg-password-error').textContent = 'Password must be at least 8 characters';
      valid = false;
    }
    
    if (password !== confirm) {
      document.getElementById('reg-confirm').classList.add('error');
      document.getElementById('reg-confirm-error').textContent = 'Passwords do not match';
      valid = false;
    }
    
    if (!terms) {
      showToast('Please accept the Terms & Conditions', 'warning');
      valid = false;
    }
    
    if (!valid) return;
    
    setButtonLoading(btn, true, 'Creating account…');
    
    const payload = {
      name: document.getElementById('reg-name').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      mobile: document.getElementById('reg-mobile').value.trim(),
      country_code: document.getElementById('reg-country-code').value,
      password,
      password_confirmation: confirm,
      sponsor_id: document.getElementById('reg-ref').value.trim() || null,
    };
    
    const res = await AuthAPI.register(payload);
    setButtonLoading(btn, false);
    
    if (res.success) {
      localStorage.setItem('tro_token', res.data.token);
      localStorage.setItem('tro_user', JSON.stringify(res.data.user));
      showToast('Account created! Please complete KYC. 🎉', 'success', 'Welcome to TRO');
      setTimeout(() => navigate('kyc'), 800);
    } else {
      showToast(res.error || 'Registration failed. Try again.', 'error', 'Error');
    }
  };
}

// ===========================
// FORGOT PASSWORD
// ===========================

function renderForgotPassword() {
  document.getElementById('app').innerHTML = authLayout(`
    <h2 style="font-family:var(--font-display);font-size:1.6rem;font-weight:800;margin-bottom:6px">Reset Password</h2>
    <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:28px">Enter your email to receive a reset OTP</p>
    
    <div id="forgot-step-1">
      <div class="form-group">
        <label class="form-label">Email Address <span class="required">*</span></label>
        <input type="email" id="forgot-email" class="form-input" placeholder="your@email.com">
        <span class="form-error" id="forgot-email-error"></span>
      </div>
      
      <button id="forgot-btn" class="btn btn-primary btn-full btn-lg" onclick="sendOtp()">
        Send OTP
      </button>
    </div>
    
    <div id="forgot-step-2" style="display:none">
      <div style="background:rgba(255,209,102,0.08);border:1px solid rgba(255,209,102,0.2);border-radius:var(--radius-sm);padding:14px;margin-bottom:20px;font-size:0.85rem;color:var(--text-secondary)">
        📧 OTP sent to your email. Check spam if not received.
      </div>
      
      <div class="form-group">
        <label class="form-label">Enter OTP <span class="required">*</span></label>
        <input type="text" id="forgot-otp" class="form-input" placeholder="6-digit OTP" maxlength="6" style="letter-spacing:0.3em;text-align:center;font-size:1.2rem">
        <span class="form-error" id="forgot-otp-error"></span>
      </div>
      
      <div class="form-group">
        <label class="form-label">New Password <span class="required">*</span></label>
        <input type="password" id="forgot-newpwd" class="form-input" placeholder="New password">
        <span class="form-error" id="forgot-newpwd-error"></span>
      </div>
      
      <button id="reset-btn" class="btn btn-primary btn-full btn-lg" onclick="resetPassword()">
        Reset Password
      </button>
    </div>
    
    <div style="text-align:center;margin-top:20px">
      <a onclick="navigate('login')" style="color:var(--gold);cursor:pointer;font-size:0.9rem">← Back to Login</a>
    </div>
  `);
  
  window.sendOtp = async () => {
    const email = document.getElementById('forgot-email').value.trim();
    const btn = document.getElementById('forgot-btn');
    
    if (!email || !validateEmail(email)) {
      document.getElementById('forgot-email').classList.add('error');
      document.getElementById('forgot-email-error').textContent = 'Enter a valid email';
      return;
    }
    
    setButtonLoading(btn, true, 'Sending…');
    const res = await AuthAPI.forgotPassword(email);
    setButtonLoading(btn, false);
    
    if (res.success) {
      document.getElementById('forgot-step-1').style.display = 'none';
      document.getElementById('forgot-step-2').style.display = 'block';
      showToast('OTP sent to your email', 'success');
    } else {
      showToast(res.error || 'Failed to send OTP', 'error');
    }
  };
  
  window.resetPassword = async () => {
    const otp = document.getElementById('forgot-otp').value.trim();
    const newPwd = document.getElementById('forgot-newpwd').value;
    const email = document.getElementById('forgot-email').value.trim();
    const btn = document.getElementById('reset-btn');
    
    if (!otp || otp.length !== 6) {
      document.getElementById('forgot-otp').classList.add('error');
      document.getElementById('forgot-otp-error').textContent = 'Enter valid 6-digit OTP';
      return;
    }
    
    if (!newPwd || newPwd.length < 8) {
      document.getElementById('forgot-newpwd').classList.add('error');
      document.getElementById('forgot-newpwd-error').textContent = 'Password must be at least 8 characters';
      return;
    }
    
    setButtonLoading(btn, true, 'Resetting…');
    const res = await AuthAPI.verifyOtp(email, otp);
    setButtonLoading(btn, false);
    
    if (res.success) {
      showToast('Password reset successful!', 'success');
      setTimeout(() => navigate('login'), 1000);
    } else {
      showToast(res.error || 'Invalid OTP', 'error');
    }
  };
}

// ===========================
// SHARED
// ===========================

window.togglePwd = (fieldId, btn) => {
  const field = document.getElementById(fieldId);
  if (field.type === 'password') {
    field.type = 'text';
    btn.textContent = '🙈';
  } else {
    field.type = 'password';
    btn.textContent = '👁️';
  }
};

export { renderLogin, renderRegister, renderForgotPassword };
