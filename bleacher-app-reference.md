# Bleachers & Seats - App Development Reference

**Last Updated:** February 6, 2026
**Version:** v2.1.3 (stable) | v3.0.0 (in development)
**Active Branch:** `v3-feedback-implementation`

---

## Quick Start

**Local Development:**
```bash
cd ~/bleachers-app
python3 -m http.server 8080
# Open http://localhost:8080 in browser
```

**Test Logins:**
- **Field Staff:** Click "tech@bleachers.com" → Test status tracking in "My Jobs"
- **Office:** Click "office@bleachers.com" → View "Jobs" for operational status board
- **Admin:** Click "admin@bleachers.com" → Full access to all features

**Test the Status Tracking (v2.1):**
1. Login as **Field** → Go to **My Jobs**
2. See 6 sample jobs for week of Feb 3-7, 2025
3. Click "Check In" on a scheduled job → Status updates + timestamp
4. Click "Mark Complete" on checked-in job → Status updates + fades out
5. Click "Unable to Complete" → Fill modal → Auto-moves to Shit List
6. Switch to **Office** login → Go to **Jobs** → See same data with progress stats

**Test v3.0 Features (Branch: `v3-feedback-implementation`):**
1. Login as **Office/Admin** → Default view is now **Sales Pipeline** (not Project Tracker)
2. See Sales Pipeline with 6 stages, A/B/C deal grading circles, deal values
3. Go to **Project Tracker** (in Logistics section) → See post-sale jobs with dates, sorting, labor amounts
4. Go to **Scheduling** → See "Confirmed" column with ✓✓/✓/— icons, 🚜 EQUIPMENT badges
5. Go to **Jobs** → Find Fairview ES (Monday 2/3) → See green 🔒 Internal Notes section
6. Login as **Field** → Go to **My Jobs** → See Ripley HS with amber Special Instructions box at top
7. See Brentwood HS with 🚜 Equipment Rental Required badge

---

## Quick Reference

| Resource | URL |
|----------|-----|
| **App Live** | christiancbs.github.io/bleachers-app/ |
| **App Repo** | github.com/christiancbs/bleachers-app |
| **API Live** | bleachers-api.vercel.app/ |
| **API Repo** | github.com/christiancbs/bleachers-api |

**Dev Workflow:** Edit files → test with `python3 -m http.server 8080` → push to GitHub

**Version Tags:**
- `v1.0` - Original navigation (archived)
- `v2.0` - Navigation refactor + field create
- `v2.1` - Live status tracking + Jobs view
- `v2.1.1` - Bug fixes + test data for status tracking
- `v2.1.2` - Code organization improvements
- `v2.1.3` - **Stable on `main`:** Bug fix for logout error (adminNavSection null check)
- `v3.0.0` - **In Development on `v3-feedback-implementation`:** Sales/Operations separation + Story/Atiba feedback implementation

---

## What's Built (v2.1)

