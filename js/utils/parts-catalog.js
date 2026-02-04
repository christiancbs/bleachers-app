// ==========================================
// PARTS CATALOG & LEGACY INSPECTION
// Airtable search, part selection, old inspection form
// ==========================================

function loadOfficeInspections() {
    const list = document.getElementById('officeInspectionsList');
    const count = document.getElementById('officeInspectionsCount');
    const inProgressCount = document.getElementById('officeInProgressCount');
    const totalBanks = document.getElementById('officeTotalBanks');

    // Use new inspectionJobs array
    const submitted = inspectionJobs.filter(j => j.status === 'submitted');
    const inProgress = inspectionJobs.filter(j => j.status === 'in_progress');

    // Count total banks
    let bankCount = 0;
    inspectionJobs.forEach(j => bankCount += (j.banks?.length || 0));

    // Update stat cards
    if (count) count.textContent = submitted.length;
    if (inProgressCount) inProgressCount.textContent = inProgress.length;
    if (totalBanks) totalBanks.textContent = bankCount;

    if (inspectionJobs.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No inspections yet</p><p style="font-size: 14px; margin-top: 8px;">Click "New Inspection" to get started</p></div>';
    } else {
        // Show all jobs with status
        list.innerHTML = inspectionJobs.map(job => {
            const typeIcon = job.inspectionType === 'basketball' ? '🏀' :
                             job.inspectionType === 'bleacher' ? '🏟️' :
                             job.inspectionType === 'outdoor' ? '🪑' : '📋';
            const typeLabel = job.inspectionType === 'basketball' ? 'Basketball' :
                              job.inspectionType === 'bleacher' ? 'Indoor Bleacher' :
                              job.inspectionType === 'outdoor' ? 'Outdoor Bleacher' : 'Inspection';
            const statusBadge = job.status === 'submitted' ?
                '<span class="badge badge-success">Submitted</span>' :
                '<span class="badge badge-warning" style="background: #fff3e0; color: #e65100;">In Progress</span>';
            const bankCount = job.banks?.length || 0;
            const issueCount = job.banks?.reduce((sum, bank) => {
                return sum + (bank.understructureIssues?.length || 0) + (bank.topSideIssues?.length || 0);
            }, 0) || 0;

            return `
            <div class="inspection-item" onclick="viewSubmittedJob(${job.jobNumber})" style="cursor: pointer;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div style="margin-bottom: 8px;">
                            <span class="part-number" style="color: #0066cc; font-size: 14px;">${job.jobNumber}</span>
                            <span style="margin-left: 8px; font-size: 12px; color: #6c757d;">${typeIcon} ${typeLabel}</span>
                        </div>
                        <strong>${job.locationName}</strong>
                        <p style="font-size: 12px; color: #6c757d; margin-top: 2px;">${job.customerName}</p>
                        <p style="font-size: 13px; color: #6c757d; margin-top: 8px;">
                            ${bankCount} bank${bankCount !== 1 ? 's' : ''} • ${issueCount} issue${issueCount !== 1 ? 's' : ''} found
                        </p>
                        <p style="font-size: 12px; color: #999; margin-top: 4px;">
                            Inspector: ${job.inspectorName || 'Unknown'} • ${new Date(job.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        ${statusBadge}
                        <div style="color: #4CAF50; font-size: 20px; margin-top: 8px;">→</div>
                    </div>
                </div>
            </div>
        `}).join('');
    }
}

function startNewInspection() {
    currentInspection = { selectedParts: [] };
    currentInspectionType = '';
    goalInspections = [];
    issuesList = [];

    // Reset form
    document.getElementById('inspectionTypeSelect').value = '';
    document.getElementById('inspectionFormFields').classList.add('hidden');
    document.getElementById('basketballFields').classList.add('hidden');
    document.getElementById('bleacherFields').classList.add('hidden');
    document.getElementById('outdoorFields').classList.add('hidden');
    document.getElementById('manufacturerSection').classList.add('hidden');

    if (currentRole === 'office') {
        // Hide all office views
        document.querySelectorAll('[id$="View"]').forEach(el => el.classList.add('hidden'));
        // Show techDashboard temporarily to access the inspection form
        document.getElementById('officeDashboard').classList.add('hidden');
        document.getElementById('techDashboard').classList.remove('hidden');
    }

    document.querySelectorAll('#techDashboard [id^="tech"][id$="View"]').forEach(el => el.classList.add('hidden'));
    document.getElementById('newInspectionView').classList.remove('hidden');
    renderSelectedParts();
}

