// ==========================================
// ESTIMATE BUILDER
// Create estimates and push to QuickBooks
// ==========================================

// Builder state
let estimateBuilderState = {
    qbCustomer: null,        // { Id, DisplayName, PrimaryEmailAddr, etc }
    lineItems: [],           // Array of line items
    sourceInspection: null,  // If pre-filled from inspection
    shippingCost: 0,
    isSubmitting: false,
    procurementNotes: [],    // { id, text, source: 'auto'|'manual', category, dismissed }
    stockParts: [],          // { lineItemIndex, stockLocation, verified: false }
    dismissedSuggestions: new Set()  // IDs of dismissed auto-suggestions
};

// Default labor rate (editable per estimate)
const DEFAULT_LABOR_RATE = 65;

// Initialize the estimate builder
function initEstimateBuilder(prefillData = null) {
    // Reset state
    estimateBuilderState = {
        qbCustomer: null,
        lineItems: [],
        sourceInspection: prefillData,
        shippingCost: 0,
        isSubmitting: false,
        procurementNotes: [],
        stockParts: [],
        dismissedSuggestions: new Set()
    };

    // If pre-filling from inspection, load that data
    if (prefillData) {
        prefillFromInspection(prefillData);
    }

    renderEstimateBuilder();
}

// Pre-fill from inspection data
async function prefillFromInspection(inspection) {
    estimateBuilderState.sourceInspection = inspection;

    // Try to find matching QB customer by name
    if (inspection.customerName) {
        try {
            const result = await EstimatesAPI.getCustomers(inspection.customerName);
            if (result.customers && result.customers.length > 0) {
                // Auto-select first match
                selectQbCustomer(result.customers[0]);
            }
        } catch (err) {
            console.error('Failed to search QB customers:', err);
        }
    }

    // Add parts from inspection as line items
    if (inspection.selectedParts && inspection.selectedParts.length > 0) {
        inspection.selectedParts.forEach(part => {
            addPartToEstimate(part, part.quantity || 1);
        });
    }

    renderEstimateBuilder();
}

// Search QB customers
let customerSearchTimeout = null;
async function searchQbCustomers(query) {
    const resultsDiv = document.getElementById('qbCustomerResults');

    if (!query || query.length < 2) {
        resultsDiv.innerHTML = '';
        resultsDiv.classList.add('hidden');
        return;
    }

    // Debounce search
    clearTimeout(customerSearchTimeout);
    customerSearchTimeout = setTimeout(async () => {
        resultsDiv.innerHTML = '<div style="padding: 12px; color: #6c757d;">Searching...</div>';
        resultsDiv.classList.remove('hidden');

        try {
            const result = await EstimatesAPI.getCustomers(query);

            if (!result.customers || result.customers.length === 0) {
                resultsDiv.innerHTML = '<div style="padding: 12px; color: #6c757d;">No customers found</div>';
                return;
            }

            resultsDiv.innerHTML = result.customers.map(c => `
                <div class="customer-result-item" onclick="selectQbCustomer(${JSON.stringify(c).replace(/"/g, '&quot;')})">
                    <div style="font-weight: 600;">${c.DisplayName}</div>
                    ${c.PrimaryEmailAddr ? `<div style="font-size: 12px; color: #6c757d;">${c.PrimaryEmailAddr.Address || c.PrimaryEmailAddr}</div>` : ''}
                </div>
            `).join('');
        } catch (err) {
            resultsDiv.innerHTML = `<div style="padding: 12px; color: #dc3545;">Error: ${err.message}</div>`;
        }
    }, 300);
}

