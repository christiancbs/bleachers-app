# Bleachers & Seats - App Development Reference

**Last Updated:** February 9, 2026
**Version:** v3.5.0
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
- **Office:** Click "office@bleachers.com" - View "Estimates" for real QB data
- **Admin:** Click "admin@bleachers.com" - Full access to all features

**Test v3.5.0 Features:**
1. Login as **Office** → **Jobs** → Use **Territory filter tabs** (All/Original KY-TN/Southern AL-FL)
2. Go to **Accounts** → Click a customer → **Equipment tab** → See equipment counts per location
3. Click **Edit** on any location to update equipment counts (Goals, Straps, Edge Pads, Bleacher Banks)

---

## Quick Reference

| Resource | URL |
|----------|-----|
| **App Live** | christiancbs.github.io/bleachers-app/ |
| **App Repo** | github.com/christiancbs/bleachers-app |
| **API Live** | bleachers-api.vercel.app/ |
| **API Repo** | github.com/christiancbs/bleachers-api |

**Version Tags:**
- `v3.2.1` - Office parts management, image lightbox, paste upload
- `v3.3.0` - Jobs database, Estimates view wired to QB, EstimatesAPI
- `v3.3.1` - Jobs view mirrors field staff for real-time visibility
- `v3.4.0` - Create WO from estimate, Jobs tabs, Parts Tracking, Planning workflow
- `v3.5.0` - **Current:** Territory View, Site Equipment Profile

---

## Business Flow (IMPORTANT)

```
1. INSPECTION
   └── Inspector documents issues at school site
       └── Uses inspection form linked to parts catalog
       └── Creates Part Specification Form (PSF)

2. OPS REVIEW
   └── Reviews inspection findings
       └── Generates ESTIMATE (parts + labor pricing)
       └── Pushes estimate TO QuickBooks ← NOT importing FROM QB

3. CUSTOMER ACCEPTANCE
   └── Customer reviews and accepts estimate
       └── Status updates to "Accepted" in QB

4. WORK ORDER CREATED  ← NOW IMPLEMENTED!
   └── Click "Create Work Order" on accepted estimate
   └── Labor lines become work instructions
   └── Parts tracking fields available

5. PLANNING & SCHEDULING
   └── Jobs appear in Backlog tab
   └── Click "Add to Planning" → place on calendar
   └── Assign technician when placing

6. FIELD WORK
   └── Tech sees job in My Jobs
   └── Status updates: en route → checked in → complete/unable
   └── "Unable to Complete" → lands on Shit List

7. PARTS RECEIVED → 8. COMPLETE WORK → 9. BILL CUSTOMER
```

**Key Distinction:**
- **Estimate** = Financial quote to customer. Lives in QuickBooks. Created in app → pushed to QB.
- **Work Order** = Internal ops document. Created from accepted estimate's labor lines. Tracks scheduling, assignment, completion.

---

## What's Built (v3.5.0)

**Core Features:**
- **Home Page** - Role-specific landing with bulletins, notifications, and action items
- Multi-bank inspection flow (Basketball, Indoor/Outdoor Bleacher templates)
- **Digital Parts Catalog** - 2,100+ Hussey parts via Vercel Postgres with image support
- **Parts Management** - Admin/Office can add/edit parts, upload images, bulk CSV import
- **Image Lightbox** - Click any part with image to view full-size with details pill bar
- **Estimates View** - Real QuickBooks data with All/Pending/Accepted tabs
- **Estimate Detail** - Full line item breakdown + **Create Work Order** button
- **Create Work Order from Estimate** - Converts accepted estimate to work order with labor lines as instructions
- **Jobs View (Tabbed):**
  - **All** - All work orders
  - **Backlog** - Draft status, awaiting scheduling
  - **This Week** - Weekly grid view with territory tabs
  - **Completed** - Finished work orders
  - **Shit List** - Jobs marked "Unable to Complete" by field staff
- **Territory View** - Filter jobs by All Territories / Original (KY/TN) / Southern (AL/FL)
- **Jobs Search** - Search by job number, customer, or location
- **Job Detail Modal** - Full job info with **Parts Tracking** section
- **Parts Tracking** - PO #, promise date, destination, received status, location
- **Add to Planning** - Select job from Backlog → place on Planning calendar
- **Work Orders Database** - Postgres tables for work orders, attachments, inspection banks
- **Sales Pipeline** - Pre-sale tracking with A/B/C deal grading
- **Project Tracker** - Post-sale operations with date tracking
- **Live status tracking** (scheduled → en route → checked in → complete/unable)
- Scheduling (This Week + Planning tabs)
- CRM with customer hierarchy (District → Locations)
- **Site Equipment Profile** - Equipment counts per location (Goals, Straps, Edge Pads, Bleacher Banks) with edit capability

