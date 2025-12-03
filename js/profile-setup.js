document.addEventListener('DOMContentLoaded', function () {
    const setupUser = JSON.parse(localStorage.getItem('setupUser'));

    if (!setupUser) {
        alert('No registration session found. Please register first.');
        window.location.href = 'registration.html';
        return;
    }

    const role = setupUser.role;
    let currentStep = 1;
    const totalSteps = role === 'mother' ? 4 : 1;

    // State object to store form data
    const profileData = {
        personal: {},
        medical: {},
        postpartum: {},
        child: {},
        professional: {}
    };

    // Initialize UI
    if (role === 'mother') {
        document.getElementById('mother-steps').style.display = 'flex';
        renderMotherStep(1);
    } else {
        document.getElementById('doctor-steps').style.display = 'flex';
        renderDoctorStep(1);
    }

    // Navigation Buttons
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');

    btnNext.addEventListener('click', () => {
        if (!validateAndSaveStep(currentStep, role)) return;

        currentStep++;
        updateUI(currentStep, role);
    });

    btnPrev.addEventListener('click', () => {
        currentStep--;
        updateUI(currentStep, role);
    });

    // Form Submission
    document.getElementById('profileSetupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProfile(role);
    });

    function updateUI(step, role) {
        // Update Steps Indicator
        document.querySelectorAll('.step').forEach(s => {
            s.classList.toggle('active', parseInt(s.dataset.step) <= step);
        });

        // Render Content
        if (role === 'mother') renderMotherStep(step);
        else renderDoctorStep(step);

        // Update Buttons
        btnPrev.style.display = step === 1 ? 'none' : 'block';

        if (step === totalSteps) {
            btnNext.style.display = 'none';
            btnSubmit.style.display = 'block';
        } else {
            btnNext.style.display = 'block';
            btnSubmit.style.display = 'none';
        }
    }

    function renderMotherStep(step) {
        const container = document.getElementById('form-content');
        let html = '';

        switch (step) {
            case 1:
                html = `
                    <h3>Personal Information</h3>
                    <div class="form-group">
                        <label>Full Name*</label>
                        <input type="text" id="m-fullname" class="form-control" value="${profileData.personal.fullName || ''}" required>
                    </div>
                    <div class="row" style="display: flex; gap: 1rem;">
                        <div class="form-group" style="flex: 1;">
                            <label>Date of Birth*</label>
                            <input type="date" id="m-dob" class="form-control" value="${profileData.personal.dob || ''}" required>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Age</label>
                            <input type="number" id="m-age" class="form-control" value="${profileData.personal.age || ''}" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Civil Status*</label>
                        <select id="m-civil" class="form-control" required>
                            <option value="">Select...</option>
                            <option value="Single" ${profileData.personal.civilStatus === 'Single' ? 'selected' : ''}>Single</option>
                            <option value="Married" ${profileData.personal.civilStatus === 'Married' ? 'selected' : ''}>Married</option>
                            <option value="Widowed" ${profileData.personal.civilStatus === 'Widowed' ? 'selected' : ''}>Widowed</option>
                            <option value="Separated" ${profileData.personal.civilStatus === 'Separated' ? 'selected' : ''}>Separated</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Contact Number*</label>
                        <input type="text" id="m-contact" class="form-control" value="${profileData.personal.contact || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Complete Address*</label>
                        <textarea id="m-address" class="form-control" rows="2" required>${profileData.personal.address || ''}</textarea>
                    </div>
                `;
                break;
            case 2:
                html = `
                    <h3>Medical History</h3>
                    <div class="form-group">
                        <label>Blood Type*</label>
                        <select id="m-blood" class="form-control" required>
                            <option value="">Select...</option>
                            <option value="A+" ${profileData.medical.bloodType === 'A+' ? 'selected' : ''}>A+</option>
                            <option value="A-" ${profileData.medical.bloodType === 'A-' ? 'selected' : ''}>A-</option>
                            <option value="B+" ${profileData.medical.bloodType === 'B+' ? 'selected' : ''}>B+</option>
                            <option value="B-" ${profileData.medical.bloodType === 'B-' ? 'selected' : ''}>B-</option>
                            <option value="AB+" ${profileData.medical.bloodType === 'AB+' ? 'selected' : ''}>AB+</option>
                            <option value="AB-" ${profileData.medical.bloodType === 'AB-' ? 'selected' : ''}>AB-</option>
                            <option value="O+" ${profileData.medical.bloodType === 'O+' ? 'selected' : ''}>O+</option>
                            <option value="O-" ${profileData.medical.bloodType === 'O-' ? 'selected' : ''}>O-</option>
                        </select>
                    </div>
                    <div class="row" style="display: flex; gap: 1rem;">
                        <div class="form-group" style="flex: 1;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="m-pregnant" style="width: 20px; height: 20px; accent-color: var(--primary-color);" ${profileData.medical.pregnant ? 'checked' : ''}>
                                <span style="font-weight: 600;">Currently Pregnant?</span>
                            </label>
                            <div id="pregnant-message" style="display: ${profileData.medical.pregnant ? 'block' : 'none'}; margin-top: 12px; padding: 12px; background: #d4edda; color: #155724; border-radius: 8px; border: 1px solid #c3e6cb;">
                                <i class="fas fa-check-circle"></i> Please wait for further updates.
                            </div>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Para (Live Births)</label>
                            <input type="number" id="m-para" class="form-control" value="${profileData.medical.para || '0'}">
                        </div>
                    </div>
                `;
                break;
            case 3:
                html = `
                    <h3>Current Postpartum Status</h3>
                    <div class="form-group">
                        <label>Delivery Date*</label>
                        <input type="date" id="m-delivery-date" class="form-control" value="${profileData.postpartum.deliveryDate || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Delivery Type*</label>
                        <select id="m-delivery-type" class="form-control" required>
                            <option value="Normal" ${profileData.postpartum.deliveryType === 'Normal' ? 'selected' : ''}>Normal Spontaneous Delivery</option>
                            <option value="Cesarean" ${profileData.postpartum.deliveryType === 'Cesarean' ? 'selected' : ''}>Cesarean Section</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Hospital/Facility*</label>
                        <input type="text" id="m-hospital" class="form-control" value="${profileData.postpartum.hospital || ''}" required>
                    </div>
                `;
                break;
            case 4:
                html = `
                    <h3>Child Registration</h3>
                    <div class="form-group">
                        <label>Do you have a child to register?</label>
                        <div>
                            <label><input type="radio" name="hasChild" value="yes" checked onclick="document.getElementById('child-form').style.display='block'"> Yes</label>
                            <label><input type="radio" name="hasChild" value="no" onclick="document.getElementById('child-form').style.display='none'"> No</label>
                        </div>
                    </div>
                    <div id="child-form">
                        <div class="form-group">
                            <label>Child's Full Name*</label>
                            <input type="text" id="c-name" class="form-control" value="${profileData.child.name || ''}">
                        </div>
                        <div class="row" style="display: flex; gap: 1rem;">
                            <div class="form-group" style="flex: 1;">
                                <label>Date of Birth*</label>
                                <input type="date" id="c-dob" class="form-control" value="${profileData.child.dob || ''}">
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label>Sex*</label>
                                <select id="c-sex" class="form-control">
                                    <option value="Male" ${profileData.child.sex === 'Male' ? 'selected' : ''}>Male</option>
                                    <option value="Female" ${profileData.child.sex === 'Female' ? 'selected' : ''}>Female</option>
                                </select>
                            </div>
                        </div>
                        <div class="row" style="display: flex; gap: 1rem;">
                            <div class="form-group" style="flex: 1;">
                                <label style="font-weight: 600; margin-bottom: 12px; display: block;">Vaccination History</label>
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input type="checkbox" id="v-polio" class="vaccine-checkbox" style="width: 18px; height: 18px; accent-color: var(--success-color);" ${profileData.child.vaccines?.polio ? 'checked' : ''}>
                                        <span>Polio</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input type="checkbox" id="v-mmr" class="vaccine-checkbox" style="width: 18px; height: 18px; accent-color: var(--success-color);" ${profileData.child.vaccines?.mmr ? 'checked' : ''}>
                                        <span>MMR (Measles, Mumps, Rubella)</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input type="checkbox" id="v-hepatitis" class="vaccine-checkbox" style="width: 18px; height: 18px; accent-color: var(--success-color);" ${profileData.child.vaccines?.hepatitisB ? 'checked' : ''}>
                                        <span>Hepatitis B</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input type="checkbox" id="v-pcv" class="vaccine-checkbox" style="width: 18px; height: 18px; accent-color: var(--success-color);" ${profileData.child.vaccines?.pcv ? 'checked' : ''}>
                                        <span>PCV (Pneumococcal)</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input type="checkbox" id="v-dtap" class="vaccine-checkbox" style="width: 18px; height: 18px; accent-color: var(--success-color);" ${profileData.child.vaccines?.dtap ? 'checked' : ''}>
                                        <span>DTaP (Diphtheria, Tetanus, Pertussis)</span>
                                    </label>
                                </div>
                                <div id="vaccine-message" style="display: none; margin-top: 12px; padding: 12px; background: #d4edda; color: #155724; border-radius: 8px; border: 1px solid #c3e6cb;">
                                    <i class="fas fa-check-circle"></i> Please wait for further updates.
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                break;
        }
        container.innerHTML = html;

        // Re-attach listeners
        if (step === 1) {
            document.getElementById('m-dob').addEventListener('change', function () {
                const dob = new Date(this.value);
                const ageDiff = Date.now() - dob.getTime();
                const ageDate = new Date(ageDiff);
                document.getElementById('m-age').value = Math.abs(ageDate.getUTCFullYear() - 1970);
            });
        } else if (step === 2) {
            // Pregnant checkbox listener
            const pregnantCheckbox = document.getElementById('m-pregnant');
            if (pregnantCheckbox) {
                pregnantCheckbox.addEventListener('change', function () {
                    const message = document.getElementById('pregnant-message');
                    message.style.display = this.checked ? 'block' : 'none';
                });
            }
        } else if (step === 4) {
            // Vaccine checkboxes listener
            const vaccineCheckboxes = document.querySelectorAll('.vaccine-checkbox');
            const checkAllFilled = () => {
                const nameField = document.getElementById('c-name');
                const dobField = document.getElementById('c-dob');
                const allChecked = Array.from(vaccineCheckboxes).every(cb => cb.checked);
                const allFieldsFilled = nameField.value && dobField.value && allChecked;

                const message = document.getElementById('vaccine-message');
                message.style.display = allFieldsFilled ? 'block' : 'none';
            };

            vaccineCheckboxes.forEach(cb => {
                cb.addEventListener('change', checkAllFilled);
            });

            // Also listen to name and dob fields
            const nameField = document.getElementById('c-name');
            const dobField = document.getElementById('c-dob');
            if (nameField) nameField.addEventListener('input', checkAllFilled);
            if (dobField) dobField.addEventListener('change', checkAllFilled);
        }
    }

    function renderDoctorStep(step) {
        const container = document.getElementById('form-content');
        if (step === 1) {
            container.innerHTML = `
                <h3>Professional Information</h3>
                <div class="form-group">
                    <label>Full Name*</label>
                    <input type="text" id="d-fullname" class="form-control" value="${profileData.professional.fullName || ''}" required>
                </div>
                <div class="form-group">
                    <label>License Number*</label>
                    <input type="text" id="d-license" class="form-control" value="${profileData.professional.license || ''}" required>
                </div>
                <div class="form-group">
                    <label>Specialization*</label>
                    <input type="text" id="d-spec" class="form-control" value="${profileData.professional.specialization || ''}" required>
                </div>
                <div class="form-group">
                    <label>Hospital Affiliation*</label>
                    <input type="text" id="d-hospital" class="form-control" value="${profileData.professional.hospital || ''}" required>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="text-center" style="padding: 2rem;">
                    <i class="fas fa-user-check" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                    <h3>Verification Pending</h3>
                    <p>Your account will be reviewed by an administrator.</p>
                    <p class="text-muted">You will be notified once approved.</p>
                </div>
            `;
        }
    }

    function validateAndSaveStep(step, role) {
        // Validation
        const inputs = document.getElementById('form-content').querySelectorAll('input[required], select[required], textarea[required]');
        let valid = true;
        inputs.forEach(input => {
            if (!input.value) {
                input.style.borderColor = 'red';
                valid = false;
            } else {
                input.style.borderColor = '#ddd';
            }
        });

        if (!valid) return false;

        // Save Data to State
        if (role === 'mother') {
            if (step === 1) {
                profileData.personal = {
                    fullName: document.getElementById('m-fullname').value,
                    dob: document.getElementById('m-dob').value,
                    age: document.getElementById('m-age').value,
                    civilStatus: document.getElementById('m-civil').value,
                    contact: document.getElementById('m-contact').value,
                    address: document.getElementById('m-address').value
                };
            } else if (step === 2) {
                profileData.medical = {
                    bloodType: document.getElementById('m-blood').value,
                    pregnant: document.getElementById('m-pregnant').checked,
                    para: document.getElementById('m-para').value
                };
            } else if (step === 3) {
                profileData.postpartum = {
                    deliveryDate: document.getElementById('m-delivery-date').value,
                    deliveryType: document.getElementById('m-delivery-type').value,
                    hospital: document.getElementById('m-hospital').value
                };
            } else if (step === 4) {
                // Handled in saveProfile since it's the last step
            }
        } else {
            if (step === 1) {
                profileData.professional = {
                    fullName: document.getElementById('d-fullname').value,
                    license: document.getElementById('d-license').value,
                    specialization: document.getElementById('d-spec').value,
                    hospital: document.getElementById('d-hospital').value
                };
            }
        }

        return true;
    }

    function saveProfile(role) {
        if (role === 'mother') {
            // Save last step data
            const hasChild = document.querySelector('input[name="hasChild"]:checked').value === 'yes';
            let childId = null;

            if (hasChild) {
                childId = 'C' + (window.mockData.children.length + 1).toString().padStart(3, '0');

                // Get vaccine status
                const vaccines = {
                    polio: document.getElementById('v-polio').checked,
                    mmr: document.getElementById('v-mmr').checked,
                    hepatitisB: document.getElementById('v-hepatitis').checked,
                    pcv: document.getElementById('v-pcv').checked,
                    dtap: document.getElementById('v-dtap').checked
                };

                const newChild = {
                    id: childId,
                    motherId: setupUser.profileId,
                    name: document.getElementById('c-name').value,
                    sex: document.getElementById('c-sex').value,
                    birthDate: document.getElementById('c-dob').value,
                    birthWeight: 0, // Removed from form
                    birthLength: 0, // Removed from form
                    bloodType: "Unknown",
                    status: "Normal"
                };
                window.mockData.children.push(newChild);

                // Save Immunizations
                const vaccineList = [
                    { key: 'polio', name: 'Polio' },
                    { key: 'mmr', name: 'MMR' },
                    { key: 'hepatitisB', name: 'Hepatitis B' },
                    { key: 'pcv', name: 'PCV' },
                    { key: 'dtap', name: 'DTaP' }
                ];

                vaccineList.forEach(v => {
                    if (vaccines[v.key]) {
                        window.mockData.immunizations.push({
                            childId: childId,
                            vaccine: v.name,
                            dateGiven: new Date().toISOString().split('T')[0], // Assume given today/previously
                            status: "Completed"
                        });
                    }
                });
            }

            // Create Mother Profile
            const newMother = {
                id: setupUser.profileId,
                name: profileData.personal.fullName,
                dob: profileData.personal.dob,
                age: parseInt(profileData.personal.age),
                civilStatus: profileData.personal.civilStatus,
                occupation: "Unemployed", // Default or add field
                contact: profileData.personal.contact,
                email: setupUser.username + "@example.com", // Placeholder
                address: profileData.personal.address,
                emergencyContact: "N/A", // Add field later
                education: "N/A", // Add field later
                gravida: profileData.medical.pregnant ? "Pregnant" : "Not Pregnant",
                para: parseInt(profileData.medical.para),
                edd: null, // Calculated?
                deliveryDate: profileData.postpartum.deliveryDate,
                status: "Normal",
                riskFactors: [],
                childId: childId
            };

            window.mockData.mothers.push(newMother);

            // Save to LocalStorage
            localStorage.setItem('cchisData', JSON.stringify(window.mockData));

            // Login
            localStorage.setItem('userRole', 'mother');
            localStorage.setItem('userName', setupUser.username); // Store username
            localStorage.setItem('userId', newMother.id);

            alert("Profile Setup Complete!");
            window.location.href = 'mother-dashboard.html';

        } else {
            // Doctor
            const newDoctor = {
                id: setupUser.profileId,
                name: profileData.professional.fullName,
                licenseNumber: profileData.professional.license,
                specialization: profileData.professional.specialization,
                yearsExperience: 0, // Add field
                contact: "N/A", // Add field
                email: "N/A", // Add field
                affiliation: profileData.professional.hospital,
                affiliation: profileData.professional.hospital,
                verified: true
            };

            window.mockData.doctors.push(newDoctor);
            localStorage.setItem('cchisData', JSON.stringify(window.mockData));

            // Auto-login for doctor
            localStorage.setItem('userRole', 'doctor');
            localStorage.setItem('userName', setupUser.username);
            localStorage.setItem('userId', newDoctor.id);

            alert("Profile Setup Complete!");
            window.location.href = 'doctor-dashboard.html';
        }
    }
});
