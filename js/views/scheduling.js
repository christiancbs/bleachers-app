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

// Schedule data per territory
let scheduleDataOriginal = {};
let scheduleDataSouthern = {};

// Active schedule data reference (points to current territory)
let scheduleData = {};

// ==========================================
// SAMPLE DATA INITIALIZATION
// Week of Feb 3, 2025 - Original & Southern territories
// ==========================================

// Initialize with sample data from the Excel trackers
function initializeSampleScheduleData() {
    // Week of Feb 3, 2025 - ORIGINAL TERRITORY (KY/TN)
    scheduleDataOriginal = {
        '2025-02-03': [
            {
                id: 's1', type: 'job',
                school: 'Montgomery Co HS, KY',
                details: 'FACING: Labor to install seat back hardware and a RH end cap FACING UPPER: Labor to install LH and RH end caps BEHIND: Labor to replace a LH tier catch BEHIND UPPER: Labor to install aisle step hardware and clean/prep/install safety tape END: Labor to install aisle step hardware and skirt board bracket hardware. FOOTBALL HOME: Labor to install curved bullnose. BASEBALL: Labor to install riser board hardware SOCCER: Labor to replace an end cap',
                tech: 'Sam (overnight)',
                partsLocation: 'Sams Truck',
                isPink: false,
                status: 'complete',
                completedAt: '2025-02-03T14:30:00'
            },
            {
                id: 's1a', type: 'job',
                school: 'Ripley High School, Lauderdale Co, TN',
                details: 'Install safety strap on Goal 5. Lift rental required - 40\' lift will be on site.',
                tech: 'Field Tech',
                partsLocation: 'TN Shop',
                specialInstructions: 'Customer will have gym cleared by 8am. Enter through back door - front office doesn\'t open until 9.',
                confirmation: 'XX',
                isPink: false,
                status: 'complete',
                completedAt: '2025-02-03T11:15:00'
            },
            {
                id: 's1b', type: 'job',
                school: 'Wilson Central High School, Wilson Co, TN',
                details: 'Replace deck boards (6), install end caps, replace skirt board hardware',
                tech: 'Field Tech',
                partsLocation: 'TN Shop',
                isPink: false,
                status: 'scheduled'
            },
            {
                id: 's2', type: 'job',
                school: 'Menifee Co, KY',
                details: 'Indoor Bleacher Inspections: Menifee Central K-8 and Menifee HS',
                tech: 'Sam (overnight)',
                partsLocation: '',
                isPink: false,
                status: 'scheduled'
            },
            {
                id: 's3', type: 'job',
                school: 'Fairview ES, Blount Co, TN',
                details: 'Labor to raise wall buck to new height, march bleachers back and attach bleacher to wall. Reinstall seats if removed',
                tech: 'Troy & Alex M (overnight)',
                partsLocation: 'UPS: 1Z66W7040311645722 estimated delivery 2/2 end of day - shipping to school',
                confirmation: 'X',
                isPink: false,
                status: 'checked_in',
                checkedInAt: '2025-02-03T08:45:00'
            },
            {
                id: 's4', type: 'job',
                school: 'Motlow State Community College - Tullahoma Campus, TN',
                details: 'FACING UPPER: Labor to install step end caps',
                tech: 'Chris & Owen (overnight)',
                partsLocation: 'TN Shop- pick up 1/30',
                isPink: false,
                status: 'en_route'
            },
            {
                id: 's5', type: 'job',
                school: 'East MS, Tullahoma City, TN',
                details: 'Labor to replace 4 damaged seats *Customer provided seats*',
                tech: 'Chris & Owen (overnight)',
                partsLocation: 'School',
                isPink: false,
                status: 'scheduled'
            },
            {
                id: 's6', type: 'job',
                school: 'Tullahoma HS, Tullahoma, TN',
                details: 'Go-see, possible bleacher warranty issue, school contact is John Olive (AD)',
                tech: 'Chris & Owen (overnight)',
                partsLocation: '',
                isPink: false
            },
            {
                id: 's7', type: 'job',
                school: 'Forrest HS, Marshall Co, TN',
                details: 'LOWER FACING: Labor to replace a gear motor',
                tech: 'Chris & Owen (overnight)',
                partsLocation: 'TN Shop- pick up 1/30',
                isPink: false
            },
            {
                id: 's8', type: 'note',
                school: '',
                details: 'Stop at shop to pick up parts',
                tech: 'Alex W & Michael (overnight)',
                partsLocation: '',
                isPink: false
            },
            {
                id: 's9', type: 'job',
                school: 'Ravenwood HS, Williamson Co, TN',
                details: '*Grab leftover NRS parts for Centennial HS* FACING: Labor to replace deck stabilizers and casterhorn guides, clean/prep/install safety tape, secure loose anchors, and slide deck boards into place BEHIND: Labor to install tier catch and replace a flex row rod assembly AUX: Labor to install seats, skirt board hardware, install concrete anchors in wall buck, clean/prep/install safety tape, install seat end caps, secure outrigger hardware (2), and secure skirt panel bracket hardware FOOTBALL HOME: Labor to install seat boards, splices, footboards, fence ties, end caps, clip sets, stair handrail hardware, realign and secure aisle steps (16), and reattach front surround pipe FOOTBALL VISITOR: Labor to install fence ties, splices, seat boards, end caps, clip sets, fence support hardware, install pipe straps, and secure a footboard BASEBALL HOME: Labor to secure handrail hardware, clip sets and secure seat hardware (2) BASKETBALL 3rd: Labor to install end caps and fence ties SOCCER: Labor to straighten rear surround pipe spindles (2) SOFTBALL 1st: Labor to adjust footboard clips',
                tech: 'Alex W & Michael (overnight)',
                partsLocation: 'TN Shop/ School',
                isPink: false
            },
            {
                id: 's10', type: 'job',
                school: 'Dyersburg State Community College, Dyersburg, TN',
                details: 'FACING LEFT: Labor to adjust motor tension FACING RIGHT: Labor to install floor step feet BEHIND LEFT: Labor to install floor mount hardware and replace L brackets BEHIND RIGHT: Labor to install floor mount hardware and skirt board hardware, and replace L brackets',
                tech: 'Floyd (overnight)',
                partsLocation: 'TN Shop- Ship to Floyd UPS: 1Z66W7040304500696',
                isPink: false
            },
            {
                id: 's11', type: 'note',
                school: '',
                details: 'Blake & Seth to Southern Territory',
                tech: '',
                partsLocation: '',
                isPink: false
            }
        ],
        '2025-02-04': [
            {
                id: 's11a', type: 'job',
                school: 'Franklin High School, Williamson Co, TN',
                details: 'Annual bleacher inspection - Main Gym and Auxiliary Gym',
                tech: 'Field Tech',
                partsLocation: '',
                isPink: false,
                status: 'checked_in',
                checkedInAt: '2025-02-04T08:30:00'
            },
            {
                id: 's11b', type: 'job',
                school: 'Brentwood High School, Williamson Co, TN',
                details: 'Replace 2 gear motors, install safety tape on all aisles',
                tech: 'Field Tech',
                partsLocation: 'TN Shop',
                specialInstructions: 'School in session. Work during gym class break 1:30-3:00 PM only. Check in with front office first.',
                isPink: false,
                status: 'en_route'
            },
            {
                id: 's12', type: 'job',
                school: 'EKU, Richmond, KY',
                details: 'Additional measurements needed for end rails, call Lisa for details + Pick up seats that Alex W left at the school and bring back to TN Shop',
                tech: 'Sam (overnight)',
                partsLocation: '',
                isPink: false,
                status: 'scheduled'
            },
            {
                id: 's13', type: 'job',
                school: 'Fentress Co, TN',
                details: 'Indoor Bleacher Inspections: Clarkrange HS, Allardt ES, Pine Haven ES, South Fentress ES, and York ES',
                tech: 'Sam (overnight)',
                partsLocation: '',
                isPink: false
            },
            {
                id: 's14', type: 'job',
                school: 'Rhea Co, TN',
                details: 'Indoor/Outdoor Bleacher Inspections: Rhea MS, Spring City MS (Gym, Baseball, and Football) and Rhea County HS (Gym, Baseball, Softball, and Football)',
                tech: 'Matt (overnight)',
                partsLocation: '',
                isPink: false
            },
            {
                id: 's15', type: 'job',
                school: 'Meade Co, KY',
                details: 'Indoor Bleacher Inspections w/ PM: DT Wilson ES, Ekron ES, Flaherty ES, Stuart Pepper MS, Flaherty PS, Payneville ES, Barry Hahn ES, Indoor/Outdoor & Basketball Inspections w/PM- Meade Co HS (Freshman Academy Gym, Main Gym and Football *Customer to provide lift*) Stuart Pepper MS (Soccer and Football)',
                tech: 'Danny (overnight)',
                partsLocation: '',
                isPink: false
            },
            {
                id: 's16', type: 'continued',
                school: 'Fairview ES, Blount Co, TN',
                details: 'Continued',
                tech: 'Troy & Alex M (overnight)',
                partsLocation: '',
                isPink: false
            },
            {
                id: 's17', type: 'job',
                school: 'Spencer ES, Spencer, TN',
                details: '**Truck to arrive 9:30am, Removal of exiting pads and dumpster for dunnage is customer responsibility** Labor to replace wall pads',
                tech: 'Chris & Owen (overnight)',
                partsLocation: 'School',
                isPink: true
            },
            {
                id: 's18', type: 'continued',
                school: 'Ravenwood HS, Williamson Co, TN',
                details: 'Continued',
                tech: 'Alex W & Michael (overnight)',
                partsLocation: '',
                isPink: false
            },
            {
                id: 's19', type: 'job',
                school: 'Trousdale Co HS, TN',
                details: 'FACING: Labor to replace RH and LH tier catches, replace an aisle rail socket, grease deck supports, elevate wiring harness, and put a power frame back on track BEHIND: Labor to grease deck supports AUDITORIUM: Labor to replace a gearbox, install flex row handles and flex row rods FOOTBALL HOME: Labor to install an end cap and secure loose frame hardware, surround support hardware and ADA ramp hardware',
                tech: 'Floyd (overnight)',
                partsLocation: 'School/ TN Shop',
                isPink: false
            }
        ],
        '2025-02-05': [
            {
                id: 's20a', type: 'job',
                school: 'Ripley Middle School, Lauderdale Co, TN',
                details: 'Service call - bleacher making grinding noise during retraction',
                tech: 'Field Tech',
                partsLocation: '',
                isPink: false,
                status: 'scheduled'
            },
            {
                id: 's20b', type: 'job',
                school: 'Independence High School, Williamson Co, TN',
                details: 'Replace flex row rod assembly, install tier catch hardware',
                tech: 'Field Tech',
                partsLocation: 'TN Shop',
                isPink: false,
                status: 'scheduled'
            }
        ],
        '2025-02-06': [],
        '2025-02-07': []
    };

    // Week of Feb 3, 2025 - SOUTHERN TERRITORY (AL/FL)
    scheduleDataSouthern = {
        '2025-02-03': [
            {
                id: 'ss1',
                type: 'job',
                school: 'Dauphin JHS, Enterprise City Schools, AL',
                details: '*Have customer get parts over to install area, Bring FL Shop lift?, Customer to provide lift & Dumpster* Labor to demo 2 goals and install 2 new goals',
                tech: 'Floyd, Anthony, Blake & Seth (overnight)',
                partsLocation: 'School',
                isPink: false
            },
            {
                id: 'ss2',
                type: 'job',
                school: 'Dale Co HS, Dale Co, AL',
                details: 'MAIN GYM: Labor to replace motor/gearmotor and install safety skid tape (18). AUX GYM: Labor to install pendant clasp.',
                tech: 'Jon (overnight)',
                partsLocation: 'FL Shop',
                isPink: false
            }
        ],
        '2025-02-04': [
            {
                id: 'ss3',
                type: 'continued',
                school: 'Dauphin JHS, Enterprise City Schools, AL',
                details: 'Continued',
                tech: 'Floyd, Anthony, Blake & Seth (overnight)',
                partsLocation: '',
                isPink: false
            },
            {
                id: 'ss4',
                type: 'job',
                school: 'Houston Co HS, Houston Co, AL',
                details: 'Indoor Bleacher Inspections: Houston Co HS (Main & Aux), Houston Co MS, Wicksburg HS',
                tech: 'Danny (overnight)',
                partsLocation: '',
                isPink: false
            }
        ],
        '2025-02-05': [
            {
                id: 'ss5',
                type: 'continued',
                school: 'Houston Co, AL',
                details: 'Continued',
                tech: 'Danny (overnight)',
                partsLocation: '',
                isPink: false
            },
            {
                id: 'ss6',
                type: 'job',
                school: 'Dothan City Schools, AL',
                details: 'Indoor Bleacher Inspections: Dothan HS, Northview HS, Carver HS, Girard MS, Honeysuckle MS',
                tech: 'Jon (overnight)',
                partsLocation: '',
                isPink: false
            }
        ]
    };

    // Set active schedule based on current territory
    scheduleData = currentTerritory === 'original' ? scheduleDataOriginal : scheduleDataSouthern;
}

