// ==========================================
// DASHBOARD, ESTIMATES, PIPELINE, ACCOUNTS
// ==========================================

// ==========================================
// HOME PAGE
// Role-specific landing with company bulletins
// ==========================================

function loadHome() {
    renderBulletinBoard('bulletinBoard');
    renderNotificationsPanel('notificationsPanel', currentRole);
    renderAttentionPanel('attentionPanel');

    // Update welcome message
    var userName = currentRole === 'admin' ? 'Admin' : 'Office Manager';
    var subtitle = document.querySelector('#homeView .page-subtitle');
    if (subtitle) subtitle.textContent = 'Welcome back, ' + userName;
}

function loadTechHome() {
    renderBulletinBoard('techBulletinBoard');
    renderNotificationsPanel('techNotificationsPanel', 'field');
    renderTodayPanel('techTodayPanel');

    // Update welcome message
    var subtitle = document.querySelector('#techHomeView .page-subtitle');
    if (subtitle) subtitle.textContent = 'Welcome back';
}

function renderBulletinBoard(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var activeBulletins = COMPANY_BULLETINS.filter(b => b.active);

    if (activeBulletins.length === 0) {
        container.innerHTML = '';
        return;
    }

    var html = '<div class="bulletin-header"><span>📢</span><span>Company Announcements</span></div>';
    html += '<div class="bulletin-items">';

    activeBulletins.forEach(function(bulletin) {
        var typeInfo = BULLETIN_TYPES[bulletin.type] || BULLETIN_TYPES.info;
        html += '<div class="bulletin-item" style="background: ' + typeInfo.bg + '; border-left: 4px solid ' + typeInfo.color + ';">';
        html += '<div class="bulletin-icon">' + typeInfo.icon + '</div>';
        html += '<div class="bulletin-content">';
        html += '<div class="bulletin-title">' + bulletin.title + '</div>';
        html += '<div class="bulletin-message">' + bulletin.message + '</div>';
        html += '</div>';
        html += '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
}

// ==========================================
// NOTIFICATIONS PANEL
// ==========================================

function renderNotificationsPanel(containerId, role) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var notifications = USER_NOTIFICATIONS[role] || [];
    var unreadCount = notifications.filter(n => !n.read).length;

    var html = '<div class="panel-header">';
    html += '<div class="panel-title"><span>🔔</span> Your Updates</div>';
    if (unreadCount > 0) {
        html += '<span class="panel-badge">' + unreadCount + ' new</span>';
    }
    html += '</div>';

    html += '<div class="panel-content">';

    if (notifications.length === 0) {
        html += '<div class="panel-empty">No notifications</div>';
    } else {
        notifications.slice(0, 5).forEach(function(notif) {
            var typeInfo = NOTIFICATION_TYPES[notif.type] || { icon: '📌', color: '#6b7280' };
            var readClass = notif.read ? 'read' : 'unread';
            var timeAgo = getTimeAgo(notif.createdAt);

            html += '<div class="notification-item ' + readClass + '" onclick="markNotificationRead(\'' + role + '\', \'' + notif.id + '\')">';
            html += '<div class="notification-icon" style="color: ' + typeInfo.color + '">' + typeInfo.icon + '</div>';
            html += '<div class="notification-content">';
            html += '<div class="notification-title">' + notif.title + '</div>';
            html += '<div class="notification-message">' + notif.message + '</div>';
            html += '<div class="notification-time">' + timeAgo + '</div>';
            html += '</div>';
            if (!notif.read) {
                html += '<div class="notification-dot"></div>';
            }
            html += '</div>';
        });
    }

    html += '</div>';
    container.innerHTML = html;
}

function markNotificationRead(role, notifId) {
    var notifications = USER_NOTIFICATIONS[role] || [];
    var notif = notifications.find(n => n.id === notifId);
    if (notif && !notif.read) {
        notif.read = true;
        saveNotifications();
        // Re-render the panel
        if (role === 'field') {
            renderNotificationsPanel('techNotificationsPanel', 'field');
        } else {
            renderNotificationsPanel('notificationsPanel', currentRole);
        }
    }
}

function getTimeAgo(dateString) {
    var date = new Date(dateString);
    var now = new Date();
    var diffMs = now - date;
    var diffMins = Math.floor(diffMs / 60000);
    var diffHours = Math.floor(diffMs / 3600000);
    var diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return diffMins + 'm ago';
    if (diffHours < 24) return diffHours + 'h ago';
    if (diffDays < 7) return diffDays + 'd ago';
    return date.toLocaleDateString();
}

// ==========================================
// NEEDS ATTENTION PANEL (Office/Admin)
// ==========================================

function renderAttentionPanel(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    // Gather attention items from existing data
    var attentionItems = [];

    // Pink jobs
    var pinkJobs = PIPELINE_JOBS.filter(j => j.status === 'Pink');
    if (pinkJobs.length > 0) {
        attentionItems.push({
            icon: '🩷',
            label: pinkJobs.length + ' Pink Job' + (pinkJobs.length > 1 ? 's' : ''),
            detail: pinkJobs.map(j => j.location).join(', '),
            action: "showView('jobs')",
            color: '#e91e63'
        });
    }

    // Pending ops reviews
    var pendingReviews = inspectionJobs.filter(j => j.status === 'submitted');
    if (pendingReviews.length > 0) {
        attentionItems.push({
            icon: '📋',
            label: pendingReviews.length + ' Pending Review' + (pendingReviews.length > 1 ? 's' : ''),
            detail: 'Inspections awaiting ops review',
            action: "showView('opsReview')",
            color: '#ff9800'
        });
    }

    // Unconfirmed scheduled jobs (from schedule data if available)
    var scheduledJobs = PIPELINE_JOBS.filter(j => j.status === 'Scheduled');
    if (scheduledJobs.length > 0) {
        attentionItems.push({
            icon: '📅',
            label: scheduledJobs.length + ' Scheduled Job' + (scheduledJobs.length > 1 ? 's' : ''),
            detail: 'Ready for field assignment',
            action: "showView('scheduling')",
            color: '#2196F3'
        });
    }

    // Parts ordered (waiting)
    var partsOrdered = PIPELINE_JOBS.filter(j => j.status === 'Parts Ordered');
    if (partsOrdered.length > 0) {
        attentionItems.push({
            icon: '📦',
            label: partsOrdered.length + ' Awaiting Parts',
            detail: 'Parts on order',
            action: "showView('projects')",
            color: '#9c27b0'
        });
    }

    var html = '<div class="panel-header">';
    html += '<div class="panel-title"><span>⚡</span> Needs Attention</div>';
    html += '</div>';

    html += '<div class="panel-content">';

    if (attentionItems.length === 0) {
        html += '<div class="panel-empty" style="color: #4caf50;">✓ All caught up!</div>';
    } else {
        attentionItems.forEach(function(item) {
            html += '<div class="attention-item" onclick="' + item.action + '">';
            html += '<div class="attention-icon" style="color: ' + item.color + '">' + item.icon + '</div>';
            html += '<div class="attention-content">';
            html += '<div class="attention-label">' + item.label + '</div>';
            html += '<div class="attention-detail">' + item.detail + '</div>';
            html += '</div>';
            html += '<div class="attention-arrow">→</div>';
            html += '</div>';
        });
    }

    html += '</div>';
    container.innerHTML = html;
}

// ==========================================
// TODAY'S JOBS PANEL (Field)
// ==========================================

function renderTodayPanel(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    // Get today's jobs from schedule data
    var today = new Date().toISOString().split('T')[0];
    var todayJobs = [];

    // Pull from OFFICE_WORK_ORDERS for demo
    Object.values(OFFICE_WORK_ORDERS).forEach(function(wo) {
        if (wo.scheduledDate === today || wo.scheduledDate === '2026-01-22') { // Include sample date
            todayJobs.push(wo);
        }
    });

    var html = '<div class="panel-header">';
    html += '<div class="panel-title"><span>📅</span> Today\'s Jobs</div>';
    if (todayJobs.length > 0) {
        html += '<span class="panel-badge">' + todayJobs.length + '</span>';
    }
    html += '</div>';

    html += '<div class="panel-content">';

    if (todayJobs.length === 0) {
        html += '<div class="panel-empty">No jobs scheduled today</div>';
    } else {
        todayJobs.forEach(function(job) {
            html += '<div class="today-job-item" onclick="showTechView(\'myjobs\')">';
            html += '<div class="today-job-time">' + job.scheduledTime + '</div>';
            html += '<div class="today-job-content">';
            html += '<div class="today-job-location">' + job.locationName + '</div>';
            html += '<div class="today-job-type">' + job.jobType + ' - #' + job.jobNumber + '</div>';
            html += '</div>';
            html += '</div>';
        });
    }

    html += '</div>';
    container.innerHTML = html;
}

// ==========================================
// DASHBOARD (Obsolete)
// Kept for backwards compatibility
// ==========================================

function loadOfficeDashboard() {
    // Dashboard view is obsolete - office/admin default to Home
}

function updateDashboardStats() {
    // Stub function - old dashboard view is obsolete
}

// ==========================================
// ESTIMATES
// View, filter, and manage estimates
// ==========================================

// Track current estimates filter
var currentEstimatesFilter = 'all';

async function loadEstimates() {
    // Show loading state in visible tab containers
    const loadingHtml = '<div style="padding: 40px; text-align: center; color: #6c757d;"><div style="margin-bottom: 12px; font-size: 24px;">Loading estimates from QuickBooks...</div><div style="width: 200px; height: 4px; background: #e9ecef; border-radius: 2px; margin: 0 auto; overflow: hidden;"><div style="width: 40%; height: 100%; background: #007bff; border-radius: 2px; animation: loadingBar 1.5s ease-in-out infinite;"></div></div></div>';
    const style = document.getElementById('estimatesLoadingStyle') || document.createElement('style');
    if (!style.id) {
        style.id = 'estimatesLoadingStyle';
        style.textContent = '@keyframes loadingBar { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }';
        document.head.appendChild(style);
    }
    ['allEstimatesList', 'estimatesList', 'acceptedEstimatesList'].forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.innerHTML.trim()) el.innerHTML = loadingHtml;
    });

    // Fetch from QB API and update badge counts
    try {
        const data = await EstimatesAPI.list({ limit: 500 });
        const estimates = data.estimates || [];

        const pendingCount = estimates.filter(e => e.status === 'Pending').length;
        const acceptedCount = estimates.filter(e => e.status === 'Accepted').length;

        document.getElementById('estPendingCount').textContent = pendingCount;
        document.getElementById('estAcceptedCount').textContent = acceptedCount;

        // Store for filtering
        window._qbEstimates = estimates;
    } catch (err) {
        console.error('Failed to load estimates:', err);
        window._qbEstimates = [];
    }

    // Load the current tab content
    filterEstimates(currentEstimatesFilter);
}