function goBackFromInspection() {
    // Hide all inspection-related views
    document.getElementById('newJobSetupView')?.classList.add('hidden');
    document.getElementById('bankInspectionView')?.classList.add('hidden');
    document.getElementById('jobSummaryView')?.classList.add('hidden');
    document.getElementById('newInspectionView')?.classList.add('hidden');

    if (currentRole === 'office' || currentRole === 'admin') {
        document.getElementById('techDashboard').classList.add('hidden');
        document.getElementById('officeDashboard').classList.remove('hidden');
        showView('opsReview');
    } else {
        showTechView('create');
    }
}

function updateCustomerInfo() {
    const selectEl = document.getElementById('customerSelect');
    const locationId = selectEl.value;
    const info = document.getElementById('customerInfo');

    if (locationId) {
        const selectedOption = selectEl.options[selectEl.selectedIndex];
        const customerId = selectedOption.dataset.customerId;
        const customerName = selectedOption.dataset.customerName;
        const customerType = selectedOption.dataset.customerType;

        // Find full customer and location data
        const customer = CUSTOMERS.find(c => c.id === customerId);
        const location = customer?.locations.find(l => l.id === locationId);

        if (customer && location) {
            // Billing entity info
            const typeIcon = customer.type === 'county' ? '🏛️' : '🏫';
            document.getElementById('billingEntityName').textContent = `${typeIcon} ${customer.name}`;
            document.getElementById('billingEntityContact').textContent = `${customer.contact} • ${customer.phone}`;

            // Service location info
            document.getElementById('customerName').textContent = location.name;
            document.getElementById('customerAddress').textContent = location.address;
            document.getElementById('customerContact').textContent = `${location.contact} • ${location.phone}`;

            info.classList.remove('hidden');

            // Store in current inspection
            currentInspection.customerId = customerId;
            currentInspection.customerName = customer.name;
            currentInspection.customerType = customer.type;
            currentInspection.locationId = locationId;
            currentInspection.locationName = location.name;
            currentInspection.locationAddress = location.address;
            currentInspection.locationContact = location.contact;
            currentInspection.locationPhone = location.phone;
            currentInspection.billingContact = customer.contact;
            currentInspection.billingPhone = customer.phone;
            currentInspection.location = document.getElementById('locationInput').value || location.address;
        }
    } else {
        info.classList.add('hidden');
    }
}

