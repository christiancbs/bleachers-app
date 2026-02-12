# Bleachers & Seats - Historical Reference

**Purpose:** Archived changelog, version history, and completed milestones. The active development reference is in `bleacher-app-reference.md`.

---

## Version 3.5.0 (February 10, 2026)

**Production Data Import & UI Fixes for 3,007 Jobs**

Replaced 23 seed jobs with the company's full historical dataset. Built and ran a 4-step data import pipeline, then fixed UI to handle the larger dataset.

### Data Import Pipeline (`scripts/data-import/`)

**Step 1 — Cleanup:** Deleted all 523 existing jobs (seed data + prior test imports).

**Step 2 — ServicePal Import:** Imported 569 scraped ServicePal jobs. Parser handles misaligned Kendo grid data by falling back to `rawPageText` parsing. Extracts address, territory, estimate IDs, work order metadata. Output: `job-id-map.json` (jobNumber → API id).

**Step 3 — Photo Upload:** Uploaded 2,236 photos (filtered from 2,962 after removing placeholders and missing files). Base64-encoded and POSTed to `/api/jobs/attachments`. ~156MB total. Zero errors.

**Step 4 — Excel Import (2024-2025 only):** Parsed 4 Excel project trackers (2025 Original, 2025 Southern, 2024 Original, 2024 Southern). 3,220 rows → 2,568 unique after dedup. Three import paths:
- **Path 1 — Estimate matches existing ServicePal job:** UPDATE with `qbEstimateTotal` (545 jobs enriched)
- **Path 2 — Has estimate but no matching job:** CREATE as `EST-{estimateNumber}` (2,021 new jobs)
- **Path 3 — No estimate number:** CREATE as `XL-{year}-{OT|ST}-{seq}` (16 historical records)

**Final database state:** 3,007 total jobs. 2,793 with estimate ID, 2,097 with estimate total. By source: 569 ServicePal, 2,422 EST-*, 16 XL-*.

### Backend Change

- **API max limit raised** from 100 to 500 in `api/jobs/index.js` (line 38) to support larger dataset pagination.

### Frontend Fixes

- **Office tab pagination:** Added "Load More" button with count header ("Showing X of Y jobs") to All, Backlog, Completed, Shit List tabs. 100 jobs per page.
- **Job click-through fixed:** Added missing `onclick="openJobDetail(${job.id})"` to job list items in Office tabs (were unclickable).
- **Schedule duplication fixed:** `formatJobLocation()` was appending `job.title` which for imported EST-* jobs was identical to `job.description`. Now checks `job.title !== job.description` before including.
- **Draft dropdown limit:** Raised from 100 to 500 for schedule planning.
- **Estimates loading indicator:** Added animated loading bar to `loadEstimates()` — **known bug: doesn't display** (needs debugging).

### Import Pipeline Files
```
scripts/data-import/
├── package.json              # xlsx dependency
├── config.js                 # API URL, file paths, rate limits
├── lib/
│   ├── api-client.js         # fetch wrapper with retry + rate limiting
│   ├── progress.js           # JSON-based resume tracking
│   ├── servicepal-parser.js  # Scraped JSON → API payload (with rawPageText fallback)
│   └── excel-parser.js       # xlsx parsing, date/dollar normalization, dedup
├── step-1-cleanup.js         # Delete all existing jobs
├── step-2-servicepal.js      # Import 569 ServicePal jobs
├── step-3-photos.js          # Upload 2,236 photos to Vercel Blob
└── step-4-excel.js           # Import/merge 2024-2025 Excel tracker data
```

**Commits:**
- `e6cd723` (bleachers-api) — Raise API max limit from 100 to 500
- `d78e51b` (bleachers-app) — Add pagination to office job tabs for 3,007+ imported jobs
- `f1551be` (bleachers-app) — Fix 3 UI issues: job click-through, schedule duplication, estimates loading

**Known Issue:** Estimates loading bar doesn't display — the `loadingHtml` injection condition (`!el.innerHTML.trim()`) may be preventing it from showing when containers already have content.

