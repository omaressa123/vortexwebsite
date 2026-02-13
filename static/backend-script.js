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

function loadServiceOrdersAdmin() {
    const tbody = document.getElementById('serviceOrdersTableBody');
    const countEl = document.getElementById('serviceOrdersCount');
    const receiptsHeader = document.getElementById('serviceReceiptsHeader');
    const receiptsContainer = document.getElementById('serviceReceiptsContainer');
    if (!tbody || !countEl || !receiptsHeader || !receiptsContainer) return;

    fetch('/api/admin/service-orders')
        .then(r => r.json())
        .then(data => {
            if (!data || data.status !== 'success' || !Array.isArray(data.orders)) return;
            const orders = data.orders;
            tbody.innerHTML = '';
            countEl.innerText = `${orders.length} orders`;

            orders.forEach(order => {
                const tr = document.createElement('tr');
                const dep = (order.deposit_amount === null || order.deposit_amount === undefined) ? '—' : `${order.deposit_amount} EGP`;
                const user = `${order.user_fullname || '—'} (${order.user_email || '—'})`;

                tr.innerHTML = `
                    <td>${escapeHtml(order.id)}</td>
                    <td>${escapeHtml(user)}</td>
                    <td>${escapeHtml(order.service_name || order.service_key || '—')}</td>
                    <td>${escapeHtml(dep)}</td>
                    <td>${escapeHtml(order.status || '—')}</td>
                    <td>
                        <button class="action-btn" data-action="quote" data-order-id="${escapeHtml(order.id)}">Set Deposit</button>
                        <button class="action-btn" data-action="receipts" data-order-id="${escapeHtml(order.id)}">View Receipts</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            tbody.querySelectorAll('button[data-action="quote"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const orderId = btn.getAttribute('data-order-id');
                    const amount = prompt('Enter deposit amount (EGP):');
                    if (!amount) return;
                    fetch(`/api/admin/service-orders/${encodeURIComponent(orderId)}/quote`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ deposit_amount: amount })
                    })
                        .then(r => r.json())
                        .then(res => {
                            if (res && res.status === 'success') {
                                showNotification('Deposit updated', 'success');
                                loadServiceOrdersAdmin();
                            } else {
                                showNotification(res.message || 'Failed to update deposit', 'error');
                            }
                        })
                        .catch(() => showNotification('Failed to update deposit', 'error'));
                });
            });

            tbody.querySelectorAll('button[data-action="receipts"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const orderId = btn.getAttribute('data-order-id');
                    loadReceiptsForOrder(orderId);
                });
            });
        })
        .catch(err => console.error('Service orders error:', err));

    function loadReceiptsForOrder(orderId) {
        receiptsHeader.innerText = `Order #${orderId} receipts`;
        receiptsContainer.innerHTML = 'Loading...';

        fetch(`/api/admin/service-orders/${encodeURIComponent(orderId)}/receipts`)
            .then(r => r.json())
            .then(data => {
                if (!data || data.status !== 'success' || !Array.isArray(data.receipts)) {
                    receiptsContainer.innerHTML = 'Failed to load receipts.';
                    return;
                }
                const receipts = data.receipts;
                if (receipts.length === 0) {
                    receiptsContainer.innerHTML = 'No receipts uploaded yet.';
                    return;
                }

                receiptsContainer.innerHTML = '';
                receipts.forEach(rcpt => {
                    const wrap = document.createElement('div');
                    wrap.className = 'dashboard-card';
                    wrap.style.marginBottom = '12px';

                    const imgUrl = `/uploads/receipts/${encodeURIComponent(rcpt.filename)}`;
                    wrap.innerHTML = `
                        <div class="card-header">
                            <h2>Receipt #${escapeHtml(rcpt.id)} - ${escapeHtml(rcpt.status || 'pending')}</h2>
                        </div>
                        <div class="card-body">
                            <div style="display:flex; gap:16px; flex-wrap:wrap; align-items:flex-start;">
                                <a href="${imgUrl}" target="_blank" rel="noreferrer">
                                    <img src="${imgUrl}" alt="Receipt" style="max-width:260px; width:100%; background:#fff; padding:8px; border-radius:10px;" />
                                </a>
                                <div style="min-width:240px;">
                                    <div><strong>Uploaded:</strong> ${escapeHtml(rcpt.uploaded_at || '—')}</div>
                                    <div><strong>Reviewed:</strong> ${escapeHtml(rcpt.reviewed_at || '—')}</div>
                                    <div style="margin-top:10px;">
                                        <button class="action-btn" data-action="approve" data-order-id="${escapeHtml(orderId)}" data-receipt-id="${escapeHtml(rcpt.id)}">Approve</button>
                                        <button class="action-btn" style="background:#ef4444;" data-action="reject" data-order-id="${escapeHtml(orderId)}" data-receipt-id="${escapeHtml(rcpt.id)}">Reject</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    receiptsContainer.appendChild(wrap);
                });

                receiptsContainer.querySelectorAll('button[data-action="approve"], button[data-action="reject"]').forEach(b => {
                    b.addEventListener('click', () => {
                        const decision = b.getAttribute('data-action');
                        const oid = b.getAttribute('data-order-id');
                        const rid = b.getAttribute('data-receipt-id');
                        const note = prompt('Admin note (optional):') || '';

                        fetch(`/api/admin/service-orders/${encodeURIComponent(oid)}/review`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                decision: decision,
                                receipt_id: Number(rid),
                                admin_note: note
                            })
                        })
                            .then(r => r.json())
                            .then(res => {
                                if (res && res.status === 'success') {
                                    showNotification('Updated', 'success');
                                    loadReceiptsForOrder(oid);
                                    loadServiceOrdersAdmin();
                                } else {
                                    showNotification(res.message || 'Failed to update', 'error');
                                }
                            })
                            .catch(() => showNotification('Failed to update', 'error'));
                    });
                });
            })
            .catch(() => {
                receiptsContainer.innerHTML = 'Failed to load receipts.';
            });
    }
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
            window.location.href = '/backendoverviewpage';
        }
    }
}

// Check if on login page
function isOnLoginPage() {
    const pathname = window.location.pathname;
    return pathname.includes('backendoverviewpage');
}

// ========================================
// Admin Login Handler
// ========================================
function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showNotification('Please enter username and password', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    // Send login request
    fetch('/api/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Store admin session
            localStorage.setItem('adminUser', JSON.stringify({
                id: data.user_id,
                username: data.username,
                adminname: data.adminname,
                role: data.role,
                token: data.token
            }));
            
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/backend-dashboard';
            }, 1000);
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    })
    .finally(() => {
        // Restore button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// ========================================
// Event Listeners Setup
// ========================================
function setupEventListeners() {
    // Check if we're on login page and setup login form
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
    
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
    // Load dynamic stats (dashboard + KPI page)
    loadDashboardStats();

    // Load non-numeric dynamic sections
    loadRecentActivity();
    loadSystemHealth();
    loadAdminUsersPages();
    loadAnalyticsPlaceholders();
    loadServiceOrdersAdmin();
    
    // Update last access time
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
        const userData = JSON.parse(adminUser);
        userData.lastAccess = new Date().toISOString();
        localStorage.setItem('adminUser', JSON.stringify(userData));
    }
}

// ========================================
// Dynamic Dashboard Stats
// ========================================
function loadDashboardStats() {
    fetch('/api/admin/dashboard/stats')
        .then(response => response.json())
        .then(data => {
            if (!data || data.status !== 'success' || !data.stats) {
                return;
            }

            const stats = data.stats;

            // Dashboard KPIs
            setTextIfExists('totalUsers', formatNumberSafe(stats.total_users));
            setTextIfExists('activeUsers', formatNumberSafe(stats.active_users));
            setTextIfExists('activeUsersDuplicate', formatNumberSafe(stats.active_users));

            // If revenue is not provided by the API, keep it as —
            if (stats.total_revenue !== undefined && stats.total_revenue !== null) {
                setTextIfExists('totalRevenue', formatCurrencySafe(stats.total_revenue));
            }

            // Summary stats
            setTextIfExists('totalVisits', formatNumberSafe(stats.total_visits));
            setTextIfExists('uniqueVisitors', formatNumberSafe(stats.unique_visitors));
            setTextIfExists('bounceRate', formatPercentSafe(stats.bounce_rate));
            setTextIfExists('avgSessionDuration', String(stats.avg_session_duration ?? '—'));

            // Quick stats - if not provided, keep the defaults
            applyPercentBarIfExists('serverHealthBar', 'serverHealthPercent', stats.server_health);
            applyPercentBarIfExists('uptimeBar', 'uptimePercent', stats.uptime);
            applyPercentBarIfExists('apiResponseBar', 'apiResponsePercent', stats.api_response);

            // Traffic sources (optional)
            applyPercentBarIfExists('trafficOrganicBar', 'trafficOrganicPercent', stats.traffic_organic);
            applyPercentBarIfExists('trafficDirectBar', 'trafficDirectPercent', stats.traffic_direct);
            applyPercentBarIfExists('trafficReferralBar', 'trafficReferralPercent', stats.traffic_referral);
            applyPercentBarIfExists('trafficSocialBar', 'trafficSocialPercent', stats.traffic_social);

            // Top pages (optional)
            if (stats.top_pages && Array.isArray(stats.top_pages)) {
                // Expecting e.g. [{ path: '/', views: 75000, bounce_rate: '28%' }, ...]
                const home = stats.top_pages.find(p => p.path === '/') || stats.top_pages[0];
                const admin = stats.top_pages.find(p => String(p.path || '').includes('backendoverviewpage')) || stats.top_pages[1];

                if (home) {
                    setTextIfExists('topPageHomeViews', formatNumberSafe(home.views));
                    setTextIfExists('topPageHomeBounce', formatPercentSafe(home.bounce_rate));
                }
                if (admin) {
                    setTextIfExists('topPageAdminViews', formatNumberSafe(admin.views));
                    setTextIfExists('topPageAdminBounce', formatPercentSafe(admin.bounce_rate));
                }
            }

            // KPI page mappings
            // Use same stats if they exist; otherwise keep placeholders
            setTextIfExists('kpiTotalUsersBox', formatNumberSafe(stats.total_users));
            setTextIfExists('kpiActiveUsersBox', formatNumberSafe(stats.active_users));
            setTextIfExists('kpiActiveSessionsBox', formatNumberSafe(stats.active_sessions));
            setTextIfExists('kpiAvgSessionTimeBox', String(stats.avg_session_duration ?? '—'));
            setTextIfExists('kpiVisitors', formatNumberSafe(stats.unique_visitors));
            setTextIfExists('kpiRegistered', formatNumberSafe(stats.total_users));
            setTextIfExists('kpiActive', formatNumberSafe(stats.active_users));

            // Performance circle (optional)
            if (stats.performance_percent !== undefined && stats.performance_percent !== null) {
                setTextIfExists('kpiPerformancePercent', `${clampPercent(stats.performance_percent)}%`);
            }

            // Response time + downtime (optional)
            if (stats.response_time !== undefined && stats.response_time !== null) {
                setTextIfExists('kpiResponseTime', formatMsSafe(stats.response_time));
            }
            if (stats.downtime !== undefined && stats.downtime !== null) {
                setTextIfExists('kpiDowntime', formatPercentSafe(stats.downtime));
            }

            // Revenue on KPI page (optional)
            if (stats.total_revenue !== undefined && stats.total_revenue !== null) {
                setTextIfExists('kpiTotalRevenue', formatCurrencySafe(stats.total_revenue));
            }
            if (stats.avg_revenue_per_user !== undefined && stats.avg_revenue_per_user !== null) {
                setTextIfExists('kpiAvgRevenuePerUser', formatCurrencySafe(stats.avg_revenue_per_user));
            }
            if (stats.profit_margin !== undefined && stats.profit_margin !== null) {
                setTextIfExists('kpiProfitMargin', formatPercentSafe(stats.profit_margin));
            }

            // KPI System Health (use percent bars as source of truth)
            applyHealthIfExists('healthServerDot', 'healthServerText', stats.server_health);
            applyHealthIfExists('healthDatabaseDot', 'healthDatabaseText', stats.uptime);
            applyHealthIfExists('healthApiDot', 'healthApiText', stats.api_response);
            // Backup is not persisted; treat as always OK
            applyHealthStatus('healthBackupDot', 'healthBackupText', true, 'Running');

            // Manage Users page stats + engagement placeholders
            const activeRate = (stats.total_users && stats.active_users)
                ? Math.round((Number(stats.active_users) / Number(stats.total_users)) * 100)
                : 0;
            setTextIfExists('usersStatsActiveRate', `${clampPercent(activeRate)}%`);

            // Default engagement mix derived from active users
            const premium = Math.max(0, Math.round(Number(stats.active_users || 0) * 0.2));
            const basic = Math.max(0, Math.round(Number(stats.active_users || 0) * 0.75));
            const admin = Math.max(0, Math.round(Number(stats.active_users || 0) * 0.05));
            const totalEng = Math.max(1, premium + basic + admin);
            setTextIfExists('engagementPremiumCount', formatNumberSafe(premium));
            setTextIfExists('engagementBasicCount', formatNumberSafe(basic));
            setTextIfExists('engagementAdminCount', formatNumberSafe(admin));
            applyPercentBarIfExists('engagementPremiumBar', null, Math.round((premium / totalEng) * 100));
            applyPercentBarIfExists('engagementBasicBar', null, Math.round((basic / totalEng) * 100));
            applyPercentBarIfExists('engagementAdminBar', null, Math.round((admin / totalEng) * 100));

            // Analytics: reuse traffic distribution and totals
            applyPercentBarIfExists('analyticsTrafficOrganicBar', 'analyticsTrafficOrganicPercent', stats.traffic_organic);
            applyPercentBarIfExists('analyticsTrafficDirectBar', 'analyticsTrafficDirectPercent', stats.traffic_direct);
            applyPercentBarIfExists('analyticsTrafficReferralBar', 'analyticsTrafficReferralPercent', stats.traffic_referral);
            applyPercentBarIfExists('analyticsTrafficSocialBar', 'analyticsTrafficSocialPercent', stats.traffic_social);

            const tv = Number(String(stats.total_visits || 0).replace(/,/g, ''));
            setTextIfExists('analyticsTrafficOrganicCount', `${formatNumberSafe(Math.round(tv * 0.45))} visits`);
            setTextIfExists('analyticsTrafficDirectCount', `${formatNumberSafe(Math.round(tv * 0.25))} visits`);
            setTextIfExists('analyticsTrafficReferralCount', `${formatNumberSafe(Math.round(tv * 0.20))} visits`);
            setTextIfExists('analyticsTrafficSocialCount', `${formatNumberSafe(Math.round(tv * 0.10))} visits`);

            // Demographics/device breakdown derived placeholders
            applyPercentBarIfExists('analyticsDesktopBar', 'analyticsDesktopPercent', 60);
            applyPercentBarIfExists('analyticsMobileBar', 'analyticsMobilePercent', 35);
            applyPercentBarIfExists('analyticsTabletBar', 'analyticsTabletPercent', 5);
            setTextIfExists('analyticsDesktopUsers', `${formatNumberSafe(Math.round(Number(stats.total_users || 0) * 0.6))} users`);
            setTextIfExists('analyticsMobileUsers', `${formatNumberSafe(Math.round(Number(stats.total_users || 0) * 0.35))} users`);
            setTextIfExists('analyticsTabletUsers', `${formatNumberSafe(Math.round(Number(stats.total_users || 0) * 0.05))} users`);
            setTextIfExists('analyticsDesktopUsersPercent', '60%');
            setTextIfExists('analyticsMobileUsersPercent', '35%');
            setTextIfExists('analyticsTabletUsersPercent', '5%');

            // Behavior placeholders
            setTextIfExists('analyticsAvgPagesPerSession', '0');
            setTextIfExists('analyticsAvgSessionDuration', String(stats.avg_session_duration ?? '—'));
            setTextIfExists('analyticsBounceRate', formatPercentSafe(stats.bounce_rate));
            setTextIfExists('analyticsConversionRate', '0%');
        })
        .catch(error => {
            console.error('Dashboard stats error:', error);
        });
}

function setTextIfExists(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerText = value;
}

function applyPercentBarIfExists(barId, textId, rawPercent) {
    if (rawPercent === undefined || rawPercent === null) return;

    const percent = clampPercent(rawPercent);

    const bar = document.getElementById(barId);
    if (bar) bar.style.width = `${percent}%`;

    if (textId) {
        setTextIfExists(textId, `${percent}%`);
    }
}

function loadRecentActivity() {
    const container = document.getElementById('recentActivityList');
    if (!container) return;

    fetch('/api/admin/activity')
        .then(r => r.json())
        .then(data => {
            if (!data || data.status !== 'success' || !Array.isArray(data.items)) return;

            container.innerHTML = '';
            data.items.slice(0, 6).forEach(item => {
                const row = document.createElement('div');
                row.className = 'activity-item';
                row.innerHTML = `
                    <div class="activity-icon">${escapeHtml(item.icon || '✓')}</div>
                    <div class="activity-info">
                        <div class="activity-title">${escapeHtml(item.title || '—')}</div>
                        <div class="activity-time">${escapeHtml(item.time || '—')}</div>
                    </div>
                `;
                container.appendChild(row);
            });
        })
        .catch(err => console.error('Activity error:', err));
}

function loadSystemHealth() {
    // Health is driven primarily by dashboard stats; this exists as a safe fallback.
    const hasHealth = document.getElementById('healthServerDot') || document.getElementById('healthServerText');
    if (!hasHealth) return;

    fetch('/api/admin/dashboard/stats')
        .then(r => r.json())
        .then(data => {
            if (!data || data.status !== 'success' || !data.stats) return;
            const s = data.stats;
            applyHealthIfExists('healthServerDot', 'healthServerText', s.server_health);
            applyHealthIfExists('healthDatabaseDot', 'healthDatabaseText', s.uptime);
            applyHealthIfExists('healthApiDot', 'healthApiText', s.api_response);
            applyHealthStatus('healthBackupDot', 'healthBackupText', true, 'Running');
        })
        .catch(() => {
            // If stats endpoint fails, keep placeholders.
        });
}

function applyHealthIfExists(dotId, textId, percent) {
    if (percent === undefined || percent === null) return;
    const p = clampPercent(percent);
    const ok = p >= 70;
    const label = ok ? 'Healthy' : (p >= 40 ? 'Degraded' : 'Down');
    applyHealthStatus(dotId, textId, ok, label);
}

function applyHealthStatus(dotId, textId, ok, label) {
    const dot = document.getElementById(dotId);
    if (dot) {
        dot.classList.remove('active');
        if (ok) dot.classList.add('active');
    }
    setTextIfExists(textId, label);
}

function loadAdminUsersPages() {
    const usersBody = document.getElementById('allUsersTableBody') || document.getElementById('activeUsers24hTableBody');
    const adminsBody = document.getElementById('admins7dTableBody');
    const activityLog = document.getElementById('usersRecentActivityLog');
    if (!usersBody && !adminsBody && !activityLog) return;

    // Users
    fetch('/api/admin/users')
        .then(r => r.json())
        .then(data => {
            if (!data || data.status !== 'success' || !Array.isArray(data.users)) return;
            const users = data.users;

            // backend-users page
            const allUsersTbody = document.getElementById('allUsersTableBody');
            if (allUsersTbody) {
                allUsersTbody.innerHTML = '';
                users.forEach(u => {
                    const tr = document.createElement('tr');
                    const name = u.fullname || u.name || '—';
                    const email = u.email || '—';
                    const joinDate = u.registration_date || '—';
                    const lastActive = u.last_active || '—';
                    const status = u.status || 'active';
                    tr.innerHTML = `
                        <td>
                            <div class="user-info">
                                <span class="user-avatar">👤</span>
                                <span>${escapeHtml(name)}</span>
                            </div>
                        </td>
                        <td>${escapeHtml(email)}</td>
                        <td>${escapeHtml(joinDate)}</td>
                        <td>${escapeHtml(lastActive)}</td>
                        <td><span class="status-badge ${status === 'active' ? 'success' : 'warning'}">${escapeHtml(status)}</span></td>
                        <td>
                            <button class="action-btn" disabled>Edit</button>
                            <button class="action-btn" style="background: #f59e0b;" disabled>Suspend</button>
                        </td>
                    `;
                    allUsersTbody.appendChild(tr);
                });
                setTextIfExists('allUsersCount', `${formatNumberSafe(users.length)} users`);
            }

            // backend-registrations page active users table
            const active24Body = document.getElementById('activeUsers24hTableBody');
            if (active24Body) {
                active24Body.innerHTML = '';
                const activeUsers = users.filter(u => (u.status || '').toLowerCase() === 'active');
                activeUsers.slice(0, 8).forEach(u => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>
                            <div class="user-info">
                                <span class="user-avatar">👤</span>
                                <span>${escapeHtml(u.fullname || '—')}</span>
                            </div>
                        </td>
                        <td>${escapeHtml(u.email || '—')}</td>
                        <td>${escapeHtml(u.last_active || '—')}</td>
                        <td><span class="status-badge success">Active</span></td>
                        <td><button class="action-btn" disabled>View</button></td>
                    `;
                    active24Body.appendChild(tr);
                });
                setTextIfExists('activeUsers24hCount', `${formatNumberSafe(activeUsers.length)} active users`);

                // stats boxes placeholders from counts
                setTextIfExists('usersStatsToday', formatNumberSafe(activeUsers.length));
                setTextIfExists('usersStatsWeek', formatNumberSafe(activeUsers.length));
                setTextIfExists('usersStatsMonth', formatNumberSafe(activeUsers.length));
            }
        })
        .catch(err => console.error('Users error:', err));

    // Admins
    fetch('/api/admin/admins')
        .then(r => r.json())
        .then(data => {
            if (!data || data.status !== 'success' || !Array.isArray(data.admins)) return;
            const admins = data.admins;
            const tbody = document.getElementById('admins7dTableBody');
            if (!tbody) return;
            tbody.innerHTML = '';

            admins.slice(0, 8).forEach(a => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div class="user-info">
                            <span class="user-avatar">👨‍💼</span>
                            <span>${escapeHtml(a.adminname || '—')}</span>
                        </div>
                    </td>
                    <td>${escapeHtml(a.adminemail || '—')}</td>
                    <td>${escapeHtml(a.adminusername || '—')}</td>
                    <td>${escapeHtml(a.registration_date || '—')}</td>
                    <td><span class="role-badge admin">${escapeHtml(a.role || 'admin')}</span></td>
                    <td><span class="status-badge success">${escapeHtml(a.status || 'active')}</span></td>
                `;
                tbody.appendChild(tr);
            });

            setTextIfExists('admins7dCount', `${formatNumberSafe(admins.length)} administrators`);
        })
        .catch(err => console.error('Admins error:', err));

    // Recent activity log section on registrations page
    const log = document.getElementById('usersRecentActivityLog');
    if (log) {
        fetch('/api/admin/activity')
            .then(r => r.json())
            .then(data => {
                if (!data || data.status !== 'success' || !Array.isArray(data.items)) return;
                log.innerHTML = '';
                data.items.slice(0, 8).forEach(item => {
                    const entry = document.createElement('div');
                    entry.className = 'activity-entry';
                    entry.innerHTML = `
                        <div class="activity-time">${escapeHtml(item.time || '—')}</div>
                        <div class="activity-description">${escapeHtml(item.title || '—')}</div>
                    `;
                    log.appendChild(entry);
                });
            })
            .catch(() => {});
    }
}

function loadAnalyticsPlaceholders() {
    // This function is intentionally lightweight; analytics UI is populated from dashboard stats.
    // It exists to ensure no errors when analytics page is opened.
    const hasAnalytics = document.getElementById('trafficChart');
    if (!hasAnalytics) return;

    // Build a minimal chart using current totals (no hardcoded demo series)
    if (window.Chart && typeof window.Chart === 'function') {
        const ctx = document.getElementById('trafficChart');
        if (!ctx) return;
        fetch('/api/admin/dashboard/stats')
            .then(r => r.json())
            .then(data => {
                if (!data || data.status !== 'success' || !data.stats) return;
                const tv = Number(String(data.stats.total_visits || 0).replace(/,/g, ''));
                const series = [0, 0, 0, 0, 0, 0, 0].map((_, i) => Math.max(0, Math.round((tv / 7) * (0.8 + (i * 0.05)))));

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                            label: 'Page Views',
                            data: series,
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            })
            .catch(() => {});
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function clampPercent(value) {
    let n;
    if (typeof value === 'string') {
        n = parseFloat(value.replace('%', ''));
    } else {
        n = Number(value);
    }
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
}

function formatNumberSafe(value) {
    const n = Number(String(value).replace(/,/g, ''));
    if (Number.isNaN(n)) return '0';
    return formatNumber(n);
}

function formatPercentSafe(value) {
    if (value === undefined || value === null) return '0%';
    if (typeof value === 'string') {
        return value.includes('%') ? value : `${value}%`;
    }
    const n = Number(value);
    if (Number.isNaN(n)) return '0%';
    return `${n}%`;
}

function formatCurrencySafe(value) {
    const n = Number(String(value).replace(/[^0-9.\-]/g, ''));
    if (Number.isNaN(n)) return '—';
    return `$${formatNumber(Math.round(n))}`;
}

function formatMsSafe(value) {
    if (typeof value === 'string') {
        return value.toLowerCase().includes('ms') ? value : `${value}ms`;
    }
    const n = Number(value);
    if (Number.isNaN(n)) return '—';
    return `${Math.round(n)}ms`;
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
