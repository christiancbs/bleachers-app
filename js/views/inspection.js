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
    updateDashboardStats();

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

// Create job and add first bank
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

    // Add first bank
    currentBankIndex = 0;
    currentJob.banks.push(createNewBank('East Side'));

    // Show bank inspection view
    showBankInspection();
}

// Create a new bank object
function createNewBank(name) {
    return {
        name: name,
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
        safetyIssues: '',
        mechanicalIssues: '',
        cosmeticIssues: '',
        tagAffixed: 'yes'
    };
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

    // Render bank tabs
    renderBankTabs();

    // Load current bank data
    loadBankData();

    // Render checklists
    renderChecklist('topSideChecklist', CHECKLISTS.bleacherTopSide);
    renderChecklist('understructureChecklist', CHECKLISTS.bleacherUnderstructure);
}

// Render bank tabs
function renderBankTabs() {
    const container = document.getElementById('bankTabs');
    container.innerHTML = currentJob.banks.map((bank, i) => `
        <button class="btn ${i === currentBankIndex ? 'btn-primary' : 'btn-outline'}"
                onclick="switchToBank(${i})"
                style="font-size: 13px; padding: 8px 16px;">
            ${bank.name}
        </button>
    `).join('') + `
        <button class="btn btn-outline" onclick="addNewBank()" style="font-size: 13px; padding: 8px 16px; border-style: dashed;">
            + Add Bank
        </button>
    `;
}

// Switch to a different bank
function switchToBank(index) {
    saveBankData(); // Save current first
    currentBankIndex = index;
    loadBankData();
    renderBankTabs();
}

