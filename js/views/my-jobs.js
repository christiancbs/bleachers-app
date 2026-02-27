// ==========================================
// MY JOBS & TEAM SCHEDULE
// Field staff personal schedule and team view
// ==========================================

// ==========================================
// MY JOBS VIEW
// Personal schedule for logged-in field tech
// ==========================================

function loadMyJobs() {
    initializeSampleScheduleData();
    // Set offset to show sample data week
    const sampleDate = new Date('2025-02-03');
    const currentMonday = getWeekStart(0);
    myJobsWeekOffset = Math.round((sampleDate - currentMonday) / (7 * 24 * 60 * 60 * 1000));
    const label = document.getElementById('myJobsWeekLabel');
    label.textContent = getWeekLabel(myJobsWeekOffset);

    // Use original territory schedule data and filter for logged-in tech
    // For demo, show Field Tech jobs from the sample data
    const currentTech = 'Field Tech';
    const weekStart = getWeekStart(myJobsWeekOffset);
    const container = document.getElementById('myJobsWeekGrid');
    const allData = scheduleDataOriginal;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate week progress
    let totalJobs = 0;
    let completedJobs = 0;
    for (let i = 0; i < 5; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);
        const dateKey = formatDateKey(dayDate);
        const allDayJobs = allData[dateKey] || [];
        const myDayJobs = allDayJobs.filter(j =>
            j.tech && j.tech.toLowerCase().includes(currentTech.toLowerCase()) && j.type === 'job'
        );
        totalJobs += myDayJobs.length;
        completedJobs += myDayJobs.filter(j => j.status === 'complete').length;
    }

    let html = '';

    // Active Inspections from localStorage (field-created)
    const activeInspections = (typeof inspectionJobs !== 'undefined') ? inspectionJobs : [];

    if (activeInspections.length > 0) {
        const statusConfig = {
            'in_progress': { label: 'In Progress', color: '#e65100', bg: '#fff3e0' },
            'ready_for_review': { label: 'Ready for Review', color: '#1565c0', bg: '#e3f2fd' },
            'submitted': { label: 'Submitted', color: '#2e7d32', bg: '#c8e6c9' },
            'unable': { label: 'Unable to Complete', color: '#c62828', bg: '#ffcdd2' }
        };

        html += `<div class="card" style="margin-bottom: 16px;">
            <div class="card-header" style="padding: 12px 16px; font-weight: 600; display: flex; justify-content: space-between; align-items: center;">
                <span>My Inspections</span>
                <span class="badge" style="background: #e3f2fd; color: #1565c0;">${activeInspections.length}</span>
            </div>`;

        activeInspections.forEach(job => {
            const bankCount = job.banks?.length || 0;
            const created = new Date(job.createdAt).toLocaleDateString();
            const st = statusConfig[job.status] || statusConfig['in_progress'];
            const canReopen = job.status === 'submitted' || job.status === 'ready_for_review';

            html += `<div onclick="resumeJob(${job.jobNumber})" style="padding: 14px 16px; border-bottom: 1px solid #e9ecef; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <div style="font-weight: 600;">Job ${job.jobNumber}</div>
                    <div style="font-size: 14px; color: #6c757d;">${job.locationName || 'No location'}</div>
                    <div style="font-size: 12px; color: #6c757d;">${bankCount} bank(s) &bull; ${created}</div>
                    ${job.unableReason ? '<div style="font-size: 12px; color: #c62828; margin-top: 2px;">' + job.unableReason + '</div>' : ''}
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    ${canReopen ? '<button onclick="event.stopPropagation(); editSubmittedJob(' + job.jobNumber + ')" style="padding: 6px 12px; font-size: 12px; background: #fff3e0; color: #e65100; border: 1px solid #e65100; border-radius: 6px; cursor: pointer;">Edit</button>' : ''}
                    <span class="badge" style="background: ${st.bg}; color: ${st.color};">${st.label}</span>
                </div>
            </div>`;
        });

        html += `</div>`;
    }

    // Add progress indicator
    if (totalJobs > 0) {
        const progressPercent = Math.round((completedJobs / totalJobs) * 100);
        html += `
            <div class="card" style="margin-bottom: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div class="card-body" style="padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; color: white;">
                        <div>
                            <div style="font-size: 24px; font-weight: 700;">${completedJobs} / ${totalJobs}</div>
                            <div style="font-size: 13px; opacity: 0.9;">Jobs Completed This Week</div>
                        </div>
                        <div style="font-size: 32px; font-weight: 700;">${progressPercent}%</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.3); height: 8px; border-radius: 4px; margin-top: 12px; overflow: hidden;">
                        <div style="background: white; height: 100%; width: ${progressPercent}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    for (let i = 0; i < 5; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);
        const dateKey = formatDateKey(dayDate);
        const isToday = dayDate.getTime() === today.getTime();

        // Filter for this tech's jobs
        const allDayJobs = allData[dateKey] || [];
        const myDayJobs = allDayJobs.filter(j =>
            j.tech && j.tech.toLowerCase().includes(currentTech.toLowerCase())
        );

        if (myDayJobs.length === 0) continue; // Skip empty days

        html += `
            <div class="schedule-day">
                <div class="schedule-day-header ${isToday ? 'today' : ''}">
                    <span>${days[i]} ${dayDate.getMonth() + 1}/${dayDate.getDate()}</span>
                    <span style="font-size: 12px; opacity: 0.8;">${myDayJobs.length} ${myDayJobs.length === 1 ? 'job' : 'jobs'}</span>
                </div>
                <div class="schedule-day-jobs">
        `;

        myDayJobs.forEach(job => {
            const isNote = job.type === 'note';
            const isContinued = job.type === 'continued';

            if (isNote) {
                html += `
                    <div style="padding: 12px 16px; background: #fffde7; display: flex; align-items: center; gap: 8px;">
                        <span style="color: #f9a825;">📌</span>
                        <span style="color: #6c757d;">${job.details}</span>
                    </div>
                `;
            } else {
                const status = job.status || 'scheduled';
                const statusConfig = {
                    'scheduled': { label: 'Scheduled', color: '#6c757d', bg: '#e9ecef' },
                    'en_route': { label: 'En Route', color: '#0066cc', bg: '#e3f2fd' },
                    'checked_in': { label: 'Checked In', color: '#1976d2', bg: '#bbdefb' },
                    'complete': { label: 'Complete', color: '#2e7d32', bg: '#c8e6c9' },
                    'unable_to_complete': { label: 'Unable to Complete', color: '#c62828', bg: '#ffcdd2' }
                };
                const statusStyle = statusConfig[status] || statusConfig['scheduled'];

                // Format timestamps
                let timestampHtml = '';
                if (job.checkedInAt) {
                    const time = new Date(job.checkedInAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    timestampHtml = `<div style="font-size: 12px; color: #1976d2; margin-top: 4px;">✓ Checked in at ${time}</div>`;
                }
                if (job.completedAt) {
                    const time = new Date(job.completedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    timestampHtml = `<div style="font-size: 12px; color: #2e7d32; margin-top: 4px;">✓ Completed at ${time}</div>`;
                }

                // Action buttons based on status
                let actionButtons = '';
                if (status === 'scheduled' || status === 'en_route') {
                    actionButtons = `<button class="btn btn-primary" style="padding: 6px 12px; font-size: 13px;" onclick="checkInJob('${job.id}')">Check In</button>`;
                } else if (status === 'checked_in') {
                    actionButtons = `
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-success" style="padding: 6px 12px; font-size: 13px;" onclick="completeJob('${job.id}')">Mark Complete</button>
                            <button class="btn btn-outline" style="padding: 6px 12px; font-size: 13px; color: #c62828; border-color: #c62828;" onclick="unableToCompleteJob('${job.id}')">Unable to Complete</button>
                        </div>
                    `;
                }

                html += `
                    <div style="padding: 16px; border-bottom: 1px solid #f0f0f0; ${isContinued ? 'background: #f0f7ff;' : ''} ${status === 'complete' ? 'opacity: 0.7;' : ''}">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <div style="font-weight: 600; font-size: 15px;">${job.school}</div>
                            <span class="badge" style="background: ${statusStyle.bg}; color: ${statusStyle.color}; margin-left: 12px; white-space: nowrap;">${statusStyle.label}</span>
                        </div>
                        ${job.specialInstructions ? `<div style="background: #fff3e0; border-left: 4px solid #f57c00; padding: 12px; margin-bottom: 12px; border-radius: 4px;">
                            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                                <span style="font-size: 16px;">⚠️</span>
                                <strong style="color: #e65100; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Special Instructions</strong>
                            </div>
                            <div style="color: #5d4037; font-size: 14px; line-height: 1.4;">${job.specialInstructions}</div>
                        </div>` : ''}
                        <div style="color: #495057; font-size: 14px; line-height: 1.5; margin-bottom: 8px;">
                            ${isContinued ? '<em>Continued from previous day</em>' : job.details}
                        </div>
                        ${job.partsLocation ? `<div style="color: #e65100; font-size: 13px; margin-bottom: 4px;"><strong>Parts:</strong> ${job.partsLocation}</div>` : ''}
                        ${job.equipmentRental ? `<div style="margin-bottom: 4px;"><span class="badge" style="background: #fff3e0; color: #ef6c00; font-size: 11px; padding: 4px 8px;">🚜 Equipment Rental Required</span></div>` : ''}
                        ${job.notes ? `<div style="color: #6c757d; font-size: 12px; margin-bottom: 4px;">${job.notes}</div>` : ''}
                        ${timestampHtml}
                        ${job.confirmation === 'XX' ? '<span class="badge badge-success" style="margin-top: 8px;">Confirmed</span>' : job.confirmation === 'X' ? '<span class="badge badge-warning" style="margin-top: 8px;">Confirmation Pending</span>' : ''}
                        ${actionButtons ? `<div style="margin-top: 12px;">${actionButtons}</div>` : ''}
                        ${job.parentJobId ? `<div style="margin-top: 8px;"><button class="btn btn-outline" style="padding: 4px 10px; font-size: 12px; color: #1565c0; border-color: #1565c0;" onclick="openInspectionReferenceModal(${job.parentJobId})">View Inspection</button></div>` : ''}
                    </div>
                `;
            }
        });

        html += `
                </div>
            </div>
        `;
    }

    if (!html) {
        html = `
            <div class="card">
                <div class="card-body" style="text-align: center; padding: 40px; color: #6c757d;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
                    <p>No jobs scheduled for you this week.</p>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

function prevMyJobsWeek() {
    myJobsWeekOffset--;
    loadMyJobs();
}

function nextMyJobsWeek() {
    myJobsWeekOffset++;
    loadMyJobs();
}

// ==========================================
// TEAM SCHEDULE (Field Staff Read-Only)
// ==========================================

function loadTeamSchedule() {
    initializeSampleScheduleData();
    // Set offset to show sample data week
    const sampleDate = new Date('2025-02-03');
    const currentMonday = getWeekStart(0);
    teamScheduleWeekOffset = Math.round((sampleDate - currentMonday) / (7 * 24 * 60 * 60 * 1000));
    const label = document.getElementById('teamWeekLabel');
    label.textContent = getWeekLabel(teamScheduleWeekOffset);
    renderTeamScheduleGrid();
}

function renderTeamScheduleGrid() {
    const container = document.getElementById('teamScheduleGrid');
    const weekStart = getWeekStart(teamScheduleWeekOffset);
    const activeData = currentTeamTerritory === 'original' ? scheduleDataOriginal : scheduleDataSouthern;

    if (isMobileSchedule()) {
        container.innerHTML = renderScheduleMobileCards(activeData, weekStart);
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    let html = '<table class="schedule-table">';
    html += '<thead><tr><th class="col-school">School / Location</th><th>Job Details</th><th class="col-tech">Tech(s)</th><th style="width: 80px; text-align: center;">Confirmed</th><th class="col-parts">Parts</th></tr></thead>';
    html += '<tbody>';

    for (let i = 0; i < 5; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);
        const dateKey = formatDateKey(dayDate);
        const isToday = dayDate.getTime() === today.getTime();
        const dayJobs = activeData[dateKey] || [];
        const dayLabel = days[i] + ' ' + (dayDate.getMonth() + 1) + '/' + dayDate.getDate();

        html += '<tr class="schedule-day-row ' + (isToday ? 'schedule-today-row' : '') + '">';
        html += '<td colspan="5">' + dayLabel + '</td>';
        html += '</tr>';

        if (dayJobs.length === 0) {
            if (i === 4) {
                html += '<tr><td colspan="5" style="padding: 14px; text-align: center; color: #adb5bd; font-style: italic;">Floating day</td></tr>';
            } else {
                html += '<tr><td colspan="5" style="padding: 14px; text-align: center; color: #adb5bd;">No jobs scheduled</td></tr>';
            }
        } else {
            dayJobs.forEach(function(job) {
                var isNote = job.type === 'note';
                var isContinued = job.type === 'continued';
                var isPink = job.isPink === true;

                var formattedDetails = job.details || '';
                formattedDetails = formattedDetails.replace(/\*([^*]+)\*/g, '<span style="color: #bf360c; font-weight: 600; background: #fff3e0; padding: 1px 5px; border-radius: 3px;">$1</span>');

                if (isNote) {
                    html += '<tr class="schedule-note-row">';
                    html += '<td colspan="5">' + formattedDetails + (job.tech ? ' &mdash; ' + job.tech : '') + '</td>';
                    html += '</tr>';
                } else {
                    var rowClass = '';
                    if (isPink) rowClass = 'schedule-pink-row';
                    else if (isContinued) rowClass = 'schedule-continued-row';

                    var confirmIcon = '';
                    if (job.confirmation === 'XX') {
                        confirmIcon = '<span style="color: #2e7d32; font-size: 18px;" title="Confirmed">✓✓</span>';
                    } else if (job.confirmation === 'X') {
                        confirmIcon = '<span style="color: #f57c00; font-size: 16px;" title="Attempted">✓</span>';
                    } else {
                        confirmIcon = '<span style="color: #bdbdbd; font-size: 16px;" title="Not confirmed">—</span>';
                    }

                    html += '<tr class="' + rowClass + '">';
                    html += '<td style="font-weight: 600;">' + job.school + (job.equipmentRental ? ' <span class="badge" style="background: #fff3e0; color: #ef6c00; font-size: 10px; padding: 2px 6px; margin-left: 6px;">🚜 EQUIPMENT</span>' : '') + '</td>';
                    html += '<td>' + (isContinued ? '<em style="color: #1565c0;">Continued</em>' : formattedDetails) + '</td>';
                    html += '<td>' + (job.tech || '') + '</td>';
                    html += '<td style="text-align: center;">' + confirmIcon + '</td>';
                    html += '<td style="color: #e65100; font-weight: 500;">' + (job.partsLocation || '') + '</td>';
                    html += '</tr>';
                }
            });
        }
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

function switchTeamTerritory(territory) {
    currentTeamTerritory = territory;
    document.getElementById('teamOriginalTab').classList.toggle('active', territory === 'original');
    document.getElementById('teamSouthernTab').classList.toggle('active', territory === 'southern');
    renderTeamScheduleGrid();
}

function prevTeamWeek() {
    teamScheduleWeekOffset--;
    loadTeamSchedule();
}

function nextTeamWeek() {
    teamScheduleWeekOffset++;
    loadTeamSchedule();
}

// ==========================================
// JOB STATUS MANAGEMENT
// ==========================================

let currentUnableJobId = null;
let unableToCompletePhoto = null;

// Check in to a job
function checkInJob(jobId) {
    const now = new Date().toISOString();
    updateJobStatus(jobId, 'checked_in', { checkedInAt: now });
    loadMyJobs();
    if (typeof renderOfficeJobsGrid === 'function') renderOfficeJobsGrid();
    if (typeof renderWeeklySchedule === 'function') renderWeeklySchedule();
}

// Mark job as complete
function completeJob(jobId) {
    const now = new Date().toISOString();
    updateJobStatus(jobId, 'complete', { completedAt: now });
    loadMyJobs();
    if (typeof renderOfficeJobsGrid === 'function') renderOfficeJobsGrid();
    if (typeof renderWeeklySchedule === 'function') renderWeeklySchedule();
}

// Open unable to complete modal
function unableToCompleteJob(jobId) {
    currentUnableJobId = jobId;
    document.getElementById('unableToCompleteModal').classList.remove('hidden');
    // Reset form
    document.getElementById('unableReason').value = '';
    document.getElementById('unableNotes').value = '';
    document.getElementById('unablePhoto').value = '';
    document.getElementById('unablePhotoPreview').innerHTML = '';
    unableToCompletePhoto = null;
}

// Close unable to complete modal
function closeUnableToCompleteModal() {
    document.getElementById('unableToCompleteModal').classList.add('hidden');
    currentUnableJobId = null;
    unableToCompletePhoto = null;
}

// Handle photo upload
function handleUnablePhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            unableToCompletePhoto = e.target.result;
            document.getElementById('unablePhotoPreview').innerHTML =
                '<img src="' + e.target.result + '" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Submit unable to complete
function submitUnableToComplete() {
    const reason = document.getElementById('unableReason').value;
    const notes = document.getElementById('unableNotes').value;

    if (!reason) {
        alert('Please select a reason');
        return;
    }

    const now = new Date().toISOString();
    updateJobStatus(currentUnableJobId, 'unable_to_complete', {
        unableToCompleteAt: now,
        unableToCompleteReason: reason,
        unableToCompleteNotes: notes,
        unableToCompletePhoto: unableToCompletePhoto
    });

    // Move job to shit list
    moveJobToShitList(currentUnableJobId, reason, notes);

    closeUnableToCompleteModal();
    loadMyJobs();
    if (typeof renderOfficeJobsGrid === 'function') renderOfficeJobsGrid();
    if (typeof renderWeeklySchedule === 'function') renderWeeklySchedule();
}

// Update job status across all data structures
function updateJobStatus(jobId, newStatus, additionalFields = {}) {
    // Update in both territory schedules
    [scheduleDataOriginal, scheduleDataSouthern].forEach(scheduleData => {
        Object.keys(scheduleData).forEach(dateKey => {
            const jobs = scheduleData[dateKey];
            const job = jobs.find(j => j.id === jobId);
            if (job) {
                job.status = newStatus;
                Object.assign(job, additionalFields);
            }
        });
    });

    // Persist to localStorage (in real app, would sync to server)
    localStorage.setItem('scheduleDataOriginal', JSON.stringify(scheduleDataOriginal));
    localStorage.setItem('scheduleDataSouthern', JSON.stringify(scheduleDataSouthern));
}

// Move job to shit list
function moveJobToShitList(jobId, reason, notes) {
    // Find the job
    let job = null;
    let territory = 'original';

    Object.keys(scheduleDataOriginal).forEach(dateKey => {
        const foundJob = scheduleDataOriginal[dateKey].find(j => j.id === jobId);
        if (foundJob) job = foundJob;
    });

    if (!job) {
        Object.keys(scheduleDataSouthern).forEach(dateKey => {
            const foundJob = scheduleDataSouthern[dateKey].find(j => j.id === jobId);
            if (foundJob) {
                job = foundJob;
                territory = 'southern';
            }
        });
    }

    if (job) {
        // Create shit list entry
        const shitListEntry = {
            id: 'sl_' + Date.now(),
            jobNumber: job.id,
            type: job.type === 'job' ? 'Repair' : 'Service Call',
            county: job.school.split(',')[1] || '',
            school: job.school,
            state: job.school.includes('TN') ? 'TN' : job.school.includes('KY') ? 'KY' : job.school.includes('AL') ? 'AL' : 'FL',
            details: job.details,
            reason: reason,
            reasonDetails: notes,
            tech: job.tech,
            originalDate: new Date().toISOString().split('T')[0],
            laborAmount: 0,
            partsLocation: job.partsLocation || '',
            measurements: ''
        };

        // Add to appropriate shit list
        if (territory === 'original') {
            if (typeof shitListJobs !== 'undefined') {
                shitListJobs.push(shitListEntry);
            }
        } else {
            if (typeof shitListSouthern !== 'undefined') {
                shitListSouthern.push(shitListEntry);
            }
        }

        // Mark as pink job in schedule
        job.isPink = true;
    }
}

// ==========================================
// INSPECTION REFERENCE MODAL
// Read-only view of parent inspection for techs
// ==========================================

async function openInspectionReferenceModal(parentJobId) {
    if (typeof JobsAPI === 'undefined') {
        alert('API not available');
        return;
    }

    try {
        const data = await JobsAPI.get(parentJobId);
        const job = data.job;

        const banksHtml = (job.inspectionBanks && job.inspectionBanks.length > 0)
            ? job.inspectionBanks.map(bank => {
                const issuesList = (bank.issues && bank.issues.length > 0)
                    ? bank.issues.map(i => `<li style="margin-bottom: 4px;">${typeof i === 'string' ? i : (i.description || i.issue || JSON.stringify(i))}</li>`).join('')
                    : '<li style="color: #6c757d;">No issues noted</li>';
                return `
                    <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px;">
                        <div style="font-weight: 600;">${bank.bankName}</div>
                        <div style="font-size: 13px; color: #6c757d; margin-bottom: 6px;">${bank.bleacherType || ''} &bull; ${bank.rowCount || '?'} rows &bull; ${bank.seatCount || '?'} seats &bull; ${bank.status || ''}</div>
                        <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 13px;">${issuesList}</ul>
                    </div>
                `;
            }).join('')
            : '<p style="color: #6c757d; text-align: center;">No inspection banks recorded</p>';

        const photosHtml = (job.attachments && job.attachments.length > 0)
            ? `<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
                ${job.attachments.filter(a => a.contentType?.startsWith('image/')).map(a =>
                    `<div style="width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 1px solid #dee2e6; cursor: pointer;" onclick="window.open('${a.blobUrl}', '_blank')">
                        <img src="${a.blobUrl}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>`
                ).join('')}
              </div>`
            : '';

        const modalHtml = `
            <div id="inspectionRefModal" class="modal-backdrop" onclick="if(event.target===this)closeInspectionRefModal()" style="z-index: 10000;">
                <div class="modal" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <div>
                            <h2 style="margin: 0;">Inspection ${job.jobNumber}</h2>
                            <div style="font-size: 13px; color: #6c757d; margin-top: 4px;">${job.locationName || job.customerName || ''}</div>
                        </div>
                        <button onclick="closeInspectionRefModal()" style="background:none;border:none;font-size:24px;cursor:pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${job.description ? `
                            <div style="margin-bottom: 16px;">
                                <label style="font-size: 12px; color: #6c757d; text-transform: uppercase;">Description</label>
                                <div style="margin-top: 4px; padding: 10px; background: #f8f9fa; border-radius: 8px; font-size: 13px; white-space: pre-wrap;">${job.description}</div>
                            </div>
                        ` : ''}

                        <div style="margin-bottom: 16px;">
                            <label style="font-size: 12px; color: #6c757d; text-transform: uppercase;">Inspection Banks (${job.inspectionBanks?.length || 0})</label>
                            <div style="margin-top: 8px;">${banksHtml}</div>
                        </div>

                        ${photosHtml ? `
                            <div>
                                <label style="font-size: 12px; color: #6c757d; text-transform: uppercase;">Photos (${job.attachments?.filter(a => a.contentType?.startsWith('image/')).length || 0})</label>
                                ${photosHtml}
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="closeInspectionRefModal()">Close</button>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById('inspectionRefModal');
        if (existing) existing.remove();

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    } catch (err) {
        console.error('Failed to load inspection:', err);
        alert('Failed to load inspection: ' + err.message);
    }
}

function closeInspectionRefModal() {
    const modal = document.getElementById('inspectionRefModal');
    if (modal) modal.remove();
}

