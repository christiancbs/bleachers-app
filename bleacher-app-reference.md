# Bleachers & Seats - App Development Reference

**Last Updated:** February 8, 2026
**Version:** v3.2.1
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

**Test v3.2.1 Features:**
1. Login as **Office** → **Settings** → **Manage** → Parts Catalog tab (Office can now manage parts)
2. **Parts Catalog** → Search for a part with image → Click/tap card to see full-size lightbox
3. Edit a part → Paste a screenshot directly into the image upload area (Ctrl/Cmd+V)

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
- `v3.1.0` - Home page with bulletins & notifications
- `v3.1.1` - Code cleanup, folder restructure
- `v3.2.0` - Parts catalog migrated to Vercel Postgres + Blob
- `v3.2.1` - **Current:** Office parts management, image lightbox, paste upload

---

## What's Built (v3.2.1)

**Core Features:**
- **Home Page** - Role-specific landing with bulletins, notifications, and action items
- Multi-bank inspection flow (Basketball, Indoor/Outdoor Bleacher templates)
- **Digital Parts Catalog** - 2,100+ Hussey parts via Vercel Postgres with image support
- **Parts Management** - Admin/Office can add/edit parts, upload images, bulk CSV import
- **Image Lightbox** - Click any part with image to view full-size with details pill bar
- **Screenshot Paste** - Paste images directly into part edit modal (Ctrl/Cmd+V)
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

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Plain HTML/CSS/JS |
| Backend API | Vercel (Node.js ESM) |
| Parts Database | Vercel Postgres (Neon) |
| Parts Images | Vercel Blob |
| Token Storage | Upstash Redis |
| QB Integration | QuickBooks Online API (OAuth 2.0) - **CONNECTED** |
| Hosting | GitHub Pages + Vercel |

---

## Folder Structure

```
~/bleachers-app/
├── index.html                 # Main app (4,000+ lines)
├── css/app.css                # All styles
├── js/
│   ├── app.js                 # Core: init, login, routing, nav
│   ├── config.js              # API keys (gitignored, deprecated)
│   ├── data.js                # Constants, sample data
│   ├── views/
│   │   ├── admin.js           # Employee, settings, parts management, bulletins
│   │   ├── create.js          # Office/field unified create forms
│   │   ├── dashboard.js       # Home, Sales Pipeline, Project Tracker, CRM
│   │   ├── field.js           # Field staff utilities
│   │   ├── inspection.js      # Multi-bank inspection flow
│   │   ├── my-jobs.js         # Field My Jobs, status updates
│   │   ├── office.js          # Office work order management
│   │   ├── ops-review.js      # Ops review workflow
│   │   └── scheduling.js      # Scheduling, Jobs view, status data
│   └── utils/
│       ├── parts-api.js       # Parts API client (Vercel Postgres)
│       ├── parts-catalog.js   # Parts search UI
│       └── search.js          # Global search utilities
├── tools/                     # Scripts
│   ├── clean_hussey_csv.py    # CSV normalization
│   ├── extract_catalog.py     # PDF extraction (Claude vision)
│   └── migrate.html           # Airtable migration tool (one-time)
├── vendor-data/               # Source files (gitignored)
├── archive/                   # Old prototypes & docs (gitignored)
└── *.png                      # Logo files

~/bleachers-api/               # Separate repo (Vercel backend)
├── api/
│   ├── _lib/
│   │   ├── qb.js              # QuickBooks token management
│   │   ├── db.js              # Postgres connection helper
│   │   └── auth.js            # Role validation helper
│   ├── auth/
│   │   ├── connect.js         # GET - Initiates OAuth flow
│   │   ├── callback.js        # GET - Handles OAuth callback
│   │   └── status.js          # GET/DELETE - Check status / disconnect
│   ├── qb/
│   │   ├── estimates.js       # GET /api/qb/estimates
│   │   ├── customers.js       # GET /api/qb/customers
│   │   └── company-info.js    # GET /api/qb/company-info
│   └── parts/                 # Parts catalog API
│       ├── search.js          # GET /api/parts/search
│       ├── index.js           # POST /api/parts (add)
│       ├── [id].js            # PUT/DELETE /api/parts/:id
│       ├── import.js          # POST /api/parts/import (bulk CSV)
│       └── images/
│           ├── index.js       # POST single image upload
│           └── bulk.js        # POST bulk image upload
├── package.json
└── vercel.json                # CORS config
```

---

## Parts Catalog Config

| Resource | Details |
|----------|---------|
| Database | Neon Postgres via Vercel Storage |
| Images | Vercel Blob (`bleacher-images`) |
| API Base | `https://bleachers-api.vercel.app/api/parts` |

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?q=&category=&vendor=` | Search parts |
| POST | `/` | Add single part |
| PUT | `/:id` | Update part |
| DELETE | `/:id` | Delete part |
| POST | `/import` | Bulk CSV import |
| POST | `/images` | Upload single image |
| POST | `/images/bulk` | Upload folder (match by part #) |

**Auth:** Write operations require `X-User-Role: admin` or `office` header.

---

## QuickBooks Integration (LIVE)

**Status:** Connected to production QB (realm: 123145718017157)

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/connect` | Start OAuth flow |
| GET | `/api/auth/status` | Check connection status |
| DELETE | `/api/auth/status` | Disconnect from QB |
| GET | `/api/qb/estimates?limit=N` | Fetch estimates |
| GET | `/api/qb/customers` | Fetch customers |

**Test:** `curl https://bleachers-api.vercel.app/api/qb/estimates?limit=5`

**Notes:**
- Uses `com.intuit.quickbooks.accounting` scope (readonly not available in production)
- Tokens auto-refresh via Upstash Redis
- Only admin QB users can authorize the connection
- Vercel Hobby plan limit: 12 serverless functions (currently at limit)

---

## Next Steps

**In Progress - Jobs Database:**
1. Create `jobs` table schema in Vercel Postgres
2. Create `job_attachments` table for photos/PDFs
3. Create `inspection_banks` table for multi-bank inspections
4. Build API endpoints (like parts catalog pattern)
5. Import QB estimates into jobs database
6. PDF upload for historical work orders

**Planned Database Schema:**
```
jobs
├── id, job_number, job_type, status
├── customer_id, location_id, location_name, address
├── description, special_instructions
├── assigned_to, scheduled_date
├── created_at, updated_at, completed_at
└── qb_estimate_id (link to QB)

job_attachments
├── id, job_id, type (photo, pdf, part_spec_form)
├── blob_url, filename, uploaded_at
└── metadata (JSON)

inspection_banks (for multi-bank inspections)
├── id, job_id, bank_name, bleacher_type
├── checklist_data (JSON), issues (JSON)
```

**Short-term:**
1. Signature capture for work orders
2. Archived jobs tab (for 1000+ completed jobs)
3. Field Guide / Help Desk in Resources section
4. Offline mode for parts catalog

---

## Troubleshooting

**Buttons/Navigation Not Working:**
1. Open browser console (F12 or Cmd+Option+I)
2. Look for red errors - syntax errors will prevent subsequent JS files from loading
3. Check script load order in index.html (config → data → views → utils → app)
4. Hard refresh (Cmd+Shift+R or Ctrl+Shift+F5) to clear cache

**Parts Catalog Not Loading:**
1. Check browser console for errors
2. Verify bleachers-api is deployed and running
3. Test API directly: `https://bleachers-api.vercel.app/api/parts/search?q=motor`
4. Check Vercel dashboard for Postgres/Blob connection status

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
