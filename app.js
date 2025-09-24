import { AuthManager } from './auth.js';

// Global variables
let inspectionHistory = [];
let authManager;
let currentUser = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    console.log('Initializing app...');
    
    try {
        // Initialize authentication
        authManager = new AuthManager();
        
        // Set up auth event listeners
        setupAuthEventListeners();
        
        // Listen for authentication state changes
        authManager.onAuthStateChanged(async (user) => {
            console.log('Auth state callback:', user ? 'User present' : 'No user');
            if (user) {
                currentUser = user;
                showMainApp();
                initializeMainApp();
            } else {
                currentUser = null;
                showAuthScreen();
            }
        });
        
    } catch (error) {
        console.error('Failed to initialize auth:', error);
        // If auth fails, show the main app anyway (fallback)
        showMainApp();
        initializeMainApp();
    }
}

function setupAuthEventListeners() {
    // Only set up if auth elements exist
    const authForm = document.getElementById('authForm');
    const authToggleBtn = document.getElementById('authToggleBtn');
    
    if (authForm) {
        authForm.addEventListener('submit', handleAuthSubmit);
    }
    if (authToggleBtn) {
        authToggleBtn.addEventListener('click', toggleAuthMode);
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isSignUp = document.getElementById('authSubmit').dataset.mode === 'signup';
    
    // Show loading state
    const submitBtn = document.getElementById('authSubmit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Processing...';
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
        console.error('Auth error:', error);
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
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    } else {
        alert('Error: ' + message);
    }
}

function hideAuthError() {
    const errorDiv = document.getElementById('authError');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

function showAuthScreen() {
    console.log('Showing auth screen');
    const authScreen = document.getElementById('authScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (authScreen && mainApp) {
        authScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
    } else {
        // If no auth screen exists, show main app
        showMainApp();
    }
}

function showMainApp() {
    console.log('Showing main app');
    const authScreen = document.getElementById('authScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (authScreen) authScreen.classList.add('hidden');
    if (mainApp) {
        mainApp.classList.remove('hidden');
    } else {
        // If main app element doesn't exist, we're in simple mode
        console.log('Main app element not found - using simple mode');
    }
    
    // Update user info if available
    if (currentUser) {
        const userEmail = document.getElementById('userEmail');
        if (userEmail) {
            userEmail.textContent = currentUser.email;
        }
    }
}

function initializeMainApp() {
    console.log('Initializing main app features...');
    
    // Load existing inspection history
    loadInspectionHistory();
    
    // Set up form submission
    const inspectionForm = document.getElementById('inspectionForm');
    if (inspectionForm) {
        inspectionForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Set today's date as default
    const dateInput = document.getElementById('inspectionDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        // Show loading state
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        
        // Collect form data
        const formData = collectFormData();
        
        // Add metadata
        const inspection = {
            ...formData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            userId: currentUser ? currentUser.uid : 'local-user'
        };
        
        // Save inspection
        saveInspection(inspection);
        
        // Clear the form
        clearForm();
        
        // Show success message
        alert('Inspection saved successfully!');
        
        // Switch to history tab to show the new inspection
        showSection('history');
        
    } catch (error) {
        console.error('Failed to save inspection:', error);
        alert('Failed to save inspection. Please try again.');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function collectFormData() {
    const data = {};
    
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

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveInspection(inspection) {
    // Add to history array
    inspectionHistory.unshift(inspection);
    
    // Save to localStorage
    localStorage.setItem('inspectionHistory', JSON.stringify(inspectionHistory));
}

function loadInspectionHistory() {
    try {
        const stored = localStorage.getItem('inspectionHistory');
        if (stored) {
            inspectionHistory = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Failed to load inspection history:', error);
        inspectionHistory = [];
    }
    
    // Display history if we're on history tab
    displayInspectionHistory();
}

function displayInspectionHistory() {
    const container = document.getElementById('historyContainer');
    const loading = document.getElementById('historyLoading');
    
    if (!container) return;
    
    // Hide loading
    if (loading) loading.style.display = 'none';
    
    if (!inspectionHistory || inspectionHistory.length === 0) {
        container.innerHTML = '<div class="no-history"><div class="icon">📋</div><p>No inspections found.<br>Create your first inspection to get started!</p></div>';
        return;
    }
    
    const html = inspectionHistory.map(inspection => createInspectionCard(inspection)).join('');
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
    const targetSection = document.getElementById(sectionName + 'Section');
    const targetTab = document.getElementById(sectionName + 'Tab');
    
    if (targetSection) targetSection.classList.add('active');
    if (targetTab) targetTab.classList.add('active');
    
    // Load history when history tab is selected
    if (sectionName === 'history') {
        displayInspectionHistory();
    }
};

// Form functions
window.clearForm = function() {
    const form = document.getElementById('inspectionForm');
    if (form) {
        form.reset();
        const dateInput = document.getElementById('inspectionDate');
        if (dateInput) {
            dateInput.valueAsDate = new Date();
        }
    }
};

// Settings functions (if they exist)
window.showSettings = function() {
    const overlay = document.getElementById('settingsOverlay');
    if (overlay) overlay.classList.add('show');
};

window.hideSettings = function() {
    const overlay = document.getElementById('settingsOverlay');
    if (overlay) overlay.classList.remove('show');
};

window.signOut = async function() {
    try {
        if (authManager) {
            await authManager.signOut();
        }
        const overlay = document.getElementById('settingsOverlay');
        if (overlay) overlay.classList.remove('show');
    } catch (error) {
        console.error('Sign out failed:', error);
        alert('Failed to sign out. Please try again.');
    }
};

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