// ==========================================
// BACKLOG DATA
// Ready-to-schedule jobs per territory
// ==========================================

// Backlog jobs per territory
let readyToScheduleJobs = [
    {
        id: 'r1',
        jobNumber: '17215',
        type: 'Repair',
        county: 'Williamson Co',
        school: 'Brentwood HS',
        state: 'TN',
        details: '*Lift required, need to take bungee for safety strap* Go-see, find out why safety strap retractors are not installed correctly on goals 2, 3, & 5 in main gym',
        laborAmount: 850,
        partsLocation: 'TN Shop',
        estimateDate: '2024-12-15',
        acceptedDate: '2024-12-20'
    },
    {
        id: 'r2',
        jobNumber: '17220',
        type: 'Repair',
        county: 'Robertson Co',
        school: 'Springfield HS',
        state: 'TN',
        details: 'MAIN GYM: Labor to replace motor/gearmotor and install safety skid tape (24). Labor to install pendant clasp and tension drive frame hardware.',
        laborAmount: 2450,
        partsLocation: 'TN Shop',
        estimateDate: '2024-12-18',
        acceptedDate: '2024-12-22'
    },
    {
        id: 'r3',
        jobNumber: '17225',
        type: 'Inspection',
        county: 'Davidson Co',
        school: 'Metro Nashville Schools - Multiple',
        state: 'TN',
        details: 'Indoor Bleacher Inspections: Hillsboro HS, Hillwood HS, Hunters Lane HS, Maplewood HS, McGavock HS (Main & Aux), Pearl-Cohn HS, Stratford HS',
        laborAmount: 4200,
        partsLocation: '',
        estimateDate: '2024-12-10',
        acceptedDate: '2024-12-12'
    },
    {
        id: 'r4',
        jobNumber: '17230',
        type: 'Service Call',
        county: 'Rutherford Co',
        school: 'Siegel HS',
        state: 'TN',
        details: 'Service call - Bleacher will not retract, possible motor issue. Customer says it makes grinding noise.',
        laborAmount: 650,
        partsLocation: '',
        estimateDate: '2024-12-28',
        acceptedDate: '2024-12-30'
    },
    {
        id: 'r5',
        jobNumber: '17235',
        type: 'Repair',
        county: 'Sumner Co',
        school: 'Hendersonville HS',
        state: 'TN',
        details: 'FACING LOGO: Labor to install flex row roller bracket with hardware and nose cap. BEHIND LOGO: Labor to replace pendant clasp and install tier catch hardware.',
        laborAmount: 1875,
        partsLocation: 'TN Shop. Picked up by Rick 1.2.25',
        estimateDate: '2024-12-05',
        acceptedDate: '2024-12-08'
    },
    {
        id: 'r6',
        jobNumber: '17240',
        type: 'Go See',
        county: 'Warren Co',
        school: 'Warren Co HS',
        state: 'KY',
        details: 'Go-see, customer reporting bleacher alignment issues and squeaking during operation',
        laborAmount: 350,
        partsLocation: '',
        estimateDate: '2025-01-02',
        acceptedDate: '2025-01-03'
    }
];