**Navigation:**
- **Office/Admin:** Home | Search | Sales (Sales Pipeline, Accounts) | Procurement (Ops Review, Estimates) | Logistics (Jobs, Scheduling, Project Tracker) | Resources (Parts Catalog) | Settings
- **Field:** Home | Search | Inspections & Service (My Jobs, Team Schedule) | Resources (Parts Catalog) | Settings

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Plain HTML/CSS/JS |
| Backend API | Vercel (Node.js ESM) - **Pro Plan** |
| Parts Database | Vercel Postgres (Neon) |
| Jobs Database | Vercel Postgres (Neon) - same DB |
| File Storage | Vercel Blob |
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
│   ├── data.js                # Constants, sample data
│   ├── views/
│   │   ├── admin.js           # Employee, settings, parts management
│   │   ├── create.js          # Office/field unified create forms
│   │   ├── dashboard.js       # Home, Estimates, Sales Pipeline, CRM
│   │   ├── field.js           # Field staff utilities
│   │   ├── inspection.js      # Multi-bank inspection flow
│   │   ├── my-jobs.js         # Field My Jobs, status updates
│   │   ├── office.js          # Office work order management
│   │   ├── ops-review.js      # Ops review workflow
│   │   └── scheduling.js      # Scheduling, Jobs list, Planning, Parts Tracking
│   └── utils/
│       ├── parts-api.js       # Parts API client
│       ├── jobs-api.js        # Work Orders API client
│       ├── estimates-api.js   # QB Estimates API client
│       ├── parts-catalog.js   # Parts search UI
│       └── search.js          # Global search utilities
├── scripts/
│   └── servicepal-migration/  # ServicePal data extraction
│       ├── scraper.js         # Puppeteer-based scraper
│       ├── config.json        # Credentials (gitignored)
│       ├── output/            # Scraped data (gitignored)
│       │   ├── jobs/          # Job JSON files
│       │   ├── photos/        # Downloaded images
│       │   └── _progress.json # Resume state
│       └── MIGRATION-REFERENCE.md
├── bleacher-app-reference.md  # This file
└── REFERENCE.md               # System architecture docs

~/bleachers-api/
├── api/
│   ├── _lib/
│   │   ├── qb.js              # QuickBooks token management
│   │   ├── db.js              # Postgres connection helper
│   │   └── auth.js            # Role validation helper
│   ├── auth/                  # OAuth endpoints
│   │   ├── connect.js         # GET - Initiates OAuth flow
│   │   ├── callback.js        # GET - Handles OAuth callback
│   │   └── status.js          # GET/DELETE - Check/disconnect
│   ├── qb/                    # QuickBooks API
│   │   ├── estimates.js       # GET/POST estimates
│   │   ├── customers.js       # GET customers
│   │   └── company-info.js    # GET company info
│   ├── parts/                 # Parts catalog API
│   │   ├── search.js          # GET search
│   │   ├── index.js           # POST add
│   │   ├── [id].js            # PUT/DELETE
│   │   ├── import.js          # POST bulk CSV
│   │   └── images/            # Image upload
│   └── jobs/                  # Work Orders API
│       ├── index.js           # GET list, POST create
│       ├── [id].js            # GET/PUT/DELETE single work order
│       ├── sync.js            # (deprecated - was incorrect QB import)
│       ├── attachments.js     # File uploads
│       └── inspections.js     # Inspection banks
├── db/
│   └── schema-jobs.sql        # Jobs database schema
├── package.json
├── vercel.json                # CORS config
└── REFERENCE.md               # System docs
```

---

## Database Schema

### Parts Table (existing)
```sql
parts: id, part_number, product_name, description, price,
       category, subcategory, vendor, image_url, created_at
```

### Work Orders Tables
```sql
jobs  -- Work orders (NOT estimates)
├── id, job_number (unique), job_type, status
├── customer_id, customer_name, location_name, address
├── contact_name, contact_phone, contact_email
├── title, description, special_instructions
├── assigned_to, scheduled_date, estimated_hours
├── qb_estimate_id, qb_estimate_total, qb_synced_at
├── created_at, updated_at, completed_at
└── metadata (JSONB)  -- includes partsTracking object

job_attachments
├── id, job_id (FK), type, filename, blob_url
├── content_type, file_size, part_number, vendor
└── uploaded_by, uploaded_at, metadata (JSONB)

