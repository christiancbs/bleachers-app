// ==========================================
// SCHEDULING
// Schedule grid, planning, backlog, shit list
// ==========================================

// ==========================================
// DATA & CONSTANTS
// ==========================================

// Techs/Crews list
const TECHS = [
    'Danny (overnight)',
    'Jon (overnight)',
    'Floyd (overnight)',
    'Sam (overnight)',
    'Blake & Rick (overnight)',
    'Chris & Blake (overnight)',
    'Troy & Rick (overnight)',
    'Alex W & Michael (overnight)',
    'Chris & Owen (overnight)',
    'Troy, Alex & Rick (overnight)',
    'Floyd, Anthony, Blake & Seth (overnight)',
    'Alex M (overnight)',
    'Danny',
    'Jon',
    'Floyd',
    'Sam',
    'Blake & Rick',
    'Chris & Blake',
    'Troy & Rick',
    'Alex W & Michael',
    'Chris & Owen',
    'Troy',
    'Alex',
    'Rick',
    'Blake',
    'Chris',
    'Michael',
    'Owen',
    'Anthony',
    'Seth',
    'Alex M'
];

// Current week offset (0 = current week, -1 = last week, 1 = next week)
let scheduleWeekOffset = 0;
let currentScheduleTab = 'thisWeek';
let currentTerritory = 'original'; // 'original' or 'southern'
let myJobsWeekOffset = 0;
let teamScheduleWeekOffset = 0;
let currentTeamTerritory = 'original';

// Schedule data per territory (kept as globals for backward compat with my-jobs.js, search.js)
let scheduleDataOriginal = {};
let scheduleDataSouthern = {};

// Active schedule data (populated from API)
let scheduleData = {};

// Cached backlog jobs from last API fetch (for modal dropdowns + addJobToSchedule)
let cachedBacklogJobs = [];

// ==========================================
// API DATA TRANSFORMATION
// Convert API job objects to schedule grid format
// ==========================================

// Transform an API job into the shape the schedule grid renderers expect
function apiJobToScheduleEntry(job) {
    const meta = job.metadata || {};
    return {
        id: job.id,
        jobId: job.id,
        type: 'job',
        school: formatJobLocation(job),
        details: job.description || '',
        tech: job.assignedTo || '',
        partsLocation: meta.partsTracking?.partsLocation || meta.partsLocation || '',
        isPink: job.status === 'unable_to_complete',
        status: job.status === 'completed' ? 'complete' : job.status,
        completedAt: job.completedAt || null,
        checkedInAt: meta.checkedInAt || null,
        equipmentRental: meta.equipmentRental || false,
        confirmation: meta.confirmation || '',
        confirmationDetails: meta.confirmationDetails || null,
        specialInstructions: job.specialInstructions || '',
        internalNotes: meta.internalNotes || '',
        notes: meta.notes || '',
        estimateNumber: job.jobNumber,
        qbEstimateTotal: job.qbEstimateTotal
    };
}

// Build display location from API job fields
function formatJobLocation(job) {
    const parts = [job.locationName || job.customerName, job.title].filter(Boolean);
    return parts.join(', ') || job.jobNumber;
}

// Fetch schedule data from API for current territory + week
async function loadScheduleData() {
    const territory = currentTerritory === 'original' ? 'Original' : 'Southern';
    const weekStart = getWeekStart(scheduleWeekOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4); // Mon-Fri

    try {
        const data = await JobsAPI.list({
            territory: territory,
            scheduledDateGte: formatDateKey(weekStart),
            scheduledDateLte: formatDateKey(weekEnd),
            limit: 100
        });

        // Group jobs by scheduled_date into the grid format
        scheduleData = {};
        (data.jobs || []).forEach(job => {
            const dateKey = job.scheduledDate ? job.scheduledDate.split('T')[0] : null;
            if (dateKey) {
                if (!scheduleData[dateKey]) scheduleData[dateKey] = [];
                scheduleData[dateKey].push(apiJobToScheduleEntry(job));
            }
        });

        // Update territory globals for backward compat (my-jobs.js, search.js)
        if (currentTerritory === 'original') {
            scheduleDataOriginal = scheduleData;
        } else {
            scheduleDataSouthern = scheduleData;
        }
    } catch (err) {
        console.error('Failed to load schedule:', err);
        scheduleData = {};
    }
}

// Update job status through API
async function updateJobStatus(jobId, newStatus) {
    try {
        const updateData = { status: newStatus === 'complete' ? 'completed' : newStatus };
        if (newStatus === 'checked_in') {
            updateData.metadata = { checkedInAt: new Date().toISOString() };
        }
        await JobsAPI.update(jobId, updateData);
        await loadScheduleData();
        renderWeeklySchedule();
    } catch (err) {
        console.error('Failed to update status:', err);
        alert('Failed to update: ' + err.message);
    }
}

// Backward-compat stub: my-jobs.js still calls this. No-op now that data comes from API.
function initializeSampleScheduleData() {
    // Data now loaded from API via loadScheduleData()
}
// ==========================================
// UTILITY FUNCTIONS
// Date helpers and data access
// ==========================================

// Get territory string for API calls
function getApiTerritory() {
    return currentTerritory === 'original' ? 'Original' : 'Southern';
}

// Get week start date (Monday)
function getWeekStart(offset = 0) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) + (offset * 7);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

// Format date as YYYY-MM-DD
function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

