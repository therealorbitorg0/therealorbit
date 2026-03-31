// ================================
// TRO – Home / Landing Page
// ================================

import { navigate } from '../router.js';

function renderHome() {
  const root = document.getElementById('app');
  
  root.innerHTML = `
    <!-- BG Effects -->
    <div class="bg-grid"></div>
    <div class="bg-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <!-- NAVBAR -->
    <nav class="navbar" id="navbar">
      <div class="nav-inner">
        <div class="nav-logo" onclick="navigate('home')">🪐 TRO</div>
        <ul class="nav-links">
          <li><a href="#features" onclick="scrollTo('features')">How It Works</a></li>
          <li><a href="#plan" onclick="navigate('plan')">The Plan</a></li>
          <li><a href="#earnings">Earnings</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <div class="nav-actions">
          <button class="btn btn-secondary btn-sm" onclick="navigate('login')">Login</button>
          <button class="btn btn-primary btn-sm" onclick="navigate('register')">Join Now</button>
        </div>
        <button class="nav-hamburger" id="hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>

    <!-- HERO SECTION -->
    <section class="hero" style="min-height:100vh;display:flex;align-items:center;padding:100px 0 60px;position:relative;z-index:1">
      <div class="container">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center">
          
          <div class="hero-content" style="animation:slideUp 0.8s ease">
            <div class="section-tag">🌍 Global Reward Platform</div>
            <h1 class="section-title" style="margin-bottom:24px">
              Your Orbit<br>
              <span class="highlight">Towards</span><br>
              Financial Freedom
            </h1>
            <p class="section-subtitle" style="margin-bottom:40px">
              Join TRO — a global structured reward platform delivering monthly pension income, direct referral bonuses, and fast-income rewards. One-time entry. Lifetime opportunity.
            </p>
            
            <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:48px">
              <button class="btn btn-primary btn-lg" onclick="navigate('register')">
                🚀 Start Your Orbit
              </button>
              <button class="btn btn-secondary btn-lg" onclick="navigate('plan')">
                📋 View Plan
              </button>
            </div>
            
            <!-- Quick Stats -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
              <div class="stat-pill card" style="padding:16px;text-align:center">
                <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--gold)">167</div>
                <div style="font-size:0.75rem;color:var(--text-secondary)">USDT Entry</div>
              </div>
              <div class="stat-pill card" style="padding:16px;text-align:center">
                <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--accent-green)">15%</div>
                <div style="font-size:0.75rem;color:var(--text-secondary)">Direct Referral</div>
              </div>
              <div class="stat-pill card" style="padding:16px;text-align:center">
                <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--accent-cyan)">$100</div>
                <div style="font-size:0.75rem;color:var(--text-secondary)">Monthly Pension</div>
              </div>
            </div>
          </div>
          
          <!-- 3D Globe/Orbit Visual -->
          <div class="hero-visual" style="position:relative;display:flex;align-items:center;justify-content:center;animation:fadeIn 1s ease 0.3s both">
            <div class="orbit-3d-container" style="position:relative;width:400px;height:400px">
              <!-- Outer ring -->
              <div style="
                position:absolute;inset:0;
                border: 1px solid rgba(255,209,102,0.2);
                border-radius:50%;
                animation: rotate 20s linear infinite;
              ">
                <div style="
                  position:absolute;top:-6px;left:50%;transform:translateX(-50%);
                  width:12px;height:12px;
                  background:var(--gold);
                  border-radius:50%;
                  box-shadow:0 0 20px var(--gold);
                "></div>
              </div>
              
              <!-- Middle ring -->
              <div style="
                position:absolute;inset:60px;
                border: 1px solid rgba(0,212,255,0.25);
                border-radius:50%;
                animation: rotate 12s linear infinite reverse;
              ">
                <div style="
                  position:absolute;bottom:-6px;right:20px;
                  width:10px;height:10px;
                  background:var(--accent-cyan);
                  border-radius:50%;
                  box-shadow:0 0 16px var(--accent-cyan);
                "></div>
              </div>
              
              <!-- Inner ring -->
              <div style="
                position:absolute;inset:120px;
                border: 1px solid rgba(123,47,190,0.3);
                border-radius:50%;
                animation: rotate 8s linear infinite;
              ">
                <div style="
                  position:absolute;top:20px;right:-5px;
                  width:8px;height:8px;
                  background:#B87FFF;
                  border-radius:50%;
                  box-shadow:0 0 12px #B87FFF;
                "></div>
              </div>
              
              <!-- Center Globe -->
              <div style="
                position:absolute;inset:0;
                display:flex;align-items:center;justify-content:center;
              ">
                <div style="
                  width:160px;height:160px;
                  background:radial-gradient(circle at 35% 35%, #1a2f5a, var(--orbit-deep));
                  border-radius:50%;
                  box-shadow:
                    0 0 60px rgba(255,209,102,0.15),
                    inset 0 0 40px rgba(255,209,102,0.08),
                    0 20px 60px rgba(0,0,0,0.5);
                  display:flex;flex-direction:column;
                  align-items:center;justify-content:center;
                  font-family:var(--font-display);
                ">
                  <div style="font-size:2.5rem">🌐</div>
                  <div style="font-weight:800;font-size:0.9rem;color:var(--gold);letter-spacing:0.08em">TRO</div>
                </div>
              </div>
              
              <!-- Floating badges -->
              <div style="
                position:absolute;top:20px;right:-20px;
                background:rgba(6,214,160,0.15);
                border:1px solid rgba(6,214,160,0.4);
                border-radius:12px;padding:8px 14px;
                backdrop-filter:blur(10px);
                animation:float 3s ease-in-out infinite;
              ">
                <div style="font-size:0.7rem;color:var(--accent-green);font-weight:600">PENSION</div>
                <div style="font-family:var(--font-display);font-size:1.1rem;font-weight:800;color:white">$100/mo</div>
              </div>
              
              <div style="
                position:absolute;bottom:30px;left:-30px;
                background:rgba(255,209,102,0.1);
                border:1px solid rgba(255,209,102,0.3);
                border-radius:12px;padding:8px 14px;
                backdrop-filter:blur(10px);
                animation:float 3.5s ease-in-out infinite 0.5s;
              ">
                <div style="font-size:0.7rem;color:var(--gold);font-weight:600">REFERRAL</div>
                <div style="font-family:var(--font-display);font-size:1.1rem;font-weight:800;color:white">15% Direct</div>
              </div>
              
              <div style="
                position:absolute;bottom:80px;right:-10px;
                background:rgba(0,212,255,0.1);
                border:1px solid rgba(0,212,255,0.3);
                border-radius:12px;padding:8px 14px;
                backdrop-filter:blur(10px);
                animation:float 4s ease-in-out infinite 1s;
              ">
                <div style="font-size:0.7rem;color:var(--accent-cyan);font-weight:600">FAST INCOME</div>
                <div style="font-family:var(--font-display);font-size:1.1rem;font-weight:800;color:white">4 Joinings</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MARQUEE / TICKER -->
    <div style="background:rgba(255,209,102,0.08);border-top:1px solid rgba(255,209,102,0.1);border-bottom:1px solid rgba(255,209,102,0.1);padding:12px 0;overflow:hidden;position:relative;z-index:1">
      <div class="marquee-track" style="display:flex;gap:60px;white-space:nowrap;animation:marquee 20s linear infinite">
        ${['🌍 Global Platform', '💰 167 USDT Entry', '♾️ Lifetime ID', '📊 Groups A to Z', '💵 $100 Monthly Pension', '🔗 15% Direct Referral', '⚡ Fast Income Rule', '🔒 KYC Verified', '🌐 Safe & Secure'].map(i => `<span style="color:var(--gold);font-weight:600;font-size:0.9rem">${i}</span>`).join('')}
        ${['🌍 Global Platform', '💰 167 USDT Entry', '♾️ Lifetime ID', '📊 Groups A to Z', '💵 $100 Monthly Pension', '🔗 15% Direct Referral'].map(i => `<span style="color:var(--gold);font-weight:600;font-size:0.9rem">${i}</span>`).join('')}
      </div>
    </div>

    <!-- HOW IT WORKS -->
    <section id="features" style="padding:100px 0;position:relative;z-index:1">
      <div class="container">
        <div style="text-align:center;margin-bottom:64px">
          <div class="section-tag">⚙️ Process</div>
          <h2 class="section-title">How TRO Works</h2>
          <p class="section-subtitle" style="margin:16px auto 0">Simple steps to start earning globally</p>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:24px">
          ${[
            { step: '01', icon: '📝', title: 'Register', desc: 'Create your account with basic details. Quick and secure signup process.' },
            { step: '02', icon: '🔐', title: 'Complete KYC', desc: 'Verify your identity with Aadhaar & PAN card. Takes just minutes.' },
            { step: '03', icon: '💰', title: 'Invest 167 USDT', desc: 'One-time payment activates your lifetime ID in the global chain.' },
            { step: '04', icon: '🌍', title: 'Join Your Group', desc: 'Auto-placed in Groups A-Z. Group completes at 10,000 members.' },
            { step: '05', icon: '💵', title: 'Earn Monthly', desc: 'Receive $100 pension monthly. Bring 2 referrals to maintain eligibility.' },
            { step: '06', icon: '🚀', title: 'Fast Income', desc: '4 referrals/month = $100 instantly regardless of group completion.' },
          ].map(s => `
            <div class="card card-3d-hover" style="padding:28px;position:relative;overflow:hidden">
              <div style="
                position:absolute;top:16px;right:16px;
                font-family:var(--font-display);
                font-size:3rem;font-weight:800;
                color:rgba(255,209,102,0.06);
                line-height:1;
              ">${s.step}</div>
              <div style="
                width:52px;height:52px;
                background:rgba(255,209,102,0.1);
                border-radius:14px;
                display:flex;align-items:center;justify-content:center;
                font-size:1.5rem;margin-bottom:16px;
              ">${s.icon}</div>
              <h3 style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;margin-bottom:8px">${s.title}</h3>
              <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.6">${s.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- EARNINGS SECTION -->
    <section id="earnings" style="padding:100px 0;background:rgba(255,255,255,0.01);border-top:1px solid var(--glass-border);position:relative;z-index:1">
      <div class="container">
        <div style="text-align:center;margin-bottom:64px">
          <div class="section-tag">💰 Income</div>
          <h2 class="section-title">Three Ways to <span class="highlight">Earn</span></h2>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px">
          
          <div class="plan-card" style="--accent:var(--gold)">
            <div style="font-size:2.5rem;margin-bottom:20px">🏛️</div>
            <h3 style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--gold);margin-bottom:12px">Monthly Pension</h3>
            <div style="font-family:var(--font-display);font-size:3rem;font-weight:900;margin-bottom:8px">$100
              <span style="font-size:1rem;color:var(--text-secondary);font-weight:400">/ month</span>
            </div>
            <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.7;margin-bottom:20px">Received when your group reaches 10,000 IDs. Requires minimum 2 direct referrals per month to maintain.</p>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:8px">
              <li style="display:flex;gap:8px;align-items:center;font-size:0.875rem"><span style="color:var(--accent-green)">✓</span>Group completion trigger</li>
              <li style="display:flex;gap:8px;align-items:center;font-size:0.875rem"><span style="color:var(--accent-green)">✓</span>2 referrals/month required</li>
              <li style="display:flex;gap:8px;align-items:center;font-size:0.875rem"><span style="color:var(--accent-green)">✓</span>Paid in USDT</li>
            </ul>
          </div>
          
          <div class="plan-card" style="border-color:rgba(0,212,255,0.3);background:linear-gradient(135deg,rgba(0,212,255,0.05),rgba(123,47,190,0.03))">
            <div style="font-size:2.5rem;margin-bottom:20px">🔗</div>
            <h3 style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--accent-cyan);margin-bottom:12px">Referral Income</h3>
            <div style="font-family:var(--font-display);font-size:3rem;font-weight:900;margin-bottom:8px;color:var(--accent-cyan)">15%
              <span style="font-size:1rem;color:var(--text-secondary);font-weight:400">direct</span>
            </div>
            <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.7;margin-bottom:20px">Earn 15% direct referral income on every joining from your link. Must be claimed once per month or it expires.</p>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:8px">
              <li style="display:flex;gap:8px;align-items:center;font-size:0.875rem"><span style="color:var(--accent-green)">✓</span>No multi-level system</li>
              <li style="display:flex;gap:8px;align-items:center;font-size:0.875rem"><span style="color:var(--accent-green)">✓</span>Claim monthly</li>
              <li style="display:flex;gap:8px;align-items:center;font-size:0.875rem"><span style="color:var(--accent-green)">✓</span>Direct only</li>
            </ul>
          </div>
          
          <div class="plan-card" style="border-color:rgba(6,214,160,0.3);background:linear-gradient(135deg,rgba(6,214,160,0.05),rgba(255,209,102,0.03))">
            <div style="font-size:2.5rem;margin-bottom:20px">⚡</div>
            <h3 style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--accent-green);margin-bottom:12px">Fast Income</h3>
            <div style="font-family:var(--font-display);font-size:3rem;font-weight:900;margin-bottom:8px;color:var(--accent-green)">$100
              <span style="font-size:1rem;color:var(--text-secondary);font-weight:400">instant</span>
            </div>
            <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.7;margin-bottom:20px">Bring 4 direct referrals in a single month and receive $100 instantly — regardless of your group's completion status.</p>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:8px">
              <li style="display:flex;gap:8px;align-items:center;font-size:0.875rem"><span style="color:var(--accent-green)">✓</span>No group needed</li>
              <li style="display:flex;gap:8px;align-items:center;font-size:0.875rem"><span style="color:var(--accent-green)">✓</span>4 joinings = $100</li>
              <li style="display:flex;gap:8px;align-items:center;font-size:0.875rem"><span style="color:var(--accent-green)">✓</span>Monthly reset</li>
            </ul>
          </div>
          
        </div>
      </div>
    </section>

    <!-- FAQ SECTION -->
    <section id="faq" style="padding:100px 0;position:relative;z-index:1">
      <div class="container container-sm">
        <div style="text-align:center;margin-bottom:56px">
          <div class="section-tag">❓ FAQ</div>
          <h2 class="section-title">Common Questions</h2>
        </div>
        
        <div id="faq-list" style="display:flex;flex-direction:column;gap:12px">
          ${[
            { q: 'What is the entry investment?', a: 'One-time investment of 167 USDT activates your Lifetime ID. No recurring fees.' },
            { q: 'How do I receive the $100 monthly pension?', a: 'Your group must reach 10,000 IDs (group completion) AND you must bring minimum 2 direct referrals that month. Alternatively, bring 4 direct referrals for Fast Income regardless of group status.' },
            { q: 'What documents are needed for KYC?', a: 'You need Aadhaar Card and PAN Card for identity verification. KYC must be approved before you can invest.' },
            { q: 'Is there a refund policy?', a: 'No refunds are available after payment. Please read all terms carefully before investing.' },
            { q: 'What is the referral income structure?', a: 'TRO offers a flat 15% direct referral income on each joining. There is no multi-level or matrix system — only direct referrals.' },
            { q: 'When must I claim referral income?', a: 'Referral income must be claimed once per month. If unclaimed, it expires at month end.' },
            { q: 'How are groups structured?', a: 'Groups are labeled A through Z globally. Users are placed automatically in a chain structure. A group completes when it reaches 10,000 IDs.' },
          ].map((item, i) => `
            <div class="card faq-item" style="overflow:hidden" id="faq-${i}">
              <button onclick="toggleFaq(${i})" style="
                width:100%;padding:20px 24px;
                display:flex;align-items:center;justify-content:space-between;
                background:transparent;color:var(--text-primary);
                font-size:1rem;font-weight:600;text-align:left;
                gap:16px;
              ">
                <span>${item.q}</span>
                <span class="faq-icon" id="faq-icon-${i}" style="color:var(--gold);font-size:1.2rem;transition:transform 0.3s;flex-shrink:0">+</span>
              </button>
              <div class="faq-body" id="faq-body-${i}" style="max-height:0;overflow:hidden;transition:max-height 0.3s ease">
                <p style="padding:0 24px 20px;color:var(--text-secondary);line-height:1.7;font-size:0.95rem">${item.a}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- CTA SECTION -->
    <section style="padding:100px 0;position:relative;z-index:1">
      <div class="container">
        <div style="
          background:linear-gradient(135deg,rgba(255,209,102,0.08),rgba(0,212,255,0.05));
          border:1px solid rgba(255,209,102,0.2);
          border-radius:var(--radius-lg);
          padding:80px 40px;
          text-align:center;
          position:relative;overflow:hidden;
        ">
          <div style="
            position:absolute;top:-80px;right:-80px;
            width:300px;height:300px;
            background:radial-gradient(circle,rgba(255,209,102,0.1),transparent 70%);
            border-radius:50%;pointer-events:none;
          "></div>
          
          <div class="section-tag" style="margin:0 auto 20px">🪐 Join Today</div>
          <h2 class="section-title" style="margin-bottom:20px">Ready to Enter <span class="highlight">Your Orbit?</span></h2>
          <p class="section-subtitle" style="margin:0 auto 40px">
            Start your journey with 167 USDT and unlock lifetime access to global rewards.
          </p>
          <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
            <button class="btn btn-primary btn-lg" onclick="navigate('register')">🚀 Register Now</button>
            <button class="btn btn-secondary btn-lg" onclick="navigate('plan')">📋 View Full Plan</button>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer style="background:var(--orbit-navy);border-top:1px solid var(--glass-border);padding:48px 0;position:relative;z-index:1">
      <div class="container">
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:40px;margin-bottom:40px">
          <div>
            <div class="nav-logo" style="margin-bottom:16px">🪐 TRO</div>
            <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.7;max-width:300px">
              The Real Orbit — a global reward-based platform designed for passive income generation through a structured participation system.
            </p>
          </div>
          <div>
            <div style="font-weight:700;margin-bottom:16px;font-family:var(--font-display)">Platform</div>
            <div style="display:flex;flex-direction:column;gap:10px">
              <a onclick="navigate('plan')" style="color:var(--text-secondary);cursor:pointer;transition:color 0.2s;font-size:0.9rem" onmouseover="this.style.color='var(--gold)'" onmouseout="this.style.color='var(--text-secondary)'">The Plan</a>
              <a onclick="navigate('register')" style="color:var(--text-secondary);cursor:pointer;transition:color 0.2s;font-size:0.9rem" onmouseover="this.style.color='var(--gold)'" onmouseout="this.style.color='var(--text-secondary)'">Register</a>
              <a onclick="navigate('login')" style="color:var(--text-secondary);cursor:pointer;transition:color 0.2s;font-size:0.9rem" onmouseover="this.style.color='var(--gold)'" onmouseout="this.style.color='var(--text-secondary)'">Login</a>
            </div>
          </div>
          <div>
            <div style="font-weight:700;margin-bottom:16px;font-family:var(--font-display)">Legal</div>
            <div style="display:flex;flex-direction:column;gap:10px">
              <a style="color:var(--text-secondary);font-size:0.9rem">Terms & Conditions</a>
              <a style="color:var(--text-secondary);font-size:0.9rem">Privacy Policy</a>
              <a style="color:var(--text-secondary);font-size:0.9rem">No Refund Policy</a>
            </div>
          </div>
        </div>
        <div style="border-top:1px solid var(--glass-border);padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <p style="color:var(--text-muted);font-size:0.85rem">© 2025 The Real Orbit (TRO). All rights reserved.</p>
          <p style="color:var(--text-muted);font-size:0.85rem">Investment involves risk. Read terms before investing.</p>
        </div>
      </div>
    </footer>
  `;
  
  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });
  
  // FAQ toggle
  window.toggleFaq = (i) => {
    const body = document.getElementById(`faq-body-${i}`);
    const icon = document.getElementById(`faq-icon-${i}`);
    const isOpen = body.style.maxHeight !== '0px' && body.style.maxHeight !== '';
    
    // Close all
    document.querySelectorAll('.faq-body').forEach(b => b.style.maxHeight = '0px');
    document.querySelectorAll('.faq-icon').forEach(ic => { ic.textContent = '+'; ic.style.transform = ''; });
    
    if (!isOpen) {
      body.style.maxHeight = body.scrollHeight + 'px';
      icon.textContent = '−';
      icon.style.transform = 'rotate(180deg)';
    }
  };
  
  // Inject keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:none; } }
    @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
    @keyframes rotate { to { transform:rotate(360deg); } }
    @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
    @media (max-width:900px) {
      .hero .container > div { grid-template-columns:1fr!important; }
      .hero-visual { display:none!important; }
      section > div > div[style*="grid-template-columns:repeat(3,1fr)"] { grid-template-columns:1fr!important; }
      footer .container > div[style*="grid-template-columns"] { grid-template-columns:1fr!important; }
    }
  `;
  document.head.appendChild(style);
}

export { renderHome };