inspection_banks
├── id, job_id (FK), bank_name, bleacher_type
├── row_count, seat_count
├── checklist_data (JSONB), issues (JSONB)
├── status, inspected_at, inspected_by
└── created_at, updated_at
```

**Work Order Types:** `repair`, `inspection`, `service_call`, `go_see`
**Work Order Status:** `draft`, `scheduled`, `in_progress`, `completed`, `unable_to_complete`, `cancelled`

**Parts Tracking (in metadata.partsTracking):**
- `partsOrdered` (boolean)
- `poNumber` (string)
- `promiseDate` (date)
- `destination` (string)
- `partsReceived` (boolean)
- `partsLocation` (string)

---

## API Endpoints

### QuickBooks (`/api/qb/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/estimates?limit=N&status=X` | List estimates |
| POST | `/estimates` | Create estimate in QB |
| GET | `/customers?search=X` | Search customers |
| GET | `/company-info` | Test connection |

### Parts (`/api/parts/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?q=&category=&vendor=` | Search parts |
| POST | `/` | Add part |
| PUT | `/:id` | Update part |
| DELETE | `/:id` | Delete part |
| POST | `/import` | Bulk CSV import |
| POST | `/images` | Upload image |

### Work Orders (`/api/jobs/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/?status=&job_type=&q=` | List/search work orders |
| POST | `/` | Create work order |
| GET | `/:id` | Get work order with attachments |
| PUT | `/:id` | Update work order (status, metadata, etc.) |
| DELETE | `/:id` | Delete work order |
| POST | `/attachments` | Upload photo/PDF |
| POST | `/inspections` | Add inspection bank |

**Auth:** Write operations require `X-User-Role: admin` or `office` header.

---

## Next Steps

**Immediate (Work Order Flow):**
1. ~~Jobs database~~ ✅ DONE
2. ~~Estimates view wired to QB~~ ✅ DONE
3. ~~Jobs view mirrors field staff~~ ✅ DONE
4. ~~Create Work Order from Accepted Estimate~~ ✅ DONE
5. ~~Jobs view with tabs (All/Backlog/This Week/Completed/Shit List)~~ ✅ DONE
6. ~~Parts Tracking on work orders~~ ✅ DONE
7. ~~Add to Planning workflow~~ ✅ DONE
8. **Estimate Builder** - Create estimates in app → push to QB

**Short-term:**
1. Signature capture for work orders
2. Offline mode for parts catalog
3. Field Guide / Help Desk
4. Drag-and-drop in Planning view
5. ~~ServicePal data migration~~ **IN PROGRESS** - scraper running

---

## ServicePal Migration (IN PROGRESS)

**Status:** Scraper running - extracting all historical job data from ServicePal.

**Current Stats (as of Feb 9, 2026):**
- **302 jobs** scraped (of ~16,854 total)
- **478 work orders** extracted
- **1,279 photos** downloaded
- **58MB** output so far

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

**Scraper Location:** `~/bleachers-app/scripts/servicepal-migration/`

**Commands:**
```bash
cd ~/bleachers-app/scripts/servicepal-migration

# Resume scraping (prevents Mac sleep)
caffeinate -i npm run scrape:resume

# Test run (10 jobs only)
npm run scrape:test

# Full fresh start
npm run scrape
```

**Output:**
- `output/jobs/{jobNumber}.json` - Full job data with work orders
- `output/photos/{jobNumber}_photo_{n}.jpg` - Downloaded images
- `output/_progress.json` - Resume state and stats

**Data Sources Being Consolidated:**
1. **ServicePal** - All historical jobs, work orders, photos, technician notes
2. **QuickBooks** - Estimates, customers, invoices (API connected)
3. **Salesmate** - Contact data (separate export)

**Key Patterns Discovered:**
- Teams organized by territory (TNBSTeam, ALBSTeam, etc.)
- Parts staged at regional shops ("TN Shop", "FL Shop")
- Vehicle/toolbox checklists done daily
- Jobs reference estimate numbers (e.g., "TN522009") - linkable to QB
- Common repairs: drive wheel cleaning, motor tensioning, guide rods, deck boards

**Potential New Features from Data:**
- Territory View for scheduling
- Fleet/Vehicle Management
- Site Equipment Profile (goal counts, strap counts per location)
- Shop Inventory tracking
- Tech Hours Dashboard

**Next:** Build import script to load ServicePal data into bleachers-app Postgres.

---

## Troubleshooting

**Estimates Not Loading:**
1. Check browser console for errors
2. Test API: `curl https://bleachers-api.vercel.app/api/qb/estimates?limit=5`
3. If QB disconnected, reconnect via `/api/auth/connect`

**Parts Catalog Not Loading:**
1. Test API: `https://bleachers-api.vercel.app/api/parts/search?q=motor`
2. Check Vercel dashboard for Postgres status

**Status Updates Not Persisting:**
1. Check localStorage in DevTools → Application → Local Storage
2. Clear if corrupted: `localStorage.clear()` in console

**Jobs Not Appearing:**
1. Hard refresh browser (Cmd+Shift+R)
2. Test API: `curl https://bleachers-api.vercel.app/api/jobs`
3. Check that work order was created from accepted estimate

---

## Critical Principles

- **"If it didn't happen in QuickBooks, it didn't happen at all"**
- **Estimates are created IN the app, pushed TO QuickBooks** (not imported from QB)
- **Work Orders are separate from Estimates** - internal ops documents
- **Shit List = field-driven** - jobs land there when tech marks "Unable to Complete"
- **Parts tracking lives on the work order** - not separate views
- **Inspector after-hours work is the #1 pain point**
- **Schools have poor WiFi** - offline mode critical
- **Multi-vendor jobs are common** - search all vendors

---

## Test Commands

```bash
# Test QB connection
curl https://bleachers-api.vercel.app/api/qb/company-info

# Get QB estimates
curl "https://bleachers-api.vercel.app/api/qb/estimates?limit=5"

# Search parts
curl "https://bleachers-api.vercel.app/api/parts/search?q=seat+board"

# List work orders
curl https://bleachers-api.vercel.app/api/jobs

# Get single work order with details
curl https://bleachers-api.vercel.app/api/jobs/1
```

---

*For version history, see `bleacher-app-history.md`*
