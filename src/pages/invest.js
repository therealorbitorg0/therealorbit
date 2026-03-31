// ================================
// TRO – Invest Page
// ================================

import { InvestmentAPI } from '../utils/api.js';
import { showToast, getCurrentUser, setButtonLoading, checkKycBeforeAction } from '../utils/helpers.js';
import { navigate } from '../router.js';
import { userSidebar, setupSidebarToggle } from './dashboard.js';

async function renderInvest() {
  const user = getCurrentUser();
  
  document.getElementById('app').innerHTML = `
    ${userSidebar('invest')}
    <div class="main-content">
      <div class="topbar">
        <div style="display:flex;align-items:center;gap:12px">
          <button id="sidebar-toggle" style="display:none;flex-direction:column;gap:5px;background:transparent;padding:4px;border:none;cursor:pointer">
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
            <span style="width:24px;height:2px;background:var(--text-primary);border-radius:2px;display:block"></span>
          </button>
          <div class="topbar-title">Invest</div>
        </div>
      </div>
      
      <div class="content-area">
        <div style="max-width:680px;margin:0 auto">
          
          <!-- Status Check -->
          <div id="invest-status"></div>
          
          <!-- Investment Card -->
          <div class="plan-card" style="text-align:center;padding:48px;margin-bottom:24px">
            <div style="font-size:3rem;margin-bottom:20px">💎</div>
            <h2 style="font-family:var(--font-display);font-size:2rem;font-weight:800;margin-bottom:8px">Activate Your Account</h2>
            <p style="color:var(--text-secondary);margin-bottom:32px">One-time investment to unlock lifetime earning potential</p>
            
            <div style="
              display:inline-flex;align-items:flex-end;gap:8px;
              background:rgba(255,209,102,0.08);
              border:1px solid rgba(255,209,102,0.2);
              border-radius:16px;padding:24px 40px;margin-bottom:32px;
            ">
              <div style="font-family:var(--font-display);font-size:5rem;font-weight:900;color:var(--gold);line-height:1">167</div>
              <div style="padding-bottom:8px">
                <div style="font-size:1.5rem;font-weight:700;color:var(--text-secondary)">USDT</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">TRC-20</div>
              </div>
            </div>
            
            <!-- What you get -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;text-align:left">
              ${[
                { icon: '♾️', title: 'Lifetime ID', desc: 'Never expires' },
                { icon: '🏛️', title: '$100/mo Pension', desc: 'Group completion' },
                { icon: '⚡', title: 'Fast Income', desc: '4 referrals/mo' },
              ].map(i => `
                <div style="padding:16px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.06)">
                  <div style="font-size:1.5rem;margin-bottom:8px">${i.icon}</div>
                  <div style="font-weight:700;font-size:0.85rem;margin-bottom:2px">${i.title}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">${i.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Payment Instructions -->
          <div class="card" style="padding:32px;margin-bottom:24px">
            <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:20px">📋 Payment Instructions</h3>
            
            <div style="display:flex;flex-direction:column;gap:16px">
              
              <!-- Step 1 -->
              <div style="display:flex;gap:16px;align-items:flex-start;padding:16px;background:rgba(255,255,255,0.02);border-radius:12px">
                <div style="width:32px;height:32px;border-radius:50%;background:var(--gold);color:var(--orbit-deep);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;flex-shrink:0">1</div>
                <div>
                  <p style="font-weight:600;margin-bottom:4px">Send exactly 167 USDT (TRC-20) to:</p>
                  <div style="
                    display:flex;align-items:center;gap:10px;
                    background:rgba(0,0,0,0.3);border-radius:8px;padding:10px 14px;
                    border:1px solid rgba(255,209,102,0.2);margin-top:8px;
                  ">
                    <span id="wallet-addr" style="font-family:monospace;font-size:0.82rem;color:var(--gold);word-break:break-all;flex:1">TRX_ADMIN_WALLET_ADDRESS_HERE</span>
                    <button onclick="copyToClipboard(document.getElementById('wallet-addr').textContent)" style="background:transparent;color:var(--gold);font-size:0.75rem;white-space:nowrap;border:none;cursor:pointer">📋 Copy</button>
                  </div>
                </div>
              </div>
              
              <!-- Step 2 -->
              <div style="display:flex;gap:16px;align-items:flex-start;padding:16px;background:rgba(255,255,255,0.02);border-radius:12px">
                <div style="width:32px;height:32px;border-radius:50%;background:var(--gold);color:var(--orbit-deep);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;flex-shrink:0">2</div>
                <div>
                  <p style="font-weight:600;margin-bottom:4px">Copy your Transaction Hash (TxID) from your wallet</p>
                  <p style="font-size:0.85rem;color:var(--text-secondary)">After sending, copy the transaction hash from your USDT wallet</p>
                </div>
              </div>
              
              <!-- Step 3 -->
              <div style="display:flex;gap:16px;align-items:flex-start;padding:16px;background:rgba(255,255,255,0.02);border-radius:12px">
                <div style="width:32px;height:32px;border-radius:50%;background:var(--gold);color:var(--orbit-deep);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;flex-shrink:0">3</div>
                <div style="flex:1">
                  <p style="font-weight:600;margin-bottom:8px">Paste Transaction Hash below & submit</p>
                  <div class="form-group" style="margin-bottom:0">
                    <input type="text" id="tx-hash" class="form-input" placeholder="e.g. abc123def456..." style="font-family:monospace">
                    <span class="form-error" id="tx-hash-error"></span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Warning -->
            <div style="margin-top:20px;padding:14px;background:rgba(239,35,60,0.06);border:1px solid rgba(239,35,60,0.2);border-radius:var(--radius-sm)">
              <p style="font-size:0.82rem;color:var(--accent-red);line-height:1.6">
                ⚠️ Send exactly 167 USDT on TRC-20 network. Wrong amount or wrong network will result in permanent loss. No refunds.
              </p>
            </div>
            
            <button id="invest-btn" class="btn btn-primary btn-full btn-lg" onclick="submitInvestment()" style="margin-top:20px">
              🚀 Confirm Investment
            </button>
          </div>
          
          <!-- Investment History -->
          <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:20px 24px;border-bottom:1px solid var(--glass-border)">
              <h3 style="font-family:var(--font-display);font-weight:700">Investment History</h3>
            </div>
            <div id="invest-history">
              <div style="padding:32px;text-align:center;color:var(--text-muted)">
                <div class="loader" style="margin:0 auto 12px"></div>
                Loading…
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `;
  
  setupSidebarToggle();
  
  // Check KYC
  const kycOk = await checkKycBeforeAction('investing');
  if (!kycOk) return;
  
  // Load plan & history
  loadInvestData();
  
  window.submitInvestment = async () => {
    const txHash = document.getElementById('tx-hash').value.trim();
    const btn = document.getElementById('invest-btn');
    
    document.getElementById('tx-hash').classList.remove('error');
    document.getElementById('tx-hash-error').textContent = '';
    
    if (!txHash || txHash.length < 20) {
      document.getElementById('tx-hash').classList.add('error');
      document.getElementById('tx-hash-error').textContent = 'Enter valid transaction hash';
      return;
    }
    
    setButtonLoading(btn, true, 'Verifying transaction…');
    const res = await InvestmentAPI.invest(txHash);
    setButtonLoading(btn, false);
    
    if (res.success) {
      showToast('Investment submitted! Pending admin verification.', 'success', 'Submitted');
      document.getElementById('tx-hash').value = '';
      loadInvestData();
    } else {
      showToast(res.error || 'Submission failed. Check hash and try again.', 'error');
    }
  };
}

async function loadInvestData() {
  const planRes = await InvestmentAPI.getPlan();
  if (planRes.success) {
    const addr = planRes.data?.wallet_address;
    if (addr) document.getElementById('wallet-addr').textContent = addr;
  }
  
  const histRes = await InvestmentAPI.getHistory();
  const el = document.getElementById('invest-history');
  
  if (el) {
    if (histRes.success && histRes.data?.length > 0) {
      el.innerHTML = `
        <div class="table-wrap" style="border:none;border-radius:0">
          <table>
            <thead><tr><th>Amount</th><th>Tx Hash</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              ${histRes.data.map(inv => `
                <tr>
                  <td class="text-gold font-semibold">${inv.amount} USDT</td>
                  <td style="font-family:monospace;font-size:0.78rem;color:var(--text-muted)">${inv.tx_hash ? inv.tx_hash.slice(0,20)+'…' : '—'}</td>
                  <td style="font-size:0.82rem;color:var(--text-secondary)">${formatDate(inv.created_at)}</td>
                  <td><span class="badge badge-${inv.status === 'approved' ? 'green' : inv.status === 'pending' ? 'gold' : 'red'}">${inv.status || 'pending'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted)">No investments yet</div>`;
    }
  }
}

export { renderInvest };
