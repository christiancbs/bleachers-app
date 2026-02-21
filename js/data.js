// ==========================================
// DATA & CONSTANTS
// All sample data, constants, and shared state
// ==========================================

// Parts catalog now uses Vercel Postgres via PartsAPI
// See js/utils/parts-api.js for API client

// Customer types - used for badges and filtering in Accounts
const CUSTOMER_TYPES = {
    county:      { label: 'County Schools',  icon: '🏛️', badge: 'badge-info' },
    collegiate:  { label: 'Collegiate',      icon: '🎓', badge: 'badge-purple' },
    private:     { label: 'Private School',  icon: '🏫', badge: 'badge-warning' },
    contractor:  { label: 'Contractor',      icon: '🏗️', badge: 'badge-secondary' },
    government:  { label: 'Government',      icon: '⚖️', badge: 'badge-info' },
    worship:     { label: 'Worship',         icon: '⛪', badge: 'badge-purple' },
    other:       { label: 'Other',           icon: '📋', badge: 'badge-secondary' }
};

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
// Customer data loaded from API — no hardcoded PII
const CUSTOMERS = [];

// Job types matching ServicePal
const JOB_TYPES = ['Go See', 'Service Call', 'Repair', 'Inspection'];

// Job statuses
const JOB_STATUSES = ['New', 'In Progress', 'Parts Ordered', 'Parts Received', 'Scheduled', 'Completed', 'Pink'];

// Stock shop locations (regional)
const STOCK_LOCATIONS = [
    { id: 'tn-shop', label: 'TN Shop', territory: 'Original' },
    { id: 'fl-shop', label: 'FL Shop', territory: 'Southern' },
    { id: 'al-shop', label: 'AL Shop', territory: 'Southern' }
];

// Local shop inventory — parts available in regional shops
// Data to be imported later. Format: { partNumber, productName, quantity, location, lastVerified }
const LOCAL_INVENTORY = [];

// Pink/Shit List reason categories
const PINK_REASONS = [
    { value: 'Wrong Part', label: 'Wrong/Missing Part', icon: '🔧', color: '#e65100', bg: '#fff3e0' },
    { value: "Can't Access", label: "Can't Access / Gym In Use", icon: '🚪', color: '#1565c0', bg: '#e3f2fd' },
    { value: 'Additional Work', label: 'Additional Work Needed', icon: '⚠', color: '#e65100', bg: '#fff3e0' },
    { value: 'Equipment Issue', label: 'Equipment Issue (Lift, etc.)', icon: '🏗', color: '#c62828', bg: '#fce4ec' },
    { value: 'Customer Not Ready', label: 'Customer Not Ready', icon: '🏫', color: '#1565c0', bg: '#e3f2fd' },
    { value: 'Safety Concern', label: 'Safety Concern', icon: '🛑', color: '#c62828', bg: '#fce4ec' },
    { value: 'Scope Change', label: 'Scope Change / New Estimate', icon: '📋', color: '#2e7d32', bg: '#e8f5e9' },
    { value: 'Weather/Access', label: 'Weather / Site Access', icon: '⛅', color: '#1565c0', bg: '#e3f2fd' },
    { value: 'Other', label: 'Other', icon: '📝', color: '#616161', bg: '#f5f5f5' }
];

// Common procurement notes for estimate builder dropdown
const COMMON_PROCUREMENT_NOTES = [
    { text: 'Customer responsible for disposal of removed materials', category: 'disposal' },
    { text: 'Customer to provide dumpster/roll-off', category: 'disposal' },
    { text: 'Lift rental required - confirm provider', category: 'equipment' },
    { text: 'Customer to provide lift', category: 'equipment' },
    { text: 'Plywood required for floor protection', category: 'equipment' },
    { text: 'Customer to clear gym before arrival', category: 'access' },
    { text: 'Overnight work - gym cleared by end of school day', category: 'access' },
    { text: 'Truck delivery - confirm site access', category: 'access' },
    { text: 'Enter through back/loading dock', category: 'access' }
];

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

// Sample inspection data — no hardcoded PII
const SAMPLE_INSPECTION_JOBS = [];

// Sample work order data for office view — no real PII
const OFFICE_WORK_ORDERS = {};

let currentWorkOrder = null;

// Sample work order data for field staff view — no real PII
const TECH_WORK_ORDERS = {};

// Photo upload state
let twoMainPhoto = null;
let twoAdditionalPhotosList = [];
let twoWrongPartPhoto = null;
let twoWrongPartSentPhoto = null;
let twoMoreWorkPhoto = null;

// Pipeline data now loaded from Jobs API — no hardcoded sample data
const PIPELINE_JOBS = [];

let pipelineFilter = 'all';
let pipelineSortBy = 'status'; // 'status', 'oldest', or 'newest'

// ========== ADMIN: EMPLOYEES ==========
// Employee data loaded from localStorage only — no hardcoded defaults
var EMPLOYEES = JSON.parse(localStorage.getItem('employees') || '[]');

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

// Vendor data loaded from localStorage only — no hardcoded contact info
var VENDORS = JSON.parse(localStorage.getItem('vendors') || '[]');

var editingPartId = null;
var editingVendorId = null;
var csvImportData = [];

function saveAdminParts() { localStorage.setItem('adminParts', JSON.stringify(ADMIN_PARTS)); }
function saveVendors() { localStorage.setItem('vendors', JSON.stringify(VENDORS)); }

// ========== COMPANY BULLETIN BOARD ==========
// Announcements visible on home page - managed by admin
// Bulletins loaded from localStorage only — no hardcoded defaults
var COMPANY_BULLETINS = JSON.parse(localStorage.getItem('companyBulletins') || '[]');

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
// Notifications loaded from localStorage only — no hardcoded defaults
var USER_NOTIFICATIONS = JSON.parse(localStorage.getItem('userNotifications') || '{"office":[],"admin":[],"field":[]}');

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
