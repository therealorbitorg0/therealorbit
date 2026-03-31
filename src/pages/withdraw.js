// ================================
// TRO – Withdraw Page
// ================================
import { WithdrawalAPI } from '../utils/api.js';
import { showToast, getCurrentUser, setButtonLoading, formatUSDT, formatDate, checkKycBeforeAction } from '../utils/helpers.js';
import { userSidebar, setupSidebarToggle } from './dashboard.js';

async function renderWithdraw() {
  document.getElementById('app').innerHTML = `
    ${userSidebar('withdraw')}
    <div class="main-content">
      <div class="topbar">
        <div style="display:flex;align-items:center;gap:12px">
          <button id="sidebar-toggle" style="display:none;flex-direction:column;gap:5px;background:transparent;padding:4px;border:none;cursor:pointer">
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
          </button>
          <div class="topbar-title">Withdraw</div>
        </div>
      </div>
      <div class="content-area">
        <div style="max-width:640px;margin:0 auto">
          
          <!-- Balance Card -->
          <div class="plan-card" style="text-align:center;padding:40px;margin-bottom:24px">
            <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:8px">Available Balance</p>
            <div id="wallet-balance" style="font-family:var(--font-display);font-size:3.5rem;font-weight:900;color:var(--gold)">—</div>
            <div style="color:var(--text-muted);font-size:0.85rem">USDT</div>
          </div>
          
          <!-- Withdrawal Form -->
          <div class="card" style="padding:32px;margin-bottom:24px">
            <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:20px">Request Withdrawal</h3>
            
            <div class="form-group">
              <label class="form-label">Amount (USDT) <span class="required">*</span></label>
              <input type="number" id="wd-amount" class="form-input" placeholder="Minimum: 10 USDT" min="10" step="0.01">
              <span class="form-error" id="wd-amount-error"></span>
            </div>
            
            <div class="form-group">
              <label class="form-label">USDT Wallet Address (TRC-20) <span class="required">*</span></label>
              <input type="text" id="wd-address" class="form-input" placeholder="Your TRC-20 wallet address" style="font-family:monospace">
              <span class="form-hint">Must be a valid TRON (TRC-20) wallet address</span>
              <span class="form-error" id="wd-address-error"></span>
            </div>
            
            <!-- Fee info -->
            <div style="padding:14px;background:rgba(255,209,102,0.05);border:1px solid rgba(255,209,102,0.15);border-radius:var(--radius-sm);margin-bottom:20px;font-size:0.85rem">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="color:var(--text-secondary)">Withdrawal Fee</span>
                <span style="color:var(--gold)">2%</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="color:var(--text-secondary)">Minimum Amount</span>
                <span style="color:var(--gold)">$10 USDT</span>
              </div>
            </div>
            
            <button id="wd-btn" class="btn btn-primary btn-full btn-lg" onclick="submitWithdrawal()">
              💸 Request Withdrawal
            </button>
          </div>
          
          <!-- History -->
          <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:20px 24px;border-bottom:1px solid var(--glass-border)">
              <h3 style="font-family:var(--font-display);font-weight:700">Withdrawal History</h3>
            </div>
            <div id="wd-history">
              <div style="padding:32px;text-align:center;color:var(--text-muted)">
                <div class="loader" style="margin:0 auto 12px"></div>Loading…
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  setupSidebarToggle();
  await checkKycBeforeAction('withdrawing');
  loadWithdrawData();
  
  window.submitWithdrawal = async () => {
    const amount = parseFloat(document.getElementById('wd-amount').value);
    const address = document.getElementById('wd-address').value.trim();
    const btn = document.getElementById('wd-btn');
    
    document.querySelectorAll('.form-error').forEach(e => e.textContent = '');
    let valid = true;
    
    if (!amount || amount < 10) {
      document.getElementById('wd-amount').classList.add('error');
      document.getElementById('wd-amount-error').textContent = 'Minimum withdrawal is $10 USDT';
      valid = false;
    }
    if (!address || address.length < 30) {
      document.getElementById('wd-address').classList.add('error');
      document.getElementById('wd-address-error').textContent = 'Enter valid TRC-20 wallet address';
      valid = false;
    }
    if (!valid) return;
    
    setButtonLoading(btn, true, 'Submitting…');
    const res = await WithdrawalAPI.request({ amount, wallet_address: address, wallet_type: 'main' });
    setButtonLoading(btn, false);
    
    if (res.success) {
      showToast('Withdrawal request submitted!', 'success');
      document.getElementById('wd-amount').value = '';
      loadWithdrawData();
    } else {
      showToast(res.error || 'Request failed', 'error');
    }
  };
}

async function loadWithdrawData() {
  const walletRes = await WithdrawalAPI.getWallet();
  if (walletRes.success) {
    const el = document.getElementById('wallet-balance');
    if (el) el.textContent = formatUSDT(walletRes.data?.main_wallet || 0);
  }
  
  const histRes = await WithdrawalAPI.getHistory();
  const el = document.getElementById('wd-history');
  if (!el) return;
  
  if (histRes.success && histRes.data?.length > 0) {
    el.innerHTML = `
      <div class="table-wrap" style="border:none;border-radius:0">
        <table>
          <thead><tr><th>Amount</th><th>Payable</th><th>Address</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            ${histRes.data.map(w => `
              <tr>
                <td class="text-gold">${formatUSDT(w.amount)}</td>
                <td style="color:var(--accent-green)">${formatUSDT(w.payable)}</td>
                <td style="font-family:monospace;font-size:0.75rem;color:var(--text-muted)">${w.wallet_address ? w.wallet_address.slice(0,16)+'…' : '—'}</td>
                <td style="font-size:0.82rem;color:var(--text-secondary)">${formatDate(w.created_at)}</td>
                <td><span class="badge badge-${w.status === 'approved' ? 'green' : w.status === 'pending' ? 'gold' : 'red'}">${w.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">No withdrawal history</div>`;
  }
}

export { renderWithdraw };
