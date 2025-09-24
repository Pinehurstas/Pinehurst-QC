import { AuthManager } from './auth.js';
import { CloudSync } from './cloud-sync.js';

// Global variables
let authManager;
let cloudSync;
let currentUser = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    try {
        // Initialize authentication
        authManager = new AuthManager();
        
        // Set up auth event listeners
        setupAuthEventListeners();
        
        // Listen for authentication state changes
        authManager.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                await initializeMainApp();
                showMainApp();
            } else {
                currentUser = null;
                showAuthScreen();
            }
        });

        // Set up form submission
        setupFormSubmission();
        
        // Set today's date as default
        document.getElementById('inspectionDate').valueAsDate = new Date();
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to initialize application. Please refresh the page.');
    }
}

function setupAuthEventListeners() {
    const authForm = document.getElementById('authForm');
    const authToggleBtn = document.getElementById('authToggleBtn');
    
    authForm.addEventListener('submit', handleAuthSubmit);
    authToggleBtn.addEventListener('click', toggleAuthMode);
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isSignUp = document.getElementById('authSubmit').dataset.mode === 'signup';
    
    // Show loading state
    const submitBtn = document.getElementById('authSubmit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading-spinner"></div>Processing...';
    submitBtn.disabled = true;
    
    // Clear any previous errors
    hideAuthError();
    
    try {
        if (isSignUp) {
            await authManager.signUp(email, password);
        } else {
            await authManager.signIn(email, password);
        }
    } catch (error) {
        showAuthError(error.message);
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function toggleAuthMode() {
    const submitBtn = document.getElementById('authSubmit');
    const toggleText = document.getElementById('authToggleText');
    const toggleBtn = document.getElementById('authToggleBtn');
    const buttonText = document.getElementById('authButtonText');
    
    if (submitBtn.dataset.mode === 'signup') {
        // Switch to sign in
        submitBtn.dataset.mode = 'signin';
        buttonText.textContent = 'Sign In';
        toggleText.textContent = "Don't have an account?";
        toggleBtn.textContent = 'Sign Up';
    } else {
        // Switch to sign up
        submitBtn.dataset.mode = 'signup';
        buttonText.textContent = 'Sign Up';
        toggleText.textContent = 'Already have an account?';
        toggleBtn.textContent = 'Sign In';
    }
}

function showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideAuthError() {
    const errorDiv = document.getElementById('authError');
    errorDiv.classList.add('hidden');
}

function showAuthScreen() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    // Update user info in settings
    if (currentUser) {
        document.getElementById('userEmail').textContent = currentUser.email;
    }
}

async function initializeMainApp() {
    try {
        // Initialize cloud sync
        cloudSync = new CloudSync(currentUser.uid);
        
        // Set up real-time sync
        await cloudSync.setupRealtimeSync();
        
        // Set up sync status listeners
        setupSyncStatusListeners();
        
        // Load inspection history
        await loadInspectionHistory();
        
        // Set up auto-save for the inspection form
        setupAutoSave();
        
    } catch (error) {
        console.error('Failed to initialize main app:', error);
        updateSyncStatus('offline', 'Connection failed');
    }
}

function setupSyncStatusListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
        updateSyncStatus('syncing', 'Reconnecting...');
        cloudSync.processPendingOperations();
    });
    
    window.addEventListener('offline', () => {
        updateSyncStatus('offline', 'Offline mode');
    });
    
    // Set initial status
    if (navigator.onLine) {
        updateSyncStatus('connected', 'Connected');
    } else {
        updateSyncStatus('offline', 'Offline mode');
    }
}

function updateSyncStatus(status, text) {
    const indicator = document.getElementById('syncIndicator');
    const statusText = document.getElementById('syncStatus');
    const settingsStatus = document.getElementById('settingsSyncStatus');
    
    // Remove all status classes
    indicator.classList.remove('syncing', 'offline');
    
    // Add appropriate class
    if (status !== 'connected') {
        indicator.classList.add(status);
    }
    
    // Update text
    statusText.textContent = text;
    if (settingsStatus) {
        settingsStatus.textContent = text;
    }
}

