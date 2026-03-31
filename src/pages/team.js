// ================================
// TRO – Team Page
// ================================
import { DashboardAPI } from '../utils/api.js';
import { formatDate, formatUSDT, getInitials } from '../utils/helpers.js';
import { userSidebar, setupSidebarToggle } from './dashboard.js';

async function renderTeam() {
  document.getElementById('app').innerHTML = `
    ${userSidebar('team')}
    <div class="main-content">
      <div class="topbar">
        <div style="display:flex;align-items:center;gap:12px">
          <button id="sidebar-toggle" style="display:none;flex-direction:column;gap:5px;background:transparent;padding:4px;border:none;cursor:pointer">
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
          </button>
          <div class="topbar-title">My Team</div>
        </div>
      </div>
      <div class="content-area">
        
        <!-- Stats -->
        <div class="stats-grid" id="team-stats" style="margin-bottom:24px">
          <div class="stat-card shimmer" style="height:100px"></div>
          <div class="stat-card shimmer" style="height:100px"></div>
          <div class="stat-card shimmer" style="height:100px"></div>
        </div>
        
        <!-- Team List -->
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:20px 24px;border-bottom:1px solid var(--glass-border);display:flex;justify-content:space-between;align-items:center">
            <h3 style="font-family:var(--font-display);font-weight:700">Direct Referrals</h3>
            <input type="text" placeholder="Search..." id="team-search" class="form-input" style="width:200px;padding:8px 14px" oninput="filterTeam(this.value)">
          </div>
          <div id="team-list">
            <div style="padding:40px;text-align:center;color:var(--text-muted)">
              <div class="loader" style="margin:0 auto 12px"></div>Loading team…
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  setupSidebarToggle();
  
  const res = await DashboardAPI.getTeam();
  
  const statsEl = document.getElementById('team-stats');
  const listEl = document.getElementById('team-list');
  
  if (res.success) {
    const team = res.data.team || [];
    const totalEarned = team.reduce((s, m) => s + (167 * 0.15), 0);
    
    statsEl.innerHTML = `
      <div class="stat-card" style="--accent-color:var(--gold)">
        <div class="stat-icon">👥</div>
        <div class="stat-value text-gold">${team.length}</div>
        <div class="stat-label">Total Directs</div>
      </div>
      <div class="stat-card" style="--accent-color:var(--accent-green)">
        <div class="stat-icon">✅</div>
        <div class="stat-value" style="color:var(--accent-green)">${team.filter(m => m.active_status == 1).length}</div>
        <div class="stat-label">Active Members</div>
      </div>
      <div class="stat-card" style="--accent-color:var(--accent-cyan)">
        <div class="stat-icon">💵</div>
        <div class="stat-value" style="color:var(--accent-cyan)">${formatUSDT(totalEarned)}</div>
        <div class="stat-label">Referral Earned</div>
      </div>
    `;
    
    window._teamData = team;
    renderTeamTable(team);
    
  } else {
    statsEl.innerHTML = '';
    listEl.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">Failed to load team</div>`;
  }
  
  window.filterTeam = (query) => {
    const filtered = (window._teamData || []).filter(m =>
      m.name?.toLowerCase().includes(query.toLowerCase()) ||
      m.user_id?.toLowerCase().includes(query.toLowerCase())
    );
    renderTeamTable(filtered);
  };
  
  function renderTeamTable(data) {
    if (!data.length) {
      listEl.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">No team members found</div>`;
      return;
    }
    listEl.innerHTML = `
      <div class="table-wrap" style="border:none;border-radius:0">
        <table>
          <thead><tr><th>Member</th><th>User ID</th><th>Joined</th><th>KYC</th><th>Status</th></tr></thead>
          <tbody>
            ${data.map(m => `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="avatar" style="width:32px;height:32px;font-size:0.75rem">${getInitials(m.name)}</div>
                    <span style="font-weight:500">${m.name || '—'}</span>
                  </div>
                </td>
                <td style="font-family:monospace;font-size:0.82rem;color:var(--text-secondary)">${m.user_id || '—'}</td>
                <td style="font-size:0.82rem;color:var(--text-secondary)">${formatDate(m.created_at)}</td>
                <td><span class="badge badge-${m.kyc_status === 'approved' ? 'green' : m.kyc_status === 'pending' ? 'gold' : 'red'}">${m.kyc_status || 'none'}</span></td>
                <td><span class="badge badge-${m.active_status == 1 ? 'green' : 'red'}">${m.active_status == 1 ? 'Active' : 'Inactive'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

// ================================
// Transactions Page
// ================================
import { DashboardAPI as DashAPI } from '../utils/api.js';

async function renderTransactions() {
  document.getElementById('app').innerHTML = `
    ${userSidebar('transactions')}
    <div class="main-content">
      <div class="topbar">
        <div style="display:flex;align-items:center;gap:12px">
          <button id="sidebar-toggle" style="display:none;flex-direction:column;gap:5px;background:transparent;padding:4px;border:none;cursor:pointer">
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
          </button>
          <div class="topbar-title">Transactions</div>
        </div>
      </div>
      <div class="content-area">
        
        <!-- Filter Bar -->
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px">
          ${['All', 'Deposit', 'Withdrawal', 'Referral', 'Pension'].map((f, i) => `
            <button class="btn btn-${i === 0 ? 'primary' : 'secondary'} btn-sm tx-filter-btn" 
              onclick="filterTx('${f.toLowerCase()}', this)">${f}</button>
          `).join('')}
        </div>
        
        <div class="card" style="padding:0;overflow:hidden">
          <div id="tx-table">
            <div style="padding:40px;text-align:center;color:var(--text-muted)">
              <div class="loader" style="margin:0 auto 12px"></div>Loading…
            </div>
          </div>
          
          <!-- Pagination -->
          <div id="tx-pagination" style="padding:16px 24px;border-top:1px solid var(--glass-border);display:flex;justify-content:center;gap:8px"></div>
        </div>
      </div>
    </div>
  `;
  
  setupSidebarToggle();
  
  let currentPage = 1;
  let currentType = '';
  
  window.filterTx = (type, btn) => {
    document.querySelectorAll('.tx-filter-btn').forEach(b => {
      b.classList.remove('btn-primary');
      b.classList.add('btn-secondary');
    });
    btn.classList.add('btn-primary');
    btn.classList.remove('btn-secondary');
    currentType = type === 'all' ? '' : type;
    currentPage = 1;
    loadTx();
  };
  
  window.txGoPage = (page) => { currentPage = page; loadTx(); };
  
  async function loadTx() {
    const el = document.getElementById('tx-table');
    el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)"><div class="loader" style="margin:0 auto 12px"></div></div>`;
    
    const res = await DashAPI.getTransactions(currentPage, currentType);
    
    if (res.success && res.data.data?.length > 0) {
      const data = res.data;
      el.innerHTML = `
        <div class="table-wrap" style="border:none;border-radius:0">
          <table>
            <thead><tr><th>Type</th><th>Description</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              ${data.data.map(tx => `
                <tr>
                  <td><span class="badge badge-${tx.type === 'credit' ? 'green' : 'red'}">${tx.tx_type || tx.type}</span></td>
                  <td style="color:var(--text-secondary);font-size:0.85rem">${tx.remarks || '—'}</td>
                  <td class="${tx.type === 'credit' ? 'text-green' : 'text-red'} font-semibold">${tx.type === 'credit' ? '+' : '-'}${formatUSDT(tx.amount)}</td>
                  <td style="font-size:0.82rem;color:var(--text-secondary)">${formatDateTime(tx.created_at)}</td>
                  <td><span class="badge badge-${tx.status === 'completed' ? 'green' : 'gold'}">${tx.status || 'pending'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      
      // Pagination
      const pgEl = document.getElementById('tx-pagination');
      if (data.last_page > 1) {
        pgEl.innerHTML = Array.from({ length: data.last_page }, (_, i) => i + 1).map(p => `
          <button class="btn btn-${p === currentPage ? 'primary' : 'secondary'} btn-sm" onclick="txGoPage(${p})">${p}</button>
        `).join('');
      }
    } else {
      el.innerHTML = `<div style="padding:48px;text-align:center;color:var(--text-muted)">No transactions found</div>`;
    }
  }
  
  loadTx();
}

// ================================
// Profile Page
// ================================
import { AuthAPI } from '../utils/api.js';

async function renderProfile() {
  const user = getCurrentUser();
  
  document.getElementById('app').innerHTML = `
    ${userSidebar('profile')}
    <div class="main-content">
      <div class="topbar">
        <div style="display:flex;align-items:center;gap:12px">
          <button id="sidebar-toggle" style="display:none;flex-direction:column;gap:5px;background:transparent;padding:4px;border:none;cursor:pointer">
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
          </button>
          <div class="topbar-title">Profile Settings</div>
        </div>
      </div>
      <div class="content-area">
        <div style="max-width:640px;margin:0 auto">
          
          <!-- Profile Header -->
          <div class="plan-card" style="padding:36px;margin-bottom:24px;display:flex;align-items:center;gap:24px">
            <div class="avatar" style="width:80px;height:80px;font-size:1.8rem">${getInitials(user?.name)}</div>
            <div>
              <h2 style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;margin-bottom:4px">${user?.name || '—'}</h2>
              <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:8px">${user?.email || '—'}</p>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <span class="badge badge-gold">ID: ${user?.user_id || '—'}</span>
                <span class="badge badge-${user?.kyc_status === 'approved' ? 'green' : 'gold'}">KYC: ${user?.kyc_status || 'Not Submitted'}</span>
              </div>
            </div>
          </div>
          
          <!-- Edit Profile -->
          <div class="card" style="padding:32px;margin-bottom:24px">
            <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:20px">Personal Information</h3>
            
            <div class="grid-2" style="gap:16px">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" id="prof-name" class="form-input" value="${user?.name || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Mobile</label>
                <input type="tel" id="prof-mobile" class="form-input" value="${user?.mobile || ''}">
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" id="prof-email" class="form-input" value="${user?.email || ''}" disabled style="opacity:0.5;cursor:not-allowed">
              <span class="form-hint">Email cannot be changed</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">ETH / USDT Wallet Address</label>
              <input type="text" id="prof-wallet" class="form-input" value="${user?.eth_address || ''}" placeholder="Your USDT wallet address" style="font-family:monospace">
            </div>
            
            <button id="prof-save-btn" class="btn btn-primary" onclick="saveProfile()">
              💾 Save Changes
            </button>
          </div>
          
          <!-- Change Password -->
          <div class="card" style="padding:32px">
            <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:20px">Change Password</h3>
            
            <div class="form-group">
              <label class="form-label">Current Password</label>
              <input type="password" id="pwd-current" class="form-input" placeholder="••••••••">
              <span class="form-error" id="pwd-current-error"></span>
            </div>
            <div class="form-group">
              <label class="form-label">New Password</label>
              <input type="password" id="pwd-new" class="form-input" placeholder="Minimum 8 characters">
              <span class="form-error" id="pwd-new-error"></span>
            </div>
            <div class="form-group">
              <label class="form-label">Confirm New Password</label>
              <input type="password" id="pwd-confirm" class="form-input" placeholder="Re-enter new password">
              <span class="form-error" id="pwd-confirm-error"></span>
            </div>
            
            <button id="pwd-save-btn" class="btn btn-outline-gold" onclick="changePassword()">
              🔒 Update Password
            </button>
          </div>
          
        </div>
      </div>
    </div>
  `;
  
  setupSidebarToggle();
  
  window.saveProfile = async () => {
    const btn = document.getElementById('prof-save-btn');
    setButtonLoading(btn, true, 'Saving…');
    
    const res = await AuthAPI.updateProfile({
      name: document.getElementById('prof-name').value.trim(),
      mobile: document.getElementById('prof-mobile').value.trim(),
      eth_address: document.getElementById('prof-wallet').value.trim(),
    });
    
    setButtonLoading(btn, false);
    
    if (res.success) {
      const updated = { ...user, ...res.data.user };
      localStorage.setItem('tro_user', JSON.stringify(updated));
      showToast('Profile updated!', 'success');
    } else {
      showToast(res.error || 'Update failed', 'error');
    }
  };
  
  window.changePassword = async () => {
    const current = document.getElementById('pwd-current').value;
    const newPwd = document.getElementById('pwd-new').value;
    const confirm = document.getElementById('pwd-confirm').value;
    const btn = document.getElementById('pwd-save-btn');
    
    document.querySelectorAll('.form-error').forEach(e => e.textContent = '');
    let valid = true;
    
    if (!current) { document.getElementById('pwd-current').classList.add('error'); document.getElementById('pwd-current-error').textContent = 'Enter current password'; valid = false; }
    if (!newPwd || newPwd.length < 8) { document.getElementById('pwd-new').classList.add('error'); document.getElementById('pwd-new-error').textContent = 'Minimum 8 characters'; valid = false; }
    if (newPwd !== confirm) { document.getElementById('pwd-confirm').classList.add('error'); document.getElementById('pwd-confirm-error').textContent = 'Passwords do not match'; valid = false; }
    if (!valid) return;
    
    setButtonLoading(btn, true, 'Updating…');
    const res = await AuthAPI.changePassword({ current_password: current, password: newPwd, password_confirmation: confirm });
    setButtonLoading(btn, false);
    
    if (res.success) {
      showToast('Password changed successfully!', 'success');
      document.getElementById('pwd-current').value = '';
      document.getElementById('pwd-new').value = '';
      document.getElementById('pwd-confirm').value = '';
    } else {
      showToast(res.error || 'Failed to change password', 'error');
    }
  };
}

import { getCurrentUser, showToast, formatUSDT as fu, formatDate as fd, formatDateTime, getInitials as gi, setButtonLoading as sbl } from '../utils/helpers.js';
const { formatUSDT: _fu, formatDate: _fd, getInitials: _gi, setButtonLoading: _sbl } = { formatUSDT: fu, formatDate: fd, getInitials: gi, setButtonLoading: sbl };

export { renderTeam, renderTransactions, renderProfile };
