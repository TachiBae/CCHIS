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
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // Update User Profile in Sidebar/Top Bar
    updateUserProfileDisplay();
});

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

// Helper to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Profiles Page Logic
function initProfilesPage() {
    renderProfilesList(window.mockData.mothers);

    // Search functionality
    const searchInput = document.getElementById('search-profiles');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = window.mockData.mothers.filter(m =>
                m.name.toLowerCase().includes(term) ||
                (m.childId && window.mockData.children.find(c => c.id === m.childId).name.toLowerCase().includes(term))
            );
            renderProfilesList(filtered);
        });
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
                childId: cId
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
            renderProfilesList(window.mockData.mothers);

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
            <td><a href="#" class="text-primary font-weight-bold" onclick="openMotherModal('${mother.id}')">${mother.name}</a></td>
            <td>${child ? `<a href="#" onclick="openChildModal('${child.id}')">${child.name}</a>` : 'N/A'}</td>
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
    document.getElementById('c-mother').innerHTML = mother ? `<a href="#" onclick="openMotherModal('${mother.id}'); document.getElementById('child-modal').classList.remove('show');">${mother.name}</a>` : 'N/A';

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

    window.mockData.mothers.forEach(mother => {
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
function initGrowthPage() {
    renderImmunizationSchedule();
    renderGrowthCharts();
}

function renderImmunizationSchedule() {
    const tbody = document.getElementById('imm-table-body');
    if (!tbody) return;

    // For demo, just show immunizations for the first child
    const childId = window.mockData.children[0].id;
    const imms = window.mockData.immunizations.filter(i => i.childId === childId);

    // Add some dummy future schedule items
    const schedule = [
        ...imms,
        { vaccine: "DPT 1", ageDue: "6 weeks", status: "Upcoming", dueDate: "2024-01-15" },
        { vaccine: "Polio 1", ageDue: "6 weeks", status: "Missed", dueDate: "2023-12-01" },
        { vaccine: "PCV 1", ageDue: "6 weeks", status: "Upcoming", dueDate: "2024-01-15" }
    ];

    tbody.innerHTML = schedule.map(i => `
        <tr>
            <td>${i.vaccine}</td>
            <td>${i.ageDue || 'At Birth'}</td>
            <td>${i.dateGiven ? formatDate(i.dateGiven) : '-'}</td>
            <td>${renderVisitBadge(i.status)}</td>
        </tr>
    `).join('');
}

function renderGrowthCharts() {
    // Weight Chart
    const ctxWeight = document.getElementById('weightChart').getContext('2d');
    new Chart(ctxWeight, {
        type: 'line',
        data: {
            labels: ['0', '1', '2', '3', '4', '5', '6'],
            datasets: [{
                label: 'Child Weight (kg)',
                data: [3.2, 4.5, 5.8, 6.4, null, null, null],
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
        options: { responsive: true }
    });

    // Height Chart
    const ctxHeight = document.getElementById('heightChart').getContext('2d');
    new Chart(ctxHeight, {
        type: 'line',
        data: {
            labels: ['0', '1', '2', '3', '4', '5', '6'],
            datasets: [{
                label: 'Child Length (cm)',
                data: [49, 54, 58, 61, null, null, null],
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
        options: { responsive: true }
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

// Initialize based on page
// Access Control
function checkAccess() {
    const currentPage = window.location.pathname.split('/').pop();
    const userRole = localStorage.getItem('userRole');

    // Public pages
    if (currentPage === 'index.html' || currentPage === '') return;

    if (!userRole) {
        // Not logged in
        window.location.href = 'index.html';
        return;
    }

    // Doctor Pages
    const doctorPages = ['doctor-dashboard.html', 'profiles.html', 'postpartum.html', 'growth.html', 'reports.html', 'appointment-requests.html'];
    if (userRole === 'doctor' && !doctorPages.includes(currentPage)) {
        // Doctor trying to access mother pages? (None yet, but good to have)
        // For now, just let them be or redirect to doctor dashboard if they try to go to mother dashboard
        if (currentPage.includes('mother') || currentPage.includes('my-')) {
            window.location.href = 'doctor-dashboard.html';
        }
    }

    // Mother Pages
    const motherPages = ['mother-dashboard.html', 'my-profile.html', 'my-child.html', 'my-appointments.html', 'my-records.html'];
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

    // Update sidebar/topbar if elements exist
    // This assumes the HTML structure has specific classes or IDs. 
    // The current HTML has static "Dr. Maria Clara". We should make it dynamic.

    const nameEls = document.querySelectorAll('.user-profile .font-weight-600, .user-profile div:first-child');
    const roleEls = document.querySelectorAll('.user-profile .text-muted, .user-profile div:last-child');

    if (userName) {
        nameEls.forEach(el => {
            if (el.textContent.includes('Dr.') || el.textContent.includes('Midwife')) return; // Don't overwrite if it's not the right target, but structure is loose.
            // Let's target more specifically if possible, or just overwrite the text node
            el.textContent = userName;
        });

        // Better selector based on view_file output:
        // <div style="font-weight: 600;">Dr. Maria Clara</div>
        const profileName = document.querySelector('.user-profile div[style*="font-weight: 600"]');
        if (profileName) profileName.textContent = userName;

        const profileRole = document.querySelector('.user-profile div[style*="font-size: 0.8rem"]');
        if (profileRole) profileRole.textContent = userRole === 'doctor' ? 'Healthcare Provider' : 'Mother';
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

// Mother's Interface Functions

function initMotherDashboard() {
    const userId = localStorage.getItem('userId'); // e.g., M006
    if (!userId) return;

    // Find mother data
    const mother = window.mockData.mothers.find(m => m.id === userId);
    if (!mother) return;

    // Update Welcome Message
    const welcomeMsg = document.querySelector('h3[style*="color: #d63384"]');
    if (welcomeMsg) welcomeMsg.textContent = `Welcome back, ${mother.name.split(' ')[0]}!`;

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
    renderAppointmentRequests();
}

function renderAppointmentRequests() {
    const tbody = document.getElementById('pending-appointments-body');
    if (!tbody) return;

    const pending = window.mockData.appointmentRequests.filter(r => r.status === 'Pending');

    if (pending.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No pending requests</td></tr>';
        return;
    }

    tbody.innerHTML = pending.map(r => `
        <tr>
            <td>
                <div class="d-flex align-center">
                    <div class="avatar-sm mr-2">${r.motherName.charAt(0)}</div>
                    <div>${r.motherName}</div>
                </div>
            </td>
            <td>${r.date} <br> <small class="text-muted">${r.time}</small></td>
            <td>${r.reason}</td>
            <td>${r.submitted}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="approveAppointment('${r.id}')"><i class="fas fa-check"></i></button>
                <button class="btn btn-sm btn-outline" onclick="declineAppointment('${r.id}')"><i class="fas fa-times"></i></button>
            </td>
        </tr>
    `).join('');
}

// Global functions for inline onclick
window.approveAppointment = function (id) {
    const req = window.mockData.appointmentRequests.find(r => r.id === id);
    if (req) {
        req.status = 'Confirmed';
        alert(`Appointment for ${req.motherName} confirmed!`);
        renderAppointmentRequests();
    }
};

window.declineAppointment = function (id) {
    const req = window.mockData.appointmentRequests.find(r => r.id === id);
    if (req) {
        req.status = 'Declined';
        alert(`Appointment declined.`);
        renderAppointmentRequests();
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
