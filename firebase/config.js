// ================================
// TRO – Firebase Configuration
// ================================
// Replace these values with your actual Firebase project credentials
// Get them from: https://console.firebase.google.com

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Import Firebase modules (CDN version for browser)
// These are loaded via <script> tags in index.html for CDN mode
// For module bundler: import { initializeApp } from 'firebase/app'

let db, auth, storage;

/**
 * Initialize Firebase
 * Called once when app loads
 */
function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded. Add Firebase CDN scripts to index.html');
    return false;
  }

  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();

    // Enable offline persistence
    db.enablePersistence({ synchronizeTabs: true }).catch(err => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence: Browser not supported');
      }
    });

    console.log('✅ Firebase initialized');
    return true;
  } catch (e) {
    console.error('Firebase init error:', e);
    return false;
  }
}

export { firebaseConfig, initFirebase, db, auth, storage };