**Core Features:**
- Multi-bank inspection flow (Basketball, Indoor/Outdoor Bleacher templates)
- Digital parts catalog (2,142 Hussey parts via Airtable)
- Pipeline view with 8 status stages and territory filter
- **Live status tracking** (scheduled → en route → checked in → complete/unable to complete)
- **Jobs view** (operational real-time status board for Office/Admin)
- Scheduling (spreadsheet view with status column, Mon-Thu + Friday, Original/Southern territories)
- Ops Review workflow (submitted → under_review → approved)
- CRM with customer hierarchy (District → Locations) and multi-contact support
- Unified job numbering (Job # = Estimate # = Work Order # = QB #)
- Week progress tracking (X/Y jobs completed with percentage)

**Navigation (v2.1.3):**
- **Office/Admin:** Search | Sales (Pipeline, Accounts) | Procurement (Ops Review, Estimates, Parts Orders) | Logistics (Shipping, **Jobs**, Scheduling) | Resources (Parts Catalog) | Settings
- **Field:** Search | Inspections & Service (My Jobs with "+ Create Job", Team Schedule) | Resources (Parts Catalog) | Settings
- Role-based settings: Profile (all), QB Integration (Office+Admin), Manage (Admin only)

**Navigation (v3.0 - In Development):**
- **Office/Admin:** Search | Sales (**Sales Pipeline**, Accounts) | Procurement (Ops Review, Estimates, Parts Orders) | Logistics (Shipping, **Jobs**, Scheduling, **Project Tracker**) | Resources (Parts Catalog) | Settings
- **Field:** Unchanged
- Key change: "Pipeline" split into "Sales Pipeline" (pre-sale) and "Project Tracker" (post-sale operations)

**v2.1 Highlights:**
- **Live Status Tracking:** Jobs update in real-time as techs check in, complete, or mark unable to complete
- **Jobs View (Office/Admin):** Operational status board showing all active jobs with progress stats
- **Status Flow:** Scheduled → En Route → Checked In → Complete/Unable to Complete
- **Auto-timestamps:** Check-in and completion times captured automatically
- **Unable to Complete Modal:** Reason selection, notes, photo upload - auto-moves to Shit List
- **Week Progress:** Visual progress tracker showing X/Y jobs completed with percentage
- Status badges and action buttons on My Jobs (Field) and Jobs (Office/Admin) views
- Status column added to Scheduling spreadsheet view

**v3.0 Highlights (In Development - 16/17 Complete):**
- **Sales Pipeline:** Pre-sale view with A/B/C deal grading, 6 Salesmate stages, deal values
- **Project Tracker:** Post-sale operations view with date tracking (received, started, target, completed), oldest→newest sorting, labor amounts
- **Special Instructions:** Prominent amber warning box at top of work orders for critical job info
- **Confirmed Status:** Visual confirmation tracking (✓✓/✓/—) in schedule views
- **Equipment Rental Tags:** 🚜 badges identify jobs requiring lifts/equipment
- **Estimate Line Items:** Shipping and Labor as separate, visible line items
- **Internal Notes:** Office-only notes section with 🔒 icon, not visible to customers/field

**v2.0 Highlights:**
- Field staff can create jobs from My Jobs view
- Admin/Office default to Pipeline (dashboard view obsolete)
- Settings moved to bottom of sidebar for all roles

**v2.1.2 Code Organization:**
- Added section comments to all large JS view files for easier navigation
- **scheduling.js** (55KB): 8 sections (data, sample data, backlog, shit list, utilities, schedule views, planning, office jobs)
- **inspection.js** (43KB): 7 sections (init, job creation, bank management, bank data, issue management, job summary, view helpers)
- **dashboard.js** (47KB): 6 sections (dashboard, estimates, pipeline, accounts/CRM, customer CRUD, location CRUD)
- **my-jobs.js** (18KB): 3 sections (my jobs view, team schedule, job status management)
- **admin.js** (29KB): 3 sections (employee management, settings, parts catalog management)
- Improves code maintainability without changing functionality

---

## Live Status Tracking System

**Status Flow:**
1. **Scheduled** (default - gray) - Job is assigned to schedule
2. **En Route** (blue) - Tech is traveling to job site
3. **Checked In** (blue) - Tech arrives on-site, timestamp auto-captured
4. **Complete** (green) - Job successfully finished, timestamp auto-captured
5. **Unable to Complete** (red) - Job couldn't be completed, auto-moves to Shit List

**Field Tech Actions (My Jobs):**
- "Check In" button when Scheduled/En Route
- "Mark Complete" + "Unable to Complete" buttons when Checked In
- Unable to Complete opens modal requiring:
  - Reason (Wrong Part, Can't Access, Additional Work, Equipment Issue, Other)
  - Notes (optional)
  - Photo (optional)
  - Auto-moves job to Shit List and marks as pink

**Office/Admin Views:**
- **Jobs view:** Real-time status board with progress stats (X/Y completed, In Progress, En Route)
- **Scheduling view:** Status column in spreadsheet with color-coded badges
- Can see all status updates as field techs make changes
- Completed jobs fade to 70% opacity for visual distinction

**Data Persistence:**
- All status updates save to localStorage
- Timestamps stored in ISO format
- Updates sync across all views (My Jobs, Jobs, Scheduling, Team Schedule)

**Technical Implementation:**
- Status data stored in `scheduleDataOriginal` and `scheduleDataSouthern` objects (js/views/scheduling.js)
- Each job has optional properties: `status`, `checkedInAt`, `completedAt`, `unableToCompleteAt`, `unableToCompleteReason`, `unableToCompleteNotes`, `unableToCompletePhoto`
- Status update functions in js/views/my-jobs.js:
  - `checkInJob(jobId)` - Sets status to 'checked_in' + timestamp
  - `completeJob(jobId)` - Sets status to 'complete' + timestamp
  - `unableToCompleteJob(jobId)` - Opens modal, then calls `submitUnableToComplete()`
  - `updateJobStatus(jobId, newStatus, additionalFields)` - Updates across both territories
  - `moveJobToShitList(jobId, reason, notes)` - Creates shit list entry + marks as pink
- Real-time sync: Status changes trigger re-renders in all active views
- Week progress calculated by filtering jobs for current tech and counting completed vs total

---

## Testing the Status Tracking System

**Sample Data Week:** February 3-7, 2025 (automatically set in code)

**Test User:** Login as **Field** (tech@bleachers.com)

**Sample Jobs for "Field Tech":**

**Monday, Feb 3:**
- Ripley High School - **Complete** (11:15 AM) ✅
- Wilson Central High School - **Scheduled** (ready to check in)

**Tuesday, Feb 4:**
- Franklin High School - **Checked In** (8:30 AM) - ready to mark complete
- Brentwood High School - **En Route** - ready to check in

**Wednesday, Feb 5:**
- Ripley Middle School - **Scheduled**
- Independence High School - **Scheduled**

**Testing Flow:**
1. Login as **Field** → Navigate to **My Jobs**
2. See week progress at top (e.g., "2/6 Jobs Completed This Week (33%)")
3. Click action buttons to test status flow:
   - **"Check In"** → Updates status + captures timestamp
   - **"Mark Complete"** → Updates status + captures timestamp + fades job
   - **"Unable to Complete"** → Opens modal → Select reason → Moves to Shit List
4. Switch to **Office** login → Navigate to **Jobs**
5. See same jobs with status badges and progress stats
6. View status column in **Scheduling → This Week**

**Progress Stats (Office/Admin Jobs View):**
- Total jobs completed / total jobs with percentage
- Count of jobs "In Progress" (checked in)
- Count of jobs "En Route"

---

## Recent Bug Fixes

**v2.1.3 (Feb 6, 2026):**
- **Fixed:** `logout()` function crashing due to null reference
- Issue: Attempted to access `adminNavSection` element that doesn't exist in HTML
- Impact: Prevented Jobs view from loading (error blocked subsequent JavaScript execution)
- Fix: Added null check before accessing element classList
- Location: [app.js:166](js/app.js#L166)

**v2.1.1:**
- **Fixed:** Syntax error in `js/views/inspection.js` line 976
- Issue: Unescaped double quote in placeholder attribute broke JavaScript loading
- Impact: Prevented `loadOfficeJobs` and other functions from loading
- Fix: Escaped quote as `&quot;` in HTML attribute
- Files affected: All JS files after `inspection.js` in load order

---

## v3.0 Development Plan (In Progress)

**Branch:** `v3-feedback-implementation`
**Timeline:** 3-4 weeks (Feb 6 - Mar 7, 2026)
**Status:** Phase 1 & 2 Complete (16/17 items) - Ready for Phase 3 Testing
**Goal:** Address team feedback from Story (Director of Operations) and Atiba prototype review

### Key Changes: Sales vs Operations Separation

**Problem Identified:**
Current "Pipeline" view mixes pre-sale (estimates, follow-ups) with post-sale (operational execution). This creates confusion between sales tracking and project management.

**Solution:**
Split into two distinct views:
1. **Sales Pipeline** - Pre-sale: estimates, client follow-ups, deal grading (A/B/C)
2. **Project Tracker** - Post-sale: operational execution, scheduling, completion tracking

### Implementation Phases

#### **PHASE 1: Pipeline Restructure (Week 1)**

**Rename & Relocate Current Pipeline:**
1. ✅ Rename "Pipeline" view → "Project Tracker"
2. ✅ Move from Sales nav section → Logistics nav section
3. ✅ Add date fields (date received, date started, target date, completed date)
4. ✅ Add sort by oldest→newest
5. ✅ Add Labor Amount and Total Project Value to project cards

**Create New Sales Pipeline:**
6. ✅ New "Sales Pipeline" view in Sales section
7. ✅ Sales-specific stages (matching Salesmate workflow):
   - Estimate in Process
   - Operations Review
   - Estimate Complete (Ready to be Sent)
   - Client Review/Follow Up
   - In Process/PO Received
   - Complete
8. ✅ Add A/B/C deal grading system (replaces probability %)
9. ✅ Add estimate delivery status indicators
10. ✅ Add follow-up tracking features

#### **PHASE 2: Quick Win Features (Week 2-3)**

**Work Orders & Scheduling:**
11. ✅ Add "Special Instructions" field to work orders (prominent at top)
12. ✅ Add "Confirmed/Unconfirmed" checkbox to schedule entries
13. ✅ Add "Equipment Rental Required" tag to schedule

**Estimates Enhancement:**
14. ✅ Add Shipping line item to estimate form
15. ✅ Add Labor line item to estimate form

**Internal Tools:**
16. ✅ Add Internal Notes field (not visible to customers)

**Note:** Pink List/Go Backs tab already exists in Scheduling → Shit List (not duplicating)

**Phase 2 Implementation Details (Completed Feb 6, 2026):**
- **Special Instructions:** Amber warning box with ⚠️ icon, displays prominently at top of work order cards in My Jobs view
- **Confirmed Status:** Added "Confirmed" column to schedule tables with visual indicators (✓✓ green = confirmed, ✓ orange = attempted, — gray = not confirmed)
- **Equipment Rental:** 🚜 EQUIPMENT badge displays next to job names when equipment rental required, checkbox in schedule entry form
- **Shipping Line Item:** Separate line in estimate breakdown between Parts and Labor, included in grand total
- **Labor Line Item:** Already calculated, now explicitly shown as separate line (not buried in total)
- **Internal Notes:** Green-bordered section with 🔒 icon, visible only in Office Jobs view, not shown to customers or field techs

**Commits:**
- `71e5a8a` - Special Instructions field
- `f07d376` - Confirmed/Unconfirmed status column
- `a33eb4b` - Equipment rental tag
- `73c343e` - Shipping and Labor line items
- `89106f6` - Internal Notes field

#### **PHASE 3: Testing & Polish (Week 4)**
17. Field beta testing with 2-3 techs
18. QuickBooks integration testing
19. Bug fixes and refinements

### Total Features: 17 items
- Pipeline restructure: 10 items
- Quick wins: 6 items
- Testing phase: 1 item

### Estimated Effort: ~20 hours development time

---

## Atiba Comparison & Decision

**Date:** February 6, 2026
**Status:** Decided to continue DIY approach instead of waiting for Atiba

**Atiba's Issues (from Story's feedback):**
- ❌ Tech view only showed "today's jobs" (not weekly schedule)
- ❌ "Extremely limited" inspection module
- ❌ Office Manager couldn't see work orders
- ❌ Manual time tracking required
- ❌ Dashboard guessing at metrics with unnecessary clutter

**Our Strengths:**
- ✅ Tech weekly schedule (Mon-Fri grid for all roles)
- ✅ Multi-bank inspection with issue tracking
- ✅ Jobs operational view for Office/Admin
- ✅ Automated timestamp capture
- ✅ Clean, purposeful interface

**Comparison Score:** 72% of team requirements already built or partially built
- 18 items fully built (38%)
- 16 items partially built (34%)
- 13 items not yet built (28%)

**Decision:** Continue DIY. We're further along than Atiba after their months of design work.

See `atiba-feedback-comparison.md` for detailed breakdown.

---

## Troubleshooting

**Buttons/Navigation Not Working:**
1. Open browser console (F12 or Cmd+Option+I)
2. Look for red errors - syntax errors will prevent subsequent JS files from loading
3. Check script load order in index.html (config → data → views → utils → app)
4. Hard refresh (Cmd+Shift+R or Ctrl+Shift+F5) to clear cache

**Functions Showing as "undefined":**
1. Check if earlier JS file has syntax error (will block subsequent files)
2. Verify function is defined in the correct file (use grep: `grep -n "function functionName" js/**/*.js`)
3. Check if file is loaded in index.html before it's called

**Status Updates Not Persisting:**
1. Check localStorage in browser DevTools → Application → Local Storage
2. Look for keys: `scheduleDataOriginal`, `scheduleDataSouthern`
3. Clear localStorage if corrupted: `localStorage.clear()` in console

**Week Navigation Not Working:**
1. Verify week offset calculation in relevant view file (my-jobs.js, scheduling.js)
2. Check `getWeekStart()` function in scheduling.js
3. Sample data is hardcoded for Feb 3-7, 2025 - offset auto-calculated from current date

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Plain HTML/CSS/JS |
| Backend API | Vercel (Node.js ESM) |
| Parts Data | Airtable |
| Token Storage | Upstash Redis |
| QB Integration | QuickBooks Online API (OAuth 2.0) |
| Hosting | GitHub Pages + Vercel |

---

## File Structure

### App (`~/bleachers-app/`)

| File | Purpose |
|------|---------|
| `index.html` | HTML skeleton, all view containers, Unable to Complete modal |
| `css/app.css` | All styles |
| `js/config.js` | API keys (gitignored) |
| `js/data.js` | Constants, sample data |
| `js/app.js` | Core: init, login, routing, nav |
| `js/views/scheduling.js` | Scheduling, Jobs view, status tracking data (55KB, 8 sections) |
| `js/views/my-jobs.js` | Field My Jobs view, status update functions (18KB, 3 sections) |
| `js/views/inspection.js` | Multi-bank inspection flow (43KB, 7 sections) |
| `js/views/dashboard.js` | Pipeline, estimates, accounts/CRM (47KB, 6 sections) |
| `js/views/admin.js` | Employee, settings, parts management (29KB, 3 sections) |
| `js/views/` | Other view modules (ops-review, create, office, field) |
| `js/utils/` | Utilities (parts-catalog, search) |

**Note:** Large view files now include section comments (e.g., `// ==========================================`) for easier navigation. See v2.1.2 for details.

### API (`~/bleachers-api/`)

| File | Purpose |
|------|---------|
| `api/auth/` | OAuth flow (connect, callback, status) |
| `api/qb/` | QB endpoints (customers, estimates) |
| `api/_lib/qb.js` | Token management |

---

## Airtable Config

| Setting | Value |
|---------|-------|
| Base ID | `appAT4ZwbRAgIyzUW` |
| Table ID | `tbl4mDv20NaJnaaN7` |
| API Token | In `js/config.js` |

---

## Next Steps

**Immediate (v3 Development - Feb 6-28):**
1. ✅ **Week 1 (Feb 6):** Phase 1 - Pipeline restructure complete (10 features)
2. ✅ **Week 1 (Feb 6):** Phase 2 - Quick wins complete (6 features)
3. **Week 2-3:** Phase 3 - Field beta testing with 2-3 techs on real jobs
4. **Week 3-4:** QB integration testing + bug fixes
5. **Week 4:** Merge `v3-feedback-implementation` → `main`, release v3.0.0

**Post-v3 (March 2026):**
1. Get Draper CSV and add to Airtable
2. Receive Hussey part images (PNG)
3. Signature capture for work orders
4. Archived jobs tab (for 1000+ completed jobs)
5. PO view pulling from estimates
6. Notification/email system

**QuickBooks Integration (Built, needs testing):**
1. Set `QB_CLIENT_ID` and `QB_CLIENT_SECRET` in Vercel (1 hour)
2. Create sandbox company at developer.intuit.com (30 min)
3. Test OAuth flow and estimate creation (2-3 hours)
4. Note: QB API backend already exists at bleachers-api.vercel.app

**Medium-term:**
1. Proxy Airtable calls through Vercel (for live site)
2. Enhanced offline capability (cache parts locally with service worker)
3. Work order PDF generation
4. Form editing after submission
5. Audit history tracking

---

## Critical Principles

- **"If it didn't happen in QuickBooks, it didn't happen at all"**
- **Inspector after-hours work is the #1 pain point**
- **Schools have poor WiFi** - offline mode critical
- **Multi-vendor jobs are common** - search all vendors
- **DIY approach is working** - keep building

---

## Complexity Notes

**Current Scope:** The app has grown significantly with multiple interconnected systems:
- **3 role-based dashboards** (Admin, Office, Field) with different navigation
- **8 major view modules** across 9 JS files (inspection, scheduling, my-jobs, dashboard, ops-review, create, admin, office, field)
- **Real-time state management** across multiple views (jobs data syncs across My Jobs, Jobs, Scheduling, Team Schedule)
- **Multi-territory support** (Original/Southern) with separate data stores
- **Status tracking system** with 5 states, action buttons, modal workflows, and automatic shit list creation
- **Week-based scheduling** with dynamic date calculations and progress tracking

**Architectural Decisions:**
- Plain HTML/CSS/JS (no framework) - keeps it simple but requires manual state sync
- localStorage for persistence - works offline but limited to ~5-10MB
- Sample data hardcoded in scheduling.js - good for demo, will need backend for production
- Modular JS files - good separation but requires careful load order (see bug fix v2.1.1)
- Section comments in large files - improves navigation as files grow (v2.1.2)

**Future Considerations:**
- Consider React/Vue if complexity continues to grow (state management, component reusability)
- Backend API for job data (currently only Airtable for parts)
- Real-time updates (WebSockets/Firebase) for multi-user scenarios
- Mobile-first redesign (current responsive but desktop-optimized)

---

*For detailed data structures, version history, and completed milestones, see `bleacher-app-history.md`*