async function searchParts() {
    const searchTerm = document.getElementById('partSearch').value.trim();
    const category = document.getElementById('vendorFilter').value;
    const results = document.getElementById('partsResults');

    if (!searchTerm && !category) {
        results.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">Enter a search term or select a category</div>';
        return;
    }

    results.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">🔍 Searching 2,142 Hussey parts...</div>';

    try {
        // Build Airtable filter formula
        let filters = [];
        if (searchTerm) {
            filters.push(`OR(
                FIND(LOWER("${searchTerm}"), LOWER({Product Name})),
                FIND(LOWER("${searchTerm}"), LOWER({Part Number})),
                FIND(LOWER("${searchTerm}"), LOWER({Description})),
                FIND(LOWER("${searchTerm}"), LOWER({Category})),
                FIND(LOWER("${searchTerm}"), LOWER({Subcategory})),
                FIND(LOWER("${searchTerm}"), LOWER({Product Line})),
                FIND(LOWER("${searchTerm}"), LOWER({Model Info}))
            )`);
        }
        if (category) {
            filters.push(`{Category} = "${category}"`);
        }

        const formula = filters.length > 1 ? `AND(${filters.join(',')})` : filters[0];
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=${encodeURIComponent(formula)}&pageSize=50`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const records = data.records;

        // Store results for selection
        searchResults = {};
        records.forEach(r => { searchResults[r.id] = r.fields; });

        if (records.length === 0) {
            results.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">No parts found matching your search</div>';
        } else {
            results.innerHTML = `
                <p style="font-size: 12px; color: #6c757d; margin: 12px 0;">Found ${records.length} parts from Hussey catalog</p>
                ${records.map(record => {
                    const part = record.fields;
                    const price = parseFloat(part['Price 2025']) || 0;
                    const priceDisplay = part['Price 2025'] === 'Call for Price' ? 'Call for Price' : (price > 0 ? `$${price.toFixed(2)}` : 'N/A');
                    return `
                        <div class="part-result" onclick="selectPart('${record.id}')">
                            <div style="margin-bottom: 8px;">
                                <span class="part-number">${part['Part Number'] || '—'}</span>
                                <span class="part-vendor">Hussey Seating Co</span>
                            </div>
                            <div class="part-description">${part['Product Name'] || 'Unknown Part'}</div>
                            <div class="part-meta">
                                <span class="part-category">${part['Category'] || ''}</span>
                                <span class="part-price">${priceDisplay}</span>
                            </div>
                            ${part['Product Line'] ? `<div style="font-size: 11px; color: #888; margin-top: 4px;">${part['Product Line']}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            `;
        }
    } catch (err) {
        results.innerHTML = `<div style="text-align: center; padding: 20px; color: #dc3545;">Search failed: ${err.message}</div>`;
    }
}

function selectPart(recordId) {
    // Get part data from stored search results
    const partData = searchResults[recordId];
    if (!partData) {
        console.error('Part not found in search results');
        return;
    }

    const partName = partData['Product Name'] || 'Unknown Part';
    const quantity = parseInt(prompt(`How many "${partName}"?`, '1'));

    if (quantity > 0) {
        if (!currentInspection.selectedParts) currentInspection.selectedParts = [];

        // Convert Airtable format to our internal format
        const part = {
            id: recordId,
            partNumber: partData['Part Number'] || '—',
            description: partData['Product Name'] || 'Unknown Part',
            vendor: 'Hussey Seating Co',
            category: partData['Category'] || '',
            price: parseFloat(partData['Price 2025']) || 0,
            productLine: partData['Product Line'] || '',
            quantity: quantity
        };

        currentInspection.selectedParts.push(part);
        renderSelectedParts();

        // Clear search after selection
        document.getElementById('partSearch').value = '';
        document.getElementById('partsResults').innerHTML = '<div style="text-align: center; padding: 20px; color: #4CAF50;">✓ Part added! Search for more parts above.</div>';
    }
}

function renderSelectedParts() {
    const list = document.getElementById('selectedPartsList');
    const count = document.getElementById('partsCount');

    if (!currentInspection.selectedParts || currentInspection.selectedParts.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-icon">📦</div><p>No parts added yet</p><p style="font-size: 14px; margin-top: 8px;">Search and select parts above</p></div>';
        count.textContent = '0';
    } else {
        const total = currentInspection.selectedParts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        count.textContent = currentInspection.selectedParts.length;

        list.innerHTML = currentInspection.selectedParts.map((part, index) => `
            <div class="selected-part">
                <div style="flex: 1;">
                    <div style="margin-bottom: 8px;">
                        <span class="part-number">${part.partNumber}</span>
                        <span class="part-vendor">${part.vendor}</span>
                    </div>
                    <div style="font-size: 14px; font-weight: 500; margin-bottom: 4px;">${part.description}</div>
                    <div style="font-size: 14px; color: #6c757d;">
                        Qty: ${part.quantity} × $${part.price.toFixed(2)} = <strong style="color: #4CAF50;">$${(part.quantity * part.price).toFixed(2)}</strong>
                    </div>
                </div>
                <button class="remove-btn" onclick="removePart(${index})">×</button>
            </div>
        `).join('') + `
            <div class="selected-part" style="background: #4CAF50; color: white;">
                <div style="flex: 1;">
                    <div class="flex-between">
                        <span style="font-size: 16px; font-weight: 700;">Total Parts</span>
                        <span style="font-size: 24px; font-weight: 700;">$${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    }
}

function removePart(index) {
    currentInspection.selectedParts.splice(index, 1);
    renderSelectedParts();
}

function submitInspection() {
    if (!currentInspectionType) {
        alert('Please select an inspection type');
        return;
    }

    if (!currentInspection.customerId) {
        alert('Please select a customer');
        return;
    }

    // Common fields
    currentInspection.inspectionType = currentInspectionType;
    currentInspection.location = document.getElementById('locationInput').value || currentInspection.location;
    currentInspection.manufacturer = document.getElementById('manufacturerSelect')?.value || '';
    currentInspection.model = document.getElementById('modelInput')?.value || '';
    currentInspection.laborHours = parseFloat(document.getElementById('laborHours').value) || 0;
    currentInspection.notes = document.getElementById('serviceNotes').value;
    currentInspection.safetyIssues = document.getElementById('safetyIssues')?.value || '';
    currentInspection.mechanicalIssues = document.getElementById('mechanicalIssues')?.value || '';
    currentInspection.cosmeticIssues = document.getElementById('cosmeticIssues')?.value || '';

    // Type-specific fields
    if (currentInspectionType === 'basketball') {
        currentInspection.brand = document.getElementById('bbBrand')?.value;
        currentInspection.goalCount = document.getElementById('bbGoalCount')?.value;
        currentInspection.gymType = document.getElementById('bbGymType')?.value;
        currentInspection.paddingColor = document.getElementById('bbPaddingColor')?.value;
        currentInspection.paddingDimensions = document.getElementById('bbPaddingDimensions')?.value;
        currentInspection.ceilingType = document.getElementById('bbCeilingType')?.value;
        currentInspection.goals = collectGoalData();
        currentInspection.checklist = collectChecklist('bbChecklist', CHECKLISTS.basketball);
    } else if (currentInspectionType === 'bleacher') {
        currentInspection.banks = document.getElementById('blBanks')?.value;
        currentInspection.tiers = document.getElementById('blTiers')?.value;
        currentInspection.rise = document.getElementById('blRise')?.value;
        currentInspection.rowSpacing = document.getElementById('blRowSpacing')?.value;
        currentInspection.bleacherType = document.getElementById('blType')?.value;
        currentInspection.seatType = document.getElementById('blSeatType')?.value;
        currentInspection.material = document.getElementById('blMaterial')?.value;
        currentInspection.color = document.getElementById('blColor')?.value;
        currentInspection.motorPhase = document.getElementById('blMotorPhase')?.value;
        currentInspection.motorHP = document.getElementById('blMotorHP')?.value;
        currentInspection.motorCount = document.getElementById('blMotorCount')?.value;
        currentInspection.sections = document.getElementById('blSections')?.value;
        currentInspection.rows = document.getElementById('blRows')?.value;
        currentInspection.aisles = document.getElementById('blAisles')?.value;
        currentInspection.understructureChecklist = collectChecklist('blUnderstructureChecklist', CHECKLISTS.bleacherUnderstructure);
        currentInspection.topSideChecklist = collectChecklist('blTopSideChecklist', CHECKLISTS.bleacherTopSide);
        currentInspection.issues = collectIssues();
    } else if (currentInspectionType === 'outdoor') {
        currentInspection.bleacherType = document.getElementById('outType')?.value;
        currentInspection.tiers = document.getElementById('outTiers')?.value;
        currentInspection.length = document.getElementById('outLength')?.value;
        currentInspection.side = document.getElementById('outSide')?.value;
        currentInspection.seatDimensions = document.getElementById('outSeatDimensions')?.value;
        currentInspection.seatColor = document.getElementById('outSeatColor')?.value;
        currentInspection.sections = document.getElementById('outSections')?.value;
        currentInspection.rows = document.getElementById('outRows')?.value;
        currentInspection.rise = document.getElementById('outRise')?.value;
        currentInspection.run = document.getElementById('outRun')?.value;
        currentInspection.codeIssues = document.getElementById('outCodeIssues')?.value;
        currentInspection.understructureChecklist = collectChecklist('outUnderstructureChecklist', CHECKLISTS.outdoorUnderstructure);
        currentInspection.topSideChecklist = collectChecklist('outTopSideChecklist', CHECKLISTS.outdoorTopSide);
        currentInspection.issues = collectIssues();
    }

    currentInspection.id = 'INS-' + Date.now();
    currentInspection.createdAt = new Date().toISOString();
    currentInspection.status = 'submitted';

    inspections.push(currentInspection);
    localStorage.setItem('inspections', JSON.stringify(inspections));

    const typeLabel = currentInspectionType === 'basketball' ? 'Basketball Goal' :
                      currentInspectionType === 'bleacher' ? 'Indoor Bleacher' : 'Outdoor Bleacher';

    alert(`✅ ${typeLabel} Inspection submitted successfully!\n\n🎉 NO after-hours work needed - you're done!\n\nOffice staff can now review and generate a QuickBooks estimate.`);

    currentInspection = {};
    currentInspectionType = '';
    updateDashboardStats();
    goBackFromInspection();
}

// Collect goal inspection data
function collectGoalData() {
    const goals = [];
    for (let i = 1; i <= goalInspections.length; i++) {
        goals.push({
            goalNumber: i,
            type: document.getElementById(`goal${i}_type`)?.value,
            backboard: document.getElementById(`goal${i}_backboard`)?.value,
            winch: document.getElementById(`goal${i}_winch`)?.value,
            mast: document.getElementById(`goal${i}_mast`)?.value,
            safetyStrap: document.getElementById(`goal${i}_safetyStrap`)?.value,
            anchor: document.getElementById(`goal${i}_anchor`)?.value,
            recommendations: document.getElementById(`goal${i}_recommendations`)?.value
        });
    }
    return goals;
}

// Collect checklist data
function collectChecklist(containerId, items) {
    return items.map((item, i) => ({
        item: item,
        checked: document.getElementById(`${containerId}_${i}`)?.checked || false,
        na: document.getElementById(`${containerId}_${i}_na`)?.checked || false
    }));
}

// Collect issues data
function collectIssues() {
    const issues = [];
    for (let i = 1; i <= issuesList.length; i++) {
        const desc = document.getElementById(`issue${i}_desc`)?.value;
        if (desc) {
            issues.push({
                frame: document.getElementById(`issue${i}_frame`)?.value,
                tier: document.getElementById(`issue${i}_tier`)?.value,
                description: desc
            });
        }
    }
    return issues;
}

