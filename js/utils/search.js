// ==========================================
// SEARCH
// Field staff search (job numbers only)
// Office search (everything: jobs, estimates, inspections, schedule)
// ==========================================

// FIELD VIEW: Job number lookup only
async function performTechSearch() {
    const query = document.getElementById('techSearchInput').value.trim();
    const container = document.getElementById('techSearchResults');

    if (!query || query.length < 2) {
        container.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #6c757d;"><div style="font-size: 48px; margin-bottom: 16px;">🔍</div><p style="font-size: 15px;">Enter a job number to find work orders.</p></div>';
        return;
    }

    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">Searching...</div>';

    var results = [];

    // Search Jobs API by job number
    try {
        var jobsData = await JobsAPI.list({ q: query, limit: 20 });
        (jobsData.jobs || []).forEach(function(job) {
            results.push({ type: 'job', data: job });
        });
    } catch (err) {
        console.error('Jobs API search failed:', err);
    }

    if (results.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: #6c757d;"><p>No jobs found for "' + query + '"</p></div>';
        return;
    }

    var html = '<div style="font-size: 13px; color: #6c757d; margin-bottom: 12px;">' + results.length + ' result' + (results.length !== 1 ? 's' : '') + '</div>';

    results.forEach(function(r) {
        var statusBg = r.data.status === 'completed' ? '#c8e6c9' : r.data.status === 'draft' ? '#fff3e0' : '#e3f2fd';
        var statusColor = r.data.status === 'completed' ? '#2e7d32' : r.data.status === 'draft' ? '#e65100' : '#1565c0';
        html += '<div class="card" style="margin-bottom: 8px; cursor: pointer;" onclick="viewWorkOrderDetail(' + r.data.id + ')">';
        html += '<div class="card-body" style="padding: 12px 16px;">';
        html += '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">';
        html += '<span style="font-weight: 600; color: #007bff;">#' + r.data.jobNumber + '</span>';
        html += '<span class="badge" style="background: ' + statusBg + '; color: ' + statusColor + ';">' + r.data.status + '</span>';
        if (r.data.jobType) html += '<span class="badge badge-secondary">' + r.data.jobType + '</span>';
        html += '</div>';
        html += '<div style="font-weight: 500;">' + (r.data.customerName || r.data.locationName || '') + '</div>';
        if (r.data.title) html += '<div style="font-size: 12px; color: #495057; margin-top: 4px;">' + r.data.title.substring(0, 120) + '</div>';
        if (r.data.address) html += '<div style="font-size: 12px; color: #6c757d; margin-top: 2px;">' + r.data.address + '</div>';
        html += '</div></div>';
    });

    container.innerHTML = html;
}

// ==========================================
// OFFICE SEARCH - searches everything
// ==========================================

