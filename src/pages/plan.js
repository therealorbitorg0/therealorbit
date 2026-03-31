// ================================
// TRO – Plan Page
// ================================

import { navigate } from '../router.js';

function renderPlan() {
  const root = document.getElementById('app');
  
  root.innerHTML = `
    <div class="bg-grid"></div>
    <div class="bg-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
    </div>
    
    <!-- NAV -->
    <nav class="navbar scrolled">
      <div class="nav-inner">
        <div class="nav-logo" onclick="navigate('home')" style="cursor:pointer">🪐 TRO</div>
        <ul class="nav-links">
          <li><a onclick="navigate('home')" style="cursor:pointer">Home</a></li>
          <li><a style="color:var(--gold)">Plan</a></li>
        </ul>
        <div class="nav-actions">
          <button class="btn btn-secondary btn-sm" onclick="navigate('login')">Login</button>
          <button class="btn btn-primary btn-sm" onclick="navigate('register')">Join Now</button>
        </div>
      </div>
    </nav>
    
    <div style="min-height:100vh;padding:120px 0 80px;position:relative;z-index:1">
      <div class="container">
        
        <!-- Header -->
        <div style="text-align:center;margin-bottom:48px">
          <div class="section-tag" style="margin:0 auto 16px">📋 The Plan</div>
          <h1 class="section-title" style="margin-bottom:16px">TRO <span class="highlight">Reward Plan</span></h1>
          <p class="section-subtitle" style="margin:0 auto 32px">Understand exactly how you earn with The Real Orbit</p>
          
          <!-- THEME TOGGLE -->
          <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:8px">
            <span style="font-size:0.9rem;color:var(--text-secondary)">Plan Theme:</span>
            <div class="plan-toggle-bar">
              <button class="plan-toggle-btn active" id="toggle-dark" onclick="setPlanTheme('dark')">🌙 Dark</button>
              <button class="plan-toggle-btn" id="toggle-white" onclick="setPlanTheme('white')">☀️ Light</button>
            </div>
          </div>
        </div>
        
        <!-- PLAN CONTENT WRAPPER -->
        <div id="plan-wrapper">
          
          <!-- ENTRY SECTION -->
          <div class="plan-card" id="entry-card" style="margin-bottom:28px;text-align:center;padding:48px">
            <div style="font-size:3rem;margin-bottom:20px">🚀</div>
            <h2 style="font-family:var(--font-display);font-size:2rem;font-weight:800;margin-bottom:12px">Entry Investment</h2>
            <div style="font-family:var(--font-display);font-size:5rem;font-weight:900;color:var(--gold);line-height:1;margin-bottom:8px">167
              <span style="font-size:2rem;color:var(--text-secondary);font-weight:400">USDT</span>
            </div>
            <p style="color:var(--text-secondary);font-size:1.1rem;margin-bottom:28px">One-time investment • Lifetime ID • No renewals</p>
            <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
              <div class="badge badge-green" style="padding:8px 20px;font-size:0.9rem">♾️ Lifetime Access</div>
              <div class="badge badge-gold" style="padding:8px 20px;font-size:0.9rem">🔒 KYC Required</div>
              <div class="badge badge-red" style="padding:8px 20px;font-size:0.9rem">❌ No Refunds</div>
            </div>
          </div>
          
          <!-- 3 INCOME TYPES -->
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:28px" class="income-grid">
            
            <!-- Pension -->
            <div class="plan-card income-card" style="border-color:rgba(255,209,102,0.3)">
              <div style="font-size:2rem;margin-bottom:16px">🏛️</div>
              <h3 style="font-family:var(--font-display);font-size:1.2rem;font-weight:800;color:var(--gold);margin-bottom:8px">Monthly Pension</h3>
              <div style="font-family:var(--font-display);font-size:2.5rem;font-weight:900;margin-bottom:16px">$100
                <span style="font-size:0.9rem;color:var(--text-secondary);font-weight:400">/mo</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:10px">
                <div class="plan-row">
                  <span>Trigger</span>
                  <span style="color:var(--gold);font-weight:600">Group Completion</span>
                </div>
                <div class="plan-row">
                  <span>Group Size</span>
                  <span style="color:var(--gold);font-weight:600">10,000 IDs</span>
                </div>
                <div class="plan-row">
                  <span>Monthly Condition</span>
                  <span style="color:var(--gold);font-weight:600">2 Direct Referrals</span>
                </div>
                <div class="plan-row">
                  <span>Payment</span>
                  <span style="color:var(--gold);font-weight:600">USDT</span>
                </div>
              </div>
            </div>
            
            <!-- Referral -->
            <div class="plan-card income-card" style="border-color:rgba(0,212,255,0.3);background:linear-gradient(135deg,rgba(0,212,255,0.05),rgba(123,47,190,0.03))">
              <div style="font-size:2rem;margin-bottom:16px">🔗</div>
              <h3 style="font-family:var(--font-display);font-size:1.2rem;font-weight:800;color:var(--accent-cyan);margin-bottom:8px">Referral Income</h3>
              <div style="font-family:var(--font-display);font-size:2.5rem;font-weight:900;color:var(--accent-cyan);margin-bottom:16px">15%
                <span style="font-size:0.9rem;color:var(--text-secondary);font-weight:400">direct</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:10px">
                <div class="plan-row">
                  <span>Type</span>
                  <span style="color:var(--accent-cyan);font-weight:600">Direct Only</span>
                </div>
                <div class="plan-row">
                  <span>On Entry of</span>
                  <span style="color:var(--accent-cyan);font-weight:600">167 USDT</span>
                </div>
                <div class="plan-row">
                  <span>Earn Per Joining</span>
                  <span style="color:var(--accent-cyan);font-weight:600">$25.05</span>
                </div>
                <div class="plan-row">
                  <span>Claim Frequency</span>
                  <span style="color:var(--accent-cyan);font-weight:600">Once/Month</span>
                </div>
              </div>
            </div>
            
            <!-- Fast Income -->
            <div class="plan-card income-card" style="border-color:rgba(6,214,160,0.3);background:linear-gradient(135deg,rgba(6,214,160,0.05),rgba(255,209,102,0.02))">
              <div style="font-size:2rem;margin-bottom:16px">⚡</div>
              <h3 style="font-family:var(--font-display);font-size:1.2rem;font-weight:800;color:var(--accent-green);margin-bottom:8px">Fast Income</h3>
              <div style="font-family:var(--font-display);font-size:2.5rem;font-weight:900;color:var(--accent-green);margin-bottom:16px">$100
                <span style="font-size:0.9rem;color:var(--text-secondary);font-weight:400">bonus</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:10px">
                <div class="plan-row">
                  <span>Requirement</span>
                  <span style="color:var(--accent-green);font-weight:600">4 Referrals/Month</span>
                </div>
                <div class="plan-row">
                  <span>Group Needed</span>
                  <span style="color:var(--accent-green);font-weight:600">No</span>
                </div>
                <div class="plan-row">
                  <span>Payout</span>
                  <span style="color:var(--accent-green);font-weight:600">Instant $100</span>
                </div>
                <div class="plan-row">
                  <span>Reset</span>
                  <span style="color:var(--accent-green);font-weight:600">Monthly</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- GROUP SYSTEM -->
          <div class="plan-card" style="margin-bottom:28px;padding:40px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center">
              <div>
                <div style="font-size:2rem;margin-bottom:16px">🌍</div>
                <h2 style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;margin-bottom:12px">Global Group System</h2>
                <p style="color:var(--text-secondary);line-height:1.8;margin-bottom:20px">
                  TRO operates a global chain structure with groups labeled A through Z. 
                  Users are automatically placed in groups. When a group reaches 10,000 IDs, 
                  it is marked as complete and monthly pension payments begin.
                </p>
                <div style="display:flex;flex-direction:column;gap:8px">
                  ${[
                    ['Groups', 'A through Z (26 groups)'],
                    ['Completion', '10,000 IDs per group'],
                    ['Placement', 'Automatic chain placement'],
                    ['Scope', 'Global participants'],
                  ].map(([k,v]) => `
                    <div class="plan-row">
                      <span>${k}</span>
                      <span style="color:var(--gold);font-weight:600">${v}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px">
                ${['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map((g, i) => `
                  <div style="
                    aspect-ratio:1;
                    background:${i < 3 ? 'rgba(255,209,102,0.2)' : 'rgba(255,255,255,0.04)'};
                    border:1px solid ${i < 3 ? 'rgba(255,209,102,0.4)' : 'rgba(255,255,255,0.08)'};
                    border-radius:8px;
                    display:flex;align-items:center;justify-content:center;
                    font-family:var(--font-display);font-weight:700;font-size:0.85rem;
                    color:${i < 3 ? 'var(--gold)' : 'var(--text-muted)'};
                  ">${g}</div>
                `).join('')}
              </div>
            </div>
          </div>
          
          <!-- RULES GRID -->
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:28px">
            ${[
              { icon: '📋', title: 'Claim Rule', color: 'var(--gold)', desc: 'Referral income must be claimed once per month. If unclaimed before month end, the income expires and cannot be recovered.' },
              { icon: '🚫', title: 'No Refund Policy', color: 'var(--accent-red)', desc: 'Once payment is made, no refunds are issued under any circumstances. Please invest only after reading all terms.' },
              { icon: '🔗', title: 'No Level System', color: 'var(--accent-cyan)', desc: 'TRO has no multi-level or matrix structure. Income is earned through direct referrals only — straightforward and transparent.' },
              { icon: '✅', title: 'User Responsibility', color: 'var(--accent-green)', desc: 'Users must stay active, bring minimum 2 referrals/month to maintain pension eligibility, and claim income on time.' },
            ].map(r => `
              <div class="card rule-card" style="padding:28px;border-left:3px solid ${r.color}">
                <div style="font-size:1.5rem;margin-bottom:12px">${r.icon}</div>
                <h3 style="font-family:var(--font-display);font-size:1rem;font-weight:700;color:${r.color};margin-bottom:8px">${r.title}</h3>
                <p style="color:var(--text-secondary);font-size:0.88rem;line-height:1.7">${r.desc}</p>
              </div>
            `).join('')}
          </div>
          
          <!-- EARNINGS CALCULATOR -->
          <div class="plan-card" style="padding:40px;margin-bottom:28px">
            <h2 style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;margin-bottom:8px">💡 Earnings Estimator</h2>
            <p style="color:var(--text-secondary);margin-bottom:28px">See your potential monthly income based on referrals</p>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start">
              <div>
                <div class="form-group">
                  <label class="form-label">Monthly Direct Referrals</label>
                  <input type="range" id="ref-slider" min="0" max="20" value="4" 
                    style="width:100%;accent-color:var(--gold);height:6px;cursor:pointer"
                    oninput="calcEarnings()">
                  <div style="display:flex;justify-content:space-between;margin-top:6px">
                    <span style="font-size:0.75rem;color:var(--text-muted)">0</span>
                    <span id="ref-count" style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--gold)">4</span>
                    <span style="font-size:0.75rem;color:var(--text-muted)">20</span>
                  </div>
                </div>
                
                <div style="display:flex;flex-direction:column;gap:2px;margin-top:8px">
                  <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px;border-radius:8px;transition:background 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                    <input type="checkbox" id="pension-check" checked onchange="calcEarnings()" style="accent-color:var(--gold)">
                    <span style="font-size:0.9rem">Group completed (pension active)</span>
                  </label>
                </div>
              </div>
              
              <div style="display:flex;flex-direction:column;gap:12px">
                <div style="padding:16px;background:rgba(255,209,102,0.06);border:1px solid rgba(255,209,102,0.15);border-radius:var(--radius-sm)">
                  <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:4px">Referral Income (15%)</div>
                  <div id="calc-referral" style="font-family:var(--font-display);font-size:1.6rem;font-weight:800;color:var(--gold)">$100.20</div>
                </div>
                <div style="padding:16px;background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.15);border-radius:var(--radius-sm)">
                  <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:4px">Monthly Pension</div>
                  <div id="calc-pension" style="font-family:var(--font-display);font-size:1.6rem;font-weight:800;color:var(--accent-cyan)">$100.00</div>
                </div>
                <div style="padding:16px;background:rgba(6,214,160,0.06);border:1px solid rgba(6,214,160,0.15);border-radius:var(--radius-sm)">
                  <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:4px">Fast Income Bonus</div>
                  <div id="calc-fast" style="font-family:var(--font-display);font-size:1.6rem;font-weight:800;color:var(--accent-green)">$100.00</div>
                </div>
                <div style="padding:20px;background:linear-gradient(135deg,rgba(255,209,102,0.1),rgba(0,212,255,0.05));border:1px solid rgba(255,209,102,0.25);border-radius:var(--radius-sm)">
                  <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px">Total Monthly Estimate</div>
                  <div id="calc-total" style="font-family:var(--font-display);font-size:2rem;font-weight:900;color:var(--gold)">$300.20</div>
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">*Estimate only. Subject to conditions.</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- CTA -->
          <div style="text-align:center;padding:60px 20px">
            <h2 style="font-family:var(--font-display);font-size:2rem;font-weight:800;margin-bottom:16px">Ready to Join?</h2>
            <p style="color:var(--text-secondary);margin-bottom:32px">Start with 167 USDT. Earn for life.</p>
            <button class="btn btn-primary btn-lg" onclick="navigate('register')" style="min-width:200px">🚀 Register Now</button>
          </div>
          
        </div><!-- end plan-wrapper -->
      </div>
    </div>
  `;
  
  // Inject plan-row styles
  const style = document.createElement('style');
  style.textContent = `
    .plan-row {
      display:flex;justify-content:space-between;align-items:center;
      padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);
      font-size:0.85rem;color:var(--text-secondary);
    }
    .plan-row:last-child { border-bottom:none; }
    
    /* LIGHT THEME */
    .plan-light-theme {
      background:#F8F9FF !important;
      color:#1a1a2e !important;
    }
    .plan-light-theme .plan-card {
      background:white !important;
      border-color:rgba(0,0,0,0.1) !important;
      box-shadow:0 4px 24px rgba(0,0,0,0.08) !important;
    }
    .plan-light-theme .income-card {
      background:white !important;
    }
    .plan-light-theme .card {
      background:white !important;
      border-color:rgba(0,0,0,0.08) !important;
    }
    .plan-light-theme .plan-row {
      border-color:rgba(0,0,0,0.08) !important;
      color:#555 !important;
    }
    .plan-light-theme h1, .plan-light-theme h2, .plan-light-theme h3 {
      color:#1a1a2e !important;
    }
    .plan-light-theme p, .plan-light-theme .section-subtitle {
      color:#555 !important;
    }
    .plan-light-theme .form-label, .plan-light-theme .form-input {
      color:#1a1a2e !important;
      background:rgba(0,0,0,0.04) !important;
      border-color:rgba(0,0,0,0.15) !important;
    }
    .plan-light-theme [style*="rgba(255,255,255,0.04)"],
    .plan-light-theme [style*="rgba(255,255,255,0.02)"] {
      background:rgba(0,0,0,0.04) !important;
    }
    .plan-light-theme [style*="rgba(255,255,255,0.08)"] {
      background:rgba(0,0,0,0.06) !important;
    }
    
    @media(max-width:768px) {
      .income-grid { grid-template-columns:1fr!important; }
    }
  `;
  document.head.appendChild(style);
  
  // Calculator
  window.calcEarnings = () => {
    const refs = parseInt(document.getElementById('ref-slider').value);
    const pensionActive = document.getElementById('pension-check').checked;
    
    document.getElementById('ref-count').textContent = refs;
    
    const refIncome = refs * 167 * 0.15;
    const pension = (pensionActive && refs >= 2) ? 100 : 0;
    const fast = refs >= 4 ? 100 : 0;
    const total = refIncome + pension + fast;
    
    document.getElementById('calc-referral').textContent = `$${refIncome.toFixed(2)}`;
    document.getElementById('calc-pension').textContent = pension > 0 ? '$100.00' : '$0.00';
    document.getElementById('calc-fast').textContent = fast > 0 ? '$100.00' : '$0.00';
    document.getElementById('calc-total').textContent = `$${total.toFixed(2)}`;
  };
  
  // Initial calc
  setTimeout(calcEarnings, 100);
  
  // Theme toggle
  window.setPlanTheme = (theme) => {
    const wrapper = document.getElementById('plan-wrapper');
    const darkBtn = document.getElementById('toggle-dark');
    const lightBtn = document.getElementById('toggle-white');
    
    if (theme === 'white') {
      wrapper.classList.add('plan-light-theme');
      wrapper.style.background = '#F8F9FF';
      wrapper.style.borderRadius = '20px';
      wrapper.style.padding = '32px';
      lightBtn.classList.add('active');
      darkBtn.classList.remove('active');
    } else {
      wrapper.classList.remove('plan-light-theme');
      wrapper.style.background = '';
      wrapper.style.padding = '';
      darkBtn.classList.add('active');
      lightBtn.classList.remove('active');
    }
  };
}

export { renderPlan };
