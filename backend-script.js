// ========================================
// Backend Dashboard Scripts
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeBackend();
});

// Initialize Backend
function initializeBackend() {
    checkAdminAuth();
    setupEventListeners();
    loadDashboardData();
}

// ========================================
// Authentication Check
// ========================================
function checkAdminAuth() {
    const adminUser = localStorage.getItem('adminUser');
    
    if (!adminUser && !isOnLoginPage()) {
        // Redirect to login if not authenticated and not on login page
        const currentPage = window.location.pathname;
        if (!currentPage.includes('backendoverviewpage')) {
            window.location.href = '/backendoverviewpage.html';
        }
    }
}

// Check if on login page
function isOnLoginPage() {
    const pathname = window.location.pathname;
    return pathname.includes('backendoverviewpage');
}

// ========================================
// Event Listeners Setup
// ========================================
function setupEventListeners() {
    // Navigation active state
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .nav-menu a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        if (link.getAttribute('href') && currentPage.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });

    // Period buttons
    const periodButtons = document.querySelectorAll('.btn-period');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            periodButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadAnalyticsData(this.textContent);
        });
    });

    // Filter button
    const filterBtn = document.querySelector('.btn-filter');
    if (filterBtn) {
        filterBtn.addEventListener('click', applyFilters);
    }
}

// ========================================
// Logout Function
// ========================================
function logout() {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminAccount');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = '/backendoverviewpage.html';
    }, 1000);
}

// ========================================
// Load Dashboard Data
// ========================================
function loadDashboardData() {
    // Simulate loading dashboard data
    console.log('Loading dashboard data...');
    
    // Update last access time
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
        const userData = JSON.parse(adminUser);
        userData.lastAccess = new Date().toISOString();
        localStorage.setItem('adminUser', JSON.stringify(userData));
    }
}

// ========================================
// Load Analytics Data
// ========================================
function loadAnalyticsData(period) {
    console.log('Loading analytics data for period:', period);
    showNotification(`Analytics loaded for ${period}`, 'info');
}

// ========================================
// Apply Filters
// ========================================
function applyFilters() {
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');
    const searchFilter = document.getElementById('searchFilter');

    if (typeFilter && statusFilter && searchFilter) {
        const filters = {
            type: typeFilter.value,
            status: statusFilter.value,
            search: searchFilter.value
        };
        
        console.log('Filters applied:', filters);
        showNotification('Filters applied successfully', 'success');
        
        // Simulate filter processing
        filterUsers(filters);
    }
}

// ========================================
// Filter Users
// ========================================
function filterUsers(filters) {
    console.log('Filtering users with:', filters);

    // Get all table rows
    const rows = document.querySelectorAll('.data-table tbody tr');

    rows.forEach(row => {
        let show = true;

        // Apply type filter
        if (filters.type !== 'all') {
            // Filter logic here
        }

        // Apply status filter
        if (filters.status !== 'all') {
            const statusBadge = row.querySelector('.status-badge');
            if (statusBadge) {
                const isActive = statusBadge.classList.contains('success');
                if (filters.status === 'active' && !isActive) {
                    show = false;
                }
            }
        }

        // Apply search filter
        if (filters.search.length > 0) {
            const text = row.textContent.toLowerCase();
            if (!text.includes(filters.search.toLowerCase())) {
                show = false;
            }
        }

        row.style.display = show ? '' : 'none';
    });
}

// ========================================
// Notification System
// ========================================
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
        top: 80px;
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

// ========================================
// Get Notification Color
// ========================================
function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    return colors[type] || colors.info;
}

// ========================================
// Check Login Status
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
// CSV Export Function
// ========================================
function exportTableToCSV(filename, tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');

    rows.forEach((row) => {
        const cols = row.querySelectorAll('td, th');
        const rowData = [];
        
        cols.forEach((col) => {
            rowData.push(col.innerText);
        });
        
        csv.push(rowData.join(','));
    });

    downloadCSV(csv.join('\n'), filename);
}

// ========================================
// Download CSV
// ========================================
function downloadCSV(csv, filename) {
    const csvFile = new Blob([csv], { type: 'text/csv' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(csvFile);
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// ========================================
// Print Functionality
// ========================================
function printPage() {
    window.print();
}

// ========================================
// Create Animations
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

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .notification {
        animation: slideIn 0.3s ease;
    }
`;
document.head.appendChild(style);

// ========================================
// Utility Functions
// ========================================

// Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Get random color
function getRandomColor() {
    const colors = ['#6366f1', '#4f46e5', '#818cf8', '#10b981', '#f59e0b', '#ef4444'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
// Real-time Updates
// ========================================
function startRealtimeUpdates() {
    // Simulate real-time updates every 5 seconds
    setInterval(() => {
        // Could fetch new data here
        console.log('Real-time update check...');
    }, 5000);
}

// ========================================
// Dark Mode Toggle
// ========================================
function toggleDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    localStorage.setItem('darkMode', !isDarkMode);
    
    if (!isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// ========================================
// Performance Monitoring
// ========================================
function monitorPerformance() {
    if (window.performance && window.performance.timing) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('Page load time:', pageLoadTime, 'ms');
    }
}

// Run performance monitoring
monitorPerformance();

// ========================================
// Session Management
// ========================================
let sessionTimeout = 30 * 60 * 1000; // 30 minutes

function resetSessionTimer() {
    clearTimeout(window.sessionTimer);
    window.sessionTimer = setTimeout(() => {
        logout();
        showNotification('Session expired. Please login again.', 'warning');
    }, sessionTimeout);
}

// Reset timer on user activity
document.addEventListener('mousemove', resetSessionTimer);
document.addEventListener('keypress', resetSessionTimer);
document.addEventListener('click', resetSessionTimer);

// Initialize session timer
resetSessionTimer();
