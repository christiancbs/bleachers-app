// ==========================================
// CREATE FORMS
// Office and field staff unified create
// ==========================================

// Global variables for photo storage
var fieldCreatePhoto = null;

// Customer search data cache
var fieldCreateSelectedCustomer = null;
var officeCreateSelectedCustomer = null;

function initFieldCreateForm() {
    // Reset all fields
    document.getElementById('fieldCreateTypeSelect').value = '';
    document.getElementById('fieldCreateCustomerSearch').value = '';
    document.getElementById('fieldCreateCustomerId').value = '';
    document.getElementById('fieldCreateLocationId').value = '';
    document.getElementById('fieldCreateCustomerResults').classList.add('hidden');
    document.getElementById('fieldCreateCustomerInfo').classList.add('hidden');
    document.getElementById('fieldCreateFormFields').classList.add('hidden');
    document.getElementById('fieldCreateSubmitBtn').classList.add('hidden');
    document.getElementById('fieldCreateInspectionFields').classList.add('hidden');
    document.getElementById('fieldCreateCustomFields').classList.add('hidden');
    document.getElementById('fieldCreateDescriptionGroup').classList.add('hidden');
    document.getElementById('fieldCreatePhotoGroup').classList.add('hidden');
    document.getElementById('fieldCreateNotes').value = '';
    var descEl = document.getElementById('fieldCreateDescription');
    if (descEl) descEl.value = '';
    var customEl = document.getElementById('fieldCreateCustomName');
    if (customEl) customEl.value = '';
    document.getElementById('fieldCreatePhotoPreview').innerHTML = '';
    fieldCreatePhoto = null;
    fieldCreateSelectedCustomer = null;
}

function searchFieldCreateCustomers(query) {
    var resultsEl = document.getElementById('fieldCreateCustomerResults');
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
            return '<div class="customer-result-item" onclick=\'selectFieldCreateCustomer(' + JSON.stringify(m) + ')\'>' +
                '<strong>' + m.customerName + '</strong>' +
                (m.locationName !== m.customerName ? ' <span style="color: #6c757d;">- ' + m.locationName + '</span>' : '') +
                '<div style="font-size: 12px; color: #6c757d;">' + m.address + '</div>' +
            '</div>';
        }).join('');
    }

    // Always add custom entry option
    html += '<div class="customer-result-item" onclick="showFieldCustomCustomerEntry()" style="border-top: 2px solid #dee2e6; background: #f8f9fa;">' +
        '<strong style="color: #007bff;">+ Enter Custom Customer</strong>' +
        '<div style="font-size: 12px; color: #6c757d;">Not in the list? Add manually</div>' +
    '</div>';

    resultsEl.innerHTML = html;
    resultsEl.classList.remove('hidden');
}

function showFieldCustomCustomerEntry() {
    document.getElementById('fieldCreateCustomerResults').classList.add('hidden');

    // Show custom entry modal or inline form
    var name = prompt('Enter customer/school name:');
    if (!name) return;

    var address = prompt('Enter address (optional):') || '';

    fieldCreateSelectedCustomer = {
        locationId: 'custom_' + Date.now(),
        customerId: 'custom_' + Date.now(),
        customerName: name,
        locationName: name,
        address: address,
        contact: '',
        phone: '',
        isCustom: true
    };

    document.getElementById('fieldCreateCustomerSearch').value = name;
    document.getElementById('fieldCreateAddress').textContent = address || 'Custom entry';
    document.getElementById('fieldCreateContact').textContent = '';
    document.getElementById('fieldCreateCustomerInfo').classList.remove('hidden');
}

function selectFieldCreateCustomer(customer) {
    fieldCreateSelectedCustomer = customer;
    var displayName = customer.customerName;
    if (customer.locationName && customer.locationName !== customer.customerName) {
        displayName += ' - ' + customer.locationName;
    }
    document.getElementById('fieldCreateCustomerSearch').value = displayName;
    document.getElementById('fieldCreateCustomerId').value = customer.customerId;
    document.getElementById('fieldCreateLocationId').value = customer.locationId;
    document.getElementById('fieldCreateCustomerResults').classList.add('hidden');

    // Show customer info
    document.getElementById('fieldCreateAddress').textContent = customer.address;
    document.getElementById('fieldCreateContact').textContent = customer.contact + (customer.phone ? ' - ' + customer.phone : '');
    document.getElementById('fieldCreateCustomerInfo').classList.remove('hidden');
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
    document.getElementById('fieldCreateCustomFields').classList.add('hidden');
    document.getElementById('fieldCreateDescriptionGroup').classList.add('hidden');
    document.getElementById('fieldCreatePhotoGroup').classList.add('hidden');

    var btn = document.getElementById('fieldCreateSubmitBtn');
    var typeLabels = {
        'inspection': 'Inspection',
        'work_order': 'Work Order',
        'service_call': 'Service Call',
        'go_see': 'Go-See',
        'field_check': 'Field Check',
        'custom': 'Job'
    };

    if (type === 'inspection') {
        document.getElementById('fieldCreateInspectionFields').classList.remove('hidden');
        document.getElementById('fieldCreateJobNumber').value = nextJobNumber;
        document.getElementById('fieldCreateJobDate').value = new Date().toISOString().split('T')[0];
        btn.textContent = 'Create Inspection';
    } else if (type === 'custom') {
        document.getElementById('fieldCreateCustomFields').classList.remove('hidden');
        document.getElementById('fieldCreateDescriptionGroup').classList.remove('hidden');
        document.getElementById('fieldCreatePhotoGroup').classList.remove('hidden');
        document.getElementById('fieldCreateDescription').placeholder = 'What needs to be done...';
        btn.textContent = 'Create Job';
    } else {
        // work_order, service_call, go_see, field_check
        document.getElementById('fieldCreateDescriptionGroup').classList.remove('hidden');
        document.getElementById('fieldCreatePhotoGroup').classList.remove('hidden');
        document.getElementById('fieldCreateDescription').placeholder = 'What needs to be done...';
        btn.textContent = 'Create ' + typeLabels[type];
    }
}

