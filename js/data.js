// ==========================================
// DATA & CONSTANTS
// All sample data, constants, and shared state
// ==========================================

// Airtable API Configuration - 2,142 real Hussey parts
// API key loaded from js/config.js (gitignored)
const AIRTABLE_BASE_ID = 'appAT4ZwbRAgIyzUW';
const AIRTABLE_TABLE_ID = 'tbl4mDv20NaJnaaN7';

// Contact roles - used for badges and filtering
const CONTACT_ROLES = {
    scheduling: { label: 'Scheduling', icon: '📅', color: '#2196F3' },
    contracts: { label: 'Contracts', icon: '📝', color: '#9C27B0' },
    billing: { label: 'Billing', icon: '💰', color: '#4CAF50' },
    equipment: { label: 'Equipment', icon: '🔧', color: '#FF9800' },
    access: { label: 'Access', icon: '🔑', color: '#795548' },
    primary: { label: 'Primary', icon: '📞', color: '#607D8B' }
};

// Data Storage
// Customer hierarchy: Customer (billing entity) → Locations (schools/sites)
// Contacts can exist at customer level (district contacts) or location level (school contacts)
const CUSTOMERS = [
    {
        id: 'cust1',
        name: 'Lauderdale County Schools',
        type: 'county',
        billingAddress: '100 S Jefferson St, Ripley, TN 38063',
        phone: '(731) 635-2941',
        territory: 'Original',
        contacts: [
            { id: 'con1', name: 'Mike Mann', title: 'Director of Schools', phone: '(731) 635-2941', mobile: '(479) 883-4283', email: 'mmann@lauderdale.k12.tn.us', roles: ['contracts', 'billing'] }
        ],
        locations: [
            {
                id: 'loc1',
                name: 'Ripley High School',
                address: '254 S Jefferson St, Ripley, TN 38063',
                contacts: [
                    { id: 'loc1con1', name: 'Chris McCorkle', title: 'Principal', phone: '(731) 635-2642', email: '', roles: ['scheduling', 'access'] }
                ]
            },
            {
                id: 'loc2',
                name: 'Ripley Middle School',
                address: '309 Charles Griggs St, Ripley, TN 38063',
                contacts: [
                    { id: 'loc2con1', name: 'Janet Williams', title: 'Principal', phone: '(731) 635-1500', email: '', roles: ['scheduling', 'access'] }
                ]
            },
            {
                id: 'loc3',
                name: 'Ripley Elementary School',
                address: '100 Hwy 19 E, Ripley, TN 38063',
                contacts: [
                    { id: 'loc3con1', name: 'Tom Harris', title: 'Principal', phone: '(731) 635-1400', email: '', roles: ['scheduling', 'access'] }
                ]
            },
            {
                id: 'loc4',
                name: 'Ripley Primary School',
                address: '225 Volz Rd, Ripley, TN 38063',
                contacts: [
                    { id: 'loc4con1', name: 'Sue Adams', title: 'Principal', phone: '(731) 635-1300', email: '', roles: ['scheduling', 'access'] }
                ]
            }
        ]
    },
    {
        id: 'cust2',
        name: 'Wilson County Schools',
        type: 'county',
        billingAddress: '415 Harding Dr, Lebanon, TN 37087',
        phone: '(615) 444-3282',
        territory: 'Original',
        contacts: [
            { id: 'con2', name: 'Tom Anderson', title: 'Facilities Director', phone: '(615) 444-3282', mobile: '', email: 'tanderson@wcschools.com', roles: ['contracts', 'billing', 'primary'] }
        ],
        locations: [
            {
                id: 'loc5',
                name: 'Wilson Central High School',
                address: '1414 Baddour Pkwy, Lebanon, TN 37087',
                contacts: [
                    { id: 'loc5con1', name: 'David Brown', title: 'Athletic Director', phone: '(615) 443-5765', email: '', roles: ['scheduling', 'equipment'] }
                ]
            },
            {
                id: 'loc6',
                name: 'Mt. Juliet High School',
                address: '501 N Greenhill Rd, Mt Juliet, TN 37122',
                contacts: [
                    { id: 'loc6con1', name: 'Karen White', title: 'Principal', phone: '(615) 758-6004', email: '', roles: ['scheduling', 'access'] }
                ]
            },
            {
                id: 'loc7',
                name: 'Lebanon High School',
                address: '907 Coles Ferry Pike, Lebanon, TN 37090',
                contacts: [
                    { id: 'loc7con1', name: 'James Miller', title: 'Athletic Director', phone: '(615) 449-6040', email: '', roles: ['scheduling', 'equipment'] }
                ]
            }
        ]
    },
    {
        id: 'cust3',
        name: 'Williamson County Schools',
        type: 'county',
        billingAddress: '1320 W Main St, Franklin, TN 37064',
        phone: '(615) 472-4000',
        territory: 'Original',
        contacts: [
            { id: 'con3', name: 'Sarah Thompson', title: 'Director of Operations', phone: '(615) 472-4000', mobile: '', email: 'sthompson@wcs.edu', roles: ['contracts', 'primary'] },
            { id: 'con3b', name: 'Mark Reynolds', title: 'Accounts Payable', phone: '(615) 472-4005', mobile: '', email: 'mreynolds@wcs.edu', roles: ['billing'] }
        ],
        locations: [
            {
                id: 'loc8',
                name: 'Franklin High School',
                address: '810 Hillsboro Rd, Franklin, TN 37064',
                contacts: [
                    { id: 'loc8con1', name: 'Mike Davis', title: 'Maintenance Supervisor', phone: '(615) 794-6624', email: '', roles: ['scheduling', 'access', 'equipment'] }
                ]
            },
            {
                id: 'loc9',
                name: 'Brentwood High School',
                address: '5304 Murray Ln, Brentwood, TN 37027',
                contacts: [
                    { id: 'loc9con1', name: 'Lisa Chen', title: 'Athletic Director', phone: '(615) 472-4450', email: '', roles: ['scheduling', 'equipment'] }
                ]
            },
            {
                id: 'loc10',
                name: 'Independence High School',
                address: '1776 Declaration Way, Thompson Station, TN 37179',
                contacts: [
                    { id: 'loc10con1', name: 'Robert Taylor', title: 'Principal', phone: '(615) 472-4980', email: '', roles: ['scheduling', 'access'] }
                ]
            }
        ]
    },
    {
        id: 'cust4',
        name: 'Brentwood Academy',
        type: 'private',
        billingAddress: '219 Granny White Pike, Brentwood, TN 37027',
        phone: '(615) 373-0611',
        territory: 'Original',
        contacts: [
            { id: 'con4', name: 'John Smith', title: 'Facilities Manager', phone: '(615) 373-0611', mobile: '', email: 'jsmith@brentwoodacademy.com', roles: ['contracts', 'billing', 'scheduling', 'primary'] }
        ],
        locations: [
            {
                id: 'loc11',
                name: 'Main Campus',
                address: '219 Granny White Pike, Brentwood, TN 37027',
                contacts: [
                    { id: 'loc11con1', name: 'John Smith', title: 'Facilities Manager', phone: '(615) 373-0611', email: '', roles: ['scheduling', 'access'] }
                ]
            },
            {
                id: 'loc12',
                name: 'Athletic Complex',
                address: '219 Granny White Pike, Brentwood, TN 37027',
                contacts: [
                    { id: 'loc12con1', name: 'Coach Roberts', title: 'Athletic Director', phone: '(615) 373-0612', email: '', roles: ['scheduling', 'equipment'] }
                ]
            }
        ]
    },
    {
        id: 'cust5',
        name: 'Montgomery Bell Academy',
        type: 'private',
        billingAddress: '4001 Harding Rd, Nashville, TN 37205',
        phone: '(615) 298-5514',
        territory: 'Original',
        contacts: [
            { id: 'con5', name: 'Sarah Johnson', title: 'Business Manager', phone: '(615) 298-5514', mobile: '', email: 'sjohnson@montgomerybell.edu', roles: ['contracts', 'billing', 'primary'] }
        ],
        locations: [
            {
                id: 'loc13',
                name: 'Main Gymnasium',
                address: '4001 Harding Rd, Nashville, TN 37205',
                contacts: [
                    { id: 'loc13con1', name: 'Sarah Johnson', title: 'Business Manager', phone: '(615) 298-5514', email: '', roles: ['scheduling', 'access'] }
                ]
            }
        ]
    },
    {
        id: 'cust6',
        name: 'Lipscomb Academy',
        type: 'private',
        billingAddress: '3901 Granny White Pike, Nashville, TN 37204',
        phone: '(615) 966-1000',
        territory: 'Original',
        contacts: [
            { id: 'con6', name: 'Emily Wilson', title: 'Director of Operations', phone: '(615) 966-1000', mobile: '', email: 'ewilson@lipscomb.edu', roles: ['contracts', 'billing', 'primary'] }
        ],
        locations: [
            {
                id: 'loc14',
                name: 'Allen Arena',
                address: '3901 Granny White Pike, Nashville, TN 37204',
                contacts: [
                    { id: 'loc14con1', name: 'Emily Wilson', title: 'Director of Operations', phone: '(615) 966-1000', email: '', roles: ['scheduling'] }
                ]
            },
            {
                id: 'loc15',
                name: 'Student Activity Center',
                address: '3901 Granny White Pike, Nashville, TN 37204',
                contacts: [
                    { id: 'loc15con1', name: 'Mark Jones', title: 'Facility Coordinator', phone: '(615) 966-1001', email: '', roles: ['scheduling', 'access', 'equipment'] }
                ]
            }
        ]
    },
    {
        id: 'jackson',
        name: 'Madison County Schools',
        type: 'county',
        billingAddress: '668 Lexington Ave, Jackson TN 38301',
        phone: '(731) 506-3069',
        territory: 'Original',
        contacts: [
            { id: 'con7', name: 'Chris Johnson', title: 'Maintenance Director', phone: '(731) 506-3069', mobile: '(731) 267-6834', email: 'cjohnson@madisoncountyschools.org', roles: ['contracts', 'billing', 'equipment', 'primary'] }
        ],
        locations: [
            {
                id: 'jackson_career',
                name: 'Jackson Career And Technology Elementary',
                address: '668 Lexington Ave, Jackson TN 38301',
                contacts: [
                    { id: 'jacksoncon1', name: 'Chris Johnson', title: 'Maintenance Director', phone: '(731) 506-3069', email: '', roles: ['scheduling', 'access'] }
                ]
            }
        ]
    }
];

