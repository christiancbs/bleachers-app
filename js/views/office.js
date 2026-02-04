// ==========================================
// OFFICE WORK ORDERS
// Work order detail, editing, completion
// ==========================================

function viewWorkOrderDetail(workOrderId) {
    // Populate the customer/location dropdown
    populateOfficeWorkOrderCustomerDropdown();

    // Reset all edit sections to display mode
    resetAllEditSections();

    // Load work order data
    const wo = OFFICE_WORK_ORDERS[workOrderId];
    if (wo) {
        currentWorkOrder = { ...wo, id: workOrderId };

        // Header
        document.getElementById('woJobNumber').textContent = 'Job #' + wo.jobNumber;

        // Job type badge
        const jobTypeBadge = document.getElementById('woJobTypeBadge');
        jobTypeBadge.textContent = wo.jobType;
        jobTypeBadge.className = 'badge badge-info';

        // Status badge
        const statusBadge = document.getElementById('woStatusBadge');
        statusBadge.textContent = wo.status;
        const statusClass = wo.status === 'Completed' ? 'badge-success' :
                           wo.status === 'Pink' ? 'badge-danger' :
                           wo.status === 'Parts Received' ? 'badge-success' :
                           wo.status === 'Scheduled' ? 'badge-warning' : 'badge-info';
        statusBadge.className = `badge ${statusClass}`;

        // Location section (display)
        document.getElementById('woLocationName').textContent = wo.locationName;
        document.getElementById('woLocationAddress').textContent = wo.address;
        const encodedAddress = encodeURIComponent(wo.address);
        document.getElementById('woDirectionsLink').href = `https://maps.google.com/?q=${encodedAddress}`;

        // Location section (edit inputs)
        document.getElementById('woCustomerLocation').value = `${wo.customerId}|${wo.locationId}`;
        document.getElementById('woLocationAddressInput').value = wo.address;

        // Contact section (display)
        document.getElementById('woContactName').textContent = wo.contactName;
        document.getElementById('woContactPhone').textContent = wo.contactPhone;
        document.getElementById('woContactPhoneLink').href = `tel:${wo.contactPhone.replace(/\D/g, '')}`;

        // Contact section (edit inputs)
        document.getElementById('woContactNameInput').value = wo.contactName;
        document.getElementById('woContactPhoneInput').value = wo.contactPhone;

        // Description section
        document.getElementById('woDescription').textContent = wo.description;
        document.getElementById('woDescriptionInput').value = wo.description;

        // Parts location section
        document.getElementById('woPartsLocation').textContent = wo.partsLocation;
        document.getElementById('woPartsLocationInput').value = wo.partsLocation;

        // Special instructions section
        const instructions = wo.specialInstructions || 'None';
        document.getElementById('woSpecialInstructions').textContent = instructions;
        document.getElementById('woSpecialInstructionsInput').value = wo.specialInstructions || '';

        // Scheduling section (display)
        const schedDate = new Date(wo.scheduledDate + 'T00:00:00');
        document.getElementById('woScheduledDateDisplay').textContent = schedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const [hours, minutes] = wo.scheduledTime.split(':');
        const timeDate = new Date();
        timeDate.setHours(parseInt(hours), parseInt(minutes));
        document.getElementById('woScheduledTimeDisplay').textContent = timeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        document.getElementById('woAssignedToDisplay').textContent = wo.assignedTo || '—';
        document.getElementById('woConfirmedWithDisplay').textContent = wo.confirmedWith || '—';
        document.getElementById('woConfirmedByDisplay').textContent = wo.confirmedBy || '—';
        if (wo.confirmedDate) {
            const confDate = new Date(wo.confirmedDate + 'T00:00:00');
            document.getElementById('woConfirmedDateDisplay').textContent = confDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } else {
            document.getElementById('woConfirmedDateDisplay').textContent = '—';
        }

        // Scheduling section (edit inputs)
        document.getElementById('woScheduledDate').value = wo.scheduledDate;
        document.getElementById('woScheduledTime').value = wo.scheduledTime;
        document.getElementById('woAssignedTo').value = wo.assignedTo;
        document.getElementById('woConfirmedWith').value = wo.confirmedWith || '';
        document.getElementById('woConfirmedBy').value = wo.confirmedBy || '';
        document.getElementById('woConfirmedDate').value = wo.confirmedDate || '';

        // Completion section (display) - typically empty until job is done
        document.getElementById('woCompletedDisplay').textContent = wo.completed ? (wo.completed === 'yes' ? 'Completed' : 'Not Completed (Pink)') : '—';
        document.getElementById('woHoursWorkedDisplay').textContent = wo.hoursWorked || '—';
        document.getElementById('woCompletedByDisplay').textContent = wo.completedBy || '—';

        // Completion notes (new field in updated UI)
        if (document.getElementById('woCompletionNotes')) {
            document.getElementById('woCompletionNotes').value = wo.techNotes || '';
        }

        // Reset the completion form
        resetOfficeCompletionForm();
    }

    showView('workOrderDetail');
}

