# Bleachers & Seats - Complete App Development Reference

**Last Updated:** January 2026
**Purpose:** Comprehensive context document for custom app development with Atiba

---

## Table of Contents
1. [Business Overview](#business-overview)
2. [Brand Identity](#brand-identity)
3. [Current Pain Points](#current-pain-points)
4. [Current Systems & Workflow](#current-systems--workflow)
5. [System Integration Map](#system-integration-map)
6. [Primary Goal](#primary-goal)
7. [Budget & Timeline](#budget--timeline)
8. [Vendor Information](#vendor-information)
9. [Key Requirements](#key-requirements)
10. [QuickBooks Integration](#quickbooks-integration)
11. [Systems to Replace](#systems-to-replace)
12. [Current Documents & Forms](#current-documents--forms)
13. [Atiba Prototype Review](#atiba-prototype-review)
14. [Critical Questions for Atiba](#critical-questions-for-atiba)
15. [Scope Decisions](#scope-decisions)
16. [Success Criteria](#success-criteria)
17. [Technical Considerations](#technical-considerations)

---

## Business Overview

**Company:** Bleachers & Seats
**Location:** Nashville, TN
**Website:** bleachersandseats.com
**Territory:** Kentucky, Tennessee, Alabama, Florida

**Primary Services:**
- Bleacher inspections (annual safety inspections)
- Bleacher/seating repairs (Repair After Inspection - RAI)
- Basketball equipment installation and repair
- Divider curtains, wall pads, scoreboards, etc.

**Key Business Relationships:**
- **Hussey Seating Co** - Exclusive territory dealer for KY, TN, AL, FL (~70% of business)
- **Draper** - Partnership deal for basketball equipment (~70% of business combined with Hussey)

**Team Structure:**
- Field inspectors (use tablets/iPads on-site)
- Office staff (procurement, scheduling, operations review)
- Sales team
- Field technicians (complete repair work)

---

## Brand Identity

**Logo:** "BLEACHERS" (green) AND "SEATS" (navy/purple) .com

**Tagline:** "Professional, Accurate, On-Time"

**Brand Promise Alignment with App Goals:**
- **Professional** → Replace handwritten PSFs with polished digital forms and reports
- **Accurate** → Eliminate transcription errors through system integration
- **On-Time** → Streamline workflow to prevent delays from manual data entry

**Current Reality:** Disconnected systems work AGAINST brand identity
- Manual transcription creates inaccuracy
- Inspector after-hours work delays submissions
- Multiple manual entry steps slow down the entire process

---

## Current Pain Points

### 1. Inspector After-Hours Work (PRIMARY PAIN POINT - #1 Priority)

**The Problem:**
- Inspector completes on-site inspection during work day using iPad/tablet
- Inspector uses ServicePal for inspection form and handwritten notes
- **After hours (unpaid):** Inspector must review all inspection notes again
- Inspector manually searches Dropbox/ShareDrive for vendor catalogs (PDFs, physical books)
- Inspector looks up part numbers one by one
- Inspector handwrites Parts Specification Forms (PSFs)
- **Can take hours per inspection** for unpaid after-hours work
- This is the #1 problem the app MUST solve

**Why This Happens:**
- Parts catalog not digitized or searchable
- No way to select parts during inspection
- ServicePal doesn't integrate with parts database
- Inspector has to do the work twice: once on-site, once after hours

### 2. Procurement Manual QB Estimate Creation

**The Problem:**
- Office receives handwritten PSFs from inspector
- Procurement manually types EVERY line item into QuickBooks
- 50+ line items per estimate is common
- Procurement searches through pricing sheets for part numbers and prices
- Sometimes inspector doesn't provide part number, so procurement has to figure out needed parts
- Slow, error-prone, extremely time-consuming
- Takes 30+ minutes to create one estimate

**Current Process:**
1. Receive handwritten PSF
2. Search pricing sheets for each part number
3. Look up price for each part
4. Manually type into QuickBooks: part #, description, quantity, price
5. Repeat 50+ times
6. Calculate labor costs
7. Review for errors

### 3. Operations Review Process (Exists Only to Catch Errors)

**The Problem:**
- Entire back-checking process exists specifically to catch transcription errors during quoting
- Operations Review double-checks:
  - Correct parts are being called out to complete the job
  - Part numbers match what inspector documented
  - Pricing is accurate
  - Labor hours are correctly estimated
- This is wasted effort that wouldn't be needed with integrated systems

**Quote from Retrospective:**
> "The Ops Review process is a way we double check we have transcribed the correct info during quoting as mistyping can cause direct negative financial implications. Procurement goes through both inspections and parts spec forms to confirm: correct parts are being called out to complete the job, to list the part numbers and pricing, list the labor hours needed to complete the job."

### 4. Disconnected Systems & Excessive Manual Data Entry

**The Problem:**
- **ServicePal** (inspections/work orders) - no integration with anything
- **Salesmate** (CRM) - manual entry
- **QuickBooks** (accounting) - manual entry from every other system
- **Excel Project Tracker** - manual entry from QB
- **Excel Inventory** - manual searching and updating
- **Homebase** (payroll) - manual export to QB
- **Vendor Platforms** (Hussey, Draper, etc.) - separate logins for pricing
- No data flows between systems automatically
- Every handoff point creates opportunity for errors

**Data Re-Entry Examples:**
1. Inspector fills out ServicePal inspection
2. Inspector handwrites PSF (same data, after hours)
3. Procurement types PSF into QuickBooks (3rd time entering same data)
4. Accepted estimate data manually copied to Excel Project Tracker (4th time)
5. Parts info manually entered into Excel Inventory (5th time)
6. ServicePal work order manually created from QB estimate (6th time)

### 5. Inventory Visibility Issues

**The Problem:**
- Procurement must manually search through Excel inventory sheets for each job
- No systematic checking - often relying on memory
- Leads to ordering parts that are already in stock
- No way to see inventory availability during quoting
- Parts pull list manually created, Excel manually updated when parts pulled
- No connection between inventory and scheduled jobs

### 6. Pink Jobs (Incomplete Jobs)

**The Problem:**
- Jobs that weren't completed on first visit
- Poor job prep and communication lead to incomplete jobs
- Technician arrives on-site missing critical information:
  - Special equipment needed
  - Parts not available
  - Customer scheduling issues
  - Key building access not arranged
- Need better way to prep jobs and track requirements before scheduling
- Need tracking for pink job resolution attempts and customer sensitivity

---

## Current Systems & Workflow

### System Inventory

| System | Current Use | Pain Points | Keep or Replace |
|--------|-------------|-------------|-----------------|
| **ServicePal** | Inspections, work orders, form library | No QuickBooks integration, no parts catalog, creates work orders manually | ❌ REPLACE |
| **Salesmate** | CRM - customer tracking, sales pipeline | Manual entry, basic functionality, could be simplified | ❌ REPLACE with basic customer management |
| **QuickBooks** | Accounting, estimates, invoicing, P.O.s, A/P, A/R, bookkeeping, payroll, HR | Manual estimate creation (30+ min each), parts don't exist as items | ✅ KEEP & INTEGRATE |
| **Excel - Project Tracker** | Job status tracking, scheduling pipeline | Manual entry from accepted estimates, no real-time updates | ❌ REPLACE with digital board |
| **Excel - Inventory** | Parts inventory tracking | Manual searching, manual updates when parts pulled | ❌ REPLACE with integrated inventory |
| **Excel - Accepted Estimates** | Track recently accepted orders, know when to order parts | Manual updates from QB | ❌ REPLACE with integrated tracker |
| **Homebase** | Payroll, timeclock with geolocation | Manual export to QB for payroll processing | ✅ KEEP (works well) |
| **Vendor Platforms** | Hussey, Draper, other vendor portals for quotes/pricing | Separate logins, no integration, pricing not in central location | ⚠️ KEEP but integrate pricing data |
| **ShareDrive** | Document storage, reference materials, pricing sheets | Hunting through folders for part catalogs | ✅ KEEP (may still be useful) |
| **Dropbox** | Document storage shared with field staff | Part catalog hunting, job reference materials | ⚠️ KEEP but reduce reliance |
| **GroupMe** | Real-time team communication | Works well for current needs | ✅ KEEP |
| **Outlook** | Email, customer confirmations | Manual processes | ✅ KEEP |
| **MailChimp** | Occasional blast emails (trade show reminders, annual inspection reminders) | Works for current needs | ✅ KEEP |

### Current Workflow - Track 1: Inspections Only

**Simple inspection workflow (no repairs needed):**

1. **Lead Generation** → Salesmate CRM (manual entry)
2. **Schedule Inspection** → Manual scheduling
3. **Inspector On-Site** → Completes inspection in ServicePal (iPad/tablet)
4. **After Hours (Unpaid)** → Inspector creates handwritten PSF
5. **Submit to Office** → PSF physically or digitally submitted
6. **Office Review** → Review handwritten PSF
7. **Manual QB Entry** → Type 50+ line items into QuickBooks estimate
8. **Send to Customer** → Email estimate from QB
9. **Customer Accepts** → Tracked in Excel
10. **Invoice Customer** → Bill through QuickBooks

### Current Workflow - Track 2: Repair After Inspection (RAI) Service Projects

**Complex repair project workflow:**

1. **Inspection Identifies Issues** → ServicePal inspection documents deficiencies
2. **After Hours (Unpaid)** → Inspector creates handwritten PSF with part numbers
3. **Office Receives PSF** → Handwritten form submitted
4. **Operations Review Process:**
   - Procurement cross-checks PSF against inspection report
   - Fills in missing part numbers (if inspector couldn't find them)
   - Requests quotes from vendors (1-4 week lag time)
   - Manually searches Excel inventory sheets to check parts availability
   - Often discovers parts already in stock AFTER ordering new ones
5. **Manual QB Estimate Creation** → Type 50+ line items (part #, description, qty, price, labor)
6. **Send to Customer** → Email estimate
7. **Customer Accepts/Negotiates** → May go through multiple revisions
8. **Accepted Estimate** → Manually entered into Excel "Accepted Estimates" tracker
9. **Procurement Orders Parts:**
   - Places P.O.s with vendors (Charles, Bea, Lisa handle different vendor relationships)
   - Manually tracks P.O. numbers and expected delivery
   - Updates Excel tracker
10. **Track Shipments** → Manual tracking in Excel with delivery dates, notes
11. **Parts Arrive** → Operations (Samantha) receives shipment
12. **Update Inventory** → Manually update Excel inventory sheet
13. **Parts Pull** → Procurement creates parts pull list for upcoming jobs
14. **Schedule Job** → When parts received and staged, job marked green in Project Tracker, ready to schedule
15. **Customer Confirmation** → Call or email customer to confirm job date, gym availability, key contacts, building access
16. **Create Work Order in ServicePal** → Manually copy job details from QB into ServicePal work order, attach forms for tech to complete
17. **Weekly Schedule Created** → Manually assign techs based on location clusters, skill sets, parts burden, equipment needs
18. **Monday Morning Meeting** → Review upcoming week's jobs, discuss special requirements
19. **Tech Completes Work** → View work order on iPad, document completion, upload photos
20. **Partial Completion = Pink Job** → If issues discovered, job marked pink, goes to holding queue
21. **Complete Job** → Mark complete in ServicePal
22. **Invoice Customer** → Create invoice in QuickBooks
23. **Sales Follow-Up** → Annual inspection reminders for next year

**Key Inefficiency Points in Current Workflow:**
- Inspector does work twice (on-site + after hours unpaid)
- Multiple manual data entry steps (same data entered 4-6 times)
- No real-time part pricing during quoting
- Excel-based tracking requires constant manual updates
- Handwritten forms require transcription with error-checking
- No inventory visibility during parts selection
- Vendor quote lag time (1-4 weeks)

---

## System Integration Map

### Current Data Flow (Manual Handoffs)

```
ServicePal Inspection
    ↓ (manual - inspector after hours)
Handwritten PSF
    ↓ (manual - procurement typing)
QuickBooks Estimate
    ↓ (email)
Customer
    ↓ (acceptance)
Cash & PO Report Email (accepted estimates list)
    ↓ (manual entry)
Excel Project Tracker
    ↓ (manual entry)
Excel Inventory
    ↓ (manual)
ServicePal Work Order Creation
    ↓ (completion)
QuickBooks Invoice
```

### Additional Manual Processes

**Homebase → QuickBooks:**
- Payroll data exported from Homebase
- Manually entered into QuickBooks for payroll processing
- Geolocation data shows where techs punched in/out
- This is NOT a major pain point (Homebase works well)

**Vendor Platforms (Separate):**
- Hussey portal (login required)
- Draper portal (login required)
- 13+ other vendor platforms
- No centralized pricing database
- Inspectors search Dropbox/ShareDrive for PDF catalogs

**Quote from Retrospective:**
> "Pricing sheets and inspection reports do not communicate with QuickBooks, requiring manual data entry that is time-consuming and error-prone. An entire back-checking process exists specifically to catch transcription errors during quoting."

---

## Primary Goal

**Build proprietary software to streamline procurement and inspection inefficiencies**

### Success Metrics

1. ✅ **Inspectors stop doing after-hours PSF work** (MUST HAVE - #1 priority)
2. ✅ **Office can generate QB estimate in <60 seconds** instead of 30+ minutes
3. ✅ **Single source of truth for job/parts data** - eliminate duplicate data entry
4. ✅ **Eliminate Excel trackers** - replace with integrated digital system
5. ✅ **Reduce "Pink Jobs"** through better job prep and requirement tracking before scheduling

### What Success Looks Like

**For Inspectors:**
- Complete inspection on-site
- Search digital parts catalog while inspecting
- Select parts with quantities in real-time
- Submit complete PSF before leaving site
- **NO after-hours work**
- Works offline (schools have poor WiFi)

**For Office/Procurement:**
- Receive complete digital PSF with photos
- Review and edit if needed
- Click one button → QuickBooks estimate generated
- See inventory availability before ordering parts
- Track parts ordering and delivery in one system
- View job pipeline in visual board

**For Technicians:**
- See assigned work orders on mobile device
- View job details, parts list, parts location (shop vs on-site)
- Upload photos of completed work or new issues
- Document partial completions (pink jobs)

**For Sales:**
- See job backlog and status
- Know when annual inspections are due
- Follow up with customers systematically

---

## Budget & Timeline

**Budget:** $80,000 - $100,000
**Target:** $75,000 - $85,000 (with scope reductions)
**Timeline:** 6 months
**Dev Team:** Atiba (Nashville-based)
**Beta Testing:** Christian + 1 inspector

### Development Priorities (Must Have for Phase 1)

1. ✅ **Eliminate inspector after-hours PSF work** (CRITICAL - #1)
2. ✅ **Auto-generate QB estimates** (CRITICAL - #1)
3. ✅ **Digital parts catalog** (CRITICAL - searchable, offline-capable)
4. ✅ **Project tracking** (replace Excel tracker)
5. ✅ **Basic inventory management** (parts ordering, receiving, job linking)
6. ⚠️ Everything else = Phase 2

### Potential Scope Reductions to Hit Budget

**Cut These to Save $17-26k:**

| Feature | Current Atiba Design | Simplified Version | Est. Savings |
|---------|---------------------|-------------------|--------------|
| Sales Dashboard (Page 3) | Full CRM with pipeline, forecasting, win/loss tracking | Basic customer list using QB customer data | $8-12k |
| Analytics Dashboard (Page 10) | Revenue trends, leaderboards, performance metrics | Simple number cards (jobs completed, revenue, etc.) | $3-5k |
| Employee Management (Page 7) | Full HR-style employee directory | Minimal user management for assignments | $2-3k |
| Weekly Schedule (Page 9) | Drag-and-drop scheduling by truck/crew | Simple list view of assignments | $4-6k |

**Estimated Savings:** $17,000 - $26,000

**Phase 1 Target Budget:** $75,000 - $85,000

---

## Vendor Information

### Tier 1 - Primary Partners (~70% of business)

**Hussey Seating Co** (Exclusive Territory: KY, TN, AL, FL)
- Bleachers/seating primary vendor
- Gateway to other products
- ~1,000 parts in catalog
- Can provide CSV format (part #, description, price)
- Have online portal (separate login)

**Draper** (Partnership Deal)
- Basketball equipment primary vendor
- Can provide CSV format
- Have online portal (separate login)

### Tier 2 - Secondary Vendors (~20% of business)

- **Interkal** (competitor dealer - bleachers)
- **Porter** (basketball)
- **Jaypro** (sports equipment)
- **Irwin** (seating)
- **Kodiak** (seating)

### Tier 3 - Occasional/Specialty (~10%)

~13 additional vendors for specific parts/situations:
- Duckbill
- APDC
- EC-series
- GISL
- And others as needed

### Cross-Vendor Compatibility

**Important:** Real jobs often require parts from 6+ vendors on the same project

- Sometimes do vendor-to-vendor replacements (Hussey part on Irwin bleacher)
- Sometimes can retrofit or cross-vendor install
- **Inspectors need to search across ALL vendors, not just one at a time**
- Multi-vendor selection on same PSF is common

### Current Part Catalog Status

- Parts live in vendor catalogs (PDFs, physical books in shop)
- Some vendors provide CSV (part #, description, price - **no images**)
- Parts do NOT exist in QuickBooks currently as items/products
- No centralized database
- Inspectors hunt through Dropbox folders for PDF catalogs
- **Photos of parts are helpful but optional** (can add in Phase 2)

---

## Key Requirements

### 1. Mobile Inspection App (Tablet/Laptop - iOS Priority)

**Must Be Offline-Capable** (CRITICAL - schools often have poor WiFi)

**Core Features:**
- Equipment details entry (bleacher type, tiers, manufacturer, model, location)
- Inspection checklist (understructure, top side)
  - Can be simplified from current 14-item understructure + 9-item top side
  - Focus on key safety/functional/cosmetic issues
- Deficiency documentation (text + specific location: Section, Row, Frame, Tier)
- Photo capture (attach photos to specific findings)
- **Digital part search & selection** (THE KEY FEATURE)
- Real-time PSF creation as inspector works
- Submit when online (sync when WiFi available)
- Works offline, syncs when connection restored

**Part Search Requirements:**
- Search by:
  - Keyword ("seat slat", "deck board", "motor")
  - Part number
  - Equipment type
  - Manufacturer
- **Must support multi-vendor selection on same job**
- Search results across ALL vendors at once (not limited to one vendor at a time)
- Select part → add quantity → add to PSF
- See part: number, description, vendor, current price
- Optional: photo of part (helpful but not Phase 1 requirement)

**Offline Functionality Requirements:**
- Parts catalog must be available offline (download/sync when online)
- Inspection form must work offline
- Photos must be captured and stored locally
- Submit/sync when connection available
- Show offline indicator and sync status

### 2. Digital Parts Catalog (Backend)

**Initial Scope:**
- Import Hussey + Draper catalogs (CSV format)
- Part #, description, vendor/manufacturer, current price
- Searchable by keyword, part number, equipment type, manufacturer
- Equipment compatibility tagging (optional Phase 1, important Phase 2)
- Photos optional (can add later)

**Pricing Updates:**
- Vendor prices change annually
- Need ability to import new CSV price lists
- Version history (know when prices changed)
- Override pricing for special quotes

**Part Number Management:**
- Some parts don't have part numbers initially
- Ability to add notes/descriptions
- Procurement can fill in missing part numbers during review

### 3. Office Review Portal (Web App)

**Core Features:**
- Dashboard: view submitted inspections
- Inspection detail view:
  - See digital PSF with photos
  - Review parts list with quantities
  - Edit/add/remove parts if needed
  - Add labor hours estimate
  - Add notes for quote or for field techs
- Track parts awaiting vendor quotes (simple status field: "Pending Quote", "Quote Received")
- Approve inspection (ready to generate estimate)
- **Generate QuickBooks Estimate** (ONE BUTTON - the killer feature)

**QuickBooks Export:**
- One-click estimate generation
- Push all line items: part #, description, qty, price
- Push labor costs
- Link to customer record in QB
- Success confirmation or error handling
- Ability to view QB estimate (link or confirmation)

### 4. QuickBooks Integration (CRITICAL)

**Quote from Context:**
> "If it didn't happen in QuickBooks, it didn't happen at all"

**QuickBooks is Used For:**
- Estimates
- Billing/invoicing
- P.O.s (purchase orders)
- A/P (accounts payable)
- A/R (accounts receivable)
- Bookkeeping and accounting
- Payroll
- HR
- Everything financial

**QuickBooks Version:** QuickBooks Online (web app - most team members use this)

**Required Integration - Read from QB:**
- Customer list (link estimates to existing customers)
- Existing estimates/invoices (optional: job history)

**Required Integration - Write to QB:**
- Create estimates programmatically via QB API
- Include all line items: part #, description, qty, price
- Include labor line items
- Link to customer
- Success/error handling

**Technical Approach Options:**
1. Create QB items on-the-fly when estimate generated (non-inventory items)
2. Pre-populate QB with all vendor catalog parts (could be 1,000+ items)
3. **Hybrid (Recommended):** App maintains parts DB, pushes non-inventory line items to estimates

**Why Hybrid is Best:**
- QB doesn't need to store 1,000+ parts as items
- Estimates still show full detail (part #, description, price)
- App is source of truth for parts catalog
- QB is source of truth for financial data

### 5. Parts & Inventory Management

**Procurement Workflow:**
- View approved inspections ready for parts ordering
- See parts needed across multiple jobs
- Check inventory for parts availability
- Place P.O.s with vendors (Charles - Hussey, Bea - others, Lisa - others)
- Track P.O. numbers and expected delivery dates
- Track shipment notes/updates
- Mark parts as received (Operations - Samantha)
- Link received parts to specific jobs
- Parts pull list for upcoming week
- Stage parts for pickup by techs or shipping to job site

**Inventory Features:**
- Current stock levels
- Parts location (TN shop, AL shop, etc.)
- Parts reserved for specific jobs
- Parts available for use
- Update stock when parts pulled for job
- Prevent double-ordering parts already in stock

### 6. Project Tracker (Replace Excel)

**Visual Pipeline - Kanban Board:**

Job statuses:
1. **Estimate Sent** (waiting for customer)
2. **Accepted** (customer approved, ready for parts ordering)
3. **Parts Ordered** (P.O.s placed, waiting for delivery)
4. **Parts Received** (all parts arrived and staged)
5. **Scheduled** (job on calendar, techs assigned)
6. **In Progress** (techs working on-site)
7. **Complete** (work finished, ready to invoice)
8. **Pink** (incomplete - holding for resolution)

**Board Features:**
- Drag-and-drop between statuses (Phase 2)
- Filter by: tech, county, status, customer
- Color coding (green = ready to schedule, pink = issue needs resolution)
- Job cards show: customer, location, job name, parts status, tech assigned, date
- Click job card → see full details

**Simple Table View Alternative (Phase 1):**
- List of jobs with status column
- Filter and sort capabilities
- Click row → see job details
- Update status via dropdown
- Saves $4-6k vs drag-and-drop UI

### 7. Work Orders (Mobile for Techs - Phase 1 Basic)

**Core Features:**
- View assigned work orders (today's jobs, upcoming)
- Job details:
  - Customer name, location
  - Job description
  - Parts list (what parts, quantity)
  - Parts location (TN shop, AL shop, shipped to site)
  - Special instructions
  - Customer contact info, key contact, building access info
- Mark job complete (simple checkbox)
- Photo upload for completed work
- Photo upload for new issues discovered (leads to pink job)
- Document partial completion (pink job notes)

**Phase 2 Features (Cut for Budget):**
- Time tracking integration with Homebase
- Advanced notes and deficiency documentation
- Digital signatures
- Detailed completion checklists

---

## QuickBooks Integration

### Current State

**QuickBooks is the Heart of Everything:**
- All financial data lives in QB
- All customer data lives in QB
- Estimates created in QB (manually - 30+ minutes each)
- Invoices created in QB
- **Parts do NOT currently exist in QB as items/products**
- Estimates are created manually by typing each line item

**Current Manual Process:**
1. Procurement receives handwritten PSF
2. Open QuickBooks
3. Create new estimate
4. Select customer
5. Type part #, description, qty, price (repeat 50+ times)
6. Add labor line items
7. Review for errors
8. Save estimate
9. Email to customer from QB

### Required Integration

**From QB → New App (Read):**
- Customer list (name, address, contact info, email)
- Existing estimates/invoices (optional: for job history)
- P.O. numbers (optional)

**From New App → QB (Write - CRITICAL):**
- Create estimates automatically with one click
- Include all line items:
  - Part # (or description if no part #)
  - Description
  - Quantity
  - Unit price
  - Line total
- Labor line items:
  - Description
  - Hours or flat rate
  - Price
- Link to customer record
- Estimate metadata (date, estimate number, notes)

### Technical Approach Options

**Option 1: Create QB Items On-the-Fly**
- When estimate generated, create non-inventory items in QB for each part
- Pros: QB has item record for reporting
- Cons: Could create 1,000+ items in QB, clutter items list

**Option 2: Pre-Populate QB with All Parts**
- Import entire parts catalog to QB as non-inventory items
- Pros: Parts exist in QB for easy manual quoting too
- Cons: 1,000+ items to manage, pricing updates require QB updates

**Option 3: Hybrid - App as Source of Truth (RECOMMENDED)**
- App maintains parts database
- When creating estimate, push non-inventory line items with full detail
- QB estimate shows: part #, description, qty, price (but not stored as items)
- Pros: Clean QB, app controls parts catalog, easy pricing updates
- Cons: Manual QB quotes still require typing

**Recommendation: Option 3 (Hybrid)**
- App is source of truth for parts catalog
- QB is source of truth for financial data
- Best of both worlds
- Easier to maintain and update pricing

### Pricing Updates

**Current Reality:**
- Vendor prices change annually (usually Jan/Feb)
- Need to import new CSV price lists
- Need version history (know what price was quoted at what date)
- Need ability to override pricing for special customers

**Requirements:**
- Import CSV price updates (Hussey, Draper, others)
- Pricing effective date tracking
- Historical pricing (know what was charged on old jobs)
- Manual price override for special quotes

### Success/Error Handling

**After Clicking "Generate QB Estimate":**
- Show loading/processing indicator
- Success: show confirmation with link to view estimate in QB
- Error: show clear error message (QB connection failed, customer not found, etc.)
- Retry option if failure
- Log errors for troubleshooting

---

## Systems to Replace

### ❌ ELIMINATE

**Salesmate (CRM)**
- Replace with: Simple customer/account management using QB customer data
- Savings: ~$8-12k if we avoid building full CRM

**ServicePal (Inspection/Work Orders)**
- Replace with: New mobile inspection app + work order system
- This is core functionality of new app

**Excel Project Tracker**
- Replace with: Digital project board (Kanban or table view)

**Excel Inventory Tracker**
- Replace with: Integrated inventory management system

**Excel Accepted Estimates**
- Replace with: Automatic population of project tracker from accepted QB estimates

**Handwritten PSFs**
- Replace with: Digital PSF creation during inspection

**Dropbox Part Number Hunting**
- Replace with: Searchable digital parts catalog

### ✅ KEEP & INTEGRATE

**QuickBooks (Accounting/Invoicing)**
- Keep: Absolutely - "If it didn't happen in QuickBooks, it didn't happen at all"
- Integrate: Read customer data, write estimates programmatically

**Homebase (Payroll/Time Tracking)**
- Keep: Works well for current needs
- Geolocation tracking is valuable
- May integrate in Phase 2 for time tracking on jobs

**ShareDrive (Document Storage)**
- Keep: May still be useful for reference materials, admin forms, etc.
- Reduce reliance: Parts catalogs move to app

**GroupMe (Team Communications)**
- Keep: Lightweight, works well for real-time updates
- Consider: Could new app provide better job-specific communication? (Phase 2)

**Outlook (Email)**
- Keep: Standard business email
- May integrate: Automated customer confirmations (Phase 2)

**MailChimp (Blast Emails)**
- Keep: Occasional use for trade show reminders, annual inspection reminders
- Consider: Could app send annual inspection reminders? (Phase 2)

### ⚠️ KEEP BUT REDUCE RELIANCE

**Vendor Platforms (Hussey, Draper, etc.)**
- Keep: Still need to place orders, get quotes for special items
- Reduce reliance: Import standard pricing so daily quoting doesn't require logging in

**Dropbox**
- Keep: Still useful for document sharing with field staff
- Reduce reliance: Parts catalogs move to app database

---

## Current Documents & Forms

### 1. Inspection Report Example (Brentwood Academy - 9/8/2025)

**Format:** 8-page detailed inspection in ServicePal

**Content:**
- Equipment details:
  - Manufacturer: Irwin
  - Bleacher type: 7 tiers
  - Location: Main gym, Section A
- Understructure checklist (14 items):
  - Motors, drive system, wheels, frames, hardware, safety features, etc.
  - Each item: Pass/Fail/NA + notes
- Top side checklist (9 items):
  - Rails, deck boards, seats, risers, tread, hardware, etc.
  - Each item: Pass/Fail/NA + notes
- Issue documentation with photos:
  - "Frame 10 tier 2 out of track"
  - Photo attached to specific finding
- Safety/Functional/Cosmetic categorization
- Inspector signature & certificate
- Multiple locations at one school (jobs can cover multiple gyms)

**Key Observations:**
- Very detailed and thorough
- Can be simplified for Phase 1 (14-item + 9-item checklists can be condensed)
- New workflow doesn't need to replicate 8-page format exactly
- Focus on documenting issues and parts needed

### 2. Parts Specification Form (PSF) Examples

**Current Format:** Handwritten forms, multiple pages

**Content:**
- Job info: Customer, location, date, inspector
- Parts table:
  - Part #
  - Description
  - Quantity
  - Cost (vendor price)
  - Customer Price (marked up)
  - Labor Price
- Service notes: "System needs grease, Tough Deck Support #2 needs jacked up"
- Technical diagrams (frame forms) - hand-drawn
- Multiple vendors on same job:
  - Duckbill parts
  - APDC parts
  - EC-series parts
  - Irwin parts
  - Hussey parts
  - All on one PSF

**Key Observations:**
- **This is what inspectors spend hours creating after work**
- Multi-vendor jobs are common (6+ vendors on one job)
- Service notes provide critical context for office and techs
- Cost vs Customer Price tracking (margin calculation)
- Labor pricing separate from parts pricing

**Phase 1 Simplifications:**
- Don't need Cost vs Customer Price tracking (can calculate in Excel if needed)
- Don't need digital frame forms (hand-drawn is fine for now)
- Do need: part #, description, qty, price, labor estimate, service notes

### 3. Work Order Example (Brentwood Academy - Job #15933)

**Format:** ServicePal work order viewed on tech's iPad

**Content:**
- Customer: Brentwood Academy
- Multi-location job:
  - Dalton gym
  - Facing Upper gym
  - Middle School gym
  - Kennedy gym
- Job confirmed with customer (contact: John Smith, facilities director)
- Parts location: TN Shop (staged and ready for pickup)
- Tech: Alex Wiker
- Hours worked: 13.5 hours
- Status: **Job NOT completed - issues discovered during work**
- Detailed technician notes:
  - "New frames will not work, reinstalled old frame"
  - "Need to order different part - EC-457 instead of EC-450"
  - "Customer requesting additional work on visitor bleachers"
- 6 photos uploaded:
  - Issue photos
  - Work-in-progress photos
  - Parts that didn't fit

**Key Observations:**
- Jobs can cover multiple locations at one school
- Parts staged at shop or shipped to site
- Customer contact info critical (key contact, phone, scheduling)
- Issues discovered during work are common (leads to pink jobs)
- Tech photos provide evidence and documentation
- Detailed notes help office understand what happened

**Phase 1 Requirements:**
- View work order with job details, parts list, customer contact
- Mark complete or mark pink (incomplete)
- Upload photos
- Add notes about issues or completion

**Phase 2 Nice-to-Haves:**
- Time tracking integration
- Digital signatures
- More detailed completion checklists

### 4. Cash In & PO Report

**Format:** Daily email sent to all office staff

**Content:**
- **Cash In section:**
  - Customer name
  - Amount paid
- **Purchase Orders section:**
  - Customer name
  - P.O. number
  - Vendor/PO
  - Amount
- **New Bleacher Purchase Orders section** (if any)

**Purpose:**
- Notifies office staff of accepted jobs that day
- Shows which customers paid (for commission calculation)
- Shows which purchase orders were placed
- **This Excel file is used for manual data entry into project tracker**

**Key Observation:**
- This is generated from QuickBooks data
- Manually created and emailed daily by Story (office manager)
- Data from this report manually entered into Excel trackers
- New app should auto-populate project tracker when QB estimate accepted

### 5. Project Tracker (Excel) - Two Territories

**Format:** Large Excel spreadsheet with color coding

**Territories:**
- Original Territory: Kentucky & Tennessee
- Southern Territory: Alabama & Northwest Florida

**Columns:**
- Customer/School
- Line Item (job description)
- Status (multiple status columns)
- Estimate Amount
- Estimate Date
- Accepted Date
- Parts Ordered Date
- Parts Received Date
- Scheduled Date
- Tech Assigned
- Comments/Notes
- Special Requirements

**Color Coding:**
- **Green** = Ready to schedule (parts received)
- **Pink** = Issues/incomplete
- **Blue** = Inspections (no parts needed)
- **Yellow** = Parts ordered, waiting
- **White/blank** = Backlog

**How It's Used:**
- Scheduling: see what jobs are ready (green)
- Planning: see what's in pipeline
- Filtering: by county, by tech, by status
- Job prep: check special requirements before scheduling

**Pain Points:**
- All manual entry from Cash & PO Report
- No real-time updates (someone has to update it)
- No link to QB or ServicePal
- Version control issues (multiple people editing)

### 6. Inventory (Excel)

**Format:** Excel spreadsheet with columns

**Columns:**
- SKU/Part Number
- Description
- Manufacturer
- Location (TN Shop, AL Shop, etc.)
- Unit (Each, Box, Roll, etc.)
- Quantity in Stock
- Cost
- Total Value
- Notes
- Dates (when received, when updated)

**How It's Used:**
- Procurement searches for parts before ordering
- Operations updates when parts received
- Parts pull tab: list of parts needed for upcoming jobs
- Update when parts pulled for job

**Pain Points:**
- Manual searching (Ctrl+F) for each part
- Often relying on memory instead of checking systematically
- Leads to double-ordering parts already in stock
- Manual updates when parts received or pulled
- No connection to scheduled jobs

---

## Atiba Prototype Review

### Atiba's Figma Screens Overview

Atiba has provided Figma mockups showing various screens. Here's what they've shown:

### ✅ Good Screens (Aligned with Needs)

**Page 2: Office Dashboard**
- Pipeline overview
- Alerts/notifications
- Quick actions
- **Assessment:** Good high-level view, helpful for office staff

**Page 4: Accounts & Equipment Registry**
- Customer/location management
- Equipment tracking by location
- **Assessment:** Good for tracking repeat customers and equipment history

**Page 5: Estimate Review Dashboard**
- Review PSF submitted by inspector
- Edit/approve
- **"Approve & Export"** button to generate QB estimate
- **Assessment:** This is the KEY screen - ONE BUTTON to QB estimate
- **⚠️ BUG SPOTTED:** Frame Mounting Bracket Unit Price shows "17.849999999999E" instead of "$17.85"

**Page 6: Project Tracker Board**
- Kanban-style job status tracking
- Columns: Accepted → Parts Ordered → Parts Received → Scheduled → In Progress
- **Assessment:** Good visual representation, replace Excel tracker

**Page 8: Parts & Inventory Management**
- P.O. tracking by vendor
- Received items tracking
- Link to jobs
- **Assessment:** Good for procurement workflow

**Page 9: Weekly Schedule**
- Tech/crew assignments by day
- **Assessment:** Visual, but could be simplified to table view to save $4-6k

**Page 11: Field Dashboard (Mobile)**
- Today's schedule
- Pending items
- Quick access to inspections and work orders
- **Assessment:** Good mobile landing page for inspectors

**Page 12: Inspections List (Mobile)**
- Shows inspection status:
  - In Progress
  - Submitted
  - Drafts
- **Assessment:** Good for tracking inspector's work

**Page 13: Digital Parts Specification Form (Mobile)**
- Project info
- Manufacturer dropdown (shows "Draper")
- Model dropdown
- Part search field
- **Assessment:** This is the KEY mobile screen for inspector
- **❓ QUESTIONS:** What happens after searching? Results screen? Part selection screen?

**Page 14: Work Orders (Mobile)**
- View assigned work orders
- **Assessment:** Good for tech workflow

### ❓ Questions & Concerns About Atiba's Design

**1. Inspection Form Screen Missing?**
- Page 12 shows list of inspections (In Progress, Submitted, Drafts)
- Page 13 jumps straight to PSF creation
- **Where is the actual inspection checklist/form?**
  - Equipment details entry screen?
  - Understructure/Top side checklists?
  - Issue documentation screen (document "Frame 10 tier 2 out of track")?
  - Deficiency categorization (Safety/Functional/Cosmetic)?

**2. Photo Capture Workflow?**
- No visible photo capture screens in Figma
- **How do inspectors take photos during inspection?**
- **How are photos attached to specific findings?**
- Current real-world example: Inspector finds broken part → takes photo → photo attached to that specific issue
- **How do photos appear in PSF and office review?**

**3. Part Search Flow Unclear**
- Page 13 shows:
  - Manufacturer dropdown
  - Model dropdown
  - Search field
- **What happens after inspector searches?**
  - Search results screen?
  - Part detail/selection screen?
  - How are parts added to PSF list with quantities?
  - Can inspector see price during search?
- **Is there a "shopping cart" view of selected parts?**

**4. Multi-Vendor Support?**
- Page 13 manufacturer dropdown shows "Draper"
- Real jobs need parts from 6+ vendors (Duckbill, APDC, Irwin, Hussey, etc.)
- **Can inspector search across all vendors at once?**
- **Or must they search one vendor at a time?**
- Current requirement: Inspector needs to find best part regardless of vendor

**5. Inspection → PSF Connection?**
- **Are these two separate workflows or integrated?**
  - Option A: Inspection Form → Document Issues → Create PSF from issues → Submit
  - Option B: Standalone PSF creation (inspector manually creates PSF separate from inspection)
- Real workflow: Inspection identifies issues → PSF lists parts to fix those issues
- **Which approach is Atiba's design?**

**6. QuickBooks Export Confirmation?**
- Page 5 shows "Approve & Export" button
- **What happens after clicking?**
  - Loading indicator?
  - Success confirmation screen?
  - Error handling display?
  - Link to view QB estimate?
  - Can user see what was sent to QB?

**7. Offline Mode Implementation?**
- Schools have poor WiFi - offline mode is CRITICAL
- **No visible offline indicator in designs**
- **How is sync status shown?**
- **What happens if inspector submits while offline?**
- **How does inspector know data is synced?**
- Offline requirements:
  - Parts catalog available offline (pre-downloaded)
  - Inspection form works offline
  - Photos captured and stored locally
  - Submit queued for when online

**8. Operations Review Process?**
- Current workflow: Procurement reviews PSF and cross-checks against inspection
- Fills in missing part numbers if inspector couldn't find them
- **How does office view the original inspection AND the PSF together?**
- **Can procurement see inspector's notes and photos while reviewing parts list?**

### 🚩 Potential Issues & Bugs

**Pricing Display Bug (Page 5):**
- Frame Mounting Bracket Unit Price: "17.849999999999E"
- Should display: "$17.85"
- Floating point display issue - needs proper currency formatting

### 📊 Scope Concerns (Over-Budget Features)

**Page 3: Sales Dashboard - Full CRM**
- Shows: pipeline, forecasting, deal stages, win/loss tracking
- **This looks like a full CRM replacement for Salesmate**
- Could save $8-12k by simplifying to:
  - Basic customer list (pulled from QB)
  - Simple activity log
  - Annual inspection reminder system (Phase 2)

**Page 10: Analytics Dashboard**
- Shows: revenue trends, leaderboards, performance metrics, charts
- **This is advanced analytics**
- Could save $3-5k by simplifying to:
  - Basic number cards (jobs completed this month, revenue, backlog count)
  - Export to Excel for detailed analysis
  - Advanced analytics = Phase 2

**Page 7: Employee Management**
- Shows: full HR-style employee directory with photos, roles, contact info
- **This duplicates Homebase and QB functionality**
- Could save $2-3k by:
  - Minimal user management (just for app login and assignment)
  - Pull employee data from QB or Homebase
  - No need for full HR module

**Page 9: Weekly Schedule - Drag-and-Drop**
- Shows: drag-and-drop scheduling by truck/crew
- **This is complex UI development**
- Could save $4-6k by starting with:
  - Simple list view of assignments
  - Filter by tech, date, location
  - Drag-and-drop scheduling = Phase 2 enhancement

**Total Potential Savings:** $17,000 - $26,000

---

## Critical Questions for Atiba

### Workflow & Missing Screens

**1. Where is the inspection form screen?**
- Show: Equipment Details entry
- Show: Understructure/Top Side checklists (can be simplified from current 14+9 items)
- Show: How inspector documents "Frame 10 tier 2 out of track" during inspection
- Show: Safety/Functional/Cosmetic categorization (or simplify this)

**2. How do inspections and PSFs connect?**
- Are they integrated or separate workflows?
- Real workflow requirement: Inspection identifies issues → PSF created from those issues
- Does inspector create PSF during inspection or after?
- Can office see both inspection report AND PSF together during review?

**3. How does photo capture work?**
- Show: Inspector finds broken part → Takes photo → Photo attached to finding
- Show: Photos appear in PSF review for office
- Show: Photos appear in work order for techs

**4. What is the exact inspector workflow start to finish?**
- Option A:
  1. Start inspection
  2. Enter equipment details
  3. Complete checklist items
  4. Document issues with photos
  5. Search parts catalog for each issue
  6. Select parts with quantities
  7. PSF auto-generated from inspection
  8. Submit
- Option B:
  1. Complete inspection (separate from PSF)
  2. Create standalone PSF
  3. Manually search and add parts
  4. Submit PSF
- **Which option is your design? We prefer Option A (integrated).**

### Part Search & Multi-Vendor Support

**5. How does part search support multiple vendors?**
- Show: Inspector searching across ALL vendors at once (not limited to one)
- Show: Search results displaying parts from Hussey, Draper, Irwin, Duckbill, etc.
- Show: PSF with parts from 6 different vendors on same job
- **This is critical - real jobs regularly use 6+ vendors**

**6. What is the complete part search flow?**
- Step 1: Inspector types keyword "seat slat"
- Step 2: Search results screen? (show part #, description, vendor, price)
- Step 3: Inspector selects a part
- Step 4: Enter quantity
- Step 5: Part added to PSF "shopping cart"
- Step 6: Repeat for all needed parts
- Step 7: Review all selected parts before submitting
- **Please show screens for each step**

**7. Can inspector see pricing during part selection?**
- Does inspector see vendor cost, customer price, or both?
- Or is pricing only visible to office during review?

### Technical Requirements

**8. How does offline mode work?**
- Show: Offline indicator when no connection
- Show: Sync status (syncing, synced, pending)
- How much of parts catalog is downloaded offline? (All? Top vendors only?)
- What happens if inspector submits while offline? (queued for sync?)
- Conflict resolution if online changes happened while offline?

**9. QuickBooks integration details**
- What happens after "Approve & Export" clicked on Page 5?
- Show: Success confirmation screen
- Show: Error handling screen (if QB connection fails)
- Show: Link to view QB estimate (or confirmation of estimate number created)
- Which QB API? (QuickBooks Online API - since we use QB Online)
- How are parts represented in QB estimate? (non-inventory line items? new items?)

**10. How does pricing update workflow work?**
- Procurement gets new CSV from Hussey with updated prices
- How is CSV imported?
- How are pricing changes tracked? (effective date, version history)
- Can procurement see "Price changed from $10.00 to $12.00 on 1/15/26"?

### Tech Stack & Architecture

**11. What is your proposed tech stack?**
- Frontend Mobile: React Native? Flutter? Native iOS/Android?
- Frontend Web: React? Vue? Angular?
- Backend: Node.js? Python (Django/Flask)? .NET? Ruby on Rails?
- Database: PostgreSQL? MongoDB? MySQL?
- Offline storage: SQLite? IndexedDB? Realm?
- QuickBooks integration: Official Intuit SDK? Custom API calls?
- File storage: AWS S3? Azure? Google Cloud?
- Authentication: Custom? Auth0? Firebase Auth?

**12. How is offline sync architected?**
- Local database on device (SQLite, Realm, etc.)
- Background sync when connection available?
- Conflict resolution strategy?
- How large is offline parts catalog database? (storage requirements)

**13. How are photos handled?**
- Captured and stored locally first?
- Uploaded when sync occurs?
- Compressed before upload? (file size optimization)
- Thumbnail generation?
- Cloud storage (S3, Azure, Google Cloud)?

### Budget & Scope

**14. What's included in $80-100k budget?**
- Development hours (how many developers, how many hours)?
- UI/UX design (Figma refinement, additional screens)?
- Project management?
- Testing (QA, user testing)?
- Deployment (app stores, web hosting, infrastructure)?
- Training (user training sessions, documentation)?
- Post-launch support (30 days? 60 days? bug fixes, adjustments)?

**15. If we simplify scope, what's the new price?**
- Core features only:
  - ✅ Inspection + PSF (mobile)
  - ✅ Office Review Portal (web)
  - ✅ QB Integration (one-click estimates)
  - ✅ Basic Project Tracker (table view, not drag-drop)
  - ✅ Parts & Inventory Management
  - ✅ Basic Work Orders (mobile)
- Cut features (Phase 2):
  - ❌ Full CRM/Sales Pipeline (use QB customer list)
  - ❌ Advanced Analytics Dashboard (basic numbers only)
  - ❌ Employee Management Module (minimal users only)
  - ❌ Drag-and-drop Scheduling (simple list view)
- **What would this simplified scope cost? Target: $65-75k**

**16. What is Phase 1 vs Phase 2 in your mind?**
- What do you consider "MVP" (minimum viable product)?
- What features would you recommend cutting to hit budget?
- What features would you recommend deferring to Phase 2?

### Timeline & Delivery

**17. What is the development timeline?**
- Discovery/planning: X weeks
- Design finalization: X weeks
- Development sprints: X sprints of X weeks each
- Testing & QA: X weeks
- Deployment: X weeks
- Training: X weeks
- **Total: 6 months?**

**18. What is the delivery/deployment approach?**
- Phased rollout? (office portal first, then mobile app?)
- Beta testing period?
- Pilot with 1-2 inspectors?
- Full team rollout?

**19. What are the major risk areas?**
- QuickBooks integration complexity?
- Offline sync reliability?
- Parts catalog size/performance?
- User adoption challenges?

---

## Scope Decisions

### MUST HAVE - Phase 1 (6 months, $75-85k target)

**Mobile Inspection App:**
- ✅ Equipment details entry (manufacturer, model, location, tiers, etc.)
- ✅ Basic inspection checklist (simplified from current 14-item understructure + 9-item top side)
  - Can condense to key safety/functional items
  - Focus on documenting issues, not lengthy checklists
- ✅ Issue documentation (text + specific location: Section, Row, Frame, Tier)
- ✅ Photo capture (attach to findings)
- ✅ **Digital part search & selection** (THE KILLER FEATURE)
  - Search across all vendors at once
  - Keyword search, part number search
  - Select part + quantity
  - Add to PSF in real-time
- ✅ Real-time PSF creation (auto-generated from inspection work)
- ✅ **Works offline, syncs when online** (CRITICAL)
- ✅ Submit to office when connection available

**Digital Parts Catalog:**
- ✅ Import Hussey + Draper catalogs (CSV format)
  - Part #, description, vendor, current price
  - ~1,000 parts combined
- ✅ Search functionality:
  - Keyword search ("seat slat")
  - Part number search
  - Equipment type filter
  - Manufacturer filter
- ✅ Multi-vendor support (search across all vendors)
- ✅ Annual pricing updates via CSV import
- ⚠️ Photos optional (helpful but not Phase 1 requirement - can add later)
- ⚠️ Equipment compatibility tagging (Phase 2 - nice to have)

**Office Review Portal:**
- ✅ Dashboard: view submitted inspections
- ✅ Inspection detail view:
  - See digital PSF with photos
  - View parts list with quantities
  - Edit/add/remove parts if needed
  - Add labor hours estimate
  - Add notes (for customer quote, for field techs)
- ✅ Track quote requests (simple status: "Pending Quote from Vendor", "Quote Received")
- ✅ Approve inspection (ready to generate estimate)
- ✅ **One-click QuickBooks estimate generation** (THE KILLER FEATURE)
  - Click "Generate QB Estimate"
  - All line items pushed to QB
  - Success confirmation or error message
  - Link to view estimate

**QuickBooks Integration:**
- ✅ Read: Customer list from QB
- ✅ Write: Create estimates programmatically
  - All part line items (part #, description, qty, price)
  - Labor line items (description, hours, price)
  - Link to customer
- ✅ Success/error handling
- ✅ Use QB Online API (since we use QB Online web app)
- ✅ Hybrid approach: App maintains parts DB, pushes non-inventory line items to QB estimates

**Project Tracker:**
- ✅ Job status tracking:
  - Estimate Sent
  - Accepted
  - Parts Ordered
  - Parts Received
  - Scheduled
  - In Progress
  - Complete
  - Pink (incomplete/holding)
- ✅ Visual board (Kanban columns) OR simple table view
  - **Recommend: Simple table view to save $4-6k**
  - Filter by status, tech, county, customer
  - Sort by date, amount, priority
  - Click row → see job details
- ✅ Color coding (green = ready to schedule, pink = issue)
- ⚠️ Drag-and-drop = Phase 2 (save budget)

**Parts & Inventory Management:**
- ✅ P.O. tracking by vendor
  - Place P.O., enter P.O. number
  - Expected delivery date
  - Link to specific jobs
  - Track shipment notes
- ✅ Parts receiving workflow
  - Mark parts as received
  - Update inventory stock levels
- ✅ Inventory visibility
  - Current stock levels
  - Parts location (TN shop, AL shop)
  - Parts reserved for jobs vs available
- ✅ Parts pull list
  - Procurement creates list for upcoming week
  - Mark parts as pulled
  - Update inventory
- ✅ Prevent double-ordering (check inventory before ordering)

**Work Orders (Mobile - Basic):**
- ✅ View assigned work orders
  - Today's jobs
  - Upcoming jobs
- ✅ Work order details:
  - Customer, location
  - Job description
  - Parts list (what parts, quantity)
  - Parts location (shop or shipped to site)
  - Customer contact info
  - Special instructions
- ✅ Mark job complete (simple checkbox)
- ✅ Photo upload for completed work
- ✅ Photo upload for new issues (pink job documentation)
- ✅ Add notes for partial completion or issues
- ⚠️ Time tracking integration = Phase 2
- ⚠️ Digital signatures = Phase 2
- ⚠️ Detailed completion checklists = Phase 2

### NICE TO HAVE - Phase 2 (Post-MVP)

**Cut These Features to Save Budget ($17-26k savings):**

**❌ Full CRM/Sales Pipeline (Save $8-12k)**
- Page 3 of Atiba's design shows full CRM
- Cut: Deal stages, pipeline forecasting, win/loss tracking, sales analytics
- Phase 1: Basic customer list pulled from QuickBooks
- Phase 2: Add sales features if needed

**❌ Advanced Analytics Dashboard (Save $3-5k)**
- Page 10 of Atiba's design shows revenue trends, leaderboards, performance metrics
- Cut: Charts, graphs, trend analysis, leaderboards
- Phase 1: Simple number cards (jobs completed, revenue, backlog count)
- Phase 2: Build advanced analytics if needed

**❌ Employee Management Module (Save $2-3k)**
- Page 7 of Atiba's design shows full HR directory
- Cut: Employee profiles, photos, detailed info
- Phase 1: Minimal user management (login, role assignment for app access)
- Keep: Homebase for payroll/HR, QB for employee financial data

**❌ Drag-and-Drop Scheduling (Save $4-6k)**
- Page 9 of Atiba's design shows drag-and-drop weekly schedule
- Cut: Interactive drag-and-drop UI
- Phase 1: Simple list view of assignments, filter by tech/date
- Phase 2: Upgrade to drag-and-drop if desired

**❌ Digital Frame Forms (Phase 2)**
- Current: Hand-drawn technical diagrams on PSFs
- Cut: Digital drawing/diagramming tools
- Phase 1: Hand-drawn is fine, attach photo of diagram if needed

**❌ Customer Portal (Phase 2)**
- Cut: Customer login to view estimates, approve work, track status
- Phase 1: Email estimates from QuickBooks (current workflow)

**❌ Cost vs. Customer Price Margin Tracking (Phase 2)**
- Cut: Automatic margin calculation, markup tracking
- Phase 1: Can calculate in Excel if needed
- Phase 2: Add margin tracking and reporting

**❌ Safety/Functional/Cosmetic Categorization (Phase 2)**
- Current: Inspections categorize issues by type
- Cut: Formal categorization system
- Phase 1: Just document issues in notes
- Phase 2: Add categorization if helpful for analytics

**Additional Phase 2 Features:**
- Annual inspection reminders (automated)
- Customer notifications before service (SMS/email)
- Sales visibility into job queue and backlog
- Tech performance analytics
- Pink job tracking and analytics
- Advanced reporting and dashboards
- Time tracking integration with Homebase
- Equipment history tracking by serial number
- Preventive maintenance scheduling
- Customer portal for estimate approval

---

## Success Criteria

### Phase 1 Success Metrics

**✅ Phase 1 is successful if:**

1. **Inspectors complete on-site work and submit - NO after-hours PSF work**
   - Inspector searches parts catalog during inspection
   - Inspector selects parts with quantities on-site
   - PSF auto-generated from inspection work
   - Inspector submits before leaving site
   - **Zero unpaid after-hours work**

2. **Office can generate QB estimate in <60 seconds (currently 30+ minutes)**
   - Open submitted inspection
   - Review parts list (maybe edit)
   - Click "Generate QB Estimate"
   - Done - estimate in QuickBooks
   - **From 30 minutes to <1 minute**

3. **Parts catalog searchable digitally (no more Dropbox hunting)**
   - Inspector searches "seat slat" on tablet
   - Results appear instantly (even offline)
   - Select part, add quantity, done
   - **No more searching PDF catalogs for hours**

4. **Job status visible in project tracker (no more Excel manual updates)**
   - Accepted estimate auto-populates tracker
   - Parts ordered → status updates
   - Parts received → job turns green (ready to schedule)
   - **Real-time visibility, no manual entry**

5. **System works offline in schools with poor WiFi**
   - Inspector completes inspection with no connection
   - Parts catalog available offline
   - Photos captured locally
   - Submits when connection available
   - **Reliable offline functionality**

6. **QuickBooks estimates auto-created with all line items**
   - All parts: part #, description, qty, price
   - Labor line items
   - Linked to customer
   - **No manual typing of 50+ line items**

### What Success Does NOT Require in Phase 1

**We can succeed without:**
- Full CRM replacement (simple customer list is fine)
- Advanced analytics (basic numbers are fine)
- Perfect margin tracking (can calculate in Excel)
- Digital frame forms (hand-drawn is fine)
- Customer portal (email estimates is fine)
- Drag-and-drop scheduling (simple list view is fine)
- Time tracking integration (Homebase is fine)
- Employee management module (QB/Homebase is fine)

**Focus on the Core Pain Points:**
1. Inspector after-hours work → ELIMINATED
2. Manual QB estimate creation → AUTOMATED
3. Disconnected systems → INTEGRATED
4. Excel trackers → REPLACED

---

## Technical Considerations

### Offline Functionality Requirements

**Why Offline is Critical:**
- Schools often have poor or no WiFi
- Inspectors can't rely on connection while on-site
- Inspections can't fail or be delayed due to connectivity

**What Must Work Offline:**
- Entire parts catalog (searchable without connection)
- Inspection form (all fields, checklists, notes)
- Photo capture (stored locally until sync)
- PSF creation (all work saved locally)
- View previously downloaded inspections/work orders

**Sync Requirements:**
- Auto-sync when connection restored
- Show sync status clearly (offline, syncing, synced)
- Queue submissions for when online
- Background sync (works even if app closed)
- Conflict resolution (if online changes happened while offline)

**Technical Approach:**
- Local database on device (SQLite, Realm, etc.)
- Pre-download parts catalog when online
- Periodic sync of catalog updates (weekly? monthly?)
- Submit queue for pending inspections
- Photo compression before upload (reduce file size)

### QuickBooks Integration Approach

**Recommended: Hybrid Model**
- App maintains master parts catalog database
- App pushes non-inventory line items to QB estimates
- QB doesn't store parts as items (avoids clutter)
- QB estimates show full detail: part #, description, qty, price

**API: QuickBooks Online API**
- Use official Intuit QuickBooks Online API
- OAuth 2.0 authentication
- Read: Customer data
- Write: Create estimates with line items

**Error Handling:**
- QB connection failure → show error, allow retry
- Customer not found → prompt to select or create customer
- Validation errors → show specific error messages
- Log all API calls for troubleshooting

### Parts Catalog Database Design

**Key Entities:**

**Parts Table:**
- Part ID (primary key)
- Part Number (can be null initially)
- Description
- Vendor/Manufacturer
- Category (bleacher, basketball, hardware, etc.)
- Current Price
- Unit (each, box, roll, etc.)
- Notes
- Photo URL (optional)
- Active (yes/no - for discontinued parts)
- Created Date
- Updated Date

**Pricing History Table:**
- Pricing ID
- Part ID (foreign key)
- Price
- Effective Date
- End Date
- Source (CSV import, manual entry)

**Inventory Table:**
- Inventory ID
- Part ID (foreign key)
- Location (TN shop, AL shop, etc.)
- Quantity
- Reserved Quantity (for specific jobs)
- Available Quantity (calculated)
- Last Updated

**Purchase Orders Table:**
- PO ID
- Vendor
- PO Number
- Date Ordered
- Expected Delivery Date
- Status (ordered, shipped, received)
- Notes

**PO Line Items Table:**
- PO Line ID
- PO ID (foreign key)
- Part ID (foreign key)
- Quantity
- Unit Price
- Job ID (link to specific job needing this part)

### Security & Access Control

**User Roles:**
- **Inspector** (mobile): Create inspections, submit PSFs
- **Procurement** (web): Review PSFs, generate QB estimates, manage inventory
- **Office Staff** (web): View reports, track jobs
- **Technician** (mobile): View work orders, mark complete
- **Admin** (web): Manage users, settings, parts catalog

**Data Security:**
- Customer data is sensitive (PII)
- Pricing data is competitive (protect vendor pricing)
- QuickBooks connection must be secure (OAuth 2.0)
- Photo storage must be secure (customer facilities)

**Access Control:**
- Inspectors can only see their own inspections (or all?)
- Techs can only see their assigned work orders
- Office staff can see all jobs
- Admin can manage everything

### Performance Considerations

**Parts Catalog Size:**
- Initial: ~1,000 parts (Hussey + Draper)
- Growth: potentially 2,000-3,000 parts over time
- Must be searchable quickly even offline
- Index on part number, description, manufacturer

**Photo Storage:**
- Could be 5-10 photos per inspection
- Each photo: 1-3 MB (uncompressed)
- Compress before upload (reduce to 200-500 KB)
- Thumbnail generation for list views
- Cloud storage (S3, Azure, Google Cloud)

**Database Queries:**
- Parts search must be instant (<100ms)
- Full-text search on description
- Filter by vendor, category
- Pagination for large result sets

### Mobile App Considerations

**Platform:**
- Option 1: Native iOS (Swift) - inspectors use iPads
- Option 2: React Native (iOS + Android) - future flexibility
- Option 3: Flutter (iOS + Android) - future flexibility
- **Recommendation:** React Native or Flutter for cross-platform, unless iOS-only is certain

**Device Support:**
- iPads (primary for inspectors)
- iPhones (backup, some techs prefer phone)
- Android (future - if techs need Android)

**App Store Deployment:**
- Apple App Store (iOS)
- Google Play Store (Android if needed)
- TestFlight for beta testing (iOS)

---

## Notes & Reminders

### Critical Principles

**"If it didn't happen in QuickBooks, it didn't happen at all"**
- QuickBooks is the heart of the business
- All financial data lives in QB
- Integration with QB is non-negotiable

**"Inspector after-hours work is the #1 pain point"**
- Everything else is secondary to solving this
- Inspector must be able to complete PSF on-site during work hours
- Digital parts catalog must be searchable and fast

**"Schools have poor WiFi"**
- Offline mode is CRITICAL, not optional
- Entire workflow must function without connection
- Sync when connection available

**"Multi-vendor jobs are common"**
- Can't restrict part search to one vendor at a time
- Must search across all vendors simultaneously
- Real jobs use 6+ vendors regularly

**"70% of parts are Hussey + Draper"**
- Prioritize importing these catalogs first
- Other vendors can be added later
- Start with the 80/20 rule (most common parts first)

**"New workflow is encouraged"**
- Don't need to replicate old 8-page inspection exactly
- Can simplify checklists and forms
- Focus on capturing what's needed for quoting and repairs

**"Budget is $80-100k"**
- Need to be ruthless about scope
- Phase 1 MVP must solve core pain points
- Phase 2 for nice-to-haves and enhancements

### Key Stakeholders

**Christian** (Project Lead)
- Owns the business vision
- Manages Atiba relationship
- Beta testing coordinator

**Inspectors** (Primary Users - Mobile App)
- Complete inspections on-site
- Create PSFs using parts catalog
- Must be fast and easy to use
- Currently doing unpaid after-hours work

**Procurement** (Primary Users - Web Portal)
- **Kat** (Office Manager / Scheduling)
- **Charles** (Hussey relationship)
- **Bea** (Vendor relationships)
- **Lisa** (Vendor relationships)
- Review PSFs, generate QB estimates
- Manage inventory and parts ordering

**Operations**
- **Samantha** (Parts receiving)
- **Story** (Daily reports, coordination)

**Technicians** (Secondary Users - Mobile App)
- View work orders
- Mark jobs complete
- Document issues

**Sales Team**
- Need visibility into job pipeline
- Follow up on annual inspections

---

## Document Version History

- **v1.0** - January 2026 - Initial context document created
- **v2.0** - January 2026 - Complete reference consolidated (includes job lifecycle PDF insights, logo, expanded pain points, technical considerations)

---

## Next Steps

### Before Next Atiba Meeting

1. ✅ Review this complete reference document
2. ✅ Prepare questions based on missing screens and workflow concerns
3. ⚠️ Request Atiba provide:
   - Complete workflow diagrams (inspector start to finish)
   - Missing screens (inspection form, photo capture, part search results)
   - Technical architecture proposal
   - Revised budget estimate with scope options

### Discussion Topics for Atiba

1. **Workflow Clarification**
   - Show complete inspector workflow with all screens
   - Explain inspection → PSF connection
   - Demonstrate part search flow end-to-end

2. **Technical Architecture**
   - Confirm tech stack choices
   - Explain offline sync approach
   - Detail QuickBooks integration method

3. **Scope & Budget**
   - Review which features are Phase 1 vs Phase 2
   - Get revised estimate with simplified scope ($75-85k target)
   - Agree on MVP definition

4. **Timeline & Delivery**
   - Confirm 6-month timeline is realistic
   - Define beta testing period
   - Plan phased rollout approach

### Success Checkpoint

**Before approving Atiba's proposal, ensure:**
- ✅ All workflow questions answered with screen mockups
- ✅ Tech stack makes sense and supports offline requirements
- ✅ QuickBooks integration approach is sound
- ✅ Budget aligns with simplified Phase 1 scope ($75-85k)
- ✅ Timeline is realistic (6 months)
- ✅ Beta testing plan is defined
- ✅ Post-launch support is included

---

*End of Complete Reference Document*
