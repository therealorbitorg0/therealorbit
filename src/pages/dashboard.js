// ================================
// TRO – User Dashboard
// ================================

import { DashboardAPI, ReferralAPI } from '../utils/api.js';
import { showToast, getCurrentUser, formatUSDT, formatDate, getInitials, setButtonLoading } from '../utils/helpers.js';
import { navigate } from '../router.js';

function userSidebar(activePage) {
  const user = getCurrentUser();
  
  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'invest', icon: '💰', label: 'Invest' },
    { id: 'team', icon: '👥', label: 'My Team' },
    { id: 'transactions', icon: '📊', label: 'Transactions' },
    { id: 'withdraw', icon: '💸', label: 'Withdraw' },
    { id: 'kyc', icon: '🔐', label: 'KYC' },
    { id: 'profile', icon: '⚙️', label: 'Profile' },
  ];
  
  return `
    <div class="sidebar">
      <div class="sidebar-logo" onclick="navigate('dashboard')" style="cursor:pointer">🪐 TRO</div>
      
      <nav class="sidebar-nav">
        <div class="nav-section-label">Main Menu</div>
        ${navItems.map(item => `
          <div class="nav-item ${activePage === item.id ? 'active' : ''}" onclick="navigate('${item.id}')">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
          </div>
        `).join('')}
      </nav>
      
      <div class="sidebar-footer">
        <!-- User info -->
        <div style="display:flex;align-items:center;gap:10px;padding:12px;background:rgba(255,255,255,0.03);border-radius:var(--radius-sm);margin-bottom:12px">
          <div class="avatar" style="width:36px;height:36px;font-size:0.8rem">${getInitials(user?.name)}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:0.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${user?.name || 'User'}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${user?.user_id || ''}</div>
          </div>
        </div>
        <div class="nav-item" onclick="logout()">
          <span class="nav-icon">🚪</span>
          <span>Logout</span>
        </div>
      </div>
    </div>
  `;
}

