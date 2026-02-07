# Bleachers & Seats - Historical Reference

**Purpose:** Archived changelog, version history, and completed milestones. The active development reference is in `bleacher-app-reference.md`.

---

## Version 3.2.1 (February 7, 2026)

**Office Parts Management & Image UX Improvements**

**Features:**
- **Office Role Parts Management** - Office users can now access Settings → Manage → Parts Catalog (was Admin only)
- **Employees Tab Hidden for Office** - Only Admin sees Employees tab in Manage section
- **Live API Search in Manage** - Parts search in Manage section now uses live API with 300ms debounce (was local filtering from 100 parts)
- **Image Lightbox** - Click any part card with image to view full-size overlay with part details
- **Centered Details Pill Bar** - Part number, name, price, and vendor shown in styled pill below enlarged image
- **Clickable Part Cards** - Entire card clickable to expand (not just thumbnail)
- **Tap to View Indicator** - "📷 Tap to view" hint on parts with images
- **Screenshot Paste Support** - Paste images directly into part edit modal (Ctrl/Cmd+V)

**Files Modified:**
- `js/views/admin.js` - Office role access, API search, lightbox, paste handling
- `js/utils/parts-catalog.js` - Lightbox for Tech/Office/Inspection views
- `index.html` - Paste zone in part edit modal

---

## Version 3.2.0 (February 6, 2026)

**Parts Catalog Migrated to Vercel Postgres + Blob**

**Features:**
- Migrated 2,100+ parts from Airtable to Vercel Postgres
- Part images stored in Vercel Blob
- Full CRUD API for parts management
- Bulk CSV import for pricing updates
- Bulk image upload (match by part number)
- Admin Settings → Manage → Parts Catalog tab

---

## Version 3.1.1 (February 6, 2026)

**Code Cleanup & Folder Restructure**

**Cleanup:**
- Removed 16 debug `console.log` statements across JS files
- Implemented `addIssue()` function for legacy bleacher/outdoor inspection templates
- Removed stale TODO comments

**Folder Restructure:**
- Moved `reference/` folder contents to `archive/old-reference-docs/` (gitignored)
- Moved `~/catalog-extractor/` to `bleachers-app/tools/` (scripts only, data gitignored)
- Added `tools/` to repo with catalog extraction scripts
- Updated `.gitignore` for tools data files

**Commit:** `0af0ba5`

---

## Version 3.1.0 (February 6, 2026)

**Home Page with Bulletins & Notifications**

**Features:**
- **Home Page** - Role-specific landing page (default view after login)
- **Company Bulletins** - Admin-managed announcements with types (info, alert, holiday, safety, HR)
- **Notifications Panel** - Role-specific updates with mark-as-read (blue dot)
- **Needs Attention Panel** - Pink jobs, pending reviews, scheduled jobs, parts on order
- **Today's Jobs Panel** - Field view of daily schedule
- **Bulletin Management** - Admin Settings → Manage → Bulletins tab

**Commit:** `30a87d5`

---

## Version 3.0.0 (February 6, 2026)

**MAJOR RELEASE: Sales/Operations Separation & Feedback Implementation**

### Key Changes

**Pipeline Split:**
- Renamed "Pipeline" → "Project Tracker" (moved to Logistics section)
- Created new "Sales Pipeline" in Sales section
- Sales Pipeline: Pre-sale tracking with A/B/C deal grading, 6 Salesmate stages, deal values
- Project Tracker: Post-sale operations with date fields (received, started, target, completed), oldest→newest sorting, labor amounts

**New Features:**
- **Special Instructions:** Amber warning box at top of work orders for critical job info
- **Confirmed Status:** Visual confirmation tracking in schedule (✓✓ green = confirmed, ✓ orange = attempted, — gray = not confirmed)
- **Equipment Rental Tags:** 🚜 badges identify jobs requiring lifts/equipment
- **Estimate Line Items:** Shipping and Labor as separate, visible line items
- **Internal Notes:** Office-only notes section with 🔒 icon, not visible to customers/field

