// ==========================================
// ADMIN
// Employees, data management, vendors
// ==========================================

// ==========================================
// EMPLOYEE MANAGEMENT
// Add, edit, delete, load employees
// ==========================================

function saveEmployeesData() {
    localStorage.setItem('employees', JSON.stringify(EMPLOYEES));
}

function loadEmployees() {
    var tbody = document.getElementById('employeesTableBody');
    if (!tbody) return;
    var roleColors = { Admin: '#dc3545', Office: '#0066cc', Inspector: '#28a745', Technician: '#6f42c1' };
    var html = '';
    EMPLOYEES.forEach(function(emp) {
        var color = roleColors[emp.role] || '#6c757d';
        html += '<tr style="border-bottom: 1px solid #f0f2f5;">' +
            '<td style="padding: 12px 16px; font-weight: 600;">' + emp.firstName + ' ' + emp.lastName + '</td>' +
            '<td style="padding: 12px 16px;"><span style="background:' + color + '15; color:' + color + '; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">' + emp.role + '</span></td>' +
            '<td style="padding: 12px 16px; color: #495057;">' + (emp.email || '—') + '</td>' +
            '<td style="padding: 12px 16px; color: #495057;">' + (emp.phone || '—') + '</td>' +
            '<td style="padding: 12px 16px; color: #495057;">' + emp.territory + '</td>' +
            '<td style="padding: 12px 16px; text-align: center;">' +
                '<button class="btn btn-sm" onclick="editEmployee(\'' + emp.id + '\')" style="padding: 4px 10px; font-size: 12px; margin-right: 4px;">Edit</button>' +
                '<button class="btn btn-sm" onclick="deleteEmployee(\'' + emp.id + '\')" style="padding: 4px 10px; font-size: 12px; color: #dc3545;">Delete</button>' +
            '</td></tr>';
    });
    tbody.innerHTML = html;
}

function loadEmployeesManage() {
    var container = document.getElementById('employeesListManage');
    var roleColors = { Admin: '#dc3545', Office: '#0066cc', Inspector: '#28a745', Technician: '#6f42c1' };

    if (EMPLOYEES.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding: 40px; text-align: center;"><div style="font-size: 48px; margin-bottom: 12px;">👥</div><p style="color: #6c757d;">No employees yet</p></div>';
        return;
    }

    var html = '<div class="card"><div class="card-body" style="padding: 0;"><table style="width: 100%; border-collapse: collapse; font-size: 13px;">' +
        '<thead><tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">' +
        '<th style="padding: 10px 12px; text-align: left; font-weight: 600;">Name</th>' +
        '<th style="padding: 10px 12px; text-align: left; font-weight: 600;">Role</th>' +
        '<th style="padding: 10px 12px; text-align: left; font-weight: 600;">Email</th>' +
        '<th style="padding: 10px 12px; text-align: left; font-weight: 600;">Phone</th>' +
        '<th style="padding: 10px 12px; text-align: left; font-weight: 600;">Territory</th>' +
        '<th style="padding: 10px 12px; text-align: center; font-weight: 600; width: 120px;">Actions</th>' +
        '</tr></thead><tbody>';

    EMPLOYEES.forEach(function(emp) {
        var color = roleColors[emp.role] || '#6c757d';
        html += '<tr style="border-bottom: 1px solid #f0f2f5;">' +
            '<td style="padding: 12px; font-weight: 600;">' + emp.firstName + ' ' + emp.lastName + '</td>' +
            '<td style="padding: 12px;"><span style="background:' + color + '15; color:' + color + '; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">' + emp.role + '</span></td>' +
            '<td style="padding: 12px; color: #495057;">' + (emp.email || '—') + '</td>' +
            '<td style="padding: 12px; color: #495057;">' + (emp.phone || '—') + '</td>' +
            '<td style="padding: 12px; color: #495057;">' + (emp.territory || '—') + '</td>' +
            '<td style="padding: 12px; text-align: center;">' +
                '<button class="btn btn-sm" onclick="editEmployee(\'' + emp.id + '\')" style="padding: 4px 10px; font-size: 12px; margin-right: 4px;">Edit</button>' +
                '<button class="btn btn-sm" onclick="deleteEmployee(\'' + emp.id + '\')" style="padding: 4px 10px; font-size: 12px; color: #dc3545;">Delete</button>' +
            '</td></tr>';
    });

    html += '</tbody></table></div></div>';
    container.innerHTML = html;
}