// Job types matching ServicePal
const JOB_TYPES = ['Go See', 'Service Call', 'Repair', 'Inspection'];

// Job statuses
const JOB_STATUSES = ['New', 'In Progress', 'Parts Ordered', 'Parts Received', 'Scheduled', 'Completed', 'Pink'];

// Helper to get primary contact from contacts array
function getPrimaryContact(contacts) {
    if (!contacts || contacts.length === 0) return { name: '', phone: '', email: '' };
    // Look for primary role first, then just return first contact
    const primary = contacts.find(c => c.roles && c.roles.includes('primary'));
    return primary || contacts[0];
}

// Helper to get contact for a specific role
function getContactForRole(customer, location, role) {
    // Check location contacts first
    if (location && location.contacts) {
        const locContact = location.contacts.find(c => c.roles && c.roles.includes(role));
        if (locContact) return locContact;
    }
    // Fall back to customer-level contacts
    if (customer && customer.contacts) {
        const custContact = customer.contacts.find(c => c.roles && c.roles.includes(role));
        if (custContact) return custContact;
    }
    // Fall back to any primary or first contact
    return getPrimaryContact(customer?.contacts) || getPrimaryContact(location?.contacts);
}

// Legacy support - flat customer list for backwards compatibility
const SAMPLE_CUSTOMERS = CUSTOMERS.flatMap(c =>
    c.locations.map(loc => {
        const locContact = getPrimaryContact(loc.contacts);
        const custContact = getPrimaryContact(c.contacts);
        return {
            id: loc.id,
            customerId: c.id,
            customerName: c.name,
            customerType: c.type,
            name: loc.name,
            address: loc.address,
            contact: locContact.name,
            phone: locContact.phone,
            billingContact: custContact.name,
            billingPhone: custContact.phone,
            billingAddress: c.billingAddress
        };
    })
);

