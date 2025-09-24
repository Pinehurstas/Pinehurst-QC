// Authentication Module for Pinehurst QC PWA
// Copy this entire file and add it as auth.js to your GitHub repo

import { 
    auth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from './firebase-config.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.onAuthStateChange = null;
        this.setupAuthListener();
    }

    setupAuthListener() {
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            if (this.onAuthStateChange) {
                this.onAuthStateChange(user);
            }
        });
    }

    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    async signUp(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    async signOut() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        };
        return errorMessages[errorCode] || 'An error occurred. Please try again.';
    }

    isSignedIn() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserId() {
        return this.currentUser ? this.currentUser.uid : null;
    }

    getUserEmail() {
        return this.currentUser ? this.currentUser.email : null;
    }
}

export default AuthManager;