// Select a QB customer
function selectQbCustomer(customer) {
    estimateBuilderState.qbCustomer = customer;

    const resultsDiv = document.getElementById('qbCustomerResults');
    const searchInput = document.getElementById('qbCustomerSearch');
    const selectedDiv = document.getElementById('selectedQbCustomer');

    resultsDiv.innerHTML = '';
    resultsDiv.classList.add('hidden');
    searchInput.value = '';

    selectedDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #e8f5e9; border-radius: 8px; margin-top: 12px;">
            <div>
                <div style="font-weight: 600; color: #2e7d32;">${customer.DisplayName}</div>
                ${customer.PrimaryEmailAddr ? `<div style="font-size: 13px; color: #6c757d;">${customer.PrimaryEmailAddr.Address || customer.PrimaryEmailAddr}</div>` : ''}
            </div>
            <button class="btn btn-outline" style="font-size: 12px;" onclick="clearQbCustomer()">Change</button>
        </div>
    `;
    selectedDiv.classList.remove('hidden');

    updateSubmitButton();
}

// Clear selected customer
function clearQbCustomer() {
    estimateBuilderState.qbCustomer = null;
    document.getElementById('selectedQbCustomer').classList.add('hidden');
    document.getElementById('selectedQbCustomer').innerHTML = '';
    updateSubmitButton();
}

// ==========================================
// LINE ITEM MANAGEMENT
// ==========================================

// Add part to estimate
function addPartToEstimate(part, quantity) {
    const lineItem = {
        type: 'part',
        itemName: part.partNumber || part.productName || 'Part',
        description: part.description || part.productName || '',
        quantity: quantity,
        unitPrice: parseFloat(part.price) || 0,
        amount: quantity * (parseFloat(part.price) || 0),
        partData: part // Keep original data for reference
    };

    estimateBuilderState.lineItems.push(lineItem);
    renderLineItems();
    updateSubmitButton();
}

// Add labor to estimate
function addLaborToEstimate(hours, rate, description = '') {
    const lineItem = {
        type: 'labor',
        itemName: 'Labor',
        description: description || `Labor - ${hours} hours @ $${rate}/hr`,
        quantity: hours,
        unitPrice: rate,
        amount: hours * rate
    };

    estimateBuilderState.lineItems.push(lineItem);
    renderLineItems();
    closeAddLaborModal();
    updateSubmitButton();
}

// Add custom item to estimate
function addCustomToEstimate(name, description, quantity, unitPrice) {
    const lineItem = {
        type: 'custom',
        itemName: name,
        description: description,
        quantity: quantity,
        unitPrice: unitPrice,
        amount: quantity * unitPrice
    };

    estimateBuilderState.lineItems.push(lineItem);
    renderLineItems();
    closeAddCustomModal();
    updateSubmitButton();
}

// Remove line item
function removeLineItem(index) {
    estimateBuilderState.lineItems.splice(index, 1);
    // Update stockParts indices — remove entries for deleted item, shift others down
    estimateBuilderState.stockParts = estimateBuilderState.stockParts
        .filter(sp => sp.lineItemIndex !== index)
        .map(sp => ({
            ...sp,
            lineItemIndex: sp.lineItemIndex > index ? sp.lineItemIndex - 1 : sp.lineItemIndex
        }));
    renderLineItems();
    renderProcurementNotes();
    updateSubmitButton();
}

// Update line item quantity
function updateLineItemQuantity(index, quantity) {
    const item = estimateBuilderState.lineItems[index];
    if (item) {
        item.quantity = quantity;
        item.amount = quantity * item.unitPrice;
        renderLineItems();
    }
}

// Calculate totals
function calculateTotals() {
    const subtotal = estimateBuilderState.lineItems.reduce((sum, item) => sum + item.amount, 0);
    const shipping = parseFloat(estimateBuilderState.shippingCost) || 0;
    const total = subtotal + shipping;

    return { subtotal, shipping, total };
}

// Update shipping cost
function updateShipping() {
    const input = document.getElementById('estShipping');
    estimateBuilderState.shippingCost = parseFloat(input.value) || 0;
    renderTotals();
}

// ==========================================
// PROCUREMENT INTELLIGENCE
// ==========================================

// Auto-detect procurement issues from line items
function runProcurementDetection() {
    const suggestions = [];
    const items = estimateBuilderState.lineItems;
    const itemTexts = items.map(i => ((i.itemName || '') + ' ' + (i.description || '')).toLowerCase());
    const allText = itemTexts.join(' ');

    // RULE 1: Removal/demo work without dumpster → disposal note
    const hasRemoval = allText.includes('demo') || allText.includes('remov') ||
                       allText.includes('replace') || allText.includes('tear out') ||
                       allText.includes('haul off');
    const hasDumpster = itemTexts.some(t =>
        t.includes('dumpster') || t.includes('roll-off') || t.includes('roll off') || t.includes('disposal')
    );
    if (hasRemoval && !hasDumpster) {
        suggestions.push({
            id: 'auto-disposal',
            text: 'Customer responsible for disposal of removed materials',
            source: 'auto',
            category: 'disposal'
        });
    }

    // RULE 2: Goal/ceiling/upper work without lift rental
    const needsLift = allText.includes('goal') || allText.includes('safety strap') ||
                      allText.includes('ceiling') || allText.includes('upper') ||
                      allText.includes('winch') || allText.includes('hoist');
    const hasLiftRental = itemTexts.some(t =>
        t.includes('lift') || t.includes('rental') || t.includes('equipment rental')
    );
    if (needsLift && !hasLiftRental) {
        suggestions.push({
            id: 'auto-lift',
            text: 'Lift rental required - confirm who provides',
            source: 'auto',
            category: 'equipment'
        });
    }

    // RULE 3: Wall pad work → access/delivery note
    const hasWallPad = allText.includes('wall pad') && (allText.includes('replace') || allText.includes('install'));
    if (hasWallPad) {
        suggestions.push({
            id: 'auto-wallpad',
            text: 'Customer to clear wall area before arrival. Truck delivery - confirm access.',
            source: 'auto',
            category: 'access'
        });
    }

    // RULE 4: Floor/hardwood work → plywood protection
    const hasFloorWork = (allText.includes('floor') || allText.includes('hardwood')) &&
                         (allText.includes('install') || allText.includes('replace') || allText.includes('anchor'));
    const hasPlywood = itemTexts.some(t => t.includes('plywood'));
    if (hasFloorWork && !hasPlywood) {
        suggestions.push({
            id: 'auto-plywood',
            text: 'Plywood required for floor protection',
            source: 'auto',
            category: 'equipment'
        });
    }

    // RULE 5: Auto-detect stock parts from descriptions
    const shopPatterns = [
        { pattern: /tn\s*shop/i, location: 'TN Shop' },
        { pattern: /fl\s*shop/i, location: 'FL Shop' },
        { pattern: /al\s*shop/i, location: 'AL Shop' },
        { pattern: /from\s*stock/i, location: 'Stock' },
        { pattern: /in\s*stock/i, location: 'Stock' },
        { pattern: /on\s*hand/i, location: 'Stock' }
    ];
    items.forEach((item, index) => {
        if (item.type === 'part' || item.type === 'custom') {
            const text = ((item.itemName || '') + ' ' + (item.description || '')).toLowerCase();
            for (const sp of shopPatterns) {
                if (sp.pattern.test(text)) {
                    const existing = estimateBuilderState.stockParts.find(s => s.lineItemIndex === index);
                    if (!existing) {
                        estimateBuilderState.stockParts.push({
                            lineItemIndex: index,
                            stockLocation: sp.location,
                            verified: false
                        });
                    }
                    break;
                }
            }
        }
    });

    // Filter out already-confirmed and dismissed suggestions
    const confirmedIds = new Set(estimateBuilderState.procurementNotes.map(n => n.id));
    return suggestions.filter(s =>
        !confirmedIds.has(s.id) && !estimateBuilderState.dismissedSuggestions.has(s.id)
    );
}

// Confirm an auto-suggestion → add to procurement notes
function confirmSuggestion(id, text, category) {
    estimateBuilderState.procurementNotes.push({
        id: id,
        text: text,
        source: 'auto',
        category: category
    });
    renderProcurementNotes();
}

// Dismiss an auto-suggestion
function dismissSuggestion(id) {
    estimateBuilderState.dismissedSuggestions.add(id);
    renderProcurementNotes();
}

// Add a manual procurement note from dropdown
function addProcurementNote(text, category) {
    estimateBuilderState.procurementNotes.push({
        id: 'manual-' + Date.now(),
        text: text,
        source: 'manual',
        category: category
    });
    renderProcurementNotes();
}

// Add a custom procurement note
function addCustomProcurementNote() {
    const text = prompt('Enter procurement note:');
    if (text && text.trim()) {
        addProcurementNote(text.trim(), 'custom');
    }
}

// Remove a procurement note
function removeProcurementNote(id) {
    estimateBuilderState.procurementNotes = estimateBuilderState.procurementNotes.filter(n => n.id !== id);
    // If it was auto-detected, don't re-dismiss — allow it to come back as suggestion
    renderProcurementNotes();
}

// Mark a line item as stock part
function markAsStockPart(lineItemIndex) {
    const locations = (typeof STOCK_LOCATIONS !== 'undefined' ? STOCK_LOCATIONS : [])
        .map((loc, i) => `${i + 1}. ${loc.label}`).join('\n');
    const choice = prompt(`Which shop location?\n${locations}\n\nEnter number (or type a custom location):`);
    if (!choice) return;

    const locIndex = parseInt(choice) - 1;
    let location;
    if (typeof STOCK_LOCATIONS !== 'undefined' && locIndex >= 0 && locIndex < STOCK_LOCATIONS.length) {
        location = STOCK_LOCATIONS[locIndex].label;
    } else {
        location = choice.trim();
    }

    // Remove existing entry for this index if any
    estimateBuilderState.stockParts = estimateBuilderState.stockParts.filter(sp => sp.lineItemIndex !== lineItemIndex);
    estimateBuilderState.stockParts.push({
        lineItemIndex: lineItemIndex,
        stockLocation: location,
        verified: false
    });

    renderLineItems();
    renderProcurementNotes();
}

// Remove stock part marking
function removeStockMark(lineItemIndex) {
    estimateBuilderState.stockParts = estimateBuilderState.stockParts.filter(sp => sp.lineItemIndex !== lineItemIndex);
    renderLineItems();
    renderProcurementNotes();
}

// Toggle procurement notes dropdown
function toggleProcurementDropdown() {
    const dropdown = document.getElementById('procurementNoteDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Render procurement notes section
function renderProcurementNotes() {
    const container = document.getElementById('procurementNotesContainer');
    if (!container) return;

    const suggestions = runProcurementDetection();
    const notes = estimateBuilderState.procurementNotes;
    const stockParts = estimateBuilderState.stockParts;

    const categoryColors = {
        disposal: { bg: '#fff3e0', color: '#e65100', label: 'Disposal' },
        equipment: { bg: '#e3f2fd', color: '#1565c0', label: 'Equipment' },
        access: { bg: '#f3e5f5', color: '#7b1fa2', label: 'Access' },
        stock: { bg: '#e8f5e9', color: '#2e7d32', label: 'Stock' },
        custom: { bg: '#f5f5f5', color: '#616161', label: 'Note' }
    };

    let html = '';

    // Auto-detected suggestions
    if (suggestions.length > 0) {
        html += suggestions.map(s => `
            <div class="procurement-suggestion">
                <div class="suggestion-text">
                    <span style="font-weight: 600; margin-right: 4px;">Suggested:</span> ${s.text}
                </div>
                <div class="suggestion-actions">
                    <button class="btn btn-outline" style="padding: 3px 10px; font-size: 11px; color: #2e7d32; border-color: #2e7d32;" onclick="confirmSuggestion('${s.id}', '${s.text.replace(/'/g, "\\'")}', '${s.category}')">Add</button>
                    <button class="btn btn-outline" style="padding: 3px 10px; font-size: 11px; color: #6c757d;" onclick="dismissSuggestion('${s.id}')">Dismiss</button>
                </div>
            </div>
        `).join('');
    }

    // Confirmed notes
    if (notes.length > 0) {
        html += notes.map(n => {
            const cat = categoryColors[n.category] || categoryColors.custom;
            return `
                <div class="procurement-note-item">
                    <span class="note-category" style="background: ${cat.bg}; color: ${cat.color};">${cat.label}</span>
                    <span style="flex: 1;">${n.text}</span>
                    <button class="btn btn-outline" style="padding: 2px 8px; font-size: 11px; color: #dc3545; border-color: #dc3545;" onclick="removeProcurementNote('${n.id}')">×</button>
                </div>
            `;
        }).join('');
    }

    // Stock parts summary
    if (stockParts.length > 0) {
        html += `<div style="margin-top: 8px; padding: 10px 14px; background: #e8f5e9; border-radius: 6px; font-size: 13px;">
            <strong style="color: #2e7d32;">Stock Parts:</strong>
            ${stockParts.map(sp => {
                const item = estimateBuilderState.lineItems[sp.lineItemIndex];
                return `<span style="margin-left: 8px; padding: 2px 8px; background: #c8e6c9; border-radius: 4px;">${item ? item.itemName : 'Part'} <strong>(${sp.stockLocation})</strong>
                    <button style="background: none; border: none; color: #c62828; cursor: pointer; font-size: 12px; padding: 0 2px;" onclick="removeStockMark(${sp.lineItemIndex})">×</button>
                </span>`;
            }).join('')}
        </div>`;
    }

    // Empty state
    if (!html && suggestions.length === 0) {
        html = '<div style="padding: 12px; color: #6c757d; font-size: 13px; text-align: center;">No procurement notes. Notes will be auto-suggested based on line items, or add manually.</div>';
    }

    container.innerHTML = html;
}

// Compose structured memo for QB PrivateNote
function composeProcurementMemo() {
    const parts = [];
    parts.push('Generated from Bleachers & Seats App');

    const activeNotes = estimateBuilderState.procurementNotes;
    if (activeNotes.length > 0) {
        parts.push('NOTES: ' + activeNotes.map(n => n.text).join('; '));
    }

    if (estimateBuilderState.stockParts.length > 0) {
        const stockSummary = estimateBuilderState.stockParts.map(sp => {
            const item = estimateBuilderState.lineItems[sp.lineItemIndex];
            return `${item ? item.itemName : 'Part'} (${sp.stockLocation})`;
        }).join(', ');
        parts.push('STOCK PARTS: ' + stockSummary);
    }

    return parts.join(' | ');
}

// ==========================================
// MODAL HANDLERS
// ==========================================

// Parts modal
function openAddPartModal() {
    document.getElementById('addPartModal').classList.remove('hidden');
    document.getElementById('estPartSearch').value = '';
    document.getElementById('estPartsResults').innerHTML = '';
    document.getElementById('estPartSearch').focus();
}

function closeAddPartModal() {
    document.getElementById('addPartModal').classList.add('hidden');
}

// Search parts for estimate
let partSearchTimeout = null;
async function searchPartsForEstimate() {
    const query = document.getElementById('estPartSearch').value;
    const resultsDiv = document.getElementById('estPartsResults');

    if (!query || query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
    }

    clearTimeout(partSearchTimeout);
    partSearchTimeout = setTimeout(async () => {
        resultsDiv.innerHTML = '<div style="padding: 12px; color: #6c757d;">Searching...</div>';

        try {
            const result = await PartsAPI.search({ query, limit: 20 });

            if (!result.parts || result.parts.length === 0) {
                resultsDiv.innerHTML = '<div style="padding: 12px; color: #6c757d;">No parts found</div>';
                return;
            }

            // Check local inventory for matching parts
            const parts = result.parts.map(part => {
                const inventoryMatch = LOCAL_INVENTORY.find(inv =>
                    inv.partNumber && part.partNumber && inv.partNumber.toLowerCase() === part.partNumber.toLowerCase()
                );
                return Object.assign({}, part, { inventoryMatch });
            });

            // Sort: in-stock parts first
            parts.sort((a, b) => (b.inventoryMatch ? 1 : 0) - (a.inventoryMatch ? 1 : 0));

            resultsDiv.innerHTML = parts.map(part => {
                const stockBadge = part.inventoryMatch
                    ? `<div style="font-size: 12px; color: #2e7d32; background: #e8f5e9; padding: 2px 8px; border-radius: 4px; margin-top: 4px; display: inline-block;">🏪 In Stock — ${part.inventoryMatch.location} (qty: ${part.inventoryMatch.quantity})</div>`
                    : '';
                return `
                <div class="part-result-item" onclick="promptPartQuantity('${part.id}', ${JSON.stringify(part).replace(/'/g, "\\'").replace(/"/g, '&quot;')})">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div style="font-weight: 600;">${part.partNumber || 'N/A'}</div>
                            <div style="font-size: 13px; color: #495057;">${part.productName || part.description || ''}</div>
                            <div style="font-size: 12px; color: #6c757d;">${part.vendor || ''} ${part.category ? '• ' + part.category : ''}</div>
                            ${stockBadge}
                        </div>
                        <div style="font-weight: 600; color: #2e7d32;">$${(parseFloat(part.price) || 0).toFixed(2)}</div>
                    </div>
                </div>
            `}).join('');
        } catch (err) {
            resultsDiv.innerHTML = `<div style="padding: 12px; color: #dc3545;">Error: ${err.message}</div>`;
        }
    }, 300);
}

// Prompt for part quantity
function promptPartQuantity(partId, part) {
    const quantity = parseInt(prompt(`How many "${part.partNumber || part.productName}"?`, '1'));
    if (quantity && quantity > 0) {
        addPartToEstimate(part, quantity);
        closeAddPartModal();
    }
}

// Labor modal
function openAddLaborModal() {
    document.getElementById('addLaborModal').classList.remove('hidden');
    document.getElementById('laborRate').value = DEFAULT_LABOR_RATE;
    document.getElementById('laborHours').value = '1';
    document.getElementById('laborDescription').value = '';
    document.getElementById('laborHours').focus();
}

function closeAddLaborModal() {
    document.getElementById('addLaborModal').classList.add('hidden');
}

function addLaborFromModal() {
    const hours = parseFloat(document.getElementById('laborHours').value) || 0;
    const rate = parseFloat(document.getElementById('laborRate').value) || DEFAULT_LABOR_RATE;
    const description = document.getElementById('laborDescription').value;

    if (hours <= 0) {
        alert('Please enter valid hours');
        return;
    }

    addLaborToEstimate(hours, rate, description);
}

// Custom item modal
function openAddCustomModal() {
    document.getElementById('addCustomModal').classList.remove('hidden');
    document.getElementById('customItemName').value = '';
    document.getElementById('customItemDesc').value = '';
    document.getElementById('customItemQty').value = '1';
    document.getElementById('customItemPrice').value = '0';
    document.getElementById('customItemName').focus();
}

function closeAddCustomModal() {
    document.getElementById('addCustomModal').classList.add('hidden');
}

function addCustomFromModal() {
    const name = document.getElementById('customItemName').value.trim();
    const description = document.getElementById('customItemDesc').value.trim();
    const quantity = parseInt(document.getElementById('customItemQty').value) || 1;
    const unitPrice = parseFloat(document.getElementById('customItemPrice').value) || 0;

    if (!name) {
        alert('Please enter an item name');
        return;
    }

    addCustomToEstimate(name, description, quantity, unitPrice);
}

// ==========================================
// RENDERING
// ==========================================

function renderEstimateBuilder() {
    const container = document.getElementById('createEstimateForm');

    // Show source inspection info if pre-filling
    const sourceInfo = estimateBuilderState.sourceInspection ? `
        <div class="alert alert-info" style="margin-bottom: 20px;">
            <strong>Pre-filling from Inspection #${estimateBuilderState.sourceInspection.jobNumber}</strong><br>
            ${estimateBuilderState.sourceInspection.customerName || ''} - ${estimateBuilderState.sourceInspection.locationName || ''}
        </div>
    ` : '';

    container.innerHTML = `
        ${sourceInfo}

        <!-- Customer Selection -->
        <div class="card" style="margin-bottom: 20px;">
            <div class="card-header"><h3 style="margin: 0;">Customer</h3></div>
            <div class="card-body">
                <input type="text" id="qbCustomerSearch" class="form-input"
                       placeholder="Search QuickBooks customers..."
                       oninput="searchQbCustomers(this.value)"
                       style="width: 100%;">
                <div id="qbCustomerResults" class="customer-search-results hidden"></div>
                <div id="selectedQbCustomer" class="${estimateBuilderState.qbCustomer ? '' : 'hidden'}">
                    ${estimateBuilderState.qbCustomer ? `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #e8f5e9; border-radius: 8px; margin-top: 12px;">
                            <div>
                                <div style="font-weight: 600; color: #2e7d32;">${estimateBuilderState.qbCustomer.DisplayName}</div>
                            </div>
                            <button class="btn btn-outline" style="font-size: 12px;" onclick="clearQbCustomer()">Change</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <!-- Line Items -->
        <div class="card" style="margin-bottom: 20px;">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;">Line Items</h3>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-outline" onclick="openAddPartModal()">+ Part</button>
                    <button class="btn btn-outline" onclick="openAddLaborModal()">+ Labor</button>
                    <button class="btn btn-outline" onclick="openAddCustomModal()">+ Custom</button>
                </div>
            </div>
            <div class="card-body" style="padding: 0;">
                <div id="estimateLineItemsContainer"></div>
            </div>
        </div>

        <!-- Procurement Notes -->
        <div class="card" style="margin-bottom: 20px;">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;">Procurement Notes</h3>
                <div style="position: relative;">
                    <button class="btn btn-outline" onclick="toggleProcurementDropdown()">+ Add Note</button>
                    <div id="procurementNoteDropdown" class="hidden" style="position: absolute; right: 0; top: 100%; margin-top: 4px; background: white; border: 1px solid #dee2e6; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 320px; z-index: 100; max-height: 300px; overflow-y: auto;">
                        ${(typeof COMMON_PROCUREMENT_NOTES !== 'undefined' ? COMMON_PROCUREMENT_NOTES : []).map(note => `
                            <div style="padding: 10px 14px; cursor: pointer; border-bottom: 1px solid #f5f5f5; font-size: 13px;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'" onclick="addProcurementNote('${note.text.replace(/'/g, "\\'")}', '${note.category}'); toggleProcurementDropdown();">
                                ${note.text}
                            </div>
                        `).join('')}
                        <div style="padding: 10px 14px; cursor: pointer; font-size: 13px; color: #1565c0; font-weight: 600;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'" onclick="addCustomProcurementNote(); toggleProcurementDropdown();">
                            Custom note...
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-body" id="procurementNotesContainer"></div>
        </div>

        <!-- Totals -->
        <div class="card" style="margin-bottom: 20px;">
            <div class="card-body" id="estimateTotalsContainer"></div>
        </div>

        <!-- Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <button class="btn btn-secondary" onclick="cancelEstimateBuilder()">Cancel</button>
            <button class="btn btn-primary" id="submitEstimateBtn" onclick="submitEstimateToQb()" disabled>
                Create in QuickBooks
            </button>
        </div>
    `;

    renderLineItems();
    renderProcurementNotes();
    renderTotals();
    updateSubmitButton();
}

