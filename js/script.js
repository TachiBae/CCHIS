document.addEventListener('DOMContentLoaded', function () {
    // Sidebar Active State
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });

    // Mobile Sidebar Toggle
    // (Assuming we might add a toggle button later, but for now just basic logic)

    // Load data from localStorage if available
    if (localStorage.getItem('cchisData')) {
        const savedData = JSON.parse(localStorage.getItem('cchisData'));
        window.mockData = { ...window.mockData, ...savedData };

        // Ensure new data structures exist (migration for old data)
        if (!window.mockData.users) window.mockData.users = [];
        if (!window.mockData.doctors) window.mockData.doctors = [];
        if (!window.mockData.milestones || window.mockData.milestones.length === 0) {
            // Initialize with default milestones from data.js if missing
            const defaultMilestones = [
                { id: 'M1', name: 'Reacts to loud sounds', ageMonths: 0 },
                { id: 'M2', name: 'Calms down when spoken to', ageMonths: 0 },
                { id: 'M3', name: 'Holds head steady', ageMonths: 2 },
                { id: 'M4', name: 'Follows things with eyes', ageMonths: 2 },
                { id: 'M5', name: 'Smiles at people', ageMonths: 2 },
                { id: 'M6', name: 'Reaches for toys', ageMonths: 4 },
                { id: 'M7', name: 'Rolls over', ageMonths: 4 },
                { id: 'M8', name: 'Sits without support', ageMonths: 6 },
                { id: 'M9', name: 'Responds to own name', ageMonths: 6 },
                { id: 'M10', name: 'Crawls', ageMonths: 9 },
                { id: 'M11', name: 'Stands while holding on', ageMonths: 9 },
                { id: 'M12', name: 'Says simple words', ageMonths: 12 }
            ];
            window.mockData.milestones = defaultMilestones;
        }
        if (!window.mockData.childMilestones) {
            window.mockData.childMilestones = [];
        }
        if (!window.mockData.notifications) {
            window.mockData.notifications = [
                { id: 1, userId: 'M006', type: 'success', message: 'Appointment confirmed', time: '2 hours ago', read: false },
                { id: 2, userId: 'M006', type: 'warning', message: 'Vaccine due in 3 days', time: 'Today', read: false },
                { id: 3, userId: 'M006', type: 'info', message: 'New health tip available', time: 'Yesterday', read: false }
            ];
        }

        // Save back to ensure structure is updated
        saveData();
    } else {
        // Initialize notifications if not present in original data
        if (!window.mockData.notifications) {
            window.mockData.notifications = [
                { id: 1, userId: 'M006', type: 'success', message: 'Appointment confirmed', time: '2 hours ago', read: false },
                { id: 2, userId: 'M006', type: 'warning', message: 'Vaccine due in 3 days', time: 'Today', read: false },
                { id: 3, userId: 'M006', type: 'info', message: 'New health tip available', time: 'Yesterday', read: false }
            ];
        }
        saveData();
    }

    // Dashboard Logic
    if (currentPage === 'doctor-dashboard.html' && window.mockData) {
        renderDashboardStats();
        renderAttentionPanel();
    }

    // Access Control Check
    checkAccess();

    // Logout Logic
    const logoutBtn = document.querySelector('a[href="index.html"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Don't clear cchisData on logout, only session info
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('setupUser'); // Also clear registration session
            window.location.href = 'index.html';
        });
    }

    // Update User Profile in Sidebar/Top Bar
    // Update User Profile in Sidebar/Top Bar
    updateUserProfileDisplay();

    // Render Notifications
    renderNotifications();
});

function saveData() {
    localStorage.setItem('cchisData', JSON.stringify(window.mockData));
}

function renderDashboardStats() {
    const stats = window.mockData.stats;

    // Update Stats Cards
    document.getElementById('stat-active-pairs').textContent = stats.activePairs;
    document.getElementById('stat-overdue').textContent = stats.overdueFollowups;
    document.getElementById('stat-immunizations').textContent = stats.upcomingImmunizations;
    document.getElementById('stat-high-risk').textContent = stats.highRiskCases;

    // Update Status Overview
    document.getElementById('status-normal').textContent = stats.statusOverview.normal;
    document.getElementById('status-at-risk').textContent = stats.statusOverview.atRisk;
    document.getElementById('status-critical').textContent = stats.statusOverview.critical;
}

function renderAttentionPanel() {
    const list = document.getElementById('attention-list');
    if (!list) return;

    list.innerHTML = '';
    window.mockData.attentionItems.forEach(item => {
        const li = document.createElement('li');
        li.className = `attention-item ${item.type}`;
        li.innerHTML = `
            <div class="attention-icon"><i class="fas fa-exclamation-circle"></i></div>
            <div class="attention-text">${item.text}</div>
        `;
        list.appendChild(li);
    });
}

function renderNotifications() {
    const notificationList = document.querySelector('.notification-list');
    if (!notificationList) return;

    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (!userId || !window.mockData.notifications) return;

    // Filter notifications for current user
    const userNotifications = window.mockData.notifications.filter(n => {
        // Match by specific User ID OR by Role (if no specific user ID is set, or if it matches)
        const roleMatch = n.recipientRole === userRole;
        const idMatch = n.userId === userId;
        return idMatch || (roleMatch && !n.userId);
    });

    // Sort by time (assuming new ones are added to end, so reverse)
    userNotifications.reverse();

    notificationList.innerHTML = '';

    if (userNotifications.length === 0) {
        notificationList.innerHTML = '<div class="text-muted text-center" style="padding: 20px;">No new notifications</div>';
        return;
    }

    userNotifications.forEach(n => {
        const item = document.createElement('div');
        item.className = `notification-item ${n.isRead ? 'read' : 'unread'}`;
        item.style.display = 'flex';
        item.style.alignItems = 'start';
        item.style.padding = '12px';
        item.style.borderBottom = '1px solid var(--border-color)';
        item.style.cursor = 'pointer';

        // Icon based on type
        let iconColor = '#666';
        if (n.type === 'success') iconColor = 'var(--success-color)';
        if (n.type === 'warning') iconColor = 'var(--warning-color)';
        if (n.type === 'error') iconColor = 'var(--error-color)';
        if (n.type === 'info') iconColor = 'var(--primary-color)';

        item.innerHTML = `
            <div style="margin-right: 12px; color: ${iconColor}; margin-top: 2px;">
                <i class="fas fa-${n.icon || 'bell'}"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: ${n.isRead ? '400' : '600'}; color: var(--text-primary);">
                    ${n.message}
                </div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                    ${n.time}
                </div>
            </div>
            ${!n.isRead ? '<div style="width: 8px; height: 8px; background: var(--primary-color); border-radius: 50%; margin-top: 6px;"></div>' : ''}
        `;

        item.addEventListener('click', () => {
            // Mark as read logic would go here
            if (n.actionUrl) window.location.href = n.actionUrl;
        });

        notificationList.appendChild(item);
    });
}

