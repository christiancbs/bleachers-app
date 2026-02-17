// ==========================================
// SEARCH & BROWSE — Hierarchical Drill-Down
// District → School → Jobs → Banks/Forms
// ==========================================

// State
var browseNavStack = [];
var browseContext = null; // 'office' or 'field'
var browseCustomersCache = [];
var browseJobsCache = {}; // { customerId: [jobs] }

// ==========================================
// INIT & NAVIGATION
// ==========================================

function initBrowse(context) {
    browseContext = context;

    // If returning with existing state, restore last screen
    if (browseNavStack.length > 0) {
        restoreBrowseScreen();
        return;
    }

    // Fresh load
    browseNavStack = [{ screen: 'districts', data: null }];
    loadBrowseDistricts();
}

function getSuffix() {
    return browseContext === 'office' ? 'Office' : 'Tech';
}

function browseShowScreen(screenNum) {
    var suffix = getSuffix();
    var container = browseContext === 'office' ? 'officeSearchView' : 'techSearchView';
    var screens = document.querySelectorAll('#' + container + ' .browse-screen');
    screens.forEach(function(el) { el.classList.add('hidden'); });
    var target = document.getElementById('browseScreen' + screenNum + suffix);
    if (target) target.classList.remove('hidden');

    // Scroll to top
    var scrollContainer = document.querySelector('.content-area');
    if (scrollContainer) scrollContainer.scrollTop = 0;
    window.scrollTo(0, 0);
}

function restoreBrowseScreen() {
    var current = browseNavStack[browseNavStack.length - 1];
    switch (current.screen) {
        case 'districts':
            browseShowScreen(1);
            break;
        case 'district':
            browseShowScreen(2);
            break;
        case 'school':
            browseShowScreen(3);
            break;
        case 'job':
            browseShowScreen(4);
            break;
    }
}

function browseBack() {
    if (browseNavStack.length <= 1) return;
    browseNavStack.pop();

    var prev = browseNavStack[browseNavStack.length - 1];
    switch (prev.screen) {
        case 'districts':
            browseShowScreen(1);
            break;
        case 'district':
            browseDrillDistrict(prev.data.customerId, true);
            break;
        case 'school':
            browseDrillSchool(prev.data.customerId, prev.data.locationId, true);
            break;
        case 'job':
            browseDrillJob(prev.data.jobId, true);
            break;
    }
}

// ==========================================
// SCREEN 1: DISTRICT LIST
// ==========================================

async function loadBrowseDistricts() {
    var suffix = getSuffix();
    var listEl = document.getElementById('browseDistrictsList' + suffix);
    var countEl = document.getElementById('browseCount' + suffix);

    listEl.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">Loading districts...</div>';

    try {
        // Use cached CUSTOMERS global if already loaded, otherwise fetch
        if (typeof CUSTOMERS !== 'undefined' && CUSTOMERS.length > 0) {
            browseCustomersCache = CUSTOMERS.slice();
        } else {
            var data = await CustomersAPI.list({ limit: 500, active: true });
            browseCustomersCache = data.customers || [];
        }

        // Sort alphabetically
        browseCustomersCache.sort(function(a, b) {
            return (a.name || '').localeCompare(b.name || '');
        });

        renderDistrictList(browseCustomersCache);
    } catch (err) {
        console.error('Failed to load districts:', err);
        listEl.innerHTML = '<div style="text-align: center; padding: 40px; color: #dc3545;">Failed to load districts. Please try again.</div>';
    }
}

