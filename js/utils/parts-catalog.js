// ==========================================
// PARTS CATALOG & LEGACY INSPECTION
// Airtable search, part selection, old inspection form
// ==========================================

// Legacy stub — inspections view now loads from API via loadInspectionsView() in scheduling.js
function loadOfficeInspections() {
    if (typeof loadInspectionsView === 'function') {
        loadInspectionsView();
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
            // Get primary contacts
            const custContact = getPrimaryContact(customer.contacts);
            const locContact = getPrimaryContact(location.contacts);

            // Billing entity info
            const typeIcon = customer.type === 'county' ? '🏛️' : '🏫';
            document.getElementById('billingEntityName').textContent = `${typeIcon} ${customer.name}`;
            document.getElementById('billingEntityContact').textContent = `${custContact.name} • ${custContact.phone || customer.phone}`;

            // Service location info
            document.getElementById('customerName').textContent = location.name;
            document.getElementById('customerAddress').textContent = location.address;
            document.getElementById('customerContact').textContent = `${locContact.name} • ${locContact.phone}`;

            info.classList.remove('hidden');

            // Store in current inspection
            currentInspection.customerId = customerId;
            currentInspection.customerName = customer.name;
            currentInspection.customerType = customer.type;
            currentInspection.locationId = locationId;
            currentInspection.locationName = location.name;
            currentInspection.locationAddress = location.address;
            currentInspection.locationContact = locContact.name;
            currentInspection.locationPhone = locContact.phone;
            currentInspection.billingContact = custContact.name;
            currentInspection.billingPhone = custContact.phone || customer.phone;
            currentInspection.location = document.getElementById('locationInput').value || location.address;
        }
    } else {
        info.classList.add('hidden');
    }
}