// Southern territory backlog
let backlogSouthern = [
    {
        id: 'rs1',
        jobNumber: 'AL515920',
        type: 'Repair',
        county: 'Houston Co',
        school: 'Houston Co HS',
        state: 'AL',
        details: 'MAIN GYM: Labor to replace 2 motors and install safety skid tape (12). AUX: Labor to install pendant clasp and tier catch hardware.',
        laborAmount: 3200,
        partsLocation: 'FL Shop',
        estimateDate: '2025-11-15',
        acceptedDate: '2025-11-20'
    },
    {
        id: 'rs2',
        jobNumber: 'AL515925',
        type: 'Inspection',
        county: 'Baldwin Co',
        school: 'Baldwin Co Schools - Multiple',
        state: 'AL',
        details: 'Indoor Bleacher Inspections: Baldwin Co HS, Robertsdale HS, Foley HS (Main & Aux), Daphne HS, Spanish Fort HS',
        laborAmount: 5600,
        partsLocation: '',
        estimateDate: '2025-11-20',
        acceptedDate: '2025-11-22'
    },
    {
        id: 'rs3',
        jobNumber: 'AL515930',
        type: 'Service Call',
        county: 'Escambia Co',
        school: 'Escambia Co HS',
        state: 'AL',
        details: 'Service call - Bleacher binding up during retraction, customer reports loud pop noise',
        laborAmount: 450,
        partsLocation: '',
        estimateDate: '2025-12-01',
        acceptedDate: '2025-12-02'
    }
];