---

## Version 3.4.0 (February 9, 2026)

**Codebase Audit & Health Fixes**

**Fixes:**
- **Removed ghost `config.js` script tag** - Referenced in index.html but file never existed; no code depended on it (API bases are hardcoded in API client files)
- **Fixed 8 duplicate element IDs** - Create Work Order modal reused `wo*` IDs that conflicted with the WO detail view. Renamed modal IDs to `createWo*` prefix (`createWoJobNumber`, `createWoDescription`, etc.)
- **Fixed duplicate `laborHours` ID** - Inspection form and Add Labor modal both used `id="laborHours"`. Renamed estimate builder modal's to `addLaborHours`
- **Removed dead `partsOrders`/`shipping` view code** - `showView()` had branches for views that don't exist in the HTML. Removed from app.js

**Files Modified:**
- `index.html` - Removed config.js script tag, renamed 8 duplicate IDs in Create WO modal, renamed laborHours in Add Labor modal
- `js/views/ops-review.js` - Updated all getElementById calls to use `createWo*` prefix
- `js/views/estimate-builder.js` - Updated laborHours references to `addLaborHours`
- `js/app.js` - Removed dead partsOrders/shipping view branches

---

## Version 3.3.0 (February 9, 2026)

**Ops Director Feedback — 8 UI Improvements**

Reviewed app with Ops Director (Story). Implemented 8 feedback items:

**Features:**
1. **Field Staff: Hide Prices** - Removed dollar amounts from tech parts catalog search results. Office/estimate builder contexts still show pricing.
2. **Customer Types System** - Added 7 customer types (County Schools, Collegiate, Private School, Contractor, Government, Worship, Other) with icons and badge colors. Type filter dropdown in Accounts view.
3. **Pipeline Territory Tabs** - Sub-tabs for All, Original (KY/TN), Southern (AL/FL), and New Installs in Sales Pipeline view.
4. **Employee Resources** - New nav section with link to Employee Resource Guide PDF. Accessible to both office and field staff roles.
5. **Remove Create WO from Ops Review** - Work orders should only be created after sales sells the work. Ops review flow is now: Inspect → Approve → Build Estimate only.
6. **Local Inventory Priority Path** - Placeholder `LOCAL_INVENTORY` array in data.js. When populated, matching parts will surface first in estimate builder with "In Stock" badge.
7. **Rename "This Week" to "Team Schedule"** - Schedule tab label updated.
8. **Move "This Week" to Scheduling** - Card-based office jobs grid moved from Jobs tabs to Scheduling as "This Week" tab. Jobs view now: All, Backlog, Completed, Shit List.

**Files Modified:**
- `index.html` - Scheduling tab restructure, Jobs tab cleanup, Employee Resources views, Accounts type filter, Pipeline territory tabs, Ops Review sub-filter cleanup
- `js/utils/parts-catalog.js` - Hide prices in `searchTechParts()`
- `js/data.js` - Added `CUSTOMER_TYPES` constant, `LOCAL_INVENTORY` placeholder
- `js/views/dashboard.js` - Customer type system in Accounts, pipeline territory filtering
- `js/views/ops-review.js` - Removed Create WO button from approval flow
- `js/views/estimate-builder.js` - Local inventory priority in parts search
- `js/views/scheduling.js` - Added officeThisWeek tab, removed thisWeek from Jobs
- `js/app.js` - Added resources view routing, customer types in populateCustomers

**Commit:** `cf3f584`

---

## Version 3.2.2 (February 8, 2026)

**Persistent DB-Backed Scheduling (HI-1)**

Migrated scheduling from in-memory sample data to API-backed persistent storage.

