/**
 * Child Selector Module
 * Handles child selection dropdown and data switching
 */

// Global variables
let selectedChildId = null;

// Calculate age from birth date
function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const now = new Date();
    const ageInDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
    const ageInWeeks = Math.floor(ageInDays / 7);
    const ageInMonths = Math.floor(ageInDays / 30.44);

    if (ageInMonths < 2) {
        return `${ageInWeeks} week${ageInWeeks !== 1 ? 's' : ''} old`;
    } else {
        return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''} old`;
    }
}

// Populate child selector dropdown with all children
function populateChildSelector() {
    const selector = document.getElementById('child-selector');
    if (!selector) return;

    // Get all children
    const allChildren = window.mockData.children || [];

    if (allChildren.length === 0) {
        selector.innerHTML = '<option value="">No children registered in the system</option>';
        return;
    }

    // Sort children by birth date (newest first)
    const sortedChildren = [...allChildren].sort((a, b) => {
        return new Date(b.birthDate) - new Date(a.birthDate);
    });

    // Build dropdown options
    selector.innerHTML = sortedChildren.map(child => {
        const age = calculateAge(child.birthDate);
        const birthDate = new Date(child.birthDate);
        const formattedDate = birthDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Find mother's name
        const mother = window.mockData.mothers.find(m => m.id === child.motherId);
        const motherName = mother ? mother.name : 'Unknown';

        return `<option value="${child.id}">${child.name} (${age}) - Born ${formattedDate} - Mother: ${motherName}</option>`;
    }).join('');

    // Select first child by default
    if (sortedChildren.length > 0) {
        selectedChildId = sortedChildren[0].id;
        selector.value = selectedChildId;
    }
}

// Handle child selection change
function onChildSelectionChange() {
    const selector = document.getElementById('child-selector');
    const newChildId = selector.value;

    if (!newChildId) return;

    // Show loading indicator
    const loadingDiv = document.getElementById('child-loading');
    const motherInfoSection = document.getElementById('mother-info-section');
    if (loadingDiv) loadingDiv.style.display = 'block';
    if (motherInfoSection) motherInfoSection.style.display = 'none';

    // Small delay to show loading state
    setTimeout(() => {
        selectedChildId = newChildId;
        loadChildDataById(selectedChildId);

        // Hide loading indicator
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (motherInfoSection) motherInfoSection.style.display = 'block';
    }, 300);
}

// Load child data by ID (used by selector)
function loadChildDataById(childId) {
    const child = window.mockData.children.find(c => c.id === childId);
    if (!child) return;

    // Update global currentChild variable if it exists
    if (typeof window.currentChild !== 'undefined') {
        window.currentChild = child;
    }

    // Find mother data
    const mother = window.mockData.mothers.find(m => m.id === child.motherId);

    // Update mother info section
    if (mother) {
        const motherNameDisplay = document.getElementById('mother-name-display');
        const motherNameLink = document.getElementById('mother-name-link');
        if (motherNameDisplay) motherNameDisplay.textContent = mother.name;
        if (motherNameLink) motherNameLink.href = `#`; // Could link to mother profile
    }

    const dobDate = new Date(child.birthDate);
    const dobDisplayInfo = document.getElementById('child-dob-display-info');
    const sexDisplayInfo = document.getElementById('child-sex-display-info');
    const birthWeightDisplay = document.getElementById('child-birth-weight-display');
    const birthLengthDisplay = document.getElementById('child-birth-length-display');

    if (dobDisplayInfo) dobDisplayInfo.textContent = dobDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (sexDisplayInfo) sexDisplayInfo.textContent = child.sex;
    if (birthWeightDisplay) birthWeightDisplay.textContent = `${child.birthWeight} kg`;
    if (birthLengthDisplay) birthLengthDisplay.textContent = `${child.birthLength} cm`;

    // Update Header (Display mode)
    const childNameDisplay = document.getElementById('child-name-display');
    const childNameEdit = document.getElementById('child-name-edit');
    if (childNameDisplay) childNameDisplay.textContent = child.name;
    if (childNameEdit) childNameEdit.value = child.name;

    const ageInWeeks = Math.floor((new Date() - dobDate) / (1000 * 60 * 60 * 24 * 7));
    const childInfoDisplay = document.getElementById('child-info-display');
    if (childInfoDisplay) {
        childInfoDisplay.textContent = `Born ${dobDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${ageInWeeks} Weeks Old`;
    }

    // Update edit fields
    const dobEdit = document.getElementById('child-dob-edit');
    const sexEdit = document.getElementById('child-sex-edit');
    if (dobEdit) dobEdit.value = child.birthDate;
    if (sexEdit) sexEdit.value = child.sex;

    // Update Stats (Display mode)
    const weight = child.currentWeight || child.birthWeight || 'N/A';
    const height = child.currentHeight || child.birthLength || 'N/A';
    const bloodType = child.bloodType || 'Unknown';

    const weightDisplay = document.getElementById('child-weight-display');
    const weightEdit = document.getElementById('child-weight-edit');
    const heightDisplay = document.getElementById('child-height-display');
    const heightEdit = document.getElementById('child-height-edit');
    const bloodDisplay = document.getElementById('child-blood-display');
    const bloodEdit = document.getElementById('child-blood-edit');

    if (weightDisplay) weightDisplay.textContent = `${weight} kg`;
    if (weightEdit) weightEdit.value = weight !== 'N/A' ? weight : '';
    if (heightDisplay) heightDisplay.textContent = `${height} cm`;
    if (heightEdit) heightEdit.value = height !== 'N/A' ? height : '';
    if (bloodDisplay) bloodDisplay.textContent = bloodType;
    if (bloodEdit) bloodEdit.value = bloodType;

    // Update Immunizations
    updateImmunizations(child.id);

    // Render Milestones (if function exists)
    if (typeof renderMilestones === 'function') {
        renderMilestones(child.id);
    }

    // Render Growth Charts (if function exists)
    if (typeof renderGrowthCharts === 'function') {
        renderGrowthCharts(child);
    }
}

// Update immunization table for selected child
function updateImmunizations(childId) {
    const childImmunizations = window.mockData.immunizations.filter(i => i.childId === childId);

    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const vaccineNameDiv = row.querySelector('td:first-child div[style*="font-weight: 600"]');
        if (!vaccineNameDiv) return;

        const vaccineName = vaccineNameDiv.textContent.trim();
        const record = childImmunizations.find(i => i.vaccine === vaccineName || (vaccineName.includes(i.vaccine) && i.vaccine.length > 3));

        const statusCell = row.querySelector('td:last-child');
        if (record) {
            statusCell.innerHTML = `<span class="badge badge-safe"><i class="fas fa-check"></i> Done</span>`;
        } else {
            statusCell.innerHTML = `<span class="badge badge-warning">Pending</span>`;
        }
    });
}

// Initialize child selector on page load
function initializeChildSelector() {
    populateChildSelector();

    // Set up change listener
    const childSelector = document.getElementById('child-selector');
    if (childSelector) {
        childSelector.addEventListener('change', onChildSelectionChange);
    }

    // Load first child's data
    if (selectedChildId) {
        loadChildDataById(selectedChildId);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChildSelector);
} else {
    // DOM is already ready
    initializeChildSelector();
}
