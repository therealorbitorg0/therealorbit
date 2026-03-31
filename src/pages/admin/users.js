// ================================
// TRO – Admin Users Page
// ================================
import { AdminAPI } from '../../utils/api.js';
import { showToast, formatDate, getInitials, confirmDialog, openModal, setButtonLoading } from '../../utils/helpers.js';
import { adminSidebar } from './login.js';
import { adminTopbar, setupAdminSidebar } from './dashboard.js';

async function renderAdminUsers() {
  document.getElementById('app').innerHTML = `
    ${adminSidebar('admin/users')}
    <div class="main-content">
      ${adminTopbar('Users Management')}
      <div class="content-area">
        
        <!-- Search & Filter Bar -->
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px">
          <input type="text" id="user-search" class="form-input" placeholder="Search by name, email, ID…" style="max-width:320px" oninput="searchUsers(this.value)">
          <select id="user-status-filter" class="form-input" style="width:160px" onchange="filterUsersByStatus(this.value)">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select id="user-kyc-filter" class="form-input" style="width:160px" onchange="filterUsersByKyc(this.value)">
            <option value="">All KYC</option>
            <option value="approved">KYC Approved</option>
            <option value="pending">KYC Pending</option>
            <option value="rejected">KYC Rejected</option>
          </select>
        </div>
        
        <div class="card" style="padding:0;overflow:hidden">
          <div style="padding:16px 24px;border-bottom:1px solid var(--glass-border);display:flex;justify-content:space-between;align-items:center">
            <h3 style="font-family:var(--font-display);font-weight:700">All Users</h3>
            <span id="user-count" class="badge badge-cyan">Loading…</span>
          </div>
          <div id="users-table">
            <div style="padding:40px;text-align:center;color:var(--text-muted)"><div class="loader" style="margin:0 auto 12px"></div></div>
          </div>
          <div id="users-pagination" style="padding:16px 24px;border-top:1px solid var(--glass-border);display:flex;justify-content:center;gap:8px"></div>
        </div>
      </div>
    </div>
  `;
  
  setupAdminSidebar();
  
  let currentPage = 1;
  let currentSearch = '';
  
  window._loadUsers = async () => {
    const el = document.getElementById('users-table');
    el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)"><div class="loader" style="margin:0 auto 12px"></div></div>`;
    
    const res = await AdminAPI.getUsers(currentPage, currentSearch);
    if (!res.success) { el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">Failed to load</div>`; return; }
    
    const data = res.data;
    document.getElementById('user-count').textContent = `${data.total || 0} users`;
    
    if (!data.data?.length) { el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">No users found</div>`; return; }
    
    el.innerHTML = `
      <div class="table-wrap" style="border:none;border-radius:0">
        <table>
          <thead><tr><th>User</th><th>ID</th><th>Mobile</th><th>KYC</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            ${data.data.map(u => `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="avatar" style="width:32px;height:32px;font-size:0.75rem">${getInitials(u.name)}</div>
                    <div>
                      <div style="font-weight:500;font-size:0.9rem">${u.name || '—'}</div>
                      <div style="font-size:0.75rem;color:var(--text-muted)">${u.email || '—'}</div>
                    </div>
                  </div>
                </td>
                <td style="font-family:monospace;font-size:0.8rem;color:var(--text-secondary)">${u.user_id || '—'}</td>
                <td style="font-size:0.85rem">${u.mobile || '—'}</td>
                <td><span class="badge badge-${u.kyc_status === 'approved' ? 'green' : u.kyc_status === 'pending' ? 'gold' : 'red'}">${u.kyc_status || 'none'}</span></td>
                <td><span class="badge badge-${u.status == 1 ? 'green' : 'red'}">${u.status == 1 ? 'Active' : 'Blocked'}</span></td>
                <td style="font-size:0.8rem;color:var(--text-secondary)">${formatDate(u.created_at)}</td>
                <td>
                  <div style="display:flex;gap:6px">
                    <button class="btn btn-secondary btn-sm" onclick="viewUser(${u.id})">View</button>
                    <button class="btn btn-${u.status == 1 ? 'danger' : 'success'} btn-sm" onclick="toggleUserBlock(${u.id}, ${u.status})">${u.status == 1 ? 'Block' : 'Unblock'}</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    // Pagination
    const pgEl = document.getElementById('users-pagination');
    if (data.last_page > 1) {
      pgEl.innerHTML = Array.from({ length: Math.min(data.last_page, 10) }, (_, i) => i + 1).map(p => `
        <button class="btn btn-${p === currentPage ? 'primary' : 'secondary'} btn-sm" onclick="usersGoPage(${p})">${p}</button>
      `).join('');
    }
  };
  
  window.searchUsers = (v) => { currentSearch = v; currentPage = 1; clearTimeout(window._searchTimer); window._searchTimer = setTimeout(() => window._loadUsers(), 400); };
  window.usersGoPage = (p) => { currentPage = p; window._loadUsers(); };
  window.filterUsersByStatus = () => window._loadUsers();
  window.filterUsersByKyc = () => window._loadUsers();
  
  window.toggleUserBlock = async (id, status) => {
    confirmDialog(
      status == 1 ? 'Are you sure you want to block this user?' : 'Unblock this user?',
      async () => {
        const res = await AdminAPI.blockUser(id);
        if (res.success) { showToast('User status updated', 'success'); window._loadUsers(); }
        else showToast(res.error || 'Failed', 'error');
      }
    );
  };
  
  window.viewUser = async (id) => {
    const res = await AdminAPI.getUser(id);
    if (!res.success) { showToast('Failed to load user', 'error'); return; }
    const u = res.data;
    openModal(`User: ${u.name}`, `
      <div style="display:flex;flex-direction:column;gap:12px">
        ${[
          ['User ID', u.user_id], ['Email', u.email], ['Mobile', u.mobile],
          ['Sponsor ID', u.sponsor_id || 'None'], ['KYC Status', u.kyc_status || 'None'],
          ['Active Status', u.active_status == 1 ? 'Active' : 'Inactive'],
          ['ETH Address', u.eth_address || 'Not set'],
          ['Joined', formatDate(u.created_at)],
        ].map(([k,v]) => `
          <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.02);border-radius:8px">
            <span style="color:var(--text-secondary);font-size:0.85rem">${k}</span>
            <span style="font-weight:500;font-size:0.85rem;max-width:60%;word-break:break-all;text-align:right">${v || '—'}</span>
          </div>
        `).join('')}
      </div>
    `);
  };
  
  window._loadUsers();
}