// Categories loaded from Airtable
let partsCategories = [];

// Store search results for part selection
let searchResults = {};

let inspections = JSON.parse(localStorage.getItem('inspections') || '[]');
let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
let currentInspection = {};
let currentRole = '';

// Inspection type checklist definitions
const CHECKLISTS = {
    basketball: [
        'Goals are regulation height',
        'Backboard/goals are level',
        'Backboard, goal and padding is code compliant',
        'Inspected all attachment hardware for structure',
        'All hardware has been installed properly',
        'All pivot points and related mechanisms lubricated',
        'Hoist mechanism (winches) secure and operational',
        'Hoist cable inspected',
        'Limit switches in electric winches tested',
        'Tested all winches',
        'Test safety strap type mechanism for proper function'
    ],
    bleacherUnderstructure: [
        'Tier catches, Caster wheels, Axles and E-clips checked',
        'Hardware on each knee/cross bracing checked',
        'Clearance between frames and deck supports verified',
        'Wall buck properly affixed with all hardware in place',
        'All floor anchors in place and tight',
        'All motors pulling properly (checked for leaking oil, chains)',
        'Back frames on wheel or stationary verified'
    ],
    bleacherTopSide: [
        'Visually inspect all end rail brackets',
        'Shake each end rail - brackets secure and rails seated properly',
        'End rails are code compliant',
        'All aisle rails brackets are secure',
        'All aisle steps are secure',
        'Walked each row looking for broken or soft deck boards',
        'Operated each flex row for smooth release and lock out',
        'Skirt panels are properly attached',
        'Examined seats/brackets - noted damaged or missing seats'
    ],
    outdoorUnderstructure: [
        'Check for missing seat and foot plank clips',
        'Hardware on each knee/cross bracing checked',
        'All anchors in place and tight',
        'Loose hardware addressed'
    ],
    outdoorTopSide: [
        'Visually inspect guard rail system (code compliant)',
        'All aisle rails brackets are secure',
        'All walkway and ADA ramps are code compliant',
        'All handrails are secure',
        'Walked each row - no broken or bent foot planks',
        'Each seat plank properly affixed - no broken/bent planks',
        'Noted special features (band riser, chairs, reserved seating)',
        'Noted style of end cap',
        'Footboard elevation on last row does not exceed 30" from grade',
        'Seatboard elevation on last row does not exceed 55" from grade'
    ]
};

// Current inspection type
let currentInspectionType = '';
let goalInspections = [];
let issuesList = [];

// NEW: Multi-bank job system
let inspectionJobs = JSON.parse(localStorage.getItem('inspectionJobs')) || [];
let currentJob = null;
let currentBankIndex = 0;
let currentIssueType = '';
let nextJobNumber = parseInt(localStorage.getItem('nextJobNumber')) || 17500;

