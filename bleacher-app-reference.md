# Bleachers & Seats - App Development Reference

**Last Updated:** February 6, 2026
**Version:** v3.1.0
**Branch:** `main`

---

## Quick Start

**Local Development:**
```bash
cd ~/bleachers-app
python3 -m http.server 8080
# Open http://localhost:8080 in browser
```

**Test Logins:**
- **Field Staff:** Click "tech@bleachers.com" - Test status tracking in "My Jobs"
- **Office:** Click "office@bleachers.com" - View "Jobs" for operational status board
- **Admin:** Click "admin@bleachers.com" - Full access to all features

**Test v3.1 Features:**
1. Login as **Office/Admin** - Default view is **Home** with bulletins + notifications
2. See **Company Announcements** (bulletins) and **Needs Attention** panel
3. Click notification to mark as read (blue dot disappears)
4. Go to **Settings** → **Manage** → **Bulletins** tab to add/edit announcements
5. Login as **Field** - See **Home** with bulletins + **Today's Jobs** panel
6. All roles see same company bulletins, role-specific notifications

---

## Quick Reference

| Resource | URL |
|----------|-----|
| **App Live** | christiancbs.github.io/bleachers-app/ |
| **App Repo** | github.com/christiancbs/bleachers-app |
| **API Live** | bleachers-api.vercel.app/ |
| **API Repo** | github.com/christiancbs/bleachers-api |

**Version Tags:**
- `v1.0` - Original navigation (archived)
- `v2.0` - Navigation refactor + field create
- `v2.1.3` - Live status tracking + Jobs view (final v2)
- `v3.0.0` - Sales/Operations separation, feedback features
- `v3.1.0` - **Current:** Home page with bulletins & notifications

---

## What's Built (v3.1)

**Core Features:**
- **Home Page** - Role-specific landing with bulletins, notifications, and action items
- Multi-bank inspection flow (Basketball, Indoor/Outdoor Bleacher templates)
- Digital parts catalog (2,142 Hussey parts via Airtable)
- **Sales Pipeline** - Pre-sale tracking with A/B/C deal grading, 6 Salesmate stages
- **Project Tracker** - Post-sale operations with date tracking, labor amounts
- **Live status tracking** (scheduled → en route → checked in → complete/unable)
- **Jobs view** - Operational real-time status board for Office/Admin
- Scheduling (spreadsheet view with Confirmed column, Equipment badges)
- Ops Review workflow (submitted → under_review → approved)
- CRM with customer hierarchy (District → Locations) and multi-contact support
- Unified job numbering (Job # = Estimate # = Work Order # = QB #)

**Navigation:**
- **Office/Admin:** Home | Search | Sales (Sales Pipeline, Accounts) | Procurement (Ops Review, Estimates, Parts Orders) | Logistics (Shipping, Jobs, Scheduling, Project Tracker) | Resources (Parts Catalog) | Settings
- **Field:** Home | Search | Inspections & Service (My Jobs, Team Schedule) | Resources (Parts Catalog) | Settings

**v3.1 Features (Home Page):**
- **Company Bulletins** - Admin-managed announcements (info, alert, holiday, safety, HR types)
- **Notifications Panel** - Role-specific updates with mark-as-read functionality
- **Needs Attention Panel** - Pink jobs, pending reviews, scheduled jobs, parts on order
- **Today's Jobs Panel** - Field view of daily schedule
- **Bulletin Management** - Admin Settings → Manage → Bulletins tab

**v3.0 Features:**
- **Sales Pipeline:** Pre-sale view with A/B/C deal grading, 6 stages, deal values
- **Project Tracker:** Post-sale operations with date fields, oldest→newest sorting
- **Special Instructions:** Amber warning box at top of work orders
- **Confirmed Status:** Visual tracking in schedule (checkmarks)
- **Equipment Rental Tags:** Badges identify jobs requiring lifts
- **Estimate Line Items:** Shipping and Labor as separate lines
- **Internal Notes:** Office-only notes (not visible to field/customers)

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

| File | Purpose |
|------|---------|
| `index.html` | HTML skeleton, all view containers |
| `css/app.css` | All styles |
| `js/config.js` | API keys (gitignored) |
| `js/data.js` | Constants, sample data |
| `js/app.js` | Core: init, login, routing, nav |
| `js/views/scheduling.js` | Scheduling, Jobs view, status tracking data |
| `js/views/my-jobs.js` | Field My Jobs view, status update functions |
| `js/views/inspection.js` | Multi-bank inspection flow |
| `js/views/dashboard.js` | Home page, Sales Pipeline, Project Tracker, estimates, accounts/CRM |
| `js/views/admin.js` | Employee, settings, parts, bulletin management |

**API (`~/bleachers-api/`):**
- `api/auth/` - OAuth flow (connect, callback, status)
- `api/qb/` - QB endpoints (customers, estimates)
- `api/_lib/qb.js` - Token management

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
1. Field beta testing with 2-3 techs on real jobs
2. QB integration testing
3. Bug fixes and refinements

**Post-v3:**
1. Get Draper CSV and add to Airtable
2. Receive Hussey part images (PNG)
3. Signature capture for work orders
4. Archived jobs tab (for 1000+ completed jobs)
5. PO view pulling from estimates

**QuickBooks Integration (Built, needs testing):**
1. Set `QB_CLIENT_ID` and `QB_CLIENT_SECRET` in Vercel
2. Create sandbox company at developer.intuit.com
3. Test OAuth flow and estimate creation
4. Backend already exists at bleachers-api.vercel.app

---

## Troubleshooting

**Buttons/Navigation Not Working:**
1. Open browser console (F12 or Cmd+Option+I)
2. Look for red errors - syntax errors will prevent subsequent JS files from loading
3. Check script load order in index.html (config → data → views → utils → app)
4. Hard refresh (Cmd+Shift+R or Ctrl+Shift+F5) to clear cache

**Status Updates Not Persisting:**
1. Check localStorage in DevTools → Application → Local Storage
2. Look for keys: `scheduleDataOriginal`, `scheduleDataSouthern`
3. Clear if corrupted: `localStorage.clear()` in console

**Bulletins/Notifications Not Showing:**
1. Check localStorage keys: `companyBulletins`, `userNotifications`
2. Hard refresh (Cmd+Shift+R) to reload data.js
3. To reset to defaults: delete keys in localStorage and refresh

---

## Critical Principles

- **"If it didn't happen in QuickBooks, it didn't happen at all"**
- **Inspector after-hours work is the #1 pain point**
- **Schools have poor WiFi** - offline mode critical
- **Multi-vendor jobs are common** - search all vendors
- **DIY approach is working** - keep building

---

*For version history and completed milestones, see `bleacher-app-history.md`*
