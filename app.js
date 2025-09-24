// Pinehurst Quality Control PWA - FIXED VERSION FOR DROPDOWN STAYING OPEN
class PinehurstQC {
    constructor() {
        this.currentInspection = null;
        this.inspections = [];
        this.properties = [
            'Anderson Holmes', 'Aquila Court', 'Aspen', 'AVID', 'Banning Row',
            'Bristol Village', 'BLVD East', 'Carver Crossing', 'Connelly on Eleven',
            'Croft', 'Dove Terrace', 'Dove Tree', 'GVG', 'EBG', 'Oak Park Village',
            'Parkview', 'LHC', 'Northlake Lofts', 'Arbor Lakes', 'Pine Manor',
            'Tyler Street Stacks', 'Lakeville Pointe', 'Hennepin Apartments',
            'Maggie Manor Too', 'Lamplighter Village', 'Regency', 'Richfield 1',
            'Richfield 2', 'Richfield 3', 'River10', 'Rivkin', 'Shores',
            'TC Ortho', 'The Commons', 'Town Terrace', 'Tree Tops',
            'Virginia Apartments', 'Virginia Court', 'Virginia Estates',
            'Virginia Terrace', 'Wexford Commons'
        ];
        
        this.inspectionCategories = {
            'entry-exteriors': {
                title: 'Entry/Exteriors',
                items: [
                    'Main entrance glass cleaned (inside/outside)',
                    'Exterior doors, frames, and handles wiped down',
                    'Trash bins emptied and exterior clean',
                    'Walls free of marks or cobwebs',
                    'Carpets/Vinyl floors vacuumed/mopped'
                ]
            },
            'common-areas': {
                title: 'Common Areas (Lobbies, Hallways, etc.)',
                items: [
                    'Carpets free of stains',
                    'Carpets/Vinyl floors vacuumed/mopped',
                    'Baseboards and corners cleaned',
                    'Walls free of marks or cobwebs',
                    'Furniture (if any) wiped and organized',
                    'Vending machines clean',
                    'Drinking fountains',
                    'Doors free of marks',
                    'Light fixtures dusted/cleaned',
                    'Stairs vacuumed or mopped',
                    'Railings free of dust',
                    'Walls free of marks or cobwebs',
                    'Windows cleaned & free of dust'
                ]
            },
            'restrooms': {
                title: 'Restrooms',
                items: [
                    'Mirrors and glass spotless',
                    'Countertops and sinks clean',
                    'Toilets and urinals spotless',
                    'Floors dry and clean',
                    'Soap dispensers full and clean',
                    'Trash bins emptied and liners replaced'
                ]
            },
            'elevators': {
                title: 'Elevators',
                items: [
                    'Floors clean and free of marks',
                    'Stainless steel polished',
                    'Elevator tracks clean',
                    'Walls and doors free of fingerprints',
                    'Light fixtures clean'
                ]
            },
            'laundry-rooms': {
                title: 'Laundry Rooms',
                items: [
                    'Machines clean and free of lint or debris',
                    'Floors swept and mopped',
                    'Walls free of marks or cobwebs',
                    'Trash emptied and cleaned',
                    'Ventilation clear and clean'
                ]
            },
            'lounge-party-room': {
                title: 'Lounge / Party Room',
                items: [
                    'Furniture clean and arranged properly',
                    'Tables and surfaces wiped down',
                    'Floors clean and free of debris',
                    'Walls free of marks or cobwebs',
                    'Stove clean',
                    'Microwave clean',
                    'Trash bins emptied and clean',
                    'Decorations and plants maintained'
                ]
            },
            'gym': {
                title: 'Gym',
                items: [
                    'Equipment wiped down and in good condition',
                    'Floors clean and free of dust/debris',
                    'Mirrors clean and streak-free',
                    'Walls free of marks or cobwebs',
                    'Trash bins emptied and clean',
                    'Vending machines stocked and clean'
                ]
            },
            'trash-chute-rooms': {
                title: 'Trash Chute Rooms',
                items: [
                    'Trash chute door is clean',
                    'Walls free of marks or cobwebs',
                    'Floors clean and free of debris'
                ]
            },
            'miscellaneous-areas': {
                title: 'Miscellaneous Areas',
                items: [
                    'Windows cleaned (interior/exterior)',
                    'Air vents and AC units cleaned',
                    'Hallway signage clean and visible',
                    'High dust cleaned'
                ]
            }
        };

        this.init();
    }

