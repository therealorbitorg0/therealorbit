// ================================
// TRO – Admin Login Page
// ================================

import { AdminAPI } from '../../utils/api.js';
import { showToast, setButtonLoading, validateEmail } from '../../utils/helpers.js';
import { navigate } from '../../router.js';

function adminSidebar(activePage) {
  const admin = window.getCurrentAdmin ? window.getCurrentAdmin() : null;
  
  const navItems = [
    { id: 'admin/dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'admin/users', icon: '👥', label: 'Users' },
    { id: 'admin/kyc', icon: '🔐', label: 'KYC Requests' },
    { id: 'admin/withdrawals', icon: '💸', label: 'Withdrawals' },
    { id: 'admin/transactions', icon: '📊', label: 'Transactions' },
    { id: 'admin/groups', icon: '🌍', label: 'Groups' },
    { id: 'admin/plan', icon: '📋', label: 'Plan Settings' },
    { id: 'admin/banners', icon: '🖼️', label: 'Banners' },
    { id: 'admin/settings', icon: '⚙️', label: 'Site Settings' },
  ];
  
  return `
    <div class="sidebar">
      <div class="sidebar-logo">🪐 TRO Admin</div>
      
      <nav class="sidebar-nav">
        <div class="nav-section-label">Administration</div>
        ${navItems.map(item => `
          <div class="nav-item ${activePage === item.id ? 'active' : ''}" onclick="navigate('${item.id}')">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
          </div>
        `).join('')}
      </nav>
      
      <div class="sidebar-footer">
        <div style="padding:12px;background:rgba(239,35,60,0.05);border-radius:var(--radius-sm);margin-bottom:12px;font-size:0.8rem">
          <div style="color:var(--accent-red);font-weight:600;margin-bottom:2px">⚠️ Admin Panel</div>
          <div style="color:var(--text-muted)">Changes affect all users</div>
        </div>
        <div class="nav-item" onclick="adminLogout()">
          <span class="nav-icon">🚪</span>
          <span>Logout</span>
        </div>
      </div>
    </div>
  `;
}

function renderAdminLogin() {
  document.getElementById('app').innerHTML = `
    <div class="bg-grid"></div>
    <div class="bg-orbs"><div class="orb orb-1"></div></div>
    
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;position:relative;z-index:1">
      <div style="width:100%;max-width:420px">
        <div style="text-align:center;margin-bottom:40px">
          <div style="font-family:var(--font-display);font-size:2rem;font-weight:800;background:linear-gradient(135deg,var(--gold),var(--accent-red));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
            🪐 TRO Admin
          </div>
          <p style="color:var(--text-secondary);font-size:0.85rem;margin-top:4px">Administration Panel</p>
        </div>
        
        <div class="card" style="padding:36px 32px">
          <div style="padding:12px;background:rgba(239,35,60,0.06);border:1px solid rgba(239,35,60,0.2);border-radius:var(--radius-sm);margin-bottom:24px;font-size:0.82rem;color:var(--accent-red)">
            🔒 Restricted Access — Authorized personnel only
          </div>
          
          <h2 style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;margin-bottom:20px">Admin Sign In</h2>
          
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="admin-email" class="form-input" placeholder="admin@tro.com" value="admin@gmail.com">
            <span class="form-error" id="admin-email-error"></span>
          </div>
          
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="admin-password" class="form-input" placeholder="••••••••">
            <span class="form-error" id="admin-password-error"></span>
          </div>
          
          <button id="admin-login-btn" class="btn btn-primary btn-full btn-lg" onclick="handleAdminLogin()" style="margin-top:8px">
            Sign In to Admin
          </button>
          
          <div style="text-align:center;margin-top:20px;padding-top:16px;border-top:1px solid var(--glass-border)">
            <a onclick="navigate('login')" style="color:var(--text-muted);font-size:0.82rem;cursor:pointer">← User Login</a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('admin-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAdminLogin();
  });
  
  window.handleAdminLogin = async () => {
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const btn = document.getElementById('admin-login-btn');
    
    document.querySelectorAll('.form-error').forEach(e => e.textContent = '');
    
    if (!email) { document.getElementById('admin-email').classList.add('error'); document.getElementById('admin-email-error').textContent = 'Enter email'; return; }
    if (!password) { document.getElementById('admin-password').classList.add('error'); document.getElementById('admin-password-error').textContent = 'Enter password'; return; }
    
    setButtonLoading(btn, true, 'Signing in…');
    const res = await AdminAPI.adminLogin(email, password);
    setButtonLoading(btn, false);
    
    if (res.success) {
      localStorage.setItem('tro_admin_token', res.data.token);
      localStorage.setItem('tro_admin', JSON.stringify(res.data.admin));
      showToast('Welcome, Admin!', 'success');
      setTimeout(() => navigate('admin/dashboard'), 500);
    } else {
      showToast(res.error || 'Invalid credentials', 'error', 'Access Denied');
    }
  };
}

export { renderAdminLogin, adminSidebar };
