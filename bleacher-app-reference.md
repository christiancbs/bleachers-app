# Bleachers & Seats - App Development Reference

**Last Updated:** February 5, 2026
**Version:** v2.1.1
**Active Branch:** `main`

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
- `v2.1.1` - Current: Bug fixes + test data for status tracking

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

**Navigation:**
- **Office/Admin:** Search | Sales (Pipeline, Accounts) | Procurement (Ops Review, Estimates, Parts Orders) | Logistics (Shipping, **Jobs**, Scheduling) | Resources (Parts Catalog) | Settings
- **Field:** Search | Inspections & Service (My Jobs with "+ Create Job", Team Schedule) | Resources (Parts Catalog) | Settings
- Role-based settings: Profile (all), QB Integration (Office+Admin), Manage (Admin only)

**v2.1 Highlights:**
- **Live Status Tracking:** Jobs update in real-time as techs check in, complete, or mark unable to complete
- **Jobs View (Office/Admin):** Operational status board showing all active jobs with progress stats
- **Status Flow:** Scheduled → En Route → Checked In → Complete/Unable to Complete
- **Auto-timestamps:** Check-in and completion times captured automatically
- **Unable to Complete Modal:** Reason selection, notes, photo upload - auto-moves to Shit List
- **Week Progress:** Visual progress tracker showing X/Y jobs completed with percentage
- Status badges and action buttons on My Jobs (Field) and Jobs (Office/Admin) views
- Status column added to Scheduling spreadsheet view

**v2.0 Highlights:**
- Field staff can create jobs from My Jobs view
- Admin/Office default to Pipeline (dashboard view obsolete)
- Settings moved to bottom of sidebar for all roles

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

## Recent Bug Fixes (v2.1.1)

**Fixed:** Syntax error in `js/views/inspection.js` line 976
- Issue: Unescaped double quote in placeholder attribute broke JavaScript loading
- Impact: Prevented `loadOfficeJobs` and other functions from loading
- Fix: Escaped quote as `&quot;` in HTML attribute
- Files affected: All JS files after `inspection.js` in load order

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
| `js/views/scheduling.js` | Scheduling, Jobs view, status tracking data |
| `js/views/my-jobs.js` | Field My Jobs view, status update functions |
| `js/views/` | Other view modules (inspection, dashboard, ops-review, create, admin, office, field) |
| `js/utils/` | Utilities (parts-catalog, search) |

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

**Immediate:**
1. Get Draper CSV and add to Airtable
2. Test with inspector - gather feedback
3. Receive Hussey part images (PNG)

**QuickBooks Integration:**
1. Set `QB_CLIENT_ID` and `QB_CLIENT_SECRET` in Vercel
2. Create sandbox company at developer.intuit.com
3. Test OAuth flow and estimate creation

**Medium-term:**
1. Proxy Airtable calls through Vercel (for live site)
2. Offline capability (cache parts locally)
3. Work order PDF generation

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

**Future Considerations:**
- Consider React/Vue if complexity continues to grow (state management, component reusability)
- Backend API for job data (currently only Airtable for parts)
- Real-time updates (WebSockets/Firebase) for multi-user scenarios
- Mobile-first redesign (current responsive but desktop-optimized)

---

*For detailed data structures, version history, and completed milestones, see `bleacher-app-history.md`*
