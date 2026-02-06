// ==========================================
// DASHBOARD, ESTIMATES, PIPELINE, ACCOUNTS
// ==========================================

// ==========================================
// DASHBOARD (Obsolete)
// Kept for backwards compatibility
// ==========================================

function loadOfficeDashboard() {
    // Dashboard view is obsolete - office/admin default to Pipeline
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

function loadEstimates() {
    // Update badge counts
    const pendingCount = inspections.length + jobs.filter(j => j.status === 'estimate_sent').length;
    const acceptedCount = jobs.filter(j => j.status === 'approved' || j.status === 'parts_ordered').length;

    document.getElementById('estPendingCount').textContent = pendingCount;
    document.getElementById('estAcceptedCount').textContent = acceptedCount;

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

    // Combine all estimates
    var allItems = [];

    inspections.forEach(insp => {
        allItems.push({
            id: insp.id,
            customerName: insp.customerName,
            location: insp.location,
            inspectionType: insp.inspectionType,
            createdAt: insp.createdAt,
            status: 'pending',
            jobNumber: null
        });
    });

    jobs.filter(j => j.status === 'estimate_sent' || j.status === 'approved' || j.status === 'parts_ordered').forEach(j => {
        allItems.push({
            id: j.id,
            customerName: j.customerName || j.customer,
            location: j.locationName || j.location,
            inspectionType: 'job',
            createdAt: j.createdAt || new Date().toISOString(),
            status: j.status === 'estimate_sent' ? 'pending' : 'accepted',
            jobNumber: j.jobNumber
        });
    });

    if (searchTerm) {
        allItems = allItems.filter(function(item) {
            return (item.customerName || '').toLowerCase().includes(searchTerm) ||
                   (item.location || '').toLowerCase().includes(searchTerm) ||
                   (item.id || '').toLowerCase().includes(searchTerm);
        });
    }

    if (allItems.length === 0) {
        list.innerHTML = '<div class="empty-state" style="padding: 40px;"><div class="empty-icon">📋</div><p>' + (searchTerm ? 'No estimates match your search' : 'No estimates') + '</p></div>';
    } else {
        list.innerHTML = allItems.map(item => {
            const statusBadge = item.status === 'pending'
                ? '<span class="badge badge-warning">Pending</span>'
                : '<span class="badge badge-success">Accepted</span>';
            const typeIcon = item.inspectionType === 'basketball' ? '🏀' :
                             item.inspectionType === 'bleacher' ? '🏟️' :
                             item.inspectionType === 'outdoor' ? '🪑' :
                             item.inspectionType === 'job' ? '📄' : '📋';
            return `
            <div class="inspection-item" onclick="viewEstimate('${item.id}')" style="padding: 16px; border-bottom: 1px solid #e9ecef; cursor: pointer;">
                <div class="flex-between">
                    <div>
                        <div style="margin-bottom: 4px;">
                            <span class="badge badge-info">${typeIcon}</span>
                        </div>
                        <strong>${item.customerName}</strong>
                        <p style="font-size: 13px; color: #6c757d; margin-top: 4px;">${item.location || 'No location specified'}</p>
                        <p style="font-size: 12px; color: #6c757d; margin-top: 4px;">
                            ${item.jobNumber ? 'Job #' + item.jobNumber + ' • ' : ''}${new Date(item.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    ${statusBadge}
                </div>
            </div>
        `}).join('');
    }
}

function loadEstimatesPending() {
    const list = document.getElementById('estimatesList');
    const searchEl = document.getElementById('estimateSearch');
    const searchTerm = searchEl ? searchEl.value.toLowerCase() : '';

    // Combine inspections (PSFs) and jobs with estimate_sent status
    var pendingItems = inspections.slice();
    jobs.filter(j => j.status === 'estimate_sent').forEach(j => {
        pendingItems.push({
            id: j.id,
            customerName: j.customerName || j.customer,
            location: j.locationName || j.location,
            inspectionType: 'job',
            createdAt: j.createdAt || new Date().toISOString(),
            jobNumber: j.jobNumber
        });
    });

    if (searchTerm) {
        pendingItems = pendingItems.filter(function(item) {
            return (item.customerName || '').toLowerCase().includes(searchTerm) ||
                   (item.location || '').toLowerCase().includes(searchTerm) ||
                   (item.id || '').toLowerCase().includes(searchTerm);
        });
    }

    if (pendingItems.length === 0) {
        list.innerHTML = '<div class="empty-state" style="padding: 40px;"><div class="empty-icon">📋</div><p>' + (searchTerm ? 'No estimates match your search' : 'No pending estimates') + '</p></div>';
    } else {
        list.innerHTML = pendingItems.map(item => {
            const typeIcon = item.inspectionType === 'basketball' ? '🏀' :
                             item.inspectionType === 'bleacher' ? '🏟️' :
                             item.inspectionType === 'outdoor' ? '🪑' :
                             item.inspectionType === 'job' ? '📄' : '📋';
            const typeLabel = item.inspectionType === 'basketball' ? 'Basketball' :
                              item.inspectionType === 'bleacher' ? 'Indoor Bleacher' :
                              item.inspectionType === 'outdoor' ? 'Outdoor Bleacher' :
                              item.inspectionType === 'job' ? 'Estimate' : 'PSF';
            return `
            <div class="inspection-item" onclick="viewEstimate('${item.id}')" style="padding: 16px; border-bottom: 1px solid #e9ecef; cursor: pointer;">
                <div class="flex-between">
                    <div>
                        <div style="margin-bottom: 4px;">
                            <span class="badge badge-info">${typeIcon} ${typeLabel}</span>
                        </div>
                        <strong>${item.customerName}</strong>
                        <p style="font-size: 13px; color: #6c757d; margin-top: 4px;">${item.location || 'No location specified'}</p>
                        <p style="font-size: 12px; color: #6c757d; margin-top: 4px;">
                            ${item.jobNumber ? 'Job #' + item.jobNumber + ' • ' : ''}${new Date(item.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <span class="badge badge-warning">Pending</span>
                </div>
            </div>
        `}).join('');
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
    const totalLabor = (inspection.laborHours || 0) * 65;
    const grandTotal = totalParts + totalLabor;

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

    // Filter for accepted/approved estimates
    var acceptedEstimates = jobs.filter(j => j.status === 'approved' || j.status === 'parts_ordered');

    if (searchTerm) {
        acceptedEstimates = acceptedEstimates.filter(function(est) {
            return (est.customerName || est.customer || '').toLowerCase().includes(searchTerm) ||
                   (est.locationName || est.location || '').toLowerCase().includes(searchTerm) ||
                   (est.jobNumber || est.id || '').toString().toLowerCase().includes(searchTerm);
        });
    }

    if (acceptedEstimates.length === 0) {
        list.innerHTML = '<div class="empty-state" style="padding: 40px;"><div class="empty-icon">✅</div><p>' + (searchTerm ? 'No estimates match your search' : 'No accepted estimates') + '</p></div>';
    } else {
        list.innerHTML = acceptedEstimates.map(est => `
            <div class="inspection-item" onclick="viewEstimate('${est.id}')" style="padding: 16px; border-bottom: 1px solid #e9ecef; cursor: pointer;">
                <div class="flex-between">
                    <div>
                        <strong>${est.customerName || est.customer}</strong>
                        <p style="font-size: 13px; color: #6c757d; margin-top: 4px;">${est.locationName || est.location || 'No location'}</p>
                        <p style="font-size: 12px; color: #6c757d; margin-top: 4px;">
                            Job #${est.jobNumber || est.id} • ${est.jobType || 'Service'}
                        </p>
                    </div>
                    <span class="badge badge-success">Accepted</span>
                </div>
            </div>
        `).join('');
    }
}

function initEstimateCreate() {
    const form = document.getElementById('createEstimateForm');
    form.innerHTML = `
        <p style="color: #6c757d; text-align: center; padding: 40px;">
            Estimate creation form coming soon.<br><br>
            For now, use the inspection flow to generate estimates.
        </p>
    `;
}

// ==========================================
// PIPELINE
// 8-stage pipeline view with filtering
// ==========================================

// PIPELINE_JOBS and pipelineFilter are defined in js/data.js

function loadPipeline() {
    console.log('loadPipeline called');
    const container = document.getElementById('pipelineContent');
    console.log('container:', container);
    if (!container) {
        console.error('pipelineContent container not found');
        return;
    }

    // Merge sample pipeline data with any dynamically created jobs
    console.log('PIPELINE_JOBS:', PIPELINE_JOBS);
    var allJobs = PIPELINE_JOBS.slice();
    console.log('allJobs length:', allJobs.length);
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
    pipelineHtml += '<div style="display: flex; gap: 16px; margin-bottom: 20px; align-items: center;">';
    pipelineHtml += '<div style="font-size: 14px; color: #6c757d;"><strong>' + totalActive + '</strong> active jobs &nbsp;·&nbsp; <strong>$' + totalValue.toLocaleString() + '</strong> in pipeline</div>';
    pipelineHtml += '<div style="flex: 1;"></div>';
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

    // Sort: active statuses first (by pipeline order), then by date desc
    var statusOrder = {};
    stages.forEach(function(s, i) { statusOrder[s.key] = i; });
    filtered.sort(function(a, b) {
        var sa = statusOrder[a.status] || 0;
        var sb = statusOrder[b.status] || 0;
        if (sa !== sb) return sa - sb;
        return (b.date || '').localeCompare(a.date || '');
    });

    // Table
    pipelineHtml += '<div class="card"><div class="card-body" style="padding: 0;">';
    if (filtered.length === 0) {
        pipelineHtml += '<div style="padding: 40px; text-align: center; color: #6c757d;">No jobs match the current filter</div>';
    } else {
        pipelineHtml += '<div style="overflow-x: auto;"><table class="data-table" style="margin: 0;">';
        pipelineHtml += '<thead><tr><th style="width: 80px;">Job #</th><th style="width: 70px;">Type</th><th>Customer</th><th>Location</th><th>Description</th><th style="width: 120px;">Status</th><th style="width: 90px; text-align: right;">Amount</th></tr></thead>';
        pipelineHtml += '<tbody>';
        filtered.forEach(function(job) {
            var stageInfo = stages.find(function(s) { return s.key === job.status; }) || stages[0];
            var rowBg = job.status === 'Pink' ? '#fff5f5' : '';
            pipelineHtml += '<tr style="' + (rowBg ? 'background:' + rowBg + ';' : '') + '">';
            pipelineHtml += '<td><span style="color: #0066cc; font-weight: 600; font-size: 13px;">' + job.jobNumber + '</span></td>';
            pipelineHtml += '<td><span style="font-size: 12px; color: #6c757d;">' + job.jobType + '</span></td>';
            pipelineHtml += '<td style="font-weight: 500;">' + job.customer + '</td>';
            pipelineHtml += '<td style="font-size: 13px; color: #6c757d;">' + job.location + '</td>';
            pipelineHtml += '<td style="font-size: 13px; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' + (job.description || '').replace(/"/g, '&quot;') + '">' + job.description + '</td>';
            pipelineHtml += '<td><span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; background: ' + stageInfo.bg + '; color: ' + stageInfo.color + '; border: 1px solid ' + stageInfo.color + '30;">' + job.status + (job.pinkReason ? ' - ' + job.pinkReason : '') + '</span></td>';
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

// ==========================================
// ACCOUNTS / CRM
// Customer hierarchy, locations, contacts
// ==========================================

function loadAccounts(filter = '', territory = '') {
    const list = document.getElementById('accountsList');
    const countEl = document.getElementById('accountCount');
    const searchTerm = filter.toLowerCase();

    const filteredCustomers = CUSTOMERS.filter(c => {
        // Territory filter
        if (territory && c.territory !== territory) return false;
        // Search filter
        if (!searchTerm) return true;
        if (c.name.toLowerCase().includes(searchTerm)) return true;
        if (c.locations.some(l => l.name.toLowerCase().includes(searchTerm))) return true;
        return false;
    });

    countEl.textContent = `${filteredCustomers.length} customers`;

    list.innerHTML = filteredCustomers.map(customer => {
        const typeIcon = customer.type === 'county' ? '🏛️' : '🏫';
        const typeLabel = customer.type === 'county' ? 'District' : 'Private';
        const typeBadgeClass = customer.type === 'county' ? 'badge-info' : 'badge-warning';
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
    loadAccounts(searchTerm, territory);
}

// Store current customer ID for CRUD operations
let currentCustomerId = null;

function viewCustomerDetail(customerId) {
    const customer = CUSTOMERS.find(c => c.id === customerId);
    if (!customer) return;

    currentCustomerId = customerId;

    // Populate header
    const typeIcon = customer.type === 'county' ? '🏛️' : '🏫';
    document.getElementById('custDetailName').textContent = `${typeIcon} ${customer.name}`;
    document.getElementById('custDetailType').textContent = customer.type === 'county' ? 'District' : 'Private';
    document.getElementById('custDetailType').className = `badge ${customer.type === 'county' ? 'badge-info' : 'badge-warning'}`;

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

