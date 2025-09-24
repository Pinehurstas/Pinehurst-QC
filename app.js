// Global variables
let inspectionHistory = [];

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    // Load existing inspection history
    loadInspectionHistory();
    
    // Set up form submission
    document.getElementById('inspectionForm').addEventListener('submit', handleFormSubmit);
    
    // Set today's date as default
    document.getElementById('inspectionDate').valueAsDate = new Date();
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
            createdAt: new Date().toISOString()
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
    document.getElementById(sectionName + 'Section').classList.add('active');
    document.getElementById(sectionName + 'Tab').classList.add('active');
    
    // Load history when history tab is selected
    if (sectionName === 'history') {
        displayInspectionHistory();
    }
};

// Form functions
window.clearForm = function() {
    document.getElementById('inspectionForm').reset();
    document.getElementById('inspectionDate').valueAsDate = new Date();
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
