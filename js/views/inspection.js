// ==========================================
// INSPECTION FLOW
// Multi-bank jobs, issues, bank tabs, summary
// ==========================================

// ==========================================
// INITIALIZATION
// App setup and data population
// ==========================================

// Initialize
function init() {
    populateCustomers();
    populateJobCustomers();
    populateCategories();

    // Load sample data if no jobs exist
    if (inspectionJobs.length === 0) {
        inspectionJobs = [...SAMPLE_INSPECTION_JOBS];
        localStorage.setItem('inspectionJobs', JSON.stringify(inspectionJobs));
    }

    loadInspectionJobs();
    updateOpsReviewBadge();
}

// Populate job customer dropdown
function populateJobCustomers() {
    const select = document.getElementById('jobCustomerSelect');
    if (!select) return;

    let html = '<option value="">Select a customer...</option>';
    CUSTOMERS.forEach(customer => {
        const icon = customer.type === 'county' ? '🏛️' : '🏫';
        html += `<optgroup label="${icon} ${customer.name}">`;
        customer.locations.forEach(location => {
            html += `<option value="${location.id}"
                      data-customer-id="${customer.id}"
                      data-customer-name="${customer.name}"
                      data-location-name="${location.name}"
                      data-location-address="${location.address}">
                      📍 ${location.name}
                    </option>`;
        });
        html += '</optgroup>';
    });
    select.innerHTML = html;
}

// ==========================================
// JOB CREATION & SETUP
// New job initialization and customer selection
// ==========================================

// Start new job
function startNewJob() {
    currentJob = {
        jobNumber: nextJobNumber,
        banks: [],
        selectedParts: [],
        status: 'in_progress',
        createdAt: new Date().toISOString()
    };

    // For office users, need to switch to tech dashboard to access inspection form
    if (currentRole === 'office') {
        document.getElementById('officeDashboard').classList.add('hidden');
        document.getElementById('techDashboard').classList.remove('hidden');
    }

    // Populate form
    populateJobCustomers();
    document.getElementById('jobNumberInput').value = nextJobNumber;
    document.getElementById('jobDateInput').value = new Date().toISOString().split('T')[0];
    document.getElementById('jobInspectionType').value = 'bleacher';
    document.getElementById('jobCustomerSelect').value = '';
    document.getElementById('jobCustomerInfo').classList.add('hidden');

    // Show job setup view
    hideAllViews();
    document.getElementById('newJobSetupView').classList.remove('hidden');
}

// Update job customer info display
function updateJobCustomerInfo() {
    const select = document.getElementById('jobCustomerSelect');
    const locationId = select.value;
    const info = document.getElementById('jobCustomerInfo');

    if (locationId) {
        const option = select.options[select.selectedIndex];
        const customerId = option.dataset.customerId;
        const customerName = option.dataset.customerName;
        const locationName = option.dataset.locationName;
        const locationAddress = option.dataset.locationAddress;

        document.getElementById('jobBillingEntity').textContent = customerName;
        document.getElementById('jobServiceLocation').textContent = locationName;
        document.getElementById('jobServiceAddress').textContent = locationAddress;

        info.classList.remove('hidden');

        // Store in current job
        currentJob.customerId = customerId;
        currentJob.customerName = customerName;
        currentJob.locationId = locationId;
        currentJob.locationName = locationName;
        currentJob.locationAddress = locationAddress;
    } else {
        info.classList.add('hidden');
    }
}

// Create job and show overview
function createJobAndAddBank() {
    if (!currentJob.locationId) {
        alert('Please select a customer/location');
        return;
    }

    currentJob.inspectionType = document.getElementById('jobInspectionType').value;
    currentJob.inspectionDate = document.getElementById('jobDateInput').value;

    // Increment job number for next time
    nextJobNumber++;
    localStorage.setItem('nextJobNumber', nextJobNumber);

    // Show job overview (empty — user adds forms from there)
    showJobOverview();
}

// Create a new bank object with optional form type
function createNewBank(name, formType) {
    return {
        name: name,
        formType: formType || 'indoor_bleacher',
        bankPhoto: null,
        bleacherType: '',
        tiers: '',
        seatType: '',
        color: '',
        sections: '',
        rows: '',
        aisles: '',
        aisleRailType: 'P',
        motorPhase: 'Single',
        motorHP: '',
        motorCount: '',
        wheelType: '',
        topSideIssues: [],
        understructureIssues: [],
        summaryNotes: '',
        tagAffixed: 'yes'
    };
}

// Preview bank photo
function previewBankPhoto(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('bankPhotoPreview').innerHTML =
                '<img src="' + e.target.result + '" style="max-width: 100%; max-height: 120px; border-radius: 8px; object-fit: cover;">';
            currentJob.banks[currentBankIndex].bankPhoto = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ==========================================
// JOB OVERVIEW
// "Folder" view — shows school header + form cards
// ==========================================

var _jobOverviewReturnView = null; // Where to go when exiting

function showJobOverview(returnView) {
    if (returnView) _jobOverviewReturnView = returnView;
    hideAllViews();
    document.getElementById('jobOverviewView').classList.remove('hidden');

    if (!currentJob) return;

    // Header
    document.getElementById('overviewLocationName').textContent = currentJob.locationName || '';
    document.getElementById('overviewCustomerName').textContent = currentJob.customerName || '';
    document.getElementById('overviewAddress').textContent = currentJob.locationAddress || '';
    document.getElementById('overviewJobBadge').textContent = 'Job ' + currentJob.jobNumber;
    document.getElementById('overviewDateBadge').textContent = currentJob.inspectionDate || new Date().toISOString().split('T')[0];

    var statusBadge = document.getElementById('overviewStatusBadge');
    var st = currentJob.status || 'in_progress';
    if (st === 'in_progress') {
        statusBadge.textContent = 'In Progress';
        statusBadge.style.background = '#fff3e0';
        statusBadge.style.color = '#e65100';
    } else if (st === 'submitted') {
        statusBadge.textContent = 'Submitted';
        statusBadge.style.background = '#c8e6c9';
        statusBadge.style.color = '#2e7d32';
    } else {
        statusBadge.textContent = st.replace(/_/g, ' ');
        statusBadge.style.background = '#f8f9fa';
        statusBadge.style.color = '#495057';
    }

    // Show/hide review button based on banks
    var actionsEl = document.getElementById('overviewActions');
    actionsEl.style.display = currentJob.banks.length > 0 ? 'flex' : 'none';

    renderOverviewCards();
}

function renderOverviewCards() {
    var container = document.getElementById('overviewFormCards');
    var banks = currentJob.banks || [];

    if (banks.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #6c757d; background: #f8f9fa; border-radius: 12px; border: 2px dashed #dee2e6;">' +
            '<div style="font-size: 40px; margin-bottom: 12px;">📋</div>' +
            '<p style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">No inspection forms yet</p>' +
            '<p style="font-size: 14px;">Tap <strong>+ Add Form</strong> to begin inspecting</p>' +
        '</div>';
        return;
    }

    var formTypeLabels = {
        indoor_bleacher: 'Indoor Bleacher',
        basketball: 'Basketball Goals',
        outdoor: 'Outdoor Bleacher'
    };
    var formTypeColors = {
        indoor_bleacher: { bg: '#e3f2fd', color: '#1565c0' },
        basketball: { bg: '#fce4ec', color: '#c62828' },
        outdoor: { bg: '#e8f5e9', color: '#2e7d32' }
    };

    container.innerHTML = banks.map(function(bank, idx) {
        var ft = bank.formType || 'indoor_bleacher';
        var ftLabel = formTypeLabels[ft] || ft;
        var ftColor = formTypeColors[ft] || formTypeColors.indoor_bleacher;

        var issueCount = (bank.topSideIssues || []).length + (bank.understructureIssues || []).length;
        var hasData = bank.bleacherType || bank.tiers || bank.sections || issueCount > 0;

        var statusLabel = hasData ? 'In Progress' : 'Not Started';
        var statusBg = hasData ? '#fff3e0' : '#f8f9fa';
        var statusColor = hasData ? '#e65100' : '#6c757d';

        var thumbHtml = bank.bankPhoto
            ? '<img src="' + bank.bankPhoto + '" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 16px; flex-shrink: 0;">'
            : '<div style="width: 80px; height: 80px; background: #f0f0f0; border-radius: 8px; margin-right: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 28px;">📷</div>';

        return '<div class="job-overview-card" onclick="openBankForm(' + idx + ')" style="cursor: pointer; border: 2px solid #e9ecef; border-radius: 12px; padding: 20px; background: white; transition: all 0.15s; position: relative;" onmouseover="this.style.borderColor=\'#007bff\'; this.style.boxShadow=\'0 4px 12px rgba(0,0,0,0.1)\'" onmouseout="this.style.borderColor=\'#e9ecef\'; this.style.boxShadow=\'none\'">' +
            '<div style="display: flex; align-items: start;">' +
            thumbHtml +
            '<div style="flex: 1;">' +
            '<div style="display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; background: ' + statusBg + '; color: ' + statusColor + '; margin-bottom: 8px;">' + statusLabel + '</div>' +
            '<div style="font-weight: 700; font-size: 18px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">' +
                '<span id="bankName_' + idx + '">' + (bank.name || 'Form ' + (idx + 1)) + '</span>' +
                '<button onclick="event.stopPropagation(); renameBank(' + idx + ')" style="background: none; border: none; cursor: pointer; color: #6c757d; font-size: 13px; padding: 2px 4px;" title="Rename">&#9998;</button>' +
            '</div>' +
            '<div style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; background: ' + ftColor.bg + '; color: ' + ftColor.color + ';">' + ftLabel + '</div>' +
            (bank.bleacherType ? '<div style="font-size: 13px; color: #6c757d; margin-top: 8px;">' + bank.bleacherType + (bank.tiers ? ' &bull; ' + bank.tiers + ' tiers' : '') + '</div>' : '') +
            (issueCount > 0 ? '<div style="margin-top: 8px;"><span style="display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; background: #fff3e0; color: #e65100;">' + issueCount + ' issue' + (issueCount !== 1 ? 's' : '') + '</span></div>' : '') +
            '</div>' +
            '</div>' +
            '<div style="position: absolute; top: 16px; right: 16px;"><button onclick="event.stopPropagation(); deleteFormFromJob(' + idx + ')" style="background: none; border: none; font-size: 16px; cursor: pointer; color: #dc3545; padding: 4px;" title="Remove">&times;</button></div>' +
        '</div>';
    }).join('');
}

function showAddFormSelector() {
    document.getElementById('addFormSelector').classList.remove('hidden');
}

function hideAddFormSelector() {
    document.getElementById('addFormSelector').classList.add('hidden');
}

function addFormToJob(formType) {
    hideAddFormSelector();

    var typeLabels = {
        indoor_bleacher: 'Bleacher Bank',
        basketball: 'Basketball Goals',
        outdoor: 'Outdoor Bleacher'
    };

    // Auto-name based on common naming
    var bankNames = {
        indoor_bleacher: ['East Side', 'West Side', 'Facing Logo', 'Behind Logo', 'North Side', 'South Side'],
        basketball: ['Main Gym Goals', 'Aux Gym Goals', 'Practice Gym Goals'],
        outdoor: ['Home Side', 'Visitor Side', 'North Bleachers', 'South Bleachers']
    };

    var names = bankNames[formType] || bankNames.indoor_bleacher;
    var usedNames = currentJob.banks.map(function(b) { return b.name; });
    var name = names.find(function(n) { return !usedNames.includes(n); }) || typeLabels[formType] + ' ' + (currentJob.banks.length + 1);

    currentJob.banks.push(createNewBank(name, formType));

    // Save to localStorage
    var existingIndex = inspectionJobs.findIndex(function(j) { return j.jobNumber === currentJob.jobNumber; });
    if (existingIndex >= 0) {
        inspectionJobs[existingIndex] = currentJob;
    } else {
        inspectionJobs.push(currentJob);
    }
    localStorage.setItem('inspectionJobs', JSON.stringify(inspectionJobs));

    renderOverviewCards();

    // Show review button now that we have banks
    document.getElementById('overviewActions').style.display = 'flex';
}

function renameBank(idx) {
    var nameEl = document.getElementById('bankName_' + idx);
    if (!nameEl) return;
    var currentName = currentJob.banks[idx].name;

    // Replace the name span with an input
    var input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.style.cssText = 'font-size: 18px; font-weight: 700; border: 2px solid #007bff; border-radius: 6px; padding: 2px 8px; width: 160px; outline: none;';

    var saveRename = function() {
        var newName = input.value.trim();
        if (!newName) newName = currentName;
        currentJob.banks[idx].name = newName;

        // Save to localStorage
        var existingIndex = inspectionJobs.findIndex(function(j) { return j.jobNumber === currentJob.jobNumber; });
        if (existingIndex >= 0) inspectionJobs[existingIndex] = currentJob;
        localStorage.setItem('inspectionJobs', JSON.stringify(inspectionJobs));

        renderOverviewCards();
    };

    input.addEventListener('blur', saveRename);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
        if (e.key === 'Escape') { input.value = currentName; input.blur(); }
    });

    nameEl.parentNode.replaceChild(input, nameEl);
    input.focus();
    input.select();
}

