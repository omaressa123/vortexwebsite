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
async function handleRegistration(e) {
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

    // Make actual API call to register user
    showNotification('Creating your account...', 'info');
    
    try {
        const response = await fetch('/api/register-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullname: fullname,
                email: email,
                password: password,
                confirm_password: confirmpassword
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            showNotification('Registration successful! Welcome to Vortex Agent!', 'success');
            // Store user data in localStorage
            localStorage.setItem('userAccount', JSON.stringify({
                fullname: fullname,
                email: email,
                registrationTime: new Date().toISOString()
            }));
            setTimeout(() => {
                window.location.href = '/services';
            }, 1500);
        } else {
            showNotification(data.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('An error occurred. Please try again later.', 'error');
    }
}

function handleUserRegistration(e) {
    return handleRegistration(e);
}

// ========================================
// Services Flow
// ========================================
async function startServiceOrder(serviceKey) {
    const userAccount = localStorage.getItem('userAccount');
    if (!userAccount) {
        showNotification('Please register or login first.', 'warning');
        window.location.href = '/register';
        return;
    }

    const user = JSON.parse(userAccount);
    try {
        const response = await fetch('/api/services/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_key: serviceKey,
                user_email: user.email,
                user_fullname: user.fullname
            })
        });
        const data = await response.json();
        if (data.status !== 'success' || !data.order || !data.order.id) {
            showNotification(data.message || 'Failed to create order', 'error');
            return;
        }
        window.location.href = `/service-checkout?order_id=${encodeURIComponent(data.order.id)}`;
    } catch (e) {
        console.error(e);
        showNotification('Failed to create order. Please try again.', 'error');
    }
}

async function initServiceCheckout() {
    const statusEl = document.getElementById('checkoutStatus');
    const detailsEl = document.getElementById('checkoutDetails');
    if (!statusEl || !detailsEl) return;

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');
    if (!orderId) {
        statusEl.innerText = 'Missing order_id.';
        return;
    }

    try {
        const response = await fetch(`/api/services/orders/${encodeURIComponent(orderId)}`);
        const data = await response.json();
        if (!data || data.status !== 'success' || !data.order) {
            statusEl.innerText = data.message || 'Failed to load order.';
            return;
        }

        const order = data.order;
        const payment = data.payment || {};

        document.getElementById('checkoutServiceName').innerText = order.service_name || 'Service';
        document.getElementById('checkoutOrderId').innerText = String(order.id);
        document.getElementById('checkoutDeposit').innerText = (order.deposit_amount === null || order.deposit_amount === undefined)
            ? 'Pending admin quote'
            : `${order.deposit_amount} EGP`;
        document.getElementById('checkoutName').innerText = payment.instapay_name || '—';
        document.getElementById('checkoutPhone').innerText = payment.instapay_phone || '—';

        const qrImg = document.getElementById('checkoutQrImg');
        if (qrImg) {
            if (order.deposit_amount === null || order.deposit_amount === undefined) {
                qrImg.style.display = 'none';
            } else {
                qrImg.style.display = 'block';
                qrImg.src = payment.qr_url || `/api/services/orders/${encodeURIComponent(orderId)}/qr`;
            }
        }

        statusEl.innerText = `Order status: ${order.status || '—'}`;
        detailsEl.style.display = 'block';

        const form = document.getElementById('receiptForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const fileInput = document.getElementById('receiptFile');
                const resultEl = document.getElementById('receiptResult');
                if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                    if (resultEl) resultEl.innerText = 'Please select an image.';
                    return;
                }
                const fd = new FormData();
                fd.append('screenshot', fileInput.files[0]);

                try {
                    const up = await fetch(`/api/services/orders/${encodeURIComponent(orderId)}/receipt`, {
                        method: 'POST',
                        body: fd
                    });
                    const upData = await up.json();
                    if (upData.status === 'success') {
                        if (resultEl) resultEl.innerText = 'Uploaded successfully. Waiting for admin approval.';
                    } else {
                        if (resultEl) resultEl.innerText = upData.message || 'Upload failed.';
                    }
                } catch (err) {
                    console.error(err);
                    if (resultEl) resultEl.innerText = 'Upload failed.';
                }
            });
        }
    } catch (e) {
        console.error(e);
        statusEl.innerText = 'Failed to load order.';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initServiceCheckout();
});

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