async function renderDashboard() {
  const user = getCurrentUser();
  
  // Check KYC
  if (user?.kyc_status !== 'approved') {
    document.getElementById('app').innerHTML = `
      ${userSidebar('dashboard')}
      <div class="main-content">
        <div class="topbar">
          <div class="topbar-title">Dashboard</div>
        </div>
        <div class="content-area">
          <div style="max-width:600px;margin:60px auto;text-align:center">
            <div class="card" style="padding:48px">
              <div style="font-size:4rem;margin-bottom:20px">🔐</div>
              <h2 style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;margin-bottom:12px">KYC Required</h2>
              <p style="color:var(--text-secondary);margin-bottom:8px">
                ${user?.kyc_status === 'pending' 
                  ? 'Your KYC is under review. Please wait 24-48 hours.' 
                  : 'Complete your KYC verification to access the dashboard.'}
              </p>
              ${user?.kyc_status !== 'pending' 
                ? `<button class="btn btn-primary btn-lg" onclick="navigate('kyc')" style="margin-top:20px">Complete KYC Now</button>`
                : `<div class="badge badge-gold" style="margin-top:12px;font-size:0.85rem;padding:6px 16px">⏳ Under Review</div>`
              }
            </div>
          </div>
        </div>
      </div>
    `;
    setupSidebarToggle();
    return;
  }
  
  document.getElementById('app').innerHTML = `
    ${userSidebar('dashboard')}
    <div class="main-content">
      <!-- Topbar -->
      <div class="topbar">
        <div style="display:flex;align-items:center;gap:12px">
          <button id="sidebar-toggle" class="nav-hamburger" style="display:none;flex-direction:column;gap:5px;background:transparent;padding:4px">
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
          </button>
          <div class="topbar-title">Dashboard</div>
        </div>
        <div class="topbar-actions">
          <div style="font-size:0.85rem;color:var(--text-secondary)">Welcome, <strong style="color:var(--text-primary)">${user?.name?.split(' ')[0]}</strong></div>
          <div class="avatar">${getInitials(user?.name)}</div>
        </div>
      </div>
      
      <div class="content-area">
        
        <!-- KYC Alert if needed -->
        
        <!-- Stats Grid -->
        <div class="stats-grid" id="stats-grid">
          ${[0,1,2,3].map(() => `
            <div class="stat-card shimmer" style="height:120px"></div>
          `).join('')}
        </div>
        
        <!-- Two Column Layout -->
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px">
          
          <!-- Left: Recent Transactions + Team -->
          <div style="display:flex;flex-direction:column;gap:24px">
            
            <!-- Pension Status Card -->
            <div id="pension-card" class="card" style="padding:28px">
              <div class="shimmer" style="height:80px;border-radius:8px"></div>
            </div>
            
            <!-- Recent Transactions -->
            <div class="card" style="padding:0;overflow:hidden">
              <div style="padding:20px 24px;border-bottom:1px solid var(--glass-border);display:flex;justify-content:space-between;align-items:center">
                <h3 style="font-family:var(--font-display);font-weight:700">Recent Transactions</h3>
                <button class="btn btn-secondary btn-sm" onclick="navigate('transactions')">View All</button>
              </div>
              <div id="recent-tx">
                <div style="padding:32px;text-align:center;color:var(--text-muted)">
                  <div class="loader" style="margin:0 auto 12px"></div>
                  Loading…
                </div>
              </div>
            </div>
          </div>
          
          <!-- Right: Referral Link + Quick Actions -->
          <div style="display:flex;flex-direction:column;gap:24px">
            
            <!-- Referral Card -->
            <div class="card" style="padding:24px">
              <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:16px">Your Referral Link</h3>
              <div style="
                padding:10px 14px;
                background:rgba(255,255,255,0.03);
                border:1px solid var(--glass-border);
                border-radius:var(--radius-sm);
                font-size:0.78rem;
                color:var(--text-secondary);
                word-break:break-all;
                margin-bottom:10px;
              " id="ref-link">Loading…</div>
              <button class="btn btn-outline-gold btn-full btn-sm" onclick="copyRefLink()">📋 Copy Link</button>
            </div>
            
            <!-- Quick Actions -->
            <div class="card" style="padding:24px">
              <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:16px">Quick Actions</h3>
              <div style="display:flex;flex-direction:column;gap:10px">
                <button class="btn btn-primary btn-full" onclick="navigate('invest')">💰 Invest Now</button>
                <button class="btn btn-secondary btn-full" onclick="navigate('withdraw')">💸 Withdraw</button>
                <button class="btn btn-secondary btn-full" onclick="claimIncome()">🎁 Claim Income</button>
              </div>
            </div>
            
            <!-- Group Info -->
            <div class="card" style="padding:24px" id="group-card">
              <div class="shimmer" style="height:100px;border-radius:8px"></div>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  `;
  
  setupSidebarToggle();
  loadDashboardData(user);
}