// Sample inspection data - Job #16942 Jackson Career And Technology Elementary
const SAMPLE_INSPECTION_JOBS = [
    {
        jobNumber: 16942,
        status: 'submitted',
        customerId: 'jackson',
        customerName: 'Madison County Schools',
        locationId: 'jackson_career',
        locationName: 'Jackson Career And Technology Elementary',
        locationAddress: '668 Lexington Ave, Jackson TN 38301',
        inspectionType: 'bleacher',
        inspectorName: 'Danny Mendl',
        inspectorCertificate: 'MXM00-980',
        createdAt: '2026-01-12T10:00:00',
        submittedAt: '2026-01-12T15:30:00',
        quickQuestions: {
            basketballGoals: 6,
            safetyStraps: 4,
            fixedGoals: 2,
            edgePads: 6
        },
        banks: [
            {
                name: 'West Side',
                bleacherType: 'Interkal',
                tiers: 5,
                rise: '10 1/4"',
                rowSpacing: '24"',
                seatType: 'SSM - Sculpture Seat Module',
                seatMaterial: 'Plastic',
                seatColor: 'Red(6)',
                comments: '10" seats',
                workingDirection: 'Left to Right',
                motorPhase: 3,
                motorHP: '1/2',
                numberOfMotors: 4,
                wheelsPerMotor: 4,
                wheelType: 'Interkal Wide Track/Torque Tube',
                backFrameType: 'Rolling Back Frame',
                wiringCondition: 'Good',
                sections: 4,
                rows: 5,
                aisles: 3,
                aisleRailType: 'P',
                seatCountPerSection: '7 - 14 - 15 - 7',
                understructureChecklist: {
                    tierCatches: true,
                    hardware: true,
                    clearance: true,
                    wallBuck: true,
                    floorAnchors: true,
                    motors: true,
                    backFrames: true
                },
                topSideChecklist: {
                    endRailBrackets: true,
                    endRailsSecure: true,
                    endRailsCompliant: true,
                    aisleRails: true,
                    aisleSteps: true,
                    deckBoards: true,
                    flexRow: 'N/A',
                    skirtPanels: true,
                    seats: true,
                    endRailsCodeCompliant: true
                },
                understructureIssues: [
                    { frame: '3', tier: '1', description: 'Loose deck support', photo: null },
                    { frame: '3', tier: '', description: 'ADA cutout missing bolt - button', photo: null }
                ],
                topSideIssues: [
                    { section: '', row: '1', description: 'RH end outrigger wheel is loose', photo: null },
                    { section: '', row: '', description: 'Skirt board 3 is broken 3/4 x 4 1/4 x 26\'. Medium maple', photo: null },
                    { section: '3', row: '2', description: 'Hex bolt holding up bracket', photo: null },
                    { section: '', row: '', description: 'Missing skid tape aisle 1 nose 4', photo: null },
                    { section: '', row: '', description: 'Damaged skid tape aisle 2 nose 3', photo: null }
                ],
                safetyIssues: 'Some skid tape is missing and damaged.',
                functionalIssues: 'One deck support is loose.',
                cosmeticIssues: 'One skirt board is broken. One outrigger wheel is loose',
                tagAffixed: true
            },
            {
                name: 'East Side',
                bleacherType: 'Interkal',
                tiers: 5,
                rise: '10 1/4"',
                rowSpacing: '24"',
                seatType: 'SSM - Sculpture Seat Module',
                seatMaterial: 'Plastic',
                seatColor: 'Red (6)',
                comments: '10" seat',
                workingDirection: 'Left to Right',
                motorPhase: 3,
                motorHP: '1/2',
                numberOfMotors: 3,
                wheelsPerMotor: 4,
                wheelType: 'Interkal Wide Track/Torque Tube',
                backFrameType: 'Rolling Back Frame',
                wiringCondition: 'Good',
                sections: 4,
                rows: 5,
                aisles: 3,
                aisleRailType: 'P',
                seatCountPerSection: '7 - 15 - 14 - 7',
                understructureChecklist: {
                    tierCatches: true,
                    hardware: true,
                    clearance: true,
                    wallBuck: true,
                    floorAnchors: true,
                    motors: true,
                    backFrames: true
                },
                topSideChecklist: {
                    endRailBrackets: true,
                    endRailsSecure: true,
                    endRailsCompliant: true,
                    aisleRails: true,
                    aisleSteps: true,
                    deckBoards: true,
                    flexRow: 'N/A',
                    skirtPanels: true,
                    seats: true,
                    endRailsCodeCompliant: true
                },
                understructureIssues: [
                    { frame: 'Motor 2', tier: '', description: 'Broken gear motor', photo: null }
                ],
                topSideIssues: [
                    { section: '', row: '', description: 'Aisle 2 nose 1,2,3,4 have damaged skid tape', photo: null },
                    { section: '', row: '', description: 'Aisle 1 step 1,3 and nose 4 have damaged skid tape', photo: null },
                    { section: '', row: '', description: 'Aisle 3 nose 3 has missing skid tape', photo: null },
                    { section: '', row: '', description: 'Skirt board 1 is missing a bracket', photo: null },
                    { section: '1', row: '', description: 'Outrigger wheel is loose', photo: null },
                    { section: '', row: '', description: 'LH end rail 1 missing bolt', photo: null },
                    { section: '', row: '', description: 'RH end outrigger wheel is loose', photo: null }
                ],
                safetyIssues: 'One end rail is loose and needs securing. Some tread tape is missing or damaged',
                functionalIssues: 'A couple of outrigger wheels are loose and need securing',
                cosmeticIssues: 'One skirt board is missing a bracket',
                tagAffixed: true
            }
        ],
        selectedParts: []
    }
];

// Sample work order data for office view
const OFFICE_WORK_ORDERS = {
    wo1: {
        jobNumber: '17208',
        jobType: 'Repair',
        status: 'Parts Received',
        customerId: 'cust1',
        locationId: 'loc1',
        locationName: 'Ripley High School',
        address: '254 S Jefferson St, Ripley, TN 38063',
        contactName: 'Chris McCorkle',
        contactPhone: '(731) 635-2642',
        description: 'Install safety strap on Goal 5. Lift rental required - 40\' lift will be on site.',
        partsLocation: 'Floyd\'s house - dropping at Millington HS',
        specialInstructions: 'Customer will have gym cleared by 8am. Enter through back door - front office doesn\'t open until 9.',
        scheduledDate: '2026-01-22',
        scheduledTime: '08:00',
        assignedTo: 'TNBSTeam 2',
        confirmedWith: 'Mike Mann',
        confirmedBy: 'Savannah Kirkland',
        confirmedDate: '2026-01-23'
    },
    wo2: {
        jobNumber: '17209',
        jobType: 'Inspection',
        status: 'Scheduled',
        customerId: 'cust1',
        locationId: 'loc2',
        locationName: 'Ripley Middle School',
        address: '309 Charles Griggs St, Ripley, TN 38063',
        contactName: 'Janet Williams',
        contactPhone: '(731) 635-1500',
        description: 'Annual bleacher inspection - Main Gym. Complete full inspection checklist for 6-tier Hussey bleacher system.',
        partsLocation: 'No parts - inspection only',
        specialInstructions: '',
        scheduledDate: '2026-01-22',
        scheduledTime: '11:00',
        assignedTo: 'TNBSTeam 2',
        confirmedWith: 'Janet Williams',
        confirmedBy: 'Kat',
        confirmedDate: '2026-01-21'
    },
    wo3: {
        jobNumber: '17195',
        jobType: 'Repair',
        status: 'Pink',
        customerId: 'cust4',
        locationId: 'loc11',
        locationName: 'Brentwood Academy',
        address: '219 Granny White Pike, Brentwood, TN 37027',
        contactName: 'John Smith',
        contactPhone: '(615) 373-0611',
        description: 'Goal 3 - safety strap installation. PINK: Wrong bracket sent - need EC-457 not EC-450.',
        partsLocation: 'Parts at TN Shop',
        specialInstructions: 'Customer upset about delay. Handle with care.',
        scheduledDate: '2026-01-20',
        scheduledTime: '09:00',
        assignedTo: 'Floyd Jackson',
        confirmedWith: 'John Smith',
        confirmedBy: 'Savannah Kirkland',
        confirmedDate: '2026-01-19',
        pinkReason: 'wrong_part',
        pinkNotes: 'Wrong bracket sent - need EC-457 not EC-450. Measurements: 4" x 6" mounting plate, 3/8" bolt holes.'
    }
};