// ================================
// Admin KYC Page
// ================================

async function renderAdminKyc() {
  document.getElementById('app').innerHTML = `
    ${adminSidebar('admin/kyc')}
    <div class="main-content">
      ${adminTopbar('KYC Requests')}
      <div class="content-area">
        
        <div style="display:flex;gap:12px;margin-bottom:20px">
          ${['pending','approved','rejected'].map(s => `
            <button class="btn btn-${s === 'pending' ? 'primary' : 'secondary'} btn-sm kyc-tab" onclick="loadKycList('${s}', this)">${s.charAt(0).toUpperCase()+s.slice(1)}</button>
          `).join('')}
        </div>
        
        <div class="card" style="padding:0;overflow:hidden">
          <div id="kyc-list">
            <div style="padding:40px;text-align:center;color:var(--text-muted)"><div class="loader" style="margin:0 auto 12px"></div></div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  setupAdminSidebar();
  
  window.loadKycList = async (status, btn) => {
    document.querySelectorAll('.kyc-tab').forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
    if (btn) { btn.classList.add('btn-primary'); btn.classList.remove('btn-secondary'); }
    
    const el = document.getElementById('kyc-list');
    el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)"><div class="loader" style="margin:0 auto 12px"></div></div>`;
    
    const res = await AdminAPI.getKycList(status);
    if (!res.success || !res.data?.length) {
      el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">No ${status} KYC requests</div>`;
      return;
    }
    
    el.innerHTML = `
      <div class="table-wrap" style="border:none;border-radius:0">
        <table>
          <thead><tr><th>Name</th><th>Aadhaar</th><th>PAN</th><th>Submitted</th><th>Actions</th></tr></thead>
          <tbody>
            ${res.data.map(k => `
              <tr>
                <td>
                  <div style="font-weight:500">${k.full_name || k.user?.name || '—'}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">${k.user?.email || '—'}</div>
                </td>
                <td style="font-family:monospace;font-size:0.82rem">••••${(k.aadhaar_number || '').slice(-4)}</td>
                <td style="font-family:monospace;font-size:0.82rem">${k.pan_number || '—'}</td>
                <td style="font-size:0.82rem;color:var(--text-secondary)">${formatDate(k.created_at)}</td>
                <td>
                  <div style="display:flex;gap:6px">
                    <button class="btn btn-secondary btn-sm" onclick="viewKyc(${k.id}, '${k.user_id || k.user?.id}')">View Docs</button>
                    ${status === 'pending' ? `
                      <button class="btn btn-success btn-sm" onclick="approveKyc(${k.user_id || k.user?.id})">Approve</button>
                      <button class="btn btn-danger btn-sm" onclick="rejectKycPrompt(${k.user_id || k.user?.id})">Reject</button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };
  
  window.approveKyc = async (userId) => {
    const res = await AdminAPI.approveKyc(userId);
    if (res.success) { showToast('KYC approved!', 'success'); window.loadKycList('pending'); }
    else showToast(res.error || 'Failed', 'error');
  };
  
  window.rejectKycPrompt = (userId) => {
    openModal('Reject KYC', `
      <div class="form-group">
        <label class="form-label">Rejection Reason <span class="required">*</span></label>
        <textarea id="reject-reason" class="form-input" placeholder="Explain why KYC is rejected…" rows="4"></textarea>
      </div>
    `, [
      { label: 'Cancel', type: 'secondary', onclick: 'closeModal()' },
      { label: 'Reject KYC', type: 'danger', onclick: `window._rejectKyc(${userId})` }
    ]);
    window._rejectKyc = async (uid) => {
      const reason = document.getElementById('reject-reason').value.trim();
      if (!reason) { showToast('Enter rejection reason', 'warning'); return; }
      const res = await AdminAPI.rejectKyc(uid, reason);
      closeModal();
      if (res.success) { showToast('KYC rejected', 'success'); window.loadKycList('pending'); }
      else showToast(res.error || 'Failed', 'error');
    };
  };
  
  window.viewKyc = async (kycId, userId) => {
    openModal('KYC Documents', `
      <div style="display:flex;flex-direction:column;gap:12px">
        <p style="color:var(--text-secondary);font-size:0.85rem">Document images are loaded from the server.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:16px;text-align:center">
            <div style="font-size:2rem;margin-bottom:8px">🪪</div>
            <div style="font-size:0.8rem;font-weight:600">Aadhaar Front</div>
            <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="window.open('/api/admin/kyc/${kycId}/doc/aadhaar_front')">View</button>
          </div>
          <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:16px;text-align:center">
            <div style="font-size:2rem;margin-bottom:8px">🪪</div>
            <div style="font-size:0.8rem;font-weight:600">Aadhaar Back</div>
            <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="window.open('/api/admin/kyc/${kycId}/doc/aadhaar_back')">View</button>
          </div>
          <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:16px;text-align:center">
            <div style="font-size:2rem;margin-bottom:8px">📋</div>
            <div style="font-size:0.8rem;font-weight:600">PAN Card</div>
            <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="window.open('/api/admin/kyc/${kycId}/doc/pan_card')">View</button>
          </div>
          <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:16px;text-align:center">
            <div style="font-size:2rem;margin-bottom:8px">🤳</div>
            <div style="font-size:0.8rem;font-weight:600">Live Selfie</div>
            <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="window.open('/api/admin/kyc/${kycId}/doc/selfie')">View</button>
          </div>
        </div>
      </div>
    `);
  };
  
  window.loadKycList('pending');
}

// ================================
// Admin Withdrawals Page
// ================================

async function renderAdminWithdrawals() {
  document.getElementById('app').innerHTML = `
    ${adminSidebar('admin/withdrawals')}
    <div class="main-content">
      ${adminTopbar('Withdrawals')}
      <div class="content-area">
        
        <div style="display:flex;gap:12px;margin-bottom:20px">
          ${['pending','approved','rejected'].map(s => `
            <button class="btn btn-${s === 'pending' ? 'primary' : 'secondary'} btn-sm wd-tab" onclick="loadWdList('${s}', this)">${s.charAt(0).toUpperCase()+s.slice(1)}</button>
          `).join('')}
        </div>
        
        <div class="card" style="padding:0;overflow:hidden">
          <div id="wd-list">
            <div style="padding:40px;text-align:center;color:var(--text-muted)"><div class="loader" style="margin:0 auto 12px"></div></div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  setupAdminSidebar();
  
  window.loadWdList = async (status, btn) => {
    document.querySelectorAll('.wd-tab').forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
    if (btn) { btn.classList.add('btn-primary'); btn.classList.remove('btn-secondary'); }
    
    const el = document.getElementById('wd-list');
    el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)"><div class="loader" style="margin:0 auto 12px"></div></div>`;
    
    const res = await AdminAPI.getWithdrawals(status);
    if (!res.success || !res.data?.length) {
      el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">No ${status} withdrawals</div>`;
      return;
    }
    
    el.innerHTML = `
      <div class="table-wrap" style="border:none;border-radius:0">
        <table>
          <thead><tr><th>User</th><th>Amount</th><th>Payable</th><th>Wallet Address</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            ${res.data.map(w => `
              <tr>
                <td>
                  <div style="font-weight:500;font-size:0.9rem">${w.user?.name || '—'}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">${w.user?.email || '—'}</div>
                </td>
                <td class="text-gold font-semibold">${formatUSDT(w.amount)}</td>
                <td style="color:var(--accent-green);font-weight:600">${formatUSDT(w.payable)}</td>
                <td style="font-family:monospace;font-size:0.75rem;color:var(--text-muted);max-width:160px;overflow:hidden;text-overflow:ellipsis">${w.wallet_address || '—'}</td>
                <td style="font-size:0.82rem;color:var(--text-secondary)">${formatDate(w.created_at)}</td>
                <td>
                  <div style="display:flex;gap:6px">
                    <button class="btn btn-secondary btn-sm" onclick="copyToClipboard('${w.wallet_address}')">Copy Addr</button>
                    ${status === 'pending' ? `
                      <button class="btn btn-success btn-sm" onclick="approveWd(${w.id})">Approve</button>
                      <button class="btn btn-danger btn-sm" onclick="rejectWdPrompt(${w.id})">Reject</button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };
  
  window.approveWd = async (id) => {
    confirmDialog('Approve this withdrawal?', async () => {
      const res = await AdminAPI.approveWithdrawal(id);
      if (res.success) { showToast('Withdrawal approved!', 'success'); window.loadWdList('pending'); }
      else showToast(res.error || 'Failed', 'error');
    });
  };
  
  window.rejectWdPrompt = (id) => {
    openModal('Reject Withdrawal', `
      <div class="form-group">
        <label class="form-label">Reason</label>
        <textarea id="wd-reject-reason" class="form-input" rows="3" placeholder="Reason for rejection…"></textarea>
      </div>
    `, [
      { label: 'Cancel', type: 'secondary', onclick: 'closeModal()' },
      { label: 'Reject', type: 'danger', onclick: `window._rejectWd(${id})` }
    ]);
    window._rejectWd = async (wid) => {
      const reason = document.getElementById('wd-reject-reason').value.trim();
      const res = await AdminAPI.rejectWithdrawal(wid, reason);
      closeModal();
      if (res.success) { showToast('Withdrawal rejected', 'success'); window.loadWdList('pending'); }
      else showToast(res.error || 'Failed', 'error');
    };
  };
  
  window.loadWdList('pending');
}

// ================================
// Admin Transactions Page
// ================================

async function renderAdminTransactions() {
  document.getElementById('app').innerHTML = `
    ${adminSidebar('admin/transactions')}
    <div class="main-content">
      ${adminTopbar('Transactions')}
      <div class="content-area">
        <div class="card" style="padding:0;overflow:hidden">
          <div id="admin-tx-table">
            <div style="padding:40px;text-align:center;color:var(--text-muted)"><div class="loader" style="margin:0 auto 12px"></div></div>
          </div>
          <div id="admin-tx-pagination" style="padding:16px 24px;border-top:1px solid var(--glass-border);display:flex;justify-content:center;gap:8px"></div>
        </div>
      </div>
    </div>
  `;
  
  setupAdminSidebar();
  
  let currentPage = 1;
  
  window.adminTxGoPage = (p) => { currentPage = p; loadAdminTx(); };
  
  async function loadAdminTx() {
    const el = document.getElementById('admin-tx-table');
    el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)"><div class="loader" style="margin:0 auto 12px"></div></div>`;
    
    const res = await AdminAPI.getTransactions(currentPage);
    if (!res.success || !res.data?.data?.length) {
      el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">No transactions</div>`;
      return;
    }
    
    const data = res.data;
    el.innerHTML = `
      <div class="table-wrap" style="border:none;border-radius:0">
        <table>
          <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>TX ID</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            ${data.data.map(tx => `
              <tr>
                <td style="font-size:0.85rem">${tx.user?.name || tx.user_id || '—'}</td>
                <td style="text-transform:capitalize;font-size:0.85rem">${tx.tx_type || '—'}</td>
                <td class="${tx.type === 'credit' ? 'text-green' : 'text-red'} font-semibold">${formatUSDT(tx.amount)}</td>
                <td style="font-family:monospace;font-size:0.75rem;color:var(--text-muted)">${tx.tx_id ? tx.tx_id.slice(0,16)+'…' : '—'}</td>
                <td style="font-size:0.82rem;color:var(--text-secondary)">${formatDate(tx.created_at)}</td>
                <td><span class="badge badge-${tx.status === 'completed' ? 'green' : 'gold'}">${tx.status || 'pending'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    const pgEl = document.getElementById('admin-tx-pagination');
    if (data.last_page > 1) {
      pgEl.innerHTML = Array.from({ length: Math.min(data.last_page, 10) }, (_, i) => i+1).map(p => `
        <button class="btn btn-${p === currentPage ? 'primary' : 'secondary'} btn-sm" onclick="adminTxGoPage(${p})">${p}</button>
      `).join('');
    }
  }
  
  loadAdminTx();
}

import { formatUSDT, formatDate } from '../../utils/helpers.js';

export { renderAdminUsers, renderAdminKyc, renderAdminWithdrawals, renderAdminTransactions };
