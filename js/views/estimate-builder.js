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
    isSubmitting: false
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
        isSubmitting: false
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
    renderLineItems();
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

            resultsDiv.innerHTML = result.parts.map(part => `
                <div class="part-result-item" onclick="promptPartQuantity('${part.id}', ${JSON.stringify(part).replace(/'/g, "\\'").replace(/"/g, '&quot;')})">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div style="font-weight: 600;">${part.partNumber || 'N/A'}</div>
                            <div style="font-size: 13px; color: #495057;">${part.productName || part.description || ''}</div>
                            <div style="font-size: 12px; color: #6c757d;">${part.vendor || ''} ${part.category ? '• ' + part.category : ''}</div>
                        </div>
                        <div style="font-weight: 600; color: #2e7d32;">$${(parseFloat(part.price) || 0).toFixed(2)}</div>
                    </div>
                </div>
            `).join('');
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
                ${estimateBuilderState.lineItems.map((item, index) => `
                    <tr>
                        <td>
                            <span class="badge" style="background: ${item.type === 'part' ? '#e3f2fd' : item.type === 'labor' ? '#fff3e0' : '#f3e5f5'}; color: ${item.type === 'part' ? '#1565c0' : item.type === 'labor' ? '#e65100' : '#7b1fa2'}; font-size: 10px; margin-right: 6px;">
                                ${item.type.toUpperCase()}
                            </span>
                            ${item.itemName}
                        </td>
                        <td style="font-size: 13px; color: #6c757d;">${item.description || '-'}</td>
                        <td style="text-align: right;">${item.quantity}</td>
                        <td style="text-align: right;">$${item.unitPrice.toFixed(2)}</td>
                        <td style="text-align: right; font-weight: 600;">$${item.amount.toFixed(2)}</td>
                        <td style="text-align: center;">
                            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px; color: #dc3545; border-color: #dc3545;" onclick="removeLineItem(${index})">×</button>
                        </td>
                    </tr>
                `).join('')}
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
            sourceInspectionId: estimateBuilderState.sourceInspection?.jobNumber || null
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
