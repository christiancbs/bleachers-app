// ==========================================
// CREATE FORMS
// Office and field staff unified create
// ==========================================

// Global variables for photo storage
var fieldCreatePhoto = null;

function initFieldCreateForm() {
    console.log('initFieldCreateForm called');
    var select = document.getElementById('fieldCreateCustomerSelect');
    if (!select) {
        console.error('fieldCreateCustomerSelect not found');
        return;
    }
    var html = '<option value="">Select a customer...</option>';
    CUSTOMERS.forEach(function(cust) {
        cust.locations.forEach(function(loc) {
            var locContact = getPrimaryContact(loc.contacts);
            html += '<option value="' + loc.id + '" data-customer-id="' + cust.id + '" data-customer-name="' + cust.name + '" data-location-name="' + loc.name + '" data-location-address="' + loc.address + '" data-contact="' + (locContact.name || '') + '" data-phone="' + (locContact.phone || '') + '">  ' + loc.name + ' (' + cust.name + ')</option>';
        });
    });
    select.innerHTML = html;

    // Reset all fields
    document.getElementById('fieldCreateTypeSelect').value = '';
    document.getElementById('fieldCreateCustomerSelect').value = '';
    document.getElementById('fieldCreateCustomerInfo').classList.add('hidden');
    document.getElementById('fieldCreateFormFields').classList.add('hidden');
    document.getElementById('fieldCreateSubmitBtn').classList.add('hidden');
    document.getElementById('fieldCreateInspectionFields').classList.add('hidden');
    document.getElementById('fieldCreateWorkOrderFields').classList.add('hidden');
    document.getElementById('fieldCreateDescriptionGroup').classList.add('hidden');
    document.getElementById('fieldCreatePhotoGroup').classList.add('hidden');
    document.getElementById('fieldCreateNotes').value = '';
    var descEl = document.getElementById('fieldCreateDescription');
    if (descEl) descEl.value = '';
    document.getElementById('fieldCreatePhotoPreview').innerHTML = '';
    fieldCreatePhoto = null;
}

function onFieldCreateTypeChange() {
    var type = document.getElementById('fieldCreateTypeSelect').value;
    if (!type) {
        document.getElementById('fieldCreateFormFields').classList.add('hidden');
        document.getElementById('fieldCreateSubmitBtn').classList.add('hidden');
        return;
    }

    document.getElementById('fieldCreateFormFields').classList.remove('hidden');
    document.getElementById('fieldCreateSubmitBtn').classList.remove('hidden');

    // Hide all type-specific fields first
    document.getElementById('fieldCreateInspectionFields').classList.add('hidden');
    document.getElementById('fieldCreateWorkOrderFields').classList.add('hidden');
    document.getElementById('fieldCreateDescriptionGroup').classList.add('hidden');
    document.getElementById('fieldCreatePhotoGroup').classList.add('hidden');

    var btn = document.getElementById('fieldCreateSubmitBtn');

    if (type === 'inspection') {
        document.getElementById('fieldCreateInspectionFields').classList.remove('hidden');
        document.getElementById('fieldCreateJobNumber').value = nextJobNumber;
        document.getElementById('fieldCreateJobDate').value = new Date().toISOString().split('T')[0];
        btn.textContent = 'Create Inspection';
    } else if (type === 'work_order') {
        document.getElementById('fieldCreateWorkOrderFields').classList.remove('hidden');
        document.getElementById('fieldCreateDescriptionGroup').classList.remove('hidden');
        document.getElementById('fieldCreatePhotoGroup').classList.remove('hidden');
        document.getElementById('fieldCreateDescription').placeholder = 'What needs to be done...';
        btn.textContent = 'Create Work Order';
    } else if (type === 'parts_spec') {
        document.getElementById('fieldCreateDescriptionGroup').classList.remove('hidden');
        document.getElementById('fieldCreatePhotoGroup').classList.remove('hidden');
        document.getElementById('fieldCreateDescription').placeholder = 'What parts are needed for...';
        btn.textContent = 'Create Parts Spec';
    }
}

function updateFieldCreateCustomerInfo() {
    var select = document.getElementById('fieldCreateCustomerSelect');
    var locId = select.value;
    var infoEl = document.getElementById('fieldCreateCustomerInfo');
    if (!locId) { infoEl.classList.add('hidden'); return; }
    var option = select.options[select.selectedIndex];
    var address = option.dataset.locationAddress || '';
    var contact = option.dataset.contact || '';
    var phone = option.dataset.phone || '';
    document.getElementById('fieldCreateAddress').textContent = address;
    document.getElementById('fieldCreateContact').textContent = contact + (phone ? ' - ' + phone : '');
    infoEl.classList.remove('hidden');
}

