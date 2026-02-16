// ==========================================
// OFFICE WORK ORDERS
// Work order detail, editing, completion
// ==========================================

// Track where user navigated from so Back button returns correctly
var _woBackTarget = 'officeSearch';

function goBackFromWorkOrder() {
    showView(_woBackTarget);
}

async function viewWorkOrderDetail(workOrderId, fromView) {
    // Track navigation source for Back button
    if (fromView) {
        _woBackTarget = fromView;
    }

    // Populate the customer/location dropdown
    populateOfficeWorkOrderCustomerDropdown();

    // Reset all edit sections to display mode
    resetAllEditSections();

    // Load work order data — try in-memory first, then Jobs API
    var wo = OFFICE_WORK_ORDERS[workOrderId];

    if (!wo && typeof JobsAPI !== 'undefined') {
        // workOrderId is a Postgres job ID — fetch from API
        try {
            var jobData = await JobsAPI.get(workOrderId);
            var job = jobData.job || jobData;
            window.currentApiJob = job;
            wo = {
                jobNumber: job.jobNumber,
                jobType: job.jobType || 'repair',
                status: job.status || 'draft',
                locationName: job.locationName || job.customerName || '',
                address: job.address || '',
                customerId: job.customerId || '',
                locationId: '',
                contactName: job.contactName || '',
                contactPhone: job.contactPhone || '',
                description: job.description || job.title || '',
                partsLocation: '',
                specialInstructions: job.specialInstructions || '',
                scheduledDate: job.scheduledDate ? job.scheduledDate.substring(0, 10) : '',
                scheduledTime: '',
                assignedTo: job.assignedTo || '',
                confirmedWith: '',
                confirmedBy: '',
                confirmedDate: '',
                completed: job.status === 'completed' ? 'yes' : '',
                hoursWorked: job.estimatedHours || '',
                completedBy: '',
                techNotes: '',
                _fromApi: true,
                _apiId: job.id
            };
        } catch (err) {
            console.error('Failed to load job from API:', err);
        }
    }

    if (wo) {
        currentWorkOrder = { ...wo, id: workOrderId };

        // Header
        document.getElementById('woJobNumber').textContent = 'Job ' + wo.jobNumber;

        // Job type badge
        const jobTypeBadge = document.getElementById('woJobTypeBadge');
        jobTypeBadge.textContent = wo.jobType;
        jobTypeBadge.className = 'badge badge-info';

        // Status badge
        const statusBadge = document.getElementById('woStatusBadge');
        statusBadge.textContent = wo.status;
        const statusClass = wo.status === 'completed' ? 'badge-success' :
                           wo.status === 'Completed' ? 'badge-success' :
                           wo.status === 'Pink' ? 'badge-danger' :
                           wo.status === 'Parts Received' ? 'badge-success' :
                           wo.status === 'parts_received' ? 'badge-success' :
                           wo.status === 'Scheduled' ? 'badge-warning' :
                           wo.status === 'scheduled' ? 'badge-warning' :
                           wo.status === 'in_progress' ? 'badge-warning' :
                           wo.status === 'draft' ? 'badge-secondary' : 'badge-info';
        statusBadge.className = `badge ${statusClass}`;

        // Location section (display)
        document.getElementById('woLocationName').textContent = wo.locationName;
        document.getElementById('woLocationAddress').textContent = wo.address || '';
        if (wo.address) {
            const encodedAddress = encodeURIComponent(wo.address);
            document.getElementById('woDirectionsLink').href = `https://maps.google.com/?q=${encodedAddress}`;
        }

        // Location section (edit inputs)
        document.getElementById('woCustomerLocation').value = `${wo.customerId || ''}|${wo.locationId || ''}`;
        document.getElementById('woLocationAddressInput').value = wo.address || '';

        // Contact section (display)
        document.getElementById('woContactName').textContent = wo.contactName || '—';
        document.getElementById('woContactPhone').textContent = wo.contactPhone || '—';
        if (wo.contactPhone) {
            document.getElementById('woContactPhoneLink').href = `tel:${wo.contactPhone.replace(/\D/g, '')}`;
        }

        // Contact section (edit inputs)
        document.getElementById('woContactNameInput').value = wo.contactName || '';
        document.getElementById('woContactPhoneInput').value = wo.contactPhone || '';

        // Description section
        document.getElementById('woDescription').textContent = wo.description || '';
        document.getElementById('woDescriptionInput').value = wo.description || '';

        // Parts location section
        document.getElementById('woPartsLocation').textContent = wo.partsLocation || '—';
        document.getElementById('woPartsLocationInput').value = wo.partsLocation || '';

        // Special instructions section
        const instructions = wo.specialInstructions || 'None';
        document.getElementById('woSpecialInstructions').textContent = instructions;
        document.getElementById('woSpecialInstructionsInput').value = wo.specialInstructions || '';

        // Scheduling section (display)
        if (wo.scheduledDate) {
            const schedDate = new Date(wo.scheduledDate + 'T00:00:00');
            document.getElementById('woScheduledDateDisplay').textContent = schedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } else {
            document.getElementById('woScheduledDateDisplay').textContent = '—';
        }
        if (wo.scheduledTime) {
            const [hours, minutes] = wo.scheduledTime.split(':');
            const timeDate = new Date();
            timeDate.setHours(parseInt(hours), parseInt(minutes));
            document.getElementById('woScheduledTimeDisplay').textContent = timeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else {
            document.getElementById('woScheduledTimeDisplay').textContent = '—';
        }
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
        document.getElementById('woScheduledDate').value = wo.scheduledDate || '';
        document.getElementById('woScheduledTime').value = wo.scheduledTime || '';
        document.getElementById('woAssignedTo').value = wo.assignedTo || '';
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

        // Use stored API job for relationship rendering
        const apiJob = window.currentApiJob;

        // Render parent inspection card
        const parentCard = document.getElementById('woParentInspectionCard');
        if (parentCard) {
            if (wo._fromApi && apiJob && apiJob.parentJob) {
                const p = apiJob.parentJob;
                const pDate = p.completedAt ? new Date(p.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                parentCard.innerHTML = `
                    <div style="padding: 14px 16px; background: #e3f2fd; border: 1px solid #90caf9; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 11px; color: #1565c0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Parent Inspection</div>
                            <div style="font-weight: 600; margin-top: 4px; color: #0d47a1;">Job ${p.jobNumber}</div>
                            <div style="font-size: 13px; color: #1565c0; margin-top: 2px;">${p.locationName || p.customerName || ''} ${pDate ? '&bull; ' + pDate : ''}</div>
                        </div>
                        <button class="btn btn-outline" onclick="viewWorkOrderDetail(${p.id}, 'workOrderDetail')" style="font-size: 12px; padding: 6px 14px; color: #1565c0; border-color: #1565c0;">View Inspection</button>
                    </div>
                `;
                parentCard.classList.remove('hidden');
            } else {
                parentCard.innerHTML = '';
                parentCard.classList.add('hidden');
            }
        }

        // Render child work orders card
        const childCard = document.getElementById('woChildJobsCard');
        if (childCard) {
            if (wo._fromApi && apiJob && apiJob.childJobs && apiJob.childJobs.length > 0) {
                const childRows = apiJob.childJobs.map(c => {
                    const cStatus = c.status || 'draft';
                    const statusColors = { draft: '#6c757d', scheduled: '#f57c00', in_progress: '#1976d2', completed: '#2e7d32' };
                    const color = statusColors[cStatus] || '#6c757d';
                    return `<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #fff3e0;">
                        <div>
                            <span style="font-weight: 600;">Job ${c.jobNumber}</span>
                            <span style="font-size: 12px; color: ${color}; margin-left: 8px;">${cStatus.replace('_', ' ')}</span>
                            <div style="font-size: 13px; color: #6c757d;">${c.locationName || ''}</div>
                        </div>
                        <button class="btn btn-outline" onclick="viewWorkOrderDetail(${c.id}, 'workOrderDetail')" style="font-size: 11px; padding: 4px 10px;">View</button>
                    </div>`;
                }).join('');
                childCard.innerHTML = `
                    <div style="padding: 14px 16px; background: #fff8e1; border: 1px solid #ffe082; border-radius: 10px;">
                        <div style="font-size: 11px; color: #f57f17; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 8px;">Child Work Orders (${apiJob.childJobs.length})</div>
                        ${childRows}
                    </div>
                `;
                childCard.classList.remove('hidden');
            } else {
                childCard.innerHTML = '';
                childCard.classList.add('hidden');
            }
        }

        // Render additional API-backed sections
        if (wo._fromApi && apiJob) {
            renderWoAttachments(apiJob);
            renderWoInspectionBanks(apiJob);
            renderWoPartsTracking(apiJob);
        } else {
            var secIds = ['woAttachmentsSection', 'woInspectionBanksSection', 'woPartsTrackingSection'];
            secIds.forEach(function(id) { var el = document.getElementById(id); if (el) el.classList.add('hidden'); });
        }
    }

    showView('workOrderDetail');
    var scrollContainer = document.querySelector('.content-area');
    if (scrollContainer) scrollContainer.scrollTop = 0;
    window.scrollTo(0, 0);
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
    const notes = document.getElementById('woCompletionNotes').value.trim();
    const additionalWork = document.getElementById('woAdditionalWorkFound') && document.getElementById('woAdditionalWorkFound').checked;
    const additionalNotes = document.getElementById('woAdditionalWorkNotes') ? document.getElementById('woAdditionalWorkNotes').value.trim() : '';

    // Update the completion summary display
    document.getElementById('woCompletedDisplay').textContent = 'Completed';
    document.getElementById('woCompleted').value = 'yes';

    const jobNumber = document.getElementById('woJobNumber').textContent;
    let confirmMsg = `${jobNumber} marked as COMPLETED!`;
    if (additionalWork && additionalNotes) confirmMsg += `\n\nAdditional work found: ${additionalNotes}`;
    if (woMainPhoto) confirmMsg += '\nPhoto: ✓';
    if (notes) confirmMsg += `\nNotes: ${notes}`;
    confirmMsg += '\n\nJob saved.';
    alert(confirmMsg);

    goBackFromWorkOrder();
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

    goBackFromWorkOrder();
}

function resetOfficeCompletionForm() {
    // Reset photos
    woMainPhoto = null;
    woAdditionalPhotos = [];
    woWrongPartPhoto = null;
    woWrongPartSentPhoto = null;
    woMoreWorkPhoto = null;

    // Helper for safe element access
    function _el(id) { return document.getElementById(id); }

    // Reset photo previews
    if (_el('woPhotoPreview')) { _el('woPhotoPreview').innerHTML = ''; _el('woPhotoPreview').classList.add('hidden'); }
    if (_el('woPhotoUploadArea')) _el('woPhotoUploadArea').style.display = 'block';
    if (_el('woPhotoInput')) _el('woPhotoInput').value = '';

    // Reset completion notes
    if (_el('woCompletionNotes')) _el('woCompletionNotes').value = '';

    // Reset not completed section
    if (_el('woNotCompletedReason')) _el('woNotCompletedReason').value = '';

    // Reset wrong part section
    if (_el('woWrongPartMeasurements')) _el('woWrongPartMeasurements').value = '';
    if (_el('woWrongPartPhotoPreview')) { _el('woWrongPartPhotoPreview').innerHTML = ''; _el('woWrongPartPhotoPreview').classList.add('hidden'); }
    if (_el('woWrongPartPhotoArea')) _el('woWrongPartPhotoArea').style.display = 'block';
    if (_el('woWrongPartPhotoInput')) _el('woWrongPartPhotoInput').value = '';
    if (_el('woWrongPartSentPhotoPreview')) _el('woWrongPartSentPhotoPreview').innerHTML = '';
    if (_el('woWrongPartSentPhotoInput')) _el('woWrongPartSentPhotoInput').value = '';

    // Reset more work section
    if (_el('woMoreWorkPhotoPreview')) { _el('woMoreWorkPhotoPreview').innerHTML = ''; _el('woMoreWorkPhotoPreview').classList.add('hidden'); }
    if (_el('woMoreWorkPhotoArea')) _el('woMoreWorkPhotoArea').style.display = 'block';
    if (_el('woMoreWorkPhotoInput')) _el('woMoreWorkPhotoInput').value = '';

    // Reset notes
    if (_el('woNotCompletedDetails')) _el('woNotCompletedDetails').value = '';

    // Reset new completion panels
    var el;
    el = document.getElementById('woCompletePanel'); if (el) el.classList.add('hidden');
    el = document.getElementById('woNotCompletePanel'); if (el) el.classList.add('hidden');
    el = document.getElementById('woJobCompleteBtn'); if (el) el.classList.remove('active');
    el = document.getElementById('woJobNotCompleteBtn'); if (el) el.classList.remove('active');
    el = document.getElementById('woAdditionalWorkFound'); if (el) el.checked = false;
    el = document.getElementById('woAdditionalWorkArea'); if (el) el.classList.add('hidden');
    el = document.getElementById('woAdditionalWorkNotes'); if (el) el.value = '';
    el = document.getElementById('woPinkReasonGrid'); if (el) el.innerHTML = '';
    el = document.getElementById('woPinkReasonDetails'); if (el) el.classList.add('hidden');
    el = document.getElementById('woPinkNotes'); if (el) el.value = '';
}

// ==========================================
// ATTACHMENTS RENDERING
// ==========================================

function renderWoAttachments(job) {
    var container = document.getElementById('woAttachmentsSection');
    if (!container) return;

    if (!job || !job.attachments || job.attachments.length === 0) {
        container.classList.add('hidden');
        return;
    }

    var imageUrls = job.attachments
        .filter(function(a) { return a.contentType && a.contentType.startsWith('image/'); })
        .map(function(a) { return a.blobUrl; });
    window._jobImageUrls = imageUrls;

    var thumbnails = job.attachments.map(function(a) {
        if (a.contentType && a.contentType.startsWith('image/')) {
            var idx = imageUrls.indexOf(a.blobUrl);
            return '<div onclick="expandJobImage(' + idx + ')" style="width:100px;height:100px;border-radius:8px;overflow:hidden;border:1px solid #dee2e6;cursor:pointer;">' +
                '<img src="' + a.blobUrl + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy">' +
            '</div>';
        }
        return '<div onclick="window.open(\'' + a.blobUrl + '\',\'_blank\')" style="width:100px;height:100px;border-radius:8px;overflow:hidden;border:1px solid #dee2e6;cursor:pointer;display:flex;align-items:center;justify-content:center;background:#f8f9fa;">' +
            '<span style="font-size:32px;">📄</span>' +
        '</div>';
    }).join('');

    container.innerHTML =
        '<p style="font-size:12px;color:#6c757d;margin-bottom:8px;text-transform:uppercase;font-weight:600;">Photos & Attachments (' + job.attachments.length + ')</p>' +
        '<div style="display:flex;gap:12px;flex-wrap:wrap;">' + thumbnails + '</div>';
    container.classList.remove('hidden');
}

// ==========================================
// INSPECTION BANKS RENDERING
// ==========================================

function renderWoInspectionBanks(job) {
    var container = document.getElementById('woInspectionBanksSection');
    if (!container) return;

    if (!job || !job.inspectionBanks || job.inspectionBanks.length === 0) {
        container.classList.add('hidden');
        return;
    }

    var banksHtml = job.inspectionBanks.map(function(bank) {
        var issues = bank.issues || [];
        var issueCount = issues.length;
        var hasSafety = issues.some(function(i) { return i.severity === 'safety' || i.category === 'safety'; });

        var issuesDetail = issues.map(function(issue) {
            return '<div style="font-size:12px;padding:3px 0;border-bottom:1px solid #f0f0f0;">' +
                (issue.location ? '<span style="color:#e65100;">' + issue.location + '</span> — ' : '') +
                (issue.description || issue.issueType || 'Issue') +
            '</div>';
        }).join('');

        return '<details style="border:1px solid ' + (hasSafety ? '#ef9a9a' : '#e9ecef') + ';border-radius:10px;overflow:hidden;background:white;">' +
            '<summary style="cursor:pointer;padding:12px;display:flex;align-items:center;gap:10px;list-style:none;">' +
                '<div style="width:40px;height:40px;border-radius:8px;background:' + (issueCount > 0 ? (hasSafety ? '#ffebee' : '#fff3e0') : '#e8f5e9') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
                    '<span style="font-weight:700;font-size:16px;color:' + (issueCount > 0 ? (hasSafety ? '#c62828' : '#e65100') : '#2e7d32') + ';">' + issueCount + '</span>' +
                '</div>' +
                '<div style="flex:1;min-width:0;">' +
                    '<div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + bank.bankName + '</div>' +
                    '<div style="font-size:11px;color:#6c757d;">' + (bank.bleacherType || '') + (bank.status ? ' &bull; ' + bank.status : '') + '</div>' +
                '</div>' +
                (hasSafety ? '<span style="font-size:10px;background:#c62828;color:white;padding:2px 6px;border-radius:4px;font-weight:600;">SAFETY</span>' : '') +
                '<span style="font-size:18px;color:#aaa;transition:transform 0.2s;">▸</span>' +
            '</summary>' +
            (issueCount > 0 ? '<div style="padding:0 12px 12px;border-top:1px solid #f0f0f0;">' + issuesDetail + '</div>' : '') +
        '</details>';
    }).join('');

    container.innerHTML =
        '<div class="card-header"><h2 class="card-title">Banks Inspected (' + job.inspectionBanks.length + ')</h2></div>' +
        '<div class="card-body" style="display:flex;flex-direction:column;gap:8px;">' + banksHtml + '</div>';
    container.classList.remove('hidden');
}

// ==========================================
// PARTS TRACKING / PROCUREMENT / STOCK RENDERING
// ==========================================

function renderWoPartsTracking(job) {
    var container = document.getElementById('woPartsTrackingSection');
    if (!container) return;

    var meta = job && job.metadata;
    var hasPartsTracking = meta && meta.partsTracking && Object.keys(meta.partsTracking).length > 0;
    var hasProcurement = meta && meta.procurementNotes && meta.procurementNotes.length > 0;
    var hasStock = meta && meta.stockParts && meta.stockParts.length > 0;

    if (!hasPartsTracking && !hasProcurement && !hasStock) {
        container.classList.add('hidden');
        return;
    }

    var html = '';
    if (hasPartsTracking && typeof renderPartsTrackingFields === 'function') {
        html += '<div style="margin-bottom:20px;border:1px solid #e9ecef;border-radius:8px;overflow:hidden;">' +
            '<div style="background:#f8f9fa;padding:12px 16px;border-bottom:1px solid #e9ecef;display:flex;justify-content:space-between;align-items:center;">' +
                '<label style="font-size:12px;color:#6c757d;text-transform:uppercase;margin:0;">Parts Tracking</label>' +
                '<button class="btn btn-outline" onclick="editPartsTracking(' + job.id + ')" style="font-size:11px;padding:4px 8px;">Edit</button>' +
            '</div>' +
            '<div style="padding:16px;">' + renderPartsTrackingFields(meta.partsTracking) + '</div>' +
        '</div>';
    }
    if (typeof renderProcurementNotesSection === 'function') {
        html += renderProcurementNotesSection(meta);
    }
    if (typeof renderStockPartsSection === 'function') {
        html += renderStockPartsSection(meta);
    }

    container.innerHTML = html;
    container.classList.remove('hidden');
}

// ==========================================
// COMPLETION FLOW FUNCTIONS
// ==========================================

function toggleCompletionPanel(panel) {
    var completePanel = document.getElementById('woCompletePanel');
    var notCompletePanel = document.getElementById('woNotCompletePanel');
    var completeBtn = document.getElementById('woJobCompleteBtn');
    var notCompleteBtn = document.getElementById('woJobNotCompleteBtn');

    if (panel === 'complete') {
        var isOpen = !completePanel.classList.contains('hidden');
        completePanel.classList.toggle('hidden');
        notCompletePanel.classList.add('hidden');
        completeBtn.classList.toggle('active', !isOpen);
        notCompleteBtn.classList.remove('active');
    } else {
        var isOpen2 = !notCompletePanel.classList.contains('hidden');
        notCompletePanel.classList.toggle('hidden');
        completePanel.classList.add('hidden');
        notCompleteBtn.classList.toggle('active', !isOpen2);
        completeBtn.classList.remove('active');
        if (!isOpen2) populatePinkReasons();
    }
}

function toggleAdditionalWorkArea() {
    var checkbox = document.getElementById('woAdditionalWorkFound');
    var area = document.getElementById('woAdditionalWorkArea');
    area.classList.toggle('hidden', !checkbox.checked);
}

function populatePinkReasons() {
    var grid = document.getElementById('woPinkReasonGrid');
    if (!grid || grid.children.length > 0) return;

    grid.innerHTML = PINK_REASONS.map(function(reason) {
        var safeValue = reason.value.replace(/'/g, "\\'");
        return '<button type="button" class="pink-reason-btn" onclick="selectPinkReason(\'' + safeValue + '\', this)" data-reason="' + reason.value.replace(/'/g, '&#39;') + '">' +
            '<span class="reason-icon">' + reason.icon + '</span>' +
            '<span class="reason-label">' + reason.label + '</span>' +
        '</button>';
    }).join('');
}

function selectPinkReason(reasonValue, btn) {
    document.querySelectorAll('.pink-reason-btn').forEach(function(b) { b.classList.remove('selected'); });
    btn.classList.add('selected');

    document.getElementById('woNotCompletedReason').value = reasonValue;

    var reason = PINK_REASONS.find(function(r) { return r.value === reasonValue; });
    document.getElementById('woPinkSelectedReason').textContent = reason ? reason.icon + ' ' + reason.label : reasonValue;

    var wrongPartSection = document.getElementById('woWrongPartSection');
    var moreWorkSection = document.getElementById('woMoreWorkSection');
    if (wrongPartSection) wrongPartSection.classList.toggle('hidden', reasonValue !== 'Wrong Part');
    if (moreWorkSection) moreWorkSection.classList.toggle('hidden', reasonValue !== 'Additional Work');

    document.getElementById('woPinkReasonGrid').classList.add('hidden');
    document.getElementById('woPinkReasonDetails').classList.remove('hidden');
}

function changePinkReason() {
    document.getElementById('woPinkReasonGrid').classList.remove('hidden');
    document.getElementById('woPinkReasonDetails').classList.add('hidden');
    document.querySelectorAll('.pink-reason-btn').forEach(function(b) { b.classList.remove('selected'); });
    document.getElementById('woNotCompletedReason').value = '';
}

function submitPinkJob() {
    var reason = document.getElementById('woNotCompletedReason').value;
    if (!reason) {
        alert('Please select a reason.');
        return;
    }

    var notes = document.getElementById('woNotCompletedDetails').value.trim();
    if (!notes) {
        alert('Notes are required for a Pink Job. Please describe what happened.');
        document.getElementById('woNotCompletedDetails').focus();
        return;
    }

    if (reason === 'Wrong Part') {
        var measurements = document.getElementById('woWrongPartMeasurements');
        if (measurements && !measurements.value.trim()) {
            alert('Measurements are required for Wrong Part.');
            measurements.focus();
            return;
        }
    }

    submitOfficeJobNotCompleted();
}

function populateOfficeWorkOrderCustomerDropdown() {
    const dropdown = document.getElementById('woCustomerLocation');
    dropdown.innerHTML = '<option value="">Select customer & location...</option>';

    CUSTOMERS.forEach(customer => {
        const icon = customer.type === 'county' ? '🏛️' : '🏫';
        const optgroup = document.createElement('optgroup');
        optgroup.label = `${icon} ${customer.name}`;

        customer.locations.forEach(loc => {
            const locContact = getPrimaryContact(loc.contacts);
            const option = document.createElement('option');
            option.value = `${customer.id}|${loc.id}`;
            option.textContent = loc.name;
            option.dataset.address = loc.address;
            option.dataset.contact = locContact.name || '';
            option.dataset.phone = locContact.phone || '';
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
    viewWorkOrderDetail(jobId, _woBackTarget || 'home');
}