// ==========================================
// SHIT LIST DATA
// Pink jobs - incomplete/return visits per territory
// ==========================================

// Shit List - Pink Jobs (incomplete/return visits)
let shitListJobs = [
    {
        id: 'sl1',
        jobNumber: '17180',
        type: 'Repair',
        county: 'Coffee Co',
        school: 'Spencer ES',
        state: 'TN',
        details: 'Labor to replace wall pads. **Truck to arrive 9:30am, Removal of exiting pads and dumpster for dunnage is customer responsibility**',
        reason: 'Wrong Part',
        reasonDetails: 'Wrong size wall pads shipped - need to reorder correct dimensions',
        tech: 'Chris & Owen',
        originalDate: '2025-01-20',
        laborAmount: 1200,
        partsLocation: 'School',
        measurements: '8ft x 6ft panels, 2" thick'
    },
    {
        id: 'sl2',
        jobNumber: '17195',
        type: 'Repair',
        county: 'Rutherford Co',
        school: 'Riverdale HS',
        state: 'TN',
        details: 'MAIN GYM: Labor to replace motor/gearmotor and install new pendant control',
        reason: 'Wrong Part',
        reasonDetails: 'Motor sent was 1/2 HP, needs 3/4 HP motor for this bank size',
        tech: 'Floyd',
        originalDate: '2025-01-22',
        laborAmount: 1850,
        partsLocation: 'TN Shop',
        measurements: ''
    },
    {
        id: 'sl3',
        jobNumber: '17202',
        type: 'Service Call',
        county: 'Wilson Co',
        school: 'Mt Juliet HS',
        state: 'TN',
        details: 'Service call - Bleacher making grinding noise, discovered additional frame damage during visit',
        reason: 'Additional Work',
        reasonDetails: 'Found 3 additional damaged frames that need replacement. New estimate needed.',
        tech: 'Sam',
        originalDate: '2025-01-25',
        laborAmount: 650,
        partsLocation: '',
        measurements: ''
    },
    {
        id: 'sl4',
        jobNumber: '17210',
        type: 'Repair',
        county: 'Sumner Co',
        school: 'Gallatin HS',
        state: 'TN',
        details: 'BEHIND LOGO: Labor to install flex row handles and replace gear motor',
        reason: "Can't Access",
        reasonDetails: 'Gym was being used for basketball tournament, could not get access. Need to reschedule after Feb 15.',
        tech: 'Alex W & Michael',
        originalDate: '2025-01-28',
        laborAmount: 2100,
        partsLocation: 'TN Shop',
        measurements: ''
    }
];

