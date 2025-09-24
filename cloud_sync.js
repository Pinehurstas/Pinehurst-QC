// Cloud Sync Module for Pinehurst QC PWA
// Copy this entire file and add it as cloud-sync.js to your GitHub repo

import { 
    db, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    query, 
    where, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    deleteDoc 
} from './firebase-config.js';

class CloudSync {
    constructor(authManager) {
        this.auth = authManager;
        this.isOnline = navigator.onLine;
        this.pendingOperations = [];
        this.listeners = [];
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processPendingOperations();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Sync all inspection data to cloud
    async syncInspections(inspections) {
        if (!this.auth.isSignedIn()) {
            throw new Error('User must be signed in to sync data');
        }

        const userId = this.auth.getUserId();
        
        try {
            // Upload each inspection to Firestore
            for (const inspection of inspections) {
                await this.saveInspection(inspection);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Sync error:', error);
            
            // If offline, queue the operation
            if (!this.isOnline) {
                this.queueOperation('syncInspections', { inspections });
                return { success: true, queued: true };
            }
            
            return { success: false, error: error.message };
        }
    }

    // Save single inspection to cloud
    async saveInspection(inspection) {
        if (!this.auth.isSignedIn()) {
            throw new Error('User must be signed in');
        }

        const userId = this.auth.getUserId();
        const inspectionRef = doc(db, 'users', userId, 'inspections', inspection.id.toString());
        
        try {
            await setDoc(inspectionRef, {
                ...inspection,
                userId: userId,
                lastModified: new Date().toISOString(),
                synced: true
            });
            
            return { success: true };
        } catch (error) {
            console.error('Save inspection error:', error);
            
            if (!this.isOnline) {
                this.queueOperation('saveInspection', { inspection });
                return { success: true, queued: true };
            }
            
            throw error;
        }
    }

    // Load all inspections from cloud
    async loadInspections() {
        if (!this.auth.isSignedIn()) {
            return { success: false, error: 'User not signed in' };
        }

        const userId = this.auth.getUserId();
        
        try {
            const inspectionsRef = collection(db, 'users', userId, 'inspections');
            const snapshot = await getDocs(inspectionsRef);
            
            const inspections = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                inspections.push(data);
            });
            
            // Sort by date (newest first)
            inspections.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            return { success: true, inspections };
        } catch (error) {
            console.error('Load inspections error:', error);
            return { success: false, error: error.message };
        }
    }

    // Set up real-time listener for inspection changes
    setupRealtimeSync(callback) {
        if (!this.auth.isSignedIn()) {
            return null;
        }

        const userId = this.auth.getUserId();
        const inspectionsRef = collection(db, 'users', userId, 'inspections');
        
        const unsubscribe = onSnapshot(inspectionsRef, (snapshot) => {
            const inspections = [];
            snapshot.forEach((doc) => {
                inspections.push(doc.data());
            });
            
            // Sort by date (newest first)
            inspections.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            callback(inspections);
        }, (error) => {
            console.error('Real-time sync error:', error);
        });

        this.listeners.push(unsubscribe);
        return unsubscribe;
    }

    // Update user profile/settings
    async saveUserProfile(profile) {
        if (!this.auth.isSignedIn()) {
            throw new Error('User must be signed in');
        }

        const userId = this.auth.getUserId();
        const userRef = doc(db, 'users', userId);
        
        try {
            await setDoc(userRef, {
                ...profile,
                lastUpdated: new Date().toISOString()
            }, { merge: true });
            
            return { success: true };
        } catch (error) {
            console.error('Save profile error:', error);
            
            if (!this.isOnline) {
                this.queueOperation('saveUserProfile', { profile });
                return { success: true, queued: true };
            }
            
            throw error;
        }
    }

    // Load user profile/settings
    async loadUserProfile() {
        if (!this.auth.isSignedIn()) {
            return { success: false, error: 'User not signed in' };
        }

        const userId = this.auth.getUserId();
        const userRef = doc(db, 'users', userId);
        
        try {
            const docSnap = await getDoc(userRef);
            
            if (docSnap.exists()) {
                return { success: true, profile: docSnap.data() };
            } else {
                // Create default profile
                const defaultProfile = {
                    email: this.auth.getUserEmail(),
                    inspectorName: '',
                    company: 'Pinehurst Apartment Services',
                    createdAt: new Date().toISOString()
                };
                
                await this.saveUserProfile(defaultProfile);
                return { success: true, profile: defaultProfile };
            }
        } catch (error) {
            console.error('Load profile error:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete inspection from cloud
    async deleteInspection(inspectionId) {
        if (!this.auth.isSignedIn()) {
            throw new Error('User must be signed in');
        }

        const userId = this.auth.getUserId();
        const inspectionRef = doc(db, 'users', userId, 'inspections', inspectionId.toString());
        
        try {
            await deleteDoc(inspectionRef);
            return { success: true };
        } catch (error) {
            console.error('Delete inspection error:', error);
            
            if (!this.isOnline) {
                this.queueOperation('deleteInspection', { inspectionId });
                return { success: true, queued: true };
            }
            
            throw error;
        }
    }

    // Queue operation for when back online
    queueOperation(operation, data) {
        this.pendingOperations.push({
            operation,
            data,
            timestamp: new Date().toISOString()
        });
        
        // Store in localStorage as backup
        localStorage.setItem('pinehurst_pending_operations', JSON.stringify(this.pendingOperations));
    }

    // Process queued operations when back online
    async processPendingOperations() {
        if (!this.isOnline || this.pendingOperations.length === 0) {
            return;
        }

        console.log('Processing', this.pendingOperations.length, 'pending operations...');
        
        const operations = [...this.pendingOperations];
        this.pendingOperations = [];
        
        for (const op of operations) {
            try {
                switch (op.operation) {
                    case 'saveInspection':
                        await this.saveInspection(op.data.inspection);
                        break;
                    case 'syncInspections':
                        await this.syncInspections(op.data.inspections);
                        break;
                    case 'deleteInspection':
                        await this.deleteInspection(op.data.inspectionId);
                        break;
                    case 'saveUserProfile':
                        await this.saveUserProfile(op.data.profile);
                        break;
                }
            } catch (error) {
                console.error('Failed to process pending operation:', op, error);
                // Re-queue failed operations
                this.pendingOperations.push(op);
            }
        }
        
        // Update localStorage
        localStorage.setItem('pinehurst_pending_operations', JSON.stringify(this.pendingOperations));
        
        if (this.pendingOperations.length === 0) {
            localStorage.removeItem('pinehurst_pending_operations');
            console.log('All pending operations processed successfully');
        }
    }

    // Load pending operations from localStorage
    loadPendingOperations() {
        const stored = localStorage.getItem('pinehurst_pending_operations');
        if (stored) {
            try {
                this.pendingOperations = JSON.parse(stored);
                console.log('Loaded', this.pendingOperations.length, 'pending operations');
            } catch (error) {
                console.error('Error loading pending operations:', error);
                this.pendingOperations = [];
            }
        }
    }

    // Clean up listeners
    cleanup() {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners = [];
    }

    // Get sync status
    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            isSignedIn: this.auth.isSignedIn(),
            pendingOperations: this.pendingOperations.length,
            userEmail: this.auth.getUserEmail()
        };
    }
}

export default CloudSync;