function deleteFormFromJob(idx) {
    if (!confirm('Remove "' + currentJob.banks[idx].name + '"?')) return;
    currentJob.banks.splice(idx, 1);

    // Save
    var existingIndex = inspectionJobs.findIndex(function(j) { return j.jobNumber === currentJob.jobNumber; });
    if (existingIndex >= 0) inspectionJobs[existingIndex] = currentJob;
    localStorage.setItem('inspectionJobs', JSON.stringify(inspectionJobs));

    renderOverviewCards();
    if (currentJob.banks.length === 0) {
        document.getElementById('overviewActions').style.display = 'none';
    }
}

function openBankForm(bankIndex) {
    currentBankIndex = bankIndex;
    showBankInspection();
}

function goBackToJobOverview() {
    if (currentJob && currentJob.banks.length > 0 && currentBankIndex < currentJob.banks.length) {
        saveBankData();
    }
    // Save in-progress job
    if (currentJob) {
        var existingIndex = inspectionJobs.findIndex(function(j) { return j.jobNumber === currentJob.jobNumber; });
        if (existingIndex >= 0) {
            inspectionJobs[existingIndex] = currentJob;
        } else {
            inspectionJobs.push(currentJob);
        }
        localStorage.setItem('inspectionJobs', JSON.stringify(inspectionJobs));
    }
    showJobOverview();
}

function exitJobOverview() {
    // Save job before leaving
    if (currentJob) {
        var existingIndex = inspectionJobs.findIndex(function(j) { return j.jobNumber === currentJob.jobNumber; });
        if (existingIndex >= 0) {
            inspectionJobs[existingIndex] = currentJob;
        } else {
            inspectionJobs.push(currentJob);
        }
        localStorage.setItem('inspectionJobs', JSON.stringify(inspectionJobs));
    }
    currentJob = null;

    if (_jobOverviewReturnView === 'myjobs') {
        showTechView('myjobs');
    } else if (_jobOverviewReturnView === 'inspections') {
        showTechView('inspections');
    } else if (_jobOverviewReturnView === 'search') {
        showTechView('search');
    } else if (_jobOverviewReturnView === 'office') {
        document.getElementById('techDashboard').classList.add('hidden');
        document.getElementById('officeDashboard').classList.remove('hidden');
        showView('home');
    } else {
        showTechView('inspections');
    }
}

// ==========================================
// BANK MANAGEMENT
// Bank tabs, switching, adding banks
// ==========================================

// Show bank inspection view
function showBankInspection() {
    hideAllViews();
    document.getElementById('bankInspectionView').classList.remove('hidden');

    // Update header
    document.getElementById('bankJobNumber').textContent = currentJob.jobNumber;
    document.getElementById('bankCustomerName').textContent = currentJob.locationName;
    document.getElementById('bankCount').textContent = currentJob.banks.length;

    // Load current bank data
    loadBankData();

    // Render checklists
    renderChecklist('topSideChecklist', CHECKLISTS.bleacherTopSide);
    renderChecklist('understructureChecklist', CHECKLISTS.bleacherUnderstructure);
}

// ==========================================
// BANK DATA (Load/Save)
// Form data persistence for current bank
// ==========================================

// Load bank data into form
function loadBankData() {
    const bank = currentJob.banks[currentBankIndex];
    if (!bank) return;

    document.getElementById('currentBankName').textContent = bank.name;
    document.getElementById('bankBleacherType').value = bank.bleacherType || '';
    document.getElementById('bankTiers').value = bank.tiers || '';
    document.getElementById('bankSeatType').value = bank.seatType || '';
    document.getElementById('bankColor').value = bank.color || '';
    document.getElementById('bankSections').value = bank.sections || '';
    document.getElementById('bankRows').value = bank.rows || '';
    document.getElementById('bankAisles').value = bank.aisles || '';
    document.getElementById('bankAisleRailType').value = bank.aisleRailType || 'P';
    document.getElementById('bankMotorPhase').value = bank.motorPhase || 'Single';
    document.getElementById('bankMotorHP').value = bank.motorHP || '';
    document.getElementById('bankMotorCount').value = bank.motorCount || '';
    document.getElementById('bankWheelType').value = bank.wheelType || '';
    document.getElementById('bankTagAffixed').value = bank.tagAffixed || 'yes';

    // Bank photo
    var photoPreview = document.getElementById('bankPhotoPreview');
    if (bank.bankPhoto) {
        photoPreview.innerHTML = '<img src="' + bank.bankPhoto + '" style="max-width: 100%; max-height: 120px; border-radius: 8px; object-fit: cover;">';
    } else {
        photoPreview.innerHTML = '<div style="text-align: center; color: #6c757d;"><div style="font-size: 28px;">📷</div><div style="font-size: 13px;">Tap to add bank photo (becomes thumbnail)</div></div>';
    }

    // Summary notes
    var notesEl = document.getElementById('bankSummaryNotes');
    if (notesEl) notesEl.value = bank.summaryNotes || '';

    renderTopSideIssues();
    renderUnderstructureIssues();
    renderIssueTally();
}

