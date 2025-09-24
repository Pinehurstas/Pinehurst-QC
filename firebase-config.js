// Firebase Configuration - Ready to Upload
// Copy this EXACTLY into a new file called: firebase-config.js

// Import Firebase SDK modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjMZPisN2dnmowiYYVb4w0O2HOsVLF5KQ",
  authDomain: "pinehurst-cq-pwa.firebaseapp.com",
  projectId: "pinehurst-cq-pwa",
  storageBucket: "pinehurst-cq-pwa.firebasestorage.app",
  messagingSenderId: "1052902149925",
  appId: "1:1052902149925:web:d04f776d9f307e4ebf54cc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export the app instance
export default app;