// Format date for display
function formatDateDisplay(date) {
    const options = { weekday: 'short', month: 'numeric', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Get week label
function getWeekLabel(offset = 0) {
    const weekStart = getWeekStart(offset);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return `Week of ${weekStart.toLocaleDateString('en-US', options)}`;
}

// ==========================================
// SCHEDULE VIEW FUNCTIONS
// Main schedule grid, territory switching, week navigation
// ==========================================

// Load schedule view
async function loadSchedule() {
    scheduleWeekOffset = 0;
    updateWeekLabel();
    await loadScheduleData();
    renderWeeklySchedule();
    populateTechDropdowns();
    // Re-show the active tab (showView hides all elements ending with "View")
    switchScheduleTab(currentScheduleTab);
}

// Switch territory (Office view)
async function switchTerritory(territory) {
    currentTerritory = territory;

    // Update territory tab styles
    document.getElementById('officeOriginalTab').classList.toggle('active', territory === 'original');
    document.getElementById('officeSouthernTab').classList.toggle('active', territory === 'southern');

    await loadScheduleData();
    renderWeeklySchedule();
}

// Update week label
function updateWeekLabel() {
    document.getElementById('scheduleWeekLabel').textContent = getWeekLabel(scheduleWeekOffset);
}

// Navigate weeks
async function previousWeek() {
    scheduleWeekOffset--;
    updateWeekLabel();
    await loadScheduleData();
    renderWeeklySchedule();
}

async function nextWeek() {
    scheduleWeekOffset++;
    updateWeekLabel();
    await loadScheduleData();
    renderWeeklySchedule();
}

// Switch schedule tabs (This Week + Planning only — Backlog/Shit List are in Jobs view)
function switchScheduleTab(tab) {
    currentScheduleTab = tab;

    // Update tab styles
    const tabIds = ['thisWeekTab', 'planningTab'];
    tabIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
    const activeTab = document.getElementById(tab + 'Tab');
    if (activeTab) activeTab.classList.add('active');

    // Show/hide views
    const viewIds = ['thisWeekView', 'planningView'];
    viewIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    if (tab === 'thisWeek') {
        const el = document.getElementById('thisWeekView');
        if (el) el.classList.remove('hidden');
    } else if (tab === 'planning') {
        const el = document.getElementById('planningView');
        if (el) el.classList.remove('hidden');
        renderPlanningSchedule();
    }
}

// Mobile schedule card renderer
function isMobileSchedule() {
    return window.innerWidth <= 768;
}

function renderScheduleMobileCards(data, weekStart, opts) {
    opts = opts || {};
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    var html = '';

    for (var i = 0; i < 5; i++) {
        var dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);
        var dateKey = formatDateKey(dayDate);
        var isToday = dayDate.getTime() === today.getTime();
        var dayJobs = data[dateKey] || [];
        var dayLabel = days[i] + ' ' + (dayDate.getMonth() + 1) + '/' + dayDate.getDate();

        html += '<div class="schedule-mobile-day' + (isToday ? ' today' : '') + '">' + dayLabel;
        if (opts.planning) {
            html += ' <button class="btn btn-sm" style="float:right; padding: 2px 10px; font-size: 11px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3);" onclick="addJobToDay(\'' + dateKey + '\')">+ Add</button>';
        }
        html += '</div>';

        if (dayJobs.length === 0) {
            var emptyMsg = (i === 4 && !opts.planning) ? 'Floating day' : (opts.planning ? 'No jobs yet — tap + Add' : 'No jobs scheduled');
            html += '<div style="padding: 12px; text-align: center; color: #adb5bd; font-size: 13px; font-style: italic;">' + emptyMsg + '</div>';
        } else {
            dayJobs.forEach(function(job) {
                var isNote = job.type === 'note';
                var isContinued = job.type === 'continued';
                var isPink = job.isPink === true;
                var formattedDetails = job.details || '';
                formattedDetails = formattedDetails.replace(/\*([^*]+)\*/g, '<span style="color: #bf360c; font-weight: 600; background: #fff3e0; padding: 1px 5px; border-radius: 3px;">$1</span>');

                if (isNote) {
                    html += '<div class="schedule-mobile-card smc-note">' + formattedDetails + (job.tech ? ' &mdash; ' + job.tech : '') + '</div>';
                } else {
                    var cardClass = 'schedule-mobile-card';
                    if (isPink) cardClass += ' smc-pink';
                    else if (isContinued) cardClass += ' smc-continued';

                    html += '<div class="' + cardClass + '">';
                    html += '<div class="smc-school">' + job.school + '</div>';
                    if (job.tech) html += '<span class="smc-tech">' + job.tech + '</span>';
                    if (isContinued) {
                        html += '<div class="smc-details"><em style="color: #1565c0;">Continued</em></div>';
                    } else {
                        html += '<div class="smc-details">' + formattedDetails + '</div>';
                    }
                    if (job.partsLocation) html += '<div class="smc-parts">📦 ' + job.partsLocation + '</div>';
                    html += '</div>';
                }
            });
        }
    }
    return html;
}

// Render weekly schedule grid (table-based layout)
function renderWeeklySchedule() {
    const container = document.getElementById('weeklyScheduleGrid');
    const weekStart = getWeekStart(scheduleWeekOffset);

    if (isMobileSchedule()) {
        container.innerHTML = renderScheduleMobileCards(scheduleData, weekStart);
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = '<table class="schedule-table">';
    html += '<thead><tr><th class="col-school">School / Location</th><th>Job Details</th><th class="col-tech">Tech(s)</th><th style="width: 120px;">Status</th><th style="width: 80px; text-align: center;">Confirmed</th><th class="col-parts">Parts</th></tr></thead>';
    html += '<tbody>';

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    for (let i = 0; i < 5; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);
        const dateKey = formatDateKey(dayDate);
        const isToday = dayDate.getTime() === today.getTime();
        const dayJobs = scheduleData[dateKey] || [];
        const dayLabel = days[i] + ' ' + (dayDate.getMonth() + 1) + '/' + dayDate.getDate();

        html += '<tr class="schedule-day-row ' + (isToday ? 'schedule-today-row' : '') + '">';
        html += '<td colspan="6">' + dayLabel + '</td>';
        html += '</tr>';

        if (dayJobs.length === 0) {
            if (i === 4) {
                html += '<tr><td colspan="6" style="padding: 14px; text-align: center; color: #adb5bd; font-style: italic;">Floating day</td></tr>';
            } else {
                html += '<tr><td colspan="6" style="padding: 14px; text-align: center; color: #adb5bd;">No jobs scheduled</td></tr>';
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
                    html += '<td colspan="6">' + formattedDetails + (job.tech ? ' &mdash; ' + job.tech : '') + '</td>';
                    html += '</tr>';
                } else {
                    var status = job.status || 'scheduled';
                    var statusConfig = {
                        'scheduled': { label: 'Scheduled', color: '#6c757d', bg: '#e9ecef' },
                        'en_route': { label: 'En Route', color: '#0066cc', bg: '#e3f2fd' },
                        'checked_in': { label: 'Checked In', color: '#1976d2', bg: '#bbdefb' },
                        'complete': { label: 'Complete', color: '#2e7d32', bg: '#c8e6c9' },
                        'unable_to_complete': { label: 'Unable to Complete', color: '#c62828', bg: '#ffcdd2' }
                    };
                    var statusStyle = statusConfig[status] || statusConfig['scheduled'];

                    var rowClass = '';
                    if (isPink) rowClass = 'schedule-pink-row';
                    else if (isContinued) rowClass = 'schedule-continued-row';
                    else if (status === 'complete') rowClass = 'schedule-complete-row';

                    var confirmIcon = '';
                    var confirmTitle = 'Not confirmed';
                    if (job.confirmation === 'XX') {
                        confirmTitle = 'Confirmed' + (job.confirmationDetails?.confirmedWith ? ' with ' + job.confirmationDetails.confirmedWith : '') + (job.confirmationDetails?.method ? ' via ' + job.confirmationDetails.method : '');
                        confirmIcon = '<span style="color: #2e7d32; font-size: 18px;" title="' + confirmTitle + '">✓✓</span>';
                    } else if (job.confirmation === 'X') {
                        confirmTitle = 'Attempted' + (job.confirmationDetails?.method ? ' via ' + job.confirmationDetails.method : '');
                        confirmIcon = '<span style="color: #f57c00; font-size: 16px;" title="' + confirmTitle + '">✓</span>';
                    } else {
                        confirmIcon = '<span style="color: #bdbdbd; font-size: 16px;" title="Not confirmed">—</span>';
                    }

                    html += '<tr class="' + rowClass + '" style="' + (status === 'complete' ? 'opacity: 0.6;' : '') + '">';
                    html += '<td style="font-weight: 600;">' + job.school + (job.equipmentRental ? ' <span class="badge" style="background: #fff3e0; color: #ef6c00; font-size: 10px; padding: 2px 6px; margin-left: 6px;">🚜 EQUIPMENT</span>' : '') + '</td>';
                    html += '<td>' + (isContinued ? '<em style="color: #1565c0;">Continued</em>' : formattedDetails) + '</td>';
                    html += '<td>' + (job.tech || '') + '</td>';
                    html += '<td><span class="badge" style="background: ' + statusStyle.bg + '; color: ' + statusStyle.color + '; font-size: 11px; padding: 3px 8px;">' + statusStyle.label + '</span></td>';
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

// ==========================================
// PLANNING VIEW FUNCTIONS
// Next week planning grid with add functionality
// ==========================================

// Render planning schedule (table-based layout, editable) — fetches next week from API
async function renderPlanningSchedule() {
    const container = document.getElementById('planningScheduleGrid');
    // Use next week for planning
    const weekStart = getWeekStart(scheduleWeekOffset + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4);

    // Show loading state
    container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">Loading planning data...</div>';

    // Fetch next week's scheduled jobs from API
    let planningData = {};
    try {
        const data = await JobsAPI.list({
            territory: getApiTerritory(),
            scheduledDateGte: formatDateKey(weekStart),
            scheduledDateLte: formatDateKey(weekEnd),
            limit: 100
        });
        (data.jobs || []).forEach(job => {
            const dateKey = job.scheduledDate ? job.scheduledDate.split('T')[0] : null;
            if (dateKey) {
                if (!planningData[dateKey]) planningData[dateKey] = [];
                planningData[dateKey].push(apiJobToScheduleEntry(job));
            }
        });
    } catch (err) {
        console.error('Failed to load planning data:', err);
    }

    let html = '';

    // Selected job panel (if a job is selected for planning)
    if (selectedPlanningJob) {
        const job = selectedPlanningJob;
        html += `
            <div style="margin-bottom: 20px; padding: 16px; background: #fff3e0; border: 2px solid #ff9800; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="font-size: 18px;">📋</span>
                            <strong style="color: #e65100;">Ready to Place</strong>
                        </div>
                        <div style="font-weight: 600; color: #007bff; margin-bottom: 4px;">#${job.jobNumber}</div>
                        <div style="font-weight: 500;">${job.customerName || 'No customer'}</div>
                        <div style="font-size: 13px; color: #6c757d;">${job.title || job.locationName || ''}</div>
                        ${job.qbEstimateTotal ? `<div style="font-weight: 600; color: #28a745; margin-top: 4px;">$${parseFloat(job.qbEstimateTotal).toLocaleString()}</div>` : ''}
                    </div>
                    <button class="btn btn-outline" onclick="clearPlanningSelection()" style="font-size: 12px;">Cancel</button>
                </div>
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ffcc80; font-size: 13px; color: #e65100;">
                    👇 Click a day below to place this job on the schedule
                </div>
            </div>
        `;
    }

    html += '<div style="margin-bottom: 16px; padding: 12px; background: #e8f5e9; border-radius: 8px;">';
    html += '<strong>Planning for: Week of ' + weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + '</strong>';
    html += '</div>';

    if (isMobileSchedule()) {
        html += renderScheduleMobileCards(planningData, weekStart, { planning: true });
        container.innerHTML = html;
        return;
    }

    html += '<table class="schedule-table">';
    html += '<thead><tr><th class="col-school">School/Location</th><th>Job Details</th><th class="col-tech">Tech(s)</th><th class="col-parts">Parts</th></tr></thead>';
    html += '<tbody>';

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    for (let i = 0; i < 5; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);
        const dateKey = formatDateKey(dayDate);
        const dayLabel = days[i] + ' ' + (dayDate.getMonth() + 1) + '/' + dayDate.getDate();
        const dayJobs = planningData[dateKey] || [];

        // Highlight row if job is selected
        const rowStyle = selectedPlanningJob ? 'cursor: pointer; transition: background 0.15s;' : '';
        const rowClick = selectedPlanningJob ? `onclick="placeJobOnDay('${dateKey}')" onmouseover="this.style.background='#fff3e0'" onmouseout="this.style.background=''"` : '';

        html += `<tr class="schedule-day-row" style="${rowStyle}" ${rowClick}>`;
        html += '<td colspan="3">' + dayLabel + (dayJobs.length > 0 ? ` <span style="color: #6c757d; font-weight: 400;">(${dayJobs.length} job${dayJobs.length > 1 ? 's' : ''})</span>` : '') + '</td>';
        html += `<td style="text-align: right; background: inherit;">
            ${selectedPlanningJob
                ? `<span style="color: #ff9800; font-size: 12px;">Click to place here →</span>`
                : `<button class="btn btn-sm" style="padding: 2px 10px; font-size: 11px;" onclick="addJobToDay('${dateKey}')">+ Add</button>`
            }
        </td>`;
        html += '</tr>';

        // Show already-scheduled jobs for this day
        if (dayJobs.length > 0) {
            dayJobs.forEach(function(job) {
                html += '<tr>';
                html += '<td style="font-weight: 500; padding-left: 24px;">' + job.school + '</td>';
                html += '<td style="font-size: 13px; color: #495057;">' + truncateText(job.details, 100) + '</td>';
                html += '<td>' + (job.tech || '<span style="color: #adb5bd;">Unassigned</span>') + '</td>';
                html += '<td style="color: #e65100;">' + (job.partsLocation || '') + '</td>';
                html += '</tr>';
            });
        } else {
            html += '<tr><td colspan="4" style="padding: 12px; text-align: center; color: #adb5bd; font-size: 12px;">' +
                (selectedPlanningJob ? 'Click the day header above to place the job' : 'No jobs yet — click + Add') +
                '</td></tr>';
        }
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Populate tech dropdowns + fetch draft jobs for job select
async function populateTechDropdowns() {
    const techSelect = document.getElementById('entryTech');
    const jobSelect = document.getElementById('entryJobSelect');

    if (techSelect) {
        techSelect.innerHTML = '<option value="">-- Select tech(s) --</option>' +
            TECHS.map(t => `<option value="${t}">${t}</option>`).join('');
    }

    if (jobSelect) {
        jobSelect.innerHTML = '<option value="">Loading jobs...</option>';
        try {
            const data = await JobsAPI.list({
                status: 'draft',
                territory: getApiTerritory(),
                limit: 100
            });
            cachedBacklogJobs = data.jobs || [];
            jobSelect.innerHTML = '<option value="">-- Select a job --</option>' +
                cachedBacklogJobs.map(j =>
                    `<option value="${j.id}">${j.jobNumber} - ${j.customerName || j.locationName || 'Unknown'} (${JobsAPI.jobTypeLabels[j.jobType] || j.jobType})</option>`
                ).join('');
        } catch (err) {
            console.error('Failed to load draft jobs:', err);
            jobSelect.innerHTML = '<option value="">Failed to load jobs</option>';
        }
    }
}

// Add Entry Modal
async function openAddEntryModal() {
    document.getElementById('addEntryModal').classList.remove('hidden');
    await populateTechDropdowns();
}

function closeAddEntryModal() {
    document.getElementById('addEntryModal').classList.add('hidden');
}

function toggleEntryFields() {
    const entryType = document.getElementById('entryType').value;
    document.getElementById('jobEntryFields').classList.add('hidden');
    document.getElementById('noteEntryFields').classList.add('hidden');
    document.getElementById('customEntryFields').classList.add('hidden');

    if (entryType === 'job') {
        document.getElementById('jobEntryFields').classList.remove('hidden');
    } else if (entryType === 'note') {
        document.getElementById('noteEntryFields').classList.remove('hidden');
    } else if (entryType === 'custom') {
        document.getElementById('customEntryFields').classList.remove('hidden');
    }
}

async function saveScheduleEntry() {
    const entryType = document.getElementById('entryType').value;
    const day = document.getElementById('entryDay').value;
    const tech = document.getElementById('entryTech').value;
    const partsLocation = document.getElementById('entryPartsLocation').value;
    const confirmation = document.getElementById('entryConfirmation').value;
    const confirmedWith = document.getElementById('entryConfirmedWith').value;
    const confirmationMethod = document.getElementById('entryConfirmationMethod').value;
    const equipmentRental = document.getElementById('entryEquipmentRental').checked;
    const notes = document.getElementById('entryNotes').value;
    const internalNotes = document.getElementById('entryInternalNotes').value;

    // Get the date key for the selected day
    const weekStart = getWeekStart(scheduleWeekOffset);
    const dayIndex = ['mon', 'tue', 'wed', 'thu', 'fri'].indexOf(day);
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + dayIndex);
    const dateKey = formatDateKey(targetDate);

    if (entryType === 'job') {
        const jobId = document.getElementById('entryJobSelect').value;
        if (!jobId) { alert('Please select a job'); return; }

        try {
            // Build metadata with scheduling details
            const job = cachedBacklogJobs.find(j => j.id === parseInt(jobId));
            const existingMeta = job?.metadata || {};
            const updatedMeta = {
                ...existingMeta,
                confirmation: confirmation,
                confirmationDetails: confirmation ? {
                    confirmedWith: confirmedWith,
                    method: confirmationMethod,
                    confirmedBy: window.currentUser?.name || 'Office',
                    confirmedDate: confirmation === 'XX' ? formatDateKey(new Date()) : null
                } : null,
                equipmentRental: equipmentRental,
                notes: notes,
                internalNotes: internalNotes,
                partsLocation: partsLocation
            };

            await JobsAPI.update(parseInt(jobId), {
                status: 'scheduled',
                scheduledDate: dateKey,
                assignedTo: tech || null,
                metadata: updatedMeta
            });

            await loadScheduleData();
            renderWeeklySchedule();
            closeAddEntryModal();
            alert('Job scheduled!');
        } catch (err) {
            console.error('Failed to schedule job:', err);
            alert('Failed to schedule: ' + err.message);
        }
    } else if (entryType === 'note' || entryType === 'custom') {
        // Keep note/custom entries in-memory (no DB model for schedule notes)
        let newEntry = {
            id: 's' + Date.now(),
            tech: tech,
            partsLocation: partsLocation,
            confirmation: confirmation,
            confirmationDetails: {
                confirmedWith: confirmedWith,
                method: confirmationMethod,
                confirmedBy: window.currentUser?.name || 'Office',
                confirmedDate: confirmation === 'XX' ? new Date().toISOString().split('T')[0] : null
            },
            equipmentRental: equipmentRental,
            notes: notes,
            internalNotes: internalNotes
        };

        if (entryType === 'note') {
            newEntry.type = 'note';
            newEntry.school = '';
            newEntry.details = document.getElementById('entryNote').value;
        } else {
            newEntry.type = 'job';
            newEntry.school = document.getElementById('entrySchool').value;
            newEntry.details = document.getElementById('entryDescription').value;
        }

        if (!scheduleData[dateKey]) scheduleData[dateKey] = [];
        scheduleData[dateKey].push(newEntry);
        renderWeeklySchedule();
        closeAddEntryModal();
    }
}

async function addJobToSchedule(jobId) {
    document.getElementById('entryType').value = 'job';
    toggleEntryFields();
    // openAddEntryModal calls populateTechDropdowns which fetches draft jobs into cachedBacklogJobs
    await openAddEntryModal();

    const job = cachedBacklogJobs.find(j => j.id === parseInt(jobId));
    if (job) {
        document.getElementById('entryJobSelect').value = job.id;
        document.getElementById('entryPartsLocation').value =
            job.metadata?.partsTracking?.partsLocation || '';
    }
}

function addJobToDay(dateKey) {
    // Open modal pre-set for that day
    openAddEntryModal();
    // Would need to set the day dropdown based on dateKey
}

function publishSchedule() {
    if (confirm('Publish this schedule and move it to This Week view?')) {
        alert('Schedule published! (In production this would save and notify the team)');
        switchScheduleTab('thisWeek');
    }
}


// Truncate text helper
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ==========================================
// OFFICE JOBS VIEW (Tabbed: All | Backlog | This Week | Completed | Shit List)
// ==========================================

let officeJobsWeekOffset = 0;
let currentOfficeJobsTerritory = 'original';
let currentJobsTab = 'all';
let currentJobsTerritory = 'all'; // 'all', 'original', 'southern'

// Switch territory filter for all job tabs
function switchJobsTerritory(territory) {
    currentJobsTerritory = territory;

    // Update territory tab buttons
    ['all', 'original', 'southern'].forEach(t => {
        const btn = document.getElementById(`jobsTerritory${t.charAt(0).toUpperCase() + t.slice(1)}`);
        if (btn) btn.classList.toggle('active', t === territory);
    });

    // Reload current tab with new territory filter
    switchJobsTab(currentJobsTab);
}

// Helper: Determine territory from address state
function getJobTerritory(job) {
    const addr = job.address || '';
    const match = addr.match(/,\s*([A-Z]{2})\s+\d{5}/);
    if (match) {
        return ['TN', 'KY'].includes(match[1]) ? 'original' : 'southern';
    }
    return 'original'; // default
}

// Main entry point for Jobs view
function loadOfficeJobs() {
    // Load the current tab (default: all)
    switchJobsTab(currentJobsTab);
}

// Switch between jobs tabs
function switchJobsTab(tab) {
    currentJobsTab = tab;

    // Update tab buttons
    const tabs = ['all', 'backlog', 'thisWeek', 'completed', 'shitList'];
    tabs.forEach(t => {
        const btn = document.getElementById(`jobsTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
        const content = document.getElementById(`jobsContent${t.charAt(0).toUpperCase() + t.slice(1)}`);
        if (btn) btn.classList.toggle('active', t === tab);
        if (content) content.classList.toggle('hidden', t !== tab);
    });

    // Load content for the selected tab
    if (tab === 'thisWeek') {
        loadThisWeekJobs();
    } else if (tab === 'all') {
        loadJobsTabContent('all');
    } else if (tab === 'backlog') {
        loadJobsTabContent('backlog', 'draft');
    } else if (tab === 'completed') {
        loadJobsTabContent('completed', 'completed');
    } else if (tab === 'shitList') {
        loadJobsTabContent('shitList', 'unable_to_complete');
    }
}

// Search jobs (debounced)
let searchJobsTimeout;
function searchJobs() {
    clearTimeout(searchJobsTimeout);
    searchJobsTimeout = setTimeout(() => {
        switchJobsTab(currentJobsTab);
    }, 300);
}

// Load jobs for a specific tab from API
async function loadJobsTabContent(tabName, statusFilter = '') {
    const container = document.getElementById(`jobsList${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (!container) return;

    const searchTerm = document.getElementById('jobsSearchInput')?.value || '';

    container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">Loading...</div>';

    try {
        const data = await JobsAPI.list({
            q: searchTerm,
            status: statusFilter,
            limit: 100
        });

        const jobs = data.jobs || [];

        // Apply territory filter (client-side)
        let filteredJobs = jobs;
        if (currentJobsTerritory !== 'all') {
            filteredJobs = jobs.filter(job => getJobTerritory(job) === currentJobsTerritory);
        }

        if (filteredJobs.length === 0) {
            const emptyMessages = {
                all: 'No jobs found. Create a work order from an accepted estimate.',
                backlog: 'No jobs in backlog. All work orders are scheduled!',
                completed: 'No completed jobs yet.',
                shitList: 'No problem jobs. Everything is running smoothly!'
            };
            const territoryNote = currentJobsTerritory !== 'all' ? ` in ${currentJobsTerritory === 'original' ? 'Original (KY/TN)' : 'Southern (AL/FL)'} territory` : '';
            const message = searchTerm
                ? `No jobs matching "${searchTerm}"${territoryNote}`
                : (emptyMessages[tabName] || 'No jobs found') + territoryNote;
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #6c757d;">
                    <div style="font-size: 48px; margin-bottom: 16px;">${searchTerm ? '🔍' : (tabName === 'shitList' ? '🎉' : '📋')}</div>
                    <p>${message}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = renderJobsListHtml(filteredJobs);
    } catch (err) {
        console.error('Failed to load jobs:', err);
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #dc3545;">
                <div style="font-size: 32px; margin-bottom: 12px;">⚠️</div>
                <p>Failed to load jobs: ${err.message}</p>
                <button class="btn btn-outline" onclick="switchJobsTab('${tabName}')" style="margin-top: 12px;">Retry</button>
            </div>
        `;
    }
}

// Render jobs list HTML (reusable for all tabs)
function renderJobsListHtml(jobs) {
    let html = '<div style="display: flex; flex-direction: column; gap: 0;">';

    jobs.forEach(job => {
        const statusColor = JobsAPI.statusColors[job.status] || '#6c757d';
        const typeLabel = JobsAPI.jobTypeLabels[job.jobType] || job.jobType;
        const amount = job.qbEstimateTotal ? `$${parseFloat(job.qbEstimateTotal).toLocaleString()}` : '';

        // Format created date
        const createdDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '';

        html += `
            <div class="job-list-item" style="
                padding: 16px 20px;
                border-bottom: 1px solid #e9ecef;
                cursor: pointer;
                display: flex;
                align-items: flex-start;
                gap: 16px;
                transition: background 0.15s;
            " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
                        <span style="font-weight: 600; color: #007bff;">#${job.jobNumber}</span>
                        <span class="badge" style="background: ${statusColor}20; color: ${statusColor}; font-size: 11px; padding: 2px 8px;">
                            ${job.status.replace('_', ' ')}
                        </span>
                        <span class="badge" style="background: #e9ecef; color: #495057; font-size: 11px; padding: 2px 8px;">
                            ${typeLabel}
                        </span>
                    </div>
                    <div style="font-weight: 500; margin-bottom: 4px;">
                        ${job.customerName || 'No customer'}
                    </div>
                    <div style="font-size: 13px; color: #6c757d; margin-bottom: 8px;">
                        ${job.title || job.locationName || ''}
                    </div>
                    ${job.description ? `<div style="font-size: 13px; color: #495057; white-space: pre-wrap; max-height: 60px; overflow: hidden;">${job.description.substring(0, 150)}${job.description.length > 150 ? '...' : ''}</div>` : ''}
                </div>
                <div style="text-align: right; flex-shrink: 0; display: flex; flex-direction: column; gap: 8px; align-items: flex-end;">
                    ${amount ? `<div style="font-weight: 600; color: #28a745;">${amount}</div>` : ''}
                    ${job.scheduledDate ? `<div style="font-size: 12px; color: #6c757d;">📅 ${new Date(job.scheduledDate).toLocaleDateString()}</div>` : ''}
                    ${job.assignedTo ? `<div style="font-size: 12px; color: #6c757d;">👷 ${job.assignedTo}</div>` : ''}
                    <div style="font-size: 11px; color: #adb5bd;">Created ${createdDate}</div>
                    ${(job.status === 'draft' || job.status === 'unable_to_complete') ? `
                        <button class="btn btn-primary" onclick="event.stopPropagation(); addToPlanning(${job.id})" style="font-size: 12px; padding: 6px 12px; margin-top: 4px;">
                            Add to Planning
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

// Selected job for planning
let selectedPlanningJob = null;

// Add job to planning - navigate to Planning tab with job selected
async function addToPlanning(jobId) {
    try {
        // Fetch the full job data
        const data = await JobsAPI.get(jobId);
        selectedPlanningJob = data.job;

        // Navigate to Scheduling view
        showView('scheduling');

        // Switch to Planning tab
        setTimeout(() => {
            switchScheduleTab('planning');
        }, 100);
    } catch (err) {
        console.error('Failed to load job for planning:', err);
        alert('Failed to load job: ' + err.message);
    }
}

// Place selected job on a specific day
async function placeJobOnDay(dateKey) {
    if (!selectedPlanningJob) {
        alert('No job selected. Go to Jobs > Backlog and click "Add to Planning" on a job.');
        return;
    }

    const job = selectedPlanningJob;
    const metadata = job.metadata || {};

    // Pre-schedule check: unverified stock parts
    const unverifiedStock = (metadata.stockParts || []).filter(sp => !sp.verified);
    if (unverifiedStock.length > 0) {
        const stockList = unverifiedStock.map(sp =>
            `  - ${sp.itemName} (${sp.stockLocation})`
        ).join('\n');

        const proceed = confirm(
            `STOCK PARTS NOT VERIFIED\n\n` +
            `The following parts are listed as "from stock" but haven't been verified:\n\n` +
            `${stockList}\n\n` +
            `OK = Verify now and schedule\n` +
            `Cancel = Go back and verify first`
        );

        if (!proceed) return;

        // Mark as verified
        metadata.stockParts = metadata.stockParts.map(sp => ({
            ...sp,
            verified: true
        }));
        metadata.partsTracking = {
            ...(metadata.partsTracking || {}),
            stockVerified: true,
            stockVerifiedBy: currentRole === 'admin' ? 'Admin' : 'Office',
            stockVerifiedDate: new Date().toISOString()
        };
    }

    // Pre-schedule reminder: procurement notes
    const procNotes = metadata.procurementNotes || [];
    if (procNotes.length > 0) {
        const notesList = procNotes.map(n => `  - ${n.text}`).join('\n');
        alert(`Procurement Notes for this job:\n\n${notesList}`);
    }

    const tech = prompt(`Assign ${job.jobNumber} to which technician?\n\n(Leave blank to assign later)`);

    try {
        // Parse dateKey (YYYY-MM-DD format)
        const scheduledDate = new Date(dateKey + 'T12:00:00');

        await JobsAPI.update(job.id, {
            status: 'scheduled',
            scheduledDate: dateKey,
            assignedTo: tech || null,
            metadata: metadata
        });

        alert(`${job.jobNumber} scheduled for ${scheduledDate.toLocaleDateString()}${tech ? ' - Assigned to ' + tech : ''}`);

        // Clear selection and refresh
        selectedPlanningJob = null;
        renderPlanningSchedule();
    } catch (err) {
        console.error('Failed to schedule job:', err);
        alert('Failed to schedule job: ' + err.message);
    }
}

// Clear selected planning job
function clearPlanningSelection() {
    selectedPlanningJob = null;
    renderPlanningSchedule();
}

// Office jobs grid data (fetched from API)
let officeJobsGridData = {};

// Load This Week tab from API
async function loadThisWeekJobs() {
    officeJobsWeekOffset = 0;
    const label = document.getElementById('officeJobsWeekLabel');
    if (label) label.textContent = getWeekLabel(officeJobsWeekOffset);
    await loadOfficeJobsData();
    renderOfficeJobsGrid();
}

// Fetch office jobs data from API
async function loadOfficeJobsData() {
    const territory = currentOfficeJobsTerritory === 'original' ? 'Original' : 'Southern';
    const weekStart = getWeekStart(officeJobsWeekOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4);

    try {
        const data = await JobsAPI.list({
            territory: territory,
            scheduledDateGte: formatDateKey(weekStart),
            scheduledDateLte: formatDateKey(weekEnd),
            limit: 100
        });

        officeJobsGridData = {};
        (data.jobs || []).forEach(job => {
            const dateKey = job.scheduledDate ? job.scheduledDate.split('T')[0] : null;
            if (dateKey) {
                if (!officeJobsGridData[dateKey]) officeJobsGridData[dateKey] = [];
                officeJobsGridData[dateKey].push(apiJobToScheduleEntry(job));
            }
        });
    } catch (err) {
        console.error('Failed to load office jobs:', err);
        officeJobsGridData = {};
    }
}

function renderOfficeJobsGrid() {
    const container = document.getElementById('officeJobsGrid');
    const weekStart = getWeekStart(officeJobsWeekOffset);
    const activeData = officeJobsGridData;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    // Calculate week progress
    let totalJobs = 0;
    let completedJobs = 0;
    let checkedInJobs = 0;
    let enRouteJobs = 0;

    for (let i = 0; i < 5; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);
        const dateKey = formatDateKey(dayDate);
        const dayJobs = activeData[dateKey] || [];
        const actualJobs = dayJobs.filter(j => j.type === 'job');
        totalJobs += actualJobs.length;
        completedJobs += actualJobs.filter(j => j.status === 'complete').length;
        checkedInJobs += actualJobs.filter(j => j.status === 'checked_in').length;
        enRouteJobs += actualJobs.filter(j => j.status === 'en_route').length;
    }

    let html = '';

    // Add progress indicator
    if (totalJobs > 0) {
        const progressPercent = Math.round((completedJobs / totalJobs) * 100);
        html += `
            <div class="stats-grid" style="margin-bottom: 20px;">
                <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <div class="stat-value">${completedJobs} / ${totalJobs}</div>
                    <div class="stat-label" style="color: rgba(255,255,255,0.9);">Jobs Completed (${progressPercent}%)</div>
                </div>
                <div class="stat-card blue">
                    <div class="stat-value">${checkedInJobs}</div>
                    <div class="stat-label">In Progress</div>
                </div>
                <div class="stat-card" style="background: #e3f2fd; color: #0066cc;">
                    <div class="stat-value">${enRouteJobs}</div>
                    <div class="stat-label">En Route</div>
                </div>
            </div>
        `;
    }

    for (let i = 0; i < 5; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);
        const dateKey = formatDateKey(dayDate);
        const isToday = dayDate.getTime() === today.getTime();
        const dayJobs = activeData[dateKey] || [];

        if (dayJobs.length === 0) continue; // Skip empty days

        html += `
            <div class="schedule-day">
                <div class="schedule-day-header ${isToday ? 'today' : ''}">
                    <span>${days[i]} ${dayDate.getMonth() + 1}/${dayDate.getDate()}</span>
                    <span style="font-size: 12px; opacity: 0.8;">${dayJobs.length} ${dayJobs.length === 1 ? 'job' : 'jobs'}</span>
                </div>
                <div class="schedule-day-jobs">
        `;

        dayJobs.forEach(job => {
            const isNote = job.type === 'note';
            const isContinued = job.type === 'continued';
            const isPink = job.isPink === true;

            if (isNote) {
                html += `
                    <div style="padding: 12px 16px; background: #fffde7; display: flex; align-items: center; gap: 8px;">
                        <span style="color: #f9a825;">📌</span>
                        <span style="color: #6c757d;">${job.details}</span>
                        ${job.tech ? `<span style="margin-left: auto; font-size: 12px; color: #6c757d;">${job.tech}</span>` : ''}
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

                const cardStyle = isPink ? 'background: #fff0f0; border-left: 3px solid #c62828;' : isContinued ? 'background: #f0f7ff; border-left: 3px solid #1565c0;' : '';
                html += `
                    <div style="padding: 16px; border-bottom: 1px solid #f0f0f0; ${cardStyle} ${status === 'complete' ? 'opacity: 0.7;' : ''}">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                            <div style="font-weight: 600; font-size: 15px;">${job.school}</div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <span class="badge" style="background: ${statusStyle.bg}; color: ${statusStyle.color};">${statusStyle.label}</span>
                                ${job.tech ? `<span style="font-size: 12px; color: #495057; background: #e9ecef; padding: 4px 8px; border-radius: 4px; white-space: nowrap;">${job.tech}</span>` : ''}
                            </div>
                        </div>
                        <div style="color: #495057; font-size: 14px; line-height: 1.5; margin-bottom: 8px;">
                            ${isContinued ? '<em style="color: #1565c0;">Continued from previous day</em>' : job.details}
                        </div>
                        ${job.partsLocation ? `<div style="color: #e65100; font-size: 13px; margin-bottom: 4px;"><strong>Parts:</strong> ${job.partsLocation}</div>` : ''}
                        ${job.notes ? `<div style="color: #6c757d; font-size: 12px; margin-bottom: 4px;">${job.notes}</div>` : ''}
                        ${job.internalNotes ? `<div style="background: #e8f5e9; border-left: 3px solid #4CAF50; padding: 8px; margin-bottom: 4px; border-radius: 3px;">
                            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                                <span style="font-size: 10px; font-weight: 700; color: #2e7d32; text-transform: uppercase; letter-spacing: 0.5px;">🔒 Internal Notes</span>
                            </div>
                            <div style="color: #1b5e20; font-size: 12px;">${job.internalNotes}</div>
                        </div>` : ''}
                        ${timestampHtml}
                        ${isPink ? '<span class="badge" style="margin-top: 8px; background: #ffe0e6; color: #c62828;">Pink Job</span>' : ''}
                        ${job.confirmation === 'XX' ? '<span class="badge badge-success" style="margin-top: 8px;">Confirmed</span>' : job.confirmation === 'X' ? '<span class="badge badge-warning" style="margin-top: 8px;">Confirmation Pending</span>' : ''}
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
                    <p>No jobs scheduled for this week.</p>
                    <button class="btn btn-primary" style="margin-top: 16px;" onclick="showView('officeCreate')">+ Create Job</button>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

async function switchOfficeJobsTerritory(territory) {
    currentOfficeJobsTerritory = territory;
    document.getElementById('officeJobsOriginalTab').classList.toggle('active', territory === 'original');
    document.getElementById('officeJobsSouthernTab').classList.toggle('active', territory === 'southern');
    await loadOfficeJobsData();
    renderOfficeJobsGrid();
}

async function prevOfficeJobsWeek() {
    officeJobsWeekOffset--;
    const label = document.getElementById('officeJobsWeekLabel');
    label.textContent = getWeekLabel(officeJobsWeekOffset);
    await loadOfficeJobsData();
    renderOfficeJobsGrid();
}

async function nextOfficeJobsWeek() {
    officeJobsWeekOffset++;
    const label = document.getElementById('officeJobsWeekLabel');
    label.textContent = getWeekLabel(officeJobsWeekOffset);
    await loadOfficeJobsData();
    renderOfficeJobsGrid();
}

// ==========================================
// JOBS LIST (API-BACKED)
// ==========================================

let jobsListData = [];
let jobsListOffset = 0;
const JOBS_PAGE_SIZE = 25;

// Load jobs from API
async function loadJobsList() {
    const container = document.getElementById('jobsList');
    const countEl = document.getElementById('jobsCount');

    try {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">Loading jobs...</div>';

        const status = document.getElementById('jobsStatusFilter')?.value || '';
        const jobType = document.getElementById('jobsTypeFilter')?.value || '';
        const search = document.getElementById('jobsSearchInput')?.value || '';

        jobsListOffset = 0;
        const data = await JobsAPI.list({
            q: search,
            status: status,
            jobType: jobType,
            limit: JOBS_PAGE_SIZE,
            offset: 0
        });

        jobsListData = data.jobs || [];
        countEl.textContent = `${data.count} jobs`;

        renderJobsList();

        // Show/hide load more
        document.getElementById('jobsLoadMore').style.display =
            data.count >= JOBS_PAGE_SIZE ? 'block' : 'none';

    } catch (err) {
        console.error('Failed to load jobs:', err);
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #dc3545;">
                <div style="font-size: 32px; margin-bottom: 12px;">⚠️</div>
                <p>Failed to load jobs: ${err.message}</p>
                <button class="btn btn-outline" onclick="loadJobsList()" style="margin-top: 12px;">Retry</button>
            </div>
        `;
    }
}

// Load more jobs (pagination)
async function loadMoreJobs() {
    try {
        const status = document.getElementById('jobsStatusFilter')?.value || '';
        const jobType = document.getElementById('jobsTypeFilter')?.value || '';
        const search = document.getElementById('jobsSearchInput')?.value || '';

        jobsListOffset += JOBS_PAGE_SIZE;

        const data = await JobsAPI.list({
            q: search,
            status: status,
            jobType: jobType,
            limit: JOBS_PAGE_SIZE,
            offset: jobsListOffset
        });

        jobsListData = [...jobsListData, ...(data.jobs || [])];
        renderJobsList();

        // Hide load more if no more results
        if (data.count < JOBS_PAGE_SIZE) {
            document.getElementById('jobsLoadMore').style.display = 'none';
        }
    } catch (err) {
        console.error('Failed to load more jobs:', err);
        alert('Failed to load more jobs: ' + err.message);
    }
}

// Filter jobs (debounced)
let filterJobsTimeout;
function filterJobsList() {
    clearTimeout(filterJobsTimeout);
    filterJobsTimeout = setTimeout(() => {
        loadJobsList();
    }, 300);
}

// Render jobs list
function renderJobsList() {
    const container = document.getElementById('jobsList');

    if (!jobsListData || jobsListData.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #6c757d;">
                <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                <p>No jobs found</p>
                <button class="btn btn-outline" onclick="showQbSyncModal()" style="margin-top: 12px;">Import from QuickBooks</button>
            </div>
        `;
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 0;">';

    jobsListData.forEach(job => {
        const statusColor = JobsAPI.statusColors[job.status] || '#6c757d';
        const typeLabel = JobsAPI.jobTypeLabels[job.jobType] || job.jobType;
        const amount = job.qbEstimateTotal ? `$${parseFloat(job.qbEstimateTotal).toLocaleString()}` : '';

        html += `
            <div class="job-list-item" onclick="openJobDetail(${job.id})" style="
                padding: 16px 20px;
                border-bottom: 1px solid #e9ecef;
                cursor: pointer;
                display: flex;
                align-items: flex-start;
                gap: 16px;
                transition: background 0.15s;
            " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="font-weight: 600; color: #007bff;">#${job.jobNumber}</span>
                        <span class="badge" style="background: ${statusColor}20; color: ${statusColor}; font-size: 11px; padding: 2px 8px;">
                            ${job.status.replace('_', ' ')}
                        </span>
                        <span class="badge" style="background: #e9ecef; color: #495057; font-size: 11px; padding: 2px 8px;">
                            ${typeLabel}
                        </span>
                    </div>
                    <div style="font-weight: 500; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${job.customerName || 'No customer'}
                    </div>
                    <div style="font-size: 13px; color: #6c757d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${job.locationName || job.address || ''}
                    </div>
                    ${renderStockPartWarning(job.metadata)}
                </div>
                <div style="text-align: right; flex-shrink: 0;">
                    ${amount ? `<div style="font-weight: 600; color: #28a745;">${amount}</div>` : ''}
                    ${job.scheduledDate ? `<div style="font-size: 12px; color: #6c757d;">📅 ${new Date(job.scheduledDate).toLocaleDateString()}</div>` : ''}
                    ${job.assignedTo ? `<div style="font-size: 12px; color: #6c757d;">👷 ${job.assignedTo}</div>` : ''}
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Open job detail
async function openJobDetail(jobId) {
    try {
        const data = await JobsAPI.get(jobId);
        const job = data.job;

        // Store for editing
        window.currentApiJob = job;

        // Show in a modal or navigate to detail view
        showJobDetailModal(job);
    } catch (err) {
        console.error('Failed to load job:', err);
        alert('Failed to load job details: ' + err.message);
    }
}

// Show job detail modal
function showJobDetailModal(job) {
    const statusColor = JobsAPI.statusColors[job.status] || '#6c757d';
    const typeLabel = JobsAPI.jobTypeLabels[job.jobType] || job.jobType;

    // Create modal HTML
    const modalHtml = `
        <div id="jobDetailModal" class="modal-backdrop" onclick="if(event.target===this)closeJobDetailModal()">
            <div class="modal" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <div>
                        <h2 style="margin: 0;">Job #${job.jobNumber}</h2>
                        <div style="margin-top: 8px; display: flex; gap: 8px;">
                            <span class="badge" style="background: ${statusColor}20; color: ${statusColor};">${job.status.replace('_', ' ')}</span>
                            <span class="badge" style="background: #e9ecef; color: #495057;">${typeLabel}</span>
                        </div>
                    </div>
                    <button onclick="closeJobDetailModal()" style="background:none;border:none;font-size:24px;cursor:pointer;">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <label style="font-size: 12px; color: #6c757d; text-transform: uppercase;">Customer</label>
                            <p style="margin: 4px 0; font-weight: 500;">${job.customerName || '-'}</p>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #6c757d; text-transform: uppercase;">Location</label>
                            <p style="margin: 4px 0;">${job.locationName || '-'}</p>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #6c757d; text-transform: uppercase;">Address</label>
                            <p style="margin: 4px 0;">${job.address || '-'}</p>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #6c757d; text-transform: uppercase;">Contact</label>
                            <p style="margin: 4px 0;">${job.contactEmail || '-'}</p>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #6c757d; text-transform: uppercase;">Estimate Total</label>
                            <p style="margin: 4px 0; font-weight: 600; color: #28a745;">${job.qbEstimateTotal ? '$' + parseFloat(job.qbEstimateTotal).toLocaleString() : '-'}</p>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #6c757d; text-transform: uppercase;">Scheduled Date</label>
                            <p style="margin: 4px 0;">${job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'Not scheduled'}</p>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #6c757d; text-transform: uppercase;">Assigned To</label>
                            <p style="margin: 4px 0;">${job.assignedTo || 'Unassigned'}</p>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #6c757d; text-transform: uppercase;">QB Synced</label>
                            <p style="margin: 4px 0;">${job.qbSyncedAt ? new Date(job.qbSyncedAt).toLocaleString() : '-'}</p>
                        </div>
                    </div>

                    ${job.description ? `
                        <div style="margin-bottom: 20px;">
                            <label style="font-size: 12px; color: #6c757d; text-transform: uppercase;">Work Instructions</label>
                            <div style="margin-top: 8px; padding: 12px; background: #f8f9fa; border-radius: 8px; font-size: 13px; white-space: pre-wrap; max-height: 200px; overflow-y: auto;">${job.description}</div>
                        </div>
                    ` : ''}

                    <!-- Parts Tracking Section -->
                    <div style="margin-bottom: 20px; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
                        <div style="background: #f8f9fa; padding: 12px 16px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
                            <label style="font-size: 12px; color: #6c757d; text-transform: uppercase; margin: 0;">Parts Tracking</label>
                            <button class="btn btn-outline" onclick="editPartsTracking(${job.id})" style="font-size: 11px; padding: 4px 8px;">Edit</button>
                        </div>
                        <div style="padding: 16px;">
                            ${renderPartsTrackingFields(job.metadata?.partsTracking || {})}
                        </div>
                    </div>

                    ${renderProcurementNotesSection(job.metadata)}
                    ${renderStockPartsSection(job.metadata)}

                    ${job.attachments && job.attachments.length > 0 ? `
                        <div style="margin-bottom: 20px;">
                            <label style="font-size: 12px; color: #6c757d; text-transform: uppercase;">Attachments (${job.attachments.length})</label>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
                                ${job.attachments.map(a => `
                                    <a href="${a.blobUrl}" target="_blank" style="display: block; width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 1px solid #dee2e6;">
                                        ${a.contentType?.startsWith('image/')
                                            ? `<img src="${a.blobUrl}" style="width: 100%; height: 100%; object-fit: cover;">`
                                            : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f8f9fa;">📄</div>`
                                        }
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${job.inspectionBanks && job.inspectionBanks.length > 0 ? `
                        <div>
                            <label style="font-size: 12px; color: #6c757d; text-transform: uppercase;">Inspection Banks (${job.inspectionBanks.length})</label>
                            <div style="margin-top: 8px;">
                                ${job.inspectionBanks.map(bank => `
                                    <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px;">
                                        <div style="font-weight: 500;">${bank.bankName}</div>
                                        <div style="font-size: 13px; color: #6c757d;">${bank.bleacherType || ''} • ${bank.status}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeJobDetailModal()">Close</button>
                    <button class="btn btn-primary" onclick="editJob(${job.id})">Edit Job</button>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existing = document.getElementById('jobDetailModal');
    if (existing) existing.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeJobDetailModal() {
    const modal = document.getElementById('jobDetailModal');
    if (modal) modal.remove();
}

// Edit job (placeholder - can expand later)
function editJob(jobId) {
    alert('Edit functionality coming soon. Job ID: ' + jobId);
}

// Render stock part warning badge in jobs list
function renderStockPartWarning(metadata) {
    if (!metadata?.stockParts || metadata.stockParts.length === 0) return '';
    const unverified = metadata.stockParts.filter(sp => !sp.verified);
    if (unverified.length === 0) return '';

    return `
        <div class="stock-unverified-warning" style="margin-top: 6px;">
            <strong>Stock Parts Need Verification:</strong>
            ${unverified.map(sp => `${sp.itemName || 'Part'} (${sp.stockLocation})`).join(', ')}
        </div>
    `;
}

// Render procurement notes section in job detail
function renderProcurementNotesSection(metadata) {
    const notes = metadata?.procurementNotes || [];
    if (notes.length === 0) return '';

    return `
        <div style="margin-bottom: 20px; border: 1px solid #fff3e0; border-radius: 8px; overflow: hidden;">
            <div style="background: #fff3e0; padding: 12px 16px; border-bottom: 1px solid #ffe0b2;">
                <label style="font-size: 12px; color: #e65100; text-transform: uppercase; margin: 0; font-weight: 600;">Procurement Notes (from Estimate)</label>
            </div>
            <div style="padding: 12px 16px;">
                ${notes.map(n => `
                    <div style="padding: 6px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px;">
                        ${n.text}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Render stock parts section in job detail
function renderStockPartsSection(metadata) {
    const stockParts = metadata?.stockParts || [];
    if (stockParts.length === 0) return '';

    const isVerified = metadata?.partsTracking?.stockVerified;
    const borderColor = isVerified ? '#c8e6c9' : '#ffcdd2';
    const headerBg = isVerified ? '#e8f5e9' : '#fff0f0';
    const headerColor = isVerified ? '#2e7d32' : '#c62828';
    const verifiedBy = metadata?.partsTracking?.stockVerifiedBy;
    const verifiedDate = metadata?.partsTracking?.stockVerifiedDate;

    return `
        <div style="margin-bottom: 20px; border: 1px solid ${borderColor}; border-radius: 8px; overflow: hidden;">
            <div style="background: ${headerBg}; padding: 12px 16px;">
                <label style="font-size: 12px; color: ${headerColor}; text-transform: uppercase; font-weight: 600;">
                    Stock Parts ${isVerified ? '(Verified)' : '(NOT VERIFIED)'}
                </label>
                ${isVerified && verifiedBy ? `<span style="font-size: 11px; color: #6c757d; margin-left: 8px;">by ${verifiedBy}${verifiedDate ? ' on ' + new Date(verifiedDate).toLocaleDateString() : ''}</span>` : ''}
            </div>
            <div style="padding: 12px 16px;">
                ${stockParts.map(sp => `
                    <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px;">
                        <span>${sp.itemName || 'Part'} ${sp.quantity ? '(qty: ' + sp.quantity + ')' : ''}</span>
                        <span style="color: #e65100; font-weight: 500;">${sp.stockLocation}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Render parts tracking fields
function renderPartsTrackingFields(partsData) {
    const fields = [
        { key: 'partsOrdered', label: 'Parts Ordered', type: 'boolean' },
        { key: 'poNumber', label: 'Our PO #', type: 'text' },
        { key: 'promiseDate', label: 'Promise/Ship Date', type: 'date' },
        { key: 'destination', label: 'Destination', type: 'text' },
        { key: 'partsReceived', label: 'Parts Received', type: 'boolean' },
        { key: 'partsLocation', label: 'Parts Location', type: 'text' },
        { key: 'stockVerified', label: 'Stock Verified', type: 'boolean' },
        { key: 'stockVerifiedBy', label: 'Verified By', type: 'text' }
    ];

    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            ${fields.map(f => {
                const value = partsData[f.key];
                let displayValue = '-';

                if (f.type === 'boolean') {
                    displayValue = value ? '<span style="color: #28a745;">Yes</span>' : '<span style="color: #6c757d;">No</span>';
                } else if (f.type === 'date' && value) {
                    displayValue = new Date(value).toLocaleDateString();
                } else if (value) {
                    displayValue = value;
                }

                return `
                    <div>
                        <label style="font-size: 11px; color: #6c757d; text-transform: uppercase;">${f.label}</label>
                        <p style="margin: 2px 0; font-size: 14px;">${displayValue}</p>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Edit parts tracking
async function editPartsTracking(jobId) {
    const job = window.currentApiJob;
    if (!job) return;

    const partsData = job.metadata?.partsTracking || {};

    // Simple prompt-based editing for now
    const poNumber = prompt('Our PO #:', partsData.poNumber || '');
    if (poNumber === null) return;

    const promiseDate = prompt('Promise/Ship Date (MM/DD/YYYY):', partsData.promiseDate ? new Date(partsData.promiseDate).toLocaleDateString() : '');
    const destination = prompt('Destination:', partsData.destination || '');
    const partsLocation = prompt('Parts Location:', partsData.partsLocation || '');
    const partsOrdered = confirm('Have parts been ordered?');
    const partsReceived = confirm('Have parts been received?');

    // Stock verification prompt (only if job has stock parts)
    const hasStockParts = (job.metadata?.stockParts || []).length > 0;
    let stockVerified = partsData.stockVerified || false;
    let stockVerifiedBy = partsData.stockVerifiedBy || '';
    let stockVerifiedDate = partsData.stockVerifiedDate || null;
    if (hasStockParts) {
        stockVerified = confirm('Have stock parts been verified as available at the shop?');
        if (stockVerified) {
            stockVerifiedBy = currentRole === 'admin' ? 'Admin' : 'Office';
            stockVerifiedDate = new Date().toISOString();
        }
    }

    try {
        const updatedMetadata = {
            ...job.metadata,
            partsTracking: {
                partsOrdered,
                poNumber,
                promiseDate: promiseDate ? new Date(promiseDate).toISOString() : null,
                destination,
                partsReceived,
                partsLocation,
                stockVerified,
                stockVerifiedBy,
                stockVerifiedDate
            }
        };

        await JobsAPI.update(jobId, { metadata: updatedMetadata });
        alert('Parts tracking updated!');

        // Refresh the modal
        closeJobDetailModal();
        openJobDetail(jobId);
    } catch (err) {
        console.error('Failed to update parts tracking:', err);
        alert('Failed to update: ' + err.message);
    }
}

// ==========================================
// QB SYNC MODAL
// ==========================================

let qbSyncPreviewData = null;

async function showQbSyncModal() {
    const modal = document.getElementById('qbSyncModal');
    const body = document.getElementById('qbSyncModalBody');
    const footer = document.getElementById('qbSyncModalFooter');

    modal.classList.remove('hidden');
    footer.style.display = 'none';
    body.innerHTML = '<p style="text-align: center; padding: 20px;">Checking for new estimates...</p>';

    try {
        const data = await JobsAPI.syncPreview(100);
        qbSyncPreviewData = data;

        if (data.available.length === 0) {
            body.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
                    <p style="font-weight: 500;">All caught up!</p>
                    <p style="color: #6c757d;">No new QuickBooks estimates to import.</p>
                    <p style="color: #6c757d; font-size: 13px; margin-top: 12px;">
                        ${data.alreadySynced.length} estimates already synced
                    </p>
                </div>
            `;
            footer.style.display = 'none';
        } else {
            body.innerHTML = `
                <div style="margin-bottom: 16px;">
                    <p style="font-weight: 500; margin-bottom: 8px;">
                        ${data.available.length} new estimates ready to import
                    </p>
                    <p style="color: #6c757d; font-size: 13px;">
                        ${data.alreadySynced.length} already synced
                    </p>
                </div>
                <div style="max-height: 300px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 8px;">
                    ${data.available.slice(0, 20).map(e => `
                        <div style="padding: 12px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between;">
                            <div>
                                <span style="font-weight: 500;">#${e.docNumber}</span>
                                <span style="color: #6c757d; margin-left: 8px;">${e.customerName}</span>
                            </div>
                            <span style="color: #28a745; font-weight: 500;">$${e.totalAmount?.toLocaleString() || 0}</span>
                        </div>
                    `).join('')}
                    ${data.available.length > 20 ? `
                        <div style="padding: 12px; text-align: center; color: #6c757d; font-size: 13px;">
                            + ${data.available.length - 20} more...
                        </div>
                    ` : ''}
                </div>
            `;
            footer.style.display = 'flex';
            document.getElementById('qbSyncConfirmBtn').textContent = `Import ${data.available.length} Estimates`;
        }
    } catch (err) {
        console.error('Sync preview failed:', err);
        body.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #dc3545;">
                <div style="font-size: 32px; margin-bottom: 12px;">⚠️</div>
                <p>Failed to check QuickBooks: ${err.message}</p>
            </div>
        `;
    }
}

function closeQbSyncModal() {
    document.getElementById('qbSyncModal').classList.add('hidden');
}

async function runQbSync() {
    const body = document.getElementById('qbSyncModalBody');
    const footer = document.getElementById('qbSyncModalFooter');
    const btn = document.getElementById('qbSyncConfirmBtn');

    btn.disabled = true;
    btn.textContent = 'Importing...';

    try {
        const result = await JobsAPI.syncImport({ all: true });

        body.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
                <p style="font-weight: 500; font-size: 18px;">Import Complete!</p>
                <p style="color: #28a745; font-size: 24px; font-weight: 600; margin: 12px 0;">
                    ${result.imported?.length || 0} jobs imported
                </p>
                ${result.skipped?.length ? `<p style="color: #6c757d; font-size: 13px;">${result.skipped.length} skipped (already synced)</p>` : ''}
                ${result.errors?.length ? `<p style="color: #dc3545; font-size: 13px;">${result.errors.length} errors</p>` : ''}
            </div>
        `;
        footer.style.display = 'none';

        // Reload jobs list
        setTimeout(() => {
            closeQbSyncModal();
            loadJobsList();
        }, 2000);

    } catch (err) {
        console.error('Sync failed:', err);
        body.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #dc3545;">
                <div style="font-size: 32px; margin-bottom: 12px;">❌</div>
                <p>Import failed: ${err.message}</p>
            </div>
        `;
        btn.disabled = false;
        btn.textContent = 'Retry';
    }
}

