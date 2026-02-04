// ==========================================
// MY JOBS & TEAM SCHEDULE
// Field staff personal schedule and team view
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
    // For demo, show Danny's jobs from the sample data
    const currentTech = 'Danny';
    const weekStart = getWeekStart(myJobsWeekOffset);
    const container = document.getElementById('myJobsWeekGrid');
    const allData = scheduleDataOriginal;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = '';

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
                html += `
                    <div style="padding: 16px; border-bottom: 1px solid #f0f0f0; ${isContinued ? 'background: #f0f7ff;' : ''}">
                        <div style="font-weight: 600; font-size: 15px; margin-bottom: 6px;">${job.school}</div>
                        <div style="color: #495057; font-size: 14px; line-height: 1.5; margin-bottom: 8px;">
                            ${isContinued ? '<em>Continued from previous day</em>' : job.details}
                        </div>
                        ${job.partsLocation ? `<div style="color: #e65100; font-size: 13px; margin-bottom: 4px;"><strong>Parts:</strong> ${job.partsLocation}</div>` : ''}
                        ${job.notes ? `<div style="color: #6c757d; font-size: 12px;">${job.notes}</div>` : ''}
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
    html += '<thead><tr><th class="col-school">School / Location</th><th>Job Details</th><th class="col-tech">Tech(s)</th><th class="col-parts">Parts</th></tr></thead>';
    html += '<tbody>';

    for (let i = 0; i < 5; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);
        const dateKey = formatDateKey(dayDate);
        const isToday = dayDate.getTime() === today.getTime();
        const dayJobs = activeData[dateKey] || [];
        const dayLabel = days[i] + ' ' + (dayDate.getMonth() + 1) + '/' + dayDate.getDate();

        html += '<tr class="schedule-day-row ' + (isToday ? 'schedule-today-row' : '') + '">';
        html += '<td colspan="4">' + dayLabel + '</td>';
        html += '</tr>';

        if (dayJobs.length === 0) {
            if (i === 4) {
                html += '<tr><td colspan="4" style="padding: 14px; text-align: center; color: #adb5bd; font-style: italic;">Floating day</td></tr>';
            } else {
                html += '<tr><td colspan="4" style="padding: 14px; text-align: center; color: #adb5bd;">No jobs scheduled</td></tr>';
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
                    html += '<td colspan="4">' + formattedDetails + (job.tech ? ' &mdash; ' + job.tech : '') + '</td>';
                    html += '</tr>';
                } else {
                    var rowClass = '';
                    if (isPink) rowClass = 'schedule-pink-row';
                    else if (isContinued) rowClass = 'schedule-continued-row';

                    html += '<tr class="' + rowClass + '">';
                    html += '<td style="font-weight: 600;">' + job.school + '</td>';
                    html += '<td>' + (isContinued ? '<em style="color: #1565c0;">Continued</em>' : formattedDetails) + '</td>';
                    html += '<td>' + (job.tech || '') + '</td>';
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

