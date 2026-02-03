# Bleachers & Seats - App Development Context

**Last Updated:** January 2026  
**Purpose:** Context document for app development with Atiba

---

## Table of Contents
1. [Business Overview](#business-overview)
2. [Current Pain Points](#current-pain-points)
3. [Current Workflow](#current-workflow)
4. [Primary Goal](#primary-goal)
5. [Budget & Timeline](#budget--timeline)
6. [Vendor Information](#vendor-information)
7. [Key Requirements](#key-requirements)
8. [QuickBooks Integration](#quickbooks-integration)
9. [Systems to Replace](#systems-to-replace)
10. [Current Documents](#current-documents)
11. [Atiba Prototype Status](#atiba-prototype-status)
12. [Key Questions for Atiba](#key-questions-for-atiba)
13. [Scope Decisions](#scope-decisions)

---

## Business Overview

**Company:** Bleachers & Seats  
**Location:** Nashville, TN  
**Territory:** Kentucky, Tennessee, Alabama, Florida  

**Primary Services:**
- Bleacher inspections
- Bleacher/seating repairs
- Basketball equipment installation and repair
- Divider curtains, wall pads, scoreboards, etc.

**Key Business Relationships:**
- Hussey Seating Co (exclusive territory dealer for KY, TN, AL, FL)
- Draper (partnership deal for basketball equipment)

**Team:**
- Inspectors (field technicians with tablets)
- Office staff (procurement, scheduling, ops review)
- Sales team

---

## Current Pain Points

### 1. Inspector After-Hours Work (PRIMARY PAIN POINT)
- Inspector completes on-site inspection during work day
- **After hours (unpaid):** Inspector goes back through inspection notes
- Manually looks up part numbers from catalogs/PDFs
- Handwrites Parts Specification Forms (PSFs)
- Can take hours per inspection
- **This is the #1 problem to solve**

### 2. Manual QB Estimate Creation
- Office receives handwritten PSFs
- Someone manually types every line item into QuickBooks
- 50+ line items per estimate is common
- Slow, error-prone, time-consuming

### 3. Parts Spec Form Process Pain
- Inspector has to do inspection, then re-review all notes
- Finding part numbers is a long process
- Handwriting = transcription errors
- Multiple review/approval steps with manual data entry

### 4. Disconnected Systems
- ServicePal (inspections/work orders) - no integration
- Salesmate (CRM) - manual entry
- QuickBooks (accounting) - manual entry
- Excel (project tracker, inventory) - manual entry
- No data flows between systems

### 5. Pink Jobs
- Jobs that weren't completed on first visit
- Poor prep and communication lead to incomplete jobs
- Need better way to prep jobs and track requirements

---

## Current Workflow

### Inspection Track (Simple)
1. Customer inquiry → CRM
2. Schedule inspection
3. Inspector goes on-site
4. Completes inspection in ServicePal
5. **After hours:** Creates handwritten PSF
6. Submits to office
7. Office reviews PSF
8. Office manually creates QB estimate
9. Send to customer
10. Bill customer

### Service Projects Track (Complex)
1. Inspection identifies parts needed
2. **After hours:** Inspector creates handwritten PSF
3. Office receives PSF
4. Ops Review process:
   - Cross-check PSF against inspection
   - Fill in missing part numbers
   - Request quotes from vendors (1-4 week lag)
   - Check inventory (Excel)
5. Manually create QB estimate (type 50+ line items)
6. Send to customer
7. Customer accepts/negotiates
8. Procurement orders parts
9. Track shipments (Excel)
10. Schedule job when parts arrive
11. Create work order (manual)
12. Techs complete work
13. Tech documents completion (or discovers new issues = Pink Job)
14. Invoice customer

**Key Inefficiency Points:**
- Inspector does work twice (on-site + after hours)
- Multiple manual data entry steps
- No real-time part pricing
- Excel-based tracking
- Handwritten forms require transcription

---

## Primary Goal

**Build proprietary software to streamline procurement and inspection inefficiencies**

**Success Metrics:**
1. Inspectors stop doing after-hours PSF work
2. Office can generate QB estimate in <30 seconds instead of 30 minutes
3. Single source of truth for job/parts data
4. Eliminate Excel trackers
5. Reduce "Pink Jobs" through better prep

---

## Budget & Timeline

**Budget:** $80,000 - $100,000  
**Timeline:** 6 months  
**Dev Team:** Atiba (Nashville-based)  
**Testing:** Myself + 1 inspector for beta

**Development Priorities:**
1. Eliminate inspector after-hours PSF work (MUST HAVE)
2. Auto-generate QB estimates (MUST HAVE)
3. Digital parts catalog (MUST HAVE)
4. Project tracking (MUST HAVE)
5. Everything else = Phase 2

---

## Vendor Information

### Tier 1 - Primary Partners (~70% of business)
- **Hussey Seating Co** (exclusive territory: KY, TN, AL, FL)
  - Bleachers/seating primary
  - Gateway to other products
  - ~1,000 parts in catalog
  - Can provide CSV format
  
- **Draper** (partnership deal)
  - Basketball equipment primary
  - Can provide CSV format

### Tier 2 - Secondary Vendors (~20% of business)
- Interkal (competitor dealer - bleachers)
- Porter (basketball)
- Jaypro (sports equipment)
- Irwin (seating)
- Kodiak (seating)

### Tier 3 - Occasional/Specialty (~10%)
- ~13 additional vendors for specific parts/situations

### Cross-Vendor Compatibility
- Sometimes do vendor-to-vendor replacements (Hussey part on Irwin bleacher)
- Sometimes can retro or cross-vendor install multiple vendors
- Inspectors need to search across ALL vendors, not just one at a time

### Current Part Catalog Status
- Parts live in vendor catalogs (PDFs, physical books)
- Some vendors provide CSV (part #, description, price - no images)
- Parts do NOT exist in QuickBooks currently
- No centralized database

---

## Key Requirements

### Mobile Inspection App (Tablet/Laptop)
- **Offline-capable** (schools often have poor WiFi)
- Inspector uses tablet on-site
- Some inspectors use laptop + tablet

**Must Include:**
- Equipment details entry (bleacher type, tiers, manufacturer, etc.)
- Inspection checklist (understructure, top side)
- Deficiency documentation
- Photo capture
- Digital part search & selection
- Real-time PSF creation
- Submit when online

### Digital Parts Catalog
- Search by:
  - Keyword ("seat slat")
  - Part number
  - Equipment type
  - Manufacturer
- Must support multi-vendor selection on same job
- Include:
  - Part number
  - Description
  - Vendor/manufacturer
  - Current price (where available)
  - Optional: Photos (helpful for visual ID)
  - Equipment compatibility

### Office Review Portal (Web App)
- View submitted inspections
- See digital PSFs with photos
- Edit/add/remove parts if needed
- Track parts awaiting vendor quotes
- Approve inspection
- **Generate QuickBooks Estimate** (one button)

### QuickBooks Integration
- **CRITICAL:** "If it didn't happen in QuickBooks, it didn't happen at all"
- Create estimates programmatically via QB API
- Push line items: part #, description, qty, price, labor
- Link to customer records
- QuickBooks Desktop or QuickBooks Online: **Web App (most team members)**

### Parts & Inventory Management
- Track parts ordering
- PO tracking by vendor
- Expected delivery dates
- Received items tracking
- Link to specific jobs
- Shipment tracking info/notes

### Project Tracker
- Replace Excel project tracker
- Job status: Accepted → Parts Ordered → Parts Received → Scheduled → In Progress → Complete
- Visual pipeline (Kanban or table view)
- Filter by tech, county, status
- Track job backlog

### Work Orders (Mobile for Techs)
- View assigned work orders
- Job details, parts list, parts location (shop/on-site)
- Complete/mark done
- Photo upload for completed work or new issues discovered
- Document partial completions (Pink Jobs)

---

## QuickBooks Integration

**Current State:**
- QuickBooks is the heart of everything
- All financial data lives in QB
- Parts do NOT currently exist in QB as items/products
- Estimates are created manually (typing each line item)

**Required Integration:**

**From QB → New App (Read):**
- Customer list
- Existing estimates/invoices
- (Optional: Job history)

**From New App → QB (Write):**
- Create estimates automatically
- Include all line items (part #, description, qty, price)
- Link to customer
- Labor costs

**Technical Approach Options:**
1. Create QB items on-the-fly when estimate generated
2. Pre-populate QB with all vendor catalog parts
3. Hybrid: App maintains parts DB, pushes non-inventory line items to estimates

**Pricing Updates:**
- Vendor prices change annually
- Need ability to import new CSV price lists
- Version history (know when prices changed)

---

## Systems to Replace

### ❌ ELIMINATE:
- **Salesmate** (CRM) - Replace with simple customer/account management
- **ServicePal** (inspection/work orders) - Replace entirely with new app
- **Excel Project Tracker** - Replace with digital project board
- **Handwritten PSFs** - Replace with digital PSF creation
- **Dropbox part number hunting** - Replace with searchable digital catalog

### ✅ KEEP:
- **QuickBooks** (accounting/invoicing) - Integrate with new app
- **Homebase** (payroll/time tracking) - Keep as-is
- **ShareDrive** (document storage) - May still be useful
- **GroupMe** (team communications) - Lightweight, works well

---

## Current Documents

### Inspection Report Example
**Brentwood Academy - 9/8/2025**
- 8-page detailed inspection
- Equipment details (Irwin bleachers, 7 tiers, etc.)
- Understructure checklist (14 items): motors, frames, wheels, hardware, etc.
- Top side checklist (9 items): rails, deck boards, seats, etc.
- Issue documentation with photos
- Safety/Functional/Cosmetic categorization
- Inspector signature & certificate

### Parts Specification Form (PSF) Examples
**Multiple locations, multiple vendors**
- Handwritten forms
- Part #, Description, Qty, Cost, Customer Price, Labor Price
- Service notes: "System needs grease, Tough Deck Support #2 needs jacked up"
- Technical diagrams (frame forms)
- Multiple vendors on same job (Duckbill, APDC, EC-series, Irwin, etc.)

### Work Order Example
**Brentwood Academy - Job #15933**
- Multi-location job (Dalton, Facing Upper, Middle School, Kennedy)
- Confirmed with customer
- Parts location (TN Shop)
- 13.5 hours worked
- Job NOT completed - issues discovered during work
- Detailed technician notes with 6 photos
- Findings: "New frames will not work, reinstalled old frame"

### Key Observations from Real Documents:
- Jobs can cover multiple gyms/locations at one school
- Parts come from 6+ different vendors on single job
- Service notes provide critical context for office
- Photos are embedded throughout (inspection, PSF, work order)
- Inspectors document exact locations (Section, Row, Frame, Tier)

---

## Atiba Prototype Status

**What Atiba Has Shown (Figma Screens):**

### ✅ Good Screens:
1. **Page 2: Office Dashboard** - Pipeline overview, alerts, quick actions
2. **Page 4: Accounts & Equipment Registry** - Customer/location management
3. **Page 5: Estimate Review Dashboard** - Review PSF, approve, generate QB estimate
4. **Page 6: Project Tracker Board** - Kanban-style job status tracking
5. **Page 8: Parts & Inventory Management** - PO tracking, received items
6. **Page 9: Weekly Schedule** - Tech/crew assignments by day
7. **Page 11: Field Dashboard (Mobile)** - Today's schedule, pending items
8. **Page 12: Inspections List** - Shows inspection status (In Progress, Submitted, Drafts)
9. **Page 13: Digital Parts Specification Form** - Project info, manufacturer/model search, part search
10. **Page 14: Work Orders (Mobile)** - View assigned work orders

### ❓ Questions About Atiba's Design:

**1. Inspection Form Screen Missing?**
- Page 12 shows list of inspections
- Page 13 jumps to PSF creation
- Where is the actual inspection checklist/form?
- Equipment details entry?
- Understructure/Top side checklists?
- Issue documentation?

**2. Photo Capture?**
- No visible photo capture screens
- How do inspectors take photos during inspection?
- How are photos attached to specific findings?

**3. Part Search Flow?**
- Page 13 shows manufacturer dropdown, model dropdown, search field
- What happens after inspector searches?
- Search results screen?
- Part detail/selection screen?
- How are parts added to PSF list with quantities?

**4. Multi-Vendor Support?**
- Manufacturer dropdown shows "Draper"
- Real jobs need parts from 6+ vendors (Duckbill, APDC, Irwin, etc.)
- Can inspector search across all vendors at once?
- Or must they search one vendor at a time?

**5. Inspection → PSF Connection?**
- Are these two separate workflows?
- Or is PSF created as part of the inspection?
- Real workflow: Inspection identifies issues → PSF lists parts to fix those issues

**6. QuickBooks Export Confirmation?**
- Page 5 shows "Approve & Export" button
- What happens after clicking?
- Confirmation screen?
- Error handling?
- Link to view QB estimate?

**7. Offline Mode?**
- No visible offline indicator
- Sync status?
- What happens if inspector submits while offline?

### 🚩 Potential Issues:

**Page 5: Pricing Display Bug**
- Frame Mounting Bracket Unit Price: "17.849999999999E"
- Should show: "$17.85"

### 📊 Scope Concerns:

**Potentially Over-Scoped for Budget:**
- **Page 3: Sales Dashboard** - Full CRM with pipeline, forecasting, win/loss tracking
  - Could save $8-12k by simplifying to basic customer list
  
- **Page 10: Analytics Dashboard** - Revenue trends, leaderboards, performance metrics
  - Could save $3-5k by using basic number cards instead
  
- **Page 7: Employee Management** - Full HR-style employee directory
  - Could save $2-3k by keeping minimal for assignment purposes
  
- **Page 9: Weekly Schedule** - Drag-and-drop scheduling by truck/crew
  - Could save $4-6k by starting with simple list view

**Estimated Savings if Cut:** $17-26k

---

## Key Questions for Atiba

### Workflow & Missing Screens:

1. **Where is the inspection form screen?**
   - Show Equipment Details entry
   - Show Understructure/Top Side checklists
   - Show how inspector documents "Frame 10 tier 2 out of track" during inspection

2. **How do inspections and PSFs connect?**
   - Are they integrated or separate workflows?
   - Real workflow: Inspection identifies issues → PSF created from those issues

3. **How does photo capture work?**
   - Show: Inspector finds broken part → Takes photo → Photo attached to finding
   - Show: Photos appear in PSF and office review

4. **What is the exact inspector workflow?**
   - Option A: Inspection Form → Document Issues → Create PSF from issues → Submit
   - Option B: Standalone PSF creation (no inspection form)
   - Which one is your design?

### Technical Requirements:

5. **How does part search support multiple vendors?**
   - Show: Inspector searching across ALL vendors at once
   - Show: PSF with parts from Duckbill, APDC, EC-series, GISL on same job

6. **How does offline mode work?**
   - Offline indicator?
   - Sync status visibility?
   - Conflict resolution?

7. **QuickBooks integration details?**
   - What happens after "Approve & Export"?
   - Success/error handling?
   - Which QB API (Desktop or Online)?

8. **What's your proposed tech stack?**
   - Frontend: React Native (mobile) + React (web)?
   - Backend: Node.js? Python?
   - Database: PostgreSQL? MongoDB?
   - Offline storage: SQLite? IndexedDB?

### Budget & Scope:

9. **What's included in $80-100k budget?**
   - Development hours?
   - Design (UI/UX)?
   - Testing?
   - Deployment?
   - Training?
   - Post-launch support (30-60 days)?

10. **If we simplify scope, what's the new price?**
    - Core: Inspection + PSF + Office Review + QB Integration + Basic Project Tracker
    - Cut: CRM, Advanced Analytics, Employee Management, Drag-drop Scheduling
    - Target: $65-75k

---

## Scope Decisions

### MUST HAVE - Phase 1 (6 months, $75-85k target)

**Mobile Inspection App:**
- ✅ Equipment details entry
- ✅ Basic inspection checklist (simplified from 14-item understructure + 9-item top side)
- ✅ Issue documentation (text + location)
- ✅ Photo capture
- ✅ Digital part search & selection (all vendors searchable)
- ✅ Real-time PSF creation
- ✅ Works offline, syncs when online
- ✅ Submit to office

**Digital Parts Catalog:**
- ✅ Import Hussey + Draper catalogs (CSV)
- ✅ Search by keyword, part #, equipment type
- ✅ Part #, description, vendor, current price
- ⚠️ Photos optional (can add later)
- ✅ Annual pricing updates via CSV import

**Office Review Portal:**
- ✅ View submitted inspections
- ✅ See digital PSFs with photos
- ✅ Edit/add/remove parts
- ✅ Track quote requests (simple status field)
- ✅ Approve inspection

**QuickBooks Integration:**
- ✅ One-click estimate generation
- ✅ Push line items (part #, description, qty, price)
- ✅ Link to customer
- ✅ Success/error handling

**Project Tracker:**
- ✅ Kanban board (Accepted → Parts Ordered → Parts Received → Scheduled → In Progress)
- ✅ Job status tracking
- ⚠️ Simple view (not drag-and-drop)

**Parts & Inventory:**
- ✅ PO tracking by vendor
- ✅ Expected delivery dates
- ✅ Received items
- ✅ Link to jobs

**Work Orders (Basic):**
- ✅ View assigned work orders
- ✅ Job details, parts list
- ✅ Mark complete
- ✅ Photo upload

### NICE TO HAVE - Phase 2 (Post-MVP)

**Cut to Save Budget:**
- ❌ Full CRM/Sales Pipeline (use QB customer list)
- ❌ Advanced Analytics (revenue trends, leaderboards)
- ❌ Employee Management (keep minimal)
- ❌ Drag-and-drop scheduling
- ❌ Digital frame forms (paper is fine for now)
- ❌ Customer portal
- ❌ Cost vs. Customer Price margin tracking (can calculate in Excel)
- ❌ Safety/Functional/Cosmetic categorization (just list issues)

**Add in Future Phases:**
- Annual inspection reminders
- Customer notifications before service
- Sales visibility into job queue
- Tech performance analytics
- Pink job tracking/analytics
- Advanced reporting

---

## Success Criteria

**Phase 1 is successful if:**

1. ✅ Inspectors complete on-site work and submit - NO after-hours PSF work
2. ✅ Office can generate QB estimate in <60 seconds (currently 30+ minutes)
3. ✅ Parts catalog searchable digitally (no more Dropbox hunting)
4. ✅ Job status visible in project tracker (no more Excel)
5. ✅ System works offline in schools with poor WiFi
6. ✅ QuickBooks estimates auto-created with all line items

**What success does NOT require in Phase 1:**
- Full CRM replacement
- Advanced analytics
- Perfect margin tracking
- Digital frame forms
- Customer portal

---

## Notes & Reminders

- **"If it didn't happen in QuickBooks, it didn't happen at all"** - QB is the heart
- **Inspector after-hours work is the #1 pain point** - everything else is secondary
- **Schools have poor WiFi** - offline mode is CRITICAL
- **Multi-vendor jobs are common** - can't restrict search to one vendor at a time
- **70% of parts are Hussey + Draper** - prioritize these catalogs first
- **New workflow is encouraged** - don't need to replicate old 8-page inspection exactly
- **Budget is $80-100k** - need to be ruthless about scope to stay in budget

---

## Document Version History

- **v1.0** - January 2026 - Initial context document created

---

## Next Steps

1. Get clarification from Atiba on missing screens (inspection form, photo capture, part search results)
2. Confirm QuickBooks integration approach
3. Discuss scope reduction to hit $75-85k budget
4. Review tech stack proposal
5. Define Phase 1 MVP acceptance criteria
6. Plan beta testing with 1-2 inspectors