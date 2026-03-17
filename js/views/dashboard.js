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
// ESTIMATES
// View, filter, and manage estimates
// ==========================================

async function loadEstimates() {
    var acceptedList = document.getElementById('acceptedEstimatesList');
    var pendingList = document.getElementById('pendingEstimatesList');
    var defaultView = document.getElementById('estimatesDefaultView');
    var searchResults = document.getElementById('estimatesSearchResults');
    var createTab = document.getElementById('estimatesCreateTab');

    // Show default view, hide others
    defaultView.classList.remove('hidden');
    searchResults.classList.add('hidden');
    createTab.classList.add('hidden');

    // Reset to accepted tab
    switchEstimateTab('accepted');

    var loadingHtml = '<div style="padding: 30px; text-align: center; color: #6c757d;">Loading from QuickBooks...</div>';
    acceptedList.innerHTML = loadingHtml;
    pendingList.innerHTML = loadingHtml;

    try {
        // Fetch accepted and pending from QB
        var data = await EstimatesAPI.list({ limit: 500 });
        var estimates = data.estimates || [];
        window._qbEstimates = estimates;

        var accepted = estimates.filter(function(e) { return e.status === 'Accepted'; });
        var pending = estimates.filter(function(e) { return e.status === 'Pending'; });

        document.getElementById('estAcceptedCount').textContent = accepted.length;
        document.getElementById('estPendingCount').textContent = pending.length;

        // Render accepted
        renderEstimatesList(acceptedList, accepted, '', 'No accepted estimates needing jobs');

        // Render pending
        renderEstimatesList(pendingList, pending, '', 'No pending estimates');
    } catch (err) {
        console.error('Failed to load estimates:', err);
        window._qbEstimates = [];
        acceptedList.innerHTML = '<div style="padding: 30px; text-align: center; color: #dc3545;">Failed to load estimates: ' + err.message + '</div>';
        pendingList.innerHTML = '';
    }
}