**Features:**
- **API-Backed Schedule Grid** - Team Schedule (table view) now fetches from Jobs API filtered by territory + date range
- **API-Backed Planning** - Planning tab fetches next week's data from API
- **Add to Planning Flow** - Jobs > Backlog "Add to Planning" button navigates to Scheduling > Planning with job pre-selected
- **Place on Day** - Click a day in Planning to schedule a draft job (updates status to `scheduled` via API)
- **Territory + Week Navigation** - Both schedule views support territory switching and week prev/next with API re-fetch
- **Stock Parts Verification** - Pre-schedule check warns about unverified stock parts before placing jobs
- **Procurement Notes** - Shows procurement notes from estimates when scheduling
- **Parts Tracking** - Job detail modal includes parts tracking fields (PO #, promise date, destination, received status)
- **Office This Week View** - Card-based progress tracker with stats (completed, in-progress, en-route)
- **Seed Data** - 23 realistic jobs seeded via API for demo (both territories, multiple statuses)

**Files Modified:**
- `js/views/scheduling.js` - Complete rewrite: API data loading, schedule grid rendering, planning view, office jobs grid, QB sync modal
- `js/utils/jobs-api.js` - Already existed, used for API calls
- `index.html` - officeThisWeek view HTML, scheduling tab structure
- `scripts/seed-jobs.js` - One-time seed script (not committed)

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
63. Data Import: 4-step pipeline importing 569 ServicePal jobs, 2,236 photos, 2,568 Excel rows into production API
64. Data Import: ServicePal parser with rawPageText fallback for misaligned Kendo grid scrapes
65. Data Import: Excel parser linking QuickBooks estimates to ServicePal jobs via estimate number
66. Data Import: Resume support with JSON progress files and completed Set for O(1) skip-check
67. Backend: API max limit raised from 100 to 500 for large dataset pagination
68. UI: Office tab pagination with Load More (100/page) and count headers
69. UI: Job click-through fixed in Office tabs (missing onclick handler)
70. UI: Schedule duplication fixed (title === description for imported jobs)
71. Estimate Builder — create estimates with parts, labor, custom items → push to QB (v3.6.0)
72. Streamlined Create Job form with typeahead customer search (v3.6.0)
73. Ops Review workflow with 3-button actions (v3.6.0)
74. Procurement Intelligence — auto-notes, stock tracking, pre-schedule verification (v3.7.0)
75. Ops Foundation — territory DB column + API filtering, confirmation tracking, pink categories (v3.8.0)
76. PII removal from public repo, data loads from API/localStorage (v3.8.1)
77. Immediate WO Flow: Jobs database, Estimates view, Jobs view, Create WO, Tabs, Parts Tracking, Planning (items 1-7 complete)
78. Immediate WO Flow: Estimate Builder + Streamlined Create Job + Procurement Intelligence (items 8-10 complete)
79. Clerk Auth: Real authentication with JWT Bearer tokens on all API calls (v4.0.0)
80. ServicePal Migration: Production import — 3,007 jobs, 2,236 photos (Feb 10, 2026)
81. Security Audit: Removed legacy X-User-Role bypass, secured OAuth endpoints, QB query validation (v4.0.1)
82. Security Audit: PII cleanup (names, phones removed from index.html), dead code removal, API key scrubbed (v4.0.1)

---

## Version 4.0.0 (February 10, 2026)

**Clerk Authentication**

Real authentication replaces demo login. Clerk hosted sign-in form (email + password). JWT Bearer tokens on all API calls via `getAuthToken()`. Session persistence via Clerk cookies. Role from `publicMetadata.role` (admin/office/technician). Backend 3-tier auth: Bearer JWT → API Key → Legacy X-User-Role (legacy removed in v4.0.1). User display shows real name and initials from Clerk profile. All 15 route files protected with `requireAuth()`.

## Version 3.8.x (February 9-10, 2026)

**v3.8.0 — Ops Foundation:**
- Territory column on jobs table, auto-detected from job_number prefix (TN/KY → Original, AL/FL → Southern). 388 Original + 106 Southern backfilled.
- Territory + date range API filtering for scheduling queries
- Confirmation tracking (confirmedWith, confirmationMethod, confirmedBy, confirmedDate)
- Expanded Pink/Shit List to 9 reason categories
- ServicePal scraper fixes (column alignment, KY/GA/MS state detection)

**v3.8.1 — Security:**
- PII removal from public repo (customer contacts, employee data, sample work orders)
- All data loads from API or localStorage — nothing sensitive in repo
- Security plan created for Clerk auth implementation

## Version 3.7.0 (February 9, 2026)

**Procurement Intelligence:**
- Auto-detection engine scans line items and suggests procurement notes
- Procurement Notes UI with add/dismiss on suggestions, dropdown of 9 common notes, custom entry
- Stock part marking (click "stock?" → pick shop TN/FL/AL → blue badge)
- QB PrivateNote integration with structured memo format
- Estimate → Work Order bridge (procurement notes + stock parts auto-transferred)
- Pre-schedule verification gate for unverified stock parts
- Stock warning banner in jobs list, procurement notes in job detail

## Version 3.6.0 (February 8, 2026)

**Estimate Builder & Ops Review:**
- Estimate Builder with parts, labor, and custom line items → push to QB
- Streamlined Create Job with typeahead customer search and job types
- Ops Review workflow with 3-button approach (Approve | Create Work Order | Build Estimate)

---

### ServicePal Migration (Completed February 10, 2026)

**Production Import Results:**
- **3,007 jobs** imported to Postgres
- **2,236 photos** uploaded to Vercel Blob

**Scraper Stats (final, Feb 9, 2026):**
- 302 jobs scraped (of ~16,854 total)
- 478 work orders extracted
- 1,279 photos downloaded
- 58MB output

**Form Types Detected:**
| Type | Count | Description |
|------|-------|-------------|
| Work Order | 224 | Standard job completion form |
| Go See: Bleacher Parts Spec | 32 | Inspection/spec forms |
| Bleacher Inspection Form | 57 | Indoor bleacher inspections |

**Territory Distribution:**
| Territory | Jobs |
|-----------|------|
| TN | 70 (64%) |
| AL | 33 (30%) |
| FL | 6 (5%) |

**Data Sources Consolidated:**
1. ServicePal — All historical jobs, work orders, photos, technician notes
2. QuickBooks — Estimates, customers, invoices (API connected)
3. Salesmate — Contact data (separate export)

**Key Patterns Discovered:**
- Teams organized by territory (TNBSTeam, ALBSTeam, etc.)
- Parts staged at regional shops ("TN Shop", "FL Shop")
- Vehicle/toolbox checklists done daily
- Jobs reference estimate numbers (e.g., "TN522009") — linkable to QB
- Common repairs: drive wheel cleaning, motor tensioning, guide rods, deck boards

**Features That Emerged From Data (some already built):**
- Territory View for scheduling *(built in v3.5.0)*
- Site Equipment Profile *(built in v3.5.0)*
- Fleet/Vehicle Management *(future)*
- Shop Inventory tracking *(future)*
- Tech Hours Dashboard *(future)*

---

### Security Implementation Plan (Completed v4.0.0)

*Archived from `security-plan-reference.md`. Phases 1-4 and 6 complete. Phase 5 (remove legacy X-User-Role) completed in v4.0.1 audit.*

**Original vulnerabilities addressed:**
- No real authentication → Clerk sign-in with JWT
- API completely open → requireAuth() on all 15+ route files
- Spoofable X-User-Role header → removed in v4.0.1
- Real PII in public repo → stripped in v3.8.1
- Parts database publicly queryable → auth required

**Architecture:**
```
Browser → Clerk sign-in → JWT → API verifies with @clerk/backend → extracts role
Scripts → X-API-Key header → API verifies against env var → grants admin
```

**Phases executed:**
1. Clerk Setup — application created, user accounts configured with publicMetadata.role
2. Backend Auth — @clerk/backend installed, requireAuth() on all routes, CORS updated
3. Frontend Auth — Clerk JS SDK, auth.js module, API clients send Bearer tokens
4. PII Removal — CUSTOMERS/EMPLOYEES arrays emptied, data loads from API
5. Legacy Removal — X-User-Role fallback deleted from auth.js (v4.0.1)
6. Script Access — data-import scripts use X-API-Key header

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