// Helper to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Profiles Page Logic
function initProfilesPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'profiles.html') {
        // Filter mothers by assigned doctor
        const currentDoctorId = localStorage.getItem('userId');
        const assignedMothers = window.mockData.mothers.filter(m => m.assignedDoctorId === currentDoctorId);
        renderProfilesList(assignedMothers);

        // Search Functionality
        const searchInput = document.getElementById('search-profiles');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = assignedMothers.filter(m =>
                    m.name.toLowerCase().includes(term) ||
                    m.id.toLowerCase().includes(term)
                );
                renderProfilesList(filtered);
            });
        }
    }

    // Modal Close Logic
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
        });
    });

    // New Profile Button
    const newProfileBtn = document.getElementById('btn-new-profile');
    if (newProfileBtn) {
        newProfileBtn.addEventListener('click', () => {
            document.getElementById('new-profile-modal').classList.add('show');
        });
    }

    // New Profile Form Submission
    const newProfileForm = document.getElementById('new-profile-form');
    if (newProfileForm) {
        newProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Generate IDs
            const mId = 'M' + (window.mockData.mothers.length + 1).toString().padStart(3, '0');
            const cId = document.getElementById('np-c-name').value ? 'C' + (window.mockData.children.length + 1).toString().padStart(3, '0') : null;

            // Create Mother Object
            const newMother = {
                id: mId,
                name: document.getElementById('np-m-name').value,
                age: document.getElementById('np-m-age').value,
                address: document.getElementById('np-m-address').value,
                gravida: document.getElementById('np-m-gravida').value,
                para: document.getElementById('np-m-para').value,
                edd: document.getElementById('np-m-edd').value,
                deliveryDate: document.getElementById('np-m-delivery').value || null,
                status: document.getElementById('np-m-status').value,
                riskFactors: [], // Simplified for now
                childId: cId,
                assignedDoctorId: localStorage.getItem('userId') // Assign to current doctor
            };

            // Create Child Object (if applicable)
            if (cId) {
                const newChild = {
                    id: cId,
                    motherId: mId,
                    name: document.getElementById('np-c-name').value,
                    sex: document.getElementById('np-c-sex').value,
                    birthDate: document.getElementById('np-c-dob').value,
                    birthWeight: document.getElementById('np-c-weight').value,
                    birthLength: document.getElementById('np-c-length').value,
                    status: 'Normal'
                };
                window.mockData.children.push(newChild);
            }

            // Update Data
            window.mockData.mothers.push(newMother);

            // Refresh UI
            // Refresh UI with filtered list
            const currentDoctorId = localStorage.getItem('userId');
            const assignedMothers = window.mockData.mothers.filter(m => m.assignedDoctorId === currentDoctorId);
            renderProfilesList(assignedMothers);

            // Close and Reset
            document.getElementById('new-profile-modal').classList.remove('show');
            newProfileForm.reset();
            alert('New profile created successfully!');
        });
    }

    window.onclick = function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
            // Reset forms if needed
            const form = event.target.querySelector('form');
            if (form) form.reset();
        }
    }

    // Child Selector Change
    const childSelector = document.getElementById('child-selector');
    if (childSelector) {
        childSelector.addEventListener('change', (e) => {
            const newChildId = e.target.value;
            if (newChildId) {
                // Close current and reopen with new child
                // Or just update content. Updating content is better but openChildModal does it all.
                // Let's just call openChildModal again, it will update the DOM.
                openChildModal(newChildId);
            }
        });
    }

    // Close on ESC key
    document.addEventListener('keydown', function (event) {
        if (event.key === "Escape") {
            document.querySelectorAll('.modal').forEach(m => {
                m.classList.remove('show');
                const form = m.querySelector('form');
                if (form) form.reset();
            });
        }
    });
}