**Development:**
- Branch: `v3-feedback-implementation` merged to `main`
- 16 features implemented in 1 day (Feb 6, 2026)
- Addressed feedback from Story (Director of Operations) and Atiba prototype comparison

**Commits:**
- `71e5a8a` - Special Instructions field
- `f07d376` - Confirmed/Unconfirmed status column
- `a33eb4b` - Equipment rental tag
- `73c343e` - Shipping and Labor line items
- `89106f6` - Internal Notes field

---

## Version 2.1.3 (February 6, 2026)

**Final v2 Release (Tagged before v3 merge)**

**Bug Fix:**
- Fixed `logout()` function crashing due to null reference
- Issue: Attempted to access `adminNavSection` element that doesn't exist in HTML
- Fix: Added null check before accessing element classList
- Location: js/app.js:166

---

## Version 2.1 - 2.1.2 (February 5-6, 2026)

**Live Status Tracking System**

**Features:**
- Live status tracking (scheduled → en route → checked in → complete/unable to complete)
- Jobs view for Office/Admin (operational real-time status board)
- Status Flow: Scheduled → En Route → Checked In → Complete/Unable to Complete
- Auto-timestamps for check-in and completion
- Unable to Complete modal with reason selection, notes, photo upload
- Week progress tracking (X/Y jobs completed with percentage)
- Status badges and action buttons on My Jobs and Jobs views
- Status column added to Scheduling spreadsheet view

**v2.1.1 Bug Fix:**
- Fixed syntax error in js/views/inspection.js line 976
- Unescaped double quote in placeholder attribute broke JavaScript loading

**v2.1.2 Code Organization:**
- Added section comments to all large JS view files
- scheduling.js (55KB): 8 sections
- inspection.js (43KB): 7 sections
- dashboard.js (47KB): 6 sections
- my-jobs.js (18KB): 3 sections
- admin.js (29KB): 3 sections

---

## Version 2.0 (February 5, 2026)

**MAJOR RELEASE: Navigation Refactor & Field Create**

### Key Changes

**Navigation Restructure:**
- Complete sidebar reorganization for office/admin and field roles
- Office/Admin: Search | Sales (Pipeline, Accounts) | Procurement (Ops Review, Estimates, Parts Orders) | Logistics (Shipping, Scheduling) | Resources (Parts Catalog) | Settings
- Field: Search | Inspections & Service (My Jobs, Team Schedule) | Resources (Parts Catalog) | Settings
- Cleaner grouping with labeled dividers
- Settings moved to bottom of sidebar for all roles

**Field Create Feature:**
- Added "+ Create Job" button to My Jobs view for field staff
- Unified create form supporting: Inspection, Work Order, Parts Spec
- Field staff can now initiate jobs directly from their schedule view
- Same customer selection workflow as office create
- Create button positioned on left, week navigation on right

**Settings Enhancement:**
- Role-based settings sections
- Profile section (all roles): name, phone, email
- QuickBooks Integration section (Office + Admin): connection status, reconnect button
- Manage section (Admin only): Employees, Parts Catalog, Import Pricing, Vendors tabs

**Bug Fixes:**
- Fixed admin default view showing obsolete dashboard (now defaults to Pipeline)
- Fixed blank pipeline view on initial load (timing/race condition issues)
- Fixed incomplete `addIssue()` function causing syntax error
- Fixed missing `populateJobCustomers()` function reference
- Fixed null reference for missing `adminNavSection` element
- Removed debug console logs from production code

**Version Management:**
- v1.0 tagged as archived baseline (original navigation structure)
- v2.0 tagged as current release
- nav-refactor branch merged to main

### Files Modified
- `index.html` - Added fieldCreateView, updated My Jobs header layout, hidden obsolete dashboardView
- `js/app.js` - Added fieldCreate view handling, null checks for missing elements, fixed login flow
- `js/views/create.js` - Added field create functions (initFieldCreateForm, onFieldCreateTypeChange, submitFieldCreate, etc.)
- `js/views/dashboard.js` - Fixed pipeline loading, added null checks, stub functions for obsolete dashboard
- `js/views/inspection.js` - Completed addIssue function stub
- `css/app.css` - Navigation styling updates
- `js/views/admin.js` - Settings enhancements
- `js/utils/parts-catalog.js` - Search improvements

