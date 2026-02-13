// ========================================
// General Script
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

// Initialize event listeners
function initializeEventListeners() {
    // Admin Login Form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    // User Registration Form
    const userRegistrationForm = document.getElementById('userRegistrationForm');
    if (userRegistrationForm) {
        userRegistrationForm.addEventListener('submit', handleUserRegistration);
    }

    // Admin Registration Form
    const adminRegistrationForm = document.getElementById('adminRegistrationForm');
    if (adminRegistrationForm) {
        adminRegistrationForm.addEventListener('submit', handleAdminRegistration);
    }

    // Smooth scrolling for nav links
    setupSmoothScroll();
}

// ========================================
// Admin Login Handler
// ========================================
function handleAdminLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validation
    if (!username || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }

    // Simulate login process
    showNotification('Logging in...', 'info');
    setTimeout(() => {
        // Store admin data in localStorage
        localStorage.setItem('adminUser', JSON.stringify({
            username: username,
            loginTime: new Date().toISOString()
        }));
        showNotification('Login successful! Redirecting to dashboard...', 'success');
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1500);
    }, 1000);
}

// ========================================
// User Registration Handler
// ========================================
function handleUserRegistration(e) {
    e.preventDefault();

    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmpassword = document.getElementById('confirmpassword').value.trim();

    // Validation
    if (!fullname || !email || !password || !confirmpassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }

    if (password !== confirmpassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    // Simulate registration process
    showNotification('Creating your account...', 'info');
    setTimeout(() => {
        // Store user data in localStorage
        localStorage.setItem('userAccount', JSON.stringify({
            fullname: fullname,
            email: email,
            registrationTime: new Date().toISOString()
        }));
        showNotification('Registration successful! Welcome to Vortex Agent!', 'success');
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    }, 1000);
}

// ========================================
// Admin Registration Handler
// ========================================
function handleAdminRegistration(e) {
    e.preventDefault();

    const adminname = document.getElementById('adminname').value.trim();
    const adminemail = document.getElementById('adminemail').value.trim();
    const adminusername = document.getElementById('adminusername').value.trim();
    const adminpassword = document.getElementById('adminpassword').value.trim();
    const confirmadminpassword = document.getElementById('confirmadminpassword').value.trim();

    // Validation
    if (!adminname || !adminemail || !adminusername || !adminpassword || !confirmadminpassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(adminemail)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    if (adminusername.length < 4) {
        showNotification('Username must be at least 4 characters', 'error');
        return;
    }

    if (adminpassword.length < 8) {
        showNotification('Admin password must be at least 8 characters', 'error');
        return;
    }

    if (adminpassword !== confirmadminpassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    // Simulate registration process
    showNotification('Creating administrator account...', 'info');
    setTimeout(() => {
        // Store admin data in localStorage
        localStorage.setItem('adminAccount', JSON.stringify({
            adminname: adminname,
            adminemail: adminemail,
            adminusername: adminusername,
            registrationTime: new Date().toISOString()
        }));
        showNotification('Administrator account created successfully!', 'success');
        setTimeout(() => {
            window.location.href = '/backendoverviewpage/';
        }, 1500);
    }, 1000);
}

// ========================================
// Utility Functions
// ========================================

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        background-color: ${getNotificationColor(type)};
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Get notification color
function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    return colors[type] || colors.info;
}

// Smooth scroll setup
function setupSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// ========================================
// Add CSS animations
// ========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .notification {
        animation: slideIn 0.3s ease;
    }
`;
document.head.appendChild(style);

// ========================================
// Check if user is logged in
// ========================================
function checkLoginStatus() {
    const adminUser = localStorage.getItem('adminUser');
    const userAccount = localStorage.getItem('userAccount');
    
    if (adminUser) {
        return { type: 'admin', data: JSON.parse(adminUser) };
    } else if (userAccount) {
        return { type: 'user', data: JSON.parse(userAccount) };
    }
    return null;
}

// ========================================
// Logout function
// ========================================
function logout() {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('userAccount');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}