function filterEstimates(filter) {
    currentEstimatesFilter = filter;

    // Update tab active states
    document.getElementById('estFilterAll').classList.remove('active');
    document.getElementById('estFilterPending').classList.remove('active');
    document.getElementById('estFilterAccepted').classList.remove('active');
    document.getElementById('estFilterCreate').classList.remove('active');
    document.getElementById('estFilter' + filter.charAt(0).toUpperCase() + filter.slice(1)).classList.add('active');

    // Hide all tab content
    document.getElementById('estimatesAllTab').classList.add('hidden');
    document.getElementById('estimatesPendingTab').classList.add('hidden');
    document.getElementById('estimatesAcceptedTab').classList.add('hidden');
    document.getElementById('estimatesCreateTab').classList.add('hidden');

    // Show selected tab and load content
    if (filter === 'all') {
        document.getElementById('estimatesAllTab').classList.remove('hidden');
        loadEstimatesAll();
    } else if (filter === 'pending') {
        document.getElementById('estimatesPendingTab').classList.remove('hidden');
        loadEstimatesPending();
    } else if (filter === 'accepted') {
        document.getElementById('estimatesAcceptedTab').classList.remove('hidden');
        loadEstimatesAccepted();
    } else if (filter === 'create') {
        document.getElementById('estimatesCreateTab').classList.remove('hidden');
        initEstimateCreate();
    }
}