function renderLineItems() {
    const container = document.getElementById('estimateLineItemsContainer');
    if (!container) return;

    if (estimateBuilderState.lineItems.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #6c757d;">
                No line items yet. Add parts, labor, or custom items above.
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table class="data-table" style="margin: 0;">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Description</th>
                    <th style="width: 80px; text-align: right;">Qty</th>
                    <th style="width: 100px; text-align: right;">Unit Price</th>
                    <th style="width: 100px; text-align: right;">Amount</th>
                    <th style="width: 40px;"></th>
                </tr>
            </thead>
            <tbody>
                ${estimateBuilderState.lineItems.map((item, index) => {
                    const stockEntry = estimateBuilderState.stockParts.find(sp => sp.lineItemIndex === index);
                    const stockBadge = stockEntry
                        ? `<span class="stock-badge" onclick="removeStockMark(${index})" title="Click to remove">${stockEntry.stockLocation} ×</span>`
                        : (item.type === 'part' || item.type === 'custom'
                            ? `<span style="font-size: 11px; color: #1565c0; cursor: pointer; text-decoration: underline;" onclick="markAsStockPart(${index})">stock?</span>`
                            : '');
                    return `
                    <tr>
                        <td>
                            <span class="badge" style="background: ${item.type === 'part' ? '#e3f2fd' : item.type === 'labor' ? '#fff3e0' : '#f3e5f5'}; color: ${item.type === 'part' ? '#1565c0' : item.type === 'labor' ? '#e65100' : '#7b1fa2'}; font-size: 10px; margin-right: 6px;">
                                ${item.type.toUpperCase()}
                            </span>
                            ${item.itemName}
                            ${stockBadge ? `<span style="margin-left: 6px;">${stockBadge}</span>` : ''}
                        </td>
                        <td style="font-size: 13px; color: #6c757d;">${item.description || '-'}</td>
                        <td style="text-align: right;">${item.quantity}</td>
                        <td style="text-align: right;">$${item.unitPrice.toFixed(2)}</td>
                        <td style="text-align: right; font-weight: 600;">$${item.amount.toFixed(2)}</td>
                        <td style="text-align: center;">
                            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; color: #dc3545; border-color: #dc3545;" onclick="removeLineItem(${index})">×</button>
                        </td>
                    </tr>
                `}).join('')}
            </tbody>
        </table>
    `;
}

function renderTotals() {
    const container = document.getElementById('estimateTotalsContainer');
    if (!container) return;

    const { subtotal, shipping, total } = calculateTotals();

    container.innerHTML = `
        <div style="text-align: right;">
            <div style="margin-bottom: 8px;">
                <span style="color: #6c757d;">Subtotal:</span>
                <span style="font-weight: 600; margin-left: 12px;">$${subtotal.toFixed(2)}</span>
            </div>
            <div style="margin-bottom: 12px;">
                <span style="color: #6c757d;">Shipping:</span>
                <span style="margin-left: 12px;">$</span>
                <input type="number" id="estShipping" value="${shipping}" min="0" step="0.01"
                       style="width: 80px; text-align: right; padding: 4px 8px; border: 1px solid #dee2e6; border-radius: 4px;"
                       onchange="updateShipping()">
            </div>
            <div style="font-size: 20px; font-weight: 700; color: #2e7d32; padding-top: 12px; border-top: 2px solid #dee2e6;">
                Total: $${total.toFixed(2)}
            </div>
        </div>
    `;
}

function updateSubmitButton() {
    const btn = document.getElementById('submitEstimateBtn');
    if (!btn) return;

    const hasCustomer = !!estimateBuilderState.qbCustomer;
    const hasLineItems = estimateBuilderState.lineItems.length > 0;

    btn.disabled = !hasCustomer || !hasLineItems || estimateBuilderState.isSubmitting;

    if (estimateBuilderState.isSubmitting) {
        btn.textContent = 'Creating...';
    } else {
        btn.textContent = 'Create in QuickBooks';
    }
}

// ==========================================
// SUBMISSION
// ==========================================

async function submitEstimateToQb() {
    if (!estimateBuilderState.qbCustomer) {
        alert('Please select a customer');
        return;
    }

    if (estimateBuilderState.lineItems.length === 0) {
        alert('Please add at least one line item');
        return;
    }

    estimateBuilderState.isSubmitting = true;
    updateSubmitButton();

    try {
        // Build QB estimate payload
        const { total } = calculateTotals();

        const estimateData = {
            customerId: estimateBuilderState.qbCustomer.Id,
            customerName: estimateBuilderState.qbCustomer.DisplayName,
            lineItems: estimateBuilderState.lineItems.map(item => ({
                itemName: item.itemName,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount
            })),
            shippingCost: estimateBuilderState.shippingCost,
            total: total,
            sourceInspectionId: estimateBuilderState.sourceInspection?.jobNumber || null,
            memo: composeProcurementMemo()
        };

        const result = await EstimatesAPI.create(estimateData);

        // Success
        alert(`Estimate created successfully!\nEstimate #${result.docNumber || result.id || 'N/A'}`);

        // Clear cache and refresh
        EstimatesAPI.clearCache();

        // Reset builder and go back to estimates list
        filterEstimates('all');
        loadEstimatesList();

    } catch (err) {
        console.error('Failed to create estimate:', err);
        alert(`Failed to create estimate: ${err.message}`);
    } finally {
        estimateBuilderState.isSubmitting = false;
        updateSubmitButton();
    }
}