function renderProfilesList(mothers) {
    const tbody = document.getElementById('profiles-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    mothers.forEach(mother => {
        const child = window.mockData.children.find(c => c.id === mother.childId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span style="cursor: pointer;" onclick="openMotherModal('${mother.id}')">${mother.name}</span></td>
            <td>${child ? `<span style="cursor: pointer;" onclick="openChildModal('${child.id}')">${child.name}</span>` : 'N/A'}</td>
            <td>${formatDate(mother.deliveryDate) || 'Pregnant'}</td>
            <td><span class="badge ${getStatusBadgeClass(mother.status)}">${mother.status}</span></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="openMotherModal('${mother.id}')">View</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'Normal': return 'bg-normal'; // Green
        case 'Safe': return 'bg-normal';
        case 'At Risk': return 'bg-warning'; // Yellow
        case 'Monitoring': return 'bg-warning';
        case 'High Risk': return 'bg-warning';
        case 'Critical': return 'bg-critical'; // Red
        case 'Overdue': return 'bg-critical';
        default: return 'bg-normal';
    }
}

// Modal Functions (Global scope to be accessible from HTML)
window.openMotherModal = function (motherId) {
    const mother = window.mockData.mothers.find(m => m.id === motherId);
    if (!mother) return;

    document.getElementById('m-name').textContent = mother.name;
    document.getElementById('m-dob-age').textContent = `${formatDate(mother.dob)} (${mother.age} yrs)`;
    document.getElementById('m-civil-status').textContent = mother.civilStatus || 'N/A';
    document.getElementById('m-occupation').textContent = mother.occupation || 'N/A';
    document.getElementById('m-contact').textContent = mother.contact || 'N/A';
    document.getElementById('m-email').textContent = mother.email || 'N/A';
    document.getElementById('m-address').textContent = mother.address;
    document.getElementById('m-emergency').textContent = mother.emergencyContact || 'N/A';
    document.getElementById('m-education').textContent = mother.education || 'N/A';

    // Populate risk flags
    const riskContainer = document.getElementById('m-risks');
    riskContainer.innerHTML = mother.riskFactors.length > 0
        ? mother.riskFactors.map(r => `<span class="badge bg-warning mr-1">${r}</span>`).join(' ')
        : '<span class="text-muted">None</span>';

    // Populate Visit History
    const visits = window.mockData.postpartumVisits.filter(v => v.motherId === mother.id);
    const historyContainer = document.querySelector('#content-m-history');

    // Keep the Obstetric History header
    let historyHTML = `
        <p class="text-muted mb-1">Obstetric History</p>
        <h4 id="m-history">G${mother.gravida}P${mother.para}</h4>
        <hr class="mt-2 mb-2" style="border: 0; border-top: 1px solid #eee;">
        <p><strong>Visit History:</strong></p>
    `;

    if (visits.length > 0) {
        historyHTML += `<ul style="list-style: none; padding-left: 0;">`;
        visits.forEach(v => {
            historyHTML += `
                <li class="mb-2 p-2" style="background: #f9f9f9; border-radius: 4px; border-left: 3px solid var(--primary-color);">
                    <div class="d-flex justify-between">
                        <strong>${v.type}</strong>
                        <span class="text-muted" style="font-size: 0.85rem;">${formatDate(v.date)}</span>
                    </div>
                    <div style="font-size: 0.9rem;">${v.notes || 'No notes'}</div>
                    ${v.vitals ? `<div style="font-size: 0.8rem; color: #666; margin-top: 2px;">BP: ${v.vitals.bp} | Temp: ${v.vitals.temp}°C</div>` : ''}
                </li>
            `;
        });
        historyHTML += `</ul>`;
    } else {
        historyHTML += `<p class="text-muted">No visits recorded yet.</p>`;
    }

    historyContainer.innerHTML = historyHTML;
    document.getElementById('mother-modal').classList.add('show');

    // Attach Export Listener
    const exportBtn = document.getElementById('exportPatientBtn');
    if (exportBtn) {
        // Remove old listener to prevent duplicates (cloning is a simple way)
        const newBtn = exportBtn.cloneNode(true);
        exportBtn.parentNode.replaceChild(newBtn, exportBtn);

        newBtn.addEventListener('click', function () {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            this.disabled = true;

            setTimeout(() => {
                if (window.ExportService) {
                    window.ExportService.exportPatientToPDF(motherId);
                } else {
                    alert('Export service not loaded.');
                }
                this.innerHTML = originalText;
                this.disabled = false;
            }, 500);
        });
    }
};

window.openChildModal = function (childId) {
    const child = window.mockData.children.find(c => c.id === childId);
    if (!child) return;

    document.getElementById('c-name').textContent = child.name;
    document.getElementById('c-sex').textContent = child.sex;
    document.getElementById('c-dob').textContent = formatDate(child.birthDate);
    document.getElementById('c-pob').textContent = child.birthPlace || 'N/A';
    document.getElementById('c-weight').textContent = child.birthWeight + ' kg';
    document.getElementById('c-length').textContent = child.birthLength + ' cm';
    document.getElementById('c-blood').textContent = child.bloodType || 'N/A';

    const mother = window.mockData.mothers.find(m => m.id === child.motherId);
    document.getElementById('c-mother').innerHTML = mother ? `<span style="cursor: pointer;" onclick="openMotherModal('${mother.id}'); document.getElementById('child-modal').classList.remove('show');">${mother.name}</span>` : 'N/A';

    // Populate immunizations
    const immList = window.mockData.immunizations.filter(i => i.childId === childId);
    const immContainer = document.getElementById('c-immunizations');
    immContainer.innerHTML = immList.map(i => `
        <div class="d-flex justify-between mb-1" style="border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">
            <span>${i.vaccine}</span>
            <span class="badge ${i.status === 'Completed' ? 'bg-normal' : (i.status === 'Missed' ? 'bg-critical' : 'bg-warning')}">${i.status}</span>
        </div>
    `).join('');

    document.getElementById('child-modal').classList.add('show');

    // Populate Child Selector (Siblings)
    const siblings = window.mockData.children.filter(c => c.motherId === child.motherId);
    const selectorContainer = document.getElementById('child-selector-container');
    const selector = document.getElementById('child-selector');

    if (siblings.length > 1) {
        selectorContainer.style.display = 'inline-block';
        selector.innerHTML = siblings.map(s =>
            `<option value="${s.id}" ${s.id === childId ? 'selected' : ''}>${s.name}</option>`
        ).join('');
        // Add "New Child" option if needed, but for now just siblings
    } else {
        selectorContainer.style.display = 'none';
    }
};

// Tab Switching Logic
window.switchTab = function (tabId, contentId) {
    // Remove active class from all tabs in the same container
    const container = document.getElementById(contentId).parentElement;
    container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(contentId).classList.add('active');

    // Update buttons
    const btnContainer = document.getElementById(tabId).parentElement;
    btnContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
};

// Postpartum Page Logic
function initPostpartumPage() {
    renderPostpartumTable();

    // Form Submission Mock
    const form = document.getElementById('visit-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Saving...';
            btn.disabled = true;

            setTimeout(() => {
                // Create new visit object
                const newVisit = {
                    id: 'V' + (window.mockData.postpartumVisits.length + 1).toString().padStart(3, '0'),
                    motherId: window.mockData.mothers.find(m => m.name === document.getElementById('v-mother-name').value).id,
                    type: 'Custom Visit', // Ideally this should be selectable or auto-determined
                    date: form.querySelector('input[type="date"]').value,
                    status: 'Completed',
                    notes: form.querySelector('textarea').value,
                    vitals: {
                        bp: form.querySelectorAll('input[type="text"]')[0].value,
                        temp: form.querySelectorAll('input[type="text"]')[1].value,
                        hr: form.querySelectorAll('input[type="text"]')[2].value
                    }
                };

                window.mockData.postpartumVisits.push(newVisit);

                alert('Visit recorded successfully!');
                document.getElementById('visit-modal').classList.remove('show');
                btn.innerText = originalText;
                btn.disabled = false;
                form.reset();

                // Refresh table
                renderPostpartumTable();
            }, 1000);
        });
    }
}

