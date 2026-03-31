// ================================
// TRO – App Router & State
// ================================

const AppState = {
  user: null,
  isAdmin: false,
  isLoggedIn: false,
  kycStatus: null, // null | 'pending' | 'approved' | 'rejected'
  currentPage: 'home',
  theme: 'dark',
  
  set(key, value) {
    this[key] = value;
    this._notify(key, value);
  },
  
  _listeners: {},
  
  on(key, fn) {
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(fn);
  },
  
  _notify(key, value) {
    (this._listeners[key] || []).forEach(fn => fn(value));
  }
};

// ===========================
// ROUTER
// ===========================

const routes = {
  // Public
  home: () => import('./pages/home.js').then(m => m.renderHome()),
  login: () => import('./pages/auth.js').then(m => m.renderLogin()),
  register: () => import('./pages/auth.js').then(m => m.renderRegister()),
  'forgot-password': () => import('./pages/auth.js').then(m => m.renderForgotPassword()),
  plan: () => import('./pages/plan.js').then(m => m.renderPlan()),
  
  // User (protected)
  dashboard: () => import('./pages/dashboard.js').then(m => m.renderDashboard()),
  kyc: () => import('./pages/kyc.js').then(m => m.renderKyc()),
  invest: () => import('./pages/invest.js').then(m => m.renderInvest()),
  team: () => import('./pages/team.js').then(m => m.renderTeam()),
  transactions: () => import('./pages/transactions.js').then(m => m.renderTransactions()),
  withdraw: () => import('./pages/withdraw.js').then(m => m.renderWithdraw()),
  profile: () => import('./pages/profile.js').then(m => m.renderProfile()),
  
  // Admin (protected admin)
  'admin/dashboard': () => import('./pages/admin/dashboard.js').then(m => m.renderAdminDashboard()),
  'admin/users': () => import('./pages/admin/users.js').then(m => m.renderAdminUsers()),
  'admin/kyc': () => import('./pages/admin/kyc.js').then(m => m.renderAdminKyc()),
  'admin/withdrawals': () => import('./pages/admin/withdrawals.js').then(m => m.renderAdminWithdrawals()),
  'admin/transactions': () => import('./pages/admin/transactions.js').then(m => m.renderAdminTransactions()),
  'admin/plan': () => import('./pages/admin/plan.js').then(m => m.renderAdminPlan()),
  'admin/settings': () => import('./pages/admin/settings.js').then(m => m.renderAdminSettings()),
  'admin/groups': () => import('./pages/admin/groups.js').then(m => m.renderAdminGroups()),
  'admin/banners': () => import('./pages/admin/banners.js').then(m => m.renderAdminBanners()),
  'admin/login': () => import('./pages/admin/login.js').then(m => m.renderAdminLogin()),
};

const protectedRoutes = [
  'dashboard', 'kyc', 'invest', 'team', 'transactions', 'withdraw', 'profile'
];

const adminRoutes = Object.keys(routes).filter(r => r.startsWith('admin/') && r !== 'admin/login');

async function navigate(page, pushState = true) {
  // Check auth for protected routes
  if (protectedRoutes.includes(page)) {
    const token = localStorage.getItem('tro_token');
    if (!token) {
      navigate('login');
      showToast('Please login to continue', 'warning');
      return;
    }
  }
  
  // Check admin auth
  if (adminRoutes.includes(page)) {
    const adminToken = localStorage.getItem('tro_admin_token');
    if (!adminToken) {
      navigate('admin/login');
      return;
    }
  }
  
  AppState.set('currentPage', page);
  
  if (pushState) {
    history.pushState({ page }, '', `#${page}`);
  }
  
  const root = document.getElementById('app');
  root.innerHTML = '<div class="page-loader"><div class="loader"></div><p style="color:var(--text-secondary);font-size:0.9rem">Loading…</p></div>';
  
  try {
    const render = routes[page];
    if (render) {
      await render();
    } else {
      root.innerHTML = render404();
    }
  } catch (e) {
    console.error('Route error:', e);
    root.innerHTML = render404();
  }
}

function render404() {
  return `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px">
      <div style="font-size:6rem;margin-bottom:16px">🪐</div>
      <h1 class="font-display" style="font-size:3rem;font-weight:800;margin-bottom:12px">404</h1>
      <p style="color:var(--text-secondary);margin-bottom:32px">This orbit doesn't exist</p>
      <button class="btn btn-primary" onclick="navigate('home')">Go Home</button>
    </div>
  `;
}

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
  const page = e.state?.page || 'home';
  navigate(page, false);
});

// Initial route from hash
function initRouter() {
  const hash = location.hash.replace('#', '') || 'home';
  navigate(hash, false);
}

export { AppState, navigate, initRouter };