---

## Versions 6.0 - 15.0 (January 28 - February 4, 2026)

### Document Version History

- **v15.0** - February 4, 2026 - **MAJOR UPDATE: CRM & Navigation Overhaul** - Multi-contact support with role badges (Scheduling, Contracts, Billing, Equipment, Access, Primary). Contacts at both customer and location level. CRUD for customers, contacts, locations. Customer type label changed from "County" to "District". Sidebar reorganization (Search at top for both views). Navigation uses data-view attributes for reliable highlighting. Office default: Dashboard. Field default: My Jobs. Field nav reordered: My Jobs > Team Schedule > Create. API keys moved to gitignored config.js. App restructure merged to main.
- **v1.0** - January 2026 - Initial context document created
- **v2.0** - January 2026 - Complete reference consolidated (includes job lifecycle PDF insights, logo, expanded pain points, technical considerations)
- **v3.0** - January 2026 - Combined reference file created (merged bleachersandseats-app.md and bleachersandseats-complete-reference.md)
- **v4.0** - January 2026 - Added DIY development progress section (parts catalog extractor)
- **v4.1** - January 2026 - Updated: reaching out to vendors for CSVs/images, added CSV pricing update feature plan
- **v5.0** - January 28, 2026 - **MAJOR UPDATE:** Hussey CSV received, 2,142 parts imported to Airtable, working search frontend built with PSF export
- **v5.1** - January 29, 2026 - Integrated Airtable catalog into inspection form demo, Hussey confirmed PNG images
- **v5.2** - January 29, 2026 - **MAJOR UPDATE:** Added 3 inspection type templates (Basketball Goal, Indoor Bleacher, Outdoor Bleacher) with type-specific checklists, integrated company logos
- **v6.0** - February 2, 2026 - **MAJOR UPDATE:** ServicePal replacement features - Customer hierarchy (County -> School matching QB), unified job numbering system, job types, enhanced work orders with confirmation/completion tracking, customer detail view with service history
- **v6.1** - February 2, 2026 - **Field Staff Work Orders:** Simplified mobile work order view for techs - read-only job info, required completion photos/notes, streamlined "Not Completed" flow with one-tap reason buttons, enhanced Wrong Part flow requiring measurements + photo of correct part
- **v6.2** - February 2, 2026 - **Office Staff Work Orders:** Updated to match Field Staff layout (read-only by default) with per-section Edit buttons - click Edit to modify any section, Save/Cancel to finish
- **v6.3** - February 2, 2026 - **Office + Field Sync:** Added full Field Staff completion sections to Office view - photo uploads, completion notes, Not Completed flow with all reason options (Wrong Part with measurements, Additional Work with photos, etc.). Office sees everything Field sees and can edit all fields.
- **v6.4** - February 2, 2026 - **MAJOR UPDATE: New Inspection Flow** - Complete redesign of inspection workflow to match real-world inspector walkthrough: Multi-bank job system, issue-first interface, Top Side -> Understructure order, unified Office/Field view, photo capture per issue, bank tabs, job summary view.
- **v6.5** - February 2, 2026 - **Sample Data & Office Inspection View Fix:** Sample inspection job #16942 (Jackson Career And Technology Elementary) pre-populated with real data from ServicePal PDFs. Two banks with full issue details. Office Inspections view fixed to use multi-bank jobs system.
- **v7.0** - February 2, 2026 - **MAJOR UPDATE: Scheduling System** - Full scheduling module matching Excel Project Tracker workflow: Office Scheduling View (This Week / Planning / Backlog), Territory Separation (KY/TN and AL/FL), Weekly Schedule Grid, Planning Tab, Backlog, Add Entry Modal, Confirmation Tracking, Sample Data from real schedules, Field Staff My Jobs and Team Schedule views.
- **v8.0** - February 3, 2026 - **MAJOR UPDATE: Schedule Redesign & Shit List** - Dense spreadsheet-style table layout replacing CSS grid cards. 4 columns (School/Location | Job Details | Tech(s) | Parts). Mon-Thu + floating Friday. Yellow highlight rows for notes, blue for continued, pink for return visits. Red text for special callouts. The Shit List tab for pink/incomplete jobs. Field Staff nav redesign with Search tab. Office sidebar cleanup.
- **v9.0** - February 3, 2026 - **MAJOR UPDATE: Field Staff Nav Simplification & Unified Create Flow:** Field Staff nav reduced to 4 tabs (Search | Team Schedule | My Jobs | Create). Unified Create tab with type selector dropdown. Consolidated 3 separate views into 1 progressive form.
- **v10.0** - February 3, 2026 - **MAJOR UPDATE: Office Sidebar Overhaul, Collapsible Nav, Schedule Polish:** Office sidebar reorganized with Search, Scheduling, Create below divider. Collapsible sidebar with logo crossfade. Schedule table cosmetic polish. Pink job vs inline notes visual separation. Fixed scheduling first-load bug.
- **v11.0** - February 3, 2026 - **MAJOR UPDATE: Admin Role, GitHub Deployment, File Organization:** Admin login with Employees CRUD and Data Management (Parts Catalog, CSV Import, Vendors). GitHub Pages deployment. File organization consolidated into ~/bleachers-app/.
- **v12.1** - February 3, 2026 - **Mobile Navigation, UI Cleanup, Mobile Schedule Cards:** Mobile hamburger menu, login logo animation, topbar removed with inline search, Estimates/Pipeline inline search, mobile schedule cards, resize listener.
- **v12.2** - February 3, 2026 - **Mobile Scheduling Layout Fix:** Week nav arrows and Add Entry stacked vertically on mobile. Territory/schedule sub-tabs shrunk.
- **v13.0** - February 3, 2026 - **MAJOR UPDATE: Ops Review & Inspection Status Workflow:** Ops Review nav item with badge count. Inspection status flow (submitted -> under_review -> approved). List view with stat cards and filter tabs. Generate QB Estimate creates work order with same job number. Field staff only see approved inspections.
- **v13.1** - February 3, 2026 - **Ops Review Detail View Fix:** Dedicated renderOpsReviewDetail() renders inline in office dashboard instead of swapping to field staff view. Sidebar section labels added (Office & Sales, Inspections & Service, Admin). Pipeline view replaced Project Tracker.
- **v13.2** - February 3, 2026 - **Vercel API Deployed & Configured:** bleachers-api deployed to Vercel with auto-deploy. Migrated to @upstash/redis. ESM module fix. Upstash Redis store connected. Git identity configured.
- **v14.0** - February 4, 2026 - **MAJOR UPDATE: Multi-File Restructure** - Split single 10,859-line HTML into modular file architecture. 9 view modules, 2 utilities. On `restructure` branch.

