// ==========================================
// APP CORE
// Init, routing, auth, sidebar, navigation
// ==========================================

// Initialize
function init() {
    populateCustomers();
    if (typeof populateJobCustomers === 'function') {
        populateJobCustomers();
    }
    populateCategories();
    updateDashboardStats();

    // Load sample data if no jobs exist
    if (inspectionJobs.length === 0) {
        inspectionJobs = [...SAMPLE_INSPECTION_JOBS];
        localStorage.setItem('inspectionJobs', JSON.stringify(inspectionJobs));
    }

    loadInspectionJobs();
    updateOpsReviewBadge();
}

function populateCustomers() {
    const select = document.getElementById('customerSelect');
    if (select) {
        // Group locations by customer (county/private entity)
        CUSTOMERS.forEach(customer => {
            const optgroup = document.createElement('optgroup');
            const typeLabel = customer.type === 'county' ? '🏛️' : '🏫';
            optgroup.label = `${typeLabel} ${customer.name}`;

            customer.locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location.id;
                option.dataset.customerId = customer.id;
                option.dataset.customerName = customer.name;
                option.dataset.customerType = customer.type;
                option.textContent = location.name;
                optgroup.appendChild(option);
            });

            select.appendChild(optgroup);
        });
    }
}

async function populateCategories() {
    const select = document.getElementById('vendorFilter');
    if (!select) return;

    // Predefined categories from our cleaned data
    partsCategories = [
        'Controls & Safety',
        'Flex Row Parts',
        'Frames & Supports',
        'Hardware',
        'Lumber & Decking',
        'Other',
        'Panels & Closures',
        'Portable & Skids',
        'Power & Electrical',
        'Rails & Steps',
        'Rollout Parts',
        'Seating',
        'Stanchions',
        'Tools',
        'Wheels & Bearings'
    ];

    partsCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

function updateDashboardStats() {
    const totalInspectionsEl = document.getElementById('totalInspections');
    const totalJobsEl = document.getElementById('totalJobs');
    const techInspectionsCountEl = document.getElementById('techInspectionsCount');

    if (totalInspectionsEl) totalInspectionsEl.textContent = inspections.length;
    if (totalJobsEl) totalJobsEl.textContent = jobs.length;
    if (techInspectionsCountEl) techInspectionsCountEl.textContent = inspections.length;
}

// Navigation
function login(role) {
    currentRole = role;
    document.getElementById('loginScreen').classList.add('hidden');

    if (role === 'office' || role === 'admin') {
        document.getElementById('officeDashboard').classList.remove('hidden');
        // Show/hide admin nav section
        var adminNav = document.getElementById('adminNavSection');
        if (adminNav) {
            if (role === 'admin') {
                adminNav.classList.remove('hidden');
                document.getElementById('officeUserAvatar').textContent = 'AD';
                document.getElementById('officeUserName').textContent = 'Admin';
            } else {
                adminNav.classList.add('hidden');
                document.getElementById('officeUserAvatar').textContent = 'OM';
                document.getElementById('officeUserName').textContent = 'Office Manager';
            }
        } else {
            // No admin nav section, just update user info
            if (role === 'admin') {
                document.getElementById('officeUserAvatar').textContent = 'AD';
                document.getElementById('officeUserName').textContent = 'Admin';
            } else {
                document.getElementById('officeUserAvatar').textContent = 'OM';
                document.getElementById('officeUserName').textContent = 'Office Manager';
            }
        }
        loadOfficeDashboard();
        // Defer showing home to next frame to ensure DOM is painted
        requestAnimationFrame(function() {
            showView('home'); // Default to Home
        });
    } else {
        document.getElementById('techDashboard').classList.remove('hidden');
        loadTechDashboard();
        showTechView('home'); // Default to Home view
    }
}

function toggleSidebar(sidebarId) {
    var sidebar = document.getElementById(sidebarId);
    // On mobile, clicking sidebar header should close the menu instead of collapsing
    if (window.innerWidth <= 768) {
        closeMobileMenu(sidebarId);
        return;
    }
    sidebar.classList.toggle('collapsed');
}

function toggleMobileMenu(sidebarId) {
    var sidebar = document.getElementById(sidebarId);
    var backdropId = sidebarId + 'Backdrop';
    var backdrop = document.getElementById(backdropId);
    if (sidebar.classList.contains('mobile-open')) {
        closeMobileMenu(sidebarId);
    } else {
        sidebar.classList.add('mobile-open');
        backdrop.classList.add('visible');
    }
}

function closeMobileMenu(sidebarId) {
    var sidebar = document.getElementById(sidebarId);
    var backdropId = sidebarId + 'Backdrop';
    var backdrop = document.getElementById(backdropId);
    sidebar.classList.remove('mobile-open');
    backdrop.classList.remove('visible');
}

function logout() {
    currentRole = '';
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('officeDashboard').classList.add('hidden');
    document.getElementById('techDashboard').classList.add('hidden');
    const adminNav = document.getElementById('adminNavSection');
    if (adminNav) {
        adminNav.classList.add('hidden');
    }
}

function showView(view) {
    // Close mobile menu if open
    closeMobileMenu('officeSidebar');

    // Hide all views
    document.querySelectorAll('[id$="View"]').forEach(el => el.classList.add('hidden'));

    // Update nav active state - remove active from all, add to matching data-view
    document.querySelectorAll('#officeDashboard .nav-item').forEach(el => el.classList.remove('active'));

    // Helper to set active nav by data-view attribute
    function setActiveNav(viewName) {
        var navItem = document.querySelector('#officeDashboard .nav-item[data-view="' + viewName + '"]');
        if (navItem) navItem.classList.add('active');
    }

    // Show selected view and update nav
    if (view === 'home') {
        document.getElementById('homeView').classList.remove('hidden');
        setActiveNav('home');
        loadHome();
    } else if (view === 'officeSearch') {
        document.getElementById('officeSearchView').classList.remove('hidden');
        setActiveNav('officeSearch');
    } else if (view === 'dashboard') {
        document.getElementById('dashboardView').classList.remove('hidden');
        setActiveNav('dashboard');
    } else if (view === 'estimates') {
        document.getElementById('estimatesView').classList.remove('hidden');
        setActiveNav('estimates');
        loadEstimates();
    } else if (view === 'salesPipeline') {
        document.getElementById('salesPipelineView').classList.remove('hidden');
        setActiveNav('salesPipeline');
        loadSalesPipeline();
    } else if (view === 'projects') {
        var projectsView = document.getElementById('projectsView');
        projectsView.classList.remove('hidden');
        setActiveNav('projects');
        loadPipeline();
    } else if (view === 'accounts') {
        document.getElementById('accountsView').classList.remove('hidden');
        setActiveNav('accounts');
        loadAccounts();
    } else if (view === 'parts') {
        document.getElementById('partsView').classList.remove('hidden');
        setActiveNav('parts');
    } else if (view === 'partsOrders') {
        document.getElementById('partsOrdersView').classList.remove('hidden');
        setActiveNav('partsOrders');
    } else if (view === 'shipping') {
        document.getElementById('shippingView').classList.remove('hidden');
        setActiveNav('shipping');
    } else if (view === 'opsReview') {
        document.getElementById('opsReviewView').classList.remove('hidden');
        setActiveNav('opsReview');
        loadOpsReview();
    } else if (view === 'opsReviewDetail') {
        document.getElementById('opsReviewDetailView').classList.remove('hidden');
        setActiveNav('opsReview');
    } else if (view === 'jobs') {
        document.getElementById('jobsView').classList.remove('hidden');
        setActiveNav('jobs');
        loadOfficeJobs();
    } else if (view === 'scheduling') {
        document.getElementById('schedulingView').classList.remove('hidden');
        setActiveNav('scheduling');
        loadSchedule();
    } else if (view === 'officeCreate') {
        document.getElementById('officeCreateView').classList.remove('hidden');
        setActiveNav('officeCreate');
        initOfficeCreateForm();
    } else if (view === 'estimateDetail') {
        document.getElementById('estimateDetailView').classList.remove('hidden');
        setActiveNav('estimates');
    } else if (view === 'workOrderDetail') {
        document.getElementById('workOrderDetailView').classList.remove('hidden');
        setActiveNav('opsReview');
    } else if (view === 'customerDetail') {
        document.getElementById('customerDetailView').classList.remove('hidden');
        setActiveNav('accounts');
    } else if (view === 'inspections') {
        document.getElementById('officeInspectionsView').classList.remove('hidden');
        setActiveNav('opsReview');
        loadOfficeInspections();
    } else if (view === 'workorders') {
        document.getElementById('officeWorkOrdersView').classList.remove('hidden');
        setActiveNav('opsReview');
    } else if (view === 'employees') {
        document.getElementById('employeesView').classList.remove('hidden');
        setActiveNav('employees');
        loadEmployees();
    } else if (view === 'settings') {
        document.getElementById('settingsView').classList.remove('hidden');
        setActiveNav('settings');
        loadSettings();
    }
}

function showTechView(view) {
    // Close mobile menu if open
    closeMobileMenu('techSidebar');

    // Hide all tech views including new inspection views
    document.querySelectorAll('#techDashboard [id^="tech"][id$="View"]').forEach(el => el.classList.add('hidden'));
    document.getElementById('newJobSetupView')?.classList.add('hidden');
    document.getElementById('bankInspectionView')?.classList.add('hidden');
    document.getElementById('jobSummaryView')?.classList.add('hidden');
    document.getElementById('newInspectionView')?.classList.add('hidden');
    document.getElementById('fieldCreateView')?.classList.add('hidden');
    document.querySelectorAll('#techDashboard .nav-item').forEach(el => el.classList.remove('active'));

    // Helper to set active nav by data-view attribute
    function setActiveNav(viewName) {
        var navItem = document.querySelector('#techDashboard .nav-item[data-view="' + viewName + '"]');
        if (navItem) navItem.classList.add('active');
    }

    if (view === 'home') {
        document.getElementById('techHomeView').classList.remove('hidden');
        setActiveNav('home');
        loadTechHome();
    } else if (view === 'search') {
        document.getElementById('techSearchView').classList.remove('hidden');
        setActiveNav('search');
    } else if (view === 'teamschedule') {
        document.getElementById('techTeamScheduleView').classList.remove('hidden');
        setActiveNav('teamschedule');
        loadTeamSchedule();
    } else if (view === 'myjobs' || view === 'dashboard') {
        document.getElementById('techMyJobsView').classList.remove('hidden');
        setActiveNav('myjobs');
        loadMyJobs();
    } else if (view === 'fieldCreate') {
        var fieldView = document.getElementById('fieldCreateView');
        if (fieldView) {
            fieldView.classList.remove('hidden');
        }
        setActiveNav('myjobs');
        initFieldCreateForm();
    } else if (view === 'create') {
        document.getElementById('techCreateView').classList.remove('hidden');
        setActiveNav('create');
        initCreateForm();
    } else if (view === 'inspections') {
        document.getElementById('techInspectionsView').classList.remove('hidden');
        setActiveNav('create');
        loadInspectionJobs();
        loadTechInspections();
    } else if (view === 'parts') {
        document.getElementById('techPartsView').classList.remove('hidden');
        setActiveNav('parts');
    } else if (view === 'workorders') {
        document.getElementById('techWorkOrdersView').classList.remove('hidden');
        setActiveNav('create');
    } else if (view === 'workorderdetail') {
        document.getElementById('techWorkOrderDetailView').classList.remove('hidden');
        setActiveNav('create');
    } else if (view === 'settings') {
        document.getElementById('techSettingsView').classList.remove('hidden');
        setActiveNav('settings');
        loadTechSettings();
    }
}

// Unified Create form functions
let createPhoto = null;
let createSelectedCustomer = null;

function initCreateForm() {
    // Reset all fields
    document.getElementById('createTypeSelect').value = '';
    document.getElementById('createCustomerSearch').value = '';
    document.getElementById('createCustomerId').value = '';
    document.getElementById('createLocationId').value = '';
    document.getElementById('createCustomerResults').classList.add('hidden');
    document.getElementById('createCustomerInfo').classList.add('hidden');
    document.getElementById('createFormFields').classList.add('hidden');
    document.getElementById('createSubmitBtn').classList.add('hidden');
    document.getElementById('createInspectionFields').classList.add('hidden');
    document.getElementById('createCustomFields').classList.add('hidden');
    document.getElementById('createDescriptionGroup').classList.add('hidden');
    document.getElementById('createPhotoGroup').classList.add('hidden');
    document.getElementById('createNotes').value = '';
    var descEl = document.getElementById('createDescription');
    if (descEl) descEl.value = '';
    var customEl = document.getElementById('createCustomName');
    if (customEl) customEl.value = '';
    document.getElementById('createPhotoPreview').innerHTML = '';
    createPhoto = null;
    createSelectedCustomer = null;
}

function searchCreateCustomers(query) {
    var resultsEl = document.getElementById('createCustomerResults');
    if (!query || query.length < 2) {
        resultsEl.classList.add('hidden');
        return;
    }

    var q = query.toLowerCase();
    var matches = [];

    if (typeof CUSTOMERS !== 'undefined' && CUSTOMERS.length > 0) {
        CUSTOMERS.forEach(function(cust) {
            cust.locations.forEach(function(loc) {
                var searchText = (loc.name + ' ' + cust.name + ' ' + (loc.address || '')).toLowerCase();
                if (searchText.includes(q)) {
                    var locContact = getPrimaryContact(loc.contacts);
                    matches.push({
                        locationId: loc.id,
                        customerId: cust.id,
                        customerName: cust.name,
                        locationName: loc.name,
                        address: loc.address || '',
                        contact: locContact.name || '',
                        phone: locContact.phone || ''
                    });
                }
            });
        });
    }

    var html = '';
    if (matches.length > 0) {
        html = matches.slice(0, 8).map(function(m) {
            return '<div class="customer-result-item" onclick=\'selectCreateCustomer(' + JSON.stringify(m) + ')\'>' +
                '<strong>' + m.customerName + '</strong>' +
                (m.locationName !== m.customerName ? ' <span style="color: #6c757d;">- ' + m.locationName + '</span>' : '') +
                '<div style="font-size: 12px; color: #6c757d;">' + m.address + '</div>' +
            '</div>';
        }).join('');
    }

    // Always add custom entry option
    html += '<div class="customer-result-item" onclick="showCustomCustomerEntry()" style="border-top: 2px solid #dee2e6; background: #f8f9fa;">' +
        '<strong style="color: #007bff;">+ Enter Custom Customer</strong>' +
        '<div style="font-size: 12px; color: #6c757d;">Not in the list? Add manually</div>' +
    '</div>';

    resultsEl.innerHTML = html;
    resultsEl.classList.remove('hidden');
}

function showCustomCustomerEntry() {
    document.getElementById('createCustomerResults').classList.add('hidden');

    var name = prompt('Enter customer/school name:');
    if (!name) return;

    var address = prompt('Enter address (optional):') || '';

    createSelectedCustomer = {
        locationId: 'custom_' + Date.now(),
        customerId: 'custom_' + Date.now(),
        customerName: name,
        locationName: name,
        address: address,
        contact: '',
        phone: '',
        isCustom: true
    };

    document.getElementById('createCustomerSearch').value = name;
    document.getElementById('createAddress').textContent = address || 'Custom entry';
    document.getElementById('createContact').textContent = '';
    document.getElementById('createCustomerInfo').classList.remove('hidden');
}

function selectCreateCustomer(customer) {
    createSelectedCustomer = customer;
    var displayName = customer.customerName;
    if (customer.locationName && customer.locationName !== customer.customerName) {
        displayName += ' - ' + customer.locationName;
    }
    document.getElementById('createCustomerSearch').value = displayName;
    document.getElementById('createCustomerId').value = customer.customerId;
    document.getElementById('createLocationId').value = customer.locationId;
    document.getElementById('createCustomerResults').classList.add('hidden');

    // Show customer info
    document.getElementById('createAddress').textContent = customer.address;
    document.getElementById('createContact').textContent = customer.contact + (customer.phone ? ' - ' + customer.phone : '');
    document.getElementById('createCustomerInfo').classList.remove('hidden');
}

function onCreateTypeChange() {
    var type = document.getElementById('createTypeSelect').value;
    if (!type) {
        document.getElementById('createFormFields').classList.add('hidden');
        document.getElementById('createSubmitBtn').classList.add('hidden');
        return;
    }

    // Show common fields
    document.getElementById('createFormFields').classList.remove('hidden');
    document.getElementById('createSubmitBtn').classList.remove('hidden');

    // Hide all type-specific fields first
    document.getElementById('createInspectionFields').classList.add('hidden');
    document.getElementById('createCustomFields').classList.add('hidden');
    document.getElementById('createDescriptionGroup').classList.add('hidden');
    document.getElementById('createPhotoGroup').classList.add('hidden');

    var btn = document.getElementById('createSubmitBtn');
    var typeLabels = {
        'inspection': 'Inspection',
        'work_order': 'Work Order',
        'service_call': 'Service Call',
        'go_see': 'Go-See',
        'field_check': 'Field Check',
        'custom': 'Job'
    };

    if (type === 'inspection') {
        document.getElementById('createInspectionFields').classList.remove('hidden');
        document.getElementById('createJobNumber').value = nextJobNumber;
        document.getElementById('createJobDate').value = new Date().toISOString().split('T')[0];
        btn.textContent = 'Create Inspection';
    } else if (type === 'custom') {
        document.getElementById('createCustomFields').classList.remove('hidden');
        document.getElementById('createDescriptionGroup').classList.remove('hidden');
        document.getElementById('createPhotoGroup').classList.remove('hidden');
        document.getElementById('createDescription').placeholder = 'What needs to be done...';
        btn.textContent = 'Create Job';
    } else {
        // work_order, service_call, go_see, field_check
        document.getElementById('createDescriptionGroup').classList.remove('hidden');
        document.getElementById('createPhotoGroup').classList.remove('hidden');
        document.getElementById('createDescription').placeholder = 'What needs to be done...';
        btn.textContent = 'Create ' + typeLabels[type];
    }
}

function handleCreatePhoto(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            createPhoto = e.target.result;
            document.getElementById('createPhotoPreview').innerHTML = '<img src="' + e.target.result + '" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function submitCreate() {
    var type = document.getElementById('createTypeSelect').value;

    if (!createSelectedCustomer) {
        alert('Please select a customer.');
        return;
    }

    var locationName = createSelectedCustomer.locationName;
    var customerName = createSelectedCustomer.customerName;
    var address = createSelectedCustomer.address;
    var customerId = createSelectedCustomer.customerId;
    var locId = createSelectedCustomer.locationId;

    if (type === 'inspection') {
        // Wire into existing inspection flow
        currentJob = {
            jobNumber: nextJobNumber,
            banks: [],
            selectedParts: [],
            status: 'in_progress',
            createdAt: new Date().toISOString()
        };
        currentJob.customerId = customerId;
        currentJob.customerName = customerName;
        currentJob.locationId = locId;
        currentJob.locationName = locationName;
        currentJob.locationAddress = address;
        currentJob.inspectionType = document.getElementById('createInspectionType').value;
        currentJob.inspectionDate = document.getElementById('createJobDate').value;

        nextJobNumber++;
        localStorage.setItem('nextJobNumber', nextJobNumber);

        currentBankIndex = 0;
        currentJob.banks.push(createNewBank('East Side'));
        showBankInspection();

    } else if (type === 'work_order' || type === 'service_call' || type === 'go_see' || type === 'field_check' || type === 'custom') {
        var desc = document.getElementById('createDescription').value.trim();
        if (!desc) { alert('Please add a description.'); return; }

        // For custom type, get the custom name
        var jobType = type;
        if (type === 'custom') {
            var customName = document.getElementById('createCustomName').value.trim();
            if (!customName) { alert('Please enter a custom job name.'); return; }
            jobType = customName;
        }

        var notes = document.getElementById('createNotes').value.trim();

        var nextNum = parseInt(localStorage.getItem('nextJobNumber') || '17500');
        var jobNumber = '' + nextNum;
        localStorage.setItem('nextJobNumber', '' + (nextNum + 1));

        // Create job via API
        var jobData = {
            jobNumber: jobNumber,
            jobType: jobType,
            status: 'draft',
            customerId: customerId,
            customerName: customerName,
            locationId: locId,
            locationName: locationName,
            locationAddress: address,
            description: desc,
            notes: notes,
            createdBy: 'Tech'
        };

        var submitBtn = document.getElementById('createSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';

        JobsAPI.create(jobData)
            .then(function(result) {
                var typeLabel = {
                    'work_order': 'Work Order',
                    'service_call': 'Service Call',
                    'go_see': 'Go-See',
                    'field_check': 'Field Check'
                }[type] || jobType;

                alert(typeLabel + ' #' + jobNumber + ' created!\n\nIt is now in Jobs → Backlog.');
                initCreateForm();
                showTechView('myjobs');
            })
            .catch(function(err) {
                console.error('Failed to create job:', err);
                alert('Failed to create job: ' + err.message);
            })
            .finally(function() {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create';
            });
        return;
    }
}

// Re-render schedules on resize (mobile <-> desktop switch)
var resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        if (document.getElementById('schedulingView') && !document.getElementById('schedulingView').classList.contains('hidden')) {
            renderWeeklySchedule();
            renderPlanningSchedule();
        }
        if (document.getElementById('techTeamScheduleView') && !document.getElementById('techTeamScheduleView').classList.contains('hidden')) {
            renderTeamScheduleGrid();
        }
    }, 250);
});

// Initialize app
init();