function resetAllEditSections() {
    const sections = ['location', 'contact', 'description', 'parts', 'instructions', 'scheduling', 'completionSummary'];
    sections.forEach(section => {
        const displayEl = document.getElementById(`wo${capitalizeFirst(section)}Display`);
        const editEl = document.getElementById(`wo${capitalizeFirst(section)}Edit`);
        const btnEl = document.getElementById(`wo${capitalizeFirst(section)}EditBtn`);
        if (displayEl) displayEl.classList.remove('hidden');
        if (editEl) editEl.classList.add('hidden');
        if (btnEl) btnEl.textContent = 'Edit';
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function toggleEditSection(section) {
    const displayEl = document.getElementById(`wo${capitalizeFirst(section)}Display`);
    const editEl = document.getElementById(`wo${capitalizeFirst(section)}Edit`);
    const btnEl = document.getElementById(`wo${capitalizeFirst(section)}EditBtn`);

    if (editEl.classList.contains('hidden')) {
        // Show edit mode
        displayEl.classList.add('hidden');
        editEl.classList.remove('hidden');
        btnEl.textContent = 'Cancel';
    } else {
        // Hide edit mode
        displayEl.classList.remove('hidden');
        editEl.classList.add('hidden');
        btnEl.textContent = 'Edit';
    }
}

function saveSection(section) {
    // Save the section data
    switch(section) {
        case 'location':
            const dropdown = document.getElementById('woCustomerLocation');
            const selectedOption = dropdown.options[dropdown.selectedIndex];
            if (selectedOption && selectedOption.textContent) {
                document.getElementById('woLocationName').textContent = selectedOption.textContent;
            }
            const newAddress = document.getElementById('woLocationAddressInput').value;
            document.getElementById('woLocationAddress').textContent = newAddress;
            document.getElementById('woDirectionsLink').href = `https://maps.google.com/?q=${encodeURIComponent(newAddress)}`;
            break;
        case 'contact':
            document.getElementById('woContactName').textContent = document.getElementById('woContactNameInput').value;
            const phone = document.getElementById('woContactPhoneInput').value;
            document.getElementById('woContactPhone').textContent = phone;
            document.getElementById('woContactPhoneLink').href = `tel:${phone.replace(/\D/g, '')}`;
            break;
        case 'description':
            document.getElementById('woDescription').textContent = document.getElementById('woDescriptionInput').value;
            break;
        case 'parts':
            document.getElementById('woPartsLocation').textContent = document.getElementById('woPartsLocationInput').value;
            break;
        case 'instructions':
            document.getElementById('woSpecialInstructions').textContent = document.getElementById('woSpecialInstructionsInput').value || 'None';
            break;
        case 'scheduling':
            const schedDate = new Date(document.getElementById('woScheduledDate').value + 'T00:00:00');
            document.getElementById('woScheduledDateDisplay').textContent = schedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeVal = document.getElementById('woScheduledTime').value;
            const [h, m] = timeVal.split(':');
            const td = new Date();
            td.setHours(parseInt(h), parseInt(m));
            document.getElementById('woScheduledTimeDisplay').textContent = td.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            document.getElementById('woAssignedToDisplay').textContent = document.getElementById('woAssignedTo').value || '—';
            document.getElementById('woConfirmedWithDisplay').textContent = document.getElementById('woConfirmedWith').value || '—';
            document.getElementById('woConfirmedByDisplay').textContent = document.getElementById('woConfirmedBy').value || '—';
            const confDateVal = document.getElementById('woConfirmedDate').value;
            if (confDateVal) {
                const cd = new Date(confDateVal + 'T00:00:00');
                document.getElementById('woConfirmedDateDisplay').textContent = cd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
            break;
        case 'completionSummary':
            const completed = document.getElementById('woCompleted').value;
            document.getElementById('woCompletedDisplay').textContent = completed ? (completed === 'yes' ? 'Completed' : 'Not Completed (Pink)') : '—';
            document.getElementById('woHoursWorkedDisplay').textContent = document.getElementById('woHoursWorked').value || '—';
            document.getElementById('woCompletedByDisplay').textContent = document.getElementById('woCompletedBy').value || '—';
            break;
    }

    // Hide edit mode, show display
    toggleEditSection(section);

    // Show save confirmation
    console.log(`Saved ${section} section`);
}

function cancelEditSection(section) {
    // Just toggle back to display mode (changes discarded)
    toggleEditSection(section);
}

// Office Work Order Photo/Completion Variables
let woMainPhoto = null;
let woAdditionalPhotos = [];
let woWrongPartPhoto = null;
let woWrongPartSentPhoto = null;
let woMoreWorkPhoto = null;

const WO_REASON_LABELS = {
    'wrong_part': '🔧 Wrong or Missing Part',
    'access': '🚪 Can\'t Access Site',
    'more_work': '⚠️ Additional Work Needed',
    'equipment': '🏗️ Equipment Issue',
    'other': '📝 Other'
};

function handleOfficePhotoUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        if (type === 'main') {
            woMainPhoto = e.target.result;
            document.getElementById('woPhotoPreview').innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <img src="${e.target.result}" style="max-width: 200px; border-radius: 8px; border: 2px solid #4CAF50;">
                    <button onclick="removeOfficePhoto('main')" style="position: absolute; top: -8px; right: -8px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-weight: bold;">×</button>
                </div>
            `;
            document.getElementById('woPhotoPreview').classList.remove('hidden');
            document.getElementById('woPhotoUploadArea').style.display = 'none';
        } else if (type === 'additional') {
            const files = event.target.files;
            for (let i = 0; i < files.length; i++) {
                const reader2 = new FileReader();
                reader2.onload = function(e2) {
                    woAdditionalPhotos.push(e2.target.result);
                    const container = document.getElementById('woAdditionalPhotosPreview');
                    const imgWrapper = document.createElement('div');
                    imgWrapper.style.cssText = 'position: relative; display: inline-block;';
                    const idx = woAdditionalPhotos.length - 1;
                    imgWrapper.innerHTML = `
                        <img src="${e2.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                        <button onclick="removeOfficeAdditionalPhoto(${idx}, this)" style="position: absolute; top: -6px; right: -6px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px; font-weight: bold;">×</button>
                    `;
                    container.appendChild(imgWrapper);
                };
                reader2.readAsDataURL(files[i]);
            }
        }
    };
    reader.readAsDataURL(file);
}

function removeOfficePhoto(type) {
    if (type === 'main') {
        woMainPhoto = null;
        document.getElementById('woPhotoPreview').innerHTML = '';
        document.getElementById('woPhotoPreview').classList.add('hidden');
        document.getElementById('woPhotoUploadArea').style.display = 'block';
        document.getElementById('woPhotoInput').value = '';
    }
}

function removeOfficeAdditionalPhoto(index, btn) {
    woAdditionalPhotos.splice(index, 1);
    btn.parentElement.remove();
}

function handleOfficeWrongPartPhoto(event, photoType) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        if (photoType === 'correct') {
            woWrongPartPhoto = e.target.result;
            document.getElementById('woWrongPartPhotoPreview').innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <img src="${e.target.result}" style="max-width: 150px; border-radius: 8px; border: 2px solid #ff9800;">
                    <button onclick="removeOfficeWrongPartPhoto('correct')" style="position: absolute; top: -8px; right: -8px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-weight: bold;">×</button>
                </div>
            `;
            document.getElementById('woWrongPartPhotoPreview').classList.remove('hidden');
            document.getElementById('woWrongPartPhotoArea').style.display = 'none';
        } else if (photoType === 'wrong') {
            woWrongPartSentPhoto = e.target.result;
            document.getElementById('woWrongPartSentPhotoPreview').innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <img src="${e.target.result}" style="max-width: 100px; border-radius: 8px;">
                    <button onclick="removeOfficeWrongPartPhoto('wrong')" style="position: absolute; top: -6px; right: -6px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px; font-weight: bold;">×</button>
                </div>
            `;
        }
    };
    reader.readAsDataURL(file);
}

function removeOfficeWrongPartPhoto(photoType) {
    if (photoType === 'correct') {
        woWrongPartPhoto = null;
        document.getElementById('woWrongPartPhotoPreview').innerHTML = '';
        document.getElementById('woWrongPartPhotoPreview').classList.add('hidden');
        document.getElementById('woWrongPartPhotoArea').style.display = 'block';
        document.getElementById('woWrongPartPhotoInput').value = '';
    } else if (photoType === 'wrong') {
        woWrongPartSentPhoto = null;
        document.getElementById('woWrongPartSentPhotoPreview').innerHTML = '';
        document.getElementById('woWrongPartSentPhotoInput').value = '';
    }
}

function handleOfficeMoreWorkPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        woMoreWorkPhoto = e.target.result;
        document.getElementById('woMoreWorkPhotoPreview').innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${e.target.result}" style="max-width: 150px; border-radius: 8px; border: 2px solid #2196f3;">
                <button onclick="removeOfficeMoreWorkPhoto()" style="position: absolute; top: -8px; right: -8px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-weight: bold;">×</button>
            </div>
        `;
        document.getElementById('woMoreWorkPhotoPreview').classList.remove('hidden');
        document.getElementById('woMoreWorkPhotoArea').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeOfficeMoreWorkPhoto() {
    woMoreWorkPhoto = null;
    document.getElementById('woMoreWorkPhotoPreview').innerHTML = '';
    document.getElementById('woMoreWorkPhotoPreview').classList.add('hidden');
    document.getElementById('woMoreWorkPhotoArea').style.display = 'block';
    document.getElementById('woMoreWorkPhotoInput').value = '';
}

function selectOfficeNotCompletedReason(reason) {
    document.getElementById('woNotCompletedReason').value = reason;

    // Update button styles
    document.querySelectorAll('#woReasonButtons .reason-btn').forEach(btn => {
        btn.style.borderColor = '#dee2e6';
        btn.style.background = 'white';
    });
    event.target.closest('.reason-btn').style.borderColor = '#c62828';
    event.target.closest('.reason-btn').style.background = '#ffebee';

    // Show the selected reason text
    document.getElementById('woSelectedReasonText').textContent = WO_REASON_LABELS[reason];

    // Show/hide reason-specific sections
    document.getElementById('woWrongPartSection').classList.add('hidden');
    document.getElementById('woMoreWorkSection').classList.add('hidden');

    if (reason === 'wrong_part') {
        document.getElementById('woWrongPartSection').classList.remove('hidden');
        document.getElementById('woNotesRequired').style.display = 'none';
    } else if (reason === 'more_work') {
        document.getElementById('woMoreWorkSection').classList.remove('hidden');
        document.getElementById('woNotesRequired').style.display = 'none';
    } else {
        document.getElementById('woNotesRequired').style.display = 'inline';
    }

    // Hide reason buttons, show details
    document.getElementById('woReasonButtons').classList.add('hidden');
    document.getElementById('woReasonDetails').classList.remove('hidden');
}

function changeOfficeReason() {
    document.getElementById('woNotCompletedReason').value = '';
    document.getElementById('woReasonButtons').classList.remove('hidden');
    document.getElementById('woReasonDetails').classList.add('hidden');

    // Reset button styles
    document.querySelectorAll('#woReasonButtons .reason-btn').forEach(btn => {
        btn.style.borderColor = '#dee2e6';
        btn.style.background = 'white';
    });
}

function submitOfficeJobCompleted() {
    // Office staff can close jobs without any conditions (full override permissions)
    const notes = document.getElementById('woCompletionNotes').value.trim();

    // Update the completion summary display
    document.getElementById('woCompletedDisplay').textContent = 'Completed';
    document.getElementById('woCompleted').value = 'yes';

    const jobNumber = document.getElementById('woJobNumber').textContent;
    let confirmMsg = `${jobNumber} marked as COMPLETED!`;
    if (woMainPhoto) confirmMsg += '\nPhoto: ✓';
    if (notes) confirmMsg += `\nNotes: ${notes}`;
    confirmMsg += '\n\nJob saved.';
    alert(confirmMsg);

    showPage('officeWorkOrders');
}

function submitOfficeJobNotCompleted() {
    // Office staff can close jobs without any conditions (full override permissions)
    const reason = document.getElementById('woNotCompletedReason').value;
    const details = document.getElementById('woNotCompletedDetails').value.trim();

    // Update display
    document.getElementById('woCompletedDisplay').textContent = 'Not Completed (Pink)';
    document.getElementById('woCompleted').value = 'no';

    const jobNumber = document.getElementById('woJobNumber').textContent;
    let confirmMsg = `${jobNumber} marked as PINK JOB`;

    // Include whatever info was provided (but none required)
    if (reason) {
        const reasonLabel = WO_REASON_LABELS[reason];
        confirmMsg += `\n\nReason: ${reasonLabel}`;

        if (reason === 'wrong_part') {
            const measurements = document.getElementById('woWrongPartMeasurements').value.trim();
            if (measurements) confirmMsg += `\nMeasurements: ${measurements}`;
            if (woWrongPartPhoto) confirmMsg += '\nCorrect part photo: ✓';
        } else if (reason === 'more_work') {
            if (woMoreWorkPhoto) confirmMsg += '\nIssue photo: ✓';
        }
    }

    if (details) {
        confirmMsg += `\nNotes: ${details}`;
    }

    confirmMsg += '\n\nJob saved as Pink Job.';
    alert(confirmMsg);

    showPage('officeWorkOrders');
}

function resetOfficeCompletionForm() {
    // Reset photos
    woMainPhoto = null;
    woAdditionalPhotos = [];
    woWrongPartPhoto = null;
    woWrongPartSentPhoto = null;
    woMoreWorkPhoto = null;

    // Reset photo previews
    document.getElementById('woPhotoPreview').innerHTML = '';
    document.getElementById('woPhotoPreview').classList.add('hidden');
    document.getElementById('woPhotoUploadArea').style.display = 'block';
    document.getElementById('woPhotoInput').value = '';
    document.getElementById('woAdditionalPhotosPreview').innerHTML = '';

    // Reset completion notes
    document.getElementById('woCompletionNotes').value = '';

    // Reset not completed section
    document.getElementById('woNotCompletedReason').value = '';
    document.getElementById('woReasonButtons').classList.remove('hidden');
    document.getElementById('woReasonDetails').classList.add('hidden');
    document.querySelectorAll('#woReasonButtons .reason-btn').forEach(btn => {
        btn.style.borderColor = '#dee2e6';
        btn.style.background = 'white';
    });

    // Reset wrong part section
    document.getElementById('woWrongPartMeasurements').value = '';
    document.getElementById('woWrongPartPhotoPreview').innerHTML = '';
    document.getElementById('woWrongPartPhotoPreview').classList.add('hidden');
    document.getElementById('woWrongPartPhotoArea').style.display = 'block';
    document.getElementById('woWrongPartPhotoInput').value = '';
    document.getElementById('woWrongPartSentPhotoPreview').innerHTML = '';
    document.getElementById('woWrongPartSentPhotoInput').value = '';

    // Reset more work section
    document.getElementById('woMoreWorkPhotoPreview').innerHTML = '';
    document.getElementById('woMoreWorkPhotoPreview').classList.add('hidden');
    document.getElementById('woMoreWorkPhotoArea').style.display = 'block';
    document.getElementById('woMoreWorkPhotoInput').value = '';

    // Reset notes
    document.getElementById('woNotCompletedDetails').value = '';
}

function populateOfficeWorkOrderCustomerDropdown() {
    const dropdown = document.getElementById('woCustomerLocation');
    dropdown.innerHTML = '<option value="">Select customer & location...</option>';

    CUSTOMERS.forEach(customer => {
        const icon = customer.type === 'county' ? '🏛️' : '🏫';
        const optgroup = document.createElement('optgroup');
        optgroup.label = `${icon} ${customer.name}`;

        customer.locations.forEach(loc => {
            const option = document.createElement('option');
            option.value = `${customer.id}|${loc.id}`;
            option.textContent = loc.name;
            option.dataset.address = loc.address;
            option.dataset.contact = loc.contact;
            option.dataset.phone = loc.phone;
            optgroup.appendChild(option);
        });

        dropdown.appendChild(optgroup);
    });
}

function updateOfficeWorkOrderLocation() {
    const dropdown = document.getElementById('woCustomerLocation');
    const selectedOption = dropdown.options[dropdown.selectedIndex];

    if (selectedOption && selectedOption.dataset.address) {
        document.getElementById('woLocationAddressInput').value = selectedOption.dataset.address;
        document.getElementById('woContactNameInput').value = selectedOption.dataset.contact || '';
        document.getElementById('woContactPhoneInput').value = selectedOption.dataset.phone || '';
    }
}

function viewJobDetail(jobId) {
    // Find the job and show its details
    const job = jobs.find(j => j.id === jobId);
    if (job) {
        // Populate the customer dropdown first
        populateOfficeWorkOrderCustomerDropdown();
        resetAllEditSections();
        resetOfficeCompletionForm();

        // Header
        document.getElementById('woJobNumber').textContent = 'Job #' + (job.jobNumber || job.estimateNumber);

        // Job type badge
        const jobTypeBadge = document.getElementById('woJobTypeBadge');
        jobTypeBadge.textContent = job.jobType || 'Repair';
        jobTypeBadge.className = 'badge badge-info';

        // Status badge
        const statusBadge = document.getElementById('woStatusBadge');
        statusBadge.textContent = job.status || 'New';
        const statusClass = job.status === 'Completed' ? 'badge-success' :
                           job.status === 'Pink' ? 'badge-danger' :
                           job.status === 'Parts Received' ? 'badge-success' : 'badge-info';
        statusBadge.className = `badge ${statusClass}`;

        // Populate display fields
        document.getElementById('woLocationName').textContent = job.locationName || job.customerLocation || 'N/A';
        document.getElementById('woLocationAddress').textContent = job.locationAddress || '';
        document.getElementById('woDescription').textContent = job.description || 'N/A';

        showView('workOrderDetail');
    }
}