    async init() {
        await this.loadFromStorage();
        this.setupEventListeners();
        this.populatePropertySelects();
        this.updateDashboard();
        this.hideLoading();
    }

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('main-nav').classList.remove('nav-hidden');
        }, 1500);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn, [data-screen]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.target.getAttribute('data-screen');
                if (screen) this.showScreen(screen);
            });
        });

        // Menu toggle
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.querySelector('.nav-menu').classList.toggle('active');
        });

        // New inspection form
        document.getElementById('start-inspection').addEventListener('click', () => {
            this.startNewInspection();
        });

        // Complete inspection
        document.getElementById('complete-inspection').addEventListener('click', () => {
            this.completeInspection();
        });

        // Photo and note modals
        document.getElementById('add-photo').addEventListener('click', () => {
            this.showModal('photo-modal');
        });

        document.getElementById('add-note').addEventListener('click', () => {
            this.showModal('note-modal');
        });

        // Save photo
        document.getElementById('save-photo').addEventListener('click', () => {
            this.savePhoto();
        });

        // Save note
        document.getElementById('save-note').addEventListener('click', () => {
            this.saveNote();
        });

        // Modal close events
        document.querySelectorAll('.close-btn, .modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Photo input change
        document.getElementById('photo-input').addEventListener('change', (e) => {
            this.previewPhoto(e.target.files[0]);
        });

        // Export functions
        document.getElementById('export-pdf').addEventListener('click', () => {
            this.exportToPDF();
        });

        document.getElementById('export-excel').addEventListener('click', () => {
            this.exportToExcel();
        });

        // Settings
        document.getElementById('manual-sync').addEventListener('click', () => {
            this.syncData();
        });

        document.getElementById('clear-data').addEventListener('click', () => {
            this.clearAllData();
        });

        // Search
        document.getElementById('inspection-search').addEventListener('input', (e) => {
            this.searchInspections(e.target.value);
        });

        // Set current date/time
        const now = new Date();
        const datetime = now.toISOString().slice(0, 16);
        document.getElementById('inspection-date').value = datetime;
    }

    populatePropertySelects() {
        const selects = ['property-select', 'report-property'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                // Clear existing options except first one
                while (select.children.length > 1) {
                    select.removeChild(select.lastChild);
                }
                
                this.properties.forEach(property => {
                    const option = document.createElement('option');
                    option.value = property;
                    option.textContent = property;
                    select.appendChild(option);
                });
            }
        });
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        document.getElementById(screenId).classList.add('active');

        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-screen="${screenId}"]`).classList.add('active');

        // Screen-specific updates
        if (screenId === 'inspections') {
            this.renderInspectionsList();
        } else if (screenId === 'dashboard') {
            this.updateDashboard();
        }
    }

    startNewInspection() {
        const property = document.getElementById('property-select').value;
        const inspector = document.getElementById('inspector-name').value;
        const date = document.getElementById('inspection-date').value;

        if (!property || !inspector || !date) {
            this.showAlert('Error', 'Please fill in all required fields.');
            return;
        }

        this.currentInspection = {
            id: Date.now(),
            property: property,
            inspector: inspector,
            date: new Date(date).toISOString(),
            status: 'in-progress',
            checklist: {},
            photos: [],
            notes: [],
            overallRating: '',
            missCount: 0
        };

        // Initialize checklist
        Object.keys(this.inspectionCategories).forEach(categoryId => {
            this.currentInspection.checklist[categoryId] = {};
            this.inspectionCategories[categoryId].items.forEach((item, index) => {
                this.currentInspection.checklist[categoryId][index] = {
                    text: item,
                    status: 'pending' // pending, done, missed
                };
            });
        });

        this.renderInspectionDetail();
        this.showScreen('inspection-detail');
    }

    renderInspectionDetail() {
        if (!this.currentInspection) return;

        document.getElementById('inspection-title').textContent = 
            `${this.currentInspection.property} - ${new Date(this.currentInspection.date).toLocaleDateString()}`;

        const sectionsContainer = document.getElementById('inspection-sections');
        sectionsContainer.innerHTML = '';

        Object.keys(this.inspectionCategories).forEach(categoryId => {
            const category = this.inspectionCategories[categoryId];
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'inspection-section';
            
            const checkedItems = Object.values(this.currentInspection.checklist[categoryId])
                .filter(item => item.status !== 'pending').length;
            const totalItems = category.items.length;
            
            sectionDiv.innerHTML = `
                <div class="section-header" data-category="${categoryId}">
                    <h3>${category.title} (${checkedItems}/${totalItems})</h3>
                    <span class="section-toggle">▲</span>
                </div>
                <div class="section-content active" id="content-${categoryId}">
                    ${this.renderChecklistItems(categoryId, category.items)}
                </div>
            `;

            sectionsContainer.appendChild(sectionDiv);
        });

        // FIXED: More robust section toggle - prevent any bubbling from child elements
        document.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', (e) => {
                // Debug logging
                console.log('Header clicked:', e.target.className, e.target.tagName);
                
                // Only allow toggle if clicking directly on header, h3, or toggle arrow
                const isValidClick = (
                    e.target === header ||
                    e.target.tagName === 'H3' ||
                    e.target.classList.contains('section-toggle')
                );
                
                if (isValidClick) {
                    const categoryId = header.getAttribute('data-category');
                    const content = document.getElementById(`content-${categoryId}`);
                    const toggle = header.querySelector('.section-toggle');
                    
                    content.classList.toggle('active');
                    toggle.textContent = content.classList.contains('active') ? '▲' : '▼';
                } else {
                    // Prevent any other clicks from propagating
                    e.stopPropagation();
                    e.preventDefault();
                }
            });
        });

        this.updateProgress();
    }

    renderChecklistItems(categoryId, items) {
        return items.map((item, index) => {
            const checklistItem = this.currentInspection.checklist[categoryId][index];
            const isDone = checklistItem.status === 'done';
            const isMissed = checklistItem.status === 'missed';
            
            return `
                <div class="checklist-item" onclick="event.stopPropagation();">
                    <div class="item-text">${item}</div>
                    <div class="item-controls">
                        <div class="toggle-switch ${isDone ? 'done' : ''}" 
                             data-category="${categoryId}" 
                             data-index="${index}"
                             onclick="event.stopPropagation();">
                        </div>
                        <div class="toggle-label ${isDone ? 'done' : (isMissed ? 'missed' : '')}" onclick="event.stopPropagation();">
                            ${isDone ? 'Done' : (isMissed ? 'Missed' : 'Pending')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateProgress() {
        if (!this.currentInspection) return;

        let totalItems = 0;
        let completedItems = 0;

        Object.keys(this.currentInspection.checklist).forEach(categoryId => {
            Object.values(this.currentInspection.checklist[categoryId]).forEach(item => {
                totalItems++;
                if (item.status !== 'pending') completedItems++;
            });
        });

        const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
        document.getElementById('progress-fill').style.width = `${progress}%`;

        // Re-render section headers with updated counts (but don't collapse sections)
        Object.keys(this.inspectionCategories).forEach(categoryId => {
            const header = document.querySelector(`[data-category="${categoryId}"]`);
            if (header) {
                const checkedItems = Object.values(this.currentInspection.checklist[categoryId])
                    .filter(item => item.status !== 'pending').length;
                const totalItems = this.inspectionCategories[categoryId].items.length;
                const h3 = header.querySelector('h3');
                h3.textContent = `${this.inspectionCategories[categoryId].title} (${checkedItems}/${totalItems})`;
            }
        });
    }

    // FIXED: More aggressive event handling to prevent bubbling
    setupDynamicEventListeners() {
        // Use capture phase to catch events before they bubble
        document.addEventListener('click', (e) => {
            console.log('Click detected:', e.target.className, e.target.tagName);
            
            if (e.target.classList.contains('toggle-switch')) {
                console.log('Toggle switch clicked!');
                // Stop all propagation immediately
                e.stopImmediatePropagation();
                e.preventDefault();
                
                const categoryId = e.target.getAttribute('data-category');
                const index = parseInt(e.target.getAttribute('data-index'));
                this.toggleChecklistItem(categoryId, index);
                return false;
            }
            
            // Also catch clicks on the item controls area
            if (e.target.classList.contains('item-controls') || 
                e.target.closest('.item-controls')) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
            
            // Catch clicks on checklist items
            if (e.target.classList.contains('checklist-item') || 
                e.target.closest('.checklist-item')) {
                e.stopPropagation();
                return false;
            }
        }, true); // Use capture phase
    }

    toggleChecklistItem(categoryId, index) {
        console.log('Toggling item:', categoryId, index);
        
        if (!this.currentInspection) return;

        const item = this.currentInspection.checklist[categoryId][index];
        
        // Cycle through states: pending -> done -> missed -> pending
        switch (item.status) {
            case 'pending':
                item.status = 'done';
                break;
            case 'done':
                item.status = 'missed';
                break;
            case 'missed':
                item.status = 'pending';
                break;
        }

        console.log('New status:', item.status);

        this.calculateMissCount();
        this.checkTriggers();
        
        // Update only the specific toggle instead of re-rendering entire section
        this.updateSingleToggle(categoryId, index);
        this.updateProgress();
        this.saveToStorage();
    }

    // Update just one toggle without re-rendering everything
    updateSingleToggle(categoryId, index) {
        const item = this.currentInspection.checklist[categoryId][index];
        const toggleSwitch = document.querySelector(`[data-category="${categoryId}"][data-index="${index}"]`);
        const toggleLabel = toggleSwitch?.nextElementSibling;
        
        if (toggleSwitch && toggleLabel) {
            const isDone = item.status === 'done';
            const isMissed = item.status === 'missed';
            
            // Update toggle switch appearance
            toggleSwitch.className = `toggle-switch ${isDone ? 'done' : ''}`;
            
            // Update label
            toggleLabel.className = `toggle-label ${isDone ? 'done' : (isMissed ? 'missed' : '')}`;
            toggleLabel.textContent = isDone ? 'Done' : (isMissed ? 'Missed' : 'Pending');
        }
    }

    calculateMissCount() {
        if (!this.currentInspection) return;

        let missCount = 0;
        Object.keys(this.currentInspection.checklist).forEach(categoryId => {
            Object.values(this.currentInspection.checklist[categoryId]).forEach(item => {
                if (item.status === 'missed') missCount++;
            });
        });

        this.currentInspection.missCount = missCount;
    }

    checkTriggers() {
        if (!this.currentInspection) return;

        const missCount = this.currentInspection.missCount;
        
        if (missCount >= 10) {
            this.showAlert('Retraining Required', 
                `${missCount} items missed. Immediate retraining and written communication required.`);
        } else if (missCount >= 5) {
            this.showAlert('Communication Required', 
                `${missCount} items missed. Verbal/written communication required.`);
        }

        // Check for repeated misses of same items
        this.checkRepeatedMisses();
    }

    checkRepeatedMisses() {
        // This would check against historical data for same property/item combinations
        // For now, we'll show a placeholder
        const property = this.currentInspection.property;
        const repeatedMisses = this.analyzeRepeatedMisses(property);
        
        if (repeatedMisses.length > 0) {
            this.showAlert('Repeated Issues Detected', 
                `The following items have been missed multiple times at ${property}: ${repeatedMisses.join(', ')}`);
        }
    }

    analyzeRepeatedMisses(property) {
        // Analyze historical inspections for repeated misses
        const propertyInspections = this.inspections.filter(insp => insp.property === property);
        const missedItems = {};
        const repeatedMisses = [];

        propertyInspections.forEach(inspection => {
            Object.keys(inspection.checklist).forEach(categoryId => {
                Object.values(inspection.checklist[categoryId]).forEach(item => {
                    if (item.status === 'missed') {
                        if (!missedItems[item.text]) {
                            missedItems[item.text] = 0;
                        }
                        missedItems[item.text]++;
                    }
                });
            });
        });

        // Add current inspection misses
        if (this.currentInspection) {
            Object.keys(this.currentInspection.checklist).forEach(categoryId => {
                Object.values(this.currentInspection.checklist[categoryId]).forEach(item => {
                    if (item.status === 'missed') {
                        if (!missedItems[item.text]) {
                            missedItems[item.text] = 0;
                        }
                        missedItems[item.text]++;
                    }
                });
            });
        }

        // Check for items missed 5+ times
        Object.keys(missedItems).forEach(itemText => {
            if (missedItems[itemText] >= 5) {
                repeatedMisses.push(itemText);
            }
        });

        return repeatedMisses;
    }

    completeInspection() {
        if (!this.currentInspection) return;

        const overallRating = document.getElementById('overall-rating').value;
        if (!overallRating) {
            this.showAlert('Error', 'Please select an overall cleanliness rating.');
            return;
        }

        this.currentInspection.overallRating = overallRating;
        this.currentInspection.status = 'completed';
        this.currentInspection.completedDate = new Date().toISOString();

        this.inspections.push(this.currentInspection);
        this.saveToStorage();

        this.showAlert('Inspection Complete', 
            `Inspection for ${this.currentInspection.property} has been completed and saved.`);

        this.currentInspection = null;
        this.showScreen('dashboard');
    }

    renderInspectionsList() {
        const listContainer = document.getElementById('inspections-list');
        listContainer.innerHTML = '';

        if (this.inspections.length === 0) {
            listContainer.innerHTML = '<p class="text-center">No inspections found.</p>';
            return;
        }

        this.inspections.reverse().forEach(inspection => {
            const card = document.createElement('div');
            card.className = 'inspection-card';
            
            const statusClass = inspection.status === 'completed' ? 'status-completed' : 'status-pending';
            const ratingClass = this.getRatingClass(inspection.overallRating);
            const passRate = this.calculatePassRate(inspection);
            
            card.innerHTML = `
                <div class="inspection-header">
                    <div>
                        <div class="inspection-title">${inspection.property}</div>
                        <div class="inspection-date">${new Date(inspection.date).toLocaleDateString()} - ${inspection.inspector}</div>
                    </div>
                    <div class="inspection-status ${statusClass}">${inspection.status}</div>
                </div>
                <div class="inspection-summary">
                    <span>Pass Rate: <span class="score-indicator ${ratingClass}">${passRate}%</span></span>
                    <span>Misses: ${inspection.missCount}</span>
                    <span>Rating: <span class="score-indicator ${ratingClass}">${this.formatRating(inspection.overallRating)}</span></span>
                </div>
            `;

            card.addEventListener('click', () => {
                this.viewInspectionDetail(inspection);
            });

            listContainer.appendChild(card);
        });
    }

    calculatePassRate(inspection) {
        let totalItems = 0;
        let doneItems = 0;

        Object.keys(inspection.checklist).forEach(categoryId => {
            Object.values(inspection.checklist[categoryId]).forEach(item => {
                totalItems++;
                if (item.status === 'done') doneItems++;
            });
        });

        return totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
    }

    getRatingClass(rating) {
        const classMap = {
            'excellent': 'score-excellent',
            'good': 'score-good',
            'neutral': 'score-neutral',
            'bad': 'score-bad',
            'extremely-bad': 'score-extremely-bad'
        };
        return classMap[rating] || '';
    }

    formatRating(rating) {
        const formatMap = {
            'excellent': 'Excellent',
            'good': 'Good',
            'neutral': 'Neutral',
            'bad': 'Bad',
            'extremely-bad': 'Extremely Bad'
        };
        return formatMap[rating] || 'Not Rated';
    }

    updateDashboard() {
        const totalInspections = this.inspections.length;
        const pendingSync = this.inspections.filter(insp => !insp.synced).length;
        const avgScore = this.calculateAverageScore();

        document.getElementById('total-inspections').textContent = totalInspections;
        document.getElementById('pending-sync').textContent = pendingSync;
        document.getElementById('avg-score').textContent = `${avgScore}%`;

        // Update recent inspections
        const recentList = document.getElementById('recent-list');
        const recentInspections = this.inspections.slice(-5).reverse();
        
        if (recentInspections.length === 0) {
            recentList.innerHTML = '<p class="text-center">No recent inspections.</p>';
        } else {
            recentList.innerHTML = recentInspections.map(inspection => `
                <div class="inspection-card">
                    <div class="inspection-header">
                        <div>
                            <div class="inspection-title">${inspection.property}</div>
                            <div class="inspection-date">${new Date(inspection.date).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div class="inspection-summary">
                        <span>Pass Rate: ${this.calculatePassRate(inspection)}%</span>
                        <span>Misses: ${inspection.missCount}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    calculateAverageScore() {
        if (this.inspections.length === 0) return 0;

        const totalScore = this.inspections.reduce((sum, inspection) => {
            return sum + this.calculatePassRate(inspection);
        }, 0);

        return Math.round(totalScore / this.inspections.length);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        
        // Focus first input
        const firstInput = modal.querySelector('input, textarea');
        if (firstInput) firstInput.focus();
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
        }
    }

    previewPhoto(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photo-preview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Photo preview">`;
        };
        reader.readAsDataURL(file);
    }

    savePhoto() {
        const fileInput = document.getElementById('photo-input');
        const caption = document.getElementById('photo-caption').value;
        
        if (!fileInput.files[0]) {
            this.showAlert('Error', 'Please select a photo first.');
            return;
        }

        if (!this.currentInspection) {
            this.showAlert('Error', 'No active inspection.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const photo = {
                id: Date.now(),
                data: e.target.result,
                caption: caption,
                timestamp: new Date().toISOString()
            };

            this.currentInspection.photos.push(photo);
            this.saveToStorage();
            this.closeModal(document.getElementById('photo-modal'));
            
            // Reset form
            fileInput.value = '';
            document.getElementById('photo-caption').value = '';
            document.getElementById('photo-preview').innerHTML = '';
            
            this.showAlert('Success', 'Photo saved to inspection.');
        };
        reader.readAsDataURL(fileInput.files[0]);
    }

    saveNote() {
        const noteInput = document.getElementById('note-input');
        const noteText = noteInput.value.trim();
        
        if (!noteText) {
            this.showAlert('Error', 'Please enter a note.');
            return;
        }

        if (!this.currentInspection) {
            this.showAlert('Error', 'No active inspection.');
            return;
        }

        const note = {
            id: Date.now(),
            text: noteText,
            timestamp: new Date().toISOString()
        };

        this.currentInspection.notes.push(note);
        this.saveToStorage();
        this.closeModal(document.getElementById('note-modal'));
        
        // Reset form
        noteInput.value = '';
        
        this.showAlert('Success', 'Note saved to inspection.');
    }

    searchInspections(query) {
        const filteredInspections = this.inspections.filter(inspection => 
            inspection.property.toLowerCase().includes(query.toLowerCase()) ||
            inspection.inspector.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderFilteredInspections(filteredInspections);
    }

    renderFilteredInspections(inspections) {
        const listContainer = document.getElementById('inspections-list');
        listContainer.innerHTML = '';

        if (inspections.length === 0) {
            listContainer.innerHTML = '<p class="text-center">No matching inspections found.</p>';
            return;
        }

        // Use same rendering logic as renderInspectionsList but with filtered data
        inspections.reverse().forEach(inspection => {
            const card = document.createElement('div');
            card.className = 'inspection-card';
            
            const statusClass = inspection.status === 'completed' ? 'status-completed' : 'status-pending';
            const ratingClass = this.getRatingClass(inspection.overallRating);
            const passRate = this.calculatePassRate(inspection);
            
            card.innerHTML = `
                <div class="inspection-header">
                    <div>
                        <div class="inspection-title">${inspection.property}</div>
                        <div class="inspection-date">${new Date(inspection.date).toLocaleDateString()} - ${inspection.inspector}</div>
                    </div>
                    <div class="inspection-status ${statusClass}">${inspection.status}</div>
                </div>
                <div class="inspection-summary">
                    <span>Pass Rate: <span class="score-indicator ${ratingClass}">${passRate}%</span></span>
                    <span>Misses: ${inspection.missCount}</span>
                    <span>Rating: <span class="score-indicator ${ratingClass}">${this.formatRating(inspection.overallRating)}</span></span>
                </div>
            `;

            listContainer.appendChild(card);
        });
    }

    exportToPDF() {
        // This would implement PDF generation
        // For now, show a placeholder
        this.showAlert('Export PDF', 'PDF export functionality would be implemented here using a library like jsPDF.');
    }

    exportToExcel() {
        if (this.inspections.length === 0) {
            this.showAlert('Error', 'No inspections to export.');
            return;
        }

        // Create CSV data (simple Excel-compatible format)
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Headers
        csvContent += "Property,Inspector,Date,Status,Overall Rating,Pass Rate,Miss Count,Notes\n";
        
        // Data
        this.inspections.forEach(inspection => {
            const passRate = this.calculatePassRate(inspection);
            const notes = inspection.notes.map(n => n.text).join('; ');
            
            csvContent += `"${inspection.property}","${inspection.inspector}","${new Date(inspection.date).toLocaleString()}","${inspection.status}","${this.formatRating(inspection.overallRating)}","${passRate}%","${inspection.missCount}","${notes}"\n`;
        });

        // Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `pinehurst_inspections_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showAlert('Success', 'Inspections exported to CSV file.');
    }

    syncData() {
        // This would implement actual sync with server
        this.showAlert('Sync', 'Data sync functionality would connect to your server API here.');
        
        // Mark all as synced for demo
        this.inspections.forEach(inspection => {
            inspection.synced = true;
        });
        this.saveToStorage();
        this.updateDashboard();
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all inspection data? This cannot be undone.')) {
            this.inspections = [];
            this.currentInspection = null;
            this.saveToStorage();
            this.updateDashboard();
            this.renderInspectionsList();
            this.showAlert('Success', 'All data has been cleared.');
        }
    }

    showAlert(title, message) {
        document.getElementById('alert-title').textContent = title;
        document.getElementById('alert-message').textContent = message;
        this.showModal('alert-modal');
    }

    // Storage functions
    async loadFromStorage() {
        try {
            const inspections = localStorage.getItem('pinehurst_inspections');
            if (inspections) {
                this.inspections = JSON.parse(inspections);
            }

            const currentInspection = localStorage.getItem('pinehurst_current_inspection');
            if (currentInspection) {
                this.currentInspection = JSON.parse(currentInspection);
            }

            // Load inspector name
            const savedInspector = localStorage.getItem('pinehurst_inspector_name');
            if (savedInspector) {
                document.getElementById('inspector-name').value = savedInspector;
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('pinehurst_inspections', JSON.stringify(this.inspections));
            
            if (this.currentInspection) {
                localStorage.setItem('pinehurst_current_inspection', JSON.stringify(this.currentInspection));
            } else {
                localStorage.removeItem('pinehurst_current_inspection');
            }

            // Save inspector name
            const inspectorName = document.getElementById('inspector-name').value;
            if (inspectorName) {
                localStorage.setItem('pinehurst_inspector_name', inspectorName);
            }
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new PinehurstQC();
    
    // Set up dynamic event listeners
    app.setupDynamicEventListeners();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
});