function handleFieldCreatePhoto(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            fieldCreatePhoto = e.target.result;
            document.getElementById('fieldCreatePhotoPreview').innerHTML = '<img src="' + e.target.result + '" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function submitFieldCreate() {
    var type = document.getElementById('fieldCreateTypeSelect').value;
    var select = document.getElementById('fieldCreateCustomerSelect');
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
        currentJob.inspectionType = document.getElementById('fieldCreateInspectionType').value;
        currentJob.inspectionDate = document.getElementById('fieldCreateJobDate').value;

        nextJobNumber++;
        localStorage.setItem('nextJobNumber', nextJobNumber);

        currentBankIndex = 0;
        currentJob.banks.push(createNewBank('East Side'));

        // Switch to bank inspection form
        showBankInspection();

    } else if (type === 'work_order') {
        var desc = document.getElementById('fieldCreateDescription').value.trim();
        if (!desc) { alert('Please add a description.'); return; }

        var jobType = document.getElementById('fieldCreateWoJobType').value;
        var notes = document.getElementById('fieldCreateNotes').value.trim();

        var nextNum = parseInt(localStorage.getItem('nextJobNumber') || '17500');
        var jobNumber = '' + nextNum;
        localStorage.setItem('nextJobNumber', '' + (nextNum + 1));

        var key = 'wo_' + jobNumber;
        OFFICE_WORK_ORDERS[key] = {
            jobNumber: jobNumber,
            jobType: jobType,
            status: 'Scheduled',
            locationName: locationName,
            address: address,
            contactName: '',
            contactPhone: '',
            description: desc,
            partsLocation: '',
            specialInstructions: notes,
            scheduledDate: '',
            scheduledTime: '',
            assignedTo: ''
        };

        alert('Work Order #' + jobNumber + ' created for ' + locationName);
        showTechView('myjobs');

    } else if (type === 'parts_spec') {
        var desc = document.getElementById('fieldCreateDescription').value.trim();
        if (!desc) { alert('Please add a description.'); return; }

        var nextNum = parseInt(localStorage.getItem('nextJobNumber') || '17500');
        var jobNumber = '' + nextNum;
        localStorage.setItem('nextJobNumber', '' + (nextNum + 1));

        alert('Parts Spec #' + jobNumber + ' created for ' + locationName);
        showTechView('myjobs');
    }
}

function initOfficeCreateForm() {
    var select = document.getElementById('officeCreateCustomerSelect');
    var html = '<option value="">Select a customer...</option>';
    CUSTOMERS.forEach(function(cust) {
        cust.locations.forEach(function(loc) {
            var locContact = getPrimaryContact(loc.contacts);
            html += '<option value="' + loc.id + '" data-customer-id="' + cust.id + '" data-customer-name="' + cust.name + '" data-location-name="' + loc.name + '" data-location-address="' + loc.address + '" data-contact="' + (locContact.name || '') + '" data-phone="' + (locContact.phone || '') + '">  ' + loc.name + ' (' + cust.name + ')</option>';
        });
    });
    select.innerHTML = html;

    // Reset all fields
    document.getElementById('officeCreateTypeSelect').value = '';
    document.getElementById('officeCreateCustomerSelect').value = '';
    document.getElementById('officeCreateCustomerInfo').classList.add('hidden');
    document.getElementById('officeCreateFormFields').classList.add('hidden');
    document.getElementById('officeCreateSubmitBtn').classList.add('hidden');
    document.getElementById('officeCreateInspectionFields').classList.add('hidden');
    document.getElementById('officeCreateWorkOrderFields').classList.add('hidden');
    document.getElementById('officeCreateDescriptionGroup').classList.add('hidden');
    document.getElementById('officeCreatePhotoGroup').classList.add('hidden');
    document.getElementById('officeCreateNotes').value = '';
    var descEl = document.getElementById('officeCreateDescription');
    if (descEl) descEl.value = '';
    document.getElementById('officeCreatePhotoPreview').innerHTML = '';
    officeCreatePhoto = null;
}

