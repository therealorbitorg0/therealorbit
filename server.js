#!/usr/bin/env node
// ================================================
// TRO LOCAL DEV SERVER
// Single file — serves frontend + mock API + DB
// Run: node server.js
// Then open: http://localhost:3000
// ================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, '.tro-data.json');

// ================================================
// IN-MEMORY DATABASE (persisted to .tro-data.json)
// ================================================
let DB = {
  users: [],
  admins: [{ id: 1, name: 'Admin', email: 'admin@gmail.com', password: hashPwd('admin123'), status: 1 }],
  kyc: [],
  wallets: [],
  investments: [],
  transactions: [],
  withdrawals: [],
  incomes: [],
  settings: {
    entry_amount: '167',
    wallet_address: 'TRXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    referral_percent: '15',
    pension_amount: '100',
    fast_income_bonus: '100',
    fast_income_requirement: '4',
    group_size: '10000',
    min_monthly_referrals: '2',
    withdrawal_fee: '2',
    min_withdrawal: '10',
    site_name: 'The Real Orbit',
    announcement: '',
    announcement_active: '0',
  },
  groups: [
    { id: 1, name: 'Group A', status: 1, member_count: 247 },
    { id: 2, name: 'Group B', status: 0, member_count: 0 },
  ],
  banners: [],
  nextId: { users: 2, kyc: 1, tx: 1, inv: 1, wd: 1 },
};

// Load persisted data
if (fs.existsSync(DATA_FILE)) {
  try { DB = { ...DB, ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) }; } catch(e) {}
}

function saveDB() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(DB, null, 2));
}

// ================================================
// HELPERS
// ================================================
function hashPwd(pwd) {
  return crypto.createHash('sha256').update(pwd + 'tro_salt').digest('hex');
}

function genId(type) {
  const id = DB.nextId[type] || 1;
  DB.nextId[type] = id + 1;
  saveDB();
  return id;
}

function genUserId() {
  return 'TRO' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateToken(payload) {
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7*24*60*60*1000 })).toString('base64');
  const sig = crypto.createHmac('sha256', 'tro-local-secret').update(data).digest('hex');
  return data + '.' + sig;
}