// Cancel and go back
function cancelEstimateBuilder() {
    if (estimateBuilderState.lineItems.length > 0) {
        if (!confirm('Discard this estimate?')) {
            return;
        }
    }
    filterEstimates('all');
}

// ==========================================
// OPEN BUILDER FROM INSPECTION
// ==========================================

// Called from ops-review.js when "Build Estimate" is clicked
function openEstimateBuilderFromInspection(inspection) {
    // Switch to estimates view
    showView('estimates');

    // Switch to create tab
    filterEstimates('create');

    // Initialize with prefill data
    initEstimateBuilder(inspection);
}

// Make functions globally available
window.initEstimateBuilder = initEstimateBuilder;
window.searchQbCustomers = searchQbCustomers;
window.selectQbCustomer = selectQbCustomer;
window.clearQbCustomer = clearQbCustomer;
window.openAddPartModal = openAddPartModal;
window.closeAddPartModal = closeAddPartModal;
window.searchPartsForEstimate = searchPartsForEstimate;
window.promptPartQuantity = promptPartQuantity;
window.openAddLaborModal = openAddLaborModal;
window.closeAddLaborModal = closeAddLaborModal;
window.addLaborFromModal = addLaborFromModal;
window.openAddCustomModal = openAddCustomModal;
window.closeAddCustomModal = closeAddCustomModal;
window.addCustomFromModal = addCustomFromModal;
window.removeLineItem = removeLineItem;
window.updateShipping = updateShipping;
window.submitEstimateToQb = submitEstimateToQb;
window.cancelEstimateBuilder = cancelEstimateBuilder;
window.openEstimateBuilderFromInspection = openEstimateBuilderFromInspection;
window.confirmSuggestion = confirmSuggestion;
window.dismissSuggestion = dismissSuggestion;
window.addProcurementNote = addProcurementNote;
window.addCustomProcurementNote = addCustomProcurementNote;
window.removeProcurementNote = removeProcurementNote;
window.markAsStockPart = markAsStockPart;
window.removeStockMark = removeStockMark;
window.toggleProcurementDropdown = toggleProcurementDropdown;