function renderPostpartumTable() {
    const tbody = document.getElementById('postpartum-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    const currentDoctorId = localStorage.getItem('userId');
    const assignedMothers = window.mockData.mothers.filter(m => m.assignedDoctorId === currentDoctorId);

    assignedMothers.forEach(mother => {
        // Find visits for this mother
        const visits = window.mockData.postpartumVisits.filter(v => v.motherId === mother.id);

        const v48 = getVisitStatus(visits, '48-hour');
        const v7d = getVisitStatus(visits, '7-day');
        const v6w = getVisitStatus(visits, '6-week');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="font-weight-bold">${mother.name}</div>
                <div class="text-muted" style="font-size: 0.85rem;">Delivered: ${formatDate(mother.deliveryDate)}</div>
            </td>
            <td>${renderVisitBadge(v48)}</td>
            <td>${renderVisitBadge(v7d)}</td>
            <td>${renderVisitBadge(v6w)}</td>
            <td>
                ${getRiskStatusBadge(mother)}
            </td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="openVisitModal('${mother.id}')">Record Visit</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getVisitStatus(visits, type) {
    const visit = visits.find(v => v.type === type);
    if (visit) return visit.status;
    return 'Pending'; // Default
}

function getRiskStatusBadge(mother) {
    // Logic: Safe (Green), Monitoring (Yellow), Overdue/Flagged (Red)

    // Check for Overdue visits
    const visits = window.mockData.postpartumVisits.filter(v => v.motherId === mother.id);
    const hasOverdue = visits.some(v => v.status === 'Overdue');

    // Check for Critical status
    if (mother.status === 'Critical' || hasOverdue) {
        return '<span class="badge bg-critical"><i class="fas fa-exclamation-circle"></i> Overdue (Flagged)</span>';
    }

    // Check for Monitoring
    if (mother.status === 'At Risk' || mother.status === 'High Risk' || mother.riskFactors.length > 0) {
        return '<span class="badge bg-warning"><i class="fas fa-eye"></i> Monitoring</span>';
    }

    // Default Safe
    return '<span class="badge bg-normal"><i class="fas fa-check-circle"></i> Safe</span>';
}

function renderVisitBadge(status) {
    if (status === 'Completed') return '<span class="badge bg-normal"><i class="fas fa-check"></i> Done</span>';
    if (status === 'Overdue') return '<span class="badge bg-critical"><i class="fas fa-clock"></i> Overdue</span>';
    if (status === 'Due Today') return '<span class="badge bg-warning"><i class="fas fa-exclamation"></i> Due</span>';
    return '<span class="badge" style="background: #eee; color: #666;">Pending</span>';
}

window.openVisitModal = function (motherId) {
    const mother = window.mockData.mothers.find(m => m.id === motherId);
    if (!mother) return;
    document.getElementById('v-mother-name').value = mother.name;
    document.getElementById('visit-modal').classList.add('show');
};

// Growth Page Logic
// Growth Page Logic
function initGrowthPage() {
    // Get children of assigned mothers
    const currentDoctorId = localStorage.getItem('userId');
    const assignedMothers = window.mockData.mothers.filter(m => m.assignedDoctorId === currentDoctorId);
    const assignedMotherIds = assignedMothers.map(m => m.id);
    const assignedChildren = window.mockData.children.filter(c => assignedMotherIds.includes(c.motherId));

    if (assignedChildren.length === 0) {
        // Handle empty state
        document.querySelector('.main-content').innerHTML = `
            <div class="text-center" style="padding: 48px;">
                <i class="fas fa-child" style="font-size: 48px; color: var(--text-secondary); margin-bottom: 16px;"></i>
                <h3>No Children Found</h3>
                <p class="text-muted">You don't have any patients with registered children yet.</p>
            </div>
        `;
        return;
    }

    // Default to first child or use URL param if we had one
    let currentChildId = assignedChildren[0].id;

    updateGrowthPage(currentChildId);

    // Event Listener for Dropdown
    const selector = document.getElementById('growth-child-select');
    if (selector) {
        selector.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'add-new') {
                // Handle Add New Child
                alert('Redirecting to Add New Child form...');
                // In a real app, this would open a modal or redirect
                selector.value = currentChildId; // Reset for now
            } else {
                currentChildId = val;
                updateGrowthPage(currentChildId);
            }
        });
    }
}

function updateGrowthPage(childId) {
    const child = window.mockData.children.find(c => c.id === childId);
    if (!child) return;

    // Update Info Header
    document.getElementById('gc-name').textContent = child.name;
    // Calculate age (approx)
    const age = calculateAge(child.birthDate);
    document.getElementById('gc-details').textContent = `${age} • ${child.sex}`;

    // Populate Dropdown (Siblings)
    const selector = document.getElementById('growth-child-select');
    if (selector) {
        // Filter siblings to only those assigned to this doctor (though siblings usually share a mother, so implicit)
        // But for the dropdown list, we might want to show ALL assigned children, not just siblings?
        // The original code showed siblings. Let's stick to siblings for now, but we need to make sure
        // we can switch to ANY assigned child.
        // Actually, the original code was "siblings". If I want to switch between ANY patient, 
        // I should list all assigned children.

        const currentDoctorId = localStorage.getItem('userId');
        const assignedMothers = window.mockData.mothers.filter(m => m.assignedDoctorId === currentDoctorId);
        const assignedMotherIds = assignedMothers.map(m => m.id);
        const allAssignedChildren = window.mockData.children.filter(c => assignedMotherIds.includes(c.motherId));

        if (allAssignedChildren.length <= 1) {
            selector.parentElement.style.display = 'none'; // Hide if no siblings
        } else {
            selector.parentElement.style.display = 'block';
            selector.innerHTML = siblings.map(s => `
                <option value="${s.id}" ${s.id === childId ? 'selected' : ''}>
                    ${s.name} (${formatDate(s.birthDate)})
                </option>
            `).join('') + '<option value="add-new" style="font-weight: bold; color: var(--primary-color);">+ Add New Child</option>';
        }
    }

    renderImmunizationSchedule(childId);
    renderGrowthCharts(childId);
}

function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const now = new Date();
    const diff = now - birth;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 30) return `${days} days`;
    const months = Math.floor(days / 30.44);
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    return `${years} yrs`;
}

