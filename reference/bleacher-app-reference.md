# Bleachers & Seats - Complete App Development Reference

**Last Updated:** February 2026
**Purpose:** Comprehensive context document for custom in-house app development

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

## DIY Development Progress

### Decision: Build In-House Instead of Using Atiba

**Rationale:**
- $80-100k budget could be saved
- Core problem is simpler than Atiba's scope suggests
- Offline sync (the hardest part) may not be critical - 90% of field staff can use hotspot
- Can tackle one piece at a time, starting with the biggest bottleneck

### Priority #1: Searchable Parts Catalog

**Why this is the bottleneck:**
- Root cause of inspector time spent hunting through PDFs
- Root cause of 30+ minute QB estimate creation (no digital source to pull from)
- Everything else is just UI on top of a good parts database

**Current Approach: PDF Catalog Extractor**

Built a Python script to extract parts data from vendor PDF catalogs using Claude's vision API.

**Location:** `~/catalog-extractor/`

**What it does:**
1. Converts PDF pages to images
2. Sends each page to Claude vision API
3. Extracts: part number, description, price, category, vendor
4. Attempts to crop individual part images
5. Outputs JSON, CSV, and image files

**How to run:**
```bash
cd ~/catalog-extractor
source venv/bin/activate
export ANTHROPIC_API_KEY="your-key-here"
python3 extract_catalog.py "2025 Hussey Parts Guide.pdf" --start 1 --end 10
```