let currentWorkOrder = null;

// Sample work order data for field staff view
const TECH_WORK_ORDERS = {
    two1: {
        jobNumber: '17208',
        jobType: 'Repair',
        locationName: 'Ripley High School',
        address: '254 S Jefferson St, Ripley, TN 38063',
        contactName: 'Chris McCorkle',
        contactPhone: '(731) 635-2642',
        description: 'Install safety strap on Goal 5. Lift rental required - 40\' lift will be on site.',
        partsLocation: 'Floyd\'s house - dropping at Millington HS',
        specialInstructions: 'Customer will have gym cleared by 8am. Enter through back door - front office doesn\'t open until 9.',
        scheduledTime: '8:00 AM'
    },
    two2: {
        jobNumber: '17209',
        jobType: 'Inspection',
        locationName: 'Ripley Middle School',
        address: '309 Charles Griggs St, Ripley, TN 38063',
        contactName: 'Janet Williams',
        contactPhone: '(731) 635-1500',
        description: 'Annual bleacher inspection - Main Gym. Complete full inspection checklist for 6-tier Hussey bleacher system.',
        partsLocation: 'No parts - inspection only',
        specialInstructions: '',
        scheduledTime: '11:00 AM'
    },
    two3: {
        jobNumber: '17210',
        jobType: 'Repair',
        locationName: 'Brentwood Academy',
        address: '219 Granny White Pike, Brentwood, TN 37027',
        contactName: 'John Smith',
        contactPhone: '(615) 373-0611',
        description: 'Replace deck boards (3) and seat slats (5) on home side bleachers Section B. All parts are Hussey.',
        partsLocation: 'TN Shop - Parts staged in repair bay',
        specialInstructions: 'School in session. Work during gym class break 1:30-3:00 PM only. Check in with front office first.',
        scheduledTime: '2:00 PM'
    }
};

// Photo upload state
// Photo upload state
let twoMainPhoto = null;
let twoAdditionalPhotosList = [];
let twoWrongPartPhoto = null;
let twoWrongPartSentPhoto = null;
let twoMoreWorkPhoto = null;

