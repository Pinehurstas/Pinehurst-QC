// Simple Authentication Manager - Ready to Upload
// Copy this EXACTLY into a new file called: auth.js

import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

export class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authStateCallbacks = [];
        
        // Listen for auth state changes
        onAuthStateChanged(auth, (user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
            this.currentUser = user;
            this.authStateCallbacks.forEach(callback => callback(user));
        });
    }

    async signIn(email, password) {
        try {
            console.log('Attempting sign in...');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Sign in successful!');
            return userCredential.user;
        } catch (error) {
            console.error('Sign in error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    async signUp(email, password) {
        try {
            console.log('Attempting sign up...');
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Sign up successful!');
            return userCredential.user;
        } catch (error) {
            console.error('Sign up error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    async signOut() {
        try {
            console.log('Signing out...');
            await signOut(auth);
            console.log('Sign out successful!');
        } catch (error) {
            console.error('Sign out error:', error);
            throw new Error('Failed to sign out');
        }
    }

    onAuthStateChanged(callback) {
        this.authStateCallbacks.push(callback);
        // Call immediately with current state
        if (this.currentUser !== null) {
            callback(this.currentUser);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'No account found with this email address.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/invalid-email':
                return 'Invalid email address.';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later.';
            default:
                return 'Authentication failed. Please try again.';
        }
    }
}