// Save bank data from form
function saveBankData() {
    const bank = currentJob.banks[currentBankIndex];
    if (!bank) return;

    bank.bleacherType = document.getElementById('bankBleacherType').value;
    bank.tiers = document.getElementById('bankTiers').value;
    bank.seatType = document.getElementById('bankSeatType').value;
    bank.color = document.getElementById('bankColor').value;
    bank.sections = document.getElementById('bankSections').value;
    bank.rows = document.getElementById('bankRows').value;
    bank.aisles = document.getElementById('bankAisles').value;
    bank.aisleRailType = document.getElementById('bankAisleRailType').value;
    bank.motorPhase = document.getElementById('bankMotorPhase').value;
    bank.motorHP = document.getElementById('bankMotorHP').value;
    bank.motorCount = document.getElementById('bankMotorCount').value;
    bank.wheelType = document.getElementById('bankWheelType').value;
    bank.tagAffixed = document.getElementById('bankTagAffixed').value;
    var notesEl = document.getElementById('bankSummaryNotes');
    if (notesEl) bank.summaryNotes = notesEl.value;
}

// Edit bank name
function editBankName() {
    const nameEl = document.getElementById('currentBankName');
    const selectEl = document.getElementById('bankNameSelect');
    const editBtn = document.getElementById('editBankNameBtn');

    selectEl.value = nameEl.textContent;
    selectEl.style.display = 'block';
    nameEl.style.display = 'none';
    editBtn.style.display = 'none';
}

// Update bank name from select
function updateBankName() {
    const nameEl = document.getElementById('currentBankName');
    const selectEl = document.getElementById('bankNameSelect');
    const editBtn = document.getElementById('editBankNameBtn');

    const newName = selectEl.value;
    nameEl.textContent = newName;
    currentJob.banks[currentBankIndex].name = newName;

    selectEl.style.display = 'none';
    nameEl.style.display = 'inline';
    editBtn.style.display = 'inline';

}

// Toggle section visibility
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const isHidden = section.style.display === 'none';
    section.style.display = isHidden ? 'block' : 'none';

    const toggleId = sectionId === 'topSideSection' ? 'topSideToggle' : 'understructureToggle';
    document.getElementById(toggleId).textContent = isHidden ? '▼' : '▶';
}

// ==========================================
// ISSUE MANAGEMENT
// Inline expandable issues with parts catalog
// ==========================================

// Track which issue is currently being edited inline
var _editingIssueType = null; // 'topSide' or 'understructure'
var _editingIssueIndex = -1;  // -1 = new issue, >= 0 = editing existing
var _editingIssuePhoto = null;
var _editingIssueParts = [];
var _issuePartSearchTimeout = null;