// Sample pipeline data representing jobs across all statuses
// v3: Added laborAmount, dateReceived, dateStarted, targetDate, dateCompleted for Project Tracker
const PIPELINE_JOBS = [
    { id: 'pl1', jobNumber: '17220', jobType: 'Repair', status: 'Estimate Sent', customer: 'Fayette County Schools', location: 'Fayette-Ware HS', description: 'Replace 3 gear motors, install safety tape on facing bleachers', amount: 8450, laborAmount: 3200, territory: 'Original', date: '2026-01-15', dateReceived: null, dateStarted: null, targetDate: null, dateCompleted: null },
    { id: 'pl2', jobNumber: '17218', jobType: 'Repair', status: 'Estimate Sent', customer: 'Wilson County Schools', location: 'Mt. Juliet HS', description: 'Install end caps, replace deck boards (6), install skirt board hardware', amount: 4280, laborAmount: 1850, territory: 'Original', date: '2026-01-13', dateReceived: null, dateStarted: null, targetDate: null, dateCompleted: null },
    { id: 'pl3', jobNumber: '17215', jobType: 'Repair', status: 'Estimate Sent', customer: 'Marshall County Schools', location: 'Forrest HS', description: 'Replace curved bullnose sections (4) and aisle step hardware', amount: 3175, laborAmount: 1200, territory: 'Original', date: '2026-01-10', dateReceived: null, dateStarted: null, targetDate: null, dateCompleted: null },
    { id: 'pl4', jobNumber: '17212', jobType: 'Inspection', status: 'Estimate Sent', customer: 'Houston County Schools', location: 'Houston County HS', description: 'Annual bleacher inspection - 3 gyms', amount: 1800, territory: 'Original', date: '2026-01-08' },
    { id: 'pl5', jobNumber: '17225', jobType: 'Repair', status: 'Estimate Sent', customer: 'Morgan County Schools', location: 'Albert P Brewer HS', description: 'Replace floor mount hardware and L brackets on behind bleachers', amount: 2950, territory: 'Southern', date: '2026-01-20' },
    { id: 'pl6', jobNumber: '17210', jobType: 'Repair', status: 'Accepted', customer: 'Williamson County Schools', location: 'Brentwood Academy', description: 'Replace deck boards (3) and seat slats (5) on home side bleachers Section B', amount: 5620, territory: 'Original', date: '2026-01-06' },
    { id: 'pl7', jobNumber: '17205', jobType: 'Repair', status: 'Accepted', customer: 'Madison County Schools', location: 'Jackson Career & Technology Elementary', description: 'Replace gear motor, install safety tape, replace deck supports', amount: 7340, territory: 'Original', date: '2026-01-03' },
    { id: 'pl8', jobNumber: '17222', jobType: 'Repair', status: 'Accepted', customer: 'Limestone County Schools', location: 'Ardmore HS', description: 'Install new basketball goals (4) with safety straps', amount: 12800, territory: 'Southern', date: '2026-01-17' },
    { id: 'pl9', jobNumber: '17200', jobType: 'Repair', status: 'Parts Ordered', customer: 'Lauderdale County Schools', location: 'Ripley HS', description: 'Install safety strap on Goal 5, replace mounting brackets', amount: 3890, territory: 'Original', date: '2025-12-28' },
    { id: 'pl10', jobNumber: '17198', jobType: 'Repair', status: 'Parts Ordered', customer: 'Blount County Schools', location: 'Fairview ES', description: 'Raise wall buck to new height, march bleachers back and attach to wall', amount: 4150, territory: 'Original', date: '2025-12-23' },
    { id: 'pl11', jobNumber: '17208', jobType: 'Repair', status: 'Parts Received', customer: 'Lauderdale County Schools', location: 'Ripley HS', description: 'Install safety strap on Goal 5. Lift rental required.', amount: 2450, territory: 'Original', date: '2025-12-20' },
    { id: 'pl12', jobNumber: '17202', jobType: 'Repair', status: 'Parts Received', customer: 'Tullahoma City Schools', location: 'East MS', description: 'Replace 4 damaged seats - customer provided seats', amount: 1200, territory: 'Original', date: '2025-12-30' },
    { id: 'pl13', jobNumber: '17196', jobType: 'Repair', status: 'Parts Received', customer: 'Coffee County Schools', location: 'Coffee County HS', description: 'Replace tier catches (3), install end caps, replace flex row rod assembly', amount: 5890, territory: 'Original', date: '2025-12-18' },
    { id: 'pl14', jobNumber: '17190', jobType: 'Repair', status: 'Scheduled', customer: 'Montgomery County Schools', location: 'Montgomery Co HS', description: 'Install seat back hardware, end caps, aisle step hardware, safety tape, skirt board bracket hardware', amount: 9200, territory: 'Original', date: '2025-12-10' },
    { id: 'pl15', jobNumber: '17188', jobType: 'Repair', status: 'Scheduled', customer: 'Dyer County Schools', location: 'Dyersburg State CC', description: 'Adjust motor tension, install floor step feet, replace L brackets', amount: 6780, territory: 'Original', date: '2025-12-05' },
    { id: 'pl16', jobNumber: '17185', jobType: 'Repair', status: 'In Progress', customer: 'Williamson County Schools', location: 'Ravenwood HS', description: 'Multi-gym repair: deck stabilizers, safety tape, anchors, seats, skirt board hardware across 8 locations', amount: 18500, laborAmount: 8500, territory: 'Original', date: '2025-11-28', dateReceived: '2025-12-05', dateStarted: '2026-01-22', targetDate: '2026-02-15', dateCompleted: null },
    { id: 'pl17', jobNumber: '17180', jobType: 'Repair', status: 'Complete', customer: 'Sumner County Schools', location: 'Gallatin HS', description: 'Annual inspection + replace 2 gear motors, install safety tape', amount: 6200, laborAmount: 2200, territory: 'Original', date: '2025-11-15', dateReceived: '2025-11-22', dateStarted: '2025-12-10', targetDate: '2026-01-15', dateCompleted: '2026-01-12' },
    { id: 'pl18', jobNumber: '17175', jobType: 'Inspection', status: 'Complete', customer: 'Robertson County Schools', location: 'Springfield HS', description: 'Annual bleacher inspection - 2 gyms, all passed', amount: 1200, territory: 'Original', date: '2025-11-10' },
    { id: 'pl19', jobNumber: '17170', jobType: 'Repair', status: 'Complete', customer: 'Maury County Schools', location: 'Spring Hill HS', description: 'Replace deck boards (8), install fence ties, replace bullnose', amount: 7800, territory: 'Original', date: '2025-11-05' },
    { id: 'pl20', jobNumber: '17195', jobType: 'Repair', status: 'Pink', customer: 'Williamson County Schools', location: 'Brentwood Academy', description: 'Goal 3 safety strap installation - wrong bracket sent, need EC-457 not EC-450', amount: 1850, territory: 'Original', date: '2025-12-15', pinkReason: 'Wrong/Missing Part' },
    { id: 'pl21', jobNumber: '17182', jobType: 'Repair', status: 'Pink', customer: 'Trousdale County Schools', location: 'Trousdale Co HS', description: 'Replace drive shaft - additional work discovered, floor anchors need replacement', amount: 3400, territory: 'Original', date: '2025-11-20', pinkReason: 'Additional Work Needed' },
    { id: 'pl22', jobNumber: '17224', jobType: 'Repair', status: 'Parts Ordered', customer: 'Colbert County Schools', location: 'Colbert Co HS', description: 'Replace basketball goal winch system and cables', amount: 5500, territory: 'Southern', date: '2026-01-18' },
    { id: 'pl23', jobNumber: '17226', jobType: 'Repair', status: 'Scheduled', customer: 'Lauderdale County AL Schools', location: 'Brooks HS', description: 'Install new Hussey bleacher system - auxiliary gym', amount: 22000, territory: 'Southern', date: '2026-01-22' }
];

let pipelineFilter = 'all';
let pipelineSortBy = 'status'; // 'status', 'oldest', or 'newest'