function setupAutoSave() {
    const form = document.getElementById('inspectionForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    // Save form data as user types
    inputs.forEach(input => {
        input.addEventListener('input', debounce(() => {
            saveFormDraft();
        }, 1000));
    });
}

function saveFormDraft() {
    const formData = collectFormData();
    localStorage.setItem('inspectionDraft', JSON.stringify(formData));
}

function loadFormDraft() {
    const draft = localStorage.getItem('inspectionDraft');
    if (draft) {
        try {
            const data = JSON.parse(draft);
            populateForm(data);
        } catch (error) {
            console.error('Failed to load draft:', error);
        }
    }
}

function clearFormDraft() {
    localStorage.removeItem('inspectionDraft');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function setupFormSubmission() {
    document.getElementById('inspectionForm').addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!cloudSync) {
        showError('Cloud sync not initialized. Please try again.');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        // Show loading state
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        updateSyncStatus('syncing', 'Saving inspection...');
        
        // Collect form data
        const formData = collectFormData();
        
        // Add metadata
        const inspection = {
            ...formData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            userId: currentUser.uid
        };
        
        // Save to cloud
        await cloudSync.saveInspection(inspection);
        
        // Clear the form and draft
        clearForm();
        clearFormDraft();
        
        // Show success message
        updateSyncStatus('connected', 'Inspection saved');
        showSuccess('Inspection saved successfully!');
        
        // Switch to history tab to show the new inspection
        showSection('history');
        
    } catch (error) {
        console.error('Failed to save inspection:', error);
        updateSyncStatus('offline', 'Save failed');
        showError('Failed to save inspection. Data saved locally and will sync when connection is restored.');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function collectFormData() {
    const form = document.getElementById('inspectionForm');
    const formData = new FormData(form);
    
    // Convert FormData to object
    const data = {};
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            // Handle multiple values (like checkboxes)
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }
    
    // Get individual form fields
    data.propertyAddress = document.getElementById('propertyAddress').value;
    data.unitNumber = document.getElementById('unitNumber').value;
    data.inspectionType = document.getElementById('inspectionType').value;
    data.inspectorName = document.getElementById('inspectorName').value;
    data.inspectionDate = document.getElementById('inspectionDate').value;
    data.additionalNotes = document.getElementById('additionalNotes').value;
    
    // Get checked rooms
    data.rooms = Array.from(document.querySelectorAll('input[name="rooms"]:checked'))
        .map(cb => cb.value);
    
    // Get checked issues
    data.issues = Array.from(document.querySelectorAll('input[name="issues"]:checked'))
        .map(cb => cb.value);
    
    return data;
}

function populateForm(data) {
    // Set text inputs
    if (data.propertyAddress) document.getElementById('propertyAddress').value = data.propertyAddress;
    if (data.unitNumber) document.getElementById('unitNumber').value = data.unitNumber;
    if (data.inspectionType) document.getElementById('inspectionType').value = data.inspectionType;
    if (data.inspectorName) document.getElementById('inspectorName').value = data.inspectorName;
    if (data.inspectionDate) document.getElementById('inspectionDate').value = data.inspectionDate;
    if (data.additionalNotes) document.getElementById('additionalNotes').value = data.additionalNotes;
    
    // Set checkboxes
    if (data.rooms) {
        data.rooms.forEach(room => {
            const checkbox = document.getElementById(room);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    if (data.issues) {
        data.issues.forEach(issue => {
            const checkbox = document.getElementById(issue);
            if (checkbox) checkbox.checked = true;
        });
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function loadInspectionHistory() {
    const container = document.getElementById('historyContainer');
    const loading = document.getElementById('historyLoading');
    
    try {
        loading.style.display = 'flex';
        
        if (!cloudSync) {
            throw new Error('Cloud sync not available');
        }
        
        const inspections = await cloudSync.getInspections();
        displayInspectionHistory(inspections);
        
    } catch (error) {
        console.error('Failed to load inspection history:', error);
        
        // Try to load from local storage as fallback
        const localInspections = getLocalInspections();
        if (localInspections.length > 0) {
            displayInspectionHistory(localInspections);
            updateSyncStatus('offline', 'Showing local data');
        } else {
            container.innerHTML = '<div class="no-history"><div class="icon">📋</div><p>No inspections found.<br>Create your first inspection to get started!</p></div>';
        }
    } finally {
        loading.style.display = 'none';
    }
}

function displayInspectionHistory(inspections) {
    const container = document.getElementById('historyContainer');
    
    if (!inspections || inspections.length === 0) {
        container.innerHTML = '<div class="no-history"><div class="icon">📋</div><p>No inspections found.<br>Create your first inspection to get started!</p></div>';
        return;
    }
    
    // Sort inspections by date (newest first)
    const sortedInspections = inspections.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.inspectionDate);
        const dateB = new Date(b.createdAt || b.inspectionDate);
        return dateB - dateA;
    });
    
    const html = sortedInspections.map(inspection => createInspectionCard(inspection)).join('');
    container.innerHTML = html;
    
    // Add click handlers for expanding cards
    container.querySelectorAll('.inspection-header').forEach(header => {
        header.addEventListener('click', () => {
            const details = header.nextElementSibling;
            details.classList.toggle('show');
        });
    });
}

function createInspectionCard(inspection) {
    const date = new Date(inspection.createdAt || inspection.inspectionDate);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const roomsList = inspection.rooms && inspection.rooms.length > 0 
        ? inspection.rooms.map(room => room.replace('_', ' ')).join(', ')
        : 'No rooms specified';
    
    const issuesList = inspection.issues && inspection.issues.length > 0
        ? inspection.issues.map(issue => `<li>${issue.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>`).join('')
        : '<li style="background: #d4edda; border-color: #c3e6cb; color: #155724;">No issues found</li>';
    
    return `
        <div class="inspection-card">
            <div class="inspection-header">
                <div>
                    <div class="inspection-title">
                        ${inspection.propertyAddress || 'No address specified'}
                        ${inspection.unitNumber ? ` - Unit ${inspection.unitNumber}` : ''}
                    </div>
                    <div class="inspection-date">${formattedDate}</div>
                </div>
            </div>
            <div class="inspection-details">
                <div class="detail-section">
                    <h4>Basic Information</h4>
                    <div class="detail-grid">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">${inspection.inspectionType || 'Not specified'}</span>
                        <span class="detail-label">Inspector:</span>
                        <span class="detail-value">${inspection.inspectorName || 'Not specified'}</span>
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">${inspection.inspectionDate || 'Not specified'}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Rooms Inspected</h4>
                    <div class="detail-value">${roomsList}</div>
                </div>
                
                <div class="detail-section">
                    <h4>Issues Found</h4>
                    <ul class="issues-list">${issuesList}</ul>
                </div>
                
                ${inspection.additionalNotes ? `
                <div class="detail-section">
                    <h4>Additional Notes</h4>
                    <div class="detail-value">${inspection.additionalNotes}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function getLocalInspections() {
    try {
        const stored = localStorage.getItem('inspectionHistory');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to load local inspections:', error);
        return [];
    }
}

// Navigation functions
window.showSection = function(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab button').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName + 'Section').classList.add('active');
    document.getElementById(sectionName + 'Tab').classList.add('active');
    
    // Load history when history tab is selected
    if (sectionName === 'history') {
        loadInspectionHistory();
    }
};

// Form functions
window.clearForm = function() {
    document.getElementById('inspectionForm').reset();
    document.getElementById('inspectionDate').valueAsDate = new Date();
    clearFormDraft();
};

// Settings functions
window.showSettings = function() {
    document.getElementById('settingsOverlay').classList.add('show');
};

window.hideSettings = function() {
    document.getElementById('settingsOverlay').classList.remove('show');
};

window.signOut = async function() {
    try {
        await authManager.signOut();
        hideSettings();
    } catch (error) {
        console.error('Sign out failed:', error);
        showError('Failed to sign out. Please try again.');
    }
};

// Utility functions
function showSuccess(message) {
    // Simple success notification - you could enhance this with a toast system
    console.log('SUCCESS:', message);
}

function showError(message) {
    // Simple error notification - you could enhance this with a toast system
    console.error('ERROR:', message);
    alert(message); // Temporary - replace with better UI
}

// Service worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Handle app install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;
    // You could show an install button here
});

// Listen for real-time updates from CloudSync
document.addEventListener('inspectionAdded', (event) => {
    const inspection = event.detail;
    console.log('New inspection added:', inspection);
    
    // Refresh history if we're on the history tab
    const historySection = document.getElementById('historySection');
    if (historySection.classList.contains('active')) {
        loadInspectionHistory();
    }
    
    updateSyncStatus('connected', 'Data synced');
});

document.addEventListener('inspectionUpdated', (event) => {
    console.log('Inspection updated:', event.detail);
    
    // Refresh history if we're on the history tab
    const historySection = document.getElementById('historySection');
    if (historySection.classList.contains('active')) {
        loadInspectionHistory();
    }
    
    updateSyncStatus('connected', 'Data synced');
});