// Close search results when clicking outside
document.addEventListener('click', function(e) {
    var fieldResults = document.getElementById('fieldCreateCustomerResults');
    var officeResults = document.getElementById('officeCreateCustomerResults');
    var createResults = document.getElementById('createCustomerResults');

    if (fieldResults && !e.target.closest('#fieldCreateCustomerSearch') && !e.target.closest('#fieldCreateCustomerResults')) {
        fieldResults.classList.add('hidden');
    }
    if (officeResults && !e.target.closest('#officeCreateCustomerSearch') && !e.target.closest('#officeCreateCustomerResults')) {
        officeResults.classList.add('hidden');
    }
    if (createResults && !e.target.closest('#createCustomerSearch') && !e.target.closest('#createCustomerResults')) {
        createResults.classList.add('hidden');
    }
});

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

    if (!fieldCreateSelectedCustomer) {
        alert('Please select a customer.');
        return;
    }

    var locationName = fieldCreateSelectedCustomer.locationName;
    var customerName = fieldCreateSelectedCustomer.customerName;
    var address = fieldCreateSelectedCustomer.address;
    var customerId = fieldCreateSelectedCustomer.customerId;
    var locId = fieldCreateSelectedCustomer.locationId;

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

    } else if (type === 'work_order' || type === 'service_call' || type === 'go_see' || type === 'field_check' || type === 'custom') {
        var desc = document.getElementById('fieldCreateDescription').value.trim();
        if (!desc) { alert('Please add a description.'); return; }

        // For custom type, get the custom name
        var jobType = type;
        if (type === 'custom') {
            var customName = document.getElementById('fieldCreateCustomName').value.trim();
            if (!customName) { alert('Please enter a custom job name.'); return; }
            jobType = customName;
        }

        var notes = document.getElementById('fieldCreateNotes').value.trim();

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
            createdBy: 'Field'
        };

        var submitBtn = document.getElementById('fieldCreateSubmitBtn');
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
                initFieldCreateForm();
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

function initOfficeCreateForm() {
    // Reset all fields
    document.getElementById('officeCreateTypeSelect').value = '';
    document.getElementById('officeCreateCustomerSearch').value = '';
    document.getElementById('officeCreateCustomerId').value = '';
    document.getElementById('officeCreateLocationId').value = '';
    document.getElementById('officeCreateCustomerResults').classList.add('hidden');
    document.getElementById('officeCreateCustomerInfo').classList.add('hidden');
    document.getElementById('officeCreateFormFields').classList.add('hidden');
    document.getElementById('officeCreateSubmitBtn').classList.add('hidden');
    document.getElementById('officeCreateInspectionFields').classList.add('hidden');
    document.getElementById('officeCreateCustomFields').classList.add('hidden');
    document.getElementById('officeCreateDescriptionGroup').classList.add('hidden');
    document.getElementById('officeCreatePhotoGroup').classList.add('hidden');
    document.getElementById('officeCreateNotes').value = '';
    var descEl = document.getElementById('officeCreateDescription');
    if (descEl) descEl.value = '';
    var customEl = document.getElementById('officeCreateCustomName');
    if (customEl) customEl.value = '';
    document.getElementById('officeCreatePhotoPreview').innerHTML = '';
    officeCreatePhoto = null;
    officeCreateSelectedCustomer = null;
}

function searchOfficeCreateCustomers(query) {
    var resultsEl = document.getElementById('officeCreateCustomerResults');
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
            return '<div class="customer-result-item" onclick=\'selectOfficeCreateCustomer(' + JSON.stringify(m) + ')\'>' +
                '<strong>' + m.customerName + '</strong>' +
                (m.locationName !== m.customerName ? ' <span style="color: #6c757d;">- ' + m.locationName + '</span>' : '') +
                '<div style="font-size: 12px; color: #6c757d;">' + m.address + '</div>' +
            '</div>';
        }).join('');
    }

    // Always add custom entry option
    html += '<div class="customer-result-item" onclick="showOfficeCustomCustomerEntry()" style="border-top: 2px solid #dee2e6; background: #f8f9fa;">' +
        '<strong style="color: #007bff;">+ Enter Custom Customer</strong>' +
        '<div style="font-size: 12px; color: #6c757d;">Not in the list? Add manually</div>' +
    '</div>';

    resultsEl.innerHTML = html;
    resultsEl.classList.remove('hidden');
}