function renderDistrictList(customers) {
    var suffix = getSuffix();
    var listEl = document.getElementById('browseDistrictsList' + suffix);
    var countEl = document.getElementById('browseCount' + suffix);

    if (countEl) countEl.textContent = customers.length + ' district' + (customers.length !== 1 ? 's' : '');

    if (customers.length === 0) {
        listEl.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">No districts found.</div>';
        return;
    }

    var typeIcons = {
        county: '\ud83c\udfdb\ufe0f', collegiate: '\ud83c\udf93', private: '\ud83c\udfe2',
        contractor: '\ud83d\udee0\ufe0f', government: '\ud83c\udfe3', worship: '\u26ea',
        other: '\ud83d\udccb'
    };

    listEl.innerHTML = customers.map(function(c) {
        var locCount = (c.locations || []).length;
        var icon = typeIcons[c.type] || typeIcons.other;
        var territory = c.territory ? '<span class="badge" style="font-size: 10px; padding: 2px 6px; background: ' +
            (c.territory === 'Southern' ? '#e3f2fd' : '#fff3e0') + '; color: ' +
            (c.territory === 'Southern' ? '#1565c0' : '#e65100') + ';">' + c.territory + '</span>' : '';

        return '<div class="browse-district-item" onclick="browseDrillDistrict(\'' + c.id + '\')">' +
            '<div class="browse-district-info">' +
                '<div class="browse-district-name">' + icon + ' ' + escapeHtml(c.name) + '</div>' +
                '<div class="browse-district-meta">' +
                    (c.address ? escapeHtml(c.address) : '') +
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

function filterBrowseDistricts(query) {
    if (!query || query.length < 2) {
        renderDistrictList(browseCustomersCache);
        return;
    }

    var q = query.toLowerCase();
    var filtered = browseCustomersCache.filter(function(c) {
        var searchText = (c.name + ' ' + (c.address || '')).toLowerCase();
        if (searchText.includes(q)) return true;
        // Also search location names
        return (c.locations || []).some(function(loc) {
            return (loc.name + ' ' + (loc.address || '')).toLowerCase().includes(q);
        });
    });
    renderDistrictList(filtered);
}

// ==========================================
// SCREEN 2: DISTRICT DETAIL (SCHOOLS)
// ==========================================

async function browseDrillDistrict(customerId, isBack) {
    if (!isBack) {
        browseNavStack.push({ screen: 'district', data: { customerId: customerId } });
    }
    browseShowScreen(2);

    var suffix = getSuffix();
    var customer = browseCustomersCache.find(function(c) { return c.id == customerId; });

    if (!customer) {
        // Fetch if not cached
        try {
            customer = await CustomersAPI.get(customerId);
        } catch (err) {
            console.error('Failed to fetch customer:', err);
            return;
        }
    }

    // Header
    document.getElementById('browseDistrictName' + suffix).textContent = customer.name || '';
    var typeLabels = { county: 'County', collegiate: 'Collegiate', private: 'Private', contractor: 'Contractor', government: 'Government', worship: 'Worship', other: 'Other' };
    var typeBadge = document.getElementById('browseDistrictTypeBadge' + suffix);
    if (customer.type && typeLabels[customer.type]) {
        typeBadge.textContent = typeLabels[customer.type];
        typeBadge.classList.remove('hidden');
    } else {
        typeBadge.classList.add('hidden');
    }
    document.getElementById('browseDistrictAddress' + suffix).textContent = customer.address || '';

    // Load jobs for this customer
    var schoolListEl = document.getElementById('browseSchoolList' + suffix);
    var schoolCountEl = document.getElementById('browseSchoolCount' + suffix);
    schoolListEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #6c757d;">Loading locations...</div>';

    try {
        var jobsData = await JobsAPI.list({ q: customer.name, limit: 500 });
        browseJobsCache[customerId] = jobsData.jobs || [];
    } catch (err) {
        console.error('Failed to load jobs for customer:', err);
        browseJobsCache[customerId] = [];
    }

    var locations = customer.locations || [];
    var jobs = browseJobsCache[customerId] || [];

    schoolCountEl.textContent = locations.length + ' location' + (locations.length !== 1 ? 's' : '');

    if (locations.length === 0) {
        schoolListEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #6c757d;">No locations found for this district.</div>';
        return;
    }

    schoolListEl.innerHTML = locations.map(function(loc) {
        var locJobs = getJobsForLocation(jobs, loc);
        var jobCount = locJobs.length;
        var jobBg = jobCount > 0 ? '#e8f5e9' : '#f8f9fa';
        var jobColor = jobCount > 0 ? '#2e7d32' : '#6c757d';

        return '<div class="browse-school-item" onclick="browseDrillSchool(\'' + customerId + '\', \'' + loc.id + '\')">' +
            '<div style="flex: 1; min-width: 0;">' +
                '<div style="font-weight: 600; font-size: 15px;">' + escapeHtml(loc.name) + '</div>' +
                '<div style="font-size: 13px; color: #6c757d; margin-top: 2px;">' + escapeHtml(loc.address || '') + '</div>' +
            '</div>' +
            '<div style="display: flex; align-items: center; gap: 12px;">' +
                (jobCount > 0 ? '<span class="badge" style="background: ' + jobBg + '; color: ' + jobColor + ';">' + jobCount + ' job' + (jobCount !== 1 ? 's' : '') + '</span>' : '') +
                '<span style="font-size: 18px; color: #ccc;">\u203a</span>' +
            '</div>' +
        '</div>';
    }).join('');
}

function getJobsForLocation(allCustomerJobs, location) {
    return allCustomerJobs.filter(function(job) {
        // Match by location name (primary match)
        if (job.locationName && location.name) {
            return job.locationName.toLowerCase() === location.name.toLowerCase();
        }
        return false;
    });
}

// ==========================================
// SCREEN 3: SCHOOL DETAIL (JOBS TABLE)
// ==========================================

async function browseDrillSchool(customerId, locationId, isBack) {
    if (!isBack) {
        browseNavStack.push({ screen: 'school', data: { customerId: customerId, locationId: locationId } });
    }
    browseShowScreen(3);

    var suffix = getSuffix();
    var customer = browseCustomersCache.find(function(c) { return c.id == customerId; });
    if (!customer) return;

    var location = (customer.locations || []).find(function(l) { return l.id == locationId; });
    if (!location) return;

    // Header
    document.getElementById('browseSchoolName' + suffix).textContent = location.name || '';
    document.getElementById('browseSchoolAddress' + suffix).textContent = location.address || '';

    // Contact info
    var contactEl = document.getElementById('browseSchoolContact' + suffix);
    var contact = getPrimaryContact(location.contacts);
    if (contact && contact.name) {
        contactEl.innerHTML =
            '<div style="font-size: 13px; color: #495057;">' +
                '<strong>' + escapeHtml(contact.name) + '</strong>' +
                (contact.phone ? ' &bull; ' + escapeHtml(contact.phone) : '') +
                (contact.email ? ' &bull; ' + escapeHtml(contact.email) : '') +
            '</div>';
    } else {
        contactEl.innerHTML = '';
    }

    // Store customer context for Add New Job
    window._browseCurrentCustomer = customer;
    window._browseCurrentLocation = location;

    // Get jobs for this location
    var allJobs = browseJobsCache[customerId] || [];
    var locationJobs = getJobsForLocation(allJobs, location);

    // Sort by most recent
    locationJobs.sort(function(a, b) {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    renderSchoolJobsTable(locationJobs, suffix);
}

function renderSchoolJobsTable(jobs, suffix) {
    var tableEl = document.getElementById('browseJobsTable' + suffix);
    var countEl = document.getElementById('browseJobCount' + suffix);

    countEl.textContent = jobs.length + ' job' + (jobs.length !== 1 ? 's' : '');

    if (jobs.length === 0) {
        tableEl.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">No jobs found for this location.</div>';
        return;
    }

    var statusColors = {
        draft: { bg: '#f8f9fa', color: '#6c757d' },
        scheduled: { bg: '#e3f2fd', color: '#1565c0' },
        in_progress: { bg: '#fff3e0', color: '#e65100' },
        completed: { bg: '#c8e6c9', color: '#2e7d32' },
        unable_to_complete: { bg: '#ffcdd2', color: '#c62828' },
        cancelled: { bg: '#f5f5f5', color: '#9e9e9e' }
    };

    var rows = jobs.map(function(job) {
        var sc = statusColors[job.status] || statusColors.draft;
        var desc = (job.description || job.title || '').substring(0, 100);
        if ((job.description || job.title || '').length > 100) desc += '...';
        var jobType = (job.jobType || '').replace('_', ' ');
        var clickHandler = job.jobType === 'inspection' ?
            'browseDrillJob(' + job.id + ')' :
            'browseViewJobDetail(' + job.id + ')';

        return '<tr onclick="' + clickHandler + '">' +
            '<td><strong style="color: #007bff;">' + (job.jobNumber || '') + '</strong></td>' +
            '<td><span class="badge badge-secondary" style="text-transform: capitalize;">' + jobType + '</span></td>' +
            '<td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + escapeHtml(desc) + '</td>' +
            '<td><span class="badge" style="background: ' + sc.bg + '; color: ' + sc.color + ';">' + (job.status || '').replace('_', ' ') + '</span></td>' +
            '<td class="browse-hide-mobile">' + escapeHtml(job.assignedTo || '') + '</td>' +
        '</tr>';
    }).join('');

    tableEl.innerHTML =
        '<table class="browse-jobs-table">' +
            '<thead><tr>' +
                '<th>Job No.</th>' +
                '<th>Type</th>' +
                '<th>Description</th>' +
                '<th>Status</th>' +
                '<th class="browse-hide-mobile">Assigned To</th>' +
            '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
        '</table>';
}

function browseViewJobDetail(jobId) {
    var backView = browseContext === 'office' ? 'officeSearch' : 'search';
    viewWorkOrderDetail(jobId, backView);
}

// ==========================================
// SCREEN 4: INSPECTION JOB — BANK CARDS
// ==========================================

async function browseDrillJob(jobId, isBack) {
    if (!isBack) {
        browseNavStack.push({ screen: 'job', data: { jobId: jobId } });
    }
    browseShowScreen(4);

    var suffix = getSuffix();
    var titleEl = document.getElementById('browseJobTitle' + suffix);
    var typeBadgeEl = document.getElementById('browseJobTypeBadge' + suffix);
    var statusBadgeEl = document.getElementById('browseJobStatusBadge' + suffix);
    var infoEl = document.getElementById('browseJobInfo' + suffix);
    var cardsEl = document.getElementById('browseBankCards' + suffix);

    titleEl.textContent = 'Loading...';
    cardsEl.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">Loading job details...</div>';

    try {
        var jobData = await JobsAPI.get(jobId);
        var job = jobData.job || jobData;
        window._browseCurrentJob = job;

        // Header
        titleEl.textContent = 'Job ' + (job.jobNumber || job.id);
        typeBadgeEl.textContent = (job.jobType || '').replace('_', ' ');
        typeBadgeEl.style.textTransform = 'capitalize';

        var statusColors = {
            draft: { bg: '#f8f9fa', color: '#6c757d' },
            scheduled: { bg: '#e3f2fd', color: '#1565c0' },
            in_progress: { bg: '#fff3e0', color: '#e65100' },
            completed: { bg: '#c8e6c9', color: '#2e7d32' },
            unable_to_complete: { bg: '#ffcdd2', color: '#c62828' }
        };
        var sc = statusColors[job.status] || statusColors.draft;
        statusBadgeEl.textContent = (job.status || '').replace('_', ' ');
        statusBadgeEl.style.background = sc.bg;
        statusBadgeEl.style.color = sc.color;

        infoEl.innerHTML =
            (job.customerName ? '<span>' + escapeHtml(job.customerName) + '</span>' : '') +
            (job.locationName ? ' &bull; <span>' + escapeHtml(job.locationName) + '</span>' : '') +
            (job.address ? '<div style="font-size: 12px; margin-top: 4px;">' + escapeHtml(job.address) + '</div>' : '');

        // Render bank cards
        var banks = job.inspectionBanks || [];
        renderBrowseBankCards(banks, jobId, suffix);

    } catch (err) {
        console.error('Failed to load job:', err);
        cardsEl.innerHTML = '<div style="text-align: center; padding: 40px; color: #dc3545;">Failed to load job details.</div>';
    }
}

function renderBrowseBankCards(banks, jobId, suffix) {
    var cardsEl = document.getElementById('browseBankCards' + suffix);

    if (banks.length === 0) {
        cardsEl.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">' +
            '<p style="font-size: 15px; margin-bottom: 16px;">No inspection banks yet.</p>' +
            '<p style="font-size: 13px;">Click "+ Add Bank" to start an inspection.</p>' +
        '</div>';
        return;
    }

    cardsEl.innerHTML = banks.map(function(bank, idx) {
        var issues = bank.issues || [];
        var issueCount = issues.length;
        var hasSafety = issues.some(function(i) { return i.severity === 'safety' || i.category === 'safety'; });
        var status = bank.status || 'not_started';

        var statusLabel, statusBg, statusColor, cardClass;
        if (status === 'completed' || status === 'Completed') {
            statusLabel = 'Completed';
            statusBg = '#c8e6c9';
            statusColor = '#2e7d32';
            cardClass = 'completed';
        } else if (status === 'in_progress' || status === 'In Progress') {
            statusLabel = 'In Progress';
            statusBg = '#fff3cd';
            statusColor = '#856404';
            cardClass = 'in-progress';
        } else {
            statusLabel = 'Not Started';
            statusBg = '#f8f9fa';
            statusColor = '#6c757d';
            cardClass = '';
        }

        var issuesBadge = '';
        if (issueCount > 0) {
            var issueBg = hasSafety ? '#ffcdd2' : '#fff3e0';
            var issueColor = hasSafety ? '#c62828' : '#e65100';
            issuesBadge = '<span style="display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; background: ' + issueBg + '; color: ' + issueColor + ';">' +
                issueCount + ' issue' + (issueCount !== 1 ? 's' : '') +
                (hasSafety ? ' (SAFETY)' : '') +
            '</span>';
        }

        return '<div class="browse-bank-card ' + cardClass + '" onclick="browseOpenBankDetail(' + jobId + ', ' + bank.id + ')">' +
            '<div class="browse-bank-status" style="background: ' + statusBg + '; color: ' + statusColor + ';">' + statusLabel + '</div>' +
            '<div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">' + escapeHtml(bank.bankName || 'Bank ' + (idx + 1)) + '</div>' +
            '<div style="font-size: 13px; color: #6c757d; margin-bottom: 8px;">' + escapeHtml(bank.bleacherType || '') + '</div>' +
            (issuesBadge ? '<div style="margin-top: 4px;">' + issuesBadge + '</div>' : '') +
        '</div>';
    }).join('');
}

function browseOpenBankDetail(jobId, bankId) {
    // Navigate to the work order detail which shows inspection banks
    var backView = browseContext === 'office' ? 'officeSearch' : 'search';
    viewWorkOrderDetail(jobId, backView);
}

function browseViewFullJobDetail() {
    var job = window._browseCurrentJob;
    if (!job) return;
    var backView = browseContext === 'office' ? 'officeSearch' : 'search';
    viewWorkOrderDetail(job.id, backView);
}

function browseAddBank() {
    var job = window._browseCurrentJob;
    if (!job) return;
    // Navigate to full job detail where banks can be managed
    var backView = browseContext === 'office' ? 'officeSearch' : 'search';
    viewWorkOrderDetail(job.id, backView);
}

// ==========================================
// ADD NEW JOB FROM CONTEXT
// ==========================================

function browseAddNewJob() {
    var customer = window._browseCurrentCustomer;
    var location = window._browseCurrentLocation;
    if (!customer || !location) {
        alert('No location context available.');
        return;
    }

    var suffix = getSuffix();
    var modalEl = document.getElementById('browseNewJobModal' + suffix);
    var contextEl = document.getElementById('browseNewJobContext' + suffix);
    if (contextEl) {
        contextEl.textContent = customer.name + ' — ' + location.name;
    }
    if (modalEl) {
        modalEl.classList.remove('hidden');
    }
}

function closeBrowseNewJobModal() {
    var suffix = getSuffix();
    var modalEl = document.getElementById('browseNewJobModal' + suffix);
    if (modalEl) {
        modalEl.classList.add('hidden');
    }
}

async function browseCreateJob(jobType) {
    closeBrowseNewJobModal();

    var customer = window._browseCurrentCustomer;
    var location = window._browseCurrentLocation;
    if (!customer || !location) return;

    var contact = getPrimaryContact(location.contacts);

    if (jobType === 'inspection') {
        // Launch existing inspection flow with pre-filled data
        var nextNum = parseInt(localStorage.getItem('nextJobNumber') || '20000');
        if (nextNum < 20000) nextNum = 20000;
        window.currentJob = {
            jobNumber: nextNum,
            banks: [],
            selectedParts: [],
            status: 'in_progress',
            createdAt: new Date().toISOString(),
            customerId: customer.id,
            customerName: customer.name,
            locationId: location.id,
            locationName: location.name,
            locationAddress: location.address || ''
        };
        localStorage.setItem('nextJobNumber', '' + (nextNum + 1));
        window.currentBankIndex = 0;
        window.currentJob.banks.push(createNewBank('East Side'));

        // Show inspection form
        if (browseContext === 'field') {
            showTechView('inspectionForm');
        } else {
            showBankInspection();
        }
    } else {
        // Navigate to create form with pre-filled customer/location
        var prefilledCustomer = {
            locationId: location.id,
            customerId: customer.id,
            customerName: customer.name,
            locationName: location.name,
            address: location.address || '',
            contact: (contact && contact.name) || '',
            phone: (contact && contact.phone) || ''
        };

        if (browseContext === 'office') {
            showView('officeCreate');
            setTimeout(function() {
                if (typeof initOfficeCreateForm === 'function') initOfficeCreateForm();
                var typeSelect = document.getElementById('officeCreateTypeSelect');
                if (typeSelect) {
                    typeSelect.value = jobType;
                    if (typeof onOfficeCreateTypeChange === 'function') onOfficeCreateTypeChange();
                }
                if (typeof selectOfficeCreateCustomer === 'function') {
                    selectOfficeCreateCustomer(prefilledCustomer);
                }
            }, 100);
        } else {
            showTechView('fieldCreate');
            setTimeout(function() {
                if (typeof initFieldCreateForm === 'function') initFieldCreateForm();
                var typeSelect = document.getElementById('fieldCreateTypeSelect');
                if (typeSelect) {
                    typeSelect.value = jobType;
                    if (typeof onFieldCreateTypeChange === 'function') onFieldCreateTypeChange();
                }
                if (typeof selectFieldCreateCustomer === 'function') {
                    selectFieldCreateCustomer(prefilledCustomer);
                }
            }, 100);
        }
    }
}

// ==========================================
// SEARCH INTEGRATION
// ==========================================

function handleBrowseSearch(context) {
    var inputId = context === 'office' ? 'officeSearchInput' : 'techSearchInput';
    var query = document.getElementById(inputId).value.trim();
    var suffix = context === 'office' ? 'Office' : 'Tech';

    // Only toggle on Screen 1
    if (browseNavStack.length === 1 && browseNavStack[0].screen === 'districts') {
        if (!query || query.length < 2) {
            // Show browse list, hide search results
            var browseList = document.getElementById('browseListing' + suffix);
            var searchResults = document.getElementById(context === 'office' ? 'officeSearchResults' : 'techSearchResults');
            if (browseList) browseList.classList.remove('hidden');
            if (searchResults) {
                searchResults.classList.add('hidden');
                searchResults.innerHTML = '';
            }
            filterBrowseDistricts(query);
            return;
        }

        // Hide browse list, show search results
        var browseList2 = document.getElementById('browseListing' + suffix);
        var searchResults2 = document.getElementById(context === 'office' ? 'officeSearchResults' : 'techSearchResults');
        if (browseList2) browseList2.classList.add('hidden');
        if (searchResults2) searchResults2.classList.remove('hidden');

        // Delegate to existing search
        if (context === 'office') {
            performOfficeSearch();
        } else {
            performTechSearch();
        }
    } else {
        // In a sub-screen, just run normal search
        if (context === 'office') {
            performOfficeSearch();
        } else {
            performTechSearch();
        }
    }
}

// ==========================================
// HELPERS
// ==========================================

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Make functions globally available
window.initBrowse = initBrowse;
window.browseBack = browseBack;
window.browseDrillDistrict = browseDrillDistrict;
window.browseDrillSchool = browseDrillSchool;
window.browseDrillJob = browseDrillJob;
window.browseAddNewJob = browseAddNewJob;
window.closeBrowseNewJobModal = closeBrowseNewJobModal;
window.browseCreateJob = browseCreateJob;
window.browseViewJobDetail = browseViewJobDetail;
window.browseViewFullJobDetail = browseViewFullJobDetail;
window.browseAddBank = browseAddBank;
window.browseOpenBankDetail = browseOpenBankDetail;
window.handleBrowseSearch = handleBrowseSearch;