async function loadDashboardData(user) {
  // Load stats
  const statsRes = await DashboardAPI.getStats();
  
  const statsGrid = document.getElementById('stats-grid');
  if (statsGrid) {
    if (statsRes.success) {
      const d = statsRes.data;
      statsGrid.innerHTML = `
        <div class="stat-card card-3d-hover" style="--accent-color:var(--gold)">
          <div class="stat-icon" style="background:rgba(255,209,102,0.1)">💵</div>
          <div class="stat-value text-gold">${formatUSDT(d.wallet?.main_wallet)}</div>
          <div class="stat-label">Main Wallet</div>
        </div>
        <div class="stat-card card-3d-hover" style="--accent-color:var(--accent-green)">
          <div class="stat-icon" style="background:rgba(6,214,160,0.1)">📈</div>
          <div class="stat-value" style="color:var(--accent-green)">${formatUSDT(d.incomes?.direct_income)}</div>
          <div class="stat-label">Direct Income</div>
        </div>
        <div class="stat-card card-3d-hover" style="--accent-color:var(--accent-cyan)">
          <div class="stat-icon" style="background:rgba(0,212,255,0.1)">🏛️</div>
          <div class="stat-value" style="color:var(--accent-cyan)">${formatUSDT(d.incomes?.pension_income)}</div>
          <div class="stat-label">Pension Income</div>
        </div>
        <div class="stat-card card-3d-hover" style="--accent-color:var(--accent-purple)">
          <div class="stat-icon" style="background:rgba(123,47,190,0.1)">👥</div>
          <div class="stat-value" style="color:#B87FFF">${d.total_directs || 0}</div>
          <div class="stat-label">Direct Referrals</div>
        </div>
      `;
      
      // Referral link
      const refLink = document.getElementById('ref-link');
      if (refLink) {
        const link = `${window.location.origin}#register?ref=${d.user?.user_id || user?.user_id}`;
        refLink.textContent = link;
        window._refLink = link;
      }
      
      // Pension card
      renderPensionCard(d);
      
      // Group card
      renderGroupCard(d);
      
    } else {
      statsGrid.innerHTML = `<div style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:20px">Failed to load stats</div>`;
    }
  }
  
  // Load transactions
  const txRes = await DashboardAPI.getTransactions(1);
  const txEl = document.getElementById('recent-tx');
  
  if (txEl) {
    if (txRes.success && txRes.data.data?.length > 0) {
      txEl.innerHTML = `
        <div class="table-wrap" style="border:none;border-radius:0">
          <table>
            <thead><tr>
              <th>Type</th><th>Amount</th><th>Date</th><th>Status</th>
            </tr></thead>
            <tbody>
              ${txRes.data.data.slice(0, 5).map(tx => `
                <tr>
                  <td style="text-transform:capitalize">${tx.tx_type || tx.type || '—'}</td>
                  <td class="text-gold font-semibold">${formatUSDT(tx.amount)}</td>
                  <td style="color:var(--text-secondary);font-size:0.82rem">${formatDate(tx.created_at)}</td>
                  <td><span class="badge badge-${tx.status === 'completed' ? 'green' : tx.status === 'pending' ? 'gold' : 'red'}">${tx.status || 'pending'}</span></td>
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

function renderPensionCard(d) {
  const card = document.getElementById('pension-card');
  if (!card) return;
  
  const directs = d.monthly_directs || 0;
  const needed = 2;
  const pct = Math.min((directs / needed) * 100, 100);
  const eligible = directs >= needed;
  
  card.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
      <div>
        <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:4px">Monthly Pension Status</h3>
        <p style="color:var(--text-secondary);font-size:0.85rem">Bring 2 referrals this month to maintain $100 pension</p>
      </div>
      <div class="${eligible ? 'badge badge-green' : 'badge badge-gold'}" style="font-size:0.85rem;padding:6px 14px">
        ${eligible ? '✅ Eligible' : '⏳ Not Yet Eligible'}
      </div>
    </div>
    <div style="margin-top:16px">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:0.85rem;color:var(--text-secondary)">This Month Referrals</span>
        <span style="font-size:0.85rem;font-weight:600">${directs}/${needed}</span>
      </div>
      <div style="height:8px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${eligible ? 'var(--accent-green)' : 'var(--gold)'};border-radius:4px;transition:width 0.5s"></div>
      </div>
    </div>
    ${d.fast_income_count >= 4 ? `
      <div style="margin-top:16px;padding:12px;background:rgba(6,214,160,0.08);border:1px solid rgba(6,214,160,0.2);border-radius:var(--radius-sm)">
        <p style="font-size:0.85rem;color:var(--accent-green)">⚡ Fast Income achieved! 4+ referrals this month → $100 bonus pending</p>
      </div>
    ` : ''}
  `;
}

function renderGroupCard(d) {
  const card = document.getElementById('group-card');
  if (!card) return;
  
  const group = d.group || {};
  const members = group.current_members || 0;
  const total = 10000;
  const pct = Math.min((members / total) * 100, 100);
  
  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h3 style="font-family:var(--font-display);font-weight:700">Group Status</h3>
      <span class="badge badge-cyan">${group.name || 'Group A'}</span>
    </div>
    <div style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:0.8rem;color:var(--text-secondary)">Members</span>
        <span style="font-size:0.8rem;font-weight:600">${members.toLocaleString()} / 10,000</span>
      </div>
      <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--accent-cyan),var(--gold));border-radius:3px;transition:width 0.5s"></div>
      </div>
      <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">${pct.toFixed(1)}% complete</div>
    </div>
  `;
}

window.copyRefLink = () => {
  const link = window._refLink;
  if (link) copyToClipboard(link);
};

window.claimIncome = async () => {
  const res = await ReferralAPI.claimIncome();
  if (res.success) {
    showToast('Income claimed successfully!', 'success');
    loadDashboardData(getCurrentUser());
  } else {
    showToast(res.error || 'Nothing to claim or already claimed this month', 'warning');
  }
};

function setupSidebarToggle() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (toggle && sidebar) {
    toggle.style.display = 'flex';
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
}

export { renderDashboard, userSidebar, setupSidebarToggle };