function renderImmunizationSchedule(childId) {
    const tbody = document.getElementById('imm-table-body');
    if (!tbody) return;

    const imms = window.mockData.immunizations.filter(i => i.childId === childId);

    // Add some dummy future schedule items based on child age/logic
    // For this mock, we'll just use what's in data + some statics if empty
    let schedule = [...imms];

    if (schedule.length === 0) {
        schedule = [
            { vaccine: "BCG", ageDue: "At Birth", status: "Pending", dueDate: "2023-12-01" },
            { vaccine: "Hepatitis B", ageDue: "At Birth", status: "Pending", dueDate: "2023-12-01" }
        ];
    }

    tbody.innerHTML = schedule.map(i => `
        <tr>
            <td>${i.vaccine}</td>
            <td>${i.ageDue || 'At Birth'}</td>
            <td>${i.dateGiven ? formatDate(i.dateGiven) : '-'}</td>
            <td>${renderVisitBadge(i.status)}</td>
            <td style="text-align: right;">
                <button class="btn btn-sm btn-outline">Update</button>
            </td>
        </tr>
    `).join('');
}

function renderGrowthCharts(childId) {
    const child = window.mockData.children.find(c => c.id === childId);
    if (!child) return;

    // Destroy existing charts if they exist to avoid canvas reuse issues
    if (window.weightChartInstance) window.weightChartInstance.destroy();
    if (window.heightChartInstance) window.heightChartInstance.destroy();

    // Mock data generation based on birth weight/length
    const bw = child.birthWeight;
    const bl = child.birthLength;

    // Weight Chart
    const ctxWeight = document.getElementById('weightChart').getContext('2d');
    window.weightChartInstance = new Chart(ctxWeight, {
        type: 'line',
        data: {
            labels: ['0', '1', '2', '3', '4', '5', '6'],
            datasets: [{
                label: 'Child Weight (kg)',
                data: [bw, bw + 1.2, bw + 2.5, bw + 3.1, null, null, null],
                borderColor: '#667eea',
                tension: 0.4
            }, {
                label: 'WHO 50th Percentile',
                data: [3.3, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9],
                borderColor: '#ccc',
                borderDash: [5, 5],
                pointRadius: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Height Chart
    const ctxHeight = document.getElementById('heightChart').getContext('2d');
    window.heightChartInstance = new Chart(ctxHeight, {
        type: 'line',
        data: {
            labels: ['0', '1', '2', '3', '4', '5', '6'],
            datasets: [{
                label: 'Child Length (cm)',
                data: [bl, bl + 5, bl + 9, bl + 12, null, null, null],
                borderColor: '#28a745',
                tension: 0.4
            }, {
                label: 'WHO 50th Percentile',
                data: [49.9, 54.7, 58.4, 61.4, 63.9, 65.9, 67.6],
                borderColor: '#ccc',
                borderDash: [5, 5],
                pointRadius: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Reports Page Logic
function initReportsPage() {
    renderReportCharts();

    document.getElementById('download-report').addEventListener('click', () => {
        alert('Generating PDF Report... This may take a moment.');
    });
}

function renderReportCharts() {
    // Deliveries Trend
    new Chart(document.getElementById('deliveriesChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Monthly Deliveries',
                data: [12, 19, 15, 25, 22, 30],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true }
    });

    // Visit Completion Rate
    new Chart(document.getElementById('visitsChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Missed', 'Rescheduled'],
            datasets: [{
                data: [75, 15, 10],
                backgroundColor: ['#28a745', '#dc3545', '#ffc107']
            }]
        },
        options: { responsive: true }
    });

    // Immunization Coverage
    new Chart(document.getElementById('immCoverageChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['BCG', 'Hep B', 'DPT 1', 'Polio 1', 'PCV 1'],
            datasets: [{
                label: 'Coverage %',
                data: [95, 95, 88, 85, 82],
                backgroundColor: '#667eea'
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
    });

    // Risk Distribution
    new Chart(document.getElementById('riskChart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: ['Normal', 'At Risk', 'Critical'],
            datasets: [{
                data: [85, 10, 5],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545']
            }]
        },
        options: { responsive: true }
    });
}

// Access Control
function checkAccess() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const userRole = localStorage.getItem('userRole');

    // Public pages (no authentication required)
    const publicPages = ['index.html', 'registration.html', ''];
    if (publicPages.includes(currentPage)) return;

    // Semi-public pages (accessible during registration flow)
    if (currentPage === 'profile-setup.html') {
        // Check if user has a setup session
        const setupUser = localStorage.getItem('setupUser');
        if (!setupUser) {
            window.location.href = 'registration.html';
        }
        return;
    }

    if (!userRole) {
        // Not logged in - redirect to login
        window.location.href = 'index.html';
        return;
    }

    // Doctor Pages
    const doctorPages = [
        'doctor-dashboard.html',
        'profiles.html',
        'postpartum.html',
        'growth.html',
        'reports.html',
        'appointment-requests.html',
        'doctor-profile.html'
    ];

    // Mother Pages
    const motherPages = [
        'mother-dashboard.html',
        'my-profile.html',
        'my-child.html',
        'my-appointments.html',
        'medical-history.html',
        'my-records.html',
        'contact-worker.html'
    ];

    if (userRole === 'doctor') {
        if (motherPages.includes(currentPage)) {
            // Doctor trying to access mother pages
            window.location.href = 'doctor-dashboard.html';
        }
    }

    if (userRole === 'mother') {
        if (doctorPages.includes(currentPage)) {
            // Mother trying to access doctor pages
            window.location.href = 'mother-dashboard.html';
        }
    }
}

function updateUserProfileDisplay() {
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');

    if (userName) {
        // For doctor dashboard top bar - target the name element
        const topBarName = document.querySelector('.user-nav div[style*="font-weight: 600"]');
        if (topBarName) {
            topBarName.textContent = userName;
        }

        // For mother dashboard sidebar or other elements with .user-profile class
        const profileName = document.querySelector('.user-profile div[style*="font-weight: 600"]');
        if (profileName) {
            profileName.textContent = userName;
        }

        // Update role display
        const roleElement = document.querySelector('.user-nav div[style*="font-size: 11px"]') ||
            document.querySelector('.user-profile div[style*="font-size: 0.8rem"]');
        if (roleElement) {
            roleElement.textContent = userRole === 'doctor' ? 'Healthcare Provider' : 'Mother';
        }
    }
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage === 'profiles.html') {
        initProfilesPage();
    } else if (currentPage === 'postpartum.html') {
        initPostpartumPage();
    } else if (currentPage === 'growth.html') {
        initGrowthPage();
    } else if (currentPage === 'reports.html') {
        initReportsPage();
    } else if (currentPage === 'appointment-requests.html') {
        initAppointmentRequestsPage();
    } else if (currentPage === 'doctor-dashboard.html') {
        initDoctorDashboard();
    } else if (currentPage === 'mother-dashboard.html') {
        initMotherDashboard();
    } else if (currentPage === 'my-profile.html') {
        initMyProfile();
    } else if (currentPage === 'my-child.html') {
        initMyChild();
    } else if (currentPage === 'my-appointments.html') {
        initMyAppointments();
    } else if (currentPage === 'my-records.html') {
        initMyRecords();
    }
});

// Doctor's Interface Functions

function initDoctorDashboard() {
    // Update user profile display
    updateUserProfileDisplay();
}

// Mother's Interface Functions

function initMotherDashboard() {
    const userId = localStorage.getItem('userId'); // e.g., M006
    if (!userId) return;

    // Update user profile display
    updateUserProfileDisplay();

    // Find mother data
    const mother = window.mockData.mothers.find(m => m.id === userId);
    if (!mother) return;

    // Update Welcome Message
    const userName = localStorage.getItem('userName');
    const welcomeMsg = document.querySelector('h3[style*="color: #d63384"]');
    if (welcomeMsg && userName) {
        welcomeMsg.textContent = `Welcome back, ${userName}! 👋`;
    }

    // Update Stats (Mock logic)
    // Next Appt
    // Find upcoming appointments for this mother? We don't have a centralized appt list yet, just postpartum visits.
    // Let's use postpartum visits for now.
    const visits = window.mockData.postpartumVisits.filter(v => v.motherId === userId && v.status === 'Upcoming');
    const nextApptEl = document.getElementById('my-next-appt');
    if (nextApptEl) {
        if (visits.length > 0) {
            nextApptEl.textContent = `${visits[0].type} Visit - ${visits[0].date}`;
        } else {
            nextApptEl.textContent = "No upcoming appointments";
        }
    }

    // Next Vaccine
    // Find child
    const child = window.mockData.children.find(c => c.motherId === userId);
    if (child) {
        const vaccines = window.mockData.immunizations.filter(i => i.childId === child.id && i.status === 'Upcoming');
        const nextVaccineEl = document.getElementById('my-next-vaccine');
        if (nextVaccineEl) {
            if (vaccines.length > 0) {
                nextVaccineEl.textContent = `${vaccines[0].vaccine} - Due ${vaccines[0].dueDate}`;
            } else {
                nextVaccineEl.textContent = "All up to date!";
            }
        }
    }

    // Render Notifications
    renderMotherNotifications(userId);
}

function renderMotherNotifications(userId) {
    const notifContainer = document.querySelector('.card h3:contains("Notifications")')?.closest('.card');
    // The selector above is pseudo-code-ish because :contains isn't standard JS.
    // Let's find the card that contains the "Notifications" header.
    const headers = document.querySelectorAll('h3');
    let notifCard = null;
    headers.forEach(h => {
        if (h.textContent.includes('Notifications')) {
            notifCard = h.closest('.card');
        }
    });

    if (!notifCard) return;

    const notifications = window.mockData.notifications.filter(n => n.userId === userId);

    // Update count in header
    const header = notifCard.querySelector('h3');
    if (header) header.textContent = `🔔 Notifications (${notifications.filter(n => !n.read).length})`;

    const listContainer = notifCard.querySelector('div[style*="flex-direction: column"]');
    if (!listContainer) return;

    if (notifications.length === 0) {
        listContainer.innerHTML = '<p class="text-muted text-small">No new notifications.</p>';
        return;
    }

    listContainer.innerHTML = notifications.slice(0, 5).map(n => {
        let iconClass = 'fa-info-circle';
        let colorVar = 'var(--primary-color)';

        if (n.type === 'success') {
            iconClass = 'fa-check-circle';
            colorVar = 'var(--success-color)';
        } else if (n.type === 'warning') {
            iconClass = 'fa-exclamation-circle';
            colorVar = 'var(--warning-color)';
        } else if (n.type === 'critical') {
            iconClass = 'fa-times-circle';
            colorVar = 'var(--error-color)'; // Assuming error-color exists or use critical color
        }

        return `
        <div style="display: flex; gap: 12px; align-items: flex-start;">
            <div style="color: ${colorVar}; margin-top: 2px;"><i class="fas ${iconClass}"></i></div>
            <div>
                <div style="font-size: 14px;">${n.message}</div>
                <div class="text-small text-muted">${n.time}</div>
            </div>
        </div>
        `;
    }).join('');
}

function initMyProfile() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const mother = window.mockData.mothers.find(m => m.id === userId);
    if (!mother) return;

    // Populate fields
    setText('my-name', mother.name);
    setText('my-dob-age', `${mother.dob} (${mother.age} yrs)`);
    setText('my-civil-status', mother.civilStatus);
    setText('my-occupation', mother.occupation);
    setText('my-contact', mother.contact);
    setText('my-email', mother.email);
    setText('my-address', mother.address);
    setText('my-emergency', mother.emergencyContact);
}

function initMyChild() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const child = window.mockData.children.find(c => c.motherId === userId);
    if (!child) return;

    // Populate fields
    setText('my-c-name', child.name);
    setText('my-c-sex', child.sex);
    setText('my-c-dob', child.birthDate);
    setText('my-c-pob', child.birthPlace);
    setText('my-c-weight', `${child.birthWeight} kg`);
    setText('my-c-length', `${child.birthLength} cm`);
    setText('my-c-blood', child.bloodType);

    // Populate Immunizations
    const immunizations = window.mockData.immunizations.filter(i => i.childId === child.id);
    const tbody = document.getElementById('my-c-immunizations');
    if (tbody && immunizations.length > 0) {
        tbody.innerHTML = immunizations.map(i => `
            <tr>
                <td>${i.vaccine}</td>
                <td>${i.dueDate || 'At Birth'}</td>
                <td>${i.dateGiven || '-'}</td>
                <td><span class="badge bg-${i.status === 'Completed' ? 'normal' : 'warning'}">${i.status}</span></td>
            </tr>
        `).join('');
    }

    // Render Growth Charts
    renderMotherGrowthCharts(child);
}

function renderMotherGrowthCharts(child) {
    // Simulate growth data based on birth stats
    const birthWeight = child.birthWeight;
    const birthLength = child.birthLength;

    // Mock data generation (just for visual)
    const weightData = [birthWeight, birthWeight + 0.8, birthWeight + 1.5, birthWeight + 2.1];
    const heightData = [birthLength, birthLength + 3, birthLength + 6, birthLength + 8];
    const labels = ['Birth', '1 Month', '2 Months', '3 Months'];

    // Weight Chart
    const ctxWeight = document.getElementById('motherWeightChart');
    if (ctxWeight) {
        new Chart(ctxWeight.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Weight (kg)',
                    data: weightData,
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Standard',
                    data: [3.3, 4.5, 5.6, 6.4], // WHO approx
                    borderColor: '#ccc',
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // Height Chart
    const ctxHeight = document.getElementById('motherHeightChart');
    if (ctxHeight) {
        new Chart(ctxHeight.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Length (cm)',
                    data: heightData,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Standard',
                    data: [49.9, 54.7, 58.4, 61.4], // WHO approx
                    borderColor: '#ccc',
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

function initMyAppointments() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    // Render Appointments
    renderMyAppointments(userId);

    // Form Submission
    const form = document.getElementById('appointment-request-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = this.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'Submitting...';
            btn.disabled = true;

            const date = this.querySelector('input[type="date"]').value;
            const time = this.querySelector('select').value;
            const reason = this.querySelectorAll('select')[1].value;

            setTimeout(() => {
                // Add to mock data
                const newRequest = {
                    id: `R${Date.now()}`,
                    motherId: userId,
                    motherName: localStorage.getItem('userName'),
                    date: date,
                    time: time,
                    reason: reason,
                    status: 'Pending',
                    submitted: new Date().toISOString().split('T')[0]
                };
                window.mockData.appointmentRequests.push(newRequest);

                alert('Your appointment request has been submitted. You will be notified once confirmed.');
                btn.innerText = originalText;
                btn.disabled = false;
                this.reset();

                renderMyAppointments(userId);
            }, 1000);
        });
    }
}

function renderMyAppointments(userId) {
    const list = document.querySelector('.appointment-list');
    if (!list) return;

    const requests = window.mockData.appointmentRequests.filter(r => r.motherId === userId);
    // Also include confirmed visits from postpartumVisits? For now just requests.

    if (requests.length === 0) {
        list.innerHTML = '<p class="text-muted text-center">No appointments found.</p>';
        return;
    }

    list.innerHTML = requests.map(r => `
        <div class="d-flex justify-between align-center p-3 mb-2" style="background: ${r.status === 'Pending' ? '#fff9db' : '#e6fcf5'}; border-radius: 8px; border-left: 4px solid ${r.status === 'Pending' ? '#f59f00' : '#0ca678'};">
            <div>
                <div class="font-weight-bold">${r.reason}</div>
                <div class="text-muted" style="font-size: 0.9rem;">${r.date} at ${r.time}</div>
            </div>
            <span class="badge bg-${r.status === 'Pending' ? 'warning' : 'normal'}">${r.status}</span>
        </div>
    `).join('');
}

function initAppointmentRequestsPage() {
    // Initialize tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Filter content
            const status = tab.textContent.trim().split(' ')[0]; // Extract "Pending", "Approved", etc.
            renderAppointmentRequests(status);
        });
    });

    // Initial render
    renderAppointmentRequests('Pending');
    updateRequestBadges();

    // Create Appointment Modal Logic
    const createBtn = document.querySelector('.btn-primary'); // Assuming it's the first/only primary button in header
    // Better selector:
    const createApptBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Create Appointment'));

    if (createApptBtn) {
        createApptBtn.addEventListener('click', () => {
            openCreateAppointmentModal();
        });
    }

    // Close Modal Logic
    const modal = document.getElementById('create-appointment-modal');
    if (modal) {
        modal.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.remove('show');
            });
        });

        // Form Submission
        const form = document.getElementById('create-appointment-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                handleCreateAppointment(form);
            });
        }
    }
}