// ========== ADMIN: EMPLOYEES ==========
var EMPLOYEES = JSON.parse(localStorage.getItem('employees') || 'null') || [
    { id: 'emp1', firstName: 'Danny', lastName: 'Mendl', role: 'Inspector', email: 'danny@bleachers.com', phone: '(615) 555-0101', territory: 'Original' },
    { id: 'emp2', firstName: 'Jon', lastName: 'Roberts', role: 'Technician', email: 'jon@bleachers.com', phone: '(615) 555-0102', territory: 'Original' },
    { id: 'emp3', firstName: 'Floyd', lastName: 'Davis', role: 'Technician', email: 'floyd@bleachers.com', phone: '(615) 555-0103', territory: 'Original' },
    { id: 'emp4', firstName: 'Alex', lastName: 'Wiker', role: 'Technician', email: 'alex@bleachers.com', phone: '(615) 555-0104', territory: 'Original' },
    { id: 'emp5', firstName: 'Blake', lastName: 'Turner', role: 'Technician', email: 'blake@bleachers.com', phone: '(615) 555-0105', territory: 'Both' },
    { id: 'emp6', firstName: 'Troy', lastName: 'Martinez', role: 'Technician', email: 'troy@bleachers.com', phone: '(615) 555-0106', territory: 'Original' },
    { id: 'emp7', firstName: 'Sam', lastName: 'Cooper', role: 'Technician', email: 'sam@bleachers.com', phone: '(615) 555-0107', territory: 'Southern' },
    { id: 'emp8', firstName: 'Kat', lastName: 'Phillips', role: 'Office', email: 'kat@bleachers.com', phone: '(615) 555-0201', territory: 'Both' },
    { id: 'emp9', firstName: 'Charles', lastName: 'Reed', role: 'Office', email: 'charles@bleachers.com', phone: '(615) 555-0202', territory: 'Both' },
    { id: 'emp10', firstName: 'Bea', lastName: 'Santos', role: 'Office', email: 'bea@bleachers.com', phone: '(615) 555-0203', territory: 'Both' },
    { id: 'emp11', firstName: 'Lisa', lastName: 'Grant', role: 'Office', email: 'lisa@bleachers.com', phone: '(615) 555-0204', territory: 'Both' },
    { id: 'emp12', firstName: 'Samantha', lastName: 'Brooks', role: 'Office', email: 'samantha@bleachers.com', phone: '(615) 555-0205', territory: 'Both' },
    { id: 'emp13', firstName: 'Story', lastName: 'Nelson', role: 'Office', email: 'story@bleachers.com', phone: '(615) 555-0206', territory: 'Both' },
    { id: 'emp14', firstName: 'Christian', lastName: 'B', role: 'Admin', email: 'admin@bleachers.com', phone: '(615) 555-0001', territory: 'Both' }
];

var editingEmployeeId = null;

// ========== ADMIN: DATA MANAGEMENT ==========
var ADMIN_PARTS = JSON.parse(localStorage.getItem('adminParts') || 'null') || [
    { id: 'p1', partNum: '302-1000', name: 'Gear Motor Assembly', category: 'Power & Electrical', vendor: 'Hussey', price: 1245.00 },
    { id: 'p2', partNum: '150-2040', name: 'Deck Board - 10ft', category: 'Lumber & Decking', vendor: 'Hussey', price: 89.50 },
    { id: 'p3', partNum: '205-3100', name: 'Frame Mounting Bracket', category: 'Frames & Supports', vendor: 'Hussey', price: 17.85 },
    { id: 'p4', partNum: '400-1010', name: 'Wheel Assembly - 6in', category: 'Wheels & Bearings', vendor: 'Hussey', price: 134.00 },
    { id: 'p5', partNum: '110-5050', name: 'Seat Slat - Standard', category: 'Seating', vendor: 'Hussey', price: 42.75 },
    { id: 'p6', partNum: '110-5055', name: 'Seat Slat - Wide', category: 'Seating', vendor: 'Hussey', price: 56.25 },
    { id: 'p7', partNum: '302-1050', name: 'Motor Controller Board', category: 'Power & Electrical', vendor: 'Hussey', price: 387.00 },
    { id: 'p8', partNum: '250-1010', name: 'Aisle Rail - 42in', category: 'Rails & Steps', vendor: 'Hussey', price: 165.00 },
    { id: 'p9', partNum: 'DRP-8010', name: 'Basketball Goal Winch', category: 'Power & Electrical', vendor: 'Draper', price: 892.00 },
    { id: 'p10', partNum: 'DRP-8020', name: 'Backstop Pad - 6ft', category: 'Other', vendor: 'Draper', price: 225.00 },
    { id: 'p11', partNum: 'DRP-8030', name: 'Goal Height Adjuster', category: 'Hardware', vendor: 'Draper', price: 145.50 },
    { id: 'p12', partNum: 'IRW-3001', name: 'Irwin Frame Support Arm', category: 'Frames & Supports', vendor: 'Irwin', price: 78.00 },
    { id: 'p13', partNum: 'PKR-100', name: 'Porter Backboard - Glass', category: 'Other', vendor: 'Porter', price: 1850.00 },
    { id: 'p14', partNum: 'JP-2200', name: 'Jaypro Net System', category: 'Other', vendor: 'Jaypro', price: 340.00 },
    { id: 'p15', partNum: 'DB-500', name: 'Duckbill Anchor Kit', category: 'Hardware', vendor: 'Duckbill', price: 62.00 }
];

