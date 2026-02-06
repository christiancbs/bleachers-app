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
        // Defer showing pipeline to next frame to ensure DOM is painted
        requestAnimationFrame(function() {
            showView('salesPipeline'); // Default to Sales Pipeline
        });
    } else {
        document.getElementById('techDashboard').classList.remove('hidden');
        loadTechDashboard();
        showTechView('myjobs'); // Default to My Jobs view
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
    if (view === 'officeSearch') {
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
        console.log('showView: Project Tracker');
        var projectsView = document.getElementById('projectsView');
        console.log('projectsView element:', projectsView);
        projectsView.classList.remove('hidden');
        setActiveNav('projects');
        // Call loadPipeline directly (renamed in v3 but keeping function name for now)
        console.log('About to call loadPipeline (Project Tracker)');
        loadPipeline();
        console.log('loadPipeline called');
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

    if (view === 'search') {
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
        console.log('fieldCreate view element:', fieldView);
        if (fieldView) {
            fieldView.classList.remove('hidden');
            console.log('Removed hidden class from fieldCreateView');
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

function initCreateForm() {
    // Populate customer dropdown
    var select = document.getElementById('createCustomerSelect');
    var html = '<option value="">Select a customer...</option>';
    CUSTOMERS.forEach(function(cust) {
        cust.locations.forEach(function(loc) {
            var locContact = getPrimaryContact(loc.contacts);
            html += '<option value="' + loc.id + '" data-customer-id="' + cust.id + '" data-customer-name="' + cust.name + '" data-location-name="' + loc.name + '" data-location-address="' + loc.address + '" data-contact="' + (locContact.name || '') + '" data-phone="' + (locContact.phone || '') + '">  ' + loc.name + ' (' + cust.name + ')</option>';
        });
    });
    select.innerHTML = html;

    // Reset all fields
    document.getElementById('createTypeSelect').value = '';
    document.getElementById('createCustomerSelect').value = '';
    document.getElementById('createCustomerInfo').classList.add('hidden');
    document.getElementById('createFormFields').classList.add('hidden');
    document.getElementById('createSubmitBtn').classList.add('hidden');
    document.getElementById('createInspectionFields').classList.add('hidden');
    document.getElementById('createWorkOrderFields').classList.add('hidden');
    document.getElementById('createDescriptionGroup').classList.add('hidden');
    document.getElementById('createPhotoGroup').classList.add('hidden');
    document.getElementById('createNotes').value = '';
    var descEl = document.getElementById('createDescription');
    if (descEl) descEl.value = '';
    document.getElementById('createPhotoPreview').innerHTML = '';
    createPhoto = null;
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
    document.getElementById('createWorkOrderFields').classList.add('hidden');
    document.getElementById('createDescriptionGroup').classList.add('hidden');
    document.getElementById('createPhotoGroup').classList.add('hidden');

    var btn = document.getElementById('createSubmitBtn');

    if (type === 'inspection') {
        document.getElementById('createInspectionFields').classList.remove('hidden');
        document.getElementById('createJobNumber').value = nextJobNumber;
        document.getElementById('createJobDate').value = new Date().toISOString().split('T')[0];
        btn.textContent = 'Create Inspection';
    } else if (type === 'work_order') {
        document.getElementById('createWorkOrderFields').classList.remove('hidden');
        document.getElementById('createDescriptionGroup').classList.remove('hidden');
        document.getElementById('createPhotoGroup').classList.remove('hidden');
        document.getElementById('createDescription').placeholder = 'What needs to be done...';
        btn.textContent = 'Create Work Order';
    } else if (type === 'parts_spec') {
        document.getElementById('createDescriptionGroup').classList.remove('hidden');
        document.getElementById('createPhotoGroup').classList.remove('hidden');
        document.getElementById('createDescription').placeholder = 'What parts are needed for...';
        btn.textContent = 'Create Parts Spec';
    }
}

function updateCreateCustomerInfo() {
    var select = document.getElementById('createCustomerSelect');
    var locId = select.value;
    var infoEl = document.getElementById('createCustomerInfo');
    if (!locId) { infoEl.classList.add('hidden'); return; }
    var option = select.options[select.selectedIndex];
    var address = option.dataset.locationAddress || '';
    var contact = option.dataset.contact || '';
    var phone = option.dataset.phone || '';
    document.getElementById('createAddress').textContent = address;
    document.getElementById('createContact').textContent = contact + (phone ? ' - ' + phone : '');
    infoEl.classList.remove('hidden');
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
    var select = document.getElementById('createCustomerSelect');
    var locId = select.value;

    if (!locId) { alert('Please select a customer.'); return; }

    var option = select.options[select.selectedIndex];
    var locationName = option.dataset.locationName || '';
    var customerName = option.dataset.customerName || '';
    var address = option.dataset.locationAddress || '';
    var customerId = option.dataset.customerId || '';

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

    } else if (type === 'work_order') {
        var desc = document.getElementById('createDescription').value.trim();
        if (!desc) { alert('Please add a description.'); return; }

        var jobType = document.getElementById('createWoJobType').value;
        var notes = document.getElementById('createNotes').value.trim();

        var nextNum = parseInt(localStorage.getItem('nextJobNumber') || '17500');
        var jobNumber = '' + nextNum;
        localStorage.setItem('nextJobNumber', '' + (nextNum + 1));

        var key = 'wo_' + jobNumber;
        TECH_WORK_ORDERS[key] = {
            jobNumber: jobNumber,
            jobType: jobType,
            locationName: locationName,
            address: address,
            contactName: '',
            contactPhone: '',
            description: desc,
            partsLocation: '',
            specialInstructions: notes,
            scheduledTime: ''
        };

        alert('Work Order #' + jobNumber + ' created for ' + locationName);
        showTechView('create');

    } else if (type === 'parts_spec') {
        var desc = document.getElementById('createDescription').value.trim();
        if (!desc) { alert('Please add a description.'); return; }

        var nextNum = parseInt(localStorage.getItem('nextJobNumber') || '17500');
        var jobNumber = '' + nextNum;
        localStorage.setItem('nextJobNumber', '' + (nextNum + 1));

        alert('Parts Spec #' + jobNumber + ' created for ' + locationName);
        showTechView('create');
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