function openCreateAppointmentModal() {
    const modal = document.getElementById('create-appointment-modal');
    if (!modal) return;

    // Populate Patients
    const select = document.getElementById('ca-patient');
    if (select) {
        select.innerHTML = '<option value="">Select Patient</option>' +
            window.mockData.mothers.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    }

    // Set default date to tomorrow
    const dateInput = document.getElementById('ca-date');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
    }

    modal.classList.add('show');
}

function handleCreateAppointment(form) {
    const motherId = document.getElementById('ca-patient').value;
    const type = document.getElementById('ca-type').value;
    const date = document.getElementById('ca-date').value;
    const time = document.getElementById('ca-time').value;
    const notes = document.getElementById('ca-notes').value;

    const mother = window.mockData.mothers.find(m => m.id === motherId);
    if (!mother) return;

    // Create new appointment object
    const newAppt = {
        id: `R${Date.now()}`,
        motherId: motherId,
        motherName: mother.name,
        date: date,
        time: time,
        reason: type,
        status: 'Confirmed', // Created by doctor, so auto-confirmed
        submitted: new Date().toISOString().split('T')[0],
        notes: notes
    };

    window.mockData.appointmentRequests.unshift(newAppt);

    // Add Notification for Mother
    window.mockData.notifications.unshift({
        id: Date.now(),
        userId: motherId,
        type: 'success',
        message: `New appointment scheduled: ${type} on ${date} at ${time}.`,
        time: 'Just now',
        read: false
    });

    saveData();

    alert('Appointment created successfully!');
    document.getElementById('create-appointment-modal').classList.remove('show');
    form.reset();

    // Refresh list if on Confirmed tab, or just update badges
    updateRequestBadges();

    // If we are on the Confirmed tab, re-render
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab && activeTab.textContent.includes('Approved')) {
        renderAppointmentRequests('Confirmed');
    }
}

