// Firebase Configuration for Pinehurst QC PWA
// IMPORTANT: Replace the values below with your actual Firebase config values

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjMZPisN2dnmowiYYVb4w0O2HOsVLF5KQ",
  authDomain: "pinehurst-cq-pwa.firebaseapp.com",
  projectId: "pinehurst-cq-pwa",
  storageBucket: "pinehurst-cq-pwa.firebasestorage.app",
  messagingSenderId: "1052902149925",
  appId: "1:1052902149925:web:d04f776d9f307e4ebf54cc"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export Firebase functions for use in main app
export {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs

};