async function performOfficeSearch() {
    var query = document.getElementById('officeSearchInput').value.trim().toLowerCase();
    var container = document.getElementById('officeSearchResults');

    if (!query || query.length < 2) {
        container.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #6c757d;"><div style="font-size: 48px; margin-bottom: 16px;">🔍</div><p style="font-size: 15px;">Search jobs, estimates, inspections, and schedule.</p></div>';
        return;
    }

    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">Searching...</div>';

    var results = [];

    // Search office work orders (in-memory)
    Object.keys(OFFICE_WORK_ORDERS || {}).forEach(function(key) {
        var wo = OFFICE_WORK_ORDERS[key];
        var searchText = (wo.jobNumber + ' ' + wo.locationName + ' ' + (wo.description || '') + ' ' + (wo.address || '') + ' ' + (wo.assignedTo || '')).toLowerCase();
        if (searchText.includes(query)) {
            results.push({ type: 'workorder', key: key, data: wo });
        }
    });

    // Search field work orders too
    Object.keys(TECH_WORK_ORDERS || {}).forEach(function(key) {
        var wo = TECH_WORK_ORDERS[key];
        var isDup = results.some(function(r) { return r.type === 'workorder' && r.data.jobNumber === wo.jobNumber; });
        if (isDup) return;
        var searchText = (wo.jobNumber + ' ' + wo.locationName + ' ' + (wo.description || '') + ' ' + (wo.address || '')).toLowerCase();
        if (searchText.includes(query)) {
            results.push({ type: 'workorder', key: key, data: wo });
        }
    });

    // Search inspection jobs (in-memory)
    (window.inspectionJobs || []).forEach(function(job) {
        var searchText = (job.jobNumber + ' ' + (job.customerName || '') + ' ' + (job.locationName || '') + ' ' + job.status).toLowerCase();
        if (searchText.includes(query)) {
            results.push({ type: 'inspection', data: job });
        }
    });

    // Search schedule data (in-memory)
    var allScheduleData = Object.assign({}, scheduleDataOriginal, scheduleDataSouthern);
    Object.keys(allScheduleData).forEach(function(dateKey) {
        (allScheduleData[dateKey] || []).forEach(function(entry) {
            if (entry.type === 'note') return;
            var searchText = ((entry.school || '') + ' ' + (entry.details || '') + ' ' + (entry.tech || '')).toLowerCase();
            if (searchText.includes(query)) {
                results.push({ type: 'schedule', date: dateKey, data: entry });
            }
        });
    });

    // Search Jobs API (Postgres)
    try {
        var jobsData = await JobsAPI.list({ q: query, limit: 20 });
        var seenJobNumbers = new Set(results.filter(function(r) { return r.type === 'workorder'; }).map(function(r) { return r.data.jobNumber; }));
        (jobsData.jobs || []).forEach(function(job) {
            if (!seenJobNumbers.has(job.jobNumber)) {
                results.push({ type: 'job', data: job });
            }
        });
    } catch (err) {
        console.error('Jobs API search failed:', err);
    }

    // Search Estimates (local Postgres table)
    try {
        var estData = await EstimatesAPI.listLocal({ q: query, limit: 20 });
        (estData.estimates || []).forEach(function(est) {
            results.push({ type: 'estimate', data: est });
        });
    } catch (err) {
        console.error('Estimates search failed:', err);
    }

    if (results.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: #6c757d;"><p>No results found for "' + query + '"</p></div>';
        return;
    }

    var html = '<div style="font-size: 13px; color: #6c757d; margin-bottom: 12px;">' + results.length + ' result' + (results.length !== 1 ? 's' : '') + '</div>';

    results.forEach(function(r) {
        if (r.type === 'workorder') {
            html += '<div class="card" style="margin-bottom: 8px; cursor: pointer;" onclick="viewWorkOrderDetail(\'' + r.key + '\')">';
            html += '<div class="card-body" style="padding: 12px 16px;">';
            html += '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">';
            html += '<span class="badge badge-info">Work Order</span>';
            html += '<span style="font-weight: 600;">#' + r.data.jobNumber + '</span>';
            html += '<span class="badge badge-secondary">' + (r.data.jobType || '') + '</span>';
            if (r.data.status === 'Pink') html += '<span class="badge badge-danger">Pink</span>';
            html += '</div>';
            html += '<div style="font-weight: 500;">' + r.data.locationName + '</div>';
            html += '<div style="font-size: 12px; color: #6c757d;">' + (r.data.address || '') + '</div>';
            if (r.data.assignedTo) html += '<div style="font-size: 12px; color: #6c757d; margin-top: 4px;">Assigned: ' + r.data.assignedTo + '</div>';
            html += '</div></div>';
        } else if (r.type === 'inspection') {
            html += '<div class="card" style="margin-bottom: 8px; cursor: pointer;" onclick="showView(\'inspections\')">';
            html += '<div class="card-body" style="padding: 12px 16px;">';
            html += '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">';
            html += '<span class="badge" style="background: #e8f5e9; color: #2e7d32;">Inspection</span>';
            html += '<span style="font-weight: 600;">#' + r.data.jobNumber + '</span>';
            html += '<span class="badge badge-secondary">' + r.data.status + '</span>';
            html += '</div>';
            html += '<div style="font-weight: 500;">' + (r.data.customerName || '') + '</div>';
            html += '<div style="font-size: 12px; color: #6c757d;">' + (r.data.locationName || '') + '</div>';
            html += '</div></div>';
        } else if (r.type === 'job') {
            var jStatusBg = r.data.status === 'completed' ? '#c8e6c9' : r.data.status === 'draft' ? '#fff3e0' : '#e3f2fd';
            var jStatusColor = r.data.status === 'completed' ? '#2e7d32' : r.data.status === 'draft' ? '#e65100' : '#1565c0';
            html += '<div class="card" style="margin-bottom: 8px; cursor: pointer;" onclick="viewWorkOrderDetail(' + r.data.id + ')">';
            html += '<div class="card-body" style="padding: 12px 16px;">';
            html += '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">';
            html += '<span class="badge badge-info">Job</span>';
            html += '<span style="font-weight: 600;">#' + r.data.jobNumber + '</span>';
            html += '<span class="badge" style="background: ' + jStatusBg + '; color: ' + jStatusColor + ';">' + r.data.status + '</span>';
            if (r.data.jobType) html += '<span class="badge badge-secondary">' + r.data.jobType + '</span>';
            html += '</div>';
            html += '<div style="font-weight: 500;">' + (r.data.customerName || r.data.locationName || '') + '</div>';
            if (r.data.title) html += '<div style="font-size: 12px; color: #495057; margin-top: 4px;">' + r.data.title.substring(0, 120) + '</div>';
            if (r.data.address) html += '<div style="font-size: 12px; color: #6c757d; margin-top: 2px;">' + r.data.address + '</div>';
            if (r.data.assignedTo) html += '<div style="font-size: 12px; color: #6c757d; margin-top: 4px;">Assigned: ' + r.data.assignedTo + '</div>';
            html += '</div></div>';
        } else if (r.type === 'estimate') {
            var estStatusStyle = (EstimatesAPI.statusColors || {})[r.data.status] || { bg: '#e0e0e0', color: '#616161' };
            html += '<div class="card" style="margin-bottom: 8px; cursor: pointer;" onclick="navigateToEstimate(\'' + (r.data.docNumber || r.data.qbEstimateId) + '\')">';
            html += '<div class="card-body" style="padding: 12px 16px;">';
            html += '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">';
            html += '<span class="badge" style="background: #fff3e0; color: #e65100;">Estimate</span>';
            html += '<span style="font-weight: 600; color: #007bff;">#' + (r.data.docNumber || '') + '</span>';
            html += '<span class="badge" style="background: ' + estStatusStyle.bg + '; color: ' + estStatusStyle.color + ';">' + (r.data.status || '') + '</span>';
            html += '</div>';
            html += '<div style="font-weight: 500;">' + (r.data.customerName || '') + '</div>';
            html += '<div style="font-size: 12px; color: #6c757d; margin-top: 4px;">';
            html += (r.data.lineItems ? r.data.lineItems.length : 0) + ' line items';
            if (r.data.txnDate) html += ' &bull; ' + new Date(r.data.txnDate).toLocaleDateString();
            html += '</div>';
            html += '<div style="font-weight: 600; color: #28a745; margin-top: 4px;">$' + Number(r.data.totalAmount || 0).toLocaleString() + '</div>';
            html += '</div></div>';
        } else if (r.type === 'schedule') {
            var d = new Date(r.date + 'T12:00:00');
            var dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            html += '<div class="card" style="margin-bottom: 8px; cursor: pointer;" onclick="showView(\'scheduling\')">';
            html += '<div class="card-body" style="padding: 12px 16px;">';
            html += '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">';
            html += '<span class="badge" style="background: #e3f2fd; color: #1565c0;">Scheduled</span>';
            html += '<span style="font-size: 12px; color: #6c757d;">' + dateStr + '</span>';
            html += '</div>';
            html += '<div style="font-weight: 500;">' + (r.data.school || '') + '</div>';
            html += '<div style="font-size: 12px; color: #495057; line-height: 1.4; margin-top: 4px;">' + (r.data.details || '').substring(0, 150) + (r.data.details && r.data.details.length > 150 ? '...' : '') + '</div>';
            if (r.data.tech) html += '<div style="font-size: 12px; color: #6c757d; margin-top: 4px;">Tech: ' + r.data.tech + '</div>';
            html += '</div></div>';
        }
    });

    container.innerHTML = html;
}