**Current Status: Image Cropping Needs Work**
- Part data extraction (part #, description, etc.) works well
- Image bounding box detection is inconsistent
- Claude's vision API struggles to give precise pixel coordinates
- Multiple attempts to adjust cropping logic haven't fully solved it

**Options to resolve image cropping:**
1. Ask vendors for product images separately (cleanest solution)
2. Skip image cropping for now, just use the data extraction
3. Try a different approach (grid detection, template matching)
4. Manual cleanup of cropped images

**Archive of extraction attempts:**
- `~/catalog-extractor/archive/run_001_initial/` - First run, no image cropping
- `~/catalog-extractor/archive/run_002_bad_crops/` - Images cut off
- `~/catalog-extractor/archive/run_003_text_only/` - Only captured text labels
- `~/catalog-extractor/archive/run_004_too_wide/` - Grabbed neighboring parts
- `~/catalog-extractor/archive/run_005_too_tall/` - Expanded too much vertically
- `~/catalog-extractor/archive/run_006_json_error/` - JSON parsing issues

**Cost estimate:**
- ~$0.01-0.02 per page for API calls
- 500 page catalog ≈ $5-10 to process

### Current Status (February 2, 2026)

**✅ MILESTONE: New Inspection Flow - Multi-Bank, Issue-First**

Complete redesign of the inspection workflow based on real ServicePal inspection PDFs (Jackson Career And Technology Elementary). The new flow matches how inspectors actually walk through bleachers.

**What's New:**

1. **Multi-Bank Job System**
   - One job number covers all banks in a gym (e.g., Job #16942 = East Side + West Side)
   - Job list view shows In Progress and Submitted jobs
   - Bank tabs for easy switching between banks within same job
   - Bank names: East Side, West Side, Facing Logo, Behind Logo, North/South, Home/Visitor

2. **Issue-First Interface**
   - Floating green "Add Issue" button always visible (bottom-right corner)
   - Tap → modal opens → select type (Top Side or Understructure) → add location/description/photo
   - Issues are the PRIMARY output, not checklists
   - Checklists moved to collapsible "Reference" sections (guides what to look for)

3. **Top Side → Understructure Order**
   - Matches physical walkthrough (inspector walks top first, crawls underneath second)
   - **Top Side Section:** Seating layout, aisle rail type, top side issues with Section/Row/Aisle locations
   - **Understructure Section:** Motor specs, wheel type, understructure issues with Frame/Tier locations
   - Both sections collapsible with toggle arrows

4. **Issue Documentation (Per Issue)**
   - **Top Side:** Section, Row, Aisle + Description + Photo
   - **Understructure:** Frame, Tier + Description + Photo
   - Issues display as cards with photo thumbnails
   - Delete button on each issue

5. **Bank Summary**
   - Safety Issues (red highlight)
   - Functional/Mechanical Issues
   - Cosmetic Issues
   - Inspection tag affixed confirmation

6. **Job Summary View**
   - Review all banks before submitting
   - Total issue count across all banks
   - Inspector name and certificate number
   - Parts list integration

7. **Unified Office/Field View**
   - Both roles see identical inspection interface
   - Office has full edit permissions (no restrictions)
   - Field Staff (inspectors) have lenient rules - they use tablets frequently

**Data Storage:**
- Jobs stored in localStorage as `inspectionJobs`
- Job numbers start at 17500 (stored as `nextJobNumber`)
- Each job contains: banks[], selectedParts[], customer info, status

**How to Test:**
```bash
open ~/bleachers-seats-demo-v2.html
# Login as Field Staff → Inspections → + New Job
# Select customer → Create Job & Add First Bank
# Use floating + button to add issues
# Switch banks with tabs, add more banks
# Finish This Job → Review summary → Submit
```

---

### Previous Status (February 2, 2026 - Office Work Orders)

**✅ MILESTONE: Office Staff Work Orders - Read-Only with Edit Buttons**

Updated Office Staff work order view to match Field Staff layout exactly, but with section-by-section edit capability.

**What's New:**

1. **Unified Layout (Office = Field Staff)**
   - Both views now show the same read-only job information layout
   - Same visual structure: Location, Site Contact, What They're Doing, Parts Location, Special Instructions
   - Clean, scannable format for quick job review

2. **Edit Buttons Per Section**
   - Each section has an "Edit" button in the top-right corner
   - Click Edit → section transforms to show editable fields
   - Click Save → updates display and closes edit mode
   - Click Cancel → discards changes and closes edit mode

3. **Editable Sections:**
   | Section | Edit Fields |
   |---------|-------------|
   | Location | Customer/location dropdown, address |
   | Site Contact | Name, phone |
   | What They're Doing | Job description textarea |
   | Parts Location | Parts location text |
   | Special Instructions | Instructions textarea |
   | Scheduling & Assignment | Date, time, assigned tech, confirmation details |
   | Job Completion | Completed status, hours, tech name, notes |

4. **Sidebar Preserved**
   - Actions: Print Work Order, Email to Tech, Mark Complete
   - Timeline: Visual job history (estimate → accepted → parts → scheduled)
   - Documents: Links to Work Order, Inspection, Estimate

**Design Principles:**
- Office staff see same view as field staff (consistency)
- Edit only what you need (no overwhelming forms)
- Changes saved per-section (not one big save button)

---

### Previous Status (February 2, 2026 - Field Staff Work Orders)

**✅ MILESTONE: Field Staff Work Orders - Simplified Mobile View**

Built the Field Staff work order experience focused on simplicity - techs should be doing work, not filling out forms.

**What's Built:**

1. **Work Orders List (Field Staff View)**
   - Today's jobs with green badges and scheduled times
   - Upcoming jobs (dimmed, future dates)
   - Each job shows: Job #, type, location, address, brief description
   - Tap any job to view details

2. **Work Order Detail (Simplified, Read-Only)**
   - **Location** with address and "Get Directions" link (opens Google Maps)
   - **Site Contact** with clickable phone number
   - **What You're Doing** - clear job description
   - **Parts Location** - where to pick up parts (highlighted in orange)
   - **Special Instructions** - only shows if there are any
   - Minimal clutter - just the info techs need

3. **Job Completion (Required Fields)**
   - **Photo upload** (required) - tap to take photo of completed work
   - **Additional photos** (optional) - issues, before/after, etc.
   - **Completion notes** (required) - even "All work completed" is fine
   - Big green "Job Completed - Submit" button

4. **Job Not Completed - Simplified Flow**
   - **One-tap reason buttons** (not a dropdown):
     - 🔧 Wrong or Missing Part
     - 🚪 Can't Access Site
     - ⚠️ Additional Work Needed
     - 🏗️ Equipment Issue
     - 📝 Other
   - **Smart validation by reason type:**
     | Reason | Required | Notes |
     |--------|----------|-------|
     | Wrong/Missing Part | Measurements + Photo of correct part | Optional |
     | Additional Work Needed | Photo of the issue | Optional |
     | Can't Access Site | Notes | Required |
     | Equipment Issue | Notes | Required |
     | Other | Notes | Required |
   - "Change" link to go back if wrong reason selected
   - "Close Job" button submits and notifies office

5. **Wrong Part Flow (Enhanced)**
   - **Measurements field** (required) - length, width, thickness, hole spacing, bolt size
   - **Photo of CORRECT part** (required) - find a working part nearby and photo it
   - **Photo of wrong part sent** (optional) - helps office understand what went wrong
   - Notes optional because measurements + photo tell the story

---

### Previous Status (February 2, 2026 - ServicePal Replacement)

**✅ MILESTONE: ServicePal Replacement Features Added**

Analyzed ServicePal screenshots and implemented key features to replace it. Demo app now has full customer hierarchy matching QuickBooks and enhanced work order functionality.

**What's Built:**

1. **Customer Hierarchy (Matches QuickBooks Structure)**
   - **Customer** = Billing entity (County or Private school)
   - **Location** = Service site (School/Gym)
   - Customer dropdown shows grouped hierarchy with icons
   - Inspection form shows both Billing Entity and Service Location

2. **Job Numbering System (One Number Everywhere)**
   - Sequential job numbers starting from 17500 (matching ServicePal's numbering)
   - **Job # = Estimate # = QuickBooks #** - single unified number

3. **Job Types (Matching ServicePal)**
   - Go See, Service Call, Repair, Inspection
   - Auto-determined based on inspection type and parts selected

4. **Enhanced Work Orders (Office View - ServicePal-Style Fields)**
   - Confirmation tracking, Parts Location, Assignment, Special Instructions
   - Completion section, Quick questions, Visual Timeline
   - Pink Jobs highlighted, Related Documents links

5. **Accounts View (Customer Management)**
   - Search/filter, Customer Detail View with Locations/Service History/Equipment tabs

6. **Projects View Enhanced**
   - Table with Job #, Type, Description, Customer, Location, Status, Amount, Date

---

### Previous Status (January 29, 2026)

**✅ MILESTONE: Inspection Type Templates Added**

Demo app now has three inspection type templates based on actual PDF inspection forms.

**What's Built:**

1. **Inspection Type Selection**
   - Dropdown at start of new inspection
   - 🏀 Basketball Goal Inspection
   - 🏟️ Indoor Bleacher Inspection
   - 🪑 Outdoor Aluminum Bleacher Inspection

2. **Basketball Goal Inspection Template**
   - Equipment overview: brand, goal count, gym type, padding color/dimensions, ceiling type
   - Per-goal inspections (add as many as needed)
   - Overall checklist (11 items)

3. **Indoor Bleacher Inspection Template**
   - Equipment details, motor specs, understructure checklist (7 items), top side checklist (9 items)
   - Issues tracker (frame/tier/description)

4. **Outdoor Aluminum Bleacher Inspection Template**
   - Bleacher details, seat specs, understructure checklist (4 items), top side checklist (10 items)
   - Code compliance issues field, issues tracker

5. **Common to All Types**
   - Customer/school selection
   - Parts search (Airtable catalog with 2,142 Hussey parts)
   - Inspector summary: safety issues, mechanical issues, cosmetic issues
   - Labor hours and notes

---

### Previous Status (January 28-29, 2026)

**✅ Parts Catalog Integrated**
- Airtable parts catalog (2,142 Hussey parts) connected to inspection form
- Real-time search across all fields
- Category filter with 15 simplified categories
- Hussey confirmed PNG images for parts (awaiting files)

---

### Previous Status (January 28, 2026)

**✅ MILESTONE: Hussey Parts Catalog Working**

Received CSV from Hussey ("2025 Price Guide For BS.csv") with full parts catalog and 4 years of pricing history.

**What's Built:**
1. **Data Cleaning Pipeline** (`~/catalog-extractor/clean_hussey_csv.py`)
   - Normalizes Hussey CSV data
   - Simplifies 200+ categories to 15 logical groups
   - Outputs Airtable-ready CSV

2. **Airtable Database**
   - 2,142 Hussey parts imported
   - Base ID: `appAT4ZwbRAgIyzUW`
   - Table ID: `tbl4mDv20NaJnaaN7`
   - Fields: Part Number, Product Name, Description, Price 2025, Price 2024, Category, Subcategory, Product Line, Model Info, Parent Assembly, Vendor

3. **Search Frontend** (`~/catalog-extractor/parts-search.html`)
   - Queries Airtable API in real-time
   - Searches across all fields (name, part #, description, category, product line, etc.)
   - Category filter dropdown
   - "Add to PSF" functionality with quantities
   - Export PSF to CSV
   - Mobile-friendly design

**Simplified Categories (15 total):**
- Power & Electrical (412 parts)
- Other (363)
- Hardware (183)
- Frames & Supports (168)
- Rails & Steps (162)
- Seating (149)
- Rollout Parts (137)
- Stanchions (82)
- Lumber & Decking (59)
- Portable & Skids (49)
- Flex Row Parts (47)
- Panels & Closures (24)
- Controls & Safety (17)
- Wheels & Bearings (10)
- Tools (8)

**How to Run:**
```bash
# Open search interface
open ~/catalog-extractor/parts-search.html

# Regenerate cleaned CSV (if source data changes)
cd ~/catalog-extractor
python3 clean_hussey_csv.py
```

**Waiting On:**
- Part images from Hussey (requested, not received yet)
- Draper CSV/catalog

### Planned Features

**CSV Pricing Update Feature:**
- Admin uploads new pricing CSV from vendor
- System matches part numbers to existing records
- Preview screen shows changes: "Part X: $10.00 → $12.50"
- Confirm to apply updates
- Keep price history (know what was quoted on old jobs)
- Track effective date for each price update

### Next Steps for DIY Approach

1. ✅ ~~Get parts data from Hussey~~ - DONE
2. ✅ ~~Import to Airtable~~ - DONE (2,142 parts)
3. ✅ ~~Build simple search interface~~ - DONE
4. ✅ ~~Integrate catalog into inspection form~~ - DONE
5. ✅ ~~Add company logos~~ - DONE (login screen + sidebars)
6. ✅ ~~Add inspection type templates~~ - DONE (Basketball, Indoor Bleacher, Outdoor Bleacher)
7. ⚠️ **Get Draper CSV** and add to same Airtable base
8. ⚠️ **Test with inspector** - get feedback on templates and search UX
9. ⚠️ **Add QuickBooks integration** - push PSF as estimate (the big win)
10. ⚠️ **Add part images** - Hussey confirmed PNG format, awaiting files
11. ⚠️ **Get transparent logo icon** - current has cream background

---

## Document Version History

- **v1.0** - January 2026 - Initial context document created
- **v2.0** - January 2026 - Complete reference consolidated (includes job lifecycle PDF insights, logo, expanded pain points, technical considerations)
- **v3.0** - January 2026 - Combined reference file created (merged bleachersandseats-app.md and bleachersandseats-complete-reference.md)
- **v4.0** - January 2026 - Added DIY development progress section (parts catalog extractor)
- **v4.1** - January 2026 - Updated: reaching out to vendors for CSVs/images, added CSV pricing update feature plan
- **v5.0** - January 28, 2026 - **MAJOR UPDATE:** Hussey CSV received, 2,142 parts imported to Airtable, working search frontend built with PSF export
- **v5.1** - January 29, 2026 - Integrated Airtable catalog into inspection form demo, Hussey confirmed PNG images
- **v5.2** - January 29, 2026 - **MAJOR UPDATE:** Added 3 inspection type templates (Basketball Goal, Indoor Bleacher, Outdoor Bleacher) with type-specific checklists, integrated company logos
- **v6.0** - February 2, 2026 - **MAJOR UPDATE:** ServicePal replacement features - Customer hierarchy (County → School matching QB), unified job numbering system, job types, enhanced work orders with confirmation/completion tracking, customer detail view with service history
- **v6.1** - February 2, 2026 - **Field Staff Work Orders:** Simplified mobile work order view for techs - read-only job info, required completion photos/notes, streamlined "Not Completed" flow with one-tap reason buttons, enhanced Wrong Part flow requiring measurements + photo of correct part
- **v6.2** - February 2, 2026 - **Office Staff Work Orders:** Updated to match Field Staff layout (read-only by default) with per-section Edit buttons - click Edit to modify any section, Save/Cancel to finish
- **v6.3** - February 2, 2026 - **Office + Field Sync:** Added full Field Staff completion sections to Office view - photo uploads, completion notes, Not Completed flow with all reason options (Wrong Part with measurements, Additional Work with photos, etc.). Office sees everything Field sees and can edit all fields.
- **v6.4** - February 2, 2026 - **MAJOR UPDATE: New Inspection Flow** - Complete redesign of inspection workflow to match real-world inspector walkthrough:
  - **Multi-bank job system:** One job number covers all banks in a gym (East Side, West Side, etc.) - matches ServicePal PDF structure
  - **Issue-first interface:** Floating green "Add Issue" button always visible; issues are primary output, checklists are reference
  - **Top Side → Understructure order:** Matches physical walkthrough (inspector walks top first, crawls underneath second)
  - **Unified Office/Field view:** Both roles see identical interface; Office has full edit permissions
  - **Photo capture per issue:** Each issue can have location (Section/Row/Aisle or Frame/Tier) + description + photo
  - **Bank tabs:** Easy switching between banks within same job
  - **Job summary view:** Review all banks and total issues before submitting
- **v6.5** - February 2, 2026 - **Sample Data & Office Inspection View Fix:**
  - **Sample inspection job added:** Job #16942 (Jackson Career And Technology Elementary) pre-populated with real data from ServicePal PDFs
  - **Two banks:** West Side (7 issues) and East Side (8 issues) with full understructure/top side details
  - **Madison County Schools added** to CUSTOMERS data with Jackson Career location
  - **Office Inspections view fixed:** Now uses multi-bank jobs system (inspectionJobs array)
  - **Click to view:** Clicking any inspection job opens detailed summary view
  - **Enhanced job summary:** Shows Safety/Functional/Cosmetic issues per bank with expandable detailed issue list
  - **Generate QB Estimate button:** For submitted jobs, shows "Generate QuickBooks Estimate" instead of "Submit"
  - **Inspector info pre-filled:** Submitted jobs show inspector name (Danny Mendl) and certificate (MXM00-980)

- **v7.0** - February 2, 2026 - **MAJOR UPDATE: Scheduling System** - Full scheduling module matching Excel Project Tracker workflow:
  - **Office Scheduling View:** Three-tab system (This Week / Planning / Backlog)
  - **Territory Separation:** Original Territory (KY/TN) and Southern Territory (AL/FL) tabs at top - each territory has its own schedule, planning sheet, and backlog
  - **Weekly Schedule Grid:** Matches Excel format - days as row headers (Mon-Sat), jobs stacked under each day with columns: School | Job Details | Tech(s) | Parts | Confirmation | Notes
  - **Planning Tab:** Fresh sheet for building next week's schedule, "Publish Schedule" to push live
  - **Backlog:** Replaces "Ready Pool" - shows jobs with parts received, filterable by county/type, with labor totals
  - **Add Entry Modal:** Add from Backlog, custom entry, or notes (holidays, "Alex Off", "Stop at shop for parts")
  - **Confirmation Tracking:** XX = confirmed, X = attempted (matches Excel convention)
  - **Sample Data:** Real schedule data from Week of Jan 6, 2025 Original Territory tracker (Danny at Fayette Co, Jon at Madison Co, Floyd at Jackson State CC, etc.) and Southern Territory sample data
  - **Field Staff - My Jobs:** Renamed from "Dashboard" - shows personal weekly schedule filtered for logged-in tech, with week navigation
  - **Field Staff - Team Schedule:** New nav item (read-only) - field staff can see full posted schedule for the week, with territory toggle (Original/Southern)
  - **Tech roster from Excel:** Danny, Jon, Floyd, Sam, Blake & Rick, Chris & Blake, Troy & Rick, Alex W & Michael, Chris & Owen, Troy, Alex, etc. with (overnight) variants
  - **Field Staff Nav Reorder:** My Jobs → Team Schedule → Inspections → Parts Specs → Work Orders
- **v8.0** - February 3, 2026 - **MAJOR UPDATE: Schedule Redesign & Shit List** - Complete overhaul of scheduling to match real Excel spreadsheet:
  - **Dense spreadsheet-style table layout:** Replaced CSS grid cards with HTML `<table>` - dense rows, minimal padding, variable row heights, full text visible (no truncation). Matches how the real Excel schedule looks and feels.
  - **4 columns:** School/Location | Job Details | Tech(s) | Parts. Removed Confirmation and Notes columns (info is inline in details/parts).
  - **Mon-Thu work days + floating Friday:** Removed Saturday/Sunday. Friday shows "Floating day" when empty. Company works Mon-Thu, Fridays are floating.
  - **Yellow highlight rows:** Inline notes like "Stop at shop to pick up parts" and "Blake & Seth to Southern Territory" displayed as bold yellow rows spanning all columns.
  - **Continued entries:** Light blue rows for multi-day jobs carrying over (e.g., Ravenwood HS continued on Tuesday).
  - **Pink job highlighting:** Return visits shown with pink (#ffe0e6) background. Spencer ES example from real schedule.
  - **Red text for special callouts:** `*Customer provided seats*`, `*Customer to provide lift*` rendered in red/bold automatically via `*text*` pattern matching.
  - **Sample data from real schedule:** Week of Feb 3, 2025 - Montgomery Co HS, Menifee Co, Fairview ES, Motlow State, Ravenwood HS (massive multi-gym job), Dyersburg State, Spencer ES (pink), Trousdale Co, etc. Matches actual Excel screenshot.
  - **The Shit List (new tab):** Fourth tab next to Backlog for pink/incomplete jobs. Shows jobs that weren't completed with reason badges (Wrong/Missing Part, Can't Access Site, Additional Work Needed, Equipment Issue). Each job shows "Why:" explanation, original tech, date, labor amount, and "Reschedule" button. Stats cards: Total Pink Jobs, Wrong/Missing Part count, Other count. Filterable by reason. Sample data: 4 Original Territory pink jobs, 1 Southern Territory.
  - **Pink job flow concept:** Tech marks work order incomplete → job enters Shit List pool → office reschedules when ready.
  - **Office sidebar cleanup:** Removed "Field Staff" section label, replaced with subtle divider line. Moved Scheduling below the divider (grouped with field-facing items: Inspections, Parts Specs, Work Orders).
  - **Field Staff nav redesign:**
    - **Search (new, first tab):** Search any work order, inspection, or scheduled job by school name, job number, or keyword. Searches across all data sources. Results show clickable cards with badges (Work Order, Inspection, Scheduled).
    - **Team Schedule (second):** Read-only view of full crew schedule. Cannot edit.
    - **My Jobs (third):** Personal weekly schedule only. Removed quick action buttons ("Start New Inspection", "Create Parts Spec", "View Work Orders") - just click through jobs for the week.
    - **Inspections / Parts Specs / Work Orders:** Unchanged, still accessible below.
- **v9.0** - February 3, 2026 - **MAJOR UPDATE: Field Staff Nav Simplification & Unified Create Flow:**
  - **Field Staff nav reduced to 4 tabs:** Search | Team Schedule | My Jobs | Create. Removed Inspections, Parts Specs, and Work Orders as separate nav items.
  - **Removed duplicate topbar search bar:** Field staff view had a non-functional search input in the topbar that duplicated the Search tab's real search bar. Topbar removed entirely from field staff view; Search tab is the single search entry point.
  - **Fixed search bar disappearing bug:** Search tab's main search bar would disappear after navigating to other tabs and returning. Fixed by removing the topbar that was causing the visual duplication/confusion.
  - **Unified Create tab:** Single form with type selector dropdown at the top ("What are you creating?") with three options:
    - **Parts Spec Form** → shows: Customer/School, Description, Notes, Photo, "Create Parts Spec" button
    - **Work Order** → shows: Customer/School, Job Type (Service Call/Repair/Inspection/Go See), Description, Notes, Photo, "Create Work Order" button
    - **Inspection** → shows: Customer/School, Inspection Type (Indoor Bleacher/Outdoor/Basketball), Job Number (auto), Date, Notes, "Create Inspection" button → then flows into bank-by-bank walkthrough
  - **Consolidated from 3 separate views to 1:** Previously had separate card-picker page, separate New Work Order form, separate New Inspection form, and separate Parts Spec form. Now all in one progressive form that reveals fields based on type selection.
  - **Form fields appear dynamically:** Selecting a type reveals the Customer dropdown and type-specific fields. Common fields (Customer, Notes) shared across all types. Description and Photo shown for Work Order and Parts Spec only. Inspection Type/Job Number/Date shown for Inspection only. Job Type dropdown shown for Work Order only.
  - **Office-side inspection flow preserved:** The `newJobSetupView` still exists for office staff who create inspections via the office dashboard. Field staff use the unified Create form instead.

- **v10.0** - February 3, 2026 - **MAJOR UPDATE: Office Sidebar Overhaul, Collapsible Nav, Schedule Polish:**
  - **Office sidebar reorganized below divider:** Removed Inspections, Parts Specs, Work Orders as separate nav items. Replaced with: Search → Scheduling → + Create. Divider now labeled "Inspections & Service" (uppercase, centered on divider line, matching sidebar background color).
  - **Office Search view (new):** Mirrors field staff search but for office. Searches across OFFICE_WORK_ORDERS, TECH_WORK_ORDERS, inspectionJobs, and schedule data. Work order results click through to work order detail. Inspection results go to inspections view. Schedule results go to scheduling.
  - **Office Create view (new):** Unified create form identical to field staff Create tab. Type selector: Parts Spec Form / Work Order / Inspection. Dynamic fields based on type. Office-created work orders go into OFFICE_WORK_ORDERS. Office-created inspections switch to tech dashboard for bank-by-bank walkthrough, then return to office view on completion.
  - **Scheduling renamed from "Schedule":** Active verb form since it's a heavily-used operational section.
  - **Collapsible sidebar (both dashboards):** Click header to toggle. Expanded: full logo (`menu-logo-wide.png`, 1200x100px, 12:1 ratio) with ✕ close button. Collapsed: 64px wide, shows only logo icon (`bleachers-logo-icon.png`) centered, nav items show emoji icons only (labels hidden), user info shows avatar only. Smooth CSS transitions (cubic-bezier easing), logo icon rotates 360° on collapse, crossfade between icon and full logo.
  - **Fixed scheduling first-load bug:** `showView()` hides all elements ending with "View" including `thisWeekView` inside `schedulingView`. Added `switchScheduleTab(currentScheduleTab)` call at end of `loadSchedule()` to re-show active tab.
  - **Fixed field staff search bar disappearing bug (root cause):** `showTechView()` selector `[id^="tech"]` was hiding `techSearchInput` and `techSearchResults` (not just view containers). Changed to `[id^="tech"][id$="View"]`. Same fix applied in `startNewInspection()`.
  - **Schedule table cosmetic polish:** Rounded 12px corners with subtle box shadow. Gradient header row. Day separator rows use dark gradient (`#1a1a2e` → `#2d2d50`) matching sidebar. Today row uses green gradient. Lighter cell borders (`#f0f2f5`). Removed hover effect (schedule is read-only, no clickable rows).
  - **Pink job vs inline notes visual separation:** Pink jobs now ONLY highlight the School/Location cell (pink background `#ffe0e6`, red text, pink left border) — rest of row stays normal. Inline `*callout notes*` (lift required, truck arriving, etc.) changed from red to dark amber (`#bf360c`) on light orange chip background (`#fff3e0`) with rounded corners — clearly reads as "heads up" info, not a problem flag.
  - **Work order detail back button:** Now goes to office Search (was hardcoded to old Work Orders view).
  - **Divider label background fixed:** Changed from `#1a1a2e` to `#2d3748` to match actual sidebar background color.
  - **Logo files:** `menu-logo-wide.png` (1200x100px, 12:1 ratio) used for expanded sidebar header. `bleachers-logo-icon.png` used for collapsed state and login screen.

---

## Next Steps

### DIY Development Path (Current Direction)

**✅ Completed:**
1. ✅ Received Hussey CSV with 2,142 parts + 4 years pricing history
2. ✅ Built data cleaning pipeline with simplified categories
3. ✅ Imported to Airtable database
4. ✅ Built working search frontend with PSF list and CSV export
5. ✅ Integrated Airtable catalog into inspection form demo app
6. ✅ Confirmed Hussey will send PNG images for parts
7. ✅ Added company logos to login screen and sidebars
8. ✅ Built 3 inspection type templates (Basketball, Indoor Bleacher, Outdoor Bleacher)
9. ✅ **Customer hierarchy matching QuickBooks** (County → School structure)
10. ✅ **Unified job numbering system** (Job # = Estimate # = QB # everywhere)
11. ✅ **Job types** (Go See, Service Call, Repair, Inspection)
12. ✅ **Enhanced Work Orders - Office View** (ServicePal-style with confirmation, parts location, completion tracking)
13. ✅ **Customer detail view** with service history tabs
14. ✅ **Office Staff can access Field Staff views** (inspections, parts specs, work orders)
15. ✅ **Field Staff Work Orders - Simplified Mobile View**
    - Work orders list with today's jobs and upcoming
    - Read-only job detail (location, directions, contact, what to do, parts location)
    - Required completion photo and notes
    - Streamlined "Not Completed" flow with one-tap reason buttons
16. ✅ **Wrong Part Flow Enhanced** - requires measurements + photo of correct part
17. ✅ **Office Staff Work Orders - Unified Layout with Edit Buttons**
    - Matches Field Staff read-only layout exactly
    - Per-section Edit buttons (Location, Contact, Description, Parts, Instructions, Scheduling, Completion)
    - Click Edit → editable fields appear, Save/Cancel to finish
    - Sidebar preserved (Actions, Timeline, Documents)
18. ✅ **Office Staff - Full Field Completion Flow**
    - Office now has same completion sections as Field Staff at bottom of work order
    - Completion Photos & Notes card: photo upload, additional photos, completion notes
    - Job Not Completed card: same one-tap reason buttons as field (Wrong Part, Can't Access, Additional Work, Equipment Issue, Other)
    - Wrong Part flow: measurements + photo of correct part + optional wrong part photo
    - Additional Work flow: photo of issue
    - Office can edit everything - syncs both directions with Field Staff
    - **Full Override Permissions:** Office Staff can close jobs (completed or pink) without ANY validation requirements - no photo, notes, or reason required. This allows office to override field rules when needed.
19. ✅ **New Inspection Flow - Multi-Bank Jobs**
    - Job list view showing In Progress and Submitted jobs
    - New Job Setup: select customer, auto-generate job number (starting at 17500)
    - One job number = multiple banks (East Side, West Side, Facing Logo, Behind Logo, etc.)
    - Bank tabs for easy switching between banks within same job
20. ✅ **Issue-First Inspection Interface**
    - Floating green "Add Issue" button always visible (bottom-right corner)
    - Modal for quick issue entry: select type (Top Side/Understructure) → location → description → photo
    - Issues display as cards with photo thumbnails and location info
    - Checklists moved to collapsible "Reference" sections (guide, not primary output)
21. ✅ **Top Side → Understructure Order**
    - Inspection form now matches physical walkthrough order
    - Top Side section first: seating layout, aisle rails, top side issues
    - Understructure section second: motor specs, wheel type, understructure issues
    - Both sections collapsible with toggle arrows
22. ✅ **Unified Office/Field Inspection View**
    - Both roles see identical inspection interface
    - Office Staff has full edit permissions on all fields
    - Field Staff rules are lenient (inspectors use tablets frequently, not restricted like technicians)
23. ✅ **Job Summary & Submission**
    - Review screen showing all banks inspected
    - Total issue count across all banks
    - Inspector name and certificate number
    - Parts list (integrated with existing parts search)
24. ✅ **Sample Inspection Data - Job #16942**
    - Pre-populated with Jackson Career And Technology Elementary inspection
    - West Side bank: 2 understructure issues (loose deck support, missing bolt), 5 top side issues (skid tape, loose wheel, broken skirt board)
    - East Side bank: 1 understructure issue (broken gear motor), 7 top side issues (damaged tape, loose wheels, missing bracket, missing bolt)
    - Inspector: Danny Mendl, Certificate: MXM00-980
    - Data matches real ServicePal PDF inspections
25. ✅ **Office Inspections View - Fixed**
    - Now uses `inspectionJobs` array (multi-bank system) instead of old `inspections` array
    - Stat cards show: In Progress, Submitted, Banks Inspected
    - Click any job to view full summary with all bank details
26. ✅ **Enhanced Job Summary View**
    - Shows bank details: bleacher type, tiers, sections, aisles, motors, wheel type
    - Color-coded issue summaries: Safety (red), Functional (orange), Cosmetic (blue)
    - Expandable "View detailed issues" showing individual issues with Frame/Tier or Section/Row locations
    - For submitted jobs: "Generate QuickBooks Estimate" button (placeholder - full QB integration pending)
27. ✅ **Schedule Redesign - Dense Spreadsheet Layout**
    - HTML table replacing CSS grid cards - matches real Excel schedule
    - 4 columns: School/Location | Job Details | Tech(s) | Parts
    - Mon-Thu + floating Friday (no Sat/Sun)
    - Yellow rows for notes, blue rows for continued, pink rows for return visits
    - Red text for `*special callouts*` via pattern matching
    - Sample data from real Feb 3, 2025 schedule (Montgomery Co, Ravenwood HS, Spencer ES pink job, etc.)
28. ✅ **The Shit List - Pink Job Pool**
    - Fourth tab on scheduling (This Week / Planning / Backlog / Shit List)
    - Shows incomplete jobs with reason badges and "Why:" explanations
    - Stats: Total, Wrong/Missing Part, Other
    - Reschedule button on each job
    - Per-territory (Original/Southern)
29. ✅ **Office Sidebar Cleanup**
    - Removed "Field Staff" label, replaced with subtle divider line
    - Scheduling moved below divider (grouped with field items)
30. ✅ **Field Staff Nav Redesign**
    - New order: Search → Team Schedule → My Jobs → Inspections → Parts Specs → Work Orders
    - Search tab: find any work order, inspection, or scheduled job by school/job #/keyword
    - My Jobs: removed quick action buttons (just weekly schedule)
    - Team Schedule: read-only view
31. ✅ **Field Staff Nav Simplification**
    - Reduced to 4 tabs: Search → Team Schedule → My Jobs → Create
    - Removed Inspections, Parts Specs, Work Orders as separate nav items
    - Removed non-functional topbar search bar (fixed duplicate search bar bug)
    - Fixed search bar disappearing when returning to Search tab
32. ✅ **Unified Create Form**
    - Single form with "What are you creating?" type selector (Parts Spec Form / Work Order / Inspection)
    - Fields appear dynamically based on type selection
    - Shared fields: Customer/School, Notes
    - Type-specific: Description + Photo (WO/PSF), Job Type (WO), Inspection Type + Job # + Date (Inspection)
    - Submit button text updates per type
    - Inspection submit flows directly into bank-by-bank walkthrough
33. ✅ **Office Sidebar Reorganized**
    - Below "Inspections & Service" divider: Search → Scheduling → + Create
    - Removed Inspections, Parts Specs, Work Orders as separate nav items
    - Office Search view searches all data sources (work orders, inspections, schedule)
    - Office Create form mirrors field staff unified create
34. ✅ **Collapsible Sidebar**
    - Both office and field staff sidebars collapse/expand
    - Expanded: full wide logo (`menu-logo-wide.png`) + ✕ close button
    - Collapsed: 64px, logo icon only, emoji-only nav items
    - Smooth transitions with logo crossfade
35. ✅ **Schedule Table Polish**
    - Modern cosmetics: rounded corners, subtle shadows, gradient day headers
    - Removed hover effects (read-only, not clickable)
    - Pink jobs highlight School/Location cell only (not full row)
    - Inline `*callout notes*` styled as amber chips (distinct from pink job markers)
36. ✅ **Fixed Scheduling First-Load Bug**
    - This Week tab now populates immediately when clicking Scheduling

**Immediate:**
1. ⚠️ Get Draper CSV and add to Airtable (same process)
2. ⚠️ Test demo app with an inspector - get feedback on templates and work order flow
3. ⚠️ Receive part images from Hussey (PNG format confirmed)
4. ⚠️ Get transparent version of logo icon

**Short-term:**
1. Add QuickBooks estimate generation (the big win - saves 30+ min per estimate)
2. Improve mobile/tablet experience for field use
3. Add offline capability (cache parts locally)
4. Connect work order completion to actual job data (currently sample data)

**Medium-term:**
1. Build office review portal for procurement (partially done - estimates view exists)
2. Complete project tracking with real job status updates
3. Inventory management integration
4. Work order PDF generation (matching ServicePal format)

### Files & Locations

| File | Purpose |
|------|---------|
| `~/bleachers-seats-demo-v2.html` | **Main app prototype** - inspection form with Airtable integration |
| `~/2025 Price Guide For BS.csv` | Original Hussey CSV from vendor |
| `~/catalog-extractor/clean_hussey_csv.py` | Cleans and normalizes CSV data |
| `~/catalog-extractor/hussey_parts_cleaned.csv` | Cleaned CSV for Airtable import |
| `~/catalog-extractor/parts-search.html` | Standalone search frontend |
| `~/catalog-extractor/search_parts.py` | CLI search tool (backup) |
| `~/bleacher-app-reference.md` | This reference document |
| `~/bleachers-logo-icon.png` | Logo icon (used in collapsed sidebar + login screen) |
| `~/bleachers-logo-full.png` | Full company logo with branding |
| `~/menu-logo-wide.png` | Wide logo for expanded sidebar header (1200x100px, 12:1 ratio) |

### Airtable Credentials

- **Base ID:** `appAT4ZwbRAgIyzUW`
- **Table ID:** `tbl4mDv20NaJnaaN7`
- **API Token:** stored in `parts-search.html` (regenerate at airtable.com/create/tokens if needed)

### ServicePal Reference (System Being Replaced)

Reviewed ServicePal screenshots showing current workflow:

**Key Features to Replicate:**
- Dashboard with completed jobs chart, overdue jobs count, customers count
- Overdue jobs table: Job No., Type, Description, Customer, City, Status, Resources, Starts, Ends
- Customer search with columns: Customer, Mobile, Customer Type, Service Address, Billing Address, Recent activity
- Customer detail page with tabs: Activities, Service History, Equipment, Photos
- Job detail page with: Job number, type, status, customer info, date/time, assigned tech
- Attached documents: Work Order, Behind Logo, Facing Logo inspection forms
- Inspection form: Branded header, customer/job info, equipment details table, checklists with Checked/N/A columns

**Work Order PDF Structure (from sample):**
- Confirmation section: Confirmed with (customer contact), Confirmed by (office staff), Date
- Customer Information: School, Customer address, Contact Name, Contact Phone
- Job Information: Job Type, Parts Needed (with location), Job Reference, Special Instructions
- Completion section: Job Completed (Yes/No), Total Hours Worked, Job Completed By, Date, Signature
- Quick questions: Basketball goals count, safety straps, fixed goals, edge pads
- Technician Notes: Free-form text with photos for documenting issues

**Key Insight - Customer Hierarchy:**
- ServicePal only allows school-level customers (flat structure)
- Real business structure is: County (billing entity) → Schools (service locations)
- QuickBooks already has this hierarchy - app now matches it

### Atiba Status

**Decision:** Not using Atiba - building in-house instead

Progress so far demonstrates this approach is viable and much cheaper. Core functionality (searchable parts catalog with PSF creation) is working.

---

*End of Complete Reference Document*
