// Firebase Configuration for Pinehurst QC PWA
// IMPORTANT: Replace the values below with your actual Firebase config values

// Firebase configuration
const firebaseConfig = {
    // REPLACE THESE WITH YOUR ACTUAL VALUES FROM FIREBASE CONSOLE
    apiKey: "your-api-key-here",
    authDomain: "your-project-id.firebaseapp.com", 
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id-here"
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
