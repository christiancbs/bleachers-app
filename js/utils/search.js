// ==========================================
// SEARCH
// Field staff search and office search
// ==========================================

function performTechSearch() {
    const query = document.getElementById('techSearchInput').value.trim().toLowerCase();
    const container = document.getElementById('techSearchResults');

    if (!query || query.length < 2) {
        container.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #6c757d;"><div style="font-size: 48px; margin-bottom: 16px;">🔍</div><p style="font-size: 15px;">Search for a school, job number, or keyword to find work orders and inspections.</p></div>';
        return;
    }

    let results = [];

    // Search work orders
    Object.keys(TECH_WORK_ORDERS || {}).forEach(function(key) {
        const wo = TECH_WORK_ORDERS[key];
        const searchText = (wo.jobNumber + ' ' + wo.locationName + ' ' + (wo.description || '') + ' ' + (wo.address || '')).toLowerCase();
        if (searchText.includes(query)) {
            results.push({ type: 'workorder', key: key, data: wo });
        }
    });

    // Search inspection jobs (field staff only sees approved inspections)
    (window.inspectionJobs || []).forEach(function(job) {
        if (currentRole !== 'office' && currentRole !== 'admin' && job.status !== 'approved') return;
        const searchText = (job.jobNumber + ' ' + (job.customerName || '') + ' ' + (job.locationName || '') + ' ' + job.status).toLowerCase();
        if (searchText.includes(query)) {
            results.push({ type: 'inspection', data: job });
        }
    });

    // Search schedule data for school names
    var allScheduleData = Object.assign({}, scheduleDataOriginal, scheduleDataSouthern);
    Object.keys(allScheduleData).forEach(function(dateKey) {
        (allScheduleData[dateKey] || []).forEach(function(entry) {
            if (entry.type === 'note') return;
            var searchText = ((entry.school || '') + ' ' + (entry.details || '')).toLowerCase();
            if (searchText.includes(query)) {
                results.push({ type: 'schedule', date: dateKey, data: entry });
            }
        });
    });

    if (results.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: #6c757d;"><p>No results found for "' + query + '"</p></div>';
        return;
    }

    var html = '<div style="font-size: 13px; color: #6c757d; margin-bottom: 12px;">' + results.length + ' result' + (results.length !== 1 ? 's' : '') + '</div>';

    results.forEach(function(r) {
        if (r.type === 'workorder') {
            html += '<div class="card" style="margin-bottom: 8px; cursor: pointer;" onclick="showTechView(\'workorderdetail\'); openTechWorkOrder(\'' + r.key + '\')">';
            html += '<div class="card-body" style="padding: 12px 16px;">';
            html += '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">';
            html += '<span class="badge badge-info">Work Order</span>';
            html += '<span style="font-weight: 600;">#' + r.data.jobNumber + '</span>';
            html += '<span class="badge badge-secondary">' + (r.data.jobType || '') + '</span>';
            html += '</div>';
            html += '<div style="font-weight: 500;">' + r.data.locationName + '</div>';
            html += '<div style="font-size: 12px; color: #6c757d;">' + (r.data.address || '') + '</div>';
            html += '</div></div>';
        } else if (r.type === 'inspection') {
            html += '<div class="card" style="margin-bottom: 8px; cursor: pointer;" onclick="showTechView(\'inspections\')">';
            html += '<div class="card-body" style="padding: 12px 16px;">';
            html += '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">';
            html += '<span class="badge" style="background: #e8f5e9; color: #2e7d32;">Inspection</span>';
            html += '<span style="font-weight: 600;">#' + r.data.jobNumber + '</span>';
            html += '<span class="badge badge-secondary">' + r.data.status + '</span>';
            html += '</div>';
            html += '<div style="font-weight: 500;">' + (r.data.customerName || '') + '</div>';
            html += '<div style="font-size: 12px; color: #6c757d;">' + (r.data.locationName || '') + '</div>';
            html += '</div></div>';
        } else if (r.type === 'schedule') {
            var d = new Date(r.date + 'T12:00:00');
            var dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            html += '<div class="card" style="margin-bottom: 8px;">';
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

// ==========================================
// OFFICE SEARCH
// ==========================================

function performOfficeSearch() {
    var query = document.getElementById('officeSearchInput').value.trim().toLowerCase();
    var container = document.getElementById('officeSearchResults');

    if (!query || query.length < 2) {
        container.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #6c757d;"><div style="font-size: 48px; margin-bottom: 16px;">🔍</div><p style="font-size: 15px;">Search for a school, job number, or keyword to find work orders, inspections, and scheduled jobs.</p></div>';
        return;
    }

    var results = [];

    // Search office work orders
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
        // Avoid duplicates (same job number already found in office WOs)
        var isDup = results.some(function(r) { return r.type === 'workorder' && r.data.jobNumber === wo.jobNumber; });
        if (isDup) return;
        var searchText = (wo.jobNumber + ' ' + wo.locationName + ' ' + (wo.description || '') + ' ' + (wo.address || '')).toLowerCase();
        if (searchText.includes(query)) {
            results.push({ type: 'workorder', key: key, data: wo });
        }
    });

    // Search inspection jobs
    (window.inspectionJobs || []).forEach(function(job) {
        var searchText = (job.jobNumber + ' ' + (job.customerName || '') + ' ' + (job.locationName || '') + ' ' + job.status).toLowerCase();
        if (searchText.includes(query)) {
            results.push({ type: 'inspection', data: job });
        }
    });

    // Search schedule data
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

