// ==========================================
// FIELD STAFF VIEWS
// Tech dashboard, work orders, create form
// ==========================================

function showTechWorkOrderDetail(workOrderId) {
    const wo = TECH_WORK_ORDERS[workOrderId];
    if (!wo) return;

    // Populate the detail view with work order data
    document.getElementById('twoJobNumber').textContent = `Job ${wo.jobNumber}`;
    document.getElementById('twoJobTypeBadge').textContent = wo.jobType;
    document.getElementById('twoLocationName').textContent = wo.locationName;
    document.getElementById('twoAddress').textContent = wo.address;
    document.getElementById('twoContactName').textContent = wo.contactName;
    document.getElementById('twoContactPhone').textContent = wo.contactPhone;
    document.getElementById('twoContactPhone').href = `tel:${wo.contactPhone.replace(/[^0-9]/g, '')}`;
    document.getElementById('twoDescription').textContent = wo.description;
    document.getElementById('twoPartsLocation').textContent = wo.partsLocation;

    // Update directions link
    const encodedAddress = encodeURIComponent(wo.address);
    document.getElementById('twoDirectionsLink').href = `https://maps.google.com/?q=${encodedAddress}`;

    // Show/hide special instructions
    const specialSection = document.getElementById('twoSpecialInstructionsSection');
    if (wo.specialInstructions) {
        specialSection.classList.remove('hidden');
        document.getElementById('twoSpecialInstructions').textContent = wo.specialInstructions;
    } else {
        specialSection.classList.add('hidden');
    }

    // Reset form state
    document.getElementById('twoNotCompletedSection').classList.add('hidden');
    document.getElementById('twoCompletionNotes').value = '';
    document.getElementById('twoPhotoPreview').classList.add('hidden');
    document.getElementById('twoPhotoPreview').innerHTML = '';
    document.getElementById('twoAdditionalPhotosPreview').innerHTML = '';
    document.getElementById('twoPhotoUploadArea').style.display = 'block';
    twoMainPhoto = null;
    twoAdditionalPhotosList = [];

    if (document.getElementById('twoNotCompletedReason')) {
        document.getElementById('twoNotCompletedReason').value = '';
    }
    if (document.getElementById('twoNotCompletedDetails')) {
        document.getElementById('twoNotCompletedDetails').value = '';
    }

    // Reset not completed section to initial state
    document.getElementById('twoReasonButtons').style.display = 'flex';
    document.getElementById('twoReasonDetails').classList.add('hidden');
    document.getElementById('twoWrongPartSection').classList.add('hidden');
    document.getElementById('twoMoreWorkSection').classList.add('hidden');
    if (document.getElementById('twoWrongPartMeasurements')) {
        document.getElementById('twoWrongPartMeasurements').value = '';
    }
    document.getElementById('twoWrongPartPhotoPreview').classList.add('hidden');
    document.getElementById('twoWrongPartPhotoPreview').innerHTML = '';
    document.getElementById('twoWrongPartPhotoArea').style.display = 'block';
    document.getElementById('twoWrongPartSentPhotoPreview').innerHTML = '';
    document.getElementById('twoMoreWorkPhotoPreview').classList.add('hidden');
    document.getElementById('twoMoreWorkPhotoPreview').innerHTML = '';
    document.getElementById('twoMoreWorkPhotoArea').style.display = 'block';
    twoWrongPartPhoto = null;
    twoWrongPartSentPhoto = null;
    twoMoreWorkPhoto = null;

    showTechView('workorderdetail');
}

function handleTwoPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    twoMainPhoto = file;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('twoPhotoPreview').innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${e.target.result}" style="max-width: 100%; max-height: 300px; border-radius: 8px; border: 2px solid #4CAF50;">
                <button onclick="removeTwoMainPhoto()" style="position: absolute; top: 8px; right: 8px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 16px;">×</button>
            </div>
            <p style="color: #4CAF50; font-weight: 600; margin-top: 8px;">✓ Photo uploaded</p>
        `;
        document.getElementById('twoPhotoPreview').classList.remove('hidden');
        document.getElementById('twoPhotoUploadArea').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeTwoMainPhoto() {
    twoMainPhoto = null;
    document.getElementById('twoPhotoPreview').classList.add('hidden');
    document.getElementById('twoPhotoPreview').innerHTML = '';
    document.getElementById('twoPhotoUploadArea').style.display = 'block';
    document.getElementById('twoPhotoInput').value = '';
}

function handleTwoAdditionalPhotos(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        twoAdditionalPhotosList.push(file);
        const reader = new FileReader();
        reader.onload = function(e) {
            const index = twoAdditionalPhotosList.length - 1;
            const preview = document.getElementById('twoAdditionalPhotosPreview');
            const div = document.createElement('div');
            div.style.cssText = 'position: relative; display: inline-block;';
            div.innerHTML = `
                <img src="${e.target.result}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #dee2e6;">
                <button onclick="removeTwoAdditionalPhoto(${index}, this)" style="position: absolute; top: -8px; right: -8px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px;">×</button>
            `;
            preview.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

function removeTwoAdditionalPhoto(index, button) {
    button.parentElement.remove();
}

function showNotCompletedOptions() {
    document.getElementById('twoNotCompletedSection').classList.remove('hidden');
    document.getElementById('twoNotCompletedSection').scrollIntoView({ behavior: 'smooth' });
}

// Reason labels for display
const REASON_LABELS = {
    wrong_part: '🔧 Wrong or Missing Part',
    access: '🚪 Can\'t Access Site',
    more_work: '⚠️ Additional Work Needed',
    equipment: '🏗️ Equipment Issue',
    other: '📝 Other'
};

const REASON_PLACEHOLDERS = {
    wrong_part: 'What part was wrong/missing?',
    access: 'What happened? When can we reschedule?',
    more_work: 'What additional work is needed?',
    equipment: 'What equipment issue?',
    other: 'What happened?'
};

function selectNotCompletedReason(reason) {
    document.getElementById('twoNotCompletedReason').value = reason;
    document.getElementById('twoReasonButtons').style.display = 'none';
    document.getElementById('twoReasonDetails').classList.remove('hidden');
    document.getElementById('twoSelectedReasonText').textContent = REASON_LABELS[reason];

    // Show/hide specific sections
    document.getElementById('twoWrongPartSection').classList.toggle('hidden', reason !== 'wrong_part');
    document.getElementById('twoMoreWorkSection').classList.toggle('hidden', reason !== 'more_work');

    // Set placeholder and notes requirement
    document.getElementById('twoNotCompletedDetails').placeholder = REASON_PLACEHOLDERS[reason];

    // Notes optional for wrong_part (measurements + photo tell the story) and more_work (photo tells story)
    const notesRequired = document.getElementById('twoNotesRequired');
    if (reason === 'wrong_part' || reason === 'more_work') {
        notesRequired.textContent = '(optional)';
        notesRequired.style.color = '#6c757d';
    } else {
        notesRequired.textContent = '*Required';
        notesRequired.style.color = '#dc3545';
    }

    document.getElementById('twoReasonDetails').scrollIntoView({ behavior: 'smooth' });
}

function changeReason() {
    document.getElementById('twoReasonButtons').style.display = 'flex';
    document.getElementById('twoReasonDetails').classList.add('hidden');
    document.getElementById('twoNotCompletedReason').value = '';
}

function handleWrongPartPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    twoWrongPartPhoto = file;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('twoWrongPartPhotoPreview').innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${e.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 2px solid #4CAF50;">
                <button onclick="removeWrongPartPhoto()" style="position: absolute; top: 4px; right: 4px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">×</button>
            </div>
        `;
        document.getElementById('twoWrongPartPhotoPreview').classList.remove('hidden');
        document.getElementById('twoWrongPartPhotoArea').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeWrongPartPhoto() {
    twoWrongPartPhoto = null;
    document.getElementById('twoWrongPartPhotoPreview').classList.add('hidden');
    document.getElementById('twoWrongPartPhotoPreview').innerHTML = '';
    document.getElementById('twoWrongPartPhotoArea').style.display = 'block';
    document.getElementById('twoWrongPartPhotoInput').value = '';
}

function handleWrongPartSentPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    twoWrongPartSentPhoto = file;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('twoWrongPartSentPhotoPreview').innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${e.target.result}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <button onclick="removeWrongPartSentPhoto()" style="position: absolute; top: -6px; right: -6px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;">×</button>
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

function removeWrongPartSentPhoto() {
    twoWrongPartSentPhoto = null;
    document.getElementById('twoWrongPartSentPhotoPreview').innerHTML = '';
    document.getElementById('twoWrongPartSentPhotoInput').value = '';
}

function handleMoreWorkPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    twoMoreWorkPhoto = file;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('twoMoreWorkPhotoPreview').innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${e.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 2px solid #4CAF50;">
                <button onclick="removeMoreWorkPhoto()" style="position: absolute; top: 4px; right: 4px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">×</button>
            </div>
        `;
        document.getElementById('twoMoreWorkPhotoPreview').classList.remove('hidden');
        document.getElementById('twoMoreWorkPhotoArea').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeMoreWorkPhoto() {
    twoMoreWorkPhoto = null;
    document.getElementById('twoMoreWorkPhotoPreview').classList.add('hidden');
    document.getElementById('twoMoreWorkPhotoPreview').innerHTML = '';
    document.getElementById('twoMoreWorkPhotoArea').style.display = 'block';
    document.getElementById('twoMoreWorkPhotoInput').value = '';
}

function submitJobCompleted() {
    // Validate required fields
    if (!twoMainPhoto) {
        alert('Please upload a photo of the completed work');
        return;
    }

    const notes = document.getElementById('twoCompletionNotes').value.trim();
    if (!notes) {
        alert('Please add completion notes (even "All work completed" is fine)');
        document.getElementById('twoCompletionNotes').focus();
        return;
    }

    // In a real app, this would submit to the server
    const jobNumber = document.getElementById('twoJobNumber').textContent;
    alert(`${jobNumber} marked as COMPLETED!\n\nPhoto uploaded: Yes\nNotes: ${notes}\n\nSubmission saved. Returning to work orders list.`);

    showTechView('workorders');
}

function submitJobNotCompleted() {
    const reason = document.getElementById('twoNotCompletedReason').value;
    const details = document.getElementById('twoNotCompletedDetails').value.trim();

    if (!reason) {
        alert('Please select a reason');
        return;
    }

    // Validate based on reason type
    if (reason === 'wrong_part') {
        const measurements = document.getElementById('twoWrongPartMeasurements').value.trim();
        if (!measurements) {
            alert('Please provide measurements of the correct part needed');
            document.getElementById('twoWrongPartMeasurements').focus();
            return;
        }
        if (!twoWrongPartPhoto) {
            alert('Please photo a correct/working part so we know what to order');
            return;
        }
        // Notes optional for wrong_part - measurements and photo are the key info
    } else if (reason === 'more_work') {
        if (!twoMoreWorkPhoto) {
            alert('Please photo the issue/damage found');
            return;
        }
        // Notes optional - photo tells the story
    } else {
        // For access, equipment, other - notes are required
        if (!details) {
            alert('Please add a note explaining what happened');
            document.getElementById('twoNotCompletedDetails').focus();
            return;
        }
    }

    // Build confirmation message
    const jobNumber = document.getElementById('twoJobNumber').textContent;
    const reasonLabel = REASON_LABELS[reason];

    let confirmMsg = `${jobNumber} marked as PINK JOB\n\nReason: ${reasonLabel}`;

    if (reason === 'wrong_part') {
        const measurements = document.getElementById('twoWrongPartMeasurements').value.trim();
        confirmMsg += `\nMeasurements: ${measurements}`;
        confirmMsg += '\nCorrect part photo: ✓';
    } else if (reason === 'more_work') {
        confirmMsg += '\nIssue photo: ✓';
    }

    if (details) {
        confirmMsg += `\nNotes: ${details}`;
    }

    confirmMsg += '\n\nOffice has been notified.';
    alert(confirmMsg);

    showTechView('workorders');
}

// Office Functions
