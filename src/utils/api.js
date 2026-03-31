// ================================
// TRO – Database / API Layer
// Supports: PHP/MySQL backend (shared hosting) + Firebase
// ================================

const API_BASE = window.TRO_CONFIG?.apiBase || '/api';
const USE_FIREBASE = window.TRO_CONFIG?.useFirebase || false;

// ===========================
// HTTP HELPERS
// ===========================

async function apiRequest(endpoint, method = 'GET', data = null) {
  const token = localStorage.getItem('tro_token');
  
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  };

  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (data && method !== 'GET') opts.body = JSON.stringify(data);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    const json = await res.json();
    
    if (!res.ok) {
      throw new Error(json.message || `HTTP ${res.status}`);
    }
    
    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function apiUpload(endpoint, formData) {
  const token = localStorage.getItem('tro_token');
  
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ===========================
// AUTH API
// ===========================

const AuthAPI = {
  async register(payload) {
    return apiRequest('/auth/register', 'POST', payload);
  },
  
  async login(email, password) {
    return apiRequest('/auth/login', 'POST', { email, password });
  },
  
  async logout() {
    const r = await apiRequest('/auth/logout', 'POST');
    localStorage.removeItem('tro_token');
    localStorage.removeItem('tro_user');
    return r;
  },
  
  async getProfile() {
    return apiRequest('/auth/profile');
  },
  
  async updateProfile(data) {
    return apiRequest('/auth/profile', 'PUT', data);
  },
  
  async changePassword(data) {
    return apiRequest('/auth/change-password', 'POST', data);
  },
  
  async forgotPassword(email) {
    return apiRequest('/auth/forgot-password', 'POST', { email });
  },
  
  async verifyOtp(email, otp) {
    return apiRequest('/auth/verify-otp', 'POST', { email, otp });
  }
};

// ===========================
// KYC API
// ===========================

const KycAPI = {
  async getStatus() {
    return apiRequest('/kyc/status');
  },
  
  async submitStep1(formData) {
    return apiUpload('/kyc/step1', formData);
  },
  
  async submitStep2(formData) {
    return apiUpload('/kyc/step2', formData);
  },
  
  async submitSelfie(formData) {
    return apiUpload('/kyc/selfie', formData);
  },
  
  async getDocuments() {
    return apiRequest('/kyc/documents');
  }
};

// ===========================
// DASHBOARD API
// ===========================

const DashboardAPI = {
  async getStats() {
    return apiRequest('/dashboard/stats');
  },
  
  async getTeam() {
    return apiRequest('/dashboard/team');
  },
  
  async getTransactions(page = 1, type = '') {
    return apiRequest(`/dashboard/transactions?page=${page}&type=${type}`);
  },
  
  async getIncomes() {
    return apiRequest('/dashboard/incomes');
  },
  
  async getPensionStatus() {
    return apiRequest('/dashboard/pension');
  },
  
  async getGroupInfo() {
    return apiRequest('/dashboard/group');
  }
};

// ===========================
// INVESTMENT API
// ===========================

const InvestmentAPI = {
  async getPlan() {
    return apiRequest('/investment/plan');
  },
  
  async invest(txHash) {
    return apiRequest('/investment/activate', 'POST', { tx_hash: txHash });
  },
  
  async getHistory() {
    return apiRequest('/investment/history');
  }
};

// ===========================
// WITHDRAWAL API
// ===========================

const WithdrawalAPI = {
  async request(data) {
    return apiRequest('/withdrawal/request', 'POST', data);
  },
  
  async getHistory() {
    return apiRequest('/withdrawal/history');
  },
  
  async getWallet() {
    return apiRequest('/wallet/balance');
  }
};

// ===========================
// ADMIN API
// ===========================

const AdminAPI = {
  async getDashboard() {
    return apiRequest('/admin/dashboard');
  },
  
  async getUsers(page = 1, search = '') {
    return apiRequest(`/admin/users?page=${page}&search=${search}`);
  },
  
  async getUser(id) {
    return apiRequest(`/admin/users/${id}`);
  },
  
  async updateUser(id, data) {
    return apiRequest(`/admin/users/${id}`, 'PUT', data);
  },
  
  async blockUser(id) {
    return apiRequest(`/admin/users/${id}/block`, 'POST');
  },
  
  async getKycList(status = '') {
    return apiRequest(`/admin/kyc?status=${status}`);
  },
  
  async approveKyc(userId) {
    return apiRequest(`/admin/kyc/${userId}/approve`, 'POST');
  },
  
  async rejectKyc(userId, reason) {
    return apiRequest(`/admin/kyc/${userId}/reject`, 'POST', { reason });
  },
  
  async getWithdrawals(status = '') {
    return apiRequest(`/admin/withdrawals?status=${status}`);
  },
  
  async approveWithdrawal(id) {
    return apiRequest(`/admin/withdrawals/${id}/approve`, 'POST');
  },
  
  async rejectWithdrawal(id, reason) {
    return apiRequest(`/admin/withdrawals/${id}/reject`, 'POST', { reason });
  },
  
  async getSettings() {
    return apiRequest('/admin/settings');
  },
  
  async updateSettings(data) {
    return apiRequest('/admin/settings', 'PUT', data);
  },
  
  async getPlanSettings() {
    return apiRequest('/admin/plan');
  },
  
  async updatePlan(data) {
    return apiRequest('/admin/plan', 'PUT', data);
  },
  
  async getTransactions(page = 1) {
    return apiRequest(`/admin/transactions?page=${page}`);
  },
  
  async sendPension() {
    return apiRequest('/admin/pension/distribute', 'POST');
  },
  
  async getBanners() {
    return apiRequest('/admin/banners');
  },
  
  async uploadBanner(formData) {
    return apiUpload('/admin/banners', formData);
  },
  
  async deleteBanner(id) {
    return apiRequest(`/admin/banners/${id}`, 'DELETE');
  },
  
  async getGroups() {
    return apiRequest('/admin/groups');
  },
  
  async adminLogin(email, password) {
    return apiRequest('/admin/login', 'POST', { email, password });
  }
};

// ===========================
// REFERRAL API
// ===========================

const ReferralAPI = {
  async claimIncome() {
    return apiRequest('/referral/claim', 'POST');
  },
  
  async getDirects() {
    return apiRequest('/referral/directs');
  },
  
  async checkFastIncome() {
    return apiRequest('/referral/fast-income');
  }
};

export {
  AuthAPI,
  KycAPI,
  DashboardAPI,
  InvestmentAPI,
  WithdrawalAPI,
  AdminAPI,
  ReferralAPI,
  apiRequest,
  apiUpload
};