function onOfficeCreateTypeChange() {
    var type = document.getElementById('officeCreateTypeSelect').value;
    if (!type) {
        document.getElementById('officeCreateFormFields').classList.add('hidden');
        document.getElementById('officeCreateSubmitBtn').classList.add('hidden');
        return;
    }

    document.getElementById('officeCreateFormFields').classList.remove('hidden');
    document.getElementById('officeCreateSubmitBtn').classList.remove('hidden');

    // Hide all type-specific fields first
    document.getElementById('officeCreateInspectionFields').classList.add('hidden');
    document.getElementById('officeCreateWorkOrderFields').classList.add('hidden');
    document.getElementById('officeCreateDescriptionGroup').classList.add('hidden');
    document.getElementById('officeCreatePhotoGroup').classList.add('hidden');

    var btn = document.getElementById('officeCreateSubmitBtn');

    if (type === 'inspection') {
        document.getElementById('officeCreateInspectionFields').classList.remove('hidden');
        document.getElementById('officeCreateJobNumber').value = nextJobNumber;
        document.getElementById('officeCreateJobDate').value = new Date().toISOString().split('T')[0];
        btn.textContent = 'Create Inspection';
    } else if (type === 'work_order') {
        document.getElementById('officeCreateWorkOrderFields').classList.remove('hidden');
        document.getElementById('officeCreateDescriptionGroup').classList.remove('hidden');
        document.getElementById('officeCreatePhotoGroup').classList.remove('hidden');
        document.getElementById('officeCreateDescription').placeholder = 'What needs to be done...';
        btn.textContent = 'Create Work Order';
    } else if (type === 'parts_spec') {
        document.getElementById('officeCreateDescriptionGroup').classList.remove('hidden');
        document.getElementById('officeCreatePhotoGroup').classList.remove('hidden');
        document.getElementById('officeCreateDescription').placeholder = 'What parts are needed for...';
        btn.textContent = 'Create Parts Spec';
    }
}

function updateOfficeCreateCustomerInfo() {
    var select = document.getElementById('officeCreateCustomerSelect');
    var locId = select.value;
    var infoEl = document.getElementById('officeCreateCustomerInfo');
    if (!locId) { infoEl.classList.add('hidden'); return; }
    var option = select.options[select.selectedIndex];
    var address = option.dataset.locationAddress || '';
    var contact = option.dataset.contact || '';
    var phone = option.dataset.phone || '';
    document.getElementById('officeCreateAddress').textContent = address;
    document.getElementById('officeCreateContact').textContent = contact + (phone ? ' - ' + phone : '');
    infoEl.classList.remove('hidden');
}

function handleOfficeCreatePhoto(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            officeCreatePhoto = e.target.result;
            document.getElementById('officeCreatePhotoPreview').innerHTML = '<img src="' + e.target.result + '" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function submitOfficeCreate() {
    var type = document.getElementById('officeCreateTypeSelect').value;
    var select = document.getElementById('officeCreateCustomerSelect');
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
        currentJob.inspectionType = document.getElementById('officeCreateInspectionType').value;
        currentJob.inspectionDate = document.getElementById('officeCreateJobDate').value;

        nextJobNumber++;
        localStorage.setItem('nextJobNumber', nextJobNumber);

        currentBankIndex = 0;
        currentJob.banks.push(createNewBank('East Side'));

        // For office, switch to tech dashboard to use bank inspection form
        document.getElementById('officeDashboard').classList.add('hidden');
        document.getElementById('techDashboard').classList.remove('hidden');
        showBankInspection();

    } else if (type === 'work_order') {
        var desc = document.getElementById('officeCreateDescription').value.trim();
        if (!desc) { alert('Please add a description.'); return; }

        var jobType = document.getElementById('officeCreateWoJobType').value;
        var notes = document.getElementById('officeCreateNotes').value.trim();

        var nextNum = parseInt(localStorage.getItem('nextJobNumber') || '17500');
        var jobNumber = '' + nextNum;
        localStorage.setItem('nextJobNumber', '' + (nextNum + 1));

        var key = 'wo_' + jobNumber;
        OFFICE_WORK_ORDERS[key] = {
            jobNumber: jobNumber,
            jobType: jobType,
            status: 'Scheduled',
            locationName: locationName,
            address: address,
            contactName: '',
            contactPhone: '',
            description: desc,
            partsLocation: '',
            specialInstructions: notes,
            scheduledDate: '',
            scheduledTime: '',
            assignedTo: ''
        };

        alert('Work Order #' + jobNumber + ' created for ' + locationName);
        showView('officeCreate');

    } else if (type === 'parts_spec') {
        var desc = document.getElementById('officeCreateDescription').value.trim();
        if (!desc) { alert('Please add a description.'); return; }

        var nextNum = parseInt(localStorage.getItem('nextJobNumber') || '17500');
        var jobNumber = '' + nextNum;
        localStorage.setItem('nextJobNumber', '' + (nextNum + 1));

        alert('Parts Spec #' + jobNumber + ' created for ' + locationName);
        showView('officeCreate');
    }
}

