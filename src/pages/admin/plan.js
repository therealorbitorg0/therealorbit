// ================================
// TRO – Admin Plan Settings
// ================================
import { AdminAPI } from '../../utils/api.js';
import { showToast, setButtonLoading, openModal } from '../../utils/helpers.js';
import { adminSidebar } from './login.js';
import { adminTopbar, setupAdminSidebar } from './dashboard.js';

async function renderAdminPlan() {
  document.getElementById('app').innerHTML = `
    ${adminSidebar('admin/plan')}
    <div class="main-content">
      ${adminTopbar('Plan Settings')}
      <div class="content-area">
        <div style="max-width:780px">
          
          <div style="background:rgba(255,209,102,0.06);border:1px solid rgba(255,209,102,0.2);border-radius:var(--radius-sm);padding:14px 20px;margin-bottom:24px;font-size:0.85rem;color:var(--gold)">
            ⚠️ Changes here affect ALL users immediately. Edit with caution.
          </div>
          
          <!-- Entry Settings -->
          <div class="card" style="padding:32px;margin-bottom:20px">
            <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:20px">💰 Entry & Investment</h3>
            <div class="grid-2" style="gap:16px">
              <div class="form-group">
                <label class="form-label">Entry Amount (USDT)</label>
                <input type="number" id="plan-entry" class="form-input" value="167" min="1" step="0.01">
                <span class="form-hint">Default: 167 USDT</span>
              </div>
              <div class="form-group">
                <label class="form-label">Admin USDT Wallet (TRC-20)</label>
                <input type="text" id="plan-wallet" class="form-input" placeholder="TRC-20 address" style="font-family:monospace">
              </div>
            </div>
          </div>
          
          <!-- Income Settings -->
          <div class="card" style="padding:32px;margin-bottom:20px">
            <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:20px">💵 Income Configuration</h3>
            <div class="grid-2" style="gap:16px">
              <div class="form-group">
                <label class="form-label">Direct Referral % </label>
                <input type="number" id="plan-ref-pct" class="form-input" value="15" min="0" max="100" step="0.01">
                <span class="form-hint">Default: 15%</span>
              </div>
              <div class="form-group">
                <label class="form-label">Monthly Pension (USDT)</label>
                <input type="number" id="plan-pension" class="form-input" value="100" min="0" step="0.01">
                <span class="form-hint">Default: $100</span>
              </div>
              <div class="form-group">
                <label class="form-label">Fast Income Bonus (USDT)</label>
                <input type="number" id="plan-fast" class="form-input" value="100" min="0" step="0.01">
                <span class="form-hint">Default: $100</span>
              </div>
              <div class="form-group">
                <label class="form-label">Fast Income Requirement (Referrals)</label>
                <input type="number" id="plan-fast-req" class="form-input" value="4" min="1">
                <span class="form-hint">Default: 4 referrals/month</span>
              </div>
            </div>
          </div>
          
          <!-- Group Settings -->
          <div class="card" style="padding:32px;margin-bottom:20px">
            <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:20px">🌍 Group Configuration</h3>
            <div class="grid-2" style="gap:16px">
              <div class="form-group">
                <label class="form-label">Group Completion Size</label>
                <input type="number" id="plan-group-size" class="form-input" value="10000" min="1">
                <span class="form-hint">Default: 10,000 IDs</span>
              </div>
              <div class="form-group">
                <label class="form-label">Min Monthly Referrals for Pension</label>
                <input type="number" id="plan-min-ref" class="form-input" value="2" min="0">
                <span class="form-hint">Default: 2 referrals/month</span>
              </div>
            </div>
          </div>
          
          <!-- Withdrawal Settings -->
          <div class="card" style="padding:32px;margin-bottom:20px">
            <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:20px">💸 Withdrawal Settings</h3>
            <div class="grid-2" style="gap:16px">
              <div class="form-group">
                <label class="form-label">Withdrawal Fee (%)</label>
                <input type="number" id="plan-wd-fee" class="form-input" value="2" min="0" max="50" step="0.01">
              </div>
              <div class="form-group">
                <label class="form-label">Minimum Withdrawal (USDT)</label>
                <input type="number" id="plan-wd-min" class="form-input" value="10" min="1" step="0.01">
              </div>
            </div>
          </div>
          
          <!-- Pension Distribution -->
          <div class="card" style="padding:32px;margin-bottom:20px;border:1px solid rgba(255,209,102,0.3)">
            <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:8px">🏛️ Distribute Monthly Pension</h3>
            <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:20px">
              Manually trigger pension distribution to all eligible users. Run this once per month.
            </p>
            <button class="btn btn-outline-gold" onclick="distributePension()">
              🏛️ Distribute Pension Now
            </button>
          </div>
          
          <div style="display:flex;gap:12px">
            <button id="plan-save-btn" class="btn btn-primary btn-lg" onclick="savePlanSettings()">
              💾 Save Plan Settings
            </button>
            <button class="btn btn-secondary btn-lg" onclick="loadPlanSettings()">
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  setupAdminSidebar();
  loadPlanSettings();
  
  async function loadPlanSettings() {
    const res = await AdminAPI.getPlanSettings();
    if (res.success && res.data) {
      const d = res.data;
      if (d.entry_amount) document.getElementById('plan-entry').value = d.entry_amount;
      if (d.wallet_address) document.getElementById('plan-wallet').value = d.wallet_address;
      if (d.referral_percent) document.getElementById('plan-ref-pct').value = d.referral_percent;
      if (d.pension_amount) document.getElementById('plan-pension').value = d.pension_amount;
      if (d.fast_income_bonus) document.getElementById('plan-fast').value = d.fast_income_bonus;
      if (d.fast_income_requirement) document.getElementById('plan-fast-req').value = d.fast_income_requirement;
      if (d.group_size) document.getElementById('plan-group-size').value = d.group_size;
      if (d.min_monthly_referrals) document.getElementById('plan-min-ref').value = d.min_monthly_referrals;
      if (d.withdrawal_fee) document.getElementById('plan-wd-fee').value = d.withdrawal_fee;
      if (d.min_withdrawal) document.getElementById('plan-wd-min').value = d.min_withdrawal;
    }
  }
  
  window.loadPlanSettings = loadPlanSettings;
  
  window.savePlanSettings = async () => {
    const btn = document.getElementById('plan-save-btn');
    setButtonLoading(btn, true, 'Saving…');
    
    const payload = {
      entry_amount: parseFloat(document.getElementById('plan-entry').value),
      wallet_address: document.getElementById('plan-wallet').value.trim(),
      referral_percent: parseFloat(document.getElementById('plan-ref-pct').value),
      pension_amount: parseFloat(document.getElementById('plan-pension').value),
      fast_income_bonus: parseFloat(document.getElementById('plan-fast').value),
      fast_income_requirement: parseInt(document.getElementById('plan-fast-req').value),
      group_size: parseInt(document.getElementById('plan-group-size').value),
      min_monthly_referrals: parseInt(document.getElementById('plan-min-ref').value),
      withdrawal_fee: parseFloat(document.getElementById('plan-wd-fee').value),
      min_withdrawal: parseFloat(document.getElementById('plan-wd-min').value),
    };
    
    const res = await AdminAPI.updatePlan(payload);
    setButtonLoading(btn, false);
    
    if (res.success) showToast('Plan settings saved!', 'success');
    else showToast(res.error || 'Save failed', 'error');
  };
  
  window.distributePension = async () => {
    confirmDialog('Distribute monthly pension to ALL eligible users? This cannot be undone.', async () => {
      const res = await AdminAPI.sendPension();
      if (res.success) showToast(`Pension distributed to ${res.data?.count || 0} users!`, 'success');
      else showToast(res.error || 'Distribution failed', 'error');
    });
  };
}

// ================================
// Admin Site Settings
// ================================

async function renderAdminSettings() {
  document.getElementById('app').innerHTML = `
    ${adminSidebar('admin/settings')}
    <div class="main-content">
      ${adminTopbar('Site Settings')}
      <div class="content-area">
        <div style="max-width:680px">
          
          <div class="card" style="padding:32px;margin-bottom:20px">
            <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:20px">🌐 General</h3>
            <div class="form-group">
              <label class="form-label">Site Name</label>
              <input type="text" id="set-sitename" class="form-input" placeholder="The Real Orbit">
            </div>
            <div class="form-group">
              <label class="form-label">Site Email</label>
              <input type="email" id="set-email" class="form-input" placeholder="support@tro.com">
            </div>
            <div class="form-group">
              <label class="form-label">Support WhatsApp</label>
              <input type="text" id="set-whatsapp" class="form-input" placeholder="+91 XXXXXXXXXX">
            </div>
            <div class="form-group">
              <label class="form-label">Telegram Link</label>
              <input type="text" id="set-telegram" class="form-input" placeholder="https://t.me/yourgroup">
            </div>
          </div>
          
          <div class="card" style="padding:32px;margin-bottom:20px">
            <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:20px">🔧 Maintenance Mode</h3>
            <div class="toggle-wrap" style="margin-bottom:12px">
              <label class="toggle-switch">
                <input type="checkbox" id="set-maintenance">
                <span class="toggle-slider"></span>
              </label>
              <span style="font-size:0.9rem">Enable Maintenance Mode</span>
            </div>
            <div class="form-group">
              <label class="form-label">Maintenance Message</label>
              <textarea id="set-maintenance-msg" class="form-input" rows="3" placeholder="Site is under maintenance. Back soon."></textarea>
            </div>
          </div>
          
          <div class="card" style="padding:32px;margin-bottom:20px">
            <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:20px">📣 Announcements</h3>
            <div class="form-group">
              <label class="form-label">Announcement Text</label>
              <textarea id="set-announcement" class="form-input" rows="3" placeholder="Site-wide announcement shown to all users…"></textarea>
            </div>
            <div class="toggle-wrap">
              <label class="toggle-switch">
                <input type="checkbox" id="set-announce-active">
                <span class="toggle-slider"></span>
              </label>
              <span style="font-size:0.9rem">Show announcement to users</span>
            </div>
          </div>
          
          <button id="settings-save-btn" class="btn btn-primary btn-lg" onclick="saveSettings()">
            💾 Save Settings
          </button>
        </div>
      </div>
    </div>
  `;
  
  setupAdminSidebar();
  
  const res = await AdminAPI.getSettings();
  if (res.success && res.data) {
    const d = res.data;
    if (d.site_name) document.getElementById('set-sitename').value = d.site_name;
    if (d.site_email) document.getElementById('set-email').value = d.site_email;
    if (d.whatsapp) document.getElementById('set-whatsapp').value = d.whatsapp;
    if (d.telegram) document.getElementById('set-telegram').value = d.telegram;
    if (d.maintenance) document.getElementById('set-maintenance').checked = d.maintenance;
    if (d.maintenance_message) document.getElementById('set-maintenance-msg').value = d.maintenance_message;
    if (d.announcement) document.getElementById('set-announcement').value = d.announcement;
    if (d.announcement_active) document.getElementById('set-announce-active').checked = d.announcement_active;
  }
  
  window.saveSettings = async () => {
    const btn = document.getElementById('settings-save-btn');
    setButtonLoading(btn, true, 'Saving…');
    
    const res = await AdminAPI.updateSettings({
      site_name: document.getElementById('set-sitename').value.trim(),
      site_email: document.getElementById('set-email').value.trim(),
      whatsapp: document.getElementById('set-whatsapp').value.trim(),
      telegram: document.getElementById('set-telegram').value.trim(),
      maintenance: document.getElementById('set-maintenance').checked,
      maintenance_message: document.getElementById('set-maintenance-msg').value.trim(),
      announcement: document.getElementById('set-announcement').value.trim(),
      announcement_active: document.getElementById('set-announce-active').checked,
    });
    
    setButtonLoading(btn, false);
    if (res.success) showToast('Settings saved!', 'success');
    else showToast(res.error || 'Save failed', 'error');
  };
}

// ================================
// Admin Groups
// ================================

async function renderAdminGroups() {
  document.getElementById('app').innerHTML = `
    ${adminSidebar('admin/groups')}
    <div class="main-content">
      ${adminTopbar('Groups')}
      <div class="content-area">
        <div class="card" style="padding:0;overflow:hidden">
          <div id="groups-list">
            <div style="padding:40px;text-align:center;color:var(--text-muted)"><div class="loader" style="margin:0 auto 12px"></div></div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  setupAdminSidebar();
  
  const res = await AdminAPI.getGroups();
  const el = document.getElementById('groups-list');
  
  if (res.success && res.data?.length > 0) {
    el.innerHTML = `
      <div class="table-wrap" style="border:none;border-radius:0">
        <table>
          <thead><tr><th>Group</th><th>Members</th><th>Progress</th><th>Status</th><th>Completed</th></tr></thead>
          <tbody>
            ${res.data.map(g => {
              const pct = Math.min(((g.member_count || 0) / 10000) * 100, 100);
              return `
                <tr>
                  <td><span class="badge badge-gold" style="font-size:1rem;padding:6px 14px">${g.name}</span></td>
                  <td style="font-weight:600">${(g.member_count || 0).toLocaleString()}</td>
                  <td style="min-width:180px">
                    <div style="display:flex;align-items:center;gap:10px">
                      <div style="flex:1;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden">
                        <div style="height:100%;width:${pct}%;background:${pct >= 100 ? 'var(--accent-green)' : 'var(--gold)'};border-radius:3px"></div>
                      </div>
                      <span style="font-size:0.78rem;color:var(--text-muted);min-width:40px">${pct.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td><span class="badge badge-${g.status == 1 ? 'green' : 'gold'}">${g.status == 1 ? 'Active' : 'Pending'}</span></td>
                  <td style="font-size:0.82rem;color:var(--text-secondary)">${g.completed_at ? formatDate(g.completed_at) : '—'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">No groups yet</div>`;
  }
}

// ================================
// Admin Banners
// ================================

async function renderAdminBanners() {
  document.getElementById('app').innerHTML = `
    ${adminSidebar('admin/banners')}
    <div class="main-content">
      ${adminTopbar('Banners')}
      <div class="content-area">
        
        <!-- Upload Banner -->
        <div class="card" style="padding:32px;margin-bottom:24px;max-width:540px">
          <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:20px">Upload New Banner</h3>
          <div class="form-group">
            <label class="form-label">Title</label>
            <input type="text" id="banner-title" class="form-input" placeholder="Banner title">
          </div>
          <div class="form-group">
            <label class="form-label">Image</label>
            <div class="upload-zone" id="banner-zone" onclick="document.getElementById('banner-file').click()">
              <div class="upload-icon">🖼️</div>
              <p style="font-weight:600;margin-bottom:4px">Click to upload</p>
              <p style="font-size:0.8rem;color:var(--text-muted)">JPG, PNG – Recommended: 1200×400</p>
            </div>
            <input type="file" id="banner-file" accept="image/*" style="display:none" onchange="previewBanner(this)">
          </div>
          <button id="banner-upload-btn" class="btn btn-primary" onclick="uploadBanner()">🖼️ Upload Banner</button>
        </div>
        
        <!-- Banner List -->
        <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:16px">Existing Banners</h3>
        <div id="banner-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px">
          <div class="shimmer" style="height:180px;border-radius:12px"></div>
          <div class="shimmer" style="height:180px;border-radius:12px"></div>
        </div>
        
      </div>
    </div>
  `;
  
  setupAdminSidebar();
  loadBanners();
  
  window.previewBanner = (input) => {
    const file = input.files[0];
    if (!file) return;
    const zone = document.getElementById('banner-zone');
    const reader = new FileReader();
    reader.onload = (e) => {
      zone.innerHTML = `<img src="${e.target.result}" style="width:100%;height:120px;object-fit:cover;border-radius:8px">`;
    };
    reader.readAsDataURL(file);
  };
  
  window.uploadBanner = async () => {
    const title = document.getElementById('banner-title').value.trim();
    const file = document.getElementById('banner-file').files[0];
    const btn = document.getElementById('banner-upload-btn');
    
    if (!file) { showToast('Select an image', 'warning'); return; }
    
    setButtonLoading(btn, true, 'Uploading…');
    
    const fd = new FormData();
    fd.append('title', title || 'Banner');
    fd.append('image', file);
    
    const res = await AdminAPI.uploadBanner(fd);
    setButtonLoading(btn, false);
    
    if (res.success) {
      showToast('Banner uploaded!', 'success');
      document.getElementById('banner-title').value = '';
      document.getElementById('banner-file').value = '';
      document.getElementById('banner-zone').innerHTML = `<div class="upload-icon">🖼️</div><p style="font-weight:600;margin-bottom:4px">Click to upload</p><p style="font-size:0.8rem;color:var(--text-muted)">JPG, PNG</p>`;
      loadBanners();
    } else {
      showToast(res.error || 'Upload failed', 'error');
    }
  };
  
  async function loadBanners() {
    const res = await AdminAPI.getBanners();
    const el = document.getElementById('banner-list');
    
    if (res.success && res.data?.length > 0) {
      el.innerHTML = res.data.map(b => `
        <div class="card" style="overflow:hidden">
          <img src="/storage/${b.image}" style="width:100%;height:160px;object-fit:cover" onerror="this.src='data:image/svg+xml,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;400&quot; height=&quot;160&quot;><rect fill=&quot;%23111&quot; width=&quot;400&quot; height=&quot;160&quot;/><text fill=&quot;%23555&quot; x=&quot;50%&quot; y=&quot;50%&quot; dominant-baseline=&quot;middle&quot; text-anchor=&quot;middle&quot;>No Image</text></svg>'">
          <div style="padding:16px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:600;font-size:0.9rem">${b.title || 'Untitled'}</div>
              <div class="badge badge-${b.status ? 'green' : 'red'}" style="margin-top:4px">${b.status ? 'Active' : 'Inactive'}</div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteBanner(${b.id})">🗑️ Delete</button>
          </div>
        </div>
      `).join('');
    } else {
      el.innerHTML = `<p style="color:var(--text-muted)">No banners uploaded yet</p>`;
    }
  }
  
  window.deleteBanner = async (id) => {
    confirmDialog('Delete this banner?', async () => {
      const res = await AdminAPI.deleteBanner(id);
      if (res.success) { showToast('Banner deleted', 'success'); loadBanners(); }
      else showToast(res.error || 'Failed', 'error');
    });
  };
}

import { formatDate } from '../../utils/helpers.js';

export { renderAdminPlan, renderAdminSettings, renderAdminGroups, renderAdminBanners };