// Add new bank
function addNewBank() {
    saveBankData();
    const bankNames = ['East Side', 'West Side', 'Facing Logo', 'Behind Logo', 'North Side', 'South Side'];
    const usedNames = currentJob.banks.map(b => b.name);
    const nextName = bankNames.find(n => !usedNames.includes(n)) || `Bank ${currentJob.banks.length + 1}`;

    currentJob.banks.push(createNewBank(nextName));
    currentBankIndex = currentJob.banks.length - 1;
    loadBankData();
    renderBankTabs();
    document.getElementById('bankCount').textContent = currentJob.banks.length;
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
    document.getElementById('bankSafetyIssues').value = bank.safetyIssues || '';
    document.getElementById('bankMechanicalIssues').value = bank.mechanicalIssues || '';
    document.getElementById('bankCosmeticIssues').value = bank.cosmeticIssues || '';
    document.getElementById('bankTagAffixed').value = bank.tagAffixed || 'yes';

    renderTopSideIssues();
    renderUnderstructureIssues();
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
    bank.safetyIssues = document.getElementById('bankSafetyIssues').value;
    bank.mechanicalIssues = document.getElementById('bankMechanicalIssues').value;
    bank.cosmeticIssues = document.getElementById('bankCosmeticIssues').value;
    bank.tagAffixed = document.getElementById('bankTagAffixed').value;
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

    renderBankTabs();
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
// Add, edit, delete, and render issues
// ==========================================

// Open add issue modal
function openAddIssueModal() {
    document.getElementById('addIssueModal').classList.remove('hidden');
    document.getElementById('addIssueModal').style.display = 'flex';
    resetIssueModal();
}

// Close add issue modal
function closeAddIssueModal() {
    document.getElementById('addIssueModal').classList.add('hidden');
    document.getElementById('addIssueModal').style.display = 'none';
}

// Reset issue modal
function resetIssueModal() {
    currentIssueType = '';
    document.getElementById('issueTypeTopSide').classList.remove('btn-primary');
    document.getElementById('issueTypeTopSide').classList.add('btn-outline');
    document.getElementById('issueTypeUnder').classList.remove('btn-primary');
    document.getElementById('issueTypeUnder').classList.add('btn-outline');
    document.getElementById('issueLocationFields').classList.add('hidden');
    document.getElementById('topSideLocationFields').classList.add('hidden');
    document.getElementById('underLocationFields').classList.add('hidden');
    document.getElementById('issueDescription').value = '';
    document.getElementById('issueSection').value = '';
    document.getElementById('issueRow').value = '';
    document.getElementById('issueAisle').value = '';
    document.getElementById('issueFrame').value = '';
    document.getElementById('issueTier').value = '';
    document.getElementById('issuePhotoPreview').innerHTML = '<div style="text-align: center; color: #6c757d;"><div style="font-size: 32px;">📷</div><div style="font-size: 13px;">Tap to take photo</div></div>';
}

// Select issue type
function selectIssueType(type) {
    currentIssueType = type;

    document.getElementById('issueTypeTopSide').classList.toggle('btn-primary', type === 'topSide');
    document.getElementById('issueTypeTopSide').classList.toggle('btn-outline', type !== 'topSide');
    document.getElementById('issueTypeUnder').classList.toggle('btn-primary', type === 'understructure');
    document.getElementById('issueTypeUnder').classList.toggle('btn-outline', type !== 'understructure');

    document.getElementById('issueLocationFields').classList.remove('hidden');
    document.getElementById('topSideLocationFields').classList.toggle('hidden', type !== 'topSide');
    document.getElementById('underLocationFields').classList.toggle('hidden', type !== 'understructure');
}

// Preview issue photo
function previewIssuePhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('issuePhotoPreview').innerHTML = `
                <img src="${e.target.result}" style="max-width: 100%; max-height: 150px; border-radius: 8px;">
            `;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Save issue
function saveIssue() {
    if (!currentIssueType) {
        alert('Please select issue type (Top Side or Understructure)');
        return;
    }

    const description = document.getElementById('issueDescription').value.trim();
    if (!description) {
        alert('Please enter a description');
        return;
    }

    const bank = currentJob.banks[currentBankIndex];
    const photoInput = document.getElementById('issuePhotoInput');
    let photoData = null;

    if (photoInput.files && photoInput.files[0]) {
        // In a real app, we'd upload this. For demo, store base64
        const reader = new FileReader();
        reader.onload = function(e) {
            photoData = e.target.result;
            completeIssueSave(bank, description, photoData);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        completeIssueSave(bank, description, null);
    }
}

function completeIssueSave(bank, description, photoData) {
    const issue = {
        id: Date.now(),
        description: description,
        photo: photoData,
        createdAt: new Date().toISOString()
    };

    if (currentIssueType === 'topSide') {
        issue.section = document.getElementById('issueSection').value;
        issue.row = document.getElementById('issueRow').value;
        issue.aisle = document.getElementById('issueAisle').value;
        bank.topSideIssues.push(issue);
        renderTopSideIssues();
    } else {
        issue.frame = document.getElementById('issueFrame').value;
        issue.tier = document.getElementById('issueTier').value;
        bank.understructureIssues.push(issue);
        renderUnderstructureIssues();
    }

    closeAddIssueModal();
}

// Add top side issue (shortcut)
function addTopSideIssue() {
    openAddIssueModal();
    selectIssueType('topSide');
}

// Add understructure issue (shortcut)
function addUnderstructureIssue() {
    openAddIssueModal();
    selectIssueType('understructure');
}

// Render top side issues
function renderTopSideIssues() {
    const bank = currentJob.banks[currentBankIndex];
    const container = document.getElementById('topSideIssuesList');

    if (!bank.topSideIssues || bank.topSideIssues.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 24px; color: #6c757d; background: #f8f9fa; border-radius: 8px;">
                <div style="font-size: 32px; margin-bottom: 8px;">👀</div>
                <p>No top side issues documented yet</p>
                <p style="font-size: 12px; margin-top: 4px;">Walk the bleachers and tap + to add issues</p>
            </div>
        `;
        return;
    }

    container.innerHTML = bank.topSideIssues.map((issue, i) => `
        <div style="background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px; margin-bottom: 8px; display: flex; gap: 12px;">
            ${issue.photo ? `<img src="${issue.photo}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">` : ''}
            <div style="flex: 1;">
                <div style="font-size: 12px; color: #1565c0; margin-bottom: 4px;">
                    ${issue.section ? `Section ${issue.section}` : ''} ${issue.row ? `Row ${issue.row}` : ''} ${issue.aisle ? `Aisle ${issue.aisle}` : ''}
                </div>
                <div style="font-size: 14px;">${issue.description}</div>
            </div>
            <button onclick="deleteTopSideIssue(${i})" style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 16px;">×</button>
        </div>
    `).join('');
}

// Render understructure issues
function renderUnderstructureIssues() {
    const bank = currentJob.banks[currentBankIndex];
    const container = document.getElementById('understructureIssuesList');

    if (!bank.understructureIssues || bank.understructureIssues.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 24px; color: #6c757d; background: #f8f9fa; border-radius: 8px;">
                <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
                <p>No understructure issues documented yet</p>
                <p style="font-size: 12px; margin-top: 4px;">Check motors, frames, wheels and tap + to add issues</p>
            </div>
        `;
        return;
    }

    container.innerHTML = bank.understructureIssues.map((issue, i) => `
        <div style="background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px; margin-bottom: 8px; display: flex; gap: 12px;">
            ${issue.photo ? `<img src="${issue.photo}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">` : ''}
            <div style="flex: 1;">
                <div style="font-size: 12px; color: #c2185b; margin-bottom: 4px;">
                    ${issue.frame ? `Frame ${issue.frame}` : ''} ${issue.tier ? `Tier ${issue.tier}` : ''}
                </div>
                <div style="font-size: 14px;">${issue.description}</div>
            </div>
            <button onclick="deleteUnderstructureIssue(${i})" style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 16px;">×</button>
        </div>
    `).join('');
}

// Delete issues
function deleteTopSideIssue(index) {
    currentJob.banks[currentBankIndex].topSideIssues.splice(index, 1);
    renderTopSideIssues();
}

function deleteUnderstructureIssue(index) {
    currentJob.banks[currentBankIndex].understructureIssues.splice(index, 1);
    renderUnderstructureIssues();
}

// Save bank and add another
function saveBankAndAddAnother() {
    saveBankData();
    addNewBank();
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
            if (bank.safetyIssues) {
                issuesHTML += `<div style="background: #ffebee; padding: 8px 12px; border-radius: 4px; margin-top: 8px; border-left: 3px solid #c62828;">
                    <div style="font-size: 11px; font-weight: 600; color: #c62828; text-transform: uppercase;">Safety Issues</div>
                    <div style="font-size: 13px; margin-top: 4px;">${bank.safetyIssues}</div>
                </div>`;
            }
            if (bank.functionalIssues) {
                issuesHTML += `<div style="background: #fff3e0; padding: 8px 12px; border-radius: 4px; margin-top: 8px; border-left: 3px solid #e65100;">
                    <div style="font-size: 11px; font-weight: 600; color: #e65100; text-transform: uppercase;">Functional/Mechanical</div>
                    <div style="font-size: 13px; margin-top: 4px;">${bank.functionalIssues}</div>
                </div>`;
            }
            if (bank.cosmeticIssues) {
                issuesHTML += `<div style="background: #e3f2fd; padding: 8px 12px; border-radius: 4px; margin-top: 8px; border-left: 3px solid #1565c0;">
                    <div style="font-size: 11px; font-weight: 600; color: #1565c0; text-transform: uppercase;">Cosmetic</div>
                    <div style="font-size: 13px; margin-top: 4px;">${bank.cosmeticIssues}</div>
                </div>`;
            }

            // Show individual issues
            if (underIssues.length > 0 || topIssues.length > 0) {
                issuesHTML += `<details style="margin-top: 12px;">
                    <summary style="cursor: pointer; font-size: 13px; color: #0066cc;">View ${totalIssues} detailed issue${totalIssues !== 1 ? 's' : ''}</summary>
                    <div style="padding: 12px 0;">`;

                if (underIssues.length > 0) {
                    issuesHTML += `<div style="font-size: 11px; font-weight: 600; color: #6c757d; text-transform: uppercase; margin-bottom: 4px;">Understructure</div>`;
                    underIssues.forEach(issue => {
                        issuesHTML += `<div style="font-size: 13px; padding: 4px 0; border-bottom: 1px solid #f0f0f0;">
                            ${issue.frame ? `<span style="color: #e65100;">Frame ${issue.frame}</span>` : ''}
                            ${issue.tier ? `<span style="color: #6c757d;"> Tier ${issue.tier}</span>` : ''}
                            ${issue.frame || issue.tier ? ' - ' : ''}${issue.description}
                        </div>`;
                    });
                }

                if (topIssues.length > 0) {
                    issuesHTML += `<div style="font-size: 11px; font-weight: 600; color: #6c757d; text-transform: uppercase; margin: 12px 0 4px;">Top Side</div>`;
                    topIssues.forEach(issue => {
                        issuesHTML += `<div style="font-size: 13px; padding: 4px 0; border-bottom: 1px solid #f0f0f0;">
                            ${issue.section ? `<span style="color: #0066cc;">Section ${issue.section}</span>` : ''}
                            ${issue.row ? `<span style="color: #6c757d;"> Row ${issue.row}</span>` : ''}
                            ${issue.section || issue.row ? ' - ' : ''}${issue.description}
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
        submitBtn.innerHTML = '📤 Generate QuickBooks Estimate';
        submitBtn.onclick = () => generateEstimateFromJob();
        submitBtn.style.display = '';
        backBtn.textContent = '← Back to Ops Review';
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
    showBankInspection();
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

    alert(`✅ Job #${currentJob.jobNumber} submitted successfully!\n\n🎉 ${currentJob.banks.length} bank(s) inspected.\n\nOffice staff can now review and generate a QuickBooks estimate.`);

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
    message += `Job #${currentJob.jobNumber}\n`;
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

    alert(`Estimate generated for Job #${currentJob.jobNumber}\n\n` +
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
                    <div style="font-weight: 600;">Job #${job.jobNumber}</div>
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
            <div onclick="viewSubmittedJob(${job.jobNumber})" style="padding: 16px; border-bottom: 1px solid #e9ecef; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600;">Job #${job.jobNumber}</div>
                    <div style="font-size: 14px; color: #6c757d;">${job.locationName}</div>
                    <div style="font-size: 12px; color: #2e7d32;">${job.banks?.length || 0} bank(s) • Submitted ${new Date(job.submittedAt).toLocaleDateString()}</div>
                </div>
                <span class="badge badge-success">Submitted</span>
            </div>
        `).join('');
    }
}

// Resume in-progress job
function resumeJob(jobNumber) {
    currentJob = inspectionJobs.find(j => j.jobNumber === jobNumber);
    if (currentJob) {
        currentBankIndex = currentJob.banks.length - 1; // Go to last bank
        showBankInspection();
    }
}

// View submitted job (for office review)
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

// ==========================================
// VIEW HELPERS & UTILITIES
// View management, checklist rendering, inspection type handling
// ==========================================

// Hide all views helper
function hideAllViews() {
    const views = ['techInspectionsView', 'techCreateView', 'newJobSetupView', 'bankInspectionView', 'jobSummaryView', 'newInspectionView'];
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