// Add top side issue — expand inline form
function addTopSideIssue() {
    _editingIssueType = 'topSide';
    _editingIssueIndex = -1;
    _editingIssuePhoto = null;
    _editingIssueParts = [];
    renderTopSideIssues();
    // Scroll to the new form
    setTimeout(function() {
        var form = document.getElementById('inlineIssueForm_topSide');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

// Add understructure issue — expand inline form
function addUnderstructureIssue() {
    _editingIssueType = 'understructure';
    _editingIssueIndex = -1;
    _editingIssuePhoto = null;
    _editingIssueParts = [];
    renderUnderstructureIssues();
    setTimeout(function() {
        var form = document.getElementById('inlineIssueForm_understructure');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

// Edit existing issue — expand it inline
function editIssue(type, index) {
    var bank = currentJob.banks[currentBankIndex];
    var issues = type === 'topSide' ? bank.topSideIssues : bank.understructureIssues;
    var issue = issues[index];
    if (!issue) return;

    _editingIssueType = type;
    _editingIssueIndex = index;
    _editingIssuePhoto = issue.photo || null;
    // Support both old single part and new parts array
    if (issue.parts && issue.parts.length > 0) {
        _editingIssueParts = issue.parts.map(function(p) { return Object.assign({}, p); });
    } else if (issue.part) {
        _editingIssueParts = [Object.assign({}, issue.part)];
    } else {
        _editingIssueParts = [];
    }

    if (type === 'topSide') {
        renderTopSideIssues();
    } else {
        renderUnderstructureIssues();
    }
    setTimeout(function() {
        var form = document.getElementById('inlineIssueForm_' + type);
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

// Cancel inline issue editing
function cancelInlineIssue(type) {
    _editingIssueType = null;
    _editingIssueIndex = -1;
    _editingIssuePhoto = null;
    _editingIssueParts = [];
    if (type === 'topSide') {
        renderTopSideIssues();
    } else {
        renderUnderstructureIssues();
    }
}

// Build the inline issue form HTML
function buildInlineIssueForm(type, issue) {
    var isTopSide = type === 'topSide';
    var locationFields = '';

    if (isTopSide) {
        locationFields =
            '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">' +
                '<div class="form-group" style="margin-bottom: 0;">' +
                    '<label class="form-label" style="font-size: 11px;">Section</label>' +
                    '<input type="text" id="inlineIssueSection" class="form-input" placeholder="e.g., 2" value="' + (issue ? (issue.section || '') : '') + '">' +
                '</div>' +
                '<div class="form-group" style="margin-bottom: 0;">' +
                    '<label class="form-label" style="font-size: 11px;">Row</label>' +
                    '<input type="text" id="inlineIssueRow" class="form-input" placeholder="e.g., 3" value="' + (issue ? (issue.row || '') : '') + '">' +
                '</div>' +
                '<div class="form-group" style="margin-bottom: 0;">' +
                    '<label class="form-label" style="font-size: 11px;">Aisle</label>' +
                    '<input type="text" id="inlineIssueAisle" class="form-input" placeholder="e.g., 1" value="' + (issue ? (issue.aisle || '') : '') + '">' +
                '</div>' +
            '</div>';
    } else {
        locationFields =
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">' +
                '<div class="form-group" style="margin-bottom: 0;">' +
                    '<label class="form-label" style="font-size: 11px;">Frame</label>' +
                    '<input type="text" id="inlineIssueFrame" class="form-input" placeholder="e.g., 3" value="' + (issue ? (issue.frame || '') : '') + '">' +
                '</div>' +
                '<div class="form-group" style="margin-bottom: 0;">' +
                    '<label class="form-label" style="font-size: 11px;">Tier</label>' +
                    '<input type="text" id="inlineIssueTier" class="form-input" placeholder="e.g., 1" value="' + (issue ? (issue.tier || '') : '') + '">' +
                '</div>' +
            '</div>';
    }

    // Photo preview
    var photoHtml = '';
    if (_editingIssuePhoto) {
        photoHtml = '<img src="' + _editingIssuePhoto + '" style="max-width: 100%; max-height: 100px; border-radius: 8px; object-fit: cover;">';
    } else {
        photoHtml = '<div style="text-align: center; color: #6c757d;"><div style="font-size: 24px;">📷</div><div style="font-size: 12px;">Photo (required)</div></div>';
    }

    // Part badges (multiple)
    var partHtml = '';
    if (_editingIssueParts.length > 0) {
        partHtml = '<div id="inlineIssuePartBadges">' +
            _editingIssueParts.map(function(p, pi) {
                return '<div style="display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #e3f2fd; border-radius: 6px; margin-bottom: 4px;">' +
                    '<div style="flex: 1;">' +
                        '<div style="font-weight: 600; font-size: 12px;">' + (p.partNumber || '') + ' <span style="font-weight: 400; color: #888;">' + (p.vendor || '') + '</span></div>' +
                        '<div style="font-size: 11px; color: #555;">' + (p.productName || '') + '</div>' +
                    '</div>' +
                    '<button onclick="removeIssuePart(' + pi + ')" style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 14px; padding: 2px;">×</button>' +
                '</div>';
            }).join('') +
        '</div>';
    }

    var manualPartVal = issue && issue.manualPart ? issue.manualPart : '';
    var qtyVal = issue && issue.quantity ? issue.quantity : 1;

    return '<div id="inlineIssueForm_' + type + '" style="background: #fffde7; border: 2px solid #fbc02d; border-radius: 8px; padding: 16px; margin-bottom: 8px;">' +
        locationFields +
        '<div class="form-group" style="margin-bottom: 12px;">' +
            '<label class="form-label" style="font-size: 11px;">Description *</label>' +
            '<textarea id="inlineIssueDesc" class="form-textarea" placeholder="Describe the issue..." style="min-height: 60px;">' + (issue ? (issue.description || '') : '') + '</textarea>' +
        '</div>' +
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">' +
            '<div>' +
                '<label class="form-label" style="font-size: 11px;">📷 Photo *</label>' +
                '<div id="inlineIssuePhotoPreview" style="width: 100%; height: 100px; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="document.getElementById(\'inlineIssuePhotoInput\').click()">' +
                    photoHtml +
                '</div>' +
                '<input type="file" id="inlineIssuePhotoInput" accept="image/*" capture="environment" style="display: none;" onchange="handleInlineIssuePhoto(this)">' +
            '</div>' +
            '<div>' +
                '<label class="form-label" style="font-size: 11px;">Qty</label>' +
                '<input type="number" id="inlineIssueQty" class="form-input" value="' + qtyVal + '" min="1" style="margin-bottom: 8px;">' +
            '</div>' +
        '</div>' +
        '<div style="margin-bottom: 12px;">' +
            '<label class="form-label" style="font-size: 11px;">Parts (from catalog or manual)</label>' +
            partHtml +
            '<div id="issuePartSearchArea">' +
                '<input type="text" id="inlineIssuePartSearch" class="form-input" placeholder="Search parts catalog..." oninput="searchIssueParts(this.value)" autocomplete="off">' +
                '<div id="inlineIssuePartResults" style="max-height: 200px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 6px; display: none; margin-top: 4px;"></div>' +
                '<div style="margin-top: 6px;">' +
                    '<a href="#" onclick="event.preventDefault(); toggleManualPartEntry();" style="font-size: 12px; color: #6c757d;">Or enter manually</a>' +
                '</div>' +
                '<input type="text" id="inlineIssueManualPart" class="form-input" placeholder="Describe part needed..." value="' + manualPartVal + '" style="display: ' + (manualPartVal ? 'block' : 'none') + '; margin-top: 6px;">' +
            '</div>' +
        '</div>' +
        '<div style="display: flex; gap: 8px;">' +
            '<button class="btn btn-primary" onclick="saveInlineIssue(\'' + type + '\')" style="flex: 1; padding: 10px;">Save Issue</button>' +
            '<button class="btn btn-outline" onclick="cancelInlineIssue(\'' + type + '\')" style="padding: 10px;">Cancel</button>' +
        '</div>' +
    '</div>';
}

// Toggle manual part entry field
function toggleManualPartEntry() {
    var el = document.getElementById('inlineIssueManualPart');
    if (el.style.display === 'none') {
        el.style.display = 'block';
        el.focus();
    } else {
        el.style.display = 'none';
        el.value = '';
    }
}

// Handle photo capture for inline issue
function handleInlineIssuePhoto(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            _editingIssuePhoto = e.target.result;
            document.getElementById('inlineIssuePhotoPreview').innerHTML =
                '<img src="' + e.target.result + '" style="max-width: 100%; max-height: 100px; border-radius: 8px; object-fit: cover;">';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Search parts catalog from inline issue
function searchIssueParts(query) {
    clearTimeout(_issuePartSearchTimeout);
    var resultsEl = document.getElementById('inlineIssuePartResults');

    if (!query || query.length < 2) {
        resultsEl.style.display = 'none';
        return;
    }

    resultsEl.style.display = 'block';
    resultsEl.innerHTML = '<div style="padding: 12px; text-align: center; color: #6c757d; font-size: 13px;">Searching...</div>';

    _issuePartSearchTimeout = setTimeout(function() {
        PartsAPI.search(query, null, null, 20)
            .then(function(data) {
                if (!data.parts || data.parts.length === 0) {
                    resultsEl.innerHTML = '<div style="padding: 12px; text-align: center; color: #6c757d; font-size: 13px;">No parts found</div>';
                    return;
                }
                // Store parts for selection by index
                window._issuePartResults = data.parts;
                resultsEl.innerHTML = data.parts.map(function(part, idx) {
                    var isOfficeOrAdmin = currentRole === 'admin' || currentRole === 'office';
                    var price = parseFloat(part.price) || 0;
                    var priceStr = (isOfficeOrAdmin && price > 0) ? '$' + price.toFixed(2) : '';
                    var imgHtml = part.imageUrl
                        ? '<img src="' + part.imageUrl + '" style="width: 36px; height: 36px; object-fit: cover; border-radius: 4px; margin-right: 8px;">'
                        : '';
                    return '<div onclick="selectIssuePartByIndex(' + idx + ')" style="display: flex; align-items: center; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0;" onmouseover="this.style.background=\'#f0f7ff\'" onmouseout="this.style.background=\'white\'">' +
                        imgHtml +
                        '<div style="flex: 1;">' +
                            '<div style="font-size: 13px; font-weight: 600;">' + (part.partNumber || '—') + ' <span style="font-weight: 400; color: #888;">' + (part.vendor || '') + '</span></div>' +
                            '<div style="font-size: 12px; color: #555;">' + (part.productName || '') + '</div>' +
                        '</div>' +
                        (priceStr ? '<div style="font-size: 12px; font-weight: 600; color: #2e7d32; white-space: nowrap;">' + priceStr + '</div>' : '') +
                    '</div>';
                }).join('');
            })
            .catch(function(err) {
                resultsEl.innerHTML = '<div style="padding: 12px; text-align: center; color: #dc3545; font-size: 13px;">Search failed</div>';
            });
    }, 300);
}

// Select a part by index from search results — adds to list
function selectIssuePartByIndex(idx) {
    var part = window._issuePartResults && window._issuePartResults[idx];
    if (!part) return;

    var newPart = {
        id: part.id,
        partNumber: part.partNumber || '',
        productName: part.productName || '',
        vendor: part.vendor || '',
        price: parseFloat(part.price) || 0
    };

    // Don't add duplicates
    var isDupe = _editingIssueParts.some(function(p) { return p.id === newPart.id; });
    if (isDupe) return;

    _editingIssueParts.push(newPart);

    // Clear search, keep it visible for more parts
    document.getElementById('inlineIssuePartResults').style.display = 'none';
    document.getElementById('inlineIssuePartSearch').value = '';

    // Re-render badges
    renderIssuePartBadges();
}

// Remove a part by index
function removeIssuePart(idx) {
    _editingIssueParts.splice(idx, 1);
    renderIssuePartBadges();
}

// Render the part badges above the search area
function renderIssuePartBadges() {
    var container = document.getElementById('inlineIssuePartBadges');
    var searchArea = document.getElementById('issuePartSearchArea');

    if (!container) {
        container = document.createElement('div');
        container.id = 'inlineIssuePartBadges';
        searchArea.parentElement.insertBefore(container, searchArea);
    }

    if (_editingIssueParts.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = _editingIssueParts.map(function(p, pi) {
        return '<div style="display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #e3f2fd; border-radius: 6px; margin-bottom: 4px;">' +
            '<div style="flex: 1;">' +
                '<div style="font-weight: 600; font-size: 12px;">' + (p.partNumber || '') + ' <span style="font-weight: 400; color: #888;">' + (p.vendor || '') + '</span></div>' +
                '<div style="font-size: 11px; color: #555;">' + (p.productName || '') + '</div>' +
            '</div>' +
            '<button onclick="removeIssuePart(' + pi + ')" style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 14px; padding: 2px;">×</button>' +
        '</div>';
    }).join('');
}

// Save inline issue
function saveInlineIssue(type) {
    var desc = document.getElementById('inlineIssueDesc').value.trim();
    if (!desc) {
        alert('Please enter a description');
        return;
    }

    if (!_editingIssuePhoto) {
        // Highlight photo area with red border
        var photoEl = document.getElementById('inlineIssuePhotoPreview');
        photoEl.style.borderColor = '#dc3545';
        photoEl.style.borderWidth = '3px';
        alert('Photo is required for each issue');
        return;
    }

    var bank = currentJob.banks[currentBankIndex];
    var qty = parseInt(document.getElementById('inlineIssueQty').value) || 1;
    var manualPart = document.getElementById('inlineIssueManualPart').value.trim();

    var issue = {
        id: _editingIssueIndex >= 0 ? (type === 'topSide' ? bank.topSideIssues[_editingIssueIndex].id : bank.understructureIssues[_editingIssueIndex].id) : Date.now(),
        description: desc,
        photo: _editingIssuePhoto,
        parts: _editingIssueParts.map(function(p) { return Object.assign({}, p); }),
        // Keep singular part for backwards compat
        part: _editingIssueParts.length > 0 ? Object.assign({}, _editingIssueParts[0]) : null,
        manualPart: manualPart || null,
        quantity: qty,
        createdAt: _editingIssueIndex >= 0 ? (type === 'topSide' ? bank.topSideIssues[_editingIssueIndex].createdAt : bank.understructureIssues[_editingIssueIndex].createdAt) : new Date().toISOString()
    };

    if (type === 'topSide') {
        issue.section = document.getElementById('inlineIssueSection').value;
        issue.row = document.getElementById('inlineIssueRow').value;
        issue.aisle = document.getElementById('inlineIssueAisle').value;
        if (_editingIssueIndex >= 0) {
            bank.topSideIssues[_editingIssueIndex] = issue;
        } else {
            bank.topSideIssues.push(issue);
        }
    } else {
        issue.frame = document.getElementById('inlineIssueFrame').value;
        issue.tier = document.getElementById('inlineIssueTier').value;
        if (_editingIssueIndex >= 0) {
            bank.understructureIssues[_editingIssueIndex] = issue;
        } else {
            bank.understructureIssues.push(issue);
        }
    }

    // Reset editing state
    _editingIssueType = null;
    _editingIssueIndex = -1;
    _editingIssuePhoto = null;
    _editingIssueParts = [];

    renderTopSideIssues();
    renderUnderstructureIssues();
    renderIssueTally();
}

// Render compact issue card (collapsed)
function renderIssueCard(issue, type, index) {
    var locationHtml = '';
    if (type === 'topSide') {
        var parts = [];
        if (issue.section) parts.push('Sec ' + issue.section);
        if (issue.row) parts.push('Row ' + issue.row);
        if (issue.aisle) parts.push('Aisle ' + issue.aisle);
        if (parts.length > 0) locationHtml = '<span style="font-size: 11px; color: #1565c0;">' + parts.join(' | ') + '</span>';
    } else {
        var parts = [];
        if (issue.frame) parts.push('Frame ' + issue.frame);
        if (issue.tier) parts.push('Tier ' + issue.tier);
        if (parts.length > 0) locationHtml = '<span style="font-size: 11px; color: #c2185b;">' + parts.join(' | ') + '</span>';
    }

    var photoHtml = issue.photo
        ? '<img src="' + issue.photo + '" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px; flex-shrink: 0;">'
        : '';

    var partBadge = '';
    var issueParts = issue.parts || (issue.part ? [issue.part] : []);
    if (issueParts.length > 0) {
        partBadge = issueParts.map(function(p) {
            return '<span style="display: inline-block; padding: 1px 6px; background: #e3f2fd; color: #1565c0; border-radius: 4px; font-size: 11px; font-weight: 600; margin-top: 4px; margin-right: 4px;">' + (p.partNumber || 'Part') + '</span>';
        }).join('');
    } else if (issue.manualPart) {
        partBadge = '<span style="display: inline-block; padding: 1px 6px; background: #fff3e0; color: #e65100; border-radius: 4px; font-size: 11px; margin-top: 4px;">' + issue.manualPart.substring(0, 30) + '</span>';
    }

    var qtyBadge = issue.quantity && issue.quantity > 1
        ? '<span style="display: inline-block; padding: 1px 6px; background: #e8f5e9; color: #2e7d32; border-radius: 4px; font-size: 11px; font-weight: 600; margin-left: 4px;">x' + issue.quantity + '</span>'
        : '';

    return '<div onclick="editIssue(\'' + type + '\', ' + index + ')" style="background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 10px 12px; margin-bottom: 6px; display: flex; gap: 10px; cursor: pointer; transition: border-color 0.15s;" onmouseover="this.style.borderColor=\'#007bff\'" onmouseout="this.style.borderColor=\'#e9ecef\'">' +
        photoHtml +
        '<div style="flex: 1; min-width: 0;">' +
            (locationHtml ? '<div style="margin-bottom: 2px;">' + locationHtml + '</div>' : '') +
            '<div style="font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + issue.description + '</div>' +
            (partBadge || qtyBadge ? '<div>' + partBadge + qtyBadge + '</div>' : '') +
        '</div>' +
        '<button onclick="event.stopPropagation(); deleteIssue(\'' + type + '\', ' + index + ')" style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 16px; flex-shrink: 0;">×</button>' +
    '</div>';
}

// Render top side issues list
function renderTopSideIssues() {
    var bank = currentJob.banks[currentBankIndex];
    var container = document.getElementById('topSideIssuesList');
    var issues = bank.topSideIssues || [];

    var html = '';

    if (issues.length === 0 && _editingIssueType !== 'topSide') {
        html = '<div style="text-align: center; padding: 20px; color: #6c757d; background: #f8f9fa; border-radius: 8px;">' +
            '<p style="font-size: 13px;">No top side issues yet</p>' +
            '<p style="font-size: 12px; margin-top: 4px;">Tap + Add Issue to document problems</p>' +
        '</div>';
    } else {
        issues.forEach(function(issue, i) {
            if (_editingIssueType === 'topSide' && _editingIssueIndex === i) {
                html += buildInlineIssueForm('topSide', issue);
            } else {
                html += renderIssueCard(issue, 'topSide', i);
            }
        });
    }

    // Show new issue form at the bottom if adding new
    if (_editingIssueType === 'topSide' && _editingIssueIndex === -1) {
        html += buildInlineIssueForm('topSide', null);
    }

    container.innerHTML = html;
}

// Render understructure issues list
function renderUnderstructureIssues() {
    var bank = currentJob.banks[currentBankIndex];
    var container = document.getElementById('understructureIssuesList');
    var issues = bank.understructureIssues || [];

    var html = '';

    if (issues.length === 0 && _editingIssueType !== 'understructure') {
        html = '<div style="text-align: center; padding: 20px; color: #6c757d; background: #f8f9fa; border-radius: 8px;">' +
            '<p style="font-size: 13px;">No understructure issues yet</p>' +
            '<p style="font-size: 12px; margin-top: 4px;">Tap + Add Issue to document problems</p>' +
        '</div>';
    } else {
        issues.forEach(function(issue, i) {
            if (_editingIssueType === 'understructure' && _editingIssueIndex === i) {
                html += buildInlineIssueForm('understructure', issue);
            } else {
                html += renderIssueCard(issue, 'understructure', i);
            }
        });
    }

    // Show new issue form at the bottom if adding new
    if (_editingIssueType === 'understructure' && _editingIssueIndex === -1) {
        html += buildInlineIssueForm('understructure', null);
    }

    container.innerHTML = html;
}

// Delete issue
function deleteIssue(type, index) {
    var bank = currentJob.banks[currentBankIndex];
    if (type === 'topSide') {
        bank.topSideIssues.splice(index, 1);
    } else {
        bank.understructureIssues.splice(index, 1);
    }
    renderTopSideIssues();
    renderUnderstructureIssues();
    renderIssueTally();
}

// Legacy delete functions (keep for any remaining references)
function deleteTopSideIssue(index) { deleteIssue('topSide', index); }
function deleteUnderstructureIssue(index) { deleteIssue('understructure', index); }

// ==========================================
// ISSUE TALLY SUMMARY
// Auto-generated summary from all issues
// ==========================================

function renderIssueTally() {
    var bank = currentJob.banks[currentBankIndex];
    var container = document.getElementById('issueTallyContainer');
    if (!container) return;

    var allIssues = (bank.topSideIssues || []).concat(bank.understructureIssues || []);
    if (allIssues.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">' +
            '<p>No issues documented yet</p>' +
            '<p style="font-size: 12px; margin-top: 4px;">Issues will be tallied here automatically</p>' +
        '</div>';
        return;
    }

    // Group by part — each issue can have multiple parts
    var tally = {};
    var totalParts = 0;
    allIssues.forEach(function(issue) {
        var qty = issue.quantity || 1;
        var issueParts = issue.parts || (issue.part ? [issue.part] : []);

        if (issueParts.length > 0) {
            issueParts.forEach(function(p) {
                var key = 'part_' + (p.partNumber || p.productName);
                var label = (p.partNumber ? p.partNumber + ' - ' : '') + (p.productName || 'Unknown Part');
                var vendor = p.vendor || '';
                var price = p.price || 0;
                if (tally[key]) {
                    tally[key].qty += qty;
                } else {
                    tally[key] = { label: label, vendor: vendor, price: parseFloat(price) || 0, qty: qty };
                }
                totalParts += qty;
            });
        } else if (issue.manualPart) {
            var key = 'manual_' + issue.manualPart;
            if (tally[key]) {
                tally[key].qty += qty;
            } else {
                tally[key] = { label: issue.manualPart, vendor: 'Manual entry', price: 0, qty: qty };
            }
            totalParts += qty;
        } else {
            var key = 'desc_' + issue.description;
            if (tally[key]) {
                tally[key].qty += qty;
            } else {
                tally[key] = { label: issue.description, vendor: '', price: 0, qty: qty };
            }
            totalParts += qty;
        }
    });

    var tallyKeys = Object.keys(tally);

    var html = '<div style="margin-bottom: 12px; display: flex; gap: 12px;">' +
        '<div style="background: #f3e5f5; padding: 8px 16px; border-radius: 8px; flex: 1; text-align: center;">' +
            '<div style="font-size: 20px; font-weight: 700; color: #7b1fa2;">' + allIssues.length + '</div>' +
            '<div style="font-size: 11px; color: #7b1fa2;">Issues</div>' +
        '</div>' +
        '<div style="background: #e3f2fd; padding: 8px 16px; border-radius: 8px; flex: 1; text-align: center;">' +
            '<div style="font-size: 20px; font-weight: 700; color: #1565c0;">' + tallyKeys.length + '</div>' +
            '<div style="font-size: 11px; color: #1565c0;">Unique Items</div>' +
        '</div>' +
        '<div style="background: #e8f5e9; padding: 8px 16px; border-radius: 8px; flex: 1; text-align: center;">' +
            '<div style="font-size: 20px; font-weight: 700; color: #2e7d32;">' + totalParts + '</div>' +
            '<div style="font-size: 11px; color: #2e7d32;">Total Qty</div>' +
        '</div>' +
    '</div>';

    html += '<div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">';
    tallyKeys.forEach(function(key, i) {
        var item = tally[key];
        var isOfficeOrAdmin = currentRole === 'admin' || currentRole === 'office';
        var priceHtml = (isOfficeOrAdmin && item.price > 0) ? '<span style="color: #2e7d32; font-weight: 600;">$' + (item.price * item.qty).toFixed(2) + '</span>' : '';
        html += '<div style="padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;' + (i < tallyKeys.length - 1 ? ' border-bottom: 1px solid #f0f0f0;' : '') + '">' +
            '<div style="flex: 1;">' +
                '<div style="font-size: 13px; font-weight: 600;">' + item.qty + 'x ' + item.label + '</div>' +
                (item.vendor ? '<div style="font-size: 11px; color: #888;">' + item.vendor + '</div>' : '') +
            '</div>' +
            priceHtml +
        '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
}

// Save bank and go back to overview
function saveBankAndAddAnother() {
    saveBankData();
    goBackToJobOverview();
}

// Save bank and finish job
function saveBankAndFinishJob() {
    saveBankData();
    showJobSummary();
}

// ==========================================
// JOB SUMMARY
// Final review and submission
// ==========================================

// Show job summary
function showJobSummary() {
    hideAllViews();
    document.getElementById('jobSummaryView').classList.remove('hidden');

    // Populate summary
    document.getElementById('summaryJobNumber').textContent = currentJob.jobNumber;
    document.getElementById('summaryCustomerName').textContent = currentJob.locationName;
    document.getElementById('summaryAddress').textContent = currentJob.locationAddress;
    document.getElementById('summaryBankCount').textContent = currentJob.banks.length;

    // Count total issues
    let totalIssues = 0;
    currentJob.banks.forEach(bank => {
        totalIssues += (bank.topSideIssues?.length || 0) + (bank.understructureIssues?.length || 0);
    });
    document.getElementById('summaryIssueCount').textContent = totalIssues;

    // Render banks list with detailed issue breakdown
    document.getElementById('summaryBanksList').innerHTML = currentJob.banks.map((bank, bankIndex) => {
        const underIssues = bank.understructureIssues || [];
        const topIssues = bank.topSideIssues || [];
        const totalIssues = underIssues.length + topIssues.length;

        let issuesHTML = '';
        if (totalIssues > 0) {
            // Show individual issues
            if (underIssues.length > 0 || topIssues.length > 0) {
                issuesHTML += `<details style="margin-top: 12px;">
                    <summary style="cursor: pointer; font-size: 13px; color: #0066cc;">View ${totalIssues} detailed issue${totalIssues !== 1 ? 's' : ''}</summary>
                    <div style="padding: 12px 0;">`;

                if (underIssues.length > 0) {
                    issuesHTML += `<div style="font-size: 11px; font-weight: 600; color: #6c757d; text-transform: uppercase; margin-bottom: 4px;">Understructure</div>`;
                    underIssues.forEach(issue => {
                        var partInfo = '';
                        var issueParts = issue.parts || (issue.part ? [issue.part] : []);
                        if (issueParts.length > 0) partInfo = issueParts.map(function(p) { return `<span style="background: #e3f2fd; color: #1565c0; padding: 1px 6px; border-radius: 3px; font-size: 11px; margin-left: 4px;">${p.partNumber || p.productName}</span>`; }).join('');
                        else if (issue.manualPart) partInfo = `<span style="background: #fff3e0; color: #e65100; padding: 1px 6px; border-radius: 3px; font-size: 11px; margin-left: 6px;">${issue.manualPart.substring(0, 30)}</span>`;
                        var qtyInfo = issue.quantity > 1 ? `<span style="background: #e8f5e9; color: #2e7d32; padding: 1px 6px; border-radius: 3px; font-size: 11px; margin-left: 4px;">x${issue.quantity}</span>` : '';
                        issuesHTML += `<div style="font-size: 13px; padding: 4px 0; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 6px;">
                            ${issue.photo ? `<img src="${issue.photo}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 3px;">` : ''}
                            <div style="flex: 1;">
                                ${issue.frame ? `<span style="color: #e65100;">Frame ${issue.frame}</span>` : ''}
                                ${issue.tier ? `<span style="color: #6c757d;"> Tier ${issue.tier}</span>` : ''}
                                ${issue.frame || issue.tier ? ' - ' : ''}${issue.description}
                                ${partInfo}${qtyInfo}
                            </div>
                        </div>`;
                    });
                }

                if (topIssues.length > 0) {
                    issuesHTML += `<div style="font-size: 11px; font-weight: 600; color: #6c757d; text-transform: uppercase; margin: 12px 0 4px;">Top Side</div>`;
                    topIssues.forEach(issue => {
                        var partInfo = '';
                        var issueParts = issue.parts || (issue.part ? [issue.part] : []);
                        if (issueParts.length > 0) partInfo = issueParts.map(function(p) { return `<span style="background: #e3f2fd; color: #1565c0; padding: 1px 6px; border-radius: 3px; font-size: 11px; margin-left: 4px;">${p.partNumber || p.productName}</span>`; }).join('');
                        else if (issue.manualPart) partInfo = `<span style="background: #fff3e0; color: #e65100; padding: 1px 6px; border-radius: 3px; font-size: 11px; margin-left: 6px;">${issue.manualPart.substring(0, 30)}</span>`;
                        var qtyInfo = issue.quantity > 1 ? `<span style="background: #e8f5e9; color: #2e7d32; padding: 1px 6px; border-radius: 3px; font-size: 11px; margin-left: 4px;">x${issue.quantity}</span>` : '';
                        issuesHTML += `<div style="font-size: 13px; padding: 4px 0; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 6px;">
                            ${issue.photo ? `<img src="${issue.photo}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 3px;">` : ''}
                            <div style="flex: 1;">
                                ${issue.section ? `<span style="color: #0066cc;">Section ${issue.section}</span>` : ''}
                                ${issue.row ? `<span style="color: #6c757d;"> Row ${issue.row}</span>` : ''}
                                ${issue.section || issue.row ? ' - ' : ''}${issue.description}
                                ${partInfo}${qtyInfo}
                            </div>
                        </div>`;
                    });
                }

                issuesHTML += `</div></details>`;
            }
        }

        return `
        <div style="border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <div style="font-weight: 600; font-size: 16px;">${bank.name}</div>
                    <div style="font-size: 13px; color: #6c757d; margin-top: 4px;">
                        ${bank.bleacherType || 'Unknown'} • ${bank.tiers || '?'} tiers • ${bank.sections || '?'} sections • ${bank.aisles || '?'} aisles
                    </div>
                    <div style="font-size: 12px; color: #999; margin-top: 2px;">
                        ${bank.numberOfMotors || '?'} motors • ${bank.wheelType || 'Unknown wheels'}
                    </div>
                </div>
                <div style="background: ${totalIssues > 0 ? '#fff3e0' : '#e8f5e9'}; padding: 6px 12px; border-radius: 4px;">
                    <span style="font-weight: 600; color: ${totalIssues > 0 ? '#e65100' : '#2e7d32'};">${totalIssues}</span>
                    <span style="font-size: 12px; color: #6c757d;"> issues</span>
                </div>
            </div>
            ${issuesHTML}
        </div>
    `}).join('');

    // Parts
    document.getElementById('summaryPartsCount').textContent = currentJob.selectedParts?.length || 0;
    renderSummaryParts();

    // Pre-fill inspector info from currentJob if it exists (for viewing submitted jobs)
    if (currentJob.inspectorName) {
        document.getElementById('inspectorName').value = currentJob.inspectorName;
    }
    if (currentJob.inspectorCertificate) {
        document.getElementById('inspectorCertificate').value = currentJob.inspectorCertificate;
    }

    // Update submit button based on job status
    const submitBtn = document.querySelector('#jobSummaryView .btn-primary');
    const backBtn = document.querySelector('#jobSummaryView .btn-secondary');
    if (currentJob.status === 'submitted' || currentJob.status === 'under_review') {
        if (currentRole === 'admin' || currentRole === 'office') {
            submitBtn.innerHTML = '📤 Generate QuickBooks Estimate';
            submitBtn.onclick = () => generateEstimateFromJob();
            submitBtn.style.display = '';
        } else {
            submitBtn.style.display = 'none';
        }
        backBtn.textContent = currentRole === 'admin' || currentRole === 'office' ? '← Back to Ops Review' : '← Back';
        backBtn.onclick = () => goBackFromInspection();
    } else if (currentJob.status === 'approved') {
        submitBtn.style.display = 'none';
        backBtn.textContent = '← Back to Ops Review';
        backBtn.onclick = () => goBackFromInspection();
    } else {
        submitBtn.innerHTML = '✅ Submit Inspection';
        submitBtn.onclick = () => submitJob();
        submitBtn.style.display = '';
        backBtn.textContent = '← Back to Inspection';
        backBtn.onclick = () => backToInspection();
    }
}

// Render summary parts
function renderSummaryParts() {
    const container = document.getElementById('summaryPartsList');
    if (!currentJob.selectedParts || currentJob.selectedParts.length === 0) {
        container.innerHTML = '<p style="color: #6c757d; text-align: center;">No parts added yet</p>';
    } else {
        container.innerHTML = currentJob.selectedParts.map((part, i) => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                <div>
                    <span style="font-weight: 600;">${part.partNumber}</span>
                    <span style="color: #6c757d;"> - ${part.description}</span>
                </div>
                <div>Qty: ${part.quantity}</div>
            </div>
        `).join('');
    }
}

// Back to inspection from summary
function backToInspection() {
    showJobOverview();
}

// Submit job
function submitJob() {
    currentJob.status = 'submitted';
    currentJob.submittedAt = new Date().toISOString();
    currentJob.inspectorName = document.getElementById('inspectorName').value;
    currentJob.inspectorCertificate = document.getElementById('inspectorCertificate').value;

    // Save to storage
    const existingIndex = inspectionJobs.findIndex(j => j.jobNumber === currentJob.jobNumber);
    if (existingIndex >= 0) {
        inspectionJobs[existingIndex] = currentJob;
    } else {
        inspectionJobs.push(currentJob);
    }
    localStorage.setItem('inspectionJobs', JSON.stringify(inspectionJobs));

    alert(`✅ Job ${currentJob.jobNumber} submitted successfully!\n\n🎉 ${currentJob.banks.length} bank(s) inspected.\n\nOffice staff can now review and generate a QuickBooks estimate.`);

    currentJob = null;
    goBackFromInspection();
    loadInspectionJobs();
}

// Generate estimate from a submitted job
function generateEstimateFromJob() {
    if (!currentJob) {
        alert('No job selected');
        return;
    }

    // Count issues and create line items
    let issueLines = [];
    currentJob.banks.forEach(bank => {
        const underIssues = bank.understructureIssues || [];
        const topIssues = bank.topSideIssues || [];

        underIssues.forEach(issue => {
            issueLines.push(`[${bank.name}] Understructure: ${issue.description}`);
        });
        topIssues.forEach(issue => {
            issueLines.push(`[${bank.name}] Top Side: ${issue.description}`);
        });
    });

    const partsCount = currentJob.selectedParts?.length || 0;
    const issueCount = issueLines.length;

    let message = `Generate QuickBooks Estimate?\n\n`;
    message += `Job ${currentJob.jobNumber}\n`;
    message += `Customer: ${currentJob.locationName}\n`;
    message += `Address: ${currentJob.locationAddress}\n\n`;
    message += `Banks: ${currentJob.banks.length}\n`;
    message += `Issues Found: ${issueCount}\n`;
    message += `Parts Added: ${partsCount}\n`;

    if (!confirm(message)) return;

    // Mark inspection as approved
    currentJob.status = 'approved';
    currentJob.reviewedBy = currentRole === 'admin' ? 'Admin' : 'Office';
    currentJob.reviewedAt = new Date().toISOString();

    // Save inspection status
    const idx = inspectionJobs.findIndex(j => j.jobNumber === currentJob.jobNumber);
    if (idx >= 0) inspectionJobs[idx] = currentJob;
    localStorage.setItem('inspectionJobs', JSON.stringify(inspectionJobs));

    // Determine job type
    const jobType = currentJob.inspectionType === 'basketball' ? 'Repair' :
                    (currentJob.selectedParts?.length > 0 ? 'Repair' : 'Inspection');

    // Create work order with SAME job number
    const newWorkOrder = {
        jobNumber: String(currentJob.jobNumber),
        jobType: jobType,
        status: 'Estimate Sent',
        customerId: currentJob.customerId,
        locationId: currentJob.locationId,
        locationName: currentJob.locationName,
        address: currentJob.locationAddress,
        contactName: '',
        contactPhone: '',
        description: `${currentJob.inspectionType === 'basketball' ? 'Basketball Goal' : currentJob.inspectionType === 'bleacher' ? 'Indoor Bleacher' : 'Outdoor Bleacher'} - ${jobType}. ${issueCount} issues found across ${currentJob.banks.length} bank(s).`,
        partsLocation: '',
        specialInstructions: '',
        scheduledDate: '',
        scheduledTime: '',
        assignedTo: '',
        confirmedWith: '',
        confirmedBy: '',
        confirmedDate: '',
        inspectionJobNumber: currentJob.jobNumber,
        createdAt: new Date().toISOString()
    };

    // Save work order
    const workOrders = JSON.parse(localStorage.getItem('appWorkOrders') || '[]');
    workOrders.push(newWorkOrder);
    localStorage.setItem('appWorkOrders', JSON.stringify(workOrders));

    alert(`Estimate generated for Job ${currentJob.jobNumber}\n\n` +
          `Customer: ${currentJob.locationName}\n` +
          `Status: Approved\n` +
          `Work order created.\n\n` +
          `QuickBooks integration coming soon - this will auto-push the estimate.`);

    // Return to Ops Review
    currentJob = null;
    if (currentRole === 'office' || currentRole === 'admin') {
        backToOpsReview();
    } else {
        goBackFromInspection();
    }
}

// ==========================================
// JOB LIST & RESUME
// Loading, viewing, resuming jobs
// ==========================================

// Go back to job list
function goBackToJobList() {
    if (currentJob) {
        saveBankData();
        // Save in-progress job
        const existingIndex = inspectionJobs.findIndex(j => j.jobNumber === currentJob.jobNumber);
        if (existingIndex >= 0) {
            inspectionJobs[existingIndex] = currentJob;
        } else {
            inspectionJobs.push(currentJob);
        }
        localStorage.setItem('inspectionJobs', JSON.stringify(inspectionJobs));
    }
    currentJob = null;
    goBackFromInspection();
    loadInspectionJobs();
}

// Load inspection jobs list
function loadInspectionJobs() {
    const inProgressContainer = document.getElementById('inProgressJobsList');
    const submittedContainer = document.getElementById('submittedJobsList');

    if (!inProgressContainer || !submittedContainer) return;

    const inProgress = inspectionJobs.filter(j => j.status === 'in_progress');
    const submitted = inspectionJobs.filter(j => j.status === 'submitted');

    document.getElementById('inProgressJobsCount').textContent = inProgress.length;
    document.getElementById('submittedJobsCount').textContent = submitted.length;

    let totalBanks = 0;
    inspectionJobs.forEach(j => totalBanks += (j.banks?.length || 0));
    document.getElementById('totalBanksCount').textContent = totalBanks;

    if (inProgress.length === 0) {
        inProgressContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: #6c757d;">No jobs in progress</div>';
    } else {
        inProgressContainer.innerHTML = inProgress.map(job => `
            <div onclick="resumeJob(${job.jobNumber})" style="padding: 16px; border-bottom: 1px solid #e9ecef; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600;">Job ${job.jobNumber}</div>
                    <div style="font-size: 14px; color: #6c757d;">${job.locationName}</div>
                    <div style="font-size: 12px; color: #e65100;">${job.banks?.length || 0} bank(s) • ${new Date(job.createdAt).toLocaleDateString()}</div>
                </div>
                <span style="color: #4CAF50; font-size: 20px;">→</span>
            </div>
        `).join('');
    }

    if (submitted.length === 0) {
        submittedContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: #6c757d;">No submitted jobs</div>';
    } else {
        submittedContainer.innerHTML = submitted.map(job => `
            <div style="padding: 16px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
                <div onclick="viewSubmittedJob(${job.jobNumber})" style="cursor: pointer; flex: 1;">
                    <div style="font-weight: 600;">Job ${job.jobNumber}</div>
                    <div style="font-size: 14px; color: #6c757d;">${job.locationName}</div>
                    <div style="font-size: 12px; color: #2e7d32;">${job.banks?.length || 0} bank(s) • Submitted ${new Date(job.submittedAt).toLocaleDateString()}</div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button onclick="editSubmittedJob(${job.jobNumber})" style="padding: 6px 12px; font-size: 12px; background: #fff3e0; color: #e65100; border: 1px solid #e65100; border-radius: 6px; cursor: pointer;">Edit</button>
                    <span class="badge badge-success">Submitted</span>
                </div>
            </div>
        `).join('');
    }
}

// Resume in-progress job
function resumeJob(jobNumber) {
    currentJob = inspectionJobs.find(j => j.jobNumber === jobNumber);
    if (currentJob) {
        showJobOverview('myjobs');
    }
}

// View submitted job (read-only summary)
function viewSubmittedJob(jobNumber) {
    currentJob = inspectionJobs.find(j => j.jobNumber === jobNumber);
    if (currentJob) {
        // For office users, need to switch to tech dashboard to see job summary
        if (currentRole === 'office') {
            document.getElementById('officeDashboard').classList.add('hidden');
            document.getElementById('techDashboard').classList.remove('hidden');
        }
        showJobSummary();
    }
}

// Edit a submitted job (reopen for editing)
function editSubmittedJob(jobNumber) {
    currentJob = inspectionJobs.find(j => j.jobNumber === jobNumber);
    if (currentJob) {
        currentJob.status = 'in_progress';
        const idx = inspectionJobs.findIndex(j => j.jobNumber === jobNumber);
        if (idx >= 0) inspectionJobs[idx] = currentJob;
        localStorage.setItem('inspectionJobs', JSON.stringify(inspectionJobs));
        showJobOverview('inspections');
    }
}

// ==========================================
// VIEW HELPERS & UTILITIES
// View management, checklist rendering, inspection type handling
// ==========================================

// Hide all views helper
function hideAllViews() {
    const views = ['techInspectionsView', 'techCreateView', 'newJobSetupView', 'bankInspectionView', 'jobSummaryView', 'newInspectionView', 'fieldCreateView', 'techHomeView', 'techSearchView', 'techMyJobsView', 'techTeamScheduleView', 'jobOverviewView'];
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add('hidden');
    });
}

// Open parts search from summary
function openPartsSearch() {
    // For now, show alert. In full version, would open parts modal
    alert('Parts search will open here. For now, add parts from the main inspection form.');
}

// Inspection type change handler
function onInspectionTypeChange() {
    const type = document.getElementById('inspectionTypeSelect').value;
    currentInspectionType = type;

    // Show/hide form fields
    document.getElementById('inspectionFormFields').classList.toggle('hidden', !type);
    document.getElementById('basketballFields').classList.add('hidden');
    document.getElementById('bleacherFields').classList.add('hidden');
    document.getElementById('outdoorFields').classList.add('hidden');
    document.getElementById('manufacturerSection').classList.add('hidden');

    if (type === 'basketball') {
        document.getElementById('basketballFields').classList.remove('hidden');
        document.getElementById('manufacturerSection').classList.remove('hidden');
        renderChecklist('bbChecklist', CHECKLISTS.basketball);
        goalInspections = [];
        document.getElementById('goalInspectionsContainer').innerHTML = '<p style="color: #6c757d; text-align: center;">Click "Add Goal" to inspect each basketball goal</p>';
    } else if (type === 'bleacher') {
        document.getElementById('bleacherFields').classList.remove('hidden');
        document.getElementById('manufacturerSection').classList.remove('hidden');
        renderChecklist('blUnderstructureChecklist', CHECKLISTS.bleacherUnderstructure);
        renderChecklist('blTopSideChecklist', CHECKLISTS.bleacherTopSide);
        bleacherIssues = [];
        renderBleacherIssues();
    } else if (type === 'outdoor') {
        document.getElementById('outdoorFields').classList.remove('hidden');
        document.getElementById('manufacturerSection').classList.remove('hidden');
        renderChecklist('outUnderstructureChecklist', CHECKLISTS.outdoorUnderstructure);
        renderChecklist('outTopSideChecklist', CHECKLISTS.outdoorTopSide);
        outdoorIssues = [];
        renderOutdoorIssues();
    }

    // Reset form
    currentInspection = { selectedParts: [], inspectionType: type };
    renderSelectedParts();
}

// Render checklist items
function renderChecklist(containerId, items) {
    const container = document.getElementById(containerId);
    container.innerHTML = items.map((item, i) => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid #e9ecef;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1;">
                <input type="checkbox" id="${containerId}_${i}" style="width: 20px; height: 20px; cursor: pointer;">
                <span style="font-size: 14px;">${item}</span>
            </label>
            <label style="display: flex; align-items: center; gap: 4px; color: #6c757d; font-size: 12px;">
                <input type="checkbox" id="${containerId}_${i}_na" style="cursor: pointer;"> N/A
            </label>
        </div>
    `).join('');
}

// Add basketball goal inspection
function addGoalInspection() {
    const goalNum = goalInspections.length + 1;
    goalInspections.push({ goalNumber: goalNum });

    const container = document.getElementById('goalInspectionsContainer');
    if (goalNum === 1) container.innerHTML = '';

    container.innerHTML += `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #4CAF50;">
            <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Goal #${goalNum}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                <div class="form-group" style="margin-bottom: 12px;">
                    <label class="form-label" style="font-size: 12px;">Goal Type</label>
                    <select id="goal${goalNum}_type" class="form-select">
                        <option value="Main">Main</option>
                        <option value="Side">Side</option>
                        <option value="Practice">Practice</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label class="form-label" style="font-size: 12px;">Backboard Type</label>
                    <select id="goal${goalNum}_backboard" class="form-select">
                        <option value="">Select...</option>
                        <option value="Glass 72x42">Glass 72" x 42"</option>
                        <option value="Acrylic 72x42">Acrylic 72" x 42"</option>
                        <option value="Acrylic wood 72x42">Acrylic wood 72" x 42"</option>
                        <option value="Glass 60x42">Glass 60" x 42"</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label class="form-label" style="font-size: 12px;">Winch Type</label>
                    <select id="goal${goalNum}_winch" class="form-select">
                        <option value="Manual">Manual</option>
                        <option value="Electric">Electric</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label class="form-label" style="font-size: 12px;">Mast Type</label>
                    <input type="text" id="goal${goalNum}_mast" class="form-input" placeholder="e.g., Center Mast 6 5/8&quot;">
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label class="form-label" style="font-size: 12px;">Safety Strap Present</label>
                    <select id="goal${goalNum}_safetyStrap" class="form-select">
                        <option value="Yes Pipe Attached">Yes - Pipe Attached</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label class="form-label" style="font-size: 12px;">Safety Anchor</label>
                    <select id="goal${goalNum}_anchor" class="form-select">
                        <option value="Offset">Offset</option>
                        <option value="Direct">Direct</option>
                        <option value="N/A">N/A</option>
                    </select>
                </div>
            </div>
            <div class="form-group" style="margin-top: 12px;">
                <label class="form-label" style="font-size: 12px;">Parts and Repairs Recommendations</label>
                <textarea id="goal${goalNum}_recommendations" class="form-textarea" placeholder="No issues found, or describe repairs needed..." style="min-height: 60px;"></textarea>
            </div>
        </div>
    `;
}

// Legacy issue arrays for bleacher/outdoor single-form templates
let bleacherIssues = [];
let outdoorIssues = [];

// Add issue for bleacher/outdoor inspections (legacy templates)
function addIssue(type) {
    const description = prompt('Describe the issue:');
    if (!description || !description.trim()) return;

    const location = prompt('Location (e.g., Row 3, Section A):') || '';

    const issue = {
        id: Date.now(),
        description: description.trim(),
        location: location.trim(),
        timestamp: new Date().toISOString()
    };

    if (type === 'bleacher') {
        bleacherIssues.push(issue);
        renderBleacherIssues();
    } else if (type === 'outdoor') {
        outdoorIssues.push(issue);
        renderOutdoorIssues();
    }
}

// Render bleacher issues
function renderBleacherIssues() {
    const container = document.getElementById('bleacherIssuesContainer');
    if (!container) return;

    if (bleacherIssues.length === 0) {
        container.innerHTML = '<p style="color: #6c757d; text-align: center;">Click "Add Issue" to document problems found</p>';
        return;
    }

    container.innerHTML = bleacherIssues.map((issue, i) => `
        <div style="background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: start;">
            <div>
                ${issue.location ? `<div style="font-size: 12px; color: #1565c0; margin-bottom: 4px;">${issue.location}</div>` : ''}
                <div style="font-size: 14px;">${issue.description}</div>
            </div>
            <button onclick="deleteBleacherIssue(${i})" style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 16px;">×</button>
        </div>
    `).join('');
}

// Render outdoor issues
function renderOutdoorIssues() {
    const container = document.getElementById('outdoorIssuesContainer');
    if (!container) return;

    if (outdoorIssues.length === 0) {
        container.innerHTML = '<p style="color: #6c757d; text-align: center;">Click "Add Issue" to document problems found</p>';
        return;
    }

    container.innerHTML = outdoorIssues.map((issue, i) => `
        <div style="background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: start;">
            <div>
                ${issue.location ? `<div style="font-size: 12px; color: #1565c0; margin-bottom: 4px;">${issue.location}</div>` : ''}
                <div style="font-size: 14px;">${issue.description}</div>
            </div>
            <button onclick="deleteOutdoorIssue(${i})" style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 16px;">×</button>
        </div>
    `).join('');
}

// Delete issues
function deleteBleacherIssue(index) {
    bleacherIssues.splice(index, 1);
    renderBleacherIssues();
}

function deleteOutdoorIssue(index) {
    outdoorIssues.splice(index, 1);
    renderOutdoorIssues();
}
