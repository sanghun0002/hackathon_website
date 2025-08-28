// This script handles the admin login functionality.
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password-input');
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');

    // Admin password (must match the backend's ADMIN_PASSWORD)
    const ADMIN_PASSWORD = '0000';

    const handleLogin = () => {
        const password = passwordInput.value;
        if (password === ADMIN_PASSWORD) {
            // Store authentication state in localStorage and redirect
            localStorage.setItem('isAdminLoggedIn', 'true');
            window.location.href = 'admin.html';
        } else {
            errorMessage.classList.remove('hidden');
            passwordInput.value = ''; // Clear the input field
        }
    };

    loginBtn.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
});