---

### Completed Milestones (Items 1-62)

1. Received Hussey CSV with 2,142 parts + 4 years pricing history
2. Built data cleaning pipeline with simplified categories
3. Imported to Airtable database
4. Built working search frontend with PSF list and CSV export
5. Integrated Airtable catalog into inspection form demo app
6. Confirmed Hussey will send PNG images for parts
7. Added company logos to login screen and sidebars
8. Built 3 inspection type templates (Basketball, Indoor Bleacher, Outdoor Bleacher)
9. Customer hierarchy matching QuickBooks (County -> School structure)
10. Unified job numbering system (Job # = Estimate # = QB # everywhere)
11. Job types (Go See, Service Call, Repair, Inspection)
12. Enhanced Work Orders - Office View (ServicePal-style with confirmation, parts location, completion tracking)
13. Customer detail view with service history tabs
14. Office Staff can access Field Staff views (inspections, parts specs, work orders)
15. Field Staff Work Orders - Simplified Mobile View (work orders list, read-only detail, required completion photo/notes, "Not Completed" flow with one-tap reason buttons)
16. Wrong Part Flow Enhanced - requires measurements + photo of correct part
17. Office Staff Work Orders - Unified Layout with Edit Buttons (matches Field Staff, per-section Edit/Save/Cancel, sidebar preserved)
18. Office Staff - Full Field Completion Flow (same completion sections as Field Staff, full override permissions)
19. New Inspection Flow - Multi-Bank Jobs (job list, new job setup, bank tabs)
20. Issue-First Inspection Interface (floating Add Issue button, modal entry, cards with thumbnails, collapsible reference checklists)
21. Top Side -> Understructure Order (matches physical walkthrough)
22. Unified Office/Field Inspection View (identical interface, office has full edit permissions)
23. Job Summary & Submission (review all banks, total issues, inspector info, parts list)
24. Sample Inspection Data - Job #16942 (Jackson Career And Technology Elementary, 2 banks with real issue data)
25. Office Inspections View Fixed (uses inspectionJobs array, stat cards, click to view summary)
26. Enhanced Job Summary View (bank details, color-coded issues, expandable details, Generate QB Estimate button)
27. Schedule Redesign - Dense Spreadsheet Layout (HTML table, 4 columns, Mon-Thu + Friday, color-coded rows)
28. The Shit List - Pink Job Pool (fourth scheduling tab, reason badges, stats, reschedule button)
29. Office Sidebar Cleanup (divider line, scheduling grouped with field items)
30. Field Staff Nav Redesign (Search -> Team Schedule -> My Jobs -> Inspections -> Parts Specs -> Work Orders)
31. Field Staff Nav Simplification (4 tabs: Search -> Team Schedule -> My Jobs -> Create, fixed search bugs)
32. Unified Create Form (type selector, dynamic fields, shared + type-specific fields)
33. Office Sidebar Reorganized (Search -> Scheduling -> Create below divider, office search/create views)
34. Collapsible Sidebar (expand/collapse with logo crossfade, emoji-only nav when collapsed)
35. Schedule Table Polish (rounded corners, gradient headers, pink cell-only highlighting, amber callout chips)
36. Fixed Scheduling First-Load Bug
37. Admin Role Added (admin login, Employees CRUD, Data Management with Parts/Import/Vendors)
38. Login Screen Polish (larger icon, wide logo)
39. GitHub Pages Deployment (christiancbs.github.io/bleachers-app/)
40. File Organization (consolidated into ~/bleachers-app/, gitignored working files)
41. Sidebar Reorganization & Pipeline View (3 sections, 8 status stages, territory filter, 23 sample jobs)
42. Mobile Navigation (hamburger menu, sidebar overlay, auto-close)
43. Login Logo Animation (spin-in with bounce)
44. Topbar Removed / Inline Search (Pipeline and Estimates inline search, "Open QuickBooks" link)
45. Mobile Schedule Cards (stacked cards on mobile, day headers, color-coded, resize listener)
46. Mobile Scheduling Layout Fix (vertical stacking, shrunk tabs)
47. Ops Review View (nav item with badge, status flow, list/detail views)
48. Generate QB Estimate Creates Work Order (approved status, same job number)
49. Field Staff Inspection Visibility Filter (only approved inspections)
50. Vercel Serverless API Deployed (bleachers-api with OAuth + QB endpoints)
51. Upstash Redis for Token Storage (migrated from @vercel/kv)
52. ESM Module Fix
53. Git Identity Configured
54. App restructure merged to main branch
55. API keys moved to gitignored js/config.js
56. Customer type label changed from "County" to "District"
57. CRM: Multi-contact support with contacts array at customer and location level
58. CRM: Contact roles with badges (Scheduling, Contracts, Billing, Equipment, Access, Primary)
59. CRM: CRUD for customers, contacts, and locations with modals
60. CRM: Helper functions getPrimaryContact() and getContactForRole()
61. Navigation: Sidebar uses data-view attributes for reliable highlighting
62. Navigation: Reorganized sidebars (Search at top, Office default Dashboard, Field default My Jobs, Field nav reordered)

---

### Archived Sections

#### Current Documents & Forms (as of January 2026)

##### 1. Inspection Report Example (Brentwood Academy - 9/8/2025)

**Format:** 8-page detailed inspection in ServicePal

**Content:**
- Equipment details: Manufacturer (Irwin), Bleacher type (7 tiers), Location (Main gym, Section A)
- Understructure checklist (14 items): Motors, drive system, wheels, frames, hardware, safety features, etc. Each item: Pass/Fail/NA + notes
- Top side checklist (9 items): Rails, deck boards, seats, risers, tread, hardware, etc. Each item: Pass/Fail/NA + notes
- Issue documentation with photos: "Frame 10 tier 2 out of track", photo attached to specific finding
- Safety/Functional/Cosmetic categorization
- Inspector signature & certificate
- Multiple locations at one school (jobs can cover multiple gyms)

##### 2. Parts Specification Form (PSF) Examples

**Current Format:** Handwritten forms, multiple pages

**Content:**
- Job info: Customer, location, date, inspector
- Parts table: Part #, Description, Quantity, Cost (vendor price), Customer Price (marked up), Labor Price
- Service notes: "System needs grease, Tough Deck Support #2 needs jacked up"
- Technical diagrams (frame forms) - hand-drawn
- Multiple vendors on same job (Duckbill, APDC, EC-series, Irwin, Hussey all on one PSF)

##### 3. Work Order Example (Brentwood Academy - Job #15933)

**Format:** ServicePal work order viewed on tech's iPad

**Content:**
- Multi-location job (Dalton gym, Facing Upper gym, Middle School gym, Kennedy gym)
- Job confirmed with customer (contact: John Smith, facilities director)
- Parts location: TN Shop (staged and ready for pickup)
- Status: Job NOT completed - issues discovered during work
- Detailed technician notes about part issues and additional work needed
- 6 photos uploaded (issues, work-in-progress, parts that didn't fit)

##### 4. Cash In & PO Report

Daily email to office staff showing accepted jobs, payments, and POs placed. Generated from QuickBooks data, manually created by Story (office manager). Data manually entered into Excel trackers.

##### 5. Project Tracker (Excel) - Two Territories

Large Excel spreadsheet with color coding (Green=ready, Pink=issues, Blue=inspections, Yellow=waiting, White=backlog). Columns: Customer, Job description, Status, Estimate Amount/Date, Accepted Date, Parts Ordered/Received dates, Scheduled Date, Tech Assigned, Comments, Special Requirements. Used for scheduling, planning, filtering, job prep.

##### 6. Inventory (Excel)

Excel spreadsheet: SKU/Part Number, Description, Manufacturer, Location (TN/AL Shop), Unit, Quantity in Stock, Cost, Total Value, Notes, Dates. Used for parts search before ordering, receiving updates, parts pull lists.

---

#### Atiba Prototype Review (Decision: Not Using Atiba)

**Decision made:** Building in-house instead of using Atiba ($80-100k saved).

**Atiba's Good Screens:** Office Dashboard (Page 2), Accounts & Equipment Registry (Page 4), Estimate Review Dashboard with "Approve & Export" button (Page 5 - KEY screen), Project Tracker Board (Page 6), Parts & Inventory Management (Page 8), Weekly Schedule (Page 9), Field Dashboard Mobile (Page 11), Inspections List Mobile (Page 12), Digital PSF Mobile (Page 13 - KEY screen), Work Orders Mobile (Page 14).

**Issues Found:** Missing inspection form screen, no photo capture workflow shown, part search flow unclear after initial search, multi-vendor support unclear (dropdown showed single vendor), inspection-to-PSF connection unclear, no QB export confirmation screen, no offline mode indicators, operations review process not shown.

**Pricing Display Bug:** Frame Mounting Bracket showing "17.849999999999E" instead of "$17.85" (floating point issue).

**Over-Budget Features Identified:** Full CRM (save $8-12k), Advanced Analytics (save $3-5k), Employee Management (save $2-3k), Drag-and-Drop Scheduling (save $4-6k). Total savings: $17-26k.

---

#### Critical Questions for Atiba (No Longer Relevant)

Questions covered: inspection form screens, inspection-PSF connection, photo capture, inspector workflow, multi-vendor support, part search flow, pricing visibility, offline mode, QB integration details, pricing update workflow, tech stack, offline sync architecture, photo handling, budget breakdown, simplified scope pricing, Phase 1 vs Phase 2 definition, timeline, delivery approach, risk areas.

---

#### PDF Catalog Extractor History

**Location:** `~/catalog-extractor/`

Built Python script to extract parts data from vendor PDF catalogs using Claude's vision API. Converts PDF pages to images, sends to Claude vision, extracts part data, attempts image cropping, outputs JSON/CSV.

**Image Cropping Status:** Data extraction works well, but image bounding box detection is inconsistent. Claude's vision API struggles with precise pixel coordinates.

**Archive of extraction attempts:**
- `run_001_initial/` - First run, no image cropping
- `run_002_bad_crops/` - Images cut off
- `run_003_text_only/` - Only captured text labels
- `run_004_too_wide/` - Grabbed neighboring parts
- `run_005_too_tall/` - Expanded too much vertically
- `run_006_json_error/` - JSON parsing issues

**Cost:** ~$0.01-0.02 per page, 500 page catalog ~ $5-10.

---

#### ServicePal Reference (System Being Replaced)

**Key Features Replicated:**
- Dashboard with completed jobs chart, overdue jobs, customer count
- Customer search with detail page (Activities, Service History, Equipment, Photos tabs)
- Job detail with number, type, status, customer, date, assigned tech
- Work Order PDF: Confirmation section, Customer Info, Job Info (parts location, special instructions), Completion section, Quick questions, Technician Notes with photos

**Key Insight:** ServicePal only allows school-level customers (flat structure). Real business is County (billing) -> Schools (service). App now matches QB hierarchy.

---

#### Previous Milestone Status Entries

**February 3, 2026 - Ops Review & Inspection Status Workflow:**
Office staff Ops Review queue where submitted inspections land for review. Status flow: submitted -> under_review -> approved. Clicking job opens bank-by-bank detail view inline. Generate QB Estimate sets approved status and creates work order. Field staff only see approved inspections. Mobile scheduling layout fixed.

**February 2, 2026 - New Inspection Flow - Multi-Bank, Issue-First:**
Complete redesign matching real ServicePal PDFs. Multi-bank job system (one job # = all banks in gym), issue-first interface (floating Add Issue button), Top Side -> Understructure order, photo capture per issue, bank tabs, job summary, unified Office/Field view. Data stored in localStorage as inspectionJobs.

**February 2, 2026 - Office Staff Work Orders:**
Updated to match Field Staff layout with per-section Edit buttons. Sections: Location, Site Contact, What They're Doing, Parts Location, Special Instructions, Scheduling & Assignment, Job Completion. Sidebar preserved with Actions/Timeline/Documents.

**February 2, 2026 - Field Staff Work Orders:**
Simplified mobile view. Today's/upcoming jobs list. Read-only detail (location, directions, contact, description, parts location, special instructions). Required completion photo + notes. Not Completed flow with one-tap reason buttons and smart validation per reason type. Enhanced Wrong Part flow (measurements + photo of correct part required).

**February 2, 2026 - ServicePal Replacement:**
Customer hierarchy (Customer = billing entity, Location = service site), job numbering (17500+), job types (Go See, Service Call, Repair, Inspection), enhanced work orders, accounts view, projects view.

**January 29, 2026 - Inspection Type Templates:**
Three templates: Basketball Goal (per-goal inspections, 11-item checklist), Indoor Bleacher (motor specs, 7+9 item checklists), Outdoor Aluminum Bleacher (seat specs, 4+10 item checklists). All types share customer selection, parts search (Airtable 2,142 Hussey parts), inspector summary, labor hours.

**January 28-29, 2026 - Parts Catalog Integrated:**
Airtable parts catalog connected to inspection form. Real-time search, 15 categories, Hussey confirmed PNG images.

**January 28, 2026 - Hussey Parts Catalog Working:**
Received CSV with full catalog + 4 years pricing. Data cleaning pipeline (clean_hussey_csv.py). Airtable database (Base: appAT4ZwbRAgIyzUW, Table: tbl4mDv20NaJnaaN7). Search frontend (parts-search.html). 15 simplified categories from 200+ originals.

---

*End of Historical Reference*