var VENDORS = JSON.parse(localStorage.getItem('vendors') || 'null') || [
    { id: 'v1', name: 'Hussey Seating Co', contact: 'Regional Rep', phone: '(207) 676-2271', email: 'sales@husseyseating.com', tier: '1', notes: 'Exclusive territory: KY, TN, AL, FL. ~70% of business. CSV pricing available.' },
    { id: 'v2', name: 'Draper', contact: 'Account Manager', phone: '(765) 987-7999', email: 'sales@draperinc.com', tier: '1', notes: 'Partnership deal for basketball equipment. CSV pricing available.' },
    { id: 'v3', name: 'Interkal', contact: '', phone: '', email: '', tier: '2', notes: 'Competitor dealer - bleachers' },
    { id: 'v4', name: 'Porter', contact: '', phone: '', email: '', tier: '2', notes: 'Basketball equipment' },
    { id: 'v5', name: 'Jaypro', contact: '', phone: '', email: '', tier: '2', notes: 'Sports equipment' },
    { id: 'v6', name: 'Irwin', contact: '', phone: '', email: '', tier: '2', notes: 'Seating' },
    { id: 'v7', name: 'Kodiak', contact: '', phone: '', email: '', tier: '2', notes: 'Seating' },
    { id: 'v8', name: 'Duckbill', contact: '', phone: '', email: '', tier: '3', notes: 'Anchor systems' },
    { id: 'v9', name: 'APDC', contact: '', phone: '', email: '', tier: '3', notes: 'Specialty parts' }
];

var editingPartId = null;
var editingVendorId = null;
var csvImportData = [];

function saveAdminParts() { localStorage.setItem('adminParts', JSON.stringify(ADMIN_PARTS)); }
function saveVendors() { localStorage.setItem('vendors', JSON.stringify(VENDORS)); }

// ========== COMPANY BULLETIN BOARD ==========
// Announcements visible on home page - managed by admin
var COMPANY_BULLETINS = JSON.parse(localStorage.getItem('companyBulletins') || 'null') || [
    { id: 'b1', type: 'info', title: 'Safety Training Reminder', message: 'Annual safety training due by February 28th. See Lisa for scheduling.', active: true, createdAt: '2026-02-01' },
    { id: 'b2', type: 'holiday', title: 'Office Closed', message: 'Office closed Monday, Feb 17th for Presidents Day. Emergency calls to Charles.', active: true, createdAt: '2026-02-05' },
    { id: 'b3', type: 'alert', title: 'New Inspection Forms', message: 'Updated inspection checklists are now live. Contact Kat with questions.', active: true, createdAt: '2026-02-03' }
];

function saveBulletins() { localStorage.setItem('companyBulletins', JSON.stringify(COMPANY_BULLETINS)); }

// Bulletin types with styling
const BULLETIN_TYPES = {
    info: { icon: 'ℹ️', color: '#2196F3', bg: '#e3f2fd' },
    alert: { icon: '⚠️', color: '#ff9800', bg: '#fff3e0' },
    holiday: { icon: '🎉', color: '#9c27b0', bg: '#f3e5f5' },
    safety: { icon: '🦺', color: '#f44336', bg: '#ffebee' },
    hr: { icon: '👥', color: '#4caf50', bg: '#e8f5e9' }
};

// ========== USER NOTIFICATIONS ==========
// Role-based notifications (office, admin, field)
var USER_NOTIFICATIONS = JSON.parse(localStorage.getItem('userNotifications') || 'null') || {
    office: [
        { id: 'n1', type: 'estimate_approved', title: 'Estimate Approved', message: 'Fayette-Ware HS accepted estimate #17220 ($8,450)', jobNumber: '17220', read: false, createdAt: '2026-02-06T09:30:00' },
        { id: 'n2', type: 'status_update', title: 'Job Completed', message: 'Gallatin HS repair marked complete by Danny', jobNumber: '17180', read: false, createdAt: '2026-02-05T16:45:00' },
        { id: 'n3', type: 'pink_created', title: 'Pink Job Created', message: 'Brentwood Academy #17195 - wrong bracket sent', jobNumber: '17195', read: true, createdAt: '2026-02-04T11:20:00' }
    ],
    admin: [
        { id: 'n1', type: 'estimate_approved', title: 'Estimate Approved', message: 'Fayette-Ware HS accepted estimate #17220 ($8,450)', jobNumber: '17220', read: false, createdAt: '2026-02-06T09:30:00' },
        { id: 'n2', type: 'status_update', title: 'Job Completed', message: 'Gallatin HS repair marked complete by Danny', jobNumber: '17180', read: false, createdAt: '2026-02-05T16:45:00' },
        { id: 'n3', type: 'pink_created', title: 'Pink Job Created', message: 'Brentwood Academy #17195 - wrong bracket sent', jobNumber: '17195', read: true, createdAt: '2026-02-04T11:20:00' },
        { id: 'n4', type: 'ops_submitted', title: 'Inspection Submitted', message: 'Jackson Career & Tech inspection ready for review', jobNumber: '16942', read: false, createdAt: '2026-02-03T14:00:00' }
    ],
    field: [
        { id: 'fn1', type: 'job_assigned', title: 'New Job Assigned', message: 'Ripley HS repair scheduled for tomorrow 8:00 AM', jobNumber: '17208', read: false, createdAt: '2026-02-06T08:00:00' },
        { id: 'fn2', type: 'schedule_changed', title: 'Schedule Updated', message: 'Ripley MS inspection moved to 11:00 AM', jobNumber: '17209', read: false, createdAt: '2026-02-05T17:30:00' },
        { id: 'fn3', type: 'parts_ready', title: 'Parts Ready', message: 'Parts for Brentwood Academy ready at TN Shop', jobNumber: '17210', read: true, createdAt: '2026-02-04T10:15:00' }
    ]
};

function saveNotifications() { localStorage.setItem('userNotifications', JSON.stringify(USER_NOTIFICATIONS)); }

// Notification types with styling
const NOTIFICATION_TYPES = {
    job_assigned: { icon: '📋', color: '#2196F3' },
    schedule_changed: { icon: '📅', color: '#ff9800' },
    parts_ready: { icon: '📦', color: '#4caf50' },
    estimate_approved: { icon: '✅', color: '#4caf50' },
    status_update: { icon: '🔄', color: '#9c27b0' },
    pink_created: { icon: '🩷', color: '#e91e63' },
    ops_submitted: { icon: '📝', color: '#2196F3' }
};