function loadEstimatesAll() {
    const list = document.getElementById('allEstimatesList');
    const searchEl = document.getElementById('allEstimateSearch');
    const searchTerm = searchEl ? searchEl.value.toLowerCase() : '';

    // Use cached QB estimates
    let estimates = window._qbEstimates || [];

    if (searchTerm) {
        estimates = estimates.filter(e =>
            (e.docNumber || '').toLowerCase().includes(searchTerm) ||
            (e.customerName || '').toLowerCase().includes(searchTerm) ||
            (e.email || '').toLowerCase().includes(searchTerm)
        );
    }

    if (estimates.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-icon">📋</div>
                <p>${searchTerm ? 'No estimates match your search' : 'No estimates found'}</p>
                ${!searchTerm ? '<p style="font-size: 13px; color: #6c757d; margin-top: 8px;">Estimates are synced from QuickBooks</p>' : ''}
            </div>
        `;
    } else {
        list.innerHTML = estimates.map(est => {
            const statusStyle = EstimatesAPI.statusColors[est.status] || { bg: '#e0e0e0', color: '#616161' };
            return `
            <div class="inspection-item" onclick="viewQbEstimate('${est.id}')" style="padding: 16px; border-bottom: 1px solid #e9ecef; cursor: pointer;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <span style="font-weight: 600; color: #007bff;">#${est.docNumber}</span>
                            <span class="badge" style="background: ${statusStyle.bg}; color: ${statusStyle.color};">${est.status}</span>
                        </div>
                        <strong style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${est.customerName}</strong>
                        <p style="font-size: 13px; color: #6c757d; margin-top: 4px;">
                            ${est.lineItems?.length || 0} line items • ${new Date(est.txnDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div style="text-align: right; flex-shrink: 0; margin-left: 16px;">
                        <span style="font-weight: 600; color: #28a745; font-size: 16px;">$${(est.totalAmount || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `}).join('');
    }
}

function loadEstimatesPending() {
    const list = document.getElementById('estimatesList');
    const searchEl = document.getElementById('estimateSearch');
    const searchTerm = searchEl ? searchEl.value.toLowerCase() : '';

    // Filter QB estimates for Pending status
    let estimates = (window._qbEstimates || []).filter(e => e.status === 'Pending');

    if (searchTerm) {
        estimates = estimates.filter(e =>
            (e.docNumber || '').toLowerCase().includes(searchTerm) ||
            (e.customerName || '').toLowerCase().includes(searchTerm) ||
            (e.email || '').toLowerCase().includes(searchTerm)
        );
    }

    if (estimates.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-icon">📋</div>
                <p>${searchTerm ? 'No estimates match your search' : 'No pending estimates'}</p>
            </div>
        `;
    } else {
        list.innerHTML = estimates.map(est => `
            <div class="inspection-item" onclick="viewQbEstimate('${est.id}')" style="padding: 16px; border-bottom: 1px solid #e9ecef; cursor: pointer;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <span style="font-weight: 600; color: #007bff;">#${est.docNumber}</span>
                        </div>
                        <strong style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${est.customerName}</strong>
                        <p style="font-size: 13px; color: #6c757d; margin-top: 4px;">
                            ${est.email || 'No email'} • ${new Date(est.txnDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div style="text-align: right; flex-shrink: 0; margin-left: 16px;">
                        <span style="font-weight: 600; color: #28a745; font-size: 16px;">$${(est.totalAmount || 0).toLocaleString()}</span>
                        <span class="badge badge-warning" style="display: block; margin-top: 4px;">Pending</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function loadEstimatesList() {
    // Called by search input - just reload current tab
    if (currentEstimatesFilter === 'all') {
        loadEstimatesAll();
    } else if (currentEstimatesFilter === 'pending') {
        loadEstimatesPending();
    } else if (currentEstimatesFilter === 'accepted') {
        loadEstimatesAccepted();
    }
}

function viewEstimate(id) {
    const inspection = inspections.find(i => i.id === id);
    if (!inspection) return;

    const customer = SAMPLE_CUSTOMERS.find(c => c.id === inspection.customerId);
    const totalParts = (inspection.selectedParts || []).reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalShipping = inspection.shippingCost || 0;
    const totalLabor = (inspection.laborHours || 0) * 65;
    const grandTotal = totalParts + totalShipping + totalLabor;

    document.getElementById('estimateDetailContent').innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Customer Information</h2>
            </div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div>
                        <p style="font-size: 12px; color: #6c757d; margin-bottom: 4px;">Customer</p>
                        <p style="font-size: 14px; font-weight: 600;">${inspection.customerName}</p>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: #6c757d; margin-bottom: 4px;">Location</p>
                        <p style="font-size: 14px; font-weight: 600;">${inspection.location}</p>
                    </div>
                    ${customer ? `
                        <div>
                            <p style="font-size: 12px; color: #6c757d; margin-bottom: 4px;">Contact</p>
                            <p style="font-size: 14px; font-weight: 600;">${customer.contact}</p>
                        </div>
                        <div>
                            <p style="font-size: 12px; color: #6c757d; margin-bottom: 4px;">Phone</p>
                            <p style="font-size: 14px; font-weight: 600;">${customer.phone}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Parts Specification Form (PSF)</h2>
                <span class="badge badge-success">${inspection.selectedParts?.length || 0} parts</span>
            </div>
            <div class="card-body">
                ${!inspection.selectedParts || inspection.selectedParts.length === 0 ?
                    '<div style="text-align: center; padding: 40px; color: #6c757d;">No parts selected</div>' :
                    `<div style="overflow-x: auto;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Part #</th>
                                    <th>Description</th>
                                    <th>Vendor</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${inspection.selectedParts.map(part => `
                                    <tr>
                                        <td><span class="part-number">${part.partNumber}</span></td>
                                        <td>${part.description}</td>
                                        <td><span style="font-size: 12px; color: #6c757d;">${part.vendor}</span></td>
                                        <td>${part.quantity}</td>
                                        <td>$${part.price.toFixed(2)}</td>
                                        <td style="font-weight: 600;">$${(part.quantity * part.price).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>`
                }

                <div style="margin-top: 24px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <span>Parts Subtotal:</span>
                        <span style="font-weight: 600;">$${totalParts.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <span>Shipping:</span>
                        <span style="font-weight: 600;">$${totalShipping.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <span>Labor (${inspection.laborHours || 0} hrs × $65/hr):</span>
                        <span style="font-weight: 600;">$${totalLabor.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 2px solid #dee2e6; font-size: 18px; font-weight: 700; color: #4CAF50;">
                        <span>Grand Total:</span>
                        <span>$${grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                ${inspection.notes ? `
                    <div style="margin-top: 20px;">
                        <p style="font-size: 12px; color: #6c757d; margin-bottom: 8px; font-weight: 600;">Service Notes:</p>
                        <div style="padding: 12px; background: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px;">
                            ${inspection.notes}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>

        <div class="card" style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white;">
            <div class="card-body">
                <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 12px;">🚀 ONE-CLICK QuickBooks Integration</h3>
                <p style="margin-bottom: 20px; opacity: 0.95;">
                    Click below to automatically generate a QuickBooks estimate with all parts, labor, and customer details.
                    This eliminates 30+ minutes of manual entry!
                </p>
                <button class="btn btn-lg" onclick="generateEstimate('${inspection.id}', ${grandTotal})"
                    style="background: white; color: #4CAF50; font-weight: 700; width: 100%;">
                    Generate QuickBooks Estimate
                </button>
            </div>
        </div>
    `;

    showView('estimateDetail');
}

// Get next job number (sequential, starting from base)
function getNextJobNumber() {
    const baseJobNumber = 17500; // Starting point to match existing ServicePal numbering
    const existingNumbers = jobs.map(j => parseInt(j.jobNumber) || 0);
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : baseJobNumber - 1;
    return maxNumber + 1;
}

function generateEstimate(inspectionId, total) {
    const inspection = inspections.find(i => i.id === inspectionId);
    const jobNumber = getNextJobNumber();

    // Determine job type based on inspection
    const jobType = inspection.inspectionType === 'basketball' ? 'Repair' :
                   inspection.selectedParts?.length > 0 ? 'Repair' : 'Inspection';

    const locationDisplay = inspection.locationName || inspection.customerName;
    const customerDisplay = inspection.customerName || 'Unknown Customer';

    if (confirm(`Generate QuickBooks estimate for ${customerDisplay}?\n\nLocation: ${locationDisplay}\nJob #: ${jobNumber}\nTotal: $${total.toFixed(2)}\n\nThis will:\n• Create estimate #${jobNumber} in QuickBooks\n• Add job to Pipeline\n• Send to Operations Review queue`)) {
        const job = {
            id: 'JOB-' + Date.now(),
            jobNumber: jobNumber,
            estimateNumber: jobNumber, // Same as job number for continuity
            // Customer hierarchy
            customerId: inspection.customerId,
            customerName: inspection.customerName,
            customerType: inspection.customerType,
            locationId: inspection.locationId,
            locationName: inspection.locationName,
            locationAddress: inspection.locationAddress || inspection.location,
            locationContact: inspection.locationContact,
            locationPhone: inspection.locationPhone,
            // Job details
            jobType: jobType,
            description: `${inspection.inspectionType === 'basketball' ? 'Basketball Goal' : inspection.inspectionType === 'bleacher' ? 'Indoor Bleacher' : 'Outdoor Bleacher'} - ${jobType}`,
            inspectionId: inspectionId,
            inspectionType: inspection.inspectionType,
            // Status tracking
            status: 'New',
            // Financials
            amount: total,
            partsTotal: inspection.selectedParts?.reduce((sum, p) => sum + (p.price * p.quantity), 0) || 0,
            shippingTotal: inspection.shippingCost || 0,
            laborTotal: (inspection.laborHours || 0) * 85, // $85/hr default
            // Dates
            createdAt: new Date().toISOString(),
            estimateDate: new Date().toISOString(),
            // Work order fields (to be filled later)
            confirmedWith: '',
            confirmedBy: '',
            confirmedDate: '',
            partsLocation: '',
            specialInstructions: '',
            assignedTo: '',
            scheduledDate: '',
            // Completion tracking
            completedBy: '',
            completedDate: '',
            hoursWorked: 0,
            techNotes: ''
        };

        jobs.push(job);
        localStorage.setItem('jobs', JSON.stringify(jobs));

        alert(`✅ SUCCESS!\n\nQuickBooks Estimate Created:\n• Job #: ${jobNumber}\n• Customer: ${customerDisplay}\n• Location: ${locationDisplay}\n• Total: $${total.toFixed(2)}\n\nJob added to Pipeline!\n\n⏱️ Time saved: 30+ minutes of manual entry`);

        showView('projects');
    }
}

function loadEstimatesAccepted() {
    const list = document.getElementById('acceptedEstimatesList');
    const searchEl = document.getElementById('acceptedEstimateSearch');
    const searchTerm = searchEl ? searchEl.value.toLowerCase() : '';

    // Filter QB estimates for Accepted status
    let estimates = (window._qbEstimates || []).filter(e => e.status === 'Accepted');

    if (searchTerm) {
        estimates = estimates.filter(e =>
            (e.docNumber || '').toLowerCase().includes(searchTerm) ||
            (e.customerName || '').toLowerCase().includes(searchTerm) ||
            (e.email || '').toLowerCase().includes(searchTerm)
        );
    }

    if (estimates.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-icon">✅</div>
                <p>${searchTerm ? 'No estimates match your search' : 'No accepted estimates'}</p>
            </div>
        `;
    } else {
        list.innerHTML = estimates.map(est => `
            <div class="inspection-item" onclick="viewQbEstimate('${est.id}')" style="padding: 16px; border-bottom: 1px solid #e9ecef; cursor: pointer;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <span style="font-weight: 600; color: #007bff;">#${est.docNumber}</span>
                        </div>
                        <strong style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${est.customerName}</strong>
                        <p style="font-size: 13px; color: #6c757d; margin-top: 4px;">
                            ${est.email || 'No email'} • ${new Date(est.txnDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div style="text-align: right; flex-shrink: 0; margin-left: 16px;">
                        <span style="font-weight: 600; color: #28a745; font-size: 16px;">$${(est.totalAmount || 0).toLocaleString()}</span>
                        <span class="badge badge-success" style="display: block; margin-top: 4px;">Accepted</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function initEstimateCreate() {
    // Use the estimate builder module
    if (typeof initEstimateBuilder === 'function') {
        initEstimateBuilder();
    } else {
        console.error('Estimate builder not loaded');
    }
}

// View QB Estimate detail
function viewQbEstimate(estimateId) {
    // Find estimate in cache
    const est = (window._qbEstimates || []).find(e => e.id === estimateId);
    if (!est) {
        alert('Estimate not found');
        return;
    }

    const statusStyle = EstimatesAPI.statusColors[est.status] || { bg: '#e0e0e0', color: '#616161' };

    document.getElementById('estimateDetailContent').innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <h2 class="card-title" style="margin: 0;">Estimate #${est.docNumber}</h2>
                    <span class="badge" style="background: ${statusStyle.bg}; color: ${statusStyle.color}; font-size: 14px; padding: 6px 12px;">${est.status}</span>
                </div>
            </div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                    <div>
                        <p style="font-size: 12px; color: #6c757d; margin-bottom: 4px; text-transform: uppercase;">Customer</p>
                        <p style="font-size: 15px; font-weight: 600;">${est.customerName}</p>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: #6c757d; margin-bottom: 4px; text-transform: uppercase;">Email</p>
                        <p style="font-size: 14px;">${est.email || '-'}</p>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: #6c757d; margin-bottom: 4px; text-transform: uppercase;">Date</p>
                        <p style="font-size: 14px;">${new Date(est.txnDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: #6c757d; margin-bottom: 4px; text-transform: uppercase;">Total</p>
                        <p style="font-size: 20px; font-weight: 700; color: #28a745;">$${(est.totalAmount || 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Line Items</h2>
                <span class="badge badge-info">${est.lineItems?.length || 0} items</span>
            </div>
            <div class="card-body" style="padding: 0;">
                ${!est.lineItems || est.lineItems.length === 0 ?
                    '<div style="text-align: center; padding: 40px; color: #6c757d;">No line items</div>' :
                    `<div style="overflow-x: auto;">
                        <table class="data-table" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8f9fa;">
                                    <th style="padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6c757d;">Description</th>
                                    <th style="padding: 12px 16px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6c757d;">Qty</th>
                                    <th style="padding: 12px 16px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6c757d;">Unit Price</th>
                                    <th style="padding: 12px 16px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6c757d;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${est.lineItems.map(item => `
                                    <tr style="border-bottom: 1px solid #e9ecef;">
                                        <td style="padding: 12px 16px;">
                                            <div style="font-weight: 500;">${item.itemName || 'Item'}</div>
                                            ${item.description ? `<div style="font-size: 13px; color: #6c757d; margin-top: 4px; white-space: pre-wrap;">${item.description}</div>` : ''}
                                        </td>
                                        <td style="padding: 12px 16px; text-align: right;">${item.quantity || 1}</td>
                                        <td style="padding: 12px 16px; text-align: right;">$${(item.unitPrice || 0).toFixed(2)}</td>
                                        <td style="padding: 12px 16px; text-align: right; font-weight: 600;">$${(item.amount || 0).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr style="background: #f8f9fa;">
                                    <td colspan="3" style="padding: 12px 16px; text-align: right; font-weight: 600;">Total</td>
                                    <td style="padding: 12px 16px; text-align: right; font-weight: 700; font-size: 16px; color: #28a745;">$${(est.totalAmount || 0).toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>`
                }
            </div>
        </div>

        ${est.status === 'Accepted' ? `
            <div style="margin-top: 24px; padding: 20px; background: #e8f5e9; border-radius: 8px; text-align: center;">
                <p style="font-weight: 600; color: #2e7d32; margin-bottom: 12px;">✅ This estimate has been accepted</p>
                <button class="btn btn-primary" onclick="createWorkOrderFromEstimate(event, '${est.id}')">Create Work Order</button>
            </div>
        ` : ''}
    `;

    showView('estimateDetail');
}

// Parse procurement notes from QB PrivateNote
function parseProcurementNotes(privateNote) {
    if (!privateNote) return [];
    const notes = [];
    const notesMatch = privateNote.match(/NOTES:\s*(.+?)(?:\s*\||$)/);
    if (notesMatch) {
        notesMatch[1].split(';').forEach(note => {
            const text = note.trim();
            if (text) notes.push({ text, source: 'estimate' });
        });
    }
    return notes;
}

// Detect stock parts from estimate line items (fallback for non-builder estimates)
function detectStockPartsFromEstimate(lineItems) {
    const stockParts = [];
    const shopPatterns = [
        { pattern: /tn\s*shop/i, location: 'TN Shop' },
        { pattern: /fl\s*shop/i, location: 'FL Shop' },
        { pattern: /al\s*shop/i, location: 'AL Shop' },
        { pattern: /from\s*stock/i, location: 'Stock' },
        { pattern: /in\s*stock/i, location: 'Stock' },
        { pattern: /on\s*hand/i, location: 'Stock' }
    ];

    (lineItems || []).forEach(item => {
        const text = ((item.itemName || '') + ' ' + (item.description || '')).toLowerCase();
        for (const sp of shopPatterns) {
            if (sp.pattern.test(text)) {
                stockParts.push({
                    itemName: item.itemName || item.description || 'Part',
                    quantity: item.quantity || 1,
                    stockLocation: sp.location,
                    verified: false
                });
                break;
            }
        }
    });
    return stockParts;
}

// Create work order from accepted estimate
async function createWorkOrderFromEstimate(evt, estimateId) {
    // Get estimate from cache
    const est = (window._qbEstimates || []).find(e => e.id === estimateId);
    if (!est) {
        alert('Estimate not found');
        return;
    }

    if (est.status !== 'Accepted') {
        alert('Only accepted estimates can be converted to work orders.');
        return;
    }

    // Check if work order already exists for this estimate
    try {
        const existing = await JobsAPI.list({ limit: 100 });
        const alreadyExists = existing.jobs.find(j => j.qbEstimateId === estimateId);
        if (alreadyExists) {
            alert(`A work order already exists for this estimate: ${alreadyExists.jobNumber}`);
            return;
        }
    } catch (err) {
        console.error('Error checking existing work orders:', err);
    }

    // Generate job number: WO-YYYY-NNNN
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const jobNumber = `WO-${year}-${randomNum}`;

    // Build work instructions from line items
    // Labor lines become the description, parts stored in metadata
    const laborLines = [];
    const partsLines = [];

    (est.lineItems || []).forEach(item => {
        const name = (item.itemName || '').toLowerCase();
        const isLabor = name.includes('labor') || name.includes('service') ||
                       name.includes('install') || name.includes('repair') ||
                       name.includes('replace') || name.includes('remove');

        const lineText = `• ${item.itemName || 'Item'}${item.description ? ': ' + item.description : ''} (Qty: ${item.quantity || 1})`;

        if (isLabor) {
            laborLines.push(lineText);
        } else {
            partsLines.push(lineText);
        }
    });

    // If no labor lines identified, use all lines as instructions
    const instructions = laborLines.length > 0 ? laborLines :
        (est.lineItems || []).map(item =>
            `• ${item.itemName || 'Item'}${item.description ? ': ' + item.description : ''} (Qty: ${item.quantity || 1})`
        );

    const description = instructions.join('\n');

    // Extract procurement intelligence from estimate
    const procurementNotes = parseProcurementNotes(est.privateNote);
    const stockParts = detectStockPartsFromEstimate(est.lineItems);

    // Determine primary parts location from stock parts
    const primaryLocation = stockParts.length > 0
        ? stockParts.reduce((acc, sp) => {
            acc[sp.stockLocation] = (acc[sp.stockLocation] || 0) + 1;
            return acc;
        }, {})
        : {};
    const topLocation = Object.entries(primaryLocation).sort((a, b) => b[1] - a[1])[0];

    // Create the work order
    const jobData = {
        jobNumber,
        jobType: 'repair',
        status: 'draft',
        customerId: est.customerId,
        customerName: est.customerName,
        contactEmail: est.email,
        title: `Work Order from Estimate #${est.docNumber}`,
        description: description || 'See estimate for details',
        qbEstimateId: estimateId,
        qbEstimateTotal: est.totalAmount,
        metadata: {
            sourceEstimate: {
                docNumber: est.docNumber,
                txnDate: est.txnDate,
                lineItems: est.lineItems
            },
            partsNeeded: partsLines,
            procurementNotes: procurementNotes,
            stockParts: stockParts,
            partsTracking: {
                partsOrdered: false,
                poNumber: '',
                promiseDate: null,
                destination: '',
                partsReceived: false,
                partsLocation: topLocation ? topLocation[0] : '',
                stockVerified: false,
                stockVerifiedBy: '',
                stockVerifiedDate: null
            }
        }
    };

    // Show loading state
    const btn = evt.target;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Creating...';

    try {
        const result = await JobsAPI.create(jobData);

        // Success - show confirmation and navigate to Jobs
        alert(`Work order ${result.job.jobNumber} created successfully!\n\nThe estimate's line items have been converted to work instructions.`);

        // Navigate to Jobs view to see the new work order
        if (typeof loadJobsView === 'function') {
            document.querySelector('[data-view="jobs"]')?.click();
        }
    } catch (err) {
        console.error('Error creating work order:', err);
        alert('Failed to create work order: ' + err.message);
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

// ==========================================
// SALES PIPELINE (v3)
// Pre-sale: estimates, follow-ups, deal tracking
// ==========================================

function loadSalesPipeline() {
    const container = document.getElementById('salesPipelineContent');
    if (!container) return;

    // Sales-specific stages from Salesmate (Story's feedback)
    var salesStages = [
        { key: 'Estimate in Process', label: 'Estimate in Process', color: '#6c757d', bg: '#f8f9fa' },
        { key: 'Operations Review', label: 'Operations Review', color: '#e65100', bg: '#fff3e0' },
        { key: 'Estimate Complete', label: 'Estimate Complete', color: '#1565c0', bg: '#e3f2fd' },
        { key: 'Client Review', label: 'Client Review/Follow Up', color: '#7b1fa2', bg: '#f3e5f5' },
        { key: 'In Process/PO Received', label: 'In Process/PO Received', color: '#2e7d32', bg: '#e8f5e9' },
        { key: 'Complete', label: 'Complete', color: '#388e3c', bg: '#c8e6c9' }
    ];

    // For now, use same data but will filter/adapt for sales context
    var allJobs = PIPELINE_JOBS.slice();

    // Apply territory filter
    if (currentPipelineTerritory === 'Original') {
        allJobs = allJobs.filter(function(j) { return j.territory === 'Original'; });
    } else if (currentPipelineTerritory === 'Southern') {
        allJobs = allJobs.filter(function(j) { return j.territory === 'Southern'; });
    } else if (currentPipelineTerritory === 'new') {
        allJobs = allJobs.filter(function(j) {
            var desc = (j.description || '').toLowerCase();
            var type = (j.jobType || '').toLowerCase();
            return desc.includes('install') || desc.includes('new install') || type.includes('install');
        });
    }

    // Map current statuses to sales stages
    allJobs = allJobs.map(function(j) {
        var salesStatus = j.status;
        if (j.status === 'Estimate Sent') salesStatus = 'Estimate Complete';
        if (j.status === 'Accepted') salesStatus = 'In Process/PO Received';
        return Object.assign({}, j, { salesStatus: salesStatus, dealGrade: j.dealGrade || 'B' });
    });

    // Count jobs per stage
    var stageCounts = {};
    var stageValues = {};
    salesStages.forEach(function(s) {
        stageCounts[s.key] = 0;
        stageValues[s.key] = 0;
    });
    allJobs.forEach(function(j) {
        var status = j.salesStatus || j.status;
        if (stageCounts[status] !== undefined) {
            stageCounts[status]++;
            stageValues[status] += j.amount || 0;
        }
    });

    var totalActive = allJobs.filter(function(j) { return j.salesStatus !== 'Complete' && j.status !== 'Complete'; }).length;
    var totalValue = allJobs.filter(function(j) { return j.salesStatus !== 'Complete' && j.status !== 'Complete'; }).reduce(function(s, j) { return s + (j.amount || 0); }, 0);

    // Build sales pipeline flow
    var html = '<div style="display: flex; gap: 8px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px;">';
    salesStages.forEach(function(stage, i) {
        var count = stageCounts[stage.key];
        var value = stageValues[stage.key];
        html += '<div onclick="filterSalesPipeline(\'' + stage.key + '\')" style="flex: 1; min-width: 130px; padding: 12px 10px; border-radius: 8px; background: ' + stage.bg + '; border: 2px solid ' + (count > 0 ? stage.color + '40' : '#e0e0e0') + '; cursor: pointer; text-align: center; transition: all 0.2s;">';
        html += '<div style="font-size: 24px; font-weight: 700; color: ' + stage.color + ';">' + count + '</div>';
        html += '<div style="font-size: 11px; font-weight: 600; color: ' + stage.color + '; margin-bottom: 2px;">' + stage.label + '</div>';
        html += '<div style="font-size: 11px; color: #6c757d;">$' + (value / 1000).toFixed(1) + 'k</div>';
        if (i < salesStages.length - 1) html += '</div><div style="display: flex; align-items: center; color: #ccc; font-size: 18px;">›</div>';
        else html += '</div>';
    });
    html += '</div>';

    // Summary bar
    html += '<div style="display: flex; gap: 16px; margin-bottom: 20px; align-items: center;">';
    html += '<div style="font-size: 14px; color: #6c757d;"><strong>' + totalActive + '</strong> active deals &nbsp;·&nbsp; <strong>$' + totalValue.toLocaleString() + '</strong> in pipeline</div>';
    html += '<div style="flex: 1;"></div>';
    html += '</div>';

    // Filter jobs
    var filtered = allJobs;
    var searchEl = document.getElementById('salesPipelineSearch');
    var searchTerm = searchEl ? searchEl.value.toLowerCase() : '';
    if (searchTerm) {
        filtered = filtered.filter(function(j) {
            return (j.customer || '').toLowerCase().includes(searchTerm) ||
                   (j.location || '').toLowerCase().includes(searchTerm) ||
                   (j.jobNumber || '').toLowerCase().includes(searchTerm);
        });
    }

    // Table with A/B/C grading
    html += '<div class="card"><div class="card-body" style="padding: 0;">';
    if (filtered.length === 0) {
        html += '<div style="padding: 40px; text-align: center; color: #6c757d;">No deals in pipeline</div>';
    } else {
        html += '<div style="overflow-x: auto;"><table class="data-table" style="margin: 0;">';
        html += '<thead><tr><th style="width: 80px;">Job #</th><th style="width: 50px;">Grade</th><th>Customer</th><th>Location</th><th>Description</th><th style="width: 95px;">Est. Date</th><th style="width: 130px;">Status</th><th style="width: 90px; text-align: right;">Value</th></tr></thead>';
        html += '<tbody>';
        filtered.forEach(function(job) {
            var stageInfo = salesStages.find(function(s) { return s.key === (job.salesStatus || job.status); }) || salesStages[0];
            var gradeColors = { 'A': '#2e7d32', 'B': '#1976d2', 'C': '#f57c00' };
            var gradeColor = gradeColors[job.dealGrade] || '#6c757d';

            html += '<tr>';
            html += '<td><span style="color: #0066cc; font-weight: 600; font-size: 13px;">' + job.jobNumber + '</span></td>';
            html += '<td><span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background: ' + gradeColor + '; color: white; font-weight: 700; font-size: 12px;">' + job.dealGrade + '</span></td>';
            html += '<td style="font-weight: 500;">' + job.customer + '</td>';
            html += '<td style="font-size: 13px; color: #6c757d;">' + job.location + '</td>';
            html += '<td style="font-size: 13px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' + (job.description || '').replace(/"/g, '&quot;') + '">' + job.description + '</td>';
            html += '<td style="font-size: 12px; color: #495057;">' + (job.date ? new Date(job.date).toLocaleDateString('en-US', {month: 'numeric', day: 'numeric'}) : '—') + '</td>';
            html += '<td><span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ' + stageInfo.bg + '; color: ' + stageInfo.color + '; border: 1px solid ' + stageInfo.color + '30;">' + (job.salesStatus || job.status) + '</span></td>';
            html += '<td style="text-align: right; font-weight: 600;">$' + job.amount.toLocaleString() + '</td>';
            html += '</tr>';
        });
        html += '</tbody></table></div>';
    }
    html += '</div></div>';

    container.innerHTML = html;
}

let currentPipelineTerritory = 'all';

function filterPipelineTerritory(territory) {
    currentPipelineTerritory = territory;
    // Update tab active states
    ['pipelineTerritoryAll', 'pipelineTerritoryOriginal', 'pipelineTerritorySouthern', 'pipelineTerritoryNew'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
    const activeId = territory === 'all' ? 'pipelineTerritoryAll' :
                     territory === 'Original' ? 'pipelineTerritoryOriginal' :
                     territory === 'Southern' ? 'pipelineTerritorySouthern' : 'pipelineTerritoryNew';
    const activeEl = document.getElementById(activeId);
    if (activeEl) activeEl.classList.add('active');
    loadSalesPipeline();
}

function filterSalesPipeline(status) {
    // Placeholder for future filtering
}

// ==========================================
// PROJECT TRACKER (v3 - formerly PIPELINE)
// Post-sale: operational execution, scheduling, completion
// ==========================================

// PIPELINE_JOBS and pipelineFilter are defined in js/data.js

function loadPipeline() {
    const container = document.getElementById('pipelineContent');
    if (!container) return;

    // Merge sample pipeline data with any dynamically created jobs
    var allJobs = PIPELINE_JOBS.slice();
    jobs.forEach(function(j) {
        allJobs.push({
            id: j.id,
            jobNumber: j.jobNumber || j.estimateNumber,
            jobType: j.jobType || 'Repair',
            status: j.status,
            customer: j.customerName || j.customerId,
            location: j.locationName || j.customerLocation || '',
            description: j.description || '',
            amount: j.amount || 0,
            territory: 'Original',
            date: j.createdAt ? j.createdAt.split('T')[0] : ''
        });
    });

    // Define pipeline stages with colors
    var stages = [
        { key: 'Estimate Sent', label: 'Estimate Sent', color: '#6c757d', bg: '#f8f9fa' },
        { key: 'Accepted', label: 'Accepted', color: '#0d6efd', bg: '#e7f1ff' },
        { key: 'Parts Ordered', label: 'Parts Ordered', color: '#e65100', bg: '#fff3e0' },
        { key: 'Parts Received', label: 'Parts Received', color: '#2e7d32', bg: '#e8f5e9' },
        { key: 'Scheduled', label: 'Scheduled', color: '#1565c0', bg: '#e3f2fd' },
        { key: 'In Progress', label: 'In Progress', color: '#f57f17', bg: '#fffde7' },
        { key: 'Complete', label: 'Complete', color: '#388e3c', bg: '#e8f5e9' },
        { key: 'Pink', label: 'Pink', color: '#c62828', bg: '#ffe0e6' }
    ];

    // Count jobs per stage
    var stageCounts = {};
    var stageValues = {};
    stages.forEach(function(s) {
        stageCounts[s.key] = 0;
        stageValues[s.key] = 0;
    });
    allJobs.forEach(function(j) {
        if (stageCounts[j.status] !== undefined) {
            stageCounts[j.status]++;
            stageValues[j.status] += j.amount || 0;
        }
    });

    var totalActive = allJobs.filter(function(j) { return j.status !== 'Complete'; }).length;
    var totalValue = allJobs.filter(function(j) { return j.status !== 'Complete'; }).reduce(function(s, j) { return s + (j.amount || 0); }, 0);

    // Build pipeline flow
    var pipelineHtml = '<div style="display: flex; gap: 8px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px;">';
    stages.forEach(function(stage, i) {
        var count = stageCounts[stage.key];
        var value = stageValues[stage.key];
        var isActive = pipelineFilter === stage.key;
        var isAll = pipelineFilter === 'all';
        pipelineHtml += '<div onclick="filterPipeline(\'' + stage.key + '\')" style="flex: 1; min-width: 110px; padding: 12px 10px; border-radius: 8px; background: ' + (isActive ? stage.color : stage.bg) + '; border: 2px solid ' + (isActive ? stage.color : (count > 0 ? stage.color + '40' : '#e0e0e0')) + '; cursor: pointer; text-align: center; transition: all 0.2s; opacity: ' + (isAll || isActive ? '1' : '0.7') + ';">';
        pipelineHtml += '<div style="font-size: 24px; font-weight: 700; color: ' + (isActive ? '#fff' : stage.color) + ';">' + count + '</div>';
        pipelineHtml += '<div style="font-size: 11px; font-weight: 600; color: ' + (isActive ? 'rgba(255,255,255,0.9)' : stage.color) + '; margin-bottom: 2px;">' + stage.label + '</div>';
        pipelineHtml += '<div style="font-size: 11px; color: ' + (isActive ? 'rgba(255,255,255,0.7)' : '#6c757d') + ';">$' + (value / 1000).toFixed(1) + 'k</div>';
        if (i < stages.length - 1) pipelineHtml += '</div><div style="display: flex; align-items: center; color: #ccc; font-size: 18px;">›</div>';
        else pipelineHtml += '</div>';
    });
    pipelineHtml += '</div>';

    // Summary bar
    pipelineHtml += '<div style="display: flex; gap: 16px; margin-bottom: 20px; align-items: center; flex-wrap: wrap;">';
    pipelineHtml += '<div style="font-size: 14px; color: #6c757d;"><strong>' + totalActive + '</strong> active jobs &nbsp;·&nbsp; <strong>$' + totalValue.toLocaleString() + '</strong> in pipeline</div>';
    pipelineHtml += '<div style="flex: 1;"></div>';
    pipelineHtml += '<select onchange="sortPipelineBy(this.value)" id="pipelineSortSelect" class="form-input" style="width: 160px; padding: 6px 10px; font-size: 13px;">';
    pipelineHtml += '<option value="status">Sort by Status</option><option value="oldest">Sort by Oldest</option><option value="newest">Sort by Newest</option></select>';
    pipelineHtml += '<button onclick="filterPipeline(\'all\')" class="btn ' + (pipelineFilter === 'all' ? 'btn-primary' : 'btn-secondary') + '" style="padding: 6px 14px; font-size: 13px;">All</button>';
    pipelineHtml += '<select onchange="filterPipelineTerritory(this.value)" id="pipelineTerritoryFilter" class="form-input" style="width: 160px; padding: 6px 10px; font-size: 13px;">';
    pipelineHtml += '<option value="all">All Territories</option><option value="Original">Original (KY/TN)</option><option value="Southern">Southern (AL/FL)</option></select>';
    pipelineHtml += '</div>';

    // Filter jobs for table
    var filtered = allJobs;
    var pipelineSearchEl = document.getElementById('pipelineSearch');
    var pSearchTerm = pipelineSearchEl ? pipelineSearchEl.value.toLowerCase() : '';
    if (pSearchTerm) {
        filtered = filtered.filter(function(j) {
            return (j.customer || '').toLowerCase().includes(pSearchTerm) ||
                   (j.location || '').toLowerCase().includes(pSearchTerm) ||
                   (j.jobNumber || '').toLowerCase().includes(pSearchTerm) ||
                   (j.description || '').toLowerCase().includes(pSearchTerm);
        });
    }
    if (pipelineFilter !== 'all') {
        filtered = filtered.filter(function(j) { return j.status === pipelineFilter; });
    }
    var territoryFilter = document.getElementById('pipelineTerritoryFilter');
    var tVal = territoryFilter ? territoryFilter.value : 'all';
    if (tVal !== 'all') {
        filtered = filtered.filter(function(j) { return j.territory === tVal; });
    }

    // Sort: check user preference
    var sortBy = (typeof pipelineSortBy !== 'undefined') ? pipelineSortBy : 'status';
    var statusOrder = {};
    stages.forEach(function(s, i) { statusOrder[s.key] = i; });

    filtered.sort(function(a, b) {
        if (sortBy === 'oldest') {
            // Sort by dateReceived, oldest first (or date if no dateReceived)
            var dateA = a.dateReceived || a.date || '';
            var dateB = b.dateReceived || b.date || '';
            return dateA.localeCompare(dateB);
        } else if (sortBy === 'newest') {
            // Sort by dateReceived, newest first
            var dateA = a.dateReceived || a.date || '';
            var dateB = b.dateReceived || b.date || '';
            return dateB.localeCompare(dateA);
        } else {
            // Default: sort by status, then by date desc
            var sa = statusOrder[a.status] || 0;
            var sb = statusOrder[b.status] || 0;
            if (sa !== sb) return sa - sb;
            return (b.date || '').localeCompare(a.date || '');
        }
    });

    // Table
    pipelineHtml += '<div class="card"><div class="card-body" style="padding: 0;">';
    if (filtered.length === 0) {
        pipelineHtml += '<div style="padding: 40px; text-align: center; color: #6c757d;">No jobs match the current filter</div>';
    } else {
        pipelineHtml += '<div style="overflow-x: auto;"><table class="data-table" style="margin: 0;">';
        pipelineHtml += '<thead><tr><th style="width: 80px;">Job #</th><th style="width: 70px;">Type</th><th>Customer</th><th>Location</th><th>Description</th><th style="width: 95px;">PO Received</th><th style="width: 95px;">Target Date</th><th style="width: 120px;">Status</th><th style="width: 90px; text-align: right;">Labor</th><th style="width: 90px; text-align: right;">Total</th></tr></thead>';
        pipelineHtml += '<tbody>';
        filtered.forEach(function(job) {
            var stageInfo = stages.find(function(s) { return s.key === job.status; }) || stages[0];
            var rowBg = job.status === 'Pink' ? '#fff5f5' : '';

            // Format dates
            function formatShortDate(dateStr) {
                if (!dateStr) return '<span style="color: #ccc;">—</span>';
                var d = new Date(dateStr);
                return (d.getMonth() + 1) + '/' + d.getDate();
            }

            pipelineHtml += '<tr style="' + (rowBg ? 'background:' + rowBg + ';' : '') + '">';
            pipelineHtml += '<td><span style="color: #0066cc; font-weight: 600; font-size: 13px;">' + job.jobNumber + '</span></td>';
            pipelineHtml += '<td><span style="font-size: 12px; color: #6c757d;">' + job.jobType + '</span></td>';
            pipelineHtml += '<td style="font-weight: 500;">' + job.customer + '</td>';
            pipelineHtml += '<td style="font-size: 13px; color: #6c757d;">' + job.location + '</td>';
            pipelineHtml += '<td style="font-size: 13px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' + (job.description || '').replace(/"/g, '&quot;') + '">' + job.description + '</td>';
            pipelineHtml += '<td style="font-size: 12px; color: #495057;">' + formatShortDate(job.dateReceived) + '</td>';
            pipelineHtml += '<td style="font-size: 12px; color: #495057;">' + formatShortDate(job.targetDate) + '</td>';
            pipelineHtml += '<td><span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; background: ' + stageInfo.bg + '; color: ' + stageInfo.color + '; border: 1px solid ' + stageInfo.color + '30;">' + job.status + (job.pinkReason ? ' - ' + job.pinkReason : '') + '</span></td>';
            pipelineHtml += '<td style="text-align: right; font-weight: 600; font-size: 13px;">$' + (job.laborAmount || 0).toLocaleString() + '</td>';
            pipelineHtml += '<td style="text-align: right; font-weight: 600;">$' + job.amount.toLocaleString() + '</td>';
            pipelineHtml += '</tr>';
        });
        pipelineHtml += '</tbody></table></div>';
    }
    pipelineHtml += '</div></div>';

    container.innerHTML = pipelineHtml;
}

function filterPipeline(status) {
    pipelineFilter = (pipelineFilter === status) ? 'all' : status;
    loadPipeline();
}

function filterPipelineTerritory(val) {
    loadPipeline();
}

function sortPipelineBy(sortType) {
    pipelineSortBy = sortType;
    loadPipeline();
}

// ==========================================
// ACCOUNTS / CRM
// Customer hierarchy, locations, contacts
// ==========================================

function loadAccounts(filter = '', territory = '', typeFilter = '') {
    const list = document.getElementById('accountsList');
    const countEl = document.getElementById('accountCount');
    const searchTerm = filter.toLowerCase();

    const filteredCustomers = CUSTOMERS.filter(c => {
        // Territory filter
        if (territory && c.territory !== territory) return false;
        // Type filter
        if (typeFilter && c.type !== typeFilter) return false;
        // Search filter
        if (!searchTerm) return true;
        if (c.name.toLowerCase().includes(searchTerm)) return true;
        if (c.locations.some(l => l.name.toLowerCase().includes(searchTerm))) return true;
        return false;
    });

    countEl.textContent = `${filteredCustomers.length} customers`;

    list.innerHTML = filteredCustomers.map(customer => {
        const typeInfo = CUSTOMER_TYPES[customer.type] || CUSTOMER_TYPES.other;
        const typeIcon = typeInfo.icon;
        const typeLabel = typeInfo.label;
        const typeBadgeClass = typeInfo.badge;
        const primaryContact = getPrimaryContact(customer.contacts);

        return `
        <div class="inspection-item" onclick="viewCustomerDetail('${customer.id}')" style="cursor: pointer;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <div style="margin-bottom: 8px;">
                        <span style="font-size: 18px;">${typeIcon}</span>
                        <strong style="margin-left: 8px; font-size: 16px;">${customer.name}</strong>
                        <span class="badge ${typeBadgeClass}" style="margin-left: 8px;">${typeLabel}</span>
                    </div>
                    <p style="font-size: 13px; color: #6c757d;">${customer.billingAddress}</p>
                    <p style="font-size: 12px; color: #6c757d; margin-top: 4px;">${primaryContact.name} • ${primaryContact.phone || customer.phone}</p>
                    <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                        ${customer.locations.map(loc => `
                            <span style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${loc.name}</span>
                        `).join('')}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 24px; font-weight: 700; color: #4CAF50;">${customer.locations.length}</div>
                    <div style="font-size: 11px; color: #6c757d;">Locations</div>
                </div>
            </div>
        </div>
    `}).join('');
}

function filterAccounts() {
    const searchTerm = document.getElementById('accountSearch').value;
    const territory = document.getElementById('accountTerritoryFilter').value;
    const typeFilter = document.getElementById('accountTypeFilter')?.value || '';
    loadAccounts(searchTerm, territory, typeFilter);
}

// Store current customer ID for CRUD operations
let currentCustomerId = null;

function viewCustomerDetail(customerId) {
    const customer = CUSTOMERS.find(c => c.id === customerId);
    if (!customer) return;

    currentCustomerId = customerId;

    // Populate header
    const typeInfo = CUSTOMER_TYPES[customer.type] || CUSTOMER_TYPES.other;
    document.getElementById('custDetailName').textContent = `${typeInfo.icon} ${customer.name}`;
    document.getElementById('custDetailType').textContent = typeInfo.label;
    document.getElementById('custDetailType').className = `badge ${typeInfo.badge}`;

    // Populate info
    const primaryContact = getPrimaryContact(customer.contacts);
    document.getElementById('custDetailAddress').textContent = customer.billingAddress;
    document.getElementById('custDetailContact').textContent = primaryContact.name || 'No contacts';
    document.getElementById('custDetailPhone').textContent = primaryContact.phone || customer.phone;

    // Stats
    const totalContacts = (customer.contacts?.length || 0) +
        customer.locations.reduce((sum, loc) => sum + (loc.contacts?.length || 0), 0);
    document.getElementById('custDetailLocations').textContent = customer.locations.length;
    document.getElementById('custDetailJobs').textContent = Math.floor(Math.random() * 30) + 10;
    document.getElementById('custDetailRevenue').textContent = '$' + (Math.floor(Math.random() * 50000) + 10000).toLocaleString();

    // Populate locations with contacts
    const locList = document.getElementById('custLocationsList');
    locList.innerHTML = customer.locations.map(loc => {
        const locContact = getPrimaryContact(loc.contacts);
        const contactsHtml = (loc.contacts || []).map(c => {
            const roleBadges = (c.roles || []).map(role => {
                const roleInfo = CONTACT_ROLES[role] || { label: role, icon: '👤', color: '#999' };
                return `<span style="background: ${roleInfo.color}20; color: ${roleInfo.color}; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-right: 4px;">${roleInfo.icon} ${roleInfo.label}</span>`;
            }).join('');
            return `
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px; padding: 6px 8px; background: #f8f9fa; border-radius: 6px;">
                    <div style="flex: 1;">
                        <span style="font-weight: 500;">${c.name}</span>
                        ${c.title ? `<span style="color: #6c757d; font-size: 12px;"> - ${c.title}</span>` : ''}
                        <div style="margin-top: 4px;">${roleBadges}</div>
                    </div>
                    <div style="text-align: right; font-size: 12px; color: #6c757d;">
                        ${c.phone ? `<div>${c.phone}</div>` : ''}
                        ${c.email ? `<div>${c.email}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        return `
        <div class="inspection-item" style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <strong style="font-size: 15px;">${loc.name}</strong>
                        <button class="btn btn-outline" style="font-size: 11px; padding: 4px 8px;" onclick="event.stopPropagation(); showAddContactModal('${customer.id}', '${loc.id}')">+ Contact</button>
                    </div>
                    <p style="font-size: 13px; color: #6c757d; margin-top: 4px;">${loc.address}</p>
                    ${contactsHtml || '<p style="font-size: 12px; color: #999; margin-top: 8px;">No contacts at this location</p>'}
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-outline" style="font-size: 12px; padding: 6px 12px;">View Jobs</button>
                </div>
            </div>
        </div>
    `}).join('');

    // Populate contacts tab (district-level contacts)
    const contactsList = document.getElementById('custContactsList');
    if (contactsList) {
        const districtContactsHtml = (customer.contacts || []).map(c => {
            const roleBadges = (c.roles || []).map(role => {
                const roleInfo = CONTACT_ROLES[role] || { label: role, icon: '👤', color: '#999' };
                return `<span style="background: ${roleInfo.color}20; color: ${roleInfo.color}; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 4px;">${roleInfo.icon} ${roleInfo.label}</span>`;
            }).join('');
            return `
                <div class="inspection-item" style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div style="font-weight: 600; font-size: 15px;">${c.name}</div>
                            ${c.title ? `<div style="color: #6c757d; font-size: 13px; margin-top: 2px;">${c.title}</div>` : ''}
                            <div style="margin-top: 8px;">${roleBadges}</div>
                        </div>
                        <div style="text-align: right; font-size: 13px;">
                            ${c.phone ? `<div style="margin-bottom: 4px;"><a href="tel:${c.phone}" style="color: #0066cc;">${c.phone}</a></div>` : ''}
                            ${c.mobile ? `<div style="margin-bottom: 4px; color: #6c757d;">${c.mobile} (mobile)</div>` : ''}
                            ${c.email ? `<div><a href="mailto:${c.email}" style="color: #0066cc;">${c.email}</a></div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        contactsList.innerHTML = districtContactsHtml || '<div class="empty-state"><p>No district-level contacts</p></div>';
    }

    // Populate equipment tab
    const equipmentList = document.getElementById('custEquipmentList');
    if (equipmentList) {
        equipmentList.innerHTML = customer.locations.map(loc => {
            const eq = loc.equipment || {};
            return `
                <div class="inspection-item" style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <strong style="font-size: 15px;">${loc.name}</strong>
                            <p style="font-size: 13px; color: #6c757d; margin-top: 4px;">${loc.address}</p>
                        </div>
                        <button class="btn btn-outline" style="font-size: 11px; padding: 4px 8px;" onclick="editLocationEquipment('${customer.id}', '${loc.id}')">Edit</button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 12px; background: #f8f9fa; padding: 16px; border-radius: 8px;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: #2196F3;">${eq.basketballGoals || 0}</div>
                            <div style="font-size: 11px; color: #6c757d;">Goals</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: #4CAF50;">${eq.safetyStraps || 0}</div>
                            <div style="font-size: 11px; color: #6c757d;">Straps</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: #FF9800;">${eq.edgePads || 0}</div>
                            <div style="font-size: 11px; color: #6c757d;">Edge Pads</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: #9C27B0;">${eq.bleacherBanks || 0}</div>
                            <div style="font-size: 11px; color: #6c757d;">Bleacher Banks</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('') || '<div style="padding: 40px; text-align: center; color: #6c757d;">No locations</div>';
    }

    // Show detail view and default to locations tab
    showView('customerDetail');
    showCustomerTab('locations');
}

function showCustomerTab(tab) {
    // All tab IDs
    const tabs = ['customerLocationsTab', 'customerContactsTab', 'customerHistoryTab', 'customerEquipmentTab'];
    const buttons = ['tabLocations', 'tabContacts', 'tabHistory', 'tabEquipment'];

    // Hide all tabs and reset button styles
    tabs.forEach(t => {
        const el = document.getElementById(t);
        if (el) el.classList.add('hidden');
    });
    buttons.forEach(b => {
        const el = document.getElementById(b);
        if (el) {
            el.style.borderBottom = 'none';
            el.style.background = 'transparent';
            el.style.color = '#6c757d';
        }
    });

    // Show selected tab
    const tabMap = {
        locations: { tab: 'customerLocationsTab', btn: 'tabLocations' },
        contacts: { tab: 'customerContactsTab', btn: 'tabContacts' },
        history: { tab: 'customerHistoryTab', btn: 'tabHistory' },
        equipment: { tab: 'customerEquipmentTab', btn: 'tabEquipment' }
    };

    const selected = tabMap[tab];
    if (selected) {
        const tabEl = document.getElementById(selected.tab);
        const btnEl = document.getElementById(selected.btn);
        if (tabEl) tabEl.classList.remove('hidden');
        if (btnEl) {
            btnEl.style.borderBottom = '3px solid #4CAF50';
            btnEl.style.color = '#212529';
        }
    }
}

// Edit equipment counts for a location
function editLocationEquipment(customerId, locationId) {
    const customer = CUSTOMERS.find(c => c.id === customerId);
    const location = customer?.locations.find(l => l.id === locationId);
    if (!location) return;

    const eq = location.equipment || {};

    const goals = prompt('Basketball Goals:', eq.basketballGoals || 0);
    if (goals === null) return;

    const straps = prompt('Safety Straps:', eq.safetyStraps || 0);
    if (straps === null) return;

    const pads = prompt('Edge Pads:', eq.edgePads || 0);
    if (pads === null) return;

    const banks = prompt('Bleacher Banks:', eq.bleacherBanks || 0);
    if (banks === null) return;

    location.equipment = {
        basketballGoals: parseInt(goals) || 0,
        safetyStraps: parseInt(straps) || 0,
        edgePads: parseInt(pads) || 0,
        bleacherBanks: parseInt(banks) || 0
    };

    // Refresh the view
    viewCustomerDetail(customerId);
    showCustomerTab('equipment');
}

// ==========================================
// CUSTOMER CRUD FUNCTIONS
// ==========================================

function showAddCustomerModal() {
    document.getElementById('customerModalTitle').textContent = 'Add Customer';
    document.getElementById('custName').value = '';
    document.getElementById('custType').value = 'county';
    document.getElementById('custAddress').value = '';
    document.getElementById('custPhone').value = '';
    document.getElementById('custTerritory').value = 'Original';
    document.getElementById('customerModal').classList.remove('hidden');
}

function closeCustomerModal() {
    document.getElementById('customerModal').classList.add('hidden');
}

function saveCustomer() {
    const name = document.getElementById('custName').value.trim();
    const type = document.getElementById('custType').value;
    const address = document.getElementById('custAddress').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const territory = document.getElementById('custTerritory').value;

    if (!name || !address) {
        alert('Please fill in required fields (Name and Address)');
        return;
    }

    // Create new customer
    const newCustomer = {
        id: 'cust' + Date.now(),
        name: name,
        type: type,
        billingAddress: address,
        phone: phone,
        territory: territory,
        contacts: [],
        locations: []
    };

    CUSTOMERS.push(newCustomer);
    closeCustomerModal();
    loadAccounts();

    // Open the new customer detail to add contacts/locations
    viewCustomerDetail(newCustomer.id);
}

// ==========================================
// CONTACT CRUD FUNCTIONS
// ==========================================

function showAddContactModal(customerId, locationId = null) {
    document.getElementById('contactModalTitle').textContent = locationId ? 'Add Location Contact' : 'Add District Contact';
    document.getElementById('contactCustomerId').value = customerId;
    document.getElementById('contactLocationId').value = locationId || '';
    document.getElementById('contactName').value = '';
    document.getElementById('contactTitle').value = '';
    document.getElementById('contactPhone').value = '';
    document.getElementById('contactMobile').value = '';
    document.getElementById('contactEmail').value = '';

    // Reset checkboxes
    document.getElementById('roleScheduling').checked = false;
    document.getElementById('roleContracts').checked = false;
    document.getElementById('roleBilling').checked = false;
    document.getElementById('roleEquipment').checked = false;
    document.getElementById('roleAccess').checked = false;
    document.getElementById('rolePrimary').checked = false;

    document.getElementById('contactModal').classList.remove('hidden');
}

function closeContactModal() {
    document.getElementById('contactModal').classList.add('hidden');
}

function saveContact() {
    const customerId = document.getElementById('contactCustomerId').value;
    const locationId = document.getElementById('contactLocationId').value;
    const name = document.getElementById('contactName').value.trim();
    const title = document.getElementById('contactTitle').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const mobile = document.getElementById('contactMobile').value.trim();
    const email = document.getElementById('contactEmail').value.trim();

    if (!name) {
        alert('Please enter a contact name');
        return;
    }

    // Gather selected roles
    const roles = [];
    if (document.getElementById('roleScheduling').checked) roles.push('scheduling');
    if (document.getElementById('roleContracts').checked) roles.push('contracts');
    if (document.getElementById('roleBilling').checked) roles.push('billing');
    if (document.getElementById('roleEquipment').checked) roles.push('equipment');
    if (document.getElementById('roleAccess').checked) roles.push('access');
    if (document.getElementById('rolePrimary').checked) roles.push('primary');

    const newContact = {
        id: 'con' + Date.now(),
        name: name,
        title: title,
        phone: phone,
        mobile: mobile,
        email: email,
        roles: roles
    };

    // Find customer
    const customer = CUSTOMERS.find(c => c.id === customerId);
    if (!customer) {
        alert('Customer not found');
        return;
    }

    if (locationId) {
        // Add to location
        const location = customer.locations.find(l => l.id === locationId);
        if (location) {
            if (!location.contacts) location.contacts = [];
            location.contacts.push(newContact);
        }
    } else {
        // Add to customer (district level)
        if (!customer.contacts) customer.contacts = [];
        customer.contacts.push(newContact);
    }

    closeContactModal();
    viewCustomerDetail(customerId); // Refresh the view
}

// ==========================================
// LOCATION CRUD FUNCTIONS
// ==========================================

function showAddLocationModal() {
    if (!currentCustomerId) {
        alert('No customer selected');
        return;
    }
    document.getElementById('locationModalTitle').textContent = 'Add Location';
    document.getElementById('locationCustomerId').value = currentCustomerId;
    document.getElementById('locationName').value = '';
    document.getElementById('locationAddress').value = '';
    document.getElementById('locationModal').classList.remove('hidden');
}

function closeLocationModal() {
    document.getElementById('locationModal').classList.add('hidden');
}

function saveLocation() {
    const customerId = document.getElementById('locationCustomerId').value;
    const name = document.getElementById('locationName').value.trim();
    const address = document.getElementById('locationAddress').value.trim();

    if (!name || !address) {
        alert('Please fill in required fields (Name and Address)');
        return;
    }

    const customer = CUSTOMERS.find(c => c.id === customerId);
    if (!customer) {
        alert('Customer not found');
        return;
    }

    const newLocation = {
        id: 'loc' + Date.now(),
        name: name,
        address: address,
        contacts: []
    };

    customer.locations.push(newLocation);
    closeLocationModal();
    viewCustomerDetail(customerId); // Refresh
}

// Tech Functions
function loadTechDashboard() {
    updateDashboardStats();
}

function loadTechInspections() {
    const list = document.getElementById('techInspectionsList');

    if (inspections.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No inspections yet</p><p style="font-size: 14px; margin-top: 8px;">Click "New Inspection" to get started</p></div>';
    } else {
        list.innerHTML = inspections.map(insp => {
            const typeIcon = insp.inspectionType === 'basketball' ? '🏀' :
                             insp.inspectionType === 'bleacher' ? '🏟️' :
                             insp.inspectionType === 'outdoor' ? '🪑' : '📋';
            const typeLabel = insp.inspectionType === 'basketball' ? 'Basketball' :
                              insp.inspectionType === 'bleacher' ? 'Indoor Bleacher' :
                              insp.inspectionType === 'outdoor' ? 'Outdoor Bleacher' : 'PSF';
            return `
            <div class="inspection-item">
                <div class="flex-between">
                    <div>
                        <div style="margin-bottom: 4px;">
                            <span class="badge badge-info">${typeIcon} ${typeLabel}</span>
                        </div>
                        <strong>${insp.customerName}</strong>
                        <p style="font-size: 13px; color: #6c757d; margin-top: 4px;">${insp.location || 'No location'}</p>
                        <p style="font-size: 12px; color: #6c757d; margin-top: 4px;">
                            ${new Date(insp.createdAt).toLocaleDateString()} • ${insp.selectedParts?.length || 0} parts
                        </p>
                    </div>
                    <span class="badge badge-success">submitted</span>
                </div>
            </div>
        `}).join('');
    }
}

// Ops Review state
let currentOpsFilter = 'all';