function showAddEmployeeModal() {
    editingEmployeeId = null;
    document.getElementById('employeeModalTitle').textContent = 'Add Employee';
    document.getElementById('empFirstName').value = '';
    document.getElementById('empLastName').value = '';
    document.getElementById('empRole').value = 'Technician';
    document.getElementById('empEmail').value = '';
    document.getElementById('empPhone').value = '';
    document.getElementById('empTerritory').value = 'Original';
    var modal = document.getElementById('employeeModal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function editEmployee(id) {
    var emp = EMPLOYEES.find(function(e) { return e.id === id; });
    if (!emp) return;
    editingEmployeeId = id;
    document.getElementById('employeeModalTitle').textContent = 'Edit Employee';
    document.getElementById('empFirstName').value = emp.firstName;
    document.getElementById('empLastName').value = emp.lastName;
    document.getElementById('empRole').value = emp.role;
    document.getElementById('empEmail').value = emp.email || '';
    document.getElementById('empPhone').value = emp.phone || '';
    document.getElementById('empTerritory').value = emp.territory || 'Original';
    var modal = document.getElementById('employeeModal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function saveEmployee() {
    var first = document.getElementById('empFirstName').value.trim();
    var last = document.getElementById('empLastName').value.trim();
    if (!first || !last) { alert('First and last name are required.'); return; }
    var data = {
        firstName: first,
        lastName: last,
        role: document.getElementById('empRole').value,
        email: document.getElementById('empEmail').value.trim(),
        phone: document.getElementById('empPhone').value.trim(),
        territory: document.getElementById('empTerritory').value
    };
    if (editingEmployeeId) {
        var idx = EMPLOYEES.findIndex(function(e) { return e.id === editingEmployeeId; });
        if (idx !== -1) { data.id = editingEmployeeId; EMPLOYEES[idx] = data; }
    } else {
        data.id = 'emp' + Date.now();
        EMPLOYEES.push(data);
    }
    saveEmployeesData();
    closeEmployeeModal();
    loadEmployees();
}

function deleteEmployee(id) {
    if (!confirm('Delete this employee?')) return;
    EMPLOYEES = EMPLOYEES.filter(function(e) { return e.id !== id; });
    saveEmployeesData();
    loadEmployees();
}

function closeEmployeeModal() {
    var modal = document.getElementById('employeeModal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

function loadDataManagement() {
    // Hide Employees tab for office users (admin only)
    var empTab = document.getElementById('dmTabEmployees');
    if (empTab) {
        if (currentRole === 'admin') {
            empTab.style.display = '';
            switchDataTab('employees');
        } else {
            empTab.style.display = 'none';
            switchDataTab('parts');
        }
    }
}

// ==========================================
// SETTINGS
// User profile, QuickBooks integration
// ==========================================

function loadSettings() {
    // Load user profile
    loadUserProfile();

    // Show QB section for Office and Admin
    if (currentRole === 'office' || currentRole === 'admin') {
        document.getElementById('settingsQBSection').classList.remove('hidden');
        checkQuickBooksStatus();
    } else {
        document.getElementById('settingsQBSection').classList.add('hidden');
    }

    // Show Data Management section for Admin and Office
    if (currentRole === 'admin' || currentRole === 'office') {
        document.getElementById('settingsDataSection').classList.remove('hidden');
        loadDataManagement();
    } else {
        document.getElementById('settingsDataSection').classList.add('hidden');
    }
}

function loadUserProfile() {
    // Load from localStorage or use defaults based on role
    const savedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

    document.getElementById('settingsUserName').value = savedProfile.name || document.getElementById('officeUserName')?.textContent || '';
    document.getElementById('settingsUserPhone').value = savedProfile.phone || '';
    document.getElementById('settingsUserEmail').value = savedProfile.email || '';
}

function saveUserProfile() {
    const profile = {
        name: document.getElementById('settingsUserName').value,
        phone: document.getElementById('settingsUserPhone').value,
        email: document.getElementById('settingsUserEmail').value
    };

    localStorage.setItem('userProfile', JSON.stringify(profile));

    // Update the sidebar user name if changed
    if (profile.name) {
        const nameEl = document.getElementById('officeUserName');
        if (nameEl) nameEl.textContent = profile.name;
    }

    alert('Profile saved!');
}

// Tech/Field Settings
function loadTechSettings() {
    const savedProfile = JSON.parse(localStorage.getItem('techUserProfile') || '{}');

    document.getElementById('techSettingsUserName').value = savedProfile.name || document.getElementById('techUserName')?.textContent || '';
    document.getElementById('techSettingsUserPhone').value = savedProfile.phone || '';
    document.getElementById('techSettingsUserEmail').value = savedProfile.email || '';
}

function saveTechUserProfile() {
    const profile = {
        name: document.getElementById('techSettingsUserName').value,
        phone: document.getElementById('techSettingsUserPhone').value,
        email: document.getElementById('techSettingsUserEmail').value
    };

    localStorage.setItem('techUserProfile', JSON.stringify(profile));

    // Update the sidebar user name if changed
    if (profile.name) {
        const nameEl = document.getElementById('techUserName');
        if (nameEl) nameEl.textContent = profile.name;
    }

    alert('Profile saved!');
}

function checkQuickBooksStatus() {
    const indicator = document.getElementById('qbStatusIndicator');
    const statusText = document.getElementById('qbStatusText');
    const statusDetail = document.getElementById('qbStatusDetail');
    const reconnectBtn = document.getElementById('qbReconnectBtn');

    // Check QB connection status via API
    fetch('https://bleachers-api.vercel.app/api/auth/status')
        .then(response => response.json())
        .then(data => {
            if (data.connected) {
                indicator.style.background = '#4caf50';
                statusText.textContent = 'Connected';
                statusDetail.textContent = 'QuickBooks Online is connected and working';
                reconnectBtn.style.display = 'none';
            } else {
                indicator.style.background = '#f44336';
                statusText.textContent = 'Not Connected';
                statusDetail.textContent = data.error || 'QuickBooks connection needs to be established';
                reconnectBtn.style.display = 'block';
            }
        })
        .catch(err => {
            indicator.style.background = '#ff9800';
            statusText.textContent = 'Unable to Check';
            statusDetail.textContent = 'Could not reach the API to verify status';
            reconnectBtn.style.display = 'block';
        });
}

function reconnectQuickBooks() {
    // Open QB OAuth flow in new window
    window.open('https://bleachers-api.vercel.app/api/auth/connect', '_blank', 'width=600,height=700');

    // Re-check status after a delay (user may complete OAuth)
    setTimeout(checkQuickBooksStatus, 5000);
}

function switchDataTab(tab) {
    // Hide all tabs
    document.getElementById('dmEmployeesTab').classList.add('hidden');
    document.getElementById('dmPartsTab').classList.add('hidden');
    document.getElementById('dmImportTab').classList.add('hidden');
    document.getElementById('dmVendorsTab').classList.add('hidden');
    document.getElementById('dmBulletinsTab').classList.add('hidden');
    document.getElementById('dmImagesTab').classList.add('hidden');

    // Reset all tab buttons
    document.getElementById('dmTabEmployees').style.borderBottomColor = 'transparent';
    document.getElementById('dmTabEmployees').style.color = '#6c757d';
    document.getElementById('dmTabParts').style.borderBottomColor = 'transparent';
    document.getElementById('dmTabParts').style.color = '#6c757d';
    document.getElementById('dmTabImport').style.borderBottomColor = 'transparent';
    document.getElementById('dmTabImport').style.color = '#6c757d';
    document.getElementById('dmTabVendors').style.borderBottomColor = 'transparent';
    document.getElementById('dmTabVendors').style.color = '#6c757d';
    document.getElementById('dmTabBulletins').style.borderBottomColor = 'transparent';
    document.getElementById('dmTabBulletins').style.color = '#6c757d';
    document.getElementById('dmTabImages').style.borderBottomColor = 'transparent';
    document.getElementById('dmTabImages').style.color = '#6c757d';

    if (tab === 'employees') {
        document.getElementById('dmEmployeesTab').classList.remove('hidden');
        document.getElementById('dmTabEmployees').style.borderBottomColor = '#4f46e5';
        document.getElementById('dmTabEmployees').style.color = '#4f46e5';
        loadEmployeesManage();
    } else if (tab === 'parts') {
        document.getElementById('dmPartsTab').classList.remove('hidden');
        document.getElementById('dmTabParts').style.borderBottomColor = '#4f46e5';
        document.getElementById('dmTabParts').style.color = '#4f46e5';
        loadAdminParts();
    } else if (tab === 'import') {
        document.getElementById('dmImportTab').classList.remove('hidden');
        document.getElementById('dmTabImport').style.borderBottomColor = '#4f46e5';
        document.getElementById('dmTabImport').style.color = '#4f46e5';
    } else if (tab === 'vendors') {
        document.getElementById('dmVendorsTab').classList.remove('hidden');
        document.getElementById('dmTabVendors').style.borderBottomColor = '#4f46e5';
        document.getElementById('dmTabVendors').style.color = '#4f46e5';
        loadVendors();
    } else if (tab === 'bulletins') {
        document.getElementById('dmBulletinsTab').classList.remove('hidden');
        document.getElementById('dmTabBulletins').style.borderBottomColor = '#4f46e5';
        document.getElementById('dmTabBulletins').style.color = '#4f46e5';
        loadBulletinsManage();
    } else if (tab === 'images') {
        document.getElementById('dmImagesTab').classList.remove('hidden');
        document.getElementById('dmTabImages').style.borderBottomColor = '#4f46e5';
        document.getElementById('dmTabImages').style.color = '#4f46e5';
    }
}

// ==========================================
// PARTS CATALOG MANAGEMENT
// Add, edit, delete, import parts
// ==========================================

// Parts Catalog
var partImageData = null;

async function loadAdminParts() {
    var tbody = document.getElementById('dmPartsTableBody');
    tbody.innerHTML = '<tr><td colspan="6" style="padding: 24px; text-align: center; color: #6c757d;">Loading parts...</td></tr>';

    try {
        var data = await PartsAPI.search('', null, null, 100);
        ADMIN_PARTS = data.parts;

        // Populate category filter
        var cats = {};
        ADMIN_PARTS.forEach(function(p) { if (p.category) cats[p.category] = true; });
        var catSelect = document.getElementById('dmPartsCategoryFilter');
        var currentVal = catSelect.value;
        catSelect.innerHTML = '<option value="">All Categories</option>';
        Object.keys(cats).sort().forEach(function(c) {
            catSelect.innerHTML += '<option value="' + c + '">' + c + '</option>';
        });
        catSelect.value = currentVal;
        renderAdminPartsTable(ADMIN_PARTS);
    } catch (err) {
        console.error('Failed to load parts:', err);
        tbody.innerHTML = '<tr><td colspan="6" style="padding: 24px; text-align: center; color: #dc3545;">Failed to load parts: ' + err.message + '</td></tr>';
    }
}

var adminPartsSearchTimeout = null;

async function filterAdminParts() {
    var search = (document.getElementById('dmPartsSearch').value || '').trim();
    var cat = document.getElementById('dmPartsCategoryFilter').value;
    var tbody = document.getElementById('dmPartsTableBody');

    // Debounce API calls
    if (adminPartsSearchTimeout) clearTimeout(adminPartsSearchTimeout);

    // For empty search, show initial load
    if (!search && !cat) {
        loadAdminParts();
        return;
    }

    adminPartsSearchTimeout = setTimeout(async function() {
        tbody.innerHTML = '<tr><td colspan="6" style="padding: 24px; text-align: center; color: #6c757d;">Searching...</td></tr>';

        try {
            var data = await PartsAPI.search(search, cat, null, 100);
            ADMIN_PARTS = data.parts;
            renderAdminPartsTable(data.parts);
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="6" style="padding: 24px; text-align: center; color: #dc3545;">Search failed: ' + err.message + '</td></tr>';
        }
    }, 300);
}

function showPartImage(imageUrl, partNumber, productName, price, vendor) {
    var overlay = document.createElement('div');
    overlay.id = 'imageOverlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 9999; cursor: pointer; padding: 20px;';
    overlay.onclick = function() { overlay.remove(); };

    var priceDisplay = price ? '$' + parseFloat(price).toFixed(2) : '';
    var hasImage = imageUrl && imageUrl !== 'undefined' && imageUrl !== 'null';

    overlay.innerHTML = '<div style="text-align: center; max-width: 90vw;">' +
        (hasImage ? '<img src="' + imageUrl + '" style="max-width: 100%; max-height: 60vh; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); margin-bottom: 20px;">' : '<div style="font-size: 80px; margin-bottom: 20px;">📦</div>') +
        '<div style="background: rgba(255,255,255,0.1); padding: 16px 24px; border-radius: 8px; display: inline-block;">' +
            '<p style="color: #4f9; font-family: monospace; font-size: 18px; font-weight: 600; margin-bottom: 8px;">' + (partNumber || '—') + '</p>' +
            '<p style="color: white; font-size: 16px; margin-bottom: 8px;">' + (productName || '') + '</p>' +
            (priceDisplay ? '<p style="color: #4f9; font-size: 24px; font-weight: 700;">' + priceDisplay + '</p>' : '') +
            (vendor ? '<p style="color: #999; font-size: 12px; margin-top: 8px;">' + vendor + '</p>' : '') +
        '</div>' +
        '<p style="color: #666; margin-top: 16px; font-size: 12px;">Tap anywhere to close</p>' +
    '</div>';
    document.body.appendChild(overlay);
}

function renderAdminPartsTable(parts) {
    var tbody = document.getElementById('dmPartsTableBody');
    var html = '';
    parts.slice(0, 100).forEach(function(p) {
        var imgHtml = p.imageUrl ? '<img src="' + p.imageUrl + '" onclick="event.stopPropagation(); showPartImage(\'' + p.imageUrl + '\', \'' + (p.partNumber || '').replace(/'/g, "\\'") + '\')" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px; margin-right: 8px; vertical-align: middle; cursor: pointer;" title="Click to enlarge">' : '';
        html += '<tr style="border-bottom: 1px solid #f0f2f5;">' +
            '<td style="padding: 10px 12px; font-family: monospace; font-size: 12px;">' + (p.partNumber || '—') + '</td>' +
            '<td style="padding: 10px 12px; font-weight: 500;">' + imgHtml + (p.productName || '') + '</td>' +
            '<td style="padding: 10px 12px; color: #6c757d;">' + (p.category || '—') + '</td>' +
            '<td style="padding: 10px 12px; color: #6c757d;">' + (p.vendor || '') + '</td>' +
            '<td style="padding: 10px 12px; text-align: right; font-weight: 600;">$' + (parseFloat(p.price) || 0).toFixed(2) + '</td>' +
            '<td style="padding: 10px 12px; text-align: center;">' +
                '<button class="btn btn-sm" onclick="editPart(\'' + p.id + '\')" style="padding: 4px 10px; font-size: 12px; margin-right: 4px;">Edit</button>' +
                '<button class="btn btn-sm" onclick="deletePart(\'' + p.id + '\')" style="padding: 4px 10px; font-size: 12px; color: #dc3545;">Delete</button>' +
            '</td></tr>';
    });
    tbody.innerHTML = html || '<tr><td colspan="6" style="padding: 24px; text-align: center; color: #6c757d;">No parts found</td></tr>';
    document.getElementById('dmPartsCount').textContent = 'Showing ' + Math.min(parts.length, 100) + ' of ' + parts.length + ' parts';
}

function showAddPartModal() {
    editingPartId = null;
    partImageData = null;
    document.getElementById('partModalTitle').textContent = 'Add Part';
    document.getElementById('partNumInput').value = '';
    document.getElementById('partNameInput').value = '';
    document.getElementById('partCategoryInput').value = '';
    document.getElementById('partVendorInput').value = 'Hussey';
    document.getElementById('partPriceInput').value = '';
    var preview = document.getElementById('partImagePreview');
    if (preview) preview.innerHTML = '';
    var imgInput = document.getElementById('partImageInput');
    if (imgInput) imgInput.value = '';
    var modal = document.getElementById('partModal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function editPart(id) {
    var part = ADMIN_PARTS.find(function(p) { return p.id == id; });
    if (!part) return;
    editingPartId = id;
    partImageData = null;
    document.getElementById('partModalTitle').textContent = 'Edit Part';
    document.getElementById('partNumInput').value = part.partNumber || '';
    document.getElementById('partNameInput').value = part.productName || '';
    document.getElementById('partCategoryInput').value = part.category || '';
    document.getElementById('partVendorInput').value = part.vendor || 'Hussey';
    document.getElementById('partPriceInput').value = part.price || '';
    var preview = document.getElementById('partImagePreview');
    if (preview) {
        preview.innerHTML = part.imageUrl ? '<img src="' + part.imageUrl + '" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">' : '';
    }
    var imgInput = document.getElementById('partImageInput');
    if (imgInput) imgInput.value = '';
    var modal = document.getElementById('partModal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function handlePartImageUpload(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            partImageData = e.target.result;
            var preview = document.getElementById('partImagePreview');
            if (preview) {
                preview.innerHTML = '<img src="' + e.target.result + '" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">';
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function savePart() {
    var name = document.getElementById('partNameInput').value.trim();
    if (!name) { alert('Part name is required.'); return; }

    var partData = {
        partNumber: document.getElementById('partNumInput').value.trim(),
        productName: name,
        category: document.getElementById('partCategoryInput').value,
        vendor: document.getElementById('partVendorInput').value,
        price: parseFloat(document.getElementById('partPriceInput').value) || null
    };

    try {
        var result;
        if (editingPartId) {
            result = await PartsAPI.updatePart(editingPartId, partData);
        } else {
            result = await PartsAPI.addPart(partData);
        }

        // Upload image if provided
        if (partImageData) {
            var partId = editingPartId || result.part?.id;
            if (partId) {
                await PartsAPI.uploadImage(partId, partData.partNumber, partImageData);
            }
        }

        partImageData = null;
        closePartModal();
        loadAdminParts();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

async function deletePart(id) {
    if (!confirm('Delete this part?')) return;
    try {
        await PartsAPI.deletePart(id);
        loadAdminParts();
    } catch (err) {
        alert('Error deleting part: ' + err.message);
    }
}

function closePartModal() {
    var modal = document.getElementById('partModal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

// CSV Import
function handleCsvDrop(event) {
    var file = event.dataTransfer.files[0];
    if (file) handleCsvFile(file);
}

function handleCsvFile(file) {
    if (!file || !file.name.endsWith('.csv')) { alert('Please select a CSV file.'); return; }
    var vendor = document.getElementById('importVendor').value;
    if (!vendor) { alert('Please select a vendor first.'); return; }
    var reader = new FileReader();
    reader.onload = function(e) {
        var text = e.target.result;
        var lines = text.split('\n');
        if (lines.length < 2) { alert('CSV file appears empty.'); return; }
        var headers = lines[0].split(',').map(function(h) { return h.trim().toLowerCase().replace(/"/g, ''); });
        var partNumCol = headers.findIndex(function(h) { return h.indexOf('part') !== -1 && h.indexOf('num') !== -1 || h === 'sku' || h === 'item' || h === 'part #' || h === 'part number'; });
        var priceCol = headers.findIndex(function(h) { return h.indexOf('price') !== -1 || h.indexOf('cost') !== -1; });
        var nameCol = headers.findIndex(function(h) { return h.indexOf('name') !== -1 || h.indexOf('description') !== -1 || h.indexOf('desc') !== -1 || h.indexOf('product') !== -1; });
        if (partNumCol === -1 || priceCol === -1) { alert('CSV must have Part Number and Price columns. Found headers: ' + headers.join(', ')); return; }

        csvImportData = [];
        for (var i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            var cols = lines[i].split(',').map(function(c) { return c.trim().replace(/"/g, ''); });
            var partNum = cols[partNumCol] || '';
            var newPrice = parseFloat(cols[priceCol]) || 0;
            var name = nameCol !== -1 ? (cols[nameCol] || '') : '';
            if (!partNum || !newPrice) continue;
            var existing = ADMIN_PARTS.find(function(p) { return p.partNum === partNum; });
            csvImportData.push({
                partNum: partNum,
                name: name || (existing ? existing.name : ''),
                currentPrice: existing ? existing.price : null,
                newPrice: newPrice,
                isNew: !existing,
                vendor: vendor
            });
        }

        // Show preview
        var tbody = document.getElementById('csvPreviewBody');
        var html = '';
        csvImportData.forEach(function(row) {
            var changeHtml = '';
            if (row.isNew) {
                changeHtml = '<span style="color: #28a745; font-weight: 600;">NEW</span>';
            } else {
                var diff = row.newPrice - row.currentPrice;
                if (Math.abs(diff) < 0.01) {
                    changeHtml = '<span style="color: #6c757d;">No change</span>';
                } else {
                    var pct = ((diff / row.currentPrice) * 100).toFixed(1);
                    var color = diff > 0 ? '#dc3545' : '#28a745';
                    changeHtml = '<span style="color:' + color + '; font-weight: 600;">' + (diff > 0 ? '+' : '') + '$' + diff.toFixed(2) + ' (' + (diff > 0 ? '+' : '') + pct + '%)</span>';
                }
            }
            html += '<tr style="border-bottom: 1px solid #f0f2f5;">' +
                '<td style="padding: 8px 12px; font-family: monospace; font-size: 12px;">' + row.partNum + '</td>' +
                '<td style="padding: 8px 12px;">' + row.name + '</td>' +
                '<td style="padding: 8px 12px; text-align: right;">' + (row.currentPrice !== null ? '$' + row.currentPrice.toFixed(2) : '—') + '</td>' +
                '<td style="padding: 8px 12px; text-align: right; font-weight: 600;">$' + row.newPrice.toFixed(2) + '</td>' +
                '<td style="padding: 8px 12px; text-align: right;">' + changeHtml + '</td>' +
            '</tr>';
        });
        tbody.innerHTML = html;
        var newCount = csvImportData.filter(function(r) { return r.isNew; }).length;
        var updateCount = csvImportData.filter(function(r) { return !r.isNew; }).length;
        document.getElementById('csvPreviewCount').textContent = updateCount + ' updates, ' + newCount + ' new parts';
        document.getElementById('csvPreview').classList.remove('hidden');
    };
    reader.readAsText(file);
}

async function applyCsvImport() {
    var vendor = document.getElementById('importVendor').value;

    try {
        // Transform data for API
        var parts = csvImportData.map(function(row) {
            return {
                partNumber: row.partNum,
                productName: row.name || 'Unknown Part',
                price: row.newPrice
            };
        });

        var result = await PartsAPI.importParts(parts, vendor);

        // Add to import history
        var historyBody = document.getElementById('importHistoryBody');
        var today = new Date();
        var dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        var fileName = document.getElementById('csvFileInput').files[0] ? document.getElementById('csvFileInput').files[0].name : 'manual-import.csv';
        historyBody.innerHTML = '<tr style="border-bottom: 1px solid #f0f2f5;">' +
            '<td style="padding: 10px 12px;">' + dateStr + '</td>' +
            '<td style="padding: 10px 12px;">' + vendor + '</td>' +
            '<td style="padding: 10px 12px;">' + fileName + '</td>' +
            '<td style="padding: 10px 12px; text-align: right;">' + (result.inserted + result.updated).toLocaleString() + '</td>' +
            '<td style="padding: 10px 12px;">Admin</td>' +
        '</tr>' + historyBody.innerHTML;

        alert('Import complete: ' + result.inserted + ' parts added, ' + result.updated + ' parts updated.');
        cancelCsvImport();
        loadAdminParts();

    } catch (err) {
        alert('Import failed: ' + err.message);
    }
}

function cancelCsvImport() {
    document.getElementById('csvPreview').classList.add('hidden');
    document.getElementById('csvFileInput').value = '';
    csvImportData = [];
}

// Bulk Image Upload
var bulkImages = [];

function handleBulkImageSelect(input) {
    bulkImages = [];
    var files = Array.from(input.files);

    document.getElementById('bulkImageCount').textContent = files.length + ' images selected';
    document.getElementById('bulkImagePreview').classList.remove('hidden');
    document.getElementById('bulkImageResults').classList.add('hidden');

    var processed = 0;
    files.forEach(function(file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var partNumber = file.name.replace(/\.[^.]+$/, '');
            bulkImages.push({
                filename: file.name,
                imageData: e.target.result
            });
            processed++;
            if (processed === files.length) {
                renderBulkImageList();
            }
        };
        reader.readAsDataURL(file);
    });
}

function renderBulkImageList() {
    var list = document.getElementById('bulkImageList');
    list.innerHTML = bulkImages.map(function(img) {
        var partNumber = img.filename.replace(/\.[^.]+$/, '');
        return '<div style="display: flex; align-items: center; gap: 12px; padding: 8px; border-bottom: 1px solid #eee;">' +
            '<img src="' + img.imageData + '" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">' +
            '<span style="font-family: monospace;">' + partNumber + '</span>' +
            '<span style="color: #6c757d; font-size: 12px;">' + img.filename + '</span>' +
        '</div>';
    }).join('');
}

async function uploadBulkImages() {
    var resultsDiv = document.getElementById('bulkImageResults');
    resultsDiv.innerHTML = '<div style="padding: 20px; text-align: center;">Uploading images...</div>';
    resultsDiv.classList.remove('hidden');

    try {
        var result = await PartsAPI.uploadImagesBulk(bulkImages);

        var html = '<div class="card" style="background: #e8f5e9; border-color: #4caf50;">' +
            '<div class="card-body">' +
                '<p style="font-weight: 600; color: #2e7d32;">Upload Complete</p>' +
                '<p>Matched: ' + result.matched + ' | Uploaded: ' + result.uploaded + '</p>';

        if (result.notFound && result.notFound.length > 0) {
            html += '<p style="color: #f57c00; margin-top: 8px;">Not found in catalog: ' + result.notFound.slice(0, 10).join(', ') + (result.notFound.length > 10 ? ' and ' + (result.notFound.length - 10) + ' more...' : '') + '</p>';
        }

        html += '</div></div>';
        resultsDiv.innerHTML = html;

        bulkImages = [];
        document.getElementById('bulkImagePreview').classList.add('hidden');
        document.getElementById('bulkImageInput').value = '';

        // Reload parts to show new images
        loadAdminParts();

    } catch (err) {
        resultsDiv.innerHTML = '<div class="card" style="background: #ffebee;">' +
            '<div class="card-body"><p style="color: #c62828;">Upload failed: ' + err.message + '</p></div>' +
        '</div>';
    }
}

// Vendors
function loadVendors() {
    var list = document.getElementById('vendorsList');
    var tierLabels = { '1': 'Tier 1 — Primary Partner', '2': 'Tier 2 — Secondary', '3': 'Tier 3 — Occasional/Specialty' };
    var tierColors = { '1': '#28a745', '2': '#0066cc', '3': '#6c757d' };
    var html = '';
    ['1', '2', '3'].forEach(function(tier) {
        var tierVendors = VENDORS.filter(function(v) { return v.tier === tier; });
        if (tierVendors.length === 0) return;
        html += '<h3 style="font-size: 14px; font-weight: 700; color: ' + tierColors[tier] + '; margin-bottom: 12px; margin-top: ' + (tier === '1' ? '0' : '24px') + ';">' + tierLabels[tier] + '</h3>';
        tierVendors.forEach(function(v) {
            var partCount = ADMIN_PARTS.filter(function(p) { return p.vendor === v.name.split(' ')[0]; }).length;
            html += '<div class="card" style="margin-bottom: 12px;">' +
                '<div class="card-body" style="display: flex; justify-content: space-between; align-items: center;">' +
                    '<div>' +
                        '<h4 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">' + v.name + '</h4>' +
                        '<div style="font-size: 13px; color: #6c757d;">' +
                            (v.contact ? v.contact + ' • ' : '') +
                            (v.phone ? v.phone + ' • ' : '') +
                            (v.email ? v.email : '') +
                        '</div>' +
                        (v.notes ? '<div style="font-size: 12px; color: #495057; margin-top: 4px;">' + v.notes + '</div>' : '') +
                        '<div style="font-size: 12px; color: #6c757d; margin-top: 4px;">' + partCount + ' parts in catalog</div>' +
                    '</div>' +
                    '<div>' +
                        '<button class="btn btn-sm" onclick="editVendor(\'' + v.id + '\')" style="padding: 6px 14px; font-size: 12px; margin-right: 4px;">Edit</button>' +
                        '<button class="btn btn-sm" onclick="deleteVendor(\'' + v.id + '\')" style="padding: 6px 14px; font-size: 12px; color: #dc3545;">Delete</button>' +
                    '</div>' +
                '</div></div>';
        });
    });
    list.innerHTML = html;
}

function showAddVendorModal() {
    editingVendorId = null;
    document.getElementById('vendorModalTitle').textContent = 'Add Vendor';
    document.getElementById('vendorNameInput').value = '';
    document.getElementById('vendorContactInput').value = '';
    document.getElementById('vendorPhoneInput').value = '';
    document.getElementById('vendorEmailInput').value = '';
    document.getElementById('vendorTierInput').value = '2';
    document.getElementById('vendorNotesInput').value = '';
    var modal = document.getElementById('vendorModal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function editVendor(id) {
    var v = VENDORS.find(function(x) { return x.id === id; });
    if (!v) return;
    editingVendorId = id;
    document.getElementById('vendorModalTitle').textContent = 'Edit Vendor';
    document.getElementById('vendorNameInput').value = v.name;
    document.getElementById('vendorContactInput').value = v.contact || '';
    document.getElementById('vendorPhoneInput').value = v.phone || '';
    document.getElementById('vendorEmailInput').value = v.email || '';
    document.getElementById('vendorTierInput').value = v.tier || '2';
    document.getElementById('vendorNotesInput').value = v.notes || '';
    var modal = document.getElementById('vendorModal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function saveVendor() {
    var name = document.getElementById('vendorNameInput').value.trim();
    if (!name) { alert('Vendor name is required.'); return; }
    var data = {
        name: name,
        contact: document.getElementById('vendorContactInput').value.trim(),
        phone: document.getElementById('vendorPhoneInput').value.trim(),
        email: document.getElementById('vendorEmailInput').value.trim(),
        tier: document.getElementById('vendorTierInput').value,
        notes: document.getElementById('vendorNotesInput').value.trim()
    };
    if (editingVendorId) {
        var idx = VENDORS.findIndex(function(x) { return x.id === editingVendorId; });
        if (idx !== -1) { data.id = editingVendorId; VENDORS[idx] = data; }
    } else {
        data.id = 'v' + Date.now();
        VENDORS.push(data);
    }
    saveVendors();
    closeVendorModal();
    loadVendors();
}

function deleteVendor(id) {
    if (!confirm('Delete this vendor?')) return;
    VENDORS = VENDORS.filter(function(x) { return x.id !== id; });
    saveVendors();
    loadVendors();
}

function closeVendorModal() {
    var modal = document.getElementById('vendorModal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

// ==========================================
// BULLETIN MANAGEMENT
// Add, edit, delete company bulletins
// ==========================================

var editingBulletinId = null;

function loadBulletinsManage() {
    var container = document.getElementById('bulletinsList');
    if (!container) return;

    if (COMPANY_BULLETINS.length === 0) {
        container.innerHTML = '<div class="card"><div class="card-body" style="padding: 40px; text-align: center;"><div style="font-size: 48px; margin-bottom: 12px;">📢</div><p style="color: #6c757d;">No bulletins yet. Add one to display on the Home page.</p></div></div>';
        return;
    }

    var html = '<div class="card"><div class="card-body" style="padding: 0;">';

    COMPANY_BULLETINS.forEach(function(bulletin) {
        var typeInfo = BULLETIN_TYPES[bulletin.type] || BULLETIN_TYPES.info;
        var statusBadge = bulletin.active
            ? '<span style="background: #d4edda; color: #155724; padding: 3px 8px; border-radius: 8px; font-size: 11px; font-weight: 600;">Active</span>'
            : '<span style="background: #f8f9fa; color: #6c757d; padding: 3px 8px; border-radius: 8px; font-size: 11px; font-weight: 600;">Inactive</span>';

        html += '<div style="display: flex; align-items: flex-start; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f0f2f5;">';
        html += '<div style="font-size: 24px; flex-shrink: 0;">' + typeInfo.icon + '</div>';
        html += '<div style="flex: 1; min-width: 0;">';
        html += '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">';
        html += '<span style="font-weight: 600; font-size: 15px;">' + bulletin.title + '</span>';
        html += statusBadge;
        html += '<span style="background: ' + typeInfo.bg + '; color: ' + typeInfo.color + '; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 500; text-transform: capitalize;">' + bulletin.type + '</span>';
        html += '</div>';
        html += '<div style="color: #4a5568; font-size: 13px; line-height: 1.4;">' + bulletin.message + '</div>';
        html += '</div>';
        html += '<div style="display: flex; gap: 8px; flex-shrink: 0;">';
        html += '<button class="btn btn-sm" onclick="toggleBulletinActive(\'' + bulletin.id + '\')" style="padding: 6px 12px; font-size: 12px;">' + (bulletin.active ? 'Deactivate' : 'Activate') + '</button>';
        html += '<button class="btn btn-sm" onclick="editBulletin(\'' + bulletin.id + '\')" style="padding: 6px 12px; font-size: 12px;">Edit</button>';
        html += '<button class="btn btn-sm" onclick="deleteBulletin(\'' + bulletin.id + '\')" style="padding: 6px 12px; font-size: 12px; color: #dc3545;">Delete</button>';
        html += '</div>';
        html += '</div>';
    });

    html += '</div></div>';
    container.innerHTML = html;
}

function showAddBulletinModal() {
    editingBulletinId = null;
    document.getElementById('bulletinModalTitle').textContent = 'Add Bulletin';
    document.getElementById('bulletinTypeInput').value = 'info';
    document.getElementById('bulletinTitleInput').value = '';
    document.getElementById('bulletinMessageInput').value = '';
    document.getElementById('bulletinActiveInput').checked = true;
    var modal = document.getElementById('bulletinModal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function editBulletin(id) {
    var bulletin = COMPANY_BULLETINS.find(function(b) { return b.id === id; });
    if (!bulletin) return;
    editingBulletinId = id;
    document.getElementById('bulletinModalTitle').textContent = 'Edit Bulletin';
    document.getElementById('bulletinTypeInput').value = bulletin.type;
    document.getElementById('bulletinTitleInput').value = bulletin.title;
    document.getElementById('bulletinMessageInput').value = bulletin.message;
    document.getElementById('bulletinActiveInput').checked = bulletin.active;
    var modal = document.getElementById('bulletinModal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function saveBulletin() {
    var title = document.getElementById('bulletinTitleInput').value.trim();
    var message = document.getElementById('bulletinMessageInput').value.trim();
    if (!title || !message) { alert('Title and message are required.'); return; }

    var data = {
        type: document.getElementById('bulletinTypeInput').value,
        title: title,
        message: message,
        active: document.getElementById('bulletinActiveInput').checked,
        createdAt: new Date().toISOString().split('T')[0]
    };

    if (editingBulletinId) {
        var idx = COMPANY_BULLETINS.findIndex(function(b) { return b.id === editingBulletinId; });
        if (idx !== -1) {
            data.id = editingBulletinId;
            data.createdAt = COMPANY_BULLETINS[idx].createdAt; // Keep original date
            COMPANY_BULLETINS[idx] = data;
        }
    } else {
        data.id = 'b' + Date.now();
        COMPANY_BULLETINS.unshift(data); // Add to beginning
    }

    saveBulletins();
    closeBulletinModal();
    loadBulletinsManage();
}

function toggleBulletinActive(id) {
    var bulletin = COMPANY_BULLETINS.find(function(b) { return b.id === id; });
    if (bulletin) {
        bulletin.active = !bulletin.active;
        saveBulletins();
        loadBulletinsManage();
    }
}

function deleteBulletin(id) {
    if (!confirm('Delete this bulletin?')) return;
    COMPANY_BULLETINS = COMPANY_BULLETINS.filter(function(b) { return b.id !== id; });
    saveBulletins();
    loadBulletinsManage();
}

function closeBulletinModal() {
    var modal = document.getElementById('bulletinModal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

// Resize listener and init() are in js/app.js
