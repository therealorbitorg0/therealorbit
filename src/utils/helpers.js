// ================================
// TRO – Global Utilities
// ================================

// ===========================
// TOAST NOTIFICATIONS
// ===========================

function ensureToastContainer() {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}

const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
};

function showToast(message, type = 'info', title = '') {
  const container = ensureToastContainer();
  
  const defaultTitles = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Notice'
  };
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <div>
      <div class="toast-title">${title || defaultTitles[type]}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;
  
  toast.addEventListener('click', () => toast.remove());
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ===========================
// MODAL
// ===========================

function openModal(title, bodyHTML, actions = []) {
  closeModal();
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.id = 'global-modal';
  
  const actionsHTML = actions.map(a => 
    `<button class="btn btn-${a.type || 'secondary'}" onclick="${a.onclick}">${a.label}</button>`
  ).join('');
  
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" onclick="closeModal()" aria-label="Close">✕</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      ${actions.length ? `<div class="modal-footer">${actionsHTML}</div>` : ''}
    </div>
  `;
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const m = document.getElementById('global-modal');
  if (m) {
    m.remove();
    document.body.style.overflow = '';
  }
}

window.closeModal = closeModal;

// ===========================
// CONFIRM DIALOG
// ===========================

function confirmDialog(message, onConfirm, onCancel) {
  openModal('Confirm Action', `<p style="color:var(--text-secondary)">${message}</p>`, [
    { label: 'Cancel', type: 'secondary', onclick: 'closeModal()' },
    { label: 'Confirm', type: 'danger', onclick: `window._confirmFn && window._confirmFn(); closeModal()` }
  ]);
  window._confirmFn = onConfirm;
}

// ===========================
// FORMATTERS
// ===========================

function formatUSDT(amount) {
  return `$${parseFloat(amount || 0).toFixed(2)}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

function truncateAddress(addr) {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!', 'success');
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('Copied!', 'success');
  });
}

// ===========================
// AUTH HELPERS
// ===========================

function getCurrentUser() {
  try {
    const u = localStorage.getItem('tro_user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
}

function getCurrentAdmin() {
  try {
    const a = localStorage.getItem('tro_admin');
    return a ? JSON.parse(a) : null;
  } catch { return null; }
}

function isLoggedIn() {
  return !!localStorage.getItem('tro_token');
}

function isAdminLoggedIn() {
  return !!localStorage.getItem('tro_admin_token');
}

function logout() {
  localStorage.removeItem('tro_token');
  localStorage.removeItem('tro_user');
  navigate('login');
}

function adminLogout() {
  localStorage.removeItem('tro_admin_token');
  localStorage.removeItem('tro_admin');
  navigate('admin/login');
}

// ===========================
// FORM HELPERS
// ===========================

function getFormData(formEl) {
  const data = {};
  const fd = new FormData(formEl);
  fd.forEach((v, k) => data[k] = v);
  return data;
}

function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errEl = document.getElementById(`${fieldId}-error`);
  if (field) field.classList.add('error');
  if (errEl) errEl.textContent = message;
}

function clearFieldErrors() {
  document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateMobile(mobile) {
  return /^[0-9]{10,15}$/.test(mobile.replace(/[\s+\-]/g, ''));
}

// ===========================
// LOADING STATE
// ===========================

function setButtonLoading(btn, loading, loadingText = 'Processing…') {
  if (loading) {
    btn.disabled = true;
    btn._originalText = btn.innerHTML;
    btn.innerHTML = `<span class="loader loader-sm" style="display:inline-block;vertical-align:middle;margin-right:8px"></span>${loadingText}`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn._originalText || 'Submit';
  }
}

// ===========================
// KYC STATUS CHECK
// ===========================

async function checkKycBeforeAction(actionName = 'this action') {
  const user = getCurrentUser();
  if (!user) return false;
  
  if (user.kyc_status !== 'approved') {
    openModal('KYC Required', `
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:3rem;margin-bottom:16px">🔒</div>
        <p style="color:var(--text-secondary);margin-bottom:24px">
          You need to complete KYC verification before ${actionName}.
        </p>
        <button class="btn btn-primary" onclick="navigate('kyc'); closeModal()">
          Complete KYC Now
        </button>
      </div>
    `);
    return false;
  }
  return true;
}

// Make global
window.showToast = showToast;
window.openModal = openModal;
window.confirmDialog = confirmDialog;
window.formatUSDT = formatUSDT;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.timeAgo = timeAgo;
window.truncateAddress = truncateAddress;
window.getInitials = getInitials;
window.copyToClipboard = copyToClipboard;
window.getCurrentUser = getCurrentUser;
window.getCurrentAdmin = getCurrentAdmin;
window.isLoggedIn = isLoggedIn;
window.isAdminLoggedIn = isAdminLoggedIn;
window.logout = logout;
window.adminLogout = adminLogout;
window.setButtonLoading = setButtonLoading;
window.clearFieldErrors = clearFieldErrors;
window.validateEmail = validateEmail;
window.checkKycBeforeAction = checkKycBeforeAction;

export {
  showToast, openModal, closeModal, confirmDialog,
  formatUSDT, formatDate, formatDateTime, timeAgo,
  truncateAddress, getInitials, copyToClipboard,
  getCurrentUser, getCurrentAdmin, isLoggedIn, isAdminLoggedIn,
  logout, adminLogout, setButtonLoading, clearFieldErrors,
  validateEmail, validateMobile, getFormData, checkKycBeforeAction
};