function renderEstimatesList(listEl, estimates, searchTerm, emptyMessage) {
    if (estimates.length === 0) {
        listEl.innerHTML = '<div style="padding: 30px; text-align: center; color: #6c757d;">' +
            (searchTerm ? 'No estimates match "' + searchTerm + '"' : (emptyMessage || 'No estimates found')) +
            '</div>';
        return;
    }

    listEl.innerHTML = estimates.map(function(est) {
        var statusStyle = EstimatesAPI.statusColors[est.status] || { bg: '#e0e0e0', color: '#616161' };
        return '<div class="inspection-item" onclick="viewQbEstimate(\'' + est.id + '\')" style="padding: 16px; border-bottom: 1px solid #e9ecef; cursor: pointer;">' +
            '<div style="display: flex; justify-content: space-between; align-items: flex-start;">' +
                '<div style="flex: 1; min-width: 0;">' +
                    '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">' +
                        '<span style="font-weight: 600; color: #007bff;">' + (est.docNumber || '') + '</span>' +
                        '<span class="badge" style="background: ' + statusStyle.bg + '; color: ' + statusStyle.color + ';">' + (est.status || '') + '</span>' +
                    '</div>' +
                    '<strong style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + (est.customerName || '') + '</strong>' +
                    '<p style="font-size: 13px; color: #6c757d; margin-top: 4px;">' +
                        (est.lineItems ? est.lineItems.length : 0) + ' line items' +
                        (est.txnDate ? ' &bull; ' + new Date(est.txnDate).toLocaleDateString() : '') +
                    '</p>' +
                '</div>' +
                '<div style="text-align: right; flex-shrink: 0; margin-left: 16px;">' +
                    '<span style="font-weight: 600; color: #28a745; font-size: 16px;">$' + Number(est.totalAmount || 0).toLocaleString() + '</span>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}

var _estimatesSearchTimeout = null;

function searchEstimates() {
    var query = document.getElementById('estimatesSearchInput').value.trim().toLowerCase();
    var defaultView = document.getElementById('estimatesDefaultView');
    var searchResults = document.getElementById('estimatesSearchResults');
    var searchList = document.getElementById('estimatesSearchList');

    if (!query || query.length < 2) {
        // Show default sections
        defaultView.classList.remove('hidden');
        searchResults.classList.add('hidden');
        return;
    }

    // Hide default, show search results
    defaultView.classList.add('hidden');
    searchResults.classList.remove('hidden');
    searchList.innerHTML = '<div style="padding: 30px; text-align: center; color: #6c757d;">Searching...</div>';

    clearTimeout(_estimatesSearchTimeout);
    _estimatesSearchTimeout = setTimeout(async function() {
        // Search cached QB estimates first
        var estimates = (window._qbEstimates || []).filter(function(e) {
            return (e.docNumber || '').toLowerCase().includes(query) ||
                (e.customerName || '').toLowerCase().includes(query) ||
                (e.email || '').toLowerCase().includes(query);
        });

        // If nothing in cache, try local Postgres
        if (estimates.length === 0) {
            try {
                var localData = await EstimatesAPI.listLocal({ q: query, limit: 50 });
                var localEstimates = localData.estimates || [];
                if (localEstimates.length > 0) {
                    var existingIds = new Set((window._qbEstimates || []).map(function(e) { return e.qbEstimateId || e.id; }));
                    for (var i = 0; i < localEstimates.length; i++) {
                        var le = localEstimates[i];
                        if (!existingIds.has(le.qbEstimateId)) {
                            var merged = Object.assign({}, le, { id: le.qbEstimateId });
                            window._qbEstimates.push(merged);
                        }
                    }
                    estimates = localEstimates.map(function(le) { return Object.assign({}, le, { id: le.qbEstimateId }); });
                }
            } catch (err) {
                console.error('Local estimate search failed:', err);
            }
        }

        renderEstimatesList(searchList, estimates, query, '');
    }, 300);
}

function showEstimateBuilder() {
    document.getElementById('estimatesDefaultView').classList.add('hidden');
    document.getElementById('estimatesSearchResults').classList.add('hidden');
    document.getElementById('estimatesTopControls').classList.add('hidden');
    document.getElementById('estimatesCreateTab').classList.remove('hidden');
    if (typeof initEstimateBuilder === 'function') {
        initEstimateBuilder();
    }
}

function hideEstimateBuilder() {
    document.getElementById('estimatesCreateTab').classList.add('hidden');
    document.getElementById('estimatesDefaultView').classList.remove('hidden');
    document.getElementById('estimatesTopControls').classList.remove('hidden');
    document.getElementById('estimatesSearchInput').value = '';
}

function switchEstimateTab(tab) {
    var acceptedTab = document.getElementById('estTabAccepted');
    var pendingTab = document.getElementById('estTabPending');
    var acceptedPanel = document.getElementById('estPanelAccepted');
    var pendingPanel = document.getElementById('estPanelPending');

    if (tab === 'accepted') {
        acceptedTab.classList.add('active');
        pendingTab.classList.remove('active');
        acceptedPanel.classList.remove('hidden');
        pendingPanel.classList.add('hidden');
    } else {
        pendingTab.classList.add('active');
        acceptedTab.classList.remove('active');
        pendingPanel.classList.remove('hidden');
        acceptedPanel.classList.add('hidden');
    }
}

window.showEstimateBuilder = showEstimateBuilder;
window.hideEstimateBuilder = hideEstimateBuilder;
window.loadEstimates = loadEstimates;
window.searchEstimates = searchEstimates;
window.switchEstimateTab = switchEstimateTab;

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

    if (confirm(`Generate QuickBooks estimate for ${customerDisplay}?\n\nLocation: ${locationDisplay}\nJob: ${jobNumber}\nTotal: $${total.toFixed(2)}\n\nThis will:\n• Create estimate ${jobNumber} in QuickBooks\n• Add job to Pipeline\n• Send to Operations Review queue`)) {
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

        alert(`✅ SUCCESS!\n\nQuickBooks Estimate Created:\n• Job: ${jobNumber}\n• Customer: ${customerDisplay}\n• Location: ${locationDisplay}\n• Total: $${total.toFixed(2)}\n\nJob added to Pipeline!\n\n⏱️ Time saved: 30+ minutes of manual entry`);

        showView('projects');
    }
}

// ARCHIVED: loadEstimatesAccepted() and initEstimateCreate() removed.
// Replaced by section-based layout in loadEstimates() and showEstimateBuilder().
// Archived March 2026.

// View QB Estimate detail
async function viewQbEstimate(estimateId) {
    // Find estimate in cache
    const est = (window._qbEstimates || []).find(e => e.id === estimateId);
    if (!est) {
        showNotification('Estimate not found in cache', 'warning');
        return;
    }

    const statusStyle = EstimatesAPI.statusColors[est.status] || { bg: '#e0e0e0', color: '#616161' };

    // Fetch related jobs for this estimate (jobs store doc number as qbEstimateId)
    let relatedJobs = [];
    try {
        const jobsData = await JobsAPI.list({ limit: 500 });
        relatedJobs = (jobsData.jobs || []).filter(j => j.qbEstimateId === est.docNumber || j.qbEstimateId === estimateId);
    } catch (err) {
        console.error('Failed to load related jobs:', err);
    }

    const relatedJobsHtml = relatedJobs.length > 0 ? `
        <div class="card" style="margin-top: 24px;">
            <div class="card-header">
                <h2 class="card-title">Related Work Orders</h2>
                <span class="badge badge-info">${relatedJobs.length} job${relatedJobs.length !== 1 ? 's' : ''}</span>
            </div>
            <div class="card-body" style="padding: 0;">
                ${relatedJobs.map(job => `
                    <div class="inspection-item" style="cursor: pointer; border-bottom: 1px solid #e9ecef; padding: 16px;"
                         onclick="viewWorkOrderDetail(${job.id}, 'estimateDetail')">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #007bff;">${job.jobNumber}</strong>
                                <span class="badge" style="margin-left: 8px; background: ${job.status === 'completed' ? '#c8e6c9' : job.status === 'draft' ? '#fff3e0' : '#e3f2fd'}; color: ${job.status === 'completed' ? '#2e7d32' : job.status === 'draft' ? '#e65100' : '#1565c0'};">${job.status}</span>
                                <p style="font-size: 13px; color: #6c757d; margin-top: 4px;">${job.title || job.customerName || ''}</p>
                            </div>
                            <div style="text-align: right; font-size: 13px; color: #6c757d;">
                                ${job.assignedTo ? '<div>' + job.assignedTo + '</div>' : ''}
                                ${job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'Unscheduled'}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>` : '';

    const woButtonLabel = relatedJobs.length > 0 ? 'Create Additional Work Order' : 'Create Work Order';

    document.getElementById('estimateDetailContent').innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <h2 class="card-title" style="margin: 0;">Estimate ${est.docNumber}</h2>
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
                <p style="font-weight: 600; color: #2e7d32; margin-bottom: 12px;">This estimate has been accepted</p>
                <button class="btn btn-primary" onclick="createWorkOrderFromEstimate(event, '${est.id}')">${woButtonLabel}</button>
            </div>
        ` : ''}

        ${relatedJobsHtml}
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
        showNotification('Estimate not found in cache', 'warning');
        return;
    }

    if (est.status !== 'Accepted') {
        alert('Only accepted estimates can be converted to work orders.');
        return;
    }

    // Check if work order already exists for this estimate
    try {
        const existing = await JobsAPI.list({ limit: 100 });
        const existingJobs = (existing.jobs || []).filter(j => j.qbEstimateId === estimateId);
        if (existingJobs.length > 0) {
            const proceed = confirm(
                `Work orders already exist for this estimate: ${existingJobs.map(j => j.jobNumber).join(', ')}\n\n` +
                'Do you want to create an additional work order? (e.g., for multi-phase work)'
            );
            if (!proceed) return;
        }
    } catch (err) {
        console.error('Error checking existing work orders:', err);
    }

    // Job number auto-generated by API (sequential starting at 20000)

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

    // Create the work order (job number auto-assigned by API)
    const jobData = {
        jobType: 'repair',
        status: 'draft',
        customerId: est.customerId,
        customerName: est.customerName,
        contactEmail: est.email,
        title: `Work Order from Estimate ${est.docNumber}`,
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

        // Upsert estimate to local table for relationship tracking
        try {
            await EstimatesAPI.upsertLocal({
                qbEstimateId: estimateId,
                docNumber: est.docNumber,
                txnDate: est.txnDate,
                status: est.status,
                customerId: est.customerId,
                customerName: est.customerName,
                totalAmount: est.totalAmount,
                email: est.email,
                lineItems: est.lineItems,
                privateNote: est.privateNote,
                customerMemo: est.customerMemo
            });
        } catch (syncErr) {
            console.warn('Failed to sync estimate locally:', syncErr);
            // Non-blocking: the work order was created successfully
        }

        // Navigate to the new work order detail view
        viewWorkOrderDetail(result.job.id, 'estimateDetail');
    } catch (err) {
        console.error('Error creating work order:', err);
        alert('Failed to create work order: ' + err.message);
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

// Navigate to estimate from a job's qbEstimateId
async function navigateToEstimate(qbEstimateId) {
    const findEst = () => (window._qbEstimates || []).find(e => e.id === qbEstimateId || e.docNumber === qbEstimateId);
    let est = findEst();
    if (est) {
        viewQbEstimate(est.id);
        return;
    }

    // Not in QB cache — try reloading QB, then fall back to local Postgres
    try {
        await loadEstimates();
        est = findEst();
        if (est) {
            viewQbEstimate(est.id);
            return;
        }

        // Search local estimates table (covers older estimates beyond QB's 500 limit)
        const localData = await EstimatesAPI.listLocal({ q: qbEstimateId, limit: 10 });
        const localEst = (localData.estimates || []).find(e =>
            e.qbEstimateId === qbEstimateId || e.docNumber === qbEstimateId
        );
        if (localEst) {
            // Merge into cache so viewQbEstimate can find it
            const merged = { ...localEst, id: localEst.qbEstimateId };
            window._qbEstimates = window._qbEstimates || [];
            window._qbEstimates.push(merged);
            viewQbEstimate(merged.id);
            return;
        }

        showNotification('Estimate not found — it may not be synced yet. Try syncing estimates first.', 'warning');
    } catch (err) {
        showNotification('Failed to load estimate: ' + err.message, 'error');
    }
}

// Create a follow-up estimate spawned from a job
function createEstimateFromCRM() {
    var customer = browseCustomersCache.find(function(c) { return c.id == currentCustomerId; });
    if (!customer) return;

    // Init builder state
    if (typeof initEstimateBuilder === 'function') {
        initEstimateBuilder();
    }
    estimateBuilderState.context = 'crm';

    // Build customer object for builder state
    // Extract real state code from address string (e.g. "Nashville, TN 37201" → "TN")
    var stateCode = '';
    if (customer.address) {
        var stateMatch = customer.address.match(/\b([A-Z]{2})\b(?:\s*\d{5})?/);
        if (stateMatch) stateCode = stateMatch[1];
    }
    var custObj = {
        id: customer.qbCustomerId || customer._qbId || customer.id,
        name: customer.name,
        email: null,
        address: stateCode ? { state: stateCode } : null
    };
    // Set customer directly on state (don't call selectQbCustomer — it targets Estimates tab DOM)
    estimateBuilderState.qbCustomer = custObj;

    // Render builder into modal body
    var modalBody = document.getElementById('crmEstimateModalBody');
    modalBody.innerHTML =
        '<div style="padding: 12px; background: #e8f5e9; border-radius: 8px; margin-bottom: 20px;">' +
            '<div style="font-weight: 600; color: #2e7d32;">' + escapeHtml(customer.name) + '</div>' +
            '<div style="font-size: 12px; color: #6c757d;">' + escapeHtml(customer.address || '') + '</div>' +
        '</div>' +
        '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">' +
            '<span style="font-size: 13px; color: #6c757d;">Estimate #</span>' +
            '<input type="text" id="estimateDocNumber" class="form-input" ' +
                'value="" placeholder="Loading..." ' +
                'oninput="onDocNumberChange(this)" ' +
                'style="width: 200px; font-weight: 600; font-size: 15px; padding: 4px 10px; border: 1px dashed #ced4da; border-radius: 6px; background: transparent;">' +
        '</div>' +
        '<div style="margin-bottom: 20px;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
                '<h3 style="margin: 0;">Line Items</h3>' +
                '<div style="display: flex; gap: 6px; flex-wrap: wrap;">' +
                    '<button class="btn btn-outline" style="font-size: 12px; padding: 4px 10px;" onclick="openAddPartModal()">+ Part</button>' +
                    '<button class="btn btn-outline" style="font-size: 12px; padding: 4px 10px;" onclick="openAddLaborModal()">+ Labor</button>' +
                    '<button class="btn btn-outline" style="font-size: 12px; padding: 4px 10px;" onclick="openAddInspectionModal()">+ Inspection</button>' +
                    '<button class="btn btn-outline" style="font-size: 12px; padding: 4px 10px;" onclick="openAddCustomModal()">+ Custom</button>' +
                '</div>' +
            '</div>' +
            '<div id="estimateLineItemsContainer"></div>' +
        '</div>' +
        '<div style="margin-bottom: 20px;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; position: relative;">' +
                '<h3 style="margin: 0;">Procurement Notes</h3>' +
                '<button class="btn btn-outline" style="font-size: 12px; padding: 4px 10px;" onclick="toggleProcurementDropdown()">+ Add Note</button>' +
                '<div id="procurementNoteDropdown" class="hidden" style="position: absolute; right: 0; top: 100%; margin-top: 4px; background: white; border: 1px solid #dee2e6; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 320px; z-index: 100; max-height: 300px; overflow-y: auto;">' +
                    (typeof COMMON_PROCUREMENT_NOTES !== 'undefined' ? COMMON_PROCUREMENT_NOTES.map(function(note) {
                        return '<div style="padding: 10px 14px; cursor: pointer; border-bottom: 1px solid #f5f5f5; font-size: 13px;" onmouseover="this.style.background=\'#f8f9fa\'" onmouseout="this.style.background=\'white\'" onclick="addProcurementNote(\'' + note.text.replace(/'/g, "\\'") + '\', \'' + note.category + '\'); toggleProcurementDropdown();">' + note.text + '</div>';
                    }).join('') : '') +
                    '<div style="padding: 10px 14px; border-top: 2px solid #dee2e6;">' +
                        '<input type="text" class="form-input" placeholder="Custom note..." style="width: 100%; font-size: 13px;" onkeydown="if(event.key===\'Enter\'){addCustomProcurementNote(this.value);this.value=\'\';toggleProcurementDropdown();}">' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div id="procurementNotesContainer"></div>' +
        '</div>' +
        '<div id="estimateTotalsContainer" style="margin-bottom: 20px;"></div>' +
        '<div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid #dee2e6;">' +
            '<button class="btn btn-secondary" onclick="closeCRMEstimateModal()">Cancel</button>' +
            '<button class="btn btn-primary" id="submitEstimateBtn" onclick="submitCRMEstimate()" disabled>Create in QuickBooks</button>' +
        '</div>';

    // Show the modal
    document.getElementById('crmEstimateModal').classList.remove('hidden');

    // Render dynamic content
    renderLineItems();
    renderProcurementNotes();
    renderTotals();
    updateSubmitButton();

    // Fetch preview doc number (async — will fill in when ready)
    fetchPreviewDocNumber(custObj);
}

async function submitCRMEstimate() {
    await submitEstimateToQb();
    if (!estimateBuilderState.isSubmitting) {
        closeCRMEstimateModal();
        viewCustomerDetail(currentCustomerId);
    }
}

function closeCRMEstimateModal() {
    document.getElementById('crmEstimateModal').classList.add('hidden');
    document.getElementById('crmEstimateModalBody').innerHTML = '';
    estimateBuilderState.lineItems = [];
    estimateBuilderState.qbCustomer = null;
    estimateBuilderState.shippingCost = 0;
    estimateBuilderState.procurementNotes = [];
    estimateBuilderState.stockParts = [];
    estimateBuilderState.docNumber = '';
    estimateBuilderState.context = 'tab';
}

window.createEstimateFromCRM = createEstimateFromCRM;
window.closeCRMEstimateModal = closeCRMEstimateModal;
window.submitCRMEstimate = submitCRMEstimate;

async function createEstimateFromJob(jobId) {
    try {
        const jobData = await JobsAPI.get(jobId);
        const job = jobData.job;

        // Store spawn context for the estimate builder
        window._spawnFromJobId = jobId;
        window._spawnFromJobNumber = job.jobNumber;
        window._spawnCustomerId = job.customerId;
        window._spawnCustomerName = job.customerName;

        // Navigate to estimates and open builder
        showView('estimates');
        showEstimateBuilder();
    } catch (err) {
        console.error('Failed to load job for estimate:', err);
        alert('Failed to load job: ' + err.message);
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
        html += '<thead><tr><th style="width: 80px;">Job</th><th style="width: 50px;">Grade</th><th>Customer</th><th>Location</th><th>Description</th><th style="width: 95px;">Est. Date</th><th style="width: 130px;">Status</th><th style="width: 90px; text-align: right;">Value</th></tr></thead>';
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
        pipelineHtml += '<thead><tr><th style="width: 80px;">Job</th><th style="width: 70px;">Type</th><th>Customer</th><th>Location</th><th>Description</th><th style="width: 95px;">PO Received</th><th style="width: 95px;">Target Date</th><th style="width: 120px;">Status</th><th style="width: 90px; text-align: right;">Labor</th><th style="width: 90px; text-align: right;">Total</th></tr></thead>';
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

// ARCHIVED: loadAccounts() and filterAccounts() removed — customers now accessed via QB-first Search & Browse.
// See browse.js for QB search, import, and new customer creation.
// Archived March 2026.

// Store current customer ID for CRUD operations
let currentCustomerId = null;

// ==========================================
// CUSTOMERS CRM VIEW
// ==========================================

// CRM state
let _crmSearchResults = [];
let _crmFilter = 'all';
let _crmSearchTimer = null;

function loadCustomersCRM() {
    const container = document.getElementById('customersListCRM');
    if (container) container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">Search for a customer above</div>';

    // Show dashboard, hide search results
    var dashboard = document.getElementById('crmDashboard');
    var searchResults = document.getElementById('crmSearchResults');
    if (dashboard) dashboard.classList.remove('hidden');
    if (searchResults) searchResults.classList.add('hidden');

    // Load dashboard stats
    loadCRMDashboard();
}

async function loadCRMDashboard() {
    try {
        var headers = await getApiHeaders();
        var resp = await fetch('https://bleachers-api.vercel.app/api/customers/dashboard', { headers: headers });
        if (!resp.ok) throw new Error('Failed to load dashboard');
        var data = await resp.json();

        // At-a-Glance Stats
        var el;
        el = document.getElementById('statCustomers');
        if (el) el.textContent = (data.stats.customers.total || 0).toLocaleString();
        el = document.getElementById('statLocations');
        if (el) el.textContent = (data.stats.locations || 0).toLocaleString();
        el = document.getElementById('statJobs');
        if (el) el.textContent = (data.stats.jobs.total || 0).toLocaleString();
        el = document.getElementById('statActivity30d');
        if (el) el.textContent = (data.stats.activity30d.total || 0).toLocaleString();

        // Needs Attention
        renderNeedsAttention(data.needsAttention);

        // Recent Activity
        renderCRMRecentActivity(data.recentActivity);

        // Active Customers
        renderActiveCustomers(data.recentCustomers);
    } catch (err) {
        console.error('Dashboard load failed:', err);
        var statsRow = document.getElementById('crmStatsRow');
        if (statsRow) {
            // Leave the -- placeholders, don't break the page
        }
    }
}

function renderNeedsAttention(needsAttention) {
    var container = document.getElementById('crmNeedsAttention');
    var countBadge = document.getElementById('attentionCount');
    if (!container) return;

    var items = needsAttention.followUpsDue || [];

    if (countBadge) countBadge.textContent = items.length;

    if (items.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #adb5bd; padding: 20px; font-size: 13px;">All caught up</div>';
        return;
    }

    var html = '';
    items.forEach(function(item) {
        var age = timeSince(item.createdAt);
        html += '<div style="padding: 8px 0; border-bottom: 1px solid #f1f3f5; cursor: pointer;" onclick="dashboardOpenCustomer(' + item.customerId + ', \'' + escapeHtml(item.customerName || '').replace(/'/g, "\\'") + '\')">';
        html += '<div style="font-size: 13px; font-weight: 500; color: #212529;">' + escapeHtml(item.title || 'Follow-up') + '</div>';
        html += '<div style="font-size: 12px; color: #6c757d; margin-top: 2px;">';
        if (item.customerName) html += escapeHtml(item.customerName) + ' &middot; ';
        html += age;
        html += '</div>';
        if (item.body) {
            html += '<div style="font-size: 12px; color: #868e96; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + escapeHtml(item.body) + '</div>';
        }
        html += '</div>';
    });
    container.innerHTML = html;
}

function renderCRMRecentActivity(activities) {
    var container = document.getElementById('crmRecentActivity');
    if (!container) return;

    if (!activities || activities.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #adb5bd; padding: 20px; font-size: 13px;">No recent activity</div>';
        return;
    }

    var typeIcons = {
        call: '📞', note: '📝', follow_up: '🔔', email: '📧',
        estimate_created: '💰', status_change: '🔄', job_created: '🛠️'
    };

    var html = '';
    activities.forEach(function(a) {
        var icon = typeIcons[a.activityType] || '📋';
        var age = timeSince(a.createdAt);
        html += '<div style="padding: 8px 0; border-bottom: 1px solid #f1f3f5; display: flex; gap: 8px; align-items: flex-start;' + (a.customerId ? ' cursor: pointer;' : '') + '"' + (a.customerId ? ' onclick="dashboardOpenCustomer(' + a.customerId + ', \'' + escapeHtml(a.customerName || '').replace(/'/g, "\\'") + '\')"' : '') + '>';
        html += '<span style="font-size: 14px; flex-shrink: 0; margin-top: 1px;">' + icon + '</span>';
        html += '<div style="flex: 1; min-width: 0;">';
        html += '<div style="font-size: 13px; color: #212529; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + escapeHtml(a.title || a.activityType) + '</div>';
        html += '<div style="font-size: 12px; color: #6c757d; margin-top: 1px;">';
        if (a.customerName) html += escapeHtml(a.customerName) + ' &middot; ';
        if (a.userName) html += escapeHtml(a.userName) + ' &middot; ';
        html += age;
        html += '</div>';
        html += '</div></div>';
    });
    container.innerHTML = html;
}

function dashboardOpenCustomer(id, name, territory) {
    // Ensure customer is in browseCustomersCache so viewCustomerDetail can find it
    if (typeof browseCustomersCache !== 'undefined') {
        var exists = browseCustomersCache.find(function(c) { return c.id == id; });
        if (!exists) {
            browseCustomersCache.push({ id: id, name: name, territory: territory, locations: [], contacts: [] });
        }
    }
    var backBtn = document.getElementById('custDetailBackBtn');
    if (backBtn) backBtn.setAttribute('onclick', "showView('customers')");
    viewCustomerDetail(id);
}

function renderActiveCustomers(customers) {
    var container = document.getElementById('crmActiveCustomers');
    if (!container) return;

    if (!customers || customers.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #adb5bd; padding: 20px; font-size: 13px;">No customer activity in the last 30 days</div>';
        return;
    }

    var html = '<table style="width: 100%; font-size: 13px;">';
    html += '<thead><tr style="background: #f8f9fa;">';
    html += '<th style="padding: 8px 16px; text-align: left; font-weight: 600; color: #495057;">Customer</th>';
    html += '<th style="padding: 8px 12px; text-align: left; font-weight: 600; color: #495057;">Territory</th>';
    html += '<th style="padding: 8px 12px; text-align: center; font-weight: 600; color: #495057;">Activities</th>';
    html += '<th style="padding: 8px 16px; text-align: right; font-weight: 600; color: #495057;">Last Active</th>';
    html += '</tr></thead><tbody>';

    customers.forEach(function(c) {
        var territoryColor = c.territory === 'Original' ? '#1565c0' : '#e65100';
        var territoryBg = c.territory === 'Original' ? '#e3f2fd' : '#fff3e0';
        html += '<tr style="border-bottom: 1px solid #f1f3f5; cursor: pointer;" onclick="dashboardOpenCustomer(' + c.id + ', \'' + escapeHtml(c.name || '').replace(/'/g, "\\'") + '\', \'' + (c.territory || '') + '\')">';
        html += '<td style="padding: 10px 16px; font-weight: 500;">' + escapeHtml(c.name) + '</td>';
        html += '<td style="padding: 10px 12px;"><span style="background: ' + territoryBg + '; color: ' + territoryColor + '; font-size: 11px; padding: 2px 8px; border-radius: 4px;">' + (c.territory || '—') + '</span></td>';
        html += '<td style="padding: 10px 12px; text-align: center;">' + c.activityCount + '</td>';
        html += '<td style="padding: 10px 16px; text-align: right; color: #6c757d;">' + timeSince(c.lastActivity) + '</td>';
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function timeSince(dateStr) {
    if (!dateStr) return '';
    var now = new Date();
    var date = new Date(dateStr);
    var seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'just now';
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ago';
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    var days = Math.floor(hours / 24);
    if (days < 7) return days + 'd ago';
    if (days < 30) return Math.floor(days / 7) + 'w ago';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function searchCustomersCRM(query) {
    clearTimeout(_crmSearchTimer);
    var dashboard = document.getElementById('crmDashboard');
    var searchResults = document.getElementById('crmSearchResults');

    if (!query || query.length < 2) {
        _crmSearchResults = [];
        renderCustomersCRM();
        // Show dashboard when search is cleared
        if (dashboard) dashboard.classList.remove('hidden');
        if (searchResults) searchResults.classList.add('hidden');
        return;
    }

    // Hide dashboard, show search results when typing
    if (dashboard) dashboard.classList.add('hidden');
    if (searchResults) searchResults.classList.remove('hidden');
    _crmSearchTimer = setTimeout(async function() {
        try {
            const data = await CustomersAPI.list({ q: query, limit: 100 });
            _crmSearchResults = data.customers || [];
            // Cache for profile navigation
            if (typeof browseCustomersCache !== 'undefined') {
                _crmSearchResults.forEach(c => {
                    if (!browseCustomersCache.find(bc => bc.id == c.id)) {
                        browseCustomersCache.push(c);
                    }
                });
            }
            renderCustomersCRM();
        } catch (err) {
            console.error('CRM search failed:', err);
        }
    }, 300);
}

function filterCustomersCRM(territory) {
    _crmFilter = territory;
    // Update tab active states
    ['crmTabAll', 'crmTabOriginal', 'crmTabSouthern', 'crmTabHouse'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
    var activeId = territory === 'all' ? 'crmTabAll' : 'crmTab' + territory;
    var activeEl = document.getElementById(activeId);
    if (activeEl) activeEl.classList.add('active');
    renderCustomersCRM();
}

function renderCustomersCRM() {
    const container = document.getElementById('customersListCRM');
    if (!container) return;

    if (_crmSearchResults.length === 0) {
        var searchVal = document.getElementById('crmCustomerSearch');
        if (searchVal && searchVal.value.length >= 2) {
            container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">No customers found</div>';
        } else {
            container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">Search for a customer above</div>';
        }
        return;
    }

    // Filter by territory
    var filtered = _crmSearchResults;
    if (_crmFilter !== 'all') {
        filtered = _crmSearchResults.filter(function(c) {
            return (c.territory || '') === _crmFilter;
        });
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">No customers in this territory</div>';
        return;
    }

    var typeIcons = {
        county: '\ud83c\udfdb\ufe0f', collegiate: '\ud83c\udf93', private: '\ud83c\udfe2',
        contractor: '\ud83d\udee0\ufe0f', government: '\ud83c\udfe3', worship: '\u26ea',
        other: '\ud83d\udccb'
    };

    container.innerHTML = filtered.map(function(c) {
        var locCount = (c.locations || []).length;
        var icon = typeIcons[c.type] || typeIcons.other;
        var territory = c.territory ? '<span class="badge" style="font-size: 10px; padding: 2px 6px; background: ' +
            (c.territory === 'Southern' ? '#e3f2fd' : '#fff3e0') + '; color: ' +
            (c.territory === 'Southern' ? '#1565c0' : '#e65100') + ';">' + c.territory + '</span>' : '';

        return '<div class="browse-district-item" onclick="openCustomerFromCRM(\'' + c.id + '\')">' +
            '<div class="browse-district-info">' +
                '<div class="browse-district-name">' + icon + ' ' + (c.name || 'Unnamed') + '</div>' +
                '<div class="browse-district-meta">' +
                    (c.address || '') +
                    (territory ? ' ' + territory : '') +
                '</div>' +
            '</div>' +
            '<div style="display: flex; align-items: center; gap: 12px;">' +
                '<div class="browse-stat">' +
                    '<span class="browse-stat-value">' + locCount + '</span>' +
                    '<span class="browse-stat-label">location' + (locCount !== 1 ? 's' : '') + '</span>' +
                '</div>' +
                '<span style="font-size: 18px; color: #ccc;">\u203a</span>' +
            '</div>' +
        '</div>';
    }).join('');
}

function openCustomerFromCRM(customerId) {
    window._customerDetailFrom = 'customers';
    var backBtn = document.getElementById('custDetailBackBtn');
    if (backBtn) backBtn.setAttribute('onclick', "showView('customers')");
    viewCustomerDetail(customerId);
}

// ==========================================
// SCHOOL TREE EDITOR
// ==========================================

var _treeMode = false;
var _treeData = null;
var _treeUnassigned = [];
var _allDistricts = []; // for reassign dropdown

function toggleCustomerTree() {
    _treeMode = !_treeMode;
    var listMode = document.getElementById('crmListMode');
    var treeMode = document.getElementById('crmTreeMode');
    var btn = document.getElementById('crmTreeToggle');
    if (_treeMode) {
        listMode.classList.add('hidden');
        treeMode.classList.remove('hidden');
        btn.textContent = 'Customer List';
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline');
        loadTree();
    } else {
        listMode.classList.remove('hidden');
        treeMode.classList.add('hidden');
        btn.textContent = 'School Tree';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
    }
}

async function loadTree(searchQuery) {
    var url = '/api/customers/tree';
    if (searchQuery) url += '?q=' + encodeURIComponent(searchQuery);

    try {
        var data = await fetchAPI(url);
        _treeData = data.tree || [];
        _allDistricts = _treeData.map(function(d) { return { id: d.id, name: d.name }; });

        // Update unassigned count
        var countEl = document.getElementById('treeUnassignedCount');
        if (countEl) countEl.textContent = '(' + data.unassignedCount + ')';

        // Load unassigned
        if (data.unassignedCount > 0 && !searchQuery) {
            loadUnassigned();
        }

        renderTree(_treeData);
    } catch (err) {
        console.error('Load tree failed:', err);
    }
}

async function loadUnassigned() {
    try {
        var data = await fetchAPI('/api/customers/tree?unassigned=true');
        _treeUnassigned = data.unassigned || [];
        renderUnassigned(_treeUnassigned);
    } catch (err) {
        console.error('Load unassigned failed:', err);
    }
}

function renderUnassigned(schools) {
    var container = document.getElementById('treeUnassignedList');
    if (!container) return;

    if (schools.length === 0) {
        container.innerHTML = '<div style="padding: 16px; text-align: center; color: #6c757d; font-size: 13px;">All schools assigned</div>';
        return;
    }

    container.innerHTML = schools.map(function(s) {
        var addr = s.address || '';
        return '<div style="padding: 8px 16px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; gap: 8px;">' +
            '<div style="flex: 1; min-width: 0;">' +
                '<div style="font-size: 13px; font-weight: 500;">' + escapeHtml(s.name) + '</div>' +
                (addr ? '<div style="font-size: 11px; color: #6c757d;">' + escapeHtml(addr) + '</div>' : '') +
            '</div>' +
            '<select style="font-size: 11px; padding: 4px 8px; border: 1px solid #dee2e6; border-radius: 4px; max-width: 200px;" onchange="reassignSchool(' + s.id + ', this.value)">' +
                '<option value="">Assign to...</option>' +
                _allDistricts.map(function(d) {
                    return '<option value="' + d.id + '">' + escapeHtml(d.name) + '</option>';
                }).join('') +
            '</select>' +
        '</div>';
    }).join('');
}

function renderTree(tree) {
    var container = document.getElementById('treeDistrictList');
    if (!container) return;

    if (tree.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">No districts found</div>';
        return;
    }

    // Only show districts with >1 location (skip 1:1 clones)
    var withSchools = tree.filter(function(d) { return d.locations.length > 1; });
    var singleLoc = tree.filter(function(d) { return d.locations.length <= 1; });

    container.innerHTML = withSchools.map(function(d) {
        var locCount = d.locations.length;
        // Filter out the 1:1 clone location (same name as district)
        var schools = d.locations.filter(function(l) { return l.name.toLowerCase() !== d.name.toLowerCase(); });
        var territory = d.territory ? '<span class="badge" style="font-size: 10px; padding: 2px 6px; margin-left: 8px; background: ' +
            (d.territory === 'Southern' ? '#e3f2fd' : '#fff3e0') + '; color: ' +
            (d.territory === 'Southern' ? '#1565c0' : '#e65100') + ';">' + d.territory + '</span>' : '';

        return '<div class="card" style="margin-bottom: 8px;">' +
            '<div class="card-header" style="padding: 10px 16px; cursor: pointer;" onclick="toggleTreeSection(\'dist-' + d.id + '\')">' +
                '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                    '<div style="display: flex; align-items: center;">' +
                        '<span style="font-size: 13px; font-weight: 600;">' + escapeHtml(d.name) + '</span>' +
                        territory +
                    '</div>' +
                    '<div style="display: flex; align-items: center; gap: 8px;">' +
                        '<span style="font-size: 12px; color: #6c757d;">' + schools.length + ' school' + (schools.length !== 1 ? 's' : '') + '</span>' +
                        '<span id="arrow-dist-' + d.id + '" style="font-size: 14px; color: #6c757d;">&#9654;</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div id="section-dist-' + d.id + '" class="hidden" style="max-height: 400px; overflow-y: auto;">' +
                schools.map(function(l) {
                    var isMigrated = l.source === 'servicepal_migration';
                    var dot = isMigrated ? '<span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #FF9800; margin-right: 6px;" title="ServicePal import"></span>' : '';
                    var lAddr = l.address || '';
                    var contactsHtml = '';
                    if (l.contacts && l.contacts.length > 0) {
                        contactsHtml = '<div style="margin-top: 3px;">' +
                            l.contacts.map(function(c) {
                                var parts = [];
                                if (c.name) parts.push('<span style="font-weight: 500;">' + escapeHtml(c.name) + '</span>');
                                if (c.title) parts.push('<span style="color: #999;">' + escapeHtml(c.title) + '</span>');
                                if (c.phone) parts.push('<a href="tel:' + escapeHtml(c.phone) + '" style="color: #0d6efd; text-decoration: none;" onclick="event.stopPropagation();">' + escapeHtml(c.phone) + '</a>');
                                if (c.email) parts.push('<a href="mailto:' + escapeHtml(c.email) + '" style="color: #0d6efd; text-decoration: none;" onclick="event.stopPropagation();">' + escapeHtml(c.email) + '</a>');
                                return '<div style="font-size: 11px; color: #555;">' + parts.join(' &middot; ') + '</div>';
                            }).join('') +
                        '</div>';
                    }
                    return '<div style="padding: 6px 16px 6px 32px; border-bottom: 1px solid #f8f9fa; display: flex; justify-content: space-between; align-items: center;">' +
                        '<div style="flex: 1; min-width: 0;">' +
                            '<div style="font-size: 12px;">' + dot + escapeHtml(l.name) + '</div>' +
                            (lAddr ? '<div style="font-size: 11px; color: #6c757d;">' + escapeHtml(lAddr) + '</div>' : '') +
                            contactsHtml +
                        '</div>' +
                        '<button class="btn btn-outline" style="font-size: 10px; padding: 2px 8px; flex-shrink: 0;" onclick="event.stopPropagation(); showReassignSchool(' + l.id + ', \'' + escapeHtml(l.name).replace(/'/g, "\\'") + '\', ' + d.id + ')">Move</button>' +
                    '</div>';
                }).join('') +
            '</div>' +
        '</div>';
    }).join('');
}

function toggleTreeSection(sectionId) {
    var section = document.getElementById('section-' + sectionId);
    var arrow = document.getElementById('arrow-' + sectionId);
    if (!section) {
        // Unassigned section
        var list = document.getElementById('treeUnassignedList');
        var uArrow = document.getElementById('treeUnassignedArrow');
        if (list) {
            var isHidden = list.style.display === 'none';
            list.style.display = isHidden ? '' : 'none';
            if (uArrow) uArrow.innerHTML = isHidden ? '&#9660;' : '&#9654;';
        }
        return;
    }
    var isHidden = section.classList.contains('hidden');
    section.classList.toggle('hidden');
    if (arrow) arrow.innerHTML = isHidden ? '&#9660;' : '&#9654;';
}

async function reassignSchool(locationId, newCustomerId) {
    if (!newCustomerId) return;
    try {
        await fetchAPI('/api/customers/locations?id=' + locationId, {
            method: 'PUT',
            body: JSON.stringify({ customerId: parseInt(newCustomerId) })
        });
        // Reload tree
        loadTree(document.getElementById('treeSearch')?.value || '');
    } catch (err) {
        console.error('Reassign failed:', err);
        alert('Failed to reassign: ' + err.message);
    }
}

function showReassignSchool(locationId, schoolName, currentDistrictId) {
    var newDistrict = prompt('Move "' + schoolName + '" to which district?\n\nType part of the district name:');
    if (!newDistrict) return;

    var matches = _allDistricts.filter(function(d) {
        return d.name.toLowerCase().includes(newDistrict.toLowerCase()) && d.id !== currentDistrictId;
    });

    if (matches.length === 0) {
        alert('No matching district found for "' + newDistrict + '"');
        return;
    }
    if (matches.length === 1) {
        if (confirm('Move to "' + matches[0].name + '"?')) {
            reassignSchool(locationId, matches[0].id);
        }
        return;
    }
    // Multiple matches - let user pick
    var msg = 'Multiple matches:\n';
    matches.slice(0, 10).forEach(function(d, i) { msg += (i + 1) + '. ' + d.name + '\n'; });
    msg += '\nEnter number:';
    var pick = prompt(msg);
    var idx = parseInt(pick) - 1;
    if (idx >= 0 && idx < matches.length) {
        reassignSchool(locationId, matches[idx].id);
    }
}

var _treeSearchTimer;
function searchTree(query) {
    clearTimeout(_treeSearchTimer);
    _treeSearchTimer = setTimeout(function() {
        loadTree(query || '');
    }, 300);
}

async function viewCustomerDetail(customerId) {
    var customer = CUSTOMERS.find(c => c.id === customerId);
    // Also check browseCustomersCache (for QB-first Search & Browse flow)
    if (!customer && typeof browseCustomersCache !== 'undefined') {
        customer = browseCustomersCache.find(c => c.id == customerId || c._localId == customerId);
    }

    // QB-to-local bridge: if this is a QB search result, fetch the full local record
    if (customer && customer._isQbResult) {
        try {
            var localCustomer = await CustomersAPI.findByQbId(customer.id);
            if (localCustomer) {
                var qbId = customer.id;
                customer = localCustomer;
                customer._qbId = qbId;
                customerId = customer.id;
            }
        } catch (err) {
            console.error('Failed to bridge QB customer to local:', err);
        }
    }

    // If still no customer, try fetching by local ID
    if (!customer) {
        try {
            customer = await CustomersAPI.get(customerId);
        } catch (err) {
            console.error('Failed to fetch customer:', err);
            return;
        }
    }
    if (!customer) return;

    // Ensure customer is in browseCustomersCache so save operations can find it
    if (typeof browseCustomersCache !== 'undefined') {
        var idx = browseCustomersCache.findIndex(c => c.id == customer.id);
        if (idx >= 0) {
            browseCustomersCache[idx] = customer;
        } else {
            browseCustomersCache.push(customer);
        }
    }

    currentCustomerId = customerId;

    // Populate header
    const typeInfo = CUSTOMER_TYPES[customer.type] || CUSTOMER_TYPES.other;
    document.getElementById('custDetailName').textContent = `${typeInfo.icon} ${customer.name}`;
    document.getElementById('custDetailType').textContent = typeInfo.label;
    document.getElementById('custDetailType').className = `badge ${typeInfo.badge}`;

    // Populate info
    const primaryContact = getPrimaryContact(customer.contacts);
    var addrEl = document.getElementById('custDetailAddress');
    var addr = customer.address || '';
    if (addr) {
        addrEl.innerHTML = '<a href="#" onclick="event.preventDefault(); openMapsPicker(\'' + addr.replace(/'/g, "\\'") + '\');" style="color: #0066cc; text-decoration: none;">' + addr + '</a>';
    } else {
        addrEl.textContent = '';
    }
    document.getElementById('custDetailContact').textContent = primaryContact.name || 'No contacts';
    var phoneVal = primaryContact.phone || customer.phone || '';
    var phoneEl = document.getElementById('custDetailPhone');
    if (phoneVal) {
        phoneEl.innerHTML = '<a href="tel:' + phoneVal + '" style="color: #0066cc; text-decoration: none;">' + phoneVal + '</a>';
    } else {
        phoneEl.textContent = '';
    }

    // Fetch real job + estimate data for tabs
    loadCustomerStats(customer);

    // Populate locations with contacts (if full locations tab exists)
    const locList = document.getElementById('custLocationsList');
    if (locList) locList.innerHTML = customer.locations.map(loc => {
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
                        ${c.phone ? `<div style="display: flex; align-items: center; gap: 6px; justify-content: flex-end;"><span>${c.phone}</span><button class="btn-call" onclick="event.stopPropagation(); clickToCall('${c.phone.replace(/'/g, "\\'")}', '${c.name.replace(/'/g, "\\'")}')" title="Call ${c.name}">&#128222;</button></div>` : ''}
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
                    <button class="btn btn-outline" style="font-size: 12px; padding: 6px 12px;" onclick="event.stopPropagation(); drillToSchoolFromSearch('${customer.id}', '${loc.id}')">View Jobs</button>
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
                            ${c.phone ? `<div style="margin-bottom: 4px; display: flex; align-items: center; gap: 6px; justify-content: flex-end;"><a href="tel:${c.phone}" style="color: #0066cc;">${c.phone}</a><button class="btn-call" onclick="event.stopPropagation(); clickToCall('${c.phone.replace(/'/g, "\\'")}', '${c.name.replace(/'/g, "\\'")}')" title="Call ${c.name}">&#128222;</button></div>` : ''}
                            ${c.mobile ? `<div style="margin-bottom: 4px; display: flex; align-items: center; gap: 6px; justify-content: flex-end;"><span style="color: #6c757d;">${c.mobile} (mobile)</span><button class="btn-call" onclick="event.stopPropagation(); clickToCall('${c.mobile.replace(/'/g, "\\'")}', '${c.name.replace(/'/g, "\\'")}')" title="Call ${c.name}">&#128222;</button></div>` : ''}
                            ${c.email ? `<div><a href="mailto:${c.email}" style="color: #0066cc;">${c.email}</a></div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        contactsList.innerHTML = districtContactsHtml || '<div class="empty-state"><p>No district-level contacts</p></div>';
    }

    // Populate locations & contacts (parent-child tree)
    const locContactsEl = document.getElementById('custLocationsContacts');
    if (locContactsEl) {
        if (!customer.locations || customer.locations.length === 0) {
            locContactsEl.innerHTML = '<div style="color: #6c757d; padding: 8px 0;">No locations yet</div>';
        } else {
            locContactsEl.innerHTML = customer.locations.map(loc => {
                const contacts = loc.contacts || [];
                const contactsHtml = contacts.length > 0 ? contacts.map(c => {
                    const phoneNum = c.phone || c.mobile || '';
                    const callBtn = phoneNum
                        ? `<button class="btn-call" style="width: 20px; height: 20px; font-size: 10px;" onclick="event.stopPropagation(); clickToCall('${phoneNum.replace(/'/g, "\\'")}', '${(c.name || '').replace(/'/g, "\\'")}')" title="Call">&#128222;</button>`
                        : '';
                    return `<div style="display: flex; align-items: center; gap: 6px; padding: 4px 0 4px 16px;">
                        <div style="flex: 1; min-width: 0;">
                            <span style="font-weight: 500;">${c.name}</span>
                            ${c.title ? `<span style="color: #6c757d;"> - ${c.title}</span>` : ''}
                            ${phoneNum ? `<div style="font-size: 11px;"><a href="tel:${phoneNum}" onclick="event.stopPropagation();" style="color: #0066cc; text-decoration: none;">${phoneNum}</a></div>` : ''}
                        </div>
                        ${callBtn}
                    </div>`;
                }).join('') : '<div style="padding: 4px 0 4px 16px; color: #adb5bd; font-size: 11px;">No contacts</div>';

                return `<div style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600;">${loc.name}</div>
                            ${loc.address ? `<a href="#" onclick="event.preventDefault(); event.stopPropagation(); openMapsPicker('${loc.address.replace(/'/g, "\\'")}');" style="font-size: 11px; color: #0066cc; text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${loc.address}</a>` : ''}
                        </div>
                        <button class="btn btn-outline" style="font-size: 9px; padding: 2px 6px; white-space: nowrap; flex-shrink: 0; margin-top: 2px;" onclick="showAddContactModal('${customer.id}', '${loc.id}')">+ Contact</button>
                    </div>
                    ${contactsHtml}
                </div>`;
            }).join('');
        }
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

    // Show detail view and default to estimates tab
    showView('customerDetail');
    showCustomerTab('estimates');

    // Activity column loads automatically (always visible)
    renderCustomerActivity(currentCustomerId);
}

function showCustomerTab(tab) {
    // All tab IDs
    const tabs = ['customerEstimatesTab', 'customerHistoryTab'];
    const buttons = ['tabEstimates', 'tabHistory'];

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
        estimates: { tab: 'customerEstimatesTab', btn: 'tabEstimates' },
        history: { tab: 'customerHistoryTab', btn: 'tabHistory' },
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

    // Lazy-load tab data
    if (tab === 'estimates' && currentCustomerId) {
        renderCustomerEstimates(currentCustomerId);
    } else if (tab === 'history' && currentCustomerId) {
        renderCustomerHistory(currentCustomerId);
    }
}

// ==========================================
// CUSTOMER DETAIL — DATA LOADERS
// Real stats, estimates, service history, activity
// ==========================================

// Cache to avoid refetching on tab switches
let _custJobsCache = {};
let _custEstimatesCache = {};
let _custActivityCache = {};

async function loadCustomerStats(customer) {
    const customerId = customer.id;
    try {
        // Fetch jobs by customer name (same pattern as browse.js)
        const jobsPromise = JobsAPI.list({ q: customer.name, limit: 500 });
        // Fetch estimates by QB customer ID if available
        const estPromise = customer.qbCustomerId
            ? EstimatesAPI.listLocal({ customer_id: customer.qbCustomerId, limit: 500 })
            : Promise.resolve({ estimates: [] });

        const [jobsData, estData] = await Promise.all([jobsPromise, estPromise]);

        const jobs = jobsData.jobs || [];
        const estimates = estData.estimates || [];

        // Cache for other tabs
        _custJobsCache[customerId] = jobs;
        _custEstimatesCache[customerId] = estimates;

        // Auto-render estimates (default tab)
        if (currentCustomerId === customerId) {
            renderCustomerEstimates(customerId);
        }

    } catch (err) {
        console.error('Failed to load customer stats:', err);
    }
}

function renderCustomerEstimates(customerId) {
    const container = document.getElementById('custEstimatesList');
    if (!container) return;

    const estimates = _custEstimatesCache[customerId];
    if (!estimates) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">Loading estimates...</div>';
        return;
    }

    if (estimates.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">No estimates found for this customer</div>';
        return;
    }

    // Sort by date descending
    const sorted = [...estimates].sort((a, b) => {
        const da = new Date(a.txnDate || a.createdAt || 0);
        const db = new Date(b.txnDate || b.createdAt || 0);
        return db - da;
    });

    const statusColors = {
        'Pending': '#FF9800',
        'Accepted': '#4CAF50',
        'Closed': '#6c757d',
        'Rejected': '#f44336'
    };

    container.innerHTML = '<table class="data-table" style="font-size: 12px;"><thead><tr>' +
        '<th>Doc #</th><th>Date</th><th>Status</th>' +
        '</tr></thead><tbody>' +
        sorted.map(function(est, idx) {
            var date = est.txnDate ? new Date(est.txnDate).toLocaleDateString() : '—';
            var status = est.status || 'Unknown';
            var color = statusColors[status] || '#6c757d';
            return '<tr style="cursor: pointer;" onclick="showEstimatePreview(' + idx + ', \'' + customerId + '\')">' +
                '<td><span style="color: #0066cc; font-weight: 500;">' + (est.docNumber || est.qbEstimateId || '—') + '</span></td>' +
                '<td>' + date + '</td>' +
                '<td><span class="badge" style="background: ' + color + '20; color: ' + color + '; font-size: 11px;">' + status + '</span></td>' +
                '</tr>';
        }).join('') +
        '</tbody></table>';
}

function showEstimatePreview(idx, customerId) {
    var estimates = _custEstimatesCache[customerId];
    var sorted = [].concat(estimates).sort(function(a, b) { return new Date(b.txnDate || b.createdAt || 0) - new Date(a.txnDate || a.createdAt || 0); });
    var est = sorted[idx];
    if (!est) return;

    var amount = parseFloat(est.totalAmount) || 0;
    var sc = { 'Pending': '#FF9800', 'Accepted': '#4CAF50', 'Closed': '#6c757d', 'Rejected': '#f44336' };
    var color = sc[est.status] || '#6c757d';
    var qbId = est.qbEstimateId || est.id;
    var qbUrl = 'https://qbo.intuit.com/app/estimate?txnId=' + qbId;
    var date = est.txnDate ? new Date(est.txnDate).toLocaleDateString() : '—';

    var items = est.lineItems || [];
    var lineItemsHtml = items.length > 0
        ? items.map(function(li) {
            return '<div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px;">' +
                '<span style="flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + (li.description || li.itemName || '—') + '</span>' +
                '<span style="font-weight: 500; margin-left: 12px; white-space: nowrap;">$' + (parseFloat(li.amount) || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '</span>' +
                '</div>';
        }).join('')
        : '<div style="font-size: 13px; color: #6c757d; padding: 12px 0;">No line items</div>';

    showCrmPreview({
        title: 'Estimate ' + (est.docNumber || qbId),
        badge: { label: est.status || 'Unknown', color: color },
        topRight: '<a href="' + qbUrl + '" target="_blank" rel="noopener" onclick="event.stopPropagation();" style="font-size: 12px; color: #0066cc; text-decoration: none; padding: 4px 10px; border: 1px solid #0066cc; border-radius: 6px; margin-right: 8px;">Open in QuickBooks ↗</a>' +
            '<button class="btn btn-outline" style="font-size: 12px; padding: 4px 10px;" onclick="event.stopPropagation(); closeCrmPreview(); viewEstimate(\'' + qbId + '\');">Open in App →</button>',
        fields: [
            { label: 'Date', value: date },
            { label: 'Total', value: '$' + amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), bold: true },
            { label: 'Customer', value: est.customerName || '—' }
        ],
        body: '<div style="margin-top: 4px;"><div style="font-size: 11px; font-weight: 600; color: #6c757d; text-transform: uppercase; margin-bottom: 6px;">Line Items</div>' + lineItemsHtml + '</div>' +
            (est.customerMemo ? '<div style="margin-top: 12px; font-size: 12px; color: #6c757d; font-style: italic; border-top: 1px solid #e9ecef; padding-top: 8px;">' + est.customerMemo + '</div>' : '')
    });
}

function showJobPreview(idx, customerId) {
    var jobs = _custJobsCache[customerId];
    var sorted = [].concat(jobs).sort(function(a, b) { return new Date(b.scheduledDate || b.createdAt || 0) - new Date(a.scheduledDate || a.createdAt || 0); });
    var job = sorted[idx];
    if (!job) return;

    var statusColors = { 'completed': '#4CAF50', 'in_progress': '#2196F3', 'scheduled': '#FF9800', 'draft': '#6c757d' };
    var color = statusColors[job.status] || '#6c757d';
    var statusLabel = (job.status || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
    var date = job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : (job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—');

    var fields = [
        { label: 'Type', value: (job.jobType || '—').replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); }) },
        { label: 'Location', value: job.locationName || '—' },
        { label: 'Date', value: date }
    ];
    if (job.assignedTo) fields.push({ label: 'Assigned To', value: job.assignedTo });
    if (job.territory) fields.push({ label: 'Territory', value: job.territory });

    var bodyHtml = '';
    if (job.description) bodyHtml += '<div style="margin-top: 4px; font-size: 13px; color: #495057;">' + job.description + '</div>';
    if (job.notes) bodyHtml += '<div style="margin-top: 8px; font-size: 12px; color: #6c757d; font-style: italic; border-top: 1px solid #e9ecef; padding-top: 8px;">' + job.notes + '</div>';

    showCrmPreview({
        title: 'Job ' + (job.jobNumber || job.id),
        badge: { label: statusLabel, color: color },
        topRight: '<button class="btn btn-outline" style="font-size: 12px; padding: 4px 10px;" onclick="event.stopPropagation(); closeCrmPreview(); viewJob(\'' + job.id + '\');">Open in App →</button>',
        fields: fields,
        body: bodyHtml
    });
}

// Shared CRM preview overlay (parts catalog style)
function showCrmPreview(opts) {
    closeCrmPreview();
    var overlay = document.createElement('div');
    overlay.id = 'crmPreviewOverlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;';
    overlay.onclick = function(e) { if (e.target === overlay) closeCrmPreview(); };

    var fieldsHtml = (opts.fields || []).map(function(f) {
        return '<div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0;">' +
            '<span style="font-size: 12px; color: #6c757d;">' + f.label + '</span>' +
            '<span style="font-size: 13px;' + (f.bold ? ' font-weight: 700; font-size: 15px;' : '') + ' color: #212529;">' + f.value + '</span>' +
            '</div>';
    }).join('');

    overlay.innerHTML =
        '<div onclick="event.stopPropagation();" style="background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto; animation: fadeIn 0.15s ease;">' +
            '<div style="padding: 16px 20px; border-bottom: 1px solid #e9ecef;">' +
                '<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">' +
                    '<div>' +
                        '<div style="font-size: 16px; font-weight: 700; color: #212529;">' + opts.title + '</div>' +
                        '<span class="badge" style="background: ' + opts.badge.color + '20; color: ' + opts.badge.color + '; margin-top: 6px; display: inline-block;">' + opts.badge.label + '</span>' +
                    '</div>' +
                    '<button onclick="closeCrmPreview();" style="background: none; border: none; font-size: 20px; color: #6c757d; cursor: pointer; padding: 0; line-height: 1;">✕</button>' +
                '</div>' +
                '<div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px;">' + (opts.topRight || '') + '</div>' +
            '</div>' +
            '<div style="padding: 16px 20px;">' +
                fieldsHtml +
                (opts.body || '') +
            '</div>' +
        '</div>';

    document.body.appendChild(overlay);
}

function closeCrmPreview() {
    var existing = document.getElementById('crmPreviewOverlay');
    if (existing) existing.remove();
}

function openMapsPicker(address) {
    var encoded = encodeURIComponent(address);
    var overlay = document.createElement('div');
    overlay.id = 'mapsPickerOverlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;';
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML =
        '<div onclick="event.stopPropagation();" style="background: #fff; border-radius: 16px; padding: 24px; max-width: 300px; width: 100%; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">' +
            '<div style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">Open in Maps</div>' +
            '<div style="font-size: 12px; color: #6c757d; margin-bottom: 20px;">' + address + '</div>' +
            '<div style="display: flex; flex-direction: column; gap: 10px;">' +
                '<a href="maps://maps.apple.com/?q=' + encoded + '" onclick="document.getElementById(\'mapsPickerOverlay\').remove();" style="display: block; padding: 12px; background: #000; color: #fff; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">Apple Maps</a>' +
                '<a href="https://maps.google.com/?q=' + encoded + '" target="_blank" rel="noopener" onclick="document.getElementById(\'mapsPickerOverlay\').remove();" style="display: block; padding: 12px; background: #4285F4; color: #fff; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">Google Maps</a>' +
            '</div>' +
            '<div onclick="document.getElementById(\'mapsPickerOverlay\').remove();" style="margin-top: 16px; font-size: 13px; color: #6c757d; cursor: pointer;">Cancel</div>' +
        '</div>';
    document.body.appendChild(overlay);
}

function renderCustomerHistory(customerId) {
    const container = document.getElementById('custHistoryList');
    if (!container) return;

    const jobs = _custJobsCache[customerId];
    if (!jobs) {
        container.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6c757d;">Loading...</td></tr>';
        return;
    }

    if (jobs.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6c757d;">No jobs found for this customer</td></tr>';
        return;
    }

    // Sort by date descending
    const sorted = [...jobs].sort((a, b) => {
        const da = new Date(a.scheduledDate || a.createdAt || 0);
        const db = new Date(b.scheduledDate || b.createdAt || 0);
        return db - da;
    });

    const statusBadge = function(status) {
        const colors = {
            'completed': 'badge-success',
            'in_progress': 'badge-info',
            'scheduled': 'badge-warning',
            'draft': 'badge-secondary'
        };
        return '<span class="badge ' + (colors[status] || 'badge-secondary') + '">' + (status || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + '</span>';
    };

    container.innerHTML = sorted.map(function(job, idx) {
        var date = job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : (job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—');
        return '<tr style="cursor: pointer;" onclick="showJobPreview(' + idx + ', \'' + customerId + '\')">' +
            '<td><span style="color: #0066cc; font-weight: 500;">' + (job.jobNumber || job.id) + '</span></td>' +
            '<td>' + (job.jobType || '—').replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); }) + '</td>' +
            '<td>' + (job.locationName || '—') + '</td>' +
            '<td>' + statusBadge(job.status) + '</td>' +
            '<td>' + date + '</td>' +
            '</tr>';
    }).join('');
}

async function renderCustomerActivity(customerId) {
    const timeline = document.getElementById('custActivityTimeline');
    if (!timeline) return;

    // Check cache first
    if (_custActivityCache[customerId]) {
        renderActivityTimeline(timeline, _custActivityCache[customerId]);
        return;
    }

    timeline.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">Loading activity...</div>';

    try {
        const data = await ActivitiesAPI.list({ customerId: customerId, limit: 50 });
        const activities = data.activities || [];
        _custActivityCache[customerId] = activities;
        renderActivityTimeline(timeline, activities);
    } catch (err) {
        console.error('Failed to load activities:', err);
        timeline.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">No activity yet</div>';
    }
}

function renderActivityTimeline(container, activities) {
    if (!activities || activities.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">No activity recorded yet. Use the buttons above to log a call, add a note, or schedule a follow-up.</div>';
        return;
    }

    // Group by date
    const groups = {};
    activities.forEach(function(a) {
        const date = new Date(a.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        if (!groups[date]) groups[date] = [];
        groups[date].push(a);
    });

    var html = '';
    Object.keys(groups).forEach(function(date) {
        html += '<div style="margin-bottom: 20px;">';
        html += '<div style="font-size: 12px; font-weight: 600; color: #6c757d; text-transform: uppercase; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e9ecef;">' + date + '</div>';
        groups[date].forEach(function(a) {
            var config = ActivitiesAPI.typeConfig[a.activityType] || { icon: '\uD83D\uDCCC', label: a.activityType, color: '#6c757d' };
            var time = new Date(a.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            var user = a.userName || a.userEmail || 'System';

            html += '<div style="display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">';
            html += '<div style="font-size: 20px; flex-shrink: 0;">' + config.icon + '</div>';
            html += '<div style="flex: 1;">';
            html += '<div style="font-weight: 600; font-size: 14px;">' + (a.title || config.label) + '</div>';
            if (a.body) {
                html += '<div style="color: #495057; font-size: 13px; margin-top: 4px; white-space: pre-wrap;">' + escapeHtml(a.body) + '</div>';
            }
            html += '<div style="font-size: 12px; color: #6c757d; margin-top: 4px;">' + user + ' &middot; ' + time + '</div>';
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';
    });

    container.innerHTML = html;
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==========================================
// ACTIVITY FORMS — Inline accordion
// ==========================================

let _activeActivityForm = null;

function clickToCall(phone, contactName) {
    // Open phone dialer
    window.open('tel:' + phone, '_self');

    // Open the call log form pre-filled with contact name and "did they answer" field
    _activeActivityForm = null; // force re-open
    var area = document.getElementById('activityFormArea');
    if (!area) return;

    _activeActivityForm = 'call';
    area.classList.remove('hidden');

    area.innerHTML =
        '<div class="card" style="border: 2px solid #4CAF50;">' +
        '<div class="card-body">' +
        '<h3 style="font-size: 15px; font-weight: 600; margin-bottom: 12px;">Log Call - ' + contactName + '</h3>' +
        '<div class="form-group" style="margin-bottom: 12px;">' +
        '<label class="form-label">Who did you speak with?</label>' +
        '<input type="text" id="actCallContact" class="form-control" value="' + contactName.replace(/"/g, '&quot;') + '">' +
        '</div>' +
        '<div class="form-group" style="margin-bottom: 12px;">' +
        '<label class="form-label">Did they answer?</label>' +
        '<div style="display: flex; gap: 8px;">' +
        '<button type="button" class="btn btn-outline call-answer-btn active" id="callAnswerYes" onclick="setCallAnswer(true)" style="flex: 1;">Yes</button>' +
        '<button type="button" class="btn btn-outline call-answer-btn" id="callAnswerNo" onclick="setCallAnswer(false)" style="flex: 1;">No / Voicemail</button>' +
        '</div>' +
        '</div>' +
        '<div class="form-group" style="margin-bottom: 12px;">' +
        '<label class="form-label">Summary</label>' +
        '<textarea id="actCallSummary" class="form-control" rows="3" placeholder="What was discussed?"></textarea>' +
        '</div>' +
        '<div class="form-group" style="margin-bottom: 12px;">' +
        '<label class="form-label">Follow-up date (optional)</label>' +
        '<input type="date" id="actCallFollowUp" class="form-control">' +
        '</div>' +
        '<div style="display: flex; gap: 8px;">' +
        '<button class="btn btn-primary" onclick="submitActivityForm(\'call\')">Save Call Log</button>' +
        '<button class="btn btn-secondary" onclick="toggleActivityForm(\'call\')">Cancel</button>' +
        '</div>' +
        '</div></div>';

    // Scroll to the form in the activity column
    area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

var _callAnswered = true;

function setCallAnswer(answered) {
    _callAnswered = answered;
    var yesBtn = document.getElementById('callAnswerYes');
    var noBtn = document.getElementById('callAnswerNo');
    if (yesBtn && noBtn) {
        yesBtn.classList.toggle('active', answered);
        yesBtn.style.background = answered ? '#4CAF50' : '';
        yesBtn.style.color = answered ? '#fff' : '';
        yesBtn.style.borderColor = answered ? '#4CAF50' : '';
        noBtn.classList.toggle('active', !answered);
        noBtn.style.background = !answered ? '#dc3545' : '';
        noBtn.style.color = !answered ? '#fff' : '';
        noBtn.style.borderColor = !answered ? '#dc3545' : '';
    }
}

function toggleActivityForm(type) {
    var area = document.getElementById('activityFormArea');
    if (!area) return;

    // If same form is open, close it
    if (_activeActivityForm === type) {
        area.classList.add('hidden');
        area.innerHTML = '';
        _activeActivityForm = null;
        return;
    }

    _activeActivityForm = type;
    area.classList.remove('hidden');

    if (type === 'call') {
        area.innerHTML =
            '<div class="card" style="border: 2px solid #4CAF50;">' +
            '<div class="card-body">' +
            '<h3 style="font-size: 15px; font-weight: 600; margin-bottom: 12px;">Log Call</h3>' +
            '<div class="form-group" style="margin-bottom: 12px;">' +
            '<label class="form-label">Who did you speak with?</label>' +
            '<input type="text" id="actCallContact" class="form-control" placeholder="Name or title">' +
            '</div>' +
            '<div class="form-group" style="margin-bottom: 12px;">' +
            '<label class="form-label">Summary</label>' +
            '<textarea id="actCallSummary" class="form-control" rows="3" placeholder="What was discussed?"></textarea>' +
            '</div>' +
            '<div class="form-group" style="margin-bottom: 12px;">' +
            '<label class="form-label">Follow-up date (optional)</label>' +
            '<input type="date" id="actCallFollowUp" class="form-control">' +
            '</div>' +
            '<div style="display: flex; gap: 8px;">' +
            '<button class="btn btn-primary" onclick="submitActivityForm(\'call\')">Save Call Log</button>' +
            '<button class="btn btn-secondary" onclick="toggleActivityForm(\'call\')">Cancel</button>' +
            '</div>' +
            '</div></div>';
    } else if (type === 'note') {
        area.innerHTML =
            '<div class="card" style="border: 2px solid #4CAF50;">' +
            '<div class="card-body">' +
            '<h3 style="font-size: 15px; font-weight: 600; margin-bottom: 12px;">Add Note</h3>' +
            '<div class="form-group" style="margin-bottom: 12px;">' +
            '<textarea id="actNoteBody" class="form-control" rows="4" placeholder="Type your note..."></textarea>' +
            '</div>' +
            '<div style="display: flex; gap: 8px;">' +
            '<button class="btn btn-primary" onclick="submitActivityForm(\'note\')">Save Note</button>' +
            '<button class="btn btn-secondary" onclick="toggleActivityForm(\'note\')">Cancel</button>' +
            '</div>' +
            '</div></div>';
    } else if (type === 'follow_up') {
        area.innerHTML =
            '<div class="card" style="border: 2px solid #4CAF50;">' +
            '<div class="card-body">' +
            '<h3 style="font-size: 15px; font-weight: 600; margin-bottom: 12px;">Schedule Follow-up</h3>' +
            '<div class="form-group" style="margin-bottom: 12px;">' +
            '<label class="form-label">Follow-up date</label>' +
            '<input type="date" id="actFollowUpDate" class="form-control" required>' +
            '</div>' +
            '<div class="form-group" style="margin-bottom: 12px;">' +
            '<label class="form-label">Note (optional)</label>' +
            '<textarea id="actFollowUpNote" class="form-control" rows="2" placeholder="What needs to happen?"></textarea>' +
            '</div>' +
            '<div style="display: flex; gap: 8px;">' +
            '<button class="btn btn-primary" onclick="submitActivityForm(\'follow_up\')">Save Follow-up</button>' +
            '<button class="btn btn-secondary" onclick="toggleActivityForm(\'follow_up\')">Cancel</button>' +
            '</div>' +
            '</div></div>';
    }
}

async function submitActivityForm(type) {
    if (!currentCustomerId) return;

    var payload = {
        entityType: 'customer',
        entityId: String(currentCustomerId),
        customerId: parseInt(currentCustomerId),
        activityType: type
    };

    try {
        if (type === 'call') {
            var contact = document.getElementById('actCallContact').value.trim();
            var summary = document.getElementById('actCallSummary').value.trim();
            var followUp = document.getElementById('actCallFollowUp').value;
            if (!summary) { alert('Please enter a call summary.'); return; }
            var answered = typeof _callAnswered !== 'undefined' ? _callAnswered : true;
            payload.title = contact ? 'Call with ' + contact + (answered ? '' : ' (no answer)') : 'Logged call';
            payload.body = summary;
            payload.metadata = { answered: answered };
            if (followUp) payload.metadata.followUpDate = followUp;
        } else if (type === 'note') {
            var noteBody = document.getElementById('actNoteBody').value.trim();
            if (!noteBody) { alert('Please enter a note.'); return; }
            payload.title = 'Note added';
            payload.body = noteBody;
        } else if (type === 'follow_up') {
            var fDate = document.getElementById('actFollowUpDate').value;
            var fNote = document.getElementById('actFollowUpNote').value.trim();
            if (!fDate) { alert('Please select a follow-up date.'); return; }
            payload.title = 'Follow-up scheduled for ' + new Date(fDate + 'T00:00:00').toLocaleDateString();
            payload.body = fNote || '';
            payload.metadata = { followUpDate: fDate };
        }

        await ActivitiesAPI.create(payload);

        // Close form and refresh timeline
        toggleActivityForm(type);
        delete _custActivityCache[currentCustomerId];
        renderCustomerActivity(currentCustomerId);
    } catch (err) {
        console.error('Failed to create activity:', err);
        alert('Failed to save: ' + err.message);
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

// ARCHIVED: showAddCustomerModal(), closeCustomerModal(), saveCustomer() removed.
// Customer creation now happens via QB-first flow in browse.js (browseCreateNewCustomer).
// Archived March 2026.

// ==========================================
// CONTACT CRUD FUNCTIONS
// ==========================================

function showAddContactModal(customerId, locationId = null) {
    document.getElementById('contactModalTitle').textContent = locationId ? 'Add Contact' : 'Add Contact';
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

async function saveContact() {
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

    var saveBtn = document.querySelector('#contactModal .btn-primary, #contactModal [onclick*="saveContact"]');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving...'; }

    try {
        await CustomersAPI.addContact({
            customerId: customerId,
            locationId: locationId || null,
            name: name,
            title: title,
            phone: phone,
            mobile: mobile,
            email: email,
            roles: roles
        });

        closeContactModal();
        viewCustomerDetail(customerId); // Refresh with fresh data from API
    } catch (err) {
        console.error('Failed to save contact:', err);
        alert('Failed to save contact: ' + err.message);
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Contact'; }
    }
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
    // Clear optional contact fields
    var lcName = document.getElementById('locContactName');
    var lcTitle = document.getElementById('locContactTitle');
    var lcPhone = document.getElementById('locContactPhone');
    var lcEmail = document.getElementById('locContactEmail');
    if (lcName) lcName.value = '';
    if (lcTitle) lcTitle.value = '';
    if (lcPhone) lcPhone.value = '';
    if (lcEmail) lcEmail.value = '';
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

    var customer = CUSTOMERS.find(c => c.id === customerId);
    if (!customer && typeof browseCustomersCache !== 'undefined') {
        customer = browseCustomersCache.find(c => c.id == customerId);
    }
    if (!customer) return;

    // Build contact list from optional inline contact
    const contacts = [];
    var lcName = document.getElementById('locContactName');
    var lcTitle = document.getElementById('locContactTitle');
    var lcPhone = document.getElementById('locContactPhone');
    var lcEmail = document.getElementById('locContactEmail');
    var contactName = lcName ? lcName.value.trim() : '';
    if (contactName) {
        contacts.push({
            id: 'con' + Date.now(),
            name: contactName,
            title: lcTitle ? lcTitle.value.trim() : '',
            phone: lcPhone ? lcPhone.value.trim() : '',
            email: lcEmail ? lcEmail.value.trim() : '',
            roles: []
        });
    }

    const newLocation = {
        id: 'loc' + Date.now(),
        name: name,
        address: address,
        contacts: contacts
    };

    if (!customer.locations) customer.locations = [];
    customer.locations.push(newLocation);
    closeLocationModal();
    viewCustomerDetail(customerId); // Refresh
}

// Tech Functions
function loadTechDashboard() {
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

