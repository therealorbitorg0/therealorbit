// ================================
// TRO – Admin Dashboard
// ================================

import { AdminAPI } from '../../utils/api.js';
import { formatUSDT, formatDate } from '../../utils/helpers.js';
import { adminSidebar } from './login.js';

function adminTopbar(title) {
  const admin = window.getCurrentAdmin ? window.getCurrentAdmin() : { name: 'Admin' };
  return `
    <div class="topbar">
      <div style="display:flex;align-items:center;gap:12px">
        <button id="sidebar-toggle" style="display:none;flex-direction:column;gap:5px;background:transparent;padding:4px;border:none;cursor:pointer">
          <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
          <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
          <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
        </button>
        <div class="topbar-title">${title}</div>
      </div>
      <div class="topbar-actions">
        <span style="font-size:0.85rem;color:var(--text-secondary)"><span style="color:var(--accent-red)">●</span> Admin: <strong style="color:var(--text-primary)">${admin?.name || 'Admin'}</strong></span>
      </div>
    </div>
  `;
}

function setupAdminSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.style.display = 'flex';
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !toggle.contains(e.target)) sidebar.classList.remove('open');
    });
  }
}

async function renderAdminDashboard() {
  document.getElementById('app').innerHTML = `
    ${adminSidebar('admin/dashboard')}
    <div class="main-content">
      ${adminTopbar('Dashboard')}
      <div class="content-area">
        
        <!-- Stats Grid -->
        <div class="stats-grid" id="admin-stats">
          ${[0,1,2,3,4,5].map(() => `<div class="stat-card shimmer" style="height:120px"></div>`).join('')}
        </div>
        
        <!-- Charts Row -->
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;margin-bottom:24px">
          
          <!-- Recent Users -->
          <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:20px 24px;border-bottom:1px solid var(--glass-border);display:flex;justify-content:space-between;align-items:center">
              <h3 style="font-family:var(--font-display);font-weight:700">Recent Registrations</h3>
              <button class="btn btn-secondary btn-sm" onclick="navigate('admin/users')">View All</button>
            </div>
            <div id="recent-users">
              <div style="padding:32px;text-align:center;color:var(--text-muted)"><div class="loader" style="margin:0 auto 12px"></div></div>
            </div>
          </div>
          
          <!-- Pending Actions -->
          <div class="card" style="padding:24px">
            <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:16px">Pending Actions</h3>
            <div id="pending-actions" style="display:flex;flex-direction:column;gap:12px">
              <div class="shimmer" style="height:60px;border-radius:8px"></div>
              <div class="shimmer" style="height:60px;border-radius:8px"></div>
              <div class="shimmer" style="height:60px;border-radius:8px"></div>
            </div>
          </div>
        </div>
        
        <!-- Recent Transactions -->
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:20px 24px;border-bottom:1px solid var(--glass-border);display:flex;justify-content:space-between;align-items:center">
            <h3 style="font-family:var(--font-display);font-weight:700">Recent Transactions</h3>
            <button class="btn btn-secondary btn-sm" onclick="navigate('admin/transactions')">View All</button>
          </div>
          <div id="admin-recent-tx">
            <div style="padding:32px;text-align:center;color:var(--text-muted)"><div class="loader" style="margin:0 auto 12px"></div></div>
          </div>
        </div>
        
      </div>
    </div>
  `;
  
  setupAdminSidebar();
  
  const res = await AdminAPI.getDashboard();
  
  if (res.success) {
    const d = res.data;
    
    // Stats
    document.getElementById('admin-stats').innerHTML = `
      <div class="stat-card" style="--accent-color:var(--gold)">
        <div class="stat-icon" style="background:rgba(255,209,102,0.1)">👥</div>
        <div class="stat-value text-gold">${d.total_users || 0}</div>
        <div class="stat-label">Total Users</div>
        <div class="stat-change up">↑ ${d.new_users_today || 0} today</div>
      </div>
      <div class="stat-card" style="--accent-color:var(--accent-green)">
        <div class="stat-icon" style="background:rgba(6,214,160,0.1)">✅</div>
        <div class="stat-value" style="color:var(--accent-green)">${d.active_users || 0}</div>
        <div class="stat-label">Active Investors</div>
      </div>
      <div class="stat-card" style="--accent-color:var(--accent-cyan)">
        <div class="stat-icon" style="background:rgba(0,212,255,0.1)">💰</div>
        <div class="stat-value" style="color:var(--accent-cyan)">${formatUSDT(d.total_invested || 0)}</div>
        <div class="stat-label">Total Invested</div>
      </div>
      <div class="stat-card" style="--accent-color:var(--accent-red)">
        <div class="stat-icon" style="background:rgba(239,35,60,0.1)">⏳</div>
        <div class="stat-value" style="color:var(--accent-red)">${d.pending_kyc || 0}</div>
        <div class="stat-label">Pending KYC</div>
      </div>
      <div class="stat-card" style="--accent-color:#B87FFF">
        <div class="stat-icon" style="background:rgba(123,47,190,0.1)">💸</div>
        <div class="stat-value" style="color:#B87FFF">${d.pending_withdrawals || 0}</div>
        <div class="stat-label">Pending Withdrawals</div>
      </div>
      <div class="stat-card" style="--accent-color:var(--accent-green)">
        <div class="stat-icon" style="background:rgba(6,214,160,0.1)">🏛️</div>
        <div class="stat-value" style="color:var(--accent-green)">${formatUSDT(d.total_pension_paid || 0)}</div>
        <div class="stat-label">Total Pension Paid</div>
      </div>
    `;
    
    // Recent users
    const recentUsers = d.recent_users || [];
    const usersEl = document.getElementById('recent-users');
    if (recentUsers.length > 0) {
      usersEl.innerHTML = `
        <div class="table-wrap" style="border:none;border-radius:0">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>KYC</th><th>Joined</th></tr></thead>
            <tbody>
              ${recentUsers.slice(0,8).map(u => `
                <tr>
                  <td style="font-weight:500">${u.name || '—'}</td>
                  <td style="color:var(--text-secondary);font-size:0.85rem">${u.email || '—'}</td>
                  <td><span class="badge badge-${u.kyc_status === 'approved' ? 'green' : u.kyc_status === 'pending' ? 'gold' : 'red'}">${u.kyc_status || 'none'}</span></td>
                  <td style="font-size:0.82rem;color:var(--text-secondary)">${formatDate(u.created_at)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      usersEl.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">No users yet</div>`;
    }
    
    // Pending actions
    document.getElementById('pending-actions').innerHTML = `
      <div onclick="navigate('admin/kyc')" style="padding:16px;background:rgba(255,209,102,0.06);border:1px solid rgba(255,209,102,0.2);border-radius:12px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='rgba(255,209,102,0.2)'">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-weight:600;font-size:0.9rem">KYC Requests</div><div style="font-size:0.78rem;color:var(--text-muted)">Awaiting review</div></div>
          <div class="badge badge-gold" style="font-size:1rem;padding:6px 12px">${d.pending_kyc || 0}</div>
        </div>
      </div>
      <div onclick="navigate('admin/withdrawals')" style="padding:16px;background:rgba(123,47,190,0.06);border:1px solid rgba(123,47,190,0.2);border-radius:12px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='#B87FFF'" onmouseout="this.style.borderColor='rgba(123,47,190,0.2)'">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-weight:600;font-size:0.9rem">Withdrawals</div><div style="font-size:0.78rem;color:var(--text-muted)">Pending approval</div></div>
          <div class="badge badge-purple" style="font-size:1rem;padding:6px 12px">${d.pending_withdrawals || 0}</div>
        </div>
      </div>
      <div onclick="navigate('admin/users')" style="padding:16px;background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.2);border-radius:12px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='var(--accent-cyan)'" onmouseout="this.style.borderColor='rgba(0,212,255,0.2)'">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-weight:600;font-size:0.9rem">New Users</div><div style="font-size:0.78rem;color:var(--text-muted)">Registered today</div></div>
          <div class="badge badge-cyan" style="font-size:1rem;padding:6px 12px">${d.new_users_today || 0}</div>
        </div>
      </div>
    `;
    
    // Recent transactions
    const txEl = document.getElementById('admin-recent-tx');
    const recentTx = d.recent_transactions || [];
    if (recentTx.length > 0) {
      txEl.innerHTML = `
        <div class="table-wrap" style="border:none;border-radius:0">
          <table>
            <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              ${recentTx.slice(0,6).map(tx => `
                <tr>
                  <td style="font-size:0.85rem">${tx.user?.name || tx.user_id || '—'}</td>
                  <td style="text-transform:capitalize;font-size:0.85rem">${tx.tx_type || '—'}</td>
                  <td class="text-gold font-semibold">${formatUSDT(tx.amount)}</td>
                  <td style="font-size:0.82rem;color:var(--text-secondary)">${formatDate(tx.created_at)}</td>
                  <td><span class="badge badge-${tx.status === 'completed' ? 'green' : 'gold'}">${tx.status || 'pending'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      txEl.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">No transactions yet</div>`;
    }
  }
}

export { renderAdminDashboard, adminTopbar, setupAdminSidebar };