let shitListSouthern = [
    {
        id: 'sls1',
        jobNumber: 'AL515910',
        type: 'Repair',
        county: 'Lee Co',
        school: 'Beauregard HS',
        state: 'AL',
        details: 'MAIN GYM: Labor to replace 2 tier catches and install safety skid tape',
        reason: 'Equipment Issue',
        reasonDetails: 'Lift broke down on site. Need to bring replacement lift.',
        tech: 'Jon',
        originalDate: '2025-01-15',
        laborAmount: 1450,
        partsLocation: 'FL Shop',
        measurements: ''
    }
];

// ==========================================
// UTILITY FUNCTIONS
// Date helpers and data access
// ==========================================

// Get active backlog based on territory
function getActiveBacklog() {
    return currentTerritory === 'original' ? readyToScheduleJobs : backlogSouthern;
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
function loadSchedule() {
    initializeSampleScheduleData();
    // Set offset to show the week containing sample data
    const sampleDate = new Date('2025-02-03');
    const currentMonday = getWeekStart(0);
    scheduleWeekOffset = Math.round((sampleDate - currentMonday) / (7 * 24 * 60 * 60 * 1000));
    updateWeekLabel();
    renderWeeklySchedule();
    loadBacklog();
    loadShitList();
    populateTechDropdowns();
    // Re-show the active tab (showView hides all elements ending with "View")
    switchScheduleTab(currentScheduleTab);
}

// Switch territory (Office view)
function switchTerritory(territory) {
    currentTerritory = territory;
    scheduleData = territory === 'original' ? scheduleDataOriginal : scheduleDataSouthern;

    // Update territory tab styles
    document.getElementById('officeOriginalTab').classList.toggle('active', territory === 'original');
    document.getElementById('officeSouthernTab').classList.toggle('active', territory === 'southern');

    renderWeeklySchedule();
    loadBacklog();
    loadShitList();
}

// Update week label
function updateWeekLabel() {
    document.getElementById('scheduleWeekLabel').textContent = getWeekLabel(scheduleWeekOffset);
}

// Navigate weeks
function previousWeek() {
    scheduleWeekOffset--;
    updateWeekLabel();
    renderWeeklySchedule();
}

function nextWeek() {
    scheduleWeekOffset++;
    updateWeekLabel();
    renderWeeklySchedule();
}

// Switch schedule tabs
function switchScheduleTab(tab) {
    currentScheduleTab = tab;

    // Update tab styles - only the sub-tabs, not territory tabs
    document.getElementById('thisWeekTab').classList.remove('active');
    document.getElementById('planningTab').classList.remove('active');
    document.getElementById('backlogTab').classList.remove('active');
    document.getElementById('shitListTab').classList.remove('active');
    document.getElementById(tab + 'Tab').classList.add('active');

    // Show/hide views
    document.getElementById('thisWeekView').classList.add('hidden');
    document.getElementById('planningView').classList.add('hidden');
    document.getElementById('backlogView').classList.add('hidden');
    document.getElementById('shitListView').classList.add('hidden');

    if (tab === 'thisWeek') {
        document.getElementById('thisWeekView').classList.remove('hidden');
    } else if (tab === 'planning') {
        document.getElementById('planningView').classList.remove('hidden');
        renderPlanningSchedule();
    } else if (tab === 'backlog') {
        document.getElementById('backlogView').classList.remove('hidden');
        loadBacklog();
    } else if (tab === 'shitList') {
        document.getElementById('shitListView').classList.remove('hidden');
        loadShitList();
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
                    if (job.confirmation === 'XX') {
                        confirmIcon = '<span style="color: #2e7d32; font-size: 18px;" title="Confirmed">✓✓</span>';
                    } else if (job.confirmation === 'X') {
                        confirmIcon = '<span style="color: #f57c00; font-size: 16px;" title="Attempted">✓</span>';
                    } else {
                        confirmIcon = '<span style="color: #bdbdbd; font-size: 16px;" title="Not confirmed">—</span>';
                    }

                    html += '<tr class="' + rowClass + '" style="' + (status === 'complete' ? 'opacity: 0.6;' : '') + '">';
                    html += '<td style="font-weight: 600;">' + job.school + '</td>';
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

// Render planning schedule (table-based layout, editable)
function renderPlanningSchedule() {
    const container = document.getElementById('planningScheduleGrid');
    // Use next week for planning
    const weekStart = getWeekStart(scheduleWeekOffset + 1);

    let html = '<div style="margin-bottom: 16px; padding: 12px; background: #e8f5e9; border-radius: 8px;">';
    html += '<strong>Planning for: Week of ' + weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + '</strong>';
    html += '</div>';

    if (isMobileSchedule()) {
        html += renderScheduleMobileCards({}, weekStart, { planning: true });
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
        const dayLabel = days[i] + ' ' + (dayDate.getMonth() + 1) + '/' + dayDate.getDate();

        html += '<tr class="schedule-day-row">';
        html += '<td colspan="3">' + dayLabel + '</td>';
        html += '<td style="text-align: right; background: inherit;"><button class="btn btn-sm" style="padding: 2px 10px; font-size: 11px;" onclick="addJobToDay(\'' + formatDateKey(dayDate) + '\')">+ Add</button></td>';
        html += '</tr>';
        html += '<tr><td colspan="4" style="padding: 12px; text-align: center; color: #adb5bd; font-size: 12px;">Drag jobs here or click + Add</td></tr>';
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

// ==========================================
// BACKLOG FUNCTIONS
// Ready-to-schedule jobs view with filtering
// ==========================================

// Load backlog
function loadBacklog() {
    const container = document.getElementById('readyJobsList');
    const activeBacklog = getActiveBacklog();

    // Update stats
    const partsReceivedCount = activeBacklog.filter(j => j.partsLocation).length;
    const inspectionsCount = activeBacklog.filter(j => j.type === 'Inspection').length;
    const totalLabor = activeBacklog.reduce((sum, j) => sum + j.laborAmount, 0);

    document.getElementById('readyPartsReceived').textContent = partsReceivedCount;
    document.getElementById('readyInspectionsOnly').textContent = inspectionsCount;
    document.getElementById('readyTotalLabor').textContent = '$' + totalLabor.toLocaleString();
    document.getElementById('backlogCount').textContent = activeBacklog.length;

    // Populate county filter
    const counties = [...new Set(activeBacklog.map(j => j.county))].sort();
    const countyFilter = document.getElementById('readyFilterCounty');
    countyFilter.innerHTML = '<option value="">All Counties</option>' +
        counties.map(c => `<option value="${c}">${c}</option>`).join('');

    // Render jobs
    if (activeBacklog.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">No jobs in backlog</div>';
        return;
    }

    let html = '';
    activeBacklog.forEach(job => {
        html += `
            <div class="ready-job-item" onclick="addJobToSchedule('${job.id}')">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span class="part-number" style="color: #0066cc;">${job.jobNumber}</span>
                        <span class="badge ${job.type === 'Repair' ? 'badge-warning' : job.type === 'Inspection' ? 'badge-info' : 'badge-secondary'}">${job.type}</span>
                        ${job.partsLocation ? '<span class="badge badge-success">Parts Ready</span>' : ''}
                    </div>
                    <div style="font-weight: 600; margin-bottom: 4px;">${job.school}, ${job.state}</div>
                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 6px;">${job.county}</div>
                    <div style="font-size: 13px; color: #495057; line-height: 1.4;">${truncateText(job.details, 150)}</div>
                    ${job.partsLocation ? `<div style="margin-top: 8px; font-size: 12px; color: #e65100;"><strong>Parts:</strong> ${job.partsLocation}</div>` : ''}
                </div>
                <div style="text-align: right; min-width: 100px;">
                    <div style="font-weight: 600; font-size: 16px; color: #2e7d32;">$${job.laborAmount.toLocaleString()}</div>
                    <div style="font-size: 11px; color: #6c757d; margin-top: 4px;">Accepted ${new Date(job.acceptedDate).toLocaleDateString()}</div>
                    <button class="btn btn-sm btn-primary" style="margin-top: 12px;" onclick="event.stopPropagation(); addJobToSchedule('${job.id}')">Add to Schedule</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Filter ready jobs
function filterReadyJobs() {
    const countyFilter = document.getElementById('readyFilterCounty').value;
    const typeFilter = document.getElementById('readyFilterType').value;

    // For now just reload - in production would filter the list
    loadReadyPool();
}

// Populate tech dropdowns
function populateTechDropdowns() {
    const techSelect = document.getElementById('entryTech');
    const jobSelect = document.getElementById('entryJobSelect');

    techSelect.innerHTML = '<option value="">-- Select tech(s) --</option>' +
        TECHS.map(t => `<option value="${t}">${t}</option>`).join('');

    jobSelect.innerHTML = '<option value="">-- Select a job --</option>' +
        getActiveBacklog().map(j => `<option value="${j.id}">${j.jobNumber} - ${j.school} (${j.type})</option>`).join('');
}

// Add Entry Modal
function openAddEntryModal() {
    document.getElementById('addEntryModal').classList.remove('hidden');
    populateTechDropdowns();
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

function saveScheduleEntry() {
    const entryType = document.getElementById('entryType').value;
    const day = document.getElementById('entryDay').value;
    const tech = document.getElementById('entryTech').value;
    const partsLocation = document.getElementById('entryPartsLocation').value;
    const confirmation = document.getElementById('entryConfirmation').value;
    const notes = document.getElementById('entryNotes').value;

    // Get the date key for the selected day
    const weekStart = getWeekStart(scheduleWeekOffset);
    const dayIndex = ['mon', 'tue', 'wed', 'thu', 'fri'].indexOf(day);
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + dayIndex);
    const dateKey = formatDateKey(targetDate);

    let newEntry = {
        id: 's' + Date.now(),
        tech: tech,
        partsLocation: partsLocation,
        confirmation: confirmation,
        notes: notes
    };

    if (entryType === 'job') {
        const jobId = document.getElementById('entryJobSelect').value;
        const job = getActiveBacklog().find(j => j.id === jobId);
        if (job) {
            newEntry.type = 'job';
            newEntry.school = job.school + ', ' + job.county + ', ' + job.state;
            newEntry.details = job.details;
            newEntry.estimateNumber = job.jobNumber;
        }
    } else if (entryType === 'note') {
        newEntry.type = 'note';
        newEntry.school = '';
        newEntry.details = document.getElementById('entryNote').value;
    } else if (entryType === 'custom') {
        newEntry.type = 'job';
        newEntry.school = document.getElementById('entrySchool').value;
        newEntry.details = document.getElementById('entryDescription').value;
    }

    // Add to schedule data
    if (!scheduleData[dateKey]) {
        scheduleData[dateKey] = [];
    }
    scheduleData[dateKey].push(newEntry);

    // Refresh view
    renderWeeklySchedule();
    closeAddEntryModal();

    alert('Entry added to schedule!');
}

function addJobToSchedule(jobId) {
    const job = getActiveBacklog().find(j => j.id === jobId);
    if (job) {
        document.getElementById('entryType').value = 'job';
        toggleEntryFields();
        openAddEntryModal();
        document.getElementById('entryJobSelect').value = jobId;
        document.getElementById('entryPartsLocation').value = job.partsLocation || '';
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

// ==========================================
// SHIT LIST FUNCTIONS
// Pink jobs view with reason tracking
// ==========================================

// Load Shit List
function loadShitList() {
    const container = document.getElementById('shitListJobsList');
    if (!container) return;
    const activeList = currentTerritory === 'original' ? shitListJobs : shitListSouthern;

    // Update stats
    const total = activeList.length;
    const wrongPart = activeList.filter(function(j) { return j.reason === 'Wrong Part'; }).length;
    const other = total - wrongPart;

    document.getElementById('shitListTotal').textContent = total;
    document.getElementById('shitListWrongPart').textContent = wrongPart;
    document.getElementById('shitListOther').textContent = other;
    document.getElementById('shitListCount').textContent = total;

    if (activeList.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #6c757d;">No pink jobs - nice work!</div>';
        return;
    }

    var html = '';
    activeList.forEach(function(job) {
        var reasonColors = {
            'Wrong Part': { bg: '#fff3e0', color: '#e65100', icon: '&#x1F527;' },
            "Can't Access": { bg: '#e3f2fd', color: '#1565c0', icon: '&#x1F6AA;' },
            'Additional Work': { bg: '#fff3e0', color: '#e65100', icon: '&#x26A0;' },
            'Equipment Issue': { bg: '#fce4ec', color: '#c62828', icon: '&#x1F3D7;' },
            'Other': { bg: '#f5f5f5', color: '#616161', icon: '&#x1F4DD;' }
        };
        var rc = reasonColors[job.reason] || reasonColors['Other'];

        html += '<div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 16px; border-bottom: 1px solid #f0f0f0; border-left: 4px solid #c62828;">';
        html += '<div style="flex: 1;">';
        html += '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap;">';
        html += '<span class="part-number" style="color: #c62828; font-weight: 700;">#' + job.jobNumber + '</span>';
        html += '<span class="badge" style="background: ' + rc.bg + '; color: ' + rc.color + ';">' + rc.icon + ' ' + job.reason + '</span>';
        html += '<span class="badge badge-secondary">' + job.type + '</span>';
        html += '</div>';
        html += '<div style="font-weight: 600; margin-bottom: 4px;">' + job.school + ', ' + job.county + ', ' + job.state + '</div>';
        html += '<div style="font-size: 13px; color: #495057; line-height: 1.4; margin-bottom: 8px;">' + job.details + '</div>';
        html += '<div style="font-size: 13px; color: #c62828; background: #fff0f0; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px;">';
        html += '<strong>Why:</strong> ' + job.reasonDetails;
        html += '</div>';
        html += '<div style="display: flex; gap: 16px; font-size: 12px; color: #6c757d; flex-wrap: wrap;">';
        html += '<span><strong>Tech:</strong> ' + job.tech + '</span>';
        html += '<span><strong>Original Date:</strong> ' + new Date(job.originalDate).toLocaleDateString() + '</span>';
        if (job.measurements) {
            html += '<span><strong>Measurements:</strong> ' + job.measurements + '</span>';
        }
        if (job.partsLocation) {
            html += '<span style="color: #e65100;"><strong>Parts:</strong> ' + job.partsLocation + '</span>';
        }
        html += '</div>';
        html += '</div>';
        html += '<div style="text-align: right; min-width: 100px;">';
        html += '<div style="font-weight: 600; font-size: 16px; color: #c62828;">$' + job.laborAmount.toLocaleString() + '</div>';
        html += '<button class="btn btn-sm btn-primary" style="margin-top: 12px;" onclick="event.stopPropagation(); addJobToSchedule(\'' + job.id + '\')">Reschedule</button>';
        html += '</div>';
        html += '</div>';
    });

    container.innerHTML = html;
}

function filterShitList() {
    // For now just reload
    loadShitList();
}

// Truncate text helper
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ==========================================
// OFFICE JOBS VIEW (Operational view for Office/Admin)
// Shows all active jobs in list format with ability to edit/create
// ==========================================

let officeJobsWeekOffset = 0;
let currentOfficeJobsTerritory = 'original';

function loadOfficeJobs() {
    initializeSampleScheduleData();
    // Set offset to show sample data week
    const sampleDate = new Date('2025-02-03');
    const currentMonday = getWeekStart(0);
    officeJobsWeekOffset = Math.round((sampleDate - currentMonday) / (7 * 24 * 60 * 60 * 1000));
    const label = document.getElementById('officeJobsWeekLabel');
    label.textContent = getWeekLabel(officeJobsWeekOffset);
    renderOfficeJobsGrid();
}

function renderOfficeJobsGrid() {
    const container = document.getElementById('officeJobsGrid');
    const weekStart = getWeekStart(officeJobsWeekOffset);
    const activeData = currentOfficeJobsTerritory === 'original' ? scheduleDataOriginal : scheduleDataSouthern;

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

function switchOfficeJobsTerritory(territory) {
    currentOfficeJobsTerritory = territory;
    document.getElementById('officeJobsOriginalTab').classList.toggle('active', territory === 'original');
    document.getElementById('officeJobsSouthernTab').classList.toggle('active', territory === 'southern');
    renderOfficeJobsGrid();
}

function prevOfficeJobsWeek() {
    officeJobsWeekOffset--;
    const label = document.getElementById('officeJobsWeekLabel');
    label.textContent = getWeekLabel(officeJobsWeekOffset);
    renderOfficeJobsGrid();
}

function nextOfficeJobsWeek() {
    officeJobsWeekOffset++;
    const label = document.getElementById('officeJobsWeekLabel');
    label.textContent = getWeekLabel(officeJobsWeekOffset);
    renderOfficeJobsGrid();
}

