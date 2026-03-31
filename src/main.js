// ================================
// TRO – Main Entry Point
// ================================

import { navigate, initRouter } from './router.js';
import { showToast, closeModal, getCurrentUser, getCurrentAdmin, isLoggedIn, isAdminLoggedIn, logout, adminLogout, formatUSDT, formatDate, formatDateTime, getInitials, copyToClipboard, setButtonLoading, confirmDialog } from './utils/helpers.js';

// ===========================
// CONFIG
// ===========================
window.TRO_CONFIG = {
  apiBase: '/api',        // For shared hosting PHP backend
  useFirebase: false,      // Set true to use Firebase
  version: '1.0.0',
};

// ===========================
// MAKE GLOBALS AVAILABLE
// ===========================
window.navigate = navigate;
window.showToast = showToast;
window.closeModal = closeModal;
window.getCurrentUser = getCurrentUser;
window.getCurrentAdmin = getCurrentAdmin;
window.isLoggedIn = isLoggedIn;
window.isAdminLoggedIn = isAdminLoggedIn;
window.logout = logout;
window.adminLogout = adminLogout;
window.formatUSDT = formatUSDT;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.getInitials = getInitials;
window.copyToClipboard = copyToClipboard;
window.setButtonLoading = setButtonLoading;
window.confirmDialog = confirmDialog;

// ===========================
// APP INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  // Remove initial loader if present
  const initialLoader = document.getElementById('initial-loader');
  if (initialLoader) initialLoader.remove();
  
  // Start router
  initRouter();
  
  console.log('🪐 TRO Platform v1.0.0 — Initialized');
});

// ===========================
// ERROR HANDLER
// ===========================
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});