function showOfficeCustomCustomerEntry() {
    document.getElementById('officeCreateCustomerResults').classList.add('hidden');

    var name = prompt('Enter customer/school name:');
    if (!name) return;

    var address = prompt('Enter address (optional):') || '';

    officeCreateSelectedCustomer = {
        locationId: 'custom_' + Date.now(),
        customerId: 'custom_' + Date.now(),
        customerName: name,
        locationName: name,
        address: address,
        contact: '',
        phone: '',
        isCustom: true
    };

    document.getElementById('officeCreateCustomerSearch').value = name;
    document.getElementById('officeCreateAddress').textContent = address || 'Custom entry';
    document.getElementById('officeCreateContact').textContent = '';
    document.getElementById('officeCreateCustomerInfo').classList.remove('hidden');
}

function selectOfficeCreateCustomer(customer) {
    officeCreateSelectedCustomer = customer;
    var displayName = customer.customerName;
    if (customer.locationName && customer.locationName !== customer.customerName) {
        displayName += ' - ' + customer.locationName;
    }
    document.getElementById('officeCreateCustomerSearch').value = displayName;
    document.getElementById('officeCreateCustomerId').value = customer.customerId;
    document.getElementById('officeCreateLocationId').value = customer.locationId;
    document.getElementById('officeCreateCustomerResults').classList.add('hidden');

    // Show customer info
    document.getElementById('officeCreateAddress').textContent = customer.address;
    document.getElementById('officeCreateContact').textContent = customer.contact + (customer.phone ? ' - ' + customer.phone : '');
    document.getElementById('officeCreateCustomerInfo').classList.remove('hidden');
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
    document.getElementById('officeCreateCustomFields').classList.add('hidden');
    document.getElementById('officeCreateDescriptionGroup').classList.add('hidden');
    document.getElementById('officeCreatePhotoGroup').classList.add('hidden');

    var btn = document.getElementById('officeCreateSubmitBtn');
    var typeLabels = {
        'inspection': 'Inspection',
        'work_order': 'Work Order',
        'service_call': 'Service Call',
        'go_see': 'Go-See',
        'field_check': 'Field Check',
        'custom': 'Job'
    };

    if (type === 'inspection') {
        document.getElementById('officeCreateInspectionFields').classList.remove('hidden');
        document.getElementById('officeCreateJobNumber').value = nextJobNumber;
        document.getElementById('officeCreateJobDate').value = new Date().toISOString().split('T')[0];
        btn.textContent = 'Create Inspection';
    } else if (type === 'custom') {
        document.getElementById('officeCreateCustomFields').classList.remove('hidden');
        document.getElementById('officeCreateDescriptionGroup').classList.remove('hidden');
        document.getElementById('officeCreatePhotoGroup').classList.remove('hidden');
        document.getElementById('officeCreateDescription').placeholder = 'What needs to be done...';
        btn.textContent = 'Create Job';
    } else {
        // work_order, service_call, go_see, field_check
        document.getElementById('officeCreateDescriptionGroup').classList.remove('hidden');
        document.getElementById('officeCreatePhotoGroup').classList.remove('hidden');
        document.getElementById('officeCreateDescription').placeholder = 'What needs to be done...';
        btn.textContent = 'Create ' + typeLabels[type];
    }
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

    if (!officeCreateSelectedCustomer) {
        alert('Please select a customer.');
        return;
    }

    var locationName = officeCreateSelectedCustomer.locationName;
    var customerName = officeCreateSelectedCustomer.customerName;
    var address = officeCreateSelectedCustomer.address;
    var customerId = officeCreateSelectedCustomer.customerId;
    var locId = officeCreateSelectedCustomer.locationId;

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

    } else if (type === 'work_order' || type === 'service_call' || type === 'go_see' || type === 'field_check' || type === 'custom') {
        var desc = document.getElementById('officeCreateDescription').value.trim();
        if (!desc) { alert('Please add a description.'); return; }

        // For custom type, get the custom name
        var jobType = type;
        if (type === 'custom') {
            var customName = document.getElementById('officeCreateCustomName').value.trim();
            if (!customName) { alert('Please enter a custom job name.'); return; }
            jobType = customName;
        }

        var notes = document.getElementById('officeCreateNotes').value.trim();

        // Job number auto-generated by API (sequential starting at 20000)

        // Create job via API
        var jobData = {
            jobType: jobType,
            status: 'draft',
            customerId: customerId,
            customerName: customerName,
            locationId: locId,
            locationName: locationName,
            locationAddress: address,
            description: desc,
            notes: notes,
            createdBy: currentRole === 'admin' ? 'Admin' : 'Office'
        };

        var submitBtn = document.getElementById('officeCreateSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';

        JobsAPI.create(jobData)
            .then(function(result) {
                initOfficeCreateForm();
                viewWorkOrderDetail(result.job.id, 'officeCreate');
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