function verifyToken(token) {
  if (!token) return null;
  try {
    const [data, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', 'tro-local-secret').update(data).digest('hex');
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

function getToken(req) {
  const auth = req.headers['authorization'] || '';
  return auth.replace('Bearer ', '').trim() || null;
}

function getUser(req) {
  const payload = verifyToken(getToken(req));
  return payload ? DB.users.find(u => u.id === payload.userId) : null;
}

function getAdmin(req) {
  const payload = verifyToken(getToken(req));
  if (!payload || !payload.isAdmin) return null;
  return DB.admins.find(a => a.id === payload.userId);
}

function now() { return new Date().toISOString(); }
function strip(user) { if (!user) return null; const u = {...user}; delete u.password; return u; }

function paginate(arr, page = 1, perPage = 15) {
  const total = arr.length;
  const start = (page - 1) * perPage;
  return {
    data: arr.slice(start, start + perPage),
    total, per_page: perPage, current_page: page,
    last_page: Math.max(1, Math.ceil(total / perPage)),
  };
}

// ================================================
// MIME TYPES
// ================================================
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
};

// ================================================
// MOCK API HANDLERS
// ================================================
const API = {

  // AUTH
  'POST /auth/register': (body) => {
    if (!body.name || !body.email || !body.password) return [400, { message: 'All fields required' }];
    if (DB.users.find(u => u.email === body.email.toLowerCase())) return [400, { message: 'Email already registered' }];
    
    const id = genId('users');
    const userId = genUserId();
    const user = {
      id, name: body.name, email: body.email.toLowerCase(),
      mobile: body.mobile || '', country_code: body.country_code || '+91',
      password: hashPwd(body.password), user_id: userId,
      sponsor_id: body.sponsor_id || null, kyc_status: 'not_submitted',
      active_status: 0, status: 1, eth_address: '', created_at: now(),
    };
    DB.users.push(user);
    DB.wallets.push({ id: id, user_id: id, main_wallet: 0, fund_wallet: 0, created_at: now() });
    DB.incomes.push({ id: id, user_id: id, direct_income: 0, pension_income: 0, created_at: now() });
    saveDB();
    const token = generateToken({ userId: id, email: user.email });
    return [200, { token, user: strip(user) }];
  },

  'POST /auth/login': (body) => {
    const user = DB.users.find(u => u.email === (body.email || '').toLowerCase());
    if (!user || user.password !== hashPwd(body.password)) return [401, { message: 'Invalid email or password' }];
    if (user.status !== 1) return [403, { message: 'Account blocked' }];
    const kyc = DB.kyc.find(k => k.user_id === user.id);
    const fullUser = { ...user, kyc_status: kyc?.status || 'not_submitted' };
    delete fullUser.password;
    const token = generateToken({ userId: user.id, email: user.email });
    return [200, { token, user: fullUser }];
  },

  'POST /auth/logout': () => [200, { message: 'Logged out' }],

  'GET /auth/profile': (_, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    const kyc = DB.kyc.find(k => k.user_id === user.id);
    return [200, { user: { ...strip(user), kyc_status: kyc?.status || 'not_submitted' } }];
  },

  'PUT /auth/profile': (body, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    Object.assign(user, { name: body.name || user.name, mobile: body.mobile || user.mobile, eth_address: body.eth_address || user.eth_address });
    saveDB();
    return [200, { user: strip(user) }];
  },

  'POST /auth/change-password': (body, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    if (user.password !== hashPwd(body.current_password)) return [400, { message: 'Current password incorrect' }];
    user.password = hashPwd(body.password);
    saveDB();
    return [200, { message: 'Password updated' }];
  },

  'POST /auth/forgot-password': (body) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n📧 OTP for ${body.email}: ${otp}\n`);
    return [200, { message: 'OTP sent to email', debug_otp: otp }];
  },

  'POST /auth/verify-otp': () => [200, { message: 'OTP verified', verified: true }],

  // KYC
  'GET /kyc/status': (_, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    const kyc = DB.kyc.find(k => k.user_id === user.id);
    return [200, { status: kyc?.status || null, rejection_reason: kyc?.rejection_reason || null }];
  },

  'GET /kyc/documents': (_, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    return [200, { documents: DB.kyc.find(k => k.user_id === user.id) || null }];
  },

  // DASHBOARD
  'GET /dashboard/stats': (_, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    const wallet = DB.wallets.find(w => w.user_id === user.id) || { main_wallet: 0, fund_wallet: 0 };
    const income = DB.incomes.find(i => i.user_id === user.id) || { direct_income: 0, pension_income: 0 };
    const directs = DB.users.filter(u => u.sponsor_id === (user.user_id || String(user.id)));
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthDirects = directs.filter(u => {
      const d = new Date(u.created_at);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    return [200, {
      wallet, incomes: income,
      total_directs: directs.length, monthly_directs: monthDirects,
      fast_income_count: monthDirects,
      group: { name: 'Group A', current_members: 247 },
      user: { id: user.id, name: user.name, email: user.email, user_id: user.user_id },
    }];
  },

  'GET /dashboard/team': (_, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    const directs = DB.users.filter(u => u.sponsor_id === (user.user_id || String(user.id)));
    const team = directs.map(u => {
      const kyc = DB.kyc.find(k => k.user_id === u.id);
      return { ...strip(u), kyc_status: kyc?.status || 'not_submitted' };
    });
    return [200, { team }];
  },

  'GET /dashboard/transactions': (_, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    const txs = DB.transactions.filter(t => t.user_id === user.id).reverse();
    const page = 1;
    return [200, paginate(txs, page, 15)];
  },

  'GET /dashboard/incomes': (_, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    return [200, { incomes: DB.incomes.find(i => i.user_id === user.id) || {} }];
  },

  'GET /dashboard/pension': (_, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthDirects = DB.users.filter(u => {
      if (u.sponsor_id !== (user.user_id || String(user.id))) return false;
      const d = new Date(u.created_at);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    return [200, { monthly_directs: monthDirects, group_complete: false, eligible: monthDirects >= 2 }];
  },

  'GET /dashboard/group': (_, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    return [200, { group: { name: 'Group A', current_members: 247, status: 1 } }];
  },

  // INVESTMENT
  'GET /investment/plan': () => [200, DB.settings],

  'POST /investment/activate': (body, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    if (!body.tx_hash || body.tx_hash.length < 10) return [400, { message: 'Invalid transaction hash' }];
    if (DB.investments.find(i => i.tx_hash === body.tx_hash)) return [400, { message: 'Transaction hash already used' }];
    const inv = { id: genId('inv'), user_id: user.id, amount: 167, tx_hash: body.tx_hash, status: 0, created_at: now() };
    DB.investments.push(inv);
    DB.transactions.push({ id: genId('tx'), user_id: user.id, tx_type: 'deposit', type: 'debit', amount: 167, tx_id: body.tx_hash, status: 'pending', remarks: 'Investment deposit', created_at: now() });
    saveDB();
    return [200, { message: 'Investment submitted. Pending admin verification.', investment_id: inv.id }];
  },

  'GET /investment/history': (_, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    return [200, DB.investments.filter(i => i.user_id === user.id)];
  },

  // WITHDRAWAL
  'GET /wallet/balance': (_, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    return [200, DB.wallets.find(w => w.user_id === user.id) || { main_wallet: 0, fund_wallet: 0 }];
  },

  'GET /withdrawal/history': (_, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    return [200, DB.withdrawals.filter(w => w.user_id === user.id).reverse()];
  },

  'POST /withdrawal/request': (body, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    const amount = parseFloat(body.amount);
    if (!amount || amount < 10) return [400, { message: 'Minimum withdrawal is $10 USDT' }];
    const wallet = DB.wallets.find(w => w.user_id === user.id);
    if (!wallet || wallet.main_wallet < amount) return [400, { message: 'Insufficient balance' }];
    const fee = amount * 0.02;
    const payable = amount - fee;
    wallet.main_wallet -= amount;
    const wd = { id: genId('wd'), user_id: user.id, amount, tx_charge: fee, payable, wallet_address: body.wallet_address, status: 'pending', created_at: now() };
    DB.withdrawals.push(wd);
    DB.transactions.push({ id: genId('tx'), user_id: user.id, tx_type: 'withdrawal', type: 'debit', amount, status: 'pending', remarks: 'Withdrawal request', created_at: now() });
    saveDB();
    return [200, { message: 'Withdrawal request submitted' }];
  },

  // REFERRAL
  'GET /referral/directs': (_, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    return [200, { directs: DB.users.filter(u => u.sponsor_id === (user.user_id || String(user.id))) }];
  },

  'GET /referral/fast-income': (_, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const count = DB.users.filter(u => {
      if (u.sponsor_id !== (user.user_id || String(user.id))) return false;
      const d = new Date(u.created_at);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
    return [200, { count, eligible: count >= 4, needed: 4 }];
  },

  'POST /referral/claim': (_, req) => {
    const user = getUser(req);
    if (!user) return [401, { message: 'Unauthorized' }];
    const income = DB.incomes.find(i => i.user_id === user.id);
    if (!income || income.direct_income <= 0) return [400, { message: 'No income available to claim' }];
    const amount = income.direct_income;
    const wallet = DB.wallets.find(w => w.user_id === user.id);
    if (wallet) wallet.main_wallet += amount;
    income.direct_income = 0;
    DB.transactions.push({ id: genId('tx'), user_id: user.id, tx_type: 'referral_claim', type: 'credit', amount, status: 'completed', remarks: 'Referral income claim', created_at: now() });
    saveDB();
    return [200, { message: 'Income claimed!', amount }];
  },

  // ADMIN LOGIN
  'POST /admin/login': (body) => {
    const admin = DB.admins.find(a => a.email === (body.email || '').toLowerCase());
    if (!admin || admin.password !== hashPwd(body.password)) return [401, { message: 'Invalid credentials' }];
    const token = generateToken({ userId: admin.id, email: admin.email, isAdmin: true });
    return [200, { token, admin: strip(admin) }];
  },

  // ADMIN DASHBOARD
  'GET /admin/dashboard': (_, req) => {
    if (!getAdmin(req)) return [401, { message: 'Unauthorized' }];
    const today = new Date().toDateString();
    return [200, {
      total_users: DB.users.length,
      active_users: DB.investments.filter(i => i.status === 1).length,
      new_users_today: DB.users.filter(u => new Date(u.created_at).toDateString() === today).length,
      pending_kyc: DB.kyc.filter(k => k.status === 'pending').length,
      pending_withdrawals: DB.withdrawals.filter(w => w.status === 'pending').length,
      total_invested: DB.investments.filter(i => i.status === 1).reduce((s, i) => s + i.amount, 0),
      total_pension_paid: DB.transactions.filter(t => t.tx_type === 'pension').reduce((s, t) => s + t.amount, 0),
      recent_users: DB.users.slice(-8).reverse().map(u => { const k = DB.kyc.find(k => k.user_id === u.id); return { ...strip(u), kyc_status: k?.status || 'none' }; }),
      recent_transactions: DB.transactions.slice(-6).reverse().map(t => ({ ...t, user: DB.users.find(u => u.id === t.user_id) })),
    }];
  },

  'GET /admin/users': (_, req) => {
    if (!getAdmin(req)) return [401, { message: 'Unauthorized' }];
    const search = (new URLSearchParams(_.split('?')[1] || '')).get('search') || '';
    const page = parseInt((new URLSearchParams(_.split('?')[1] || '')).get('page') || '1');
    let users = DB.users.map(u => {
      const k = DB.kyc.find(k => k.user_id === u.id);
      return { ...strip(u), kyc_status: k?.status || 'none' };
    });
    if (search) users = users.filter(u => u.name?.includes(search) || u.email?.includes(search) || u.user_id?.includes(search));
    users.reverse();
    return [200, paginate(users, page, 20)];
  },

  'GET /admin/kyc': (_, req) => {
    if (!getAdmin(req)) return [401, { message: 'Unauthorized' }];
    const status = (new URLSearchParams(_.split('?')[1] || '')).get('status') || 'pending';
    const list = DB.kyc.filter(k => k.status === status).map(k => ({ ...k, user: DB.users.find(u => u.id === k.user_id) }));
    return [200, list];
  },

  'GET /admin/withdrawals': (_, req) => {
    if (!getAdmin(req)) return [401, { message: 'Unauthorized' }];
    const status = (new URLSearchParams(_.split('?')[1] || '')).get('status') || 'pending';
    const list = DB.withdrawals.filter(w => w.status === status).map(w => ({ ...w, user: DB.users.find(u => u.id === w.user_id) }));
    return [200, list.reverse()];
  },

  'GET /admin/transactions': (_, req) => {
    if (!getAdmin(req)) return [401, { message: 'Unauthorized' }];
    const page = parseInt((new URLSearchParams(_.split('?')[1] || '')).get('page') || '1');
    const txs = DB.transactions.map(t => ({ ...t, user: DB.users.find(u => u.id === t.user_id) })).reverse();
    return [200, paginate(txs, page, 20)];
  },

  'GET /admin/plan': (_, req) => {
    if (!getAdmin(req)) return [401, { message: 'Unauthorized' }];
    return [200, DB.settings];
  },

  'PUT /admin/plan': (body, req) => {
    if (!getAdmin(req)) return [401, { message: 'Unauthorized' }];
    Object.assign(DB.settings, body);
    saveDB();
    return [200, { message: 'Plan settings updated' }];
  },

  'GET /admin/settings': (_, req) => {
    if (!getAdmin(req)) return [401, { message: 'Unauthorized' }];
    return [200, DB.settings];
  },

  'PUT /admin/settings': (body, req) => {
    if (!getAdmin(req)) return [401, { message: 'Unauthorized' }];
    Object.assign(DB.settings, body);
    saveDB();
    return [200, { message: 'Settings saved' }];
  },

  'GET /admin/groups': (_, req) => {
    if (!getAdmin(req)) return [401, { message: 'Unauthorized' }];
    return [200, DB.groups];
  },

  'GET /admin/banners': (_, req) => {
    if (!getAdmin(req)) return [401, { message: 'Unauthorized' }];
    return [200, DB.banners];
  },

  'POST /admin/pension/distribute': (_, req) => {
    if (!getAdmin(req)) return [401, { message: 'Unauthorized' }];
    const pensionAmount = parseFloat(DB.settings.pension_amount || 100);
    const minRef = parseInt(DB.settings.min_monthly_referrals || 2);
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    let count = 0;
    DB.users.forEach(user => {
      const monthDirects = DB.users.filter(u => {
        if (u.sponsor_id !== (user.user_id || String(user.id))) return false;
        const d = new Date(u.created_at);
        return d.getMonth() === month && d.getFullYear() === year;
      }).length;
      if (monthDirects >= minRef) {
        const wallet = DB.wallets.find(w => w.user_id === user.id);
        const income = DB.incomes.find(i => i.user_id === user.id);
        if (wallet) wallet.main_wallet += pensionAmount;
        if (income) income.pension_income += pensionAmount;
        DB.transactions.push({ id: genId('tx'), user_id: user.id, tx_type: 'pension', type: 'credit', amount: pensionAmount, status: 'completed', remarks: 'Monthly pension', created_at: now() });
        count++;
      }
    });
    saveDB();
    return [200, { message: `Pension distributed to ${count} users`, count }];
  },
};

// Dynamic admin routes
function handleDynamicAdmin(method, pathStr, body, req) {
  if (!getAdmin(req)) return [401, { message: 'Unauthorized' }];

  // /admin/users/:id
  let m;
  if (m = pathStr.match(/^\/admin\/users\/(\d+)$/)) {
    const uid = parseInt(m[1]);
    const user = DB.users.find(u => u.id === uid);
    if (!user) return [404, { message: 'User not found' }];
    if (method === 'GET') { return [200, strip(user)]; }
    if (method === 'PUT') { Object.assign(user, { name: body.name, mobile: body.mobile, status: body.status }); saveDB(); return [200, { message: 'User updated' }]; }
  }

  // /admin/users/:id/block
  if (m = pathStr.match(/^\/admin\/users\/(\d+)\/block$/)) {
    const uid = parseInt(m[1]);
    const user = DB.users.find(u => u.id === uid);
    if (!user) return [404, { message: 'Not found' }];
    user.status = user.status === 1 ? 0 : 1;
    saveDB();
    return [200, { message: 'Status updated', status: user.status }];
  }

  // /admin/kyc/:id/approve
  if (m = pathStr.match(/^\/admin\/kyc\/(\d+)\/approve$/)) {
    const uid = parseInt(m[1]);
    const kyc = DB.kyc.find(k => k.user_id === uid);
    const user = DB.users.find(u => u.id === uid);
    if (kyc) kyc.status = 'approved';
    if (user) { user.kyc_status = 'approved'; user.active_status = 1; }
    saveDB();
    return [200, { message: 'KYC approved' }];
  }

  // /admin/kyc/:id/reject
  if (m = pathStr.match(/^\/admin\/kyc\/(\d+)\/reject$/)) {
    const uid = parseInt(m[1]);
    const kyc = DB.kyc.find(k => k.user_id === uid);
    if (kyc) { kyc.status = 'rejected'; kyc.rejection_reason = body.reason || ''; }
    saveDB();
    return [200, { message: 'KYC rejected' }];
  }

  // /admin/withdrawals/:id/approve
  if (m = pathStr.match(/^\/admin\/withdrawals\/(\d+)\/approve$/)) {
    const wid = parseInt(m[1]);
    const wd = DB.withdrawals.find(w => w.id === wid);
    if (wd) wd.status = 'approved';
    saveDB();
    return [200, { message: 'Withdrawal approved' }];
  }

  // /admin/withdrawals/:id/reject
  if (m = pathStr.match(/^\/admin\/withdrawals\/(\d+)\/reject$/)) {
    const wid = parseInt(m[1]);
    const wd = DB.withdrawals.find(w => w.id === wid);
    if (wd) {
      const wallet = DB.wallets.find(w2 => w2.user_id === wd.user_id);
      if (wallet) wallet.main_wallet += wd.amount;
      wd.status = 'rejected';
      wd.remarks = body.reason || '';
    }
    saveDB();
    return [200, { message: 'Withdrawal rejected, refunded' }];
  }

  // /admin/banners/:id DELETE
  if (m = pathStr.match(/^\/admin\/banners\/(\d+)$/) && method === 'DELETE') {
    const bid = parseInt(m[1]);
    DB.banners = DB.banners.filter(b => b.id !== bid);
    saveDB();
    return [200, { message: 'Banner deleted' }];
  }

  return [404, { message: 'Route not found' }];
}

// KYC submit handler (multipart — simplified for local)
function handleKycSubmit(req, res) {
  const user = getUser(req);
  if (!user) { res.writeHead(401); res.end(JSON.stringify({ message: 'Unauthorized' })); return; }

  let rawBody = '';
  req.on('data', chunk => rawBody += chunk);
  req.on('end', () => {
    // For local dev, just mark KYC as submitted
    const existing = DB.kyc.find(k => k.user_id === user.id);
    if (existing) {
      existing.status = 'pending';
      existing.updated_at = now();
    } else {
      DB.kyc.push({ id: DB.nextId.kyc++, user_id: user.id, status: 'pending', created_at: now() });
    }
    user.kyc_status = 'pending';
    saveDB();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'KYC submitted', status: 'pending' }));
  });
}

// ================================================
// HTTP SERVER
// ================================================
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  const pathname = parsed.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ---- API ROUTES ----
  if (pathname.startsWith('/api/')) {
    const apiPath = pathname.replace('/api', '');

    // KYC multipart submit
    if (apiPath === '/kyc/step1' && req.method === 'POST') {
      res.setHeader('Content-Type', 'application/json');
      handleKycSubmit(req, res);
      return;
    }

    const key = `${req.method} ${apiPath}`;
    const handler = API[key];

    if (handler) {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        let parsed = {};
        try { parsed = JSON.parse(body); } catch {}
        try {
          const [status, data] = handler(parsed, req);
          res.writeHead(status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        } catch(e) {
          console.error('API Error:', e.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Server error: ' + e.message }));
        }
      });
      return;
    }

    // Dynamic routes (admin with IDs)
    if (pathname.startsWith('/api/admin/') || pathname.includes('/block') || pathname.includes('/approve') || pathname.includes('/reject')) {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        let parsed = {};
        try { parsed = JSON.parse(body); } catch {}
        const [status, data] = handleDynamicAdmin(req.method, apiPath, parsed, req);
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'API route not found: ' + apiPath }));
    return;
  }

  // ---- STATIC FILES ----
  let filePath = pathname === '/' ? '/index.html' : pathname;
  const fullPath = path.join(__dirname, filePath);

  // Security: prevent directory traversal
  if (!fullPath.startsWith(__dirname)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      // SPA fallback — all unknown routes serve index.html
      fs.readFile(path.join(__dirname, 'index.html'), (err2, indexData) => {
        if (err2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(indexData);
      });
      return;
    }
    const ext = path.extname(fullPath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('\n');
  console.log('  🪐 TRO Platform — Local Dev Server');
  console.log('  ====================================');
  console.log(`  URL:    http://localhost:${PORT}`);
  console.log(`  Admin:  http://localhost:${PORT}/#admin/login`);
  console.log('  ');
  console.log('  Admin Login: admin@gmail.com / admin123');
  console.log('  Data saved to: .tro-data.json');
  console.log('  ');
  console.log('  Press Ctrl+C to stop');
  console.log('\n');
});