async function searchParts() {
    const searchTerm = document.getElementById('partSearch').value.trim();
    const vendor = document.getElementById('vendorFilter').value;
    const results = document.getElementById('partsResults');

    if (!searchTerm && !vendor) {
        results.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">Enter a search term or select a vendor</div>';
        return;
    }

    results.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">Searching parts catalog...</div>';

    try {
        const data = await PartsAPI.search(searchTerm || null, null, vendor || null, 100);

        // Store results for selection
        searchResults = {};
        data.parts.forEach(p => { searchResults[p.id] = p; });

        if (data.parts.length === 0) {
            results.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">No parts found matching your search</div>';
        } else {
            results.innerHTML = `
                <p style="font-size: 12px; color: #6c757d; margin: 12px 0;">Found ${data.parts.length} parts</p>
                ${data.parts.map(part => {
                    const price = parseFloat(part.price) || 0;
                    const priceDisplay = part.priceNote || (price > 0 ? `$${price.toFixed(2)}` : 'N/A');
                    const safePartNumber = (part.partNumber || '').replace(/'/g, "\\'");
                    const safeProductName = (part.productName || '').replace(/'/g, "\\'");
                    const safeVendor = (part.vendor || 'Hussey Seating Co').replace(/'/g, "\\'");
                    const imageHtml = part.imageUrl
                        ? `<img src="${part.imageUrl}" onclick="event.stopPropagation(); showPartImage('${part.imageUrl}', '${safePartNumber}', '${safeProductName}', '${price}', '${safeVendor}')" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px; margin-right: 12px; cursor: pointer; background: #fff;" title="Tap image to enlarge">`
                        : '';
                    return `
                        <div class="part-result" onclick="selectPart('${part.id}')" style="display: flex; align-items: flex-start;">
                            ${imageHtml}
                            <div style="flex: 1;">
                                <div style="margin-bottom: 8px;">
                                    <span class="part-number">${part.partNumber || '—'}</span>
                                    <span class="part-vendor">${part.vendor || 'Hussey Seating Co'}</span>
                                    ${part.imageUrl ? '<span style="color: #0066cc; font-size: 10px; margin-left: 6px;">📷</span>' : ''}
                                </div>
                                <div class="part-description">${part.productName || 'Unknown Part'}</div>
                                <div class="part-meta">
                                    <span class="part-category">${part.category || ''}</span>
                                    <span class="part-price">${priceDisplay}</span>
                                </div>
                                ${part.productLine ? `<div style="font-size: 11px; color: #888; margin-top: 4px;">${part.productLine}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            `;
        }
    } catch (err) {
        results.innerHTML = `<div style="text-align: center; padding: 20px; color: #dc3545;">Search failed: ${err.message}</div>`;
    }
}

// ─── Client-side sort for parts results ─────────────────────
let _lastTechParts = [];
let _lastOfficeParts = [];

function sortPartsArray(parts, sortKey) {
    const sorted = [...parts];
    switch (sortKey) {
        case 'name_asc':
            sorted.sort((a, b) => (a.productName || '').localeCompare(b.productName || ''));
            break;
        case 'name_desc':
            sorted.sort((a, b) => (b.productName || '').localeCompare(a.productName || ''));
            break;
        case 'part_number':
            sorted.sort((a, b) => (a.partNumber || '').localeCompare(b.partNumber || ''));
            break;
        case 'price_asc':
            sorted.sort((a, b) => (parseFloat(a.price) || 99999) - (parseFloat(b.price) || 99999));
            break;
        case 'price_desc':
            sorted.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
            break;
        case 'vendor':
            sorted.sort((a, b) => (a.vendor || '').localeCompare(b.vendor || '') || (a.productName || '').localeCompare(b.productName || ''));
            break;
    }
    return sorted;
}

// ─── Pagination state ─────────────────────────────────────────
const PARTS_PAGE_SIZE = 50;
let _techPage = 0;
let _techTotal = 0;
let _techIsSearch = false;
let _officePage = 0;
let _officeTotal = 0;
let _officeIsSearch = false;

function renderRelatedParts(relatedParts) {
    if (!relatedParts || !Array.isArray(relatedParts) || relatedParts.length === 0) return '';
    const items = relatedParts.map(rp => {
        const safePn = (rp.partNumber || '').replace(/'/g, "\\'");
        const priceHtml = rp.price ? `<span style="font-size: 11px; color: #888; margin-left: auto; white-space: nowrap;">$${parseFloat(rp.price).toFixed(2)}</span>` : '';
        return `<div style="display: flex; align-items: center; gap: 6px; padding: 3px 0;">
            <span onclick="event.stopPropagation(); document.querySelector('[id\$=PartSearchInput]').value='${safePn}'; document.querySelector('[id\$=PartSearchInput]').dispatchEvent(new Event('input'));" style="background: #e3f2fd; color: #1565c0; padding: 2px 7px; border-radius: 4px; font-family: monospace; font-size: 11px; font-weight: 600; cursor: pointer;">${rp.partNumber}</span>
            <span style="font-size: 11px; color: #555;">${rp.name || ''}</span>
            ${priceHtml}
        </div>`;
    }).join('');
    return `<div style="margin-top: 8px; padding: 8px 10px; background: #f0f7ff; border-radius: 6px; border: 1px solid #d4e6f9;">
        <div style="font-size: 11px; font-weight: 700; color: #1565c0; margin-bottom: 4px;">Related Hardware</div>
        ${items}
    </div>`;
}

function renderPagination(prefix, currentPage, total, onPageFn) {
    const totalPages = Math.ceil(total / PARTS_PAGE_SIZE);
    if (totalPages <= 1) return '';

    const start = currentPage * PARTS_PAGE_SIZE + 1;
    const end = Math.min((currentPage + 1) * PARTS_PAGE_SIZE, total);

    let pageButtons = '';
    // Show up to 5 page buttons centered on current page
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(0, endPage - 4);

    for (let i = startPage; i <= endPage; i++) {
        const active = i === currentPage;
        pageButtons += `<button onclick="${onPageFn}(${i})" style="
            padding: 6px 12px; border: 1px solid ${active ? '#2d3748' : '#dee2e6'}; border-radius: 6px;
            background: ${active ? '#2d3748' : '#fff'}; color: ${active ? '#fff' : '#495057'};
            cursor: pointer; font-size: 13px; font-weight: ${active ? '600' : '400'};
        ">${i + 1}</button>`;
    }

    return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-top: 1px solid #eee; margin-top: 8px;">
            <span style="font-size: 12px; color: #6c757d;">${start}–${end} of ${total.toLocaleString()} parts</span>
            <div style="display: flex; gap: 4px; align-items: center;">
                <button onclick="${onPageFn}(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''} style="
                    padding: 6px 10px; border: 1px solid #dee2e6; border-radius: 6px; background: #fff;
                    cursor: ${currentPage === 0 ? 'default' : 'pointer'}; opacity: ${currentPage === 0 ? '0.4' : '1'}; font-size: 13px;
                ">Prev</button>
                ${pageButtons}
                <button onclick="${onPageFn}(${currentPage + 1})" ${currentPage >= totalPages - 1 ? 'disabled' : ''} style="
                    padding: 6px 10px; border: 1px solid #dee2e6; border-radius: 6px; background: #fff;
                    cursor: ${currentPage >= totalPages - 1 ? 'default' : 'pointer'}; opacity: ${currentPage >= totalPages - 1 ? '0.4' : '1'}; font-size: 13px;
                ">Next</button>
            </div>
        </div>
    `;
}

// ─── Tech/Field parts catalog ─────────────────────────────────

// Auto-load parts with photos when view opens
async function initTechPartsCatalog() {
    _techPage = 0;
    _techIsSearch = false;
    document.getElementById('techPartSearchInput').value = '';
    if (document.getElementById('techPartVendorFilter')) document.getElementById('techPartVendorFilter').value = '';
    await loadTechPartsPage(0);
}

async function loadTechPartsPage(page) {
    _techPage = page;
    const results = document.getElementById('techPartSearchResults');
    const searchTerm = document.getElementById('techPartSearchInput').value.trim();
    const vendor = document.getElementById('techPartVendorFilter')?.value || '';
    const isSearch = !!(searchTerm || vendor);

    results.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">Loading parts...</div>';

    try {
        const offset = page * PARTS_PAGE_SIZE;
        const data = await PartsAPI.search(
            searchTerm || null, null, vendor || null,
            PARTS_PAGE_SIZE, offset, !isSearch // has_image=true only for browse mode
        );
        _lastTechParts = data.parts;
        _techTotal = data.total || data.parts.length;
        _techIsSearch = isSearch;

        renderTechParts(_lastTechParts, results, page, _techTotal, isSearch);
    } catch (err) {
        results.innerHTML = `<div style="text-align: center; padding: 20px; color: #dc3545;">Failed to load parts: ${err.message}</div>`;
    }
}

function goToTechPage(page) {
    const totalPages = Math.ceil(_techTotal / PARTS_PAGE_SIZE);
    if (page < 0 || page >= totalPages) return;
    loadTechPartsPage(page);
    // Scroll results into view
    document.getElementById('techPartSearchResults')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function searchTechParts() {
    const searchTerm = document.getElementById('techPartSearchInput').value.trim();
    const vendor = document.getElementById('techPartVendorFilter')?.value || '';

    if (!searchTerm && !vendor) {
        // Reset to browse mode (parts with photos)
        _techPage = 0;
        _techIsSearch = false;
        await loadTechPartsPage(0);
        return;
    }

    if (searchTerm && searchTerm.length < 2) {
        document.getElementById('techPartSearchResults').innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">Enter at least 2 characters</div>';
        return;
    }

    _techPage = 0;
    _techIsSearch = true;
    await loadTechPartsPage(0);
}

function sortTechParts() {
    if (!_lastTechParts.length) return;
    const sortKey = document.getElementById('techPartSortSelect')?.value || 'name_asc';
    const results = document.getElementById('techPartSearchResults');
    renderTechParts(sortPartsArray(_lastTechParts, sortKey), results, _techPage, _techTotal, _techIsSearch);
}

function renderTechParts(parts, container, currentPage, total, isSearch) {
    // Support old call signature (parts, container) for backward compat
    if (currentPage === undefined) { currentPage = 0; total = parts.length; isSearch = true; }

    if (parts.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">No parts found</div>';
        return;
    }

    const label = isSearch
        ? `Found ${total.toLocaleString()} parts`
        : `Browsing ${total.toLocaleString()} parts with photos`;

    container.innerHTML = `
        <p style="font-size: 12px; color: #6c757d; margin: 12px 0;">${label}</p>
        ${renderPagination('tech', currentPage, total, 'goToTechPage')}
        ${parts.map(part => {
            const safePartNumber = (part.partNumber || '').replace(/'/g, "\\'");
            const safeProductName = (part.productName || '').replace(/'/g, "\\'");
            const safeVendor = (part.vendor || 'Hussey Seating Co').replace(/'/g, "\\'");
            const rpJson = part.relatedParts ? encodeURIComponent(JSON.stringify(part.relatedParts)) : '';
            const clickHandler = part.imageUrl ? `onclick="showPartImage('${part.imageUrl}', '${safePartNumber}', '${safeProductName}', '${safeVendor}', null, decodeURIComponent('${rpJson}'))"` : '';
            const imageHtml = part.imageUrl
                ? `<img src="${part.imageUrl}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px; margin-right: 12px; background: #fff;">`
                : '';
            return `
                <div class="part-result" ${clickHandler} style="cursor: ${part.imageUrl ? 'pointer' : 'default'}; display: flex; align-items: flex-start;">
                    ${imageHtml}
                    <div style="flex: 1;">
                        <div style="margin-bottom: 8px;">
                            <span class="part-number">${part.partNumber || '—'}</span>
                            <span class="part-vendor">${part.vendor || 'Hussey Seating Co'}</span>
                            ${part.imageUrl ? '<span style="color: #0066cc; font-size: 11px; margin-left: 8px;">Tap to view</span>' : ''}
                        </div>
                        <div class="part-description">${part.productName || 'Unknown Part'}</div>
                        <div class="part-meta">
                            <span class="part-category">${part.category || ''}</span>
                        </div>
                        ${part.productLine ? `<div style="font-size: 11px; color: #888; margin-top: 4px;">${part.productLine}</div>` : ''}
                        ${renderRelatedParts(part.relatedParts)}
                    </div>
                </div>
            `;
        }).join('')}
        ${renderPagination('tech', currentPage, total, 'goToTechPage')}
    `;
}

// ─── Office parts catalog ─────────────────────────────────────

// Auto-load parts with photos when view opens
async function initOfficePartsCatalog() {
    _officePage = 0;
    _officeIsSearch = false;
    document.getElementById('officePartSearchInput').value = '';
    if (document.getElementById('officePartVendorFilter')) document.getElementById('officePartVendorFilter').value = '';
    await loadOfficePartsPage(0);
}

async function loadOfficePartsPage(page) {
    _officePage = page;
    const results = document.getElementById('officePartSearchResults');
    const searchTerm = document.getElementById('officePartSearchInput').value.trim();
    const vendor = document.getElementById('officePartVendorFilter')?.value || '';
    const isSearch = !!(searchTerm || vendor);

    results.innerHTML = '<div style="text-align: center; padding: 40px; color: #6c757d;">Loading parts...</div>';

    try {
        const offset = page * PARTS_PAGE_SIZE;
        const data = await PartsAPI.search(
            searchTerm || null, null, vendor || null,
            PARTS_PAGE_SIZE, offset, !isSearch // has_image=true only for browse mode
        );
        _lastOfficeParts = data.parts;
        _officeTotal = data.total || data.parts.length;
        _officeIsSearch = isSearch;

        renderOfficeParts(_lastOfficeParts, results, page, _officeTotal, isSearch);
    } catch (err) {
        results.innerHTML = `<div style="text-align: center; padding: 20px; color: #dc3545;">Failed to load parts: ${err.message}</div>`;
    }
}

function goToOfficePage(page) {
    const totalPages = Math.ceil(_officeTotal / PARTS_PAGE_SIZE);
    if (page < 0 || page >= totalPages) return;
    loadOfficePartsPage(page);
    document.getElementById('officePartSearchResults')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function searchOfficeParts() {
    const searchTerm = document.getElementById('officePartSearchInput').value.trim();
    const vendor = document.getElementById('officePartVendorFilter')?.value || '';

    if (!searchTerm && !vendor) {
        // Reset to browse mode (parts with photos)
        _officePage = 0;
        _officeIsSearch = false;
        await loadOfficePartsPage(0);
        return;
    }

    if (searchTerm && searchTerm.length < 2) {
        document.getElementById('officePartSearchResults').innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">Enter at least 2 characters</div>';
        return;
    }

    _officePage = 0;
    _officeIsSearch = true;
    await loadOfficePartsPage(0);
}

function sortOfficeParts() {
    if (!_lastOfficeParts.length) return;
    const sortKey = document.getElementById('officePartSortSelect')?.value || 'name_asc';
    const results = document.getElementById('officePartSearchResults');
    renderOfficeParts(sortPartsArray(_lastOfficeParts, sortKey), results, _officePage, _officeTotal, _officeIsSearch);
}

function renderOfficeParts(parts, container, currentPage, total, isSearch) {
    // Support old call signature (parts, container) for backward compat
    if (currentPage === undefined) { currentPage = 0; total = parts.length; isSearch = true; }

    if (parts.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">No parts found</div>';
        return;
    }

    const label = isSearch
        ? `Found ${total.toLocaleString()} parts`
        : `Browsing ${total.toLocaleString()} parts with photos`;

    container.innerHTML = `
        <p style="font-size: 12px; color: #6c757d; margin: 12px 0;">${label}</p>
        ${renderPagination('office', currentPage, total, 'goToOfficePage')}
        ${parts.map(part => {
            const price = parseFloat(part.price) || 0;
            const priceDisplay = part.priceNote || (price > 0 ? `$${price.toFixed(2)}` : 'N/A');
            const safePartNumber = (part.partNumber || '').replace(/'/g, "\\'");
            const safeProductName = (part.productName || '').replace(/'/g, "\\'");
            const safeVendor = (part.vendor || 'Hussey Seating Co').replace(/'/g, "\\'");
            const rpJson = part.relatedParts ? encodeURIComponent(JSON.stringify(part.relatedParts)) : '';
            const clickHandler = part.imageUrl ? `onclick="showPartImage('${part.imageUrl}', '${safePartNumber}', '${safeProductName}', '${price}', '${safeVendor}', decodeURIComponent('${rpJson}'))"` : '';
            const imageHtml = part.imageUrl
                ? `<img src="${part.imageUrl}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px; margin-right: 12px; background: #fff;">`
                : '';
            return `
                <div class="part-result" ${clickHandler} style="cursor: ${part.imageUrl ? 'pointer' : 'default'}; display: flex; align-items: flex-start;">
                    ${imageHtml}
                    <div style="flex: 1;">
                        <div style="margin-bottom: 8px;">
                            <span class="part-number">${part.partNumber || '—'}</span>
                            <span class="part-vendor">${part.vendor || 'Hussey Seating Co'}</span>
                            ${part.imageUrl ? '<span style="color: #0066cc; font-size: 11px; margin-left: 8px;">Tap to view</span>' : ''}
                        </div>
                        <div class="part-description">${part.productName || 'Unknown Part'}</div>
                        <div class="part-meta">
                            <span class="part-category">${part.category || ''}</span>
                            <span class="part-price">${priceDisplay}</span>
                        </div>
                        ${part.productLine ? `<div style="font-size: 11px; color: #888; margin-top: 4px;">${part.productLine}</div>` : ''}
                        ${part.description ? `<div style="font-size: 12px; color: #666; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">${part.description}</div>` : ''}
                        ${renderRelatedParts(part.relatedParts)}
                    </div>
                </div>
            `;
        }).join('')}
        ${renderPagination('office', currentPage, total, 'goToOfficePage')}
    `;
}

function selectPart(recordId) {
    // Get part data from stored search results
    const partData = searchResults[recordId];
    if (!partData) {
        console.error('Part not found in search results');
        return;
    }

    const partName = partData.productName || 'Unknown Part';
    const quantity = parseInt(prompt(`How many "${partName}"?`, '1'));

    if (quantity > 0) {
        if (!currentInspection.selectedParts) currentInspection.selectedParts = [];

        // Part data is already in correct format from API
        const part = {
            id: recordId,
            partNumber: partData.partNumber || '—',
            description: partData.productName || 'Unknown Part',
            vendor: partData.vendor || 'Hussey Seating Co',
            category: partData.category || '',
            price: parseFloat(partData.price) || 0,
            productLine: partData.productLine || '',
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

