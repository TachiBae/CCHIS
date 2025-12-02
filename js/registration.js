document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registrationForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const accountType = document.querySelector('input[name="accountType"]:checked').value;
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerText;

        // Basic Validation
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        // Check if username exists
        if (!window.mockData.users) window.mockData.users = []; // Safety check

        if (window.mockData.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            alert("Username already exists. Please choose another one.");
            return;
        }

        btn.innerText = 'Creating Account...';
        btn.disabled = true;

        setTimeout(() => {
            // Create New User
            const newUserId = accountType === 'mother'
                ? 'M' + (window.mockData.mothers.length + 1).toString().padStart(3, '0')
                : 'D' + (window.mockData.doctors.length + 1).toString().padStart(3, '0');

            const newUser = {
                id: newUserId,
                username: username,
                password: password, // In real app, hash this
                role: accountType,
                profileId: newUserId,
                verified: accountType === 'mother' // Doctors need verification
            };

            // Add to Users Array
            window.mockData.users.push(newUser);

            // Initialize Profile Placeholder
            if (accountType === 'mother') {
                // We don't add to mothers array yet, we wait for profile setup
                // But we need to store the partial user to login/continue setup
                // Actually, let's store the user now.
            }

            // Save to LocalStorage
            localStorage.setItem('cchisData', JSON.stringify(window.mockData));

            // Set Session for Setup
            localStorage.setItem('setupUser', JSON.stringify(newUser));

            alert("Account created successfully!");
            window.location.href = 'profile-setup.html';

        }, 1000);
    });
});