function renderAppointmentRequests(status = 'Pending') {
    const tbody = document.getElementById('requests-table-body');
    if (!tbody) return;

    // Map tab names to data statuses if necessary
    let dataStatus = status;
    if (status === 'Approved') dataStatus = 'Confirmed';

    tbody.innerHTML = ''; // Clear existing content

    const currentDoctorId = localStorage.getItem('userId');
    const assignedMothers = window.mockData.mothers.filter(m => m.assignedDoctorId === currentDoctorId);
    const assignedMotherIds = assignedMothers.map(m => m.id);

    const filteredRequests = window.mockData.appointmentRequests.filter(r => {
        // Filter by status
        if (dataStatus !== 'All' && r.status !== dataStatus) return false;
        // Filter by assigned doctor
        return assignedMotherIds.includes(r.motherId);
    });

    if (filteredRequests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No ${status.toLowerCase()} requests found</td></tr>`;
        return;
    }

    tbody.innerHTML = filteredRequests.map(r => `
        <tr>
            <td>
                <div class="d-flex align-center">
                    <div class="avatar-sm mr-2" style="background: var(--primary-color); color: white; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">${r.motherName.charAt(0)}</div>
                    <div>${r.motherName}</div>
                </div>
            </td>
            <td>${formatDate(r.date)} <br> <small class="text-muted">${r.time}</small></td>
            <td>${r.reason}</td>
            <td>${formatDate(r.submitted)}</td>
            <td><span class="badge ${getStatusBadgeClass(r.status)}">${r.status}</span></td>
            <td style="text-align: right;">
                ${r.status === 'Pending' ? `
                <button class="btn btn-sm btn-primary" onclick="approveAppointment('${r.id}')" title="Approve"><i class="fas fa-check"></i></button>
                <button class="btn btn-sm btn-outline" onclick="openDeclineModal('${r.id}')" title="Decline"><i class="fas fa-times"></i></button>
                ` : `
                <button class="btn btn-sm btn-outline" onclick="undoAppointment('${r.id}')" title="Undo / Revert to Pending"><i class="fas fa-undo"></i></button>
                `}
            </td>
        </tr>
    `).join('');
}

function updateRequestBadges() {
    const counts = {
        Pending: 0,
        Confirmed: 0,
        Declined: 0
    };

    window.mockData.appointmentRequests.forEach(r => {
        if (counts[r.status] !== undefined) {
            counts[r.status]++;
        }
    });

    // Update badges in tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        const status = tab.textContent.trim().split(' ')[0];
        const badge = tab.querySelector('.badge');
        if (badge) {
            let count = 0;
            if (status === 'Pending') count = counts.Pending;
            if (status === 'Approved') count = counts.Confirmed;
            if (status === 'Declined') count = counts.Declined;
            badge.textContent = count;
        }
    });
}

// Global functions for inline onclick
window.approveAppointment = function (id) {
    if (confirm('Are you sure you want to approve this appointment?')) {
        const req = window.mockData.appointmentRequests.find(r => r.id === id);
        if (req) {
            req.status = 'Confirmed';

            // Add Notification
            window.mockData.notifications.unshift({
                id: Date.now(),
                userId: req.motherId,
                type: 'success',
                message: `Your appointment for ${req.reason} on ${req.date} has been confirmed.`,
                time: 'Just now',
                read: false
            });

            saveData();

            // Refresh current view
            const activeTab = document.querySelector('.tab-btn.active');
            const status = activeTab ? activeTab.textContent.trim().split(' ')[0] : 'Pending';
            renderAppointmentRequests(status);
            updateRequestBadges();
        }
    }
};

window.openDeclineModal = function (id) {
    // Simple prompt for now, can be upgraded to a modal later
    const reason = prompt("Please enter a reason for declining:");
    if (reason) {
        declineAppointment(id, reason);
    }
};

window.declineAppointment = function (id, reason) {
    const req = window.mockData.appointmentRequests.find(r => r.id === id);
    if (req) {
        req.status = 'Declined';
        req.declineReason = reason; // Store reason

        // Add Notification
        window.mockData.notifications.unshift({
            id: Date.now(),
            userId: req.motherId,
            type: 'critical', // using critical for red color/error style
            message: `Your appointment request was declined. Reason: ${reason}`,
            time: 'Just now',
            read: false
        });

        saveData();

        // Refresh current view
        const activeTab = document.querySelector('.tab-btn.active');
        const status = activeTab ? activeTab.textContent.trim().split(' ')[0] : 'Pending';
        renderAppointmentRequests(status);
        updateRequestBadges();
    }
};

window.undoAppointment = function (id) {
    if (confirm('Are you sure you want to revert this request to Pending?')) {
        const req = window.mockData.appointmentRequests.find(r => r.id === id);
        if (req) {
            req.status = 'Pending';
            delete req.declineReason;

            // Add Notification (Optional, maybe just silent revert or info)
            window.mockData.notifications.unshift({
                id: Date.now(),
                userId: req.motherId,
                type: 'info',
                message: `Update on your appointment request for ${req.date}: Status reverted to Pending.`,
                time: 'Just now',
                read: false
            });

            saveData();

            // Refresh current view
            const activeTab = document.querySelector('.tab-btn.active');
            const status = activeTab ? activeTab.textContent.trim().split(' ')[0] : 'Pending';
            renderAppointmentRequests(status);
            updateRequestBadges();
        }
    }
};

function initMyRecords() {
    // Logic to load records
}

// Helper
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}
