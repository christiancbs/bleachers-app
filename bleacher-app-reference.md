# Bleachers & Seats - App Development Reference

**Last Updated:** February 9, 2026
**Version:** v3.8.0
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

**Test v3.7.0 Features (Procurement Intelligence):**
1. Login as **Office** → **Estimates** → **+ Create Estimate** tab
2. Add a part line item with "replace" in description → See **auto-suggested** "Customer responsible for disposal" note appear
3. Add a labor line for "safety strap install" → See **auto-suggested** "Lift rental required" note
4. Click **stock?** link on a part line item → Select shop location (TN/FL/AL) → See blue **stock badge**
5. Click **+ Add Note** → Pick from dropdown or enter custom note
6. Submit estimate → Check QB PrivateNote contains structured procurement memo
7. Accept estimate in QB → **Create Work Order** → Verify procurement notes + stock parts carry to work order metadata
8. Go to **Jobs** → See **red stock warning banner** on jobs with unverified stock parts
9. Open job detail → See **Procurement Notes** and **Stock Parts** sections
10. Try to schedule job with unverified stock → See **verification gate** confirm dialog

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
- `v3.5.0` - Territory View, Site Equipment Profile
- `v3.6.0` - Estimate Builder, streamlined Create Job, Ops Review workflow
- `v3.7.0` - Procurement Intelligence — auto-notes, stock part tracking, pre-schedule verification
- `v3.8.0` - **Current:** Ops Foundation — territory DB column + API filtering, confirmation tracking, expanded pink categories, scraper fixes

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

4. WORK ORDER CREATED
   └── Click "Create Work Order" on accepted estimate
   └── Labor lines become work instructions
   └── Procurement notes + stock parts auto-transferred from estimate
   └── Parts tracking pre-filled with shop location

5. PLANNING & SCHEDULING
   └── Jobs appear in Backlog tab (stock warnings visible)
   └── Click "Add to Planning" → place on calendar
   └── PRE-SCHEDULE GATE: unverified stock parts must be confirmed
   └── Procurement notes reminder shown before scheduling
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

## What's Built (v3.8.0)

**Core Features:**
- **Home Page** - Role-specific landing with bulletins, notifications, and action items
- Multi-bank inspection flow (Basketball, Indoor/Outdoor Bleacher templates)
- **Digital Parts Catalog** - 2,100+ Hussey parts via Vercel Postgres with image support
- **Parts Management** - Admin/Office can add/edit parts, upload images, bulk CSV import
- **Image Lightbox** - Click any part with image to view full-size with details pill bar
- **Estimates View** - Real QuickBooks data with All/Pending/Accepted tabs
- **Estimate Detail** - Full line item breakdown + **Create Work Order** button
- **Estimate Builder** - Create estimates with parts, labor, and custom line items → push to QB
- **Procurement Intelligence (v3.7.0):**
  - **Auto-Detection Engine** - Scans line items and suggests procurement notes:
    - Removal/demo work without dumpster → "Customer responsible for disposal"
    - Goal/strap/ceiling work without lift → "Lift rental required"
    - Wall pad replacement → "Customer to clear wall area, confirm truck access"
    - Floor/hardwood work → "Plywood required for floor protection"
    - Stock keywords (TN Shop, from stock, etc.) → auto-marks stock parts
  - **Procurement Notes UI** - Card in Estimate Builder with Add/Dismiss on suggestions, dropdown of 9 common notes, custom note entry
  - **Stock Part Marking** - Click "stock?" on any part/custom line item → pick shop (TN/FL/AL) → blue badge shown
  - **QB PrivateNote Integration** - Structured memo: `NOTES: ...; | STOCK PARTS: Deck Board (TN Shop), ...`
  - **Estimate → Work Order Bridge** - Procurement notes + stock parts auto-transferred to work order metadata, partsTracking pre-filled with shop location
  - **Pre-Schedule Verification Gate** - Unverified stock parts trigger confirm dialog before scheduling. Cancel returns to backlog, OK marks verified.
  - **Procurement Notes in Job Detail** - Orange section showing notes carried from estimate
  - **Stock Parts in Job Detail** - Red (unverified) or green (verified) section with verifier name/date
  - **Stock Warning Banner** - Red warning in jobs list for jobs with unverified stock parts
  - **Stock Verified Fields** - Added to Parts Tracking edit flow (stockVerified, stockVerifiedBy, stockVerifiedDate)
- **Ops Foundation (v3.8.0):**
  - **Territory Column** - `territory` field on jobs table, auto-detected from job_number prefix (TN/KY → Original, AL/FL → Southern). 388 Original + 106 Southern backfilled.
  - **Territory + Date Range API Filtering** - `GET /api/jobs?territory=Original&scheduled_date_gte=2026-02-03&scheduled_date_lte=2026-02-07` for scheduling queries
  - **Confirmation Tracking** - Schedule entries now capture `confirmedWith`, `confirmationMethod` (email/phone/in_person), `confirmedBy`, `confirmedDate`. Tooltips show confirmation details on schedule grid.
  - **Expanded Pink/Shit List Categories** - 9 reason categories: Wrong Part, Can't Access, Additional Work, Equipment Issue, Customer Not Ready, Safety Concern, Scope Change, Weather/Access, Other. `PINK_REASONS` constant in data.js.
  - **ServicePal Scraper Fixes** - Fixed column alignment (off-by-one in Kendo grid parsing), added KY/GA/MS state detection for territory
- **Create Work Order from Estimate** - Converts accepted estimate to work order with labor lines as instructions
- **Jobs View (Tabbed):**
  - **All** - All work orders (with stock warning banners)
  - **Backlog** - Draft status, awaiting scheduling
  - **This Week** - Weekly grid view with territory tabs
  - **Completed** - Finished work orders
  - **Shit List** - Jobs marked "Unable to Complete" by field staff
- **Territory View** - Filter jobs by All Territories / Original (KY/TN) / Southern (AL/FL)
- **Jobs Search** - Search by job number, customer, or location
- **Job Detail Modal** - Full job info with Parts Tracking, Procurement Notes, and Stock Parts sections
- **Parts Tracking** - PO #, promise date, destination, received status, location, stock verified, verified by
- **Add to Planning** - Select job from Backlog → place on Planning calendar (with verification gate)
- **Work Orders Database** - Postgres tables for work orders, attachments, inspection banks
- **Sales Pipeline** - Pre-sale tracking with A/B/C deal grading
- **Project Tracker** - Post-sale operations with date tracking
- **Live status tracking** (scheduled → en route → checked in → complete/unable)
- Scheduling (This Week + Planning tabs)
- CRM with customer hierarchy (District → Locations)
- **Site Equipment Profile** - Equipment counts per location (Goals, Straps, Edge Pads, Bleacher Banks) with edit capability
- **Streamlined Create Job** - Job types: Inspection, Work Order, Service Call, Go-See, Field Check, Custom
- **Customer Typeahead Search** - Start typing to search, county first then school, + custom entry option
- **Ops Review Workflow** - Three-button approach (Approve | Create Work Order | Build Estimate)
- **Approved Sub-Filters** - Track inspections: Awaiting WO, Awaiting Estimate, Complete

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
│   ├── data.js                # Constants, sample data, STOCK_LOCATIONS, COMMON_PROCUREMENT_NOTES
│   ├── views/
│   │   ├── admin.js           # Employee, settings, parts management
│   │   ├── create.js          # Office/field unified create forms with typeahead
│   │   ├── dashboard.js       # Home, Estimates, Sales Pipeline, CRM, WO-from-estimate bridge
│   │   ├── estimate-builder.js # Estimate Builder with line items + procurement intelligence
│   │   ├── field.js           # Field staff utilities
│   │   ├── inspection.js      # Multi-bank inspection flow
│   │   ├── my-jobs.js         # Field My Jobs, status updates
│   │   ├── office.js          # Office work order management
│   │   ├── ops-review.js      # Ops review workflow with 3-button actions
│   │   └── scheduling.js      # Scheduling, Jobs list, Planning, Parts Tracking, pre-schedule verification
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
│   │   ├── estimates.js       # GET/POST estimates (includes privateNote, customerMemo)
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
├── territory                           -- Original (TN/KY) or Southern (AL/FL), auto-detected from job_number prefix
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

**Work Order Types:** `inspection`, `work_order`, `service_call`, `go_see`, `field_check`, or custom string
**Work Order Status:** `draft`, `scheduled`, `in_progress`, `completed`, `unable_to_complete`, `cancelled`

**Parts Tracking (in metadata.partsTracking):**
- `partsOrdered` (boolean)
- `poNumber` (string)
- `promiseDate` (date)
- `destination` (string)
- `partsReceived` (boolean)
- `partsLocation` (string) - auto-filled from stock location when WO created from estimate
- `stockVerified` (boolean) - has someone confirmed stock is available at shop?
- `stockVerifiedBy` (string) - who verified (Admin/Office)
- `stockVerifiedDate` (date) - when verified

**Procurement Notes (in metadata.procurementNotes):**
- Array of `{ text, source }` — source is 'estimate' (parsed from QB PrivateNote) or 'auto'/'manual'

**Stock Parts (in metadata.stockParts):**
- Array of `{ itemName, quantity, stockLocation, verified }` — stock location is TN Shop / FL Shop / AL Shop / Stock

**Procurement Data Flow:**
```
Estimate Builder → QB PrivateNote (structured memo) → Work Order metadata → Scheduling gate
```

---

## API Endpoints

### QuickBooks (`/api/qb/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/estimates?limit=N&status=X` | List estimates (includes privateNote, customerMemo) |
| POST | `/estimates` | Create estimate in QB (memo → PrivateNote with procurement data) |
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
| GET | `/?status=&job_type=&q=&territory=&scheduled_date_gte=&scheduled_date_lte=` | List/search work orders (territory + date range filtering) |
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
8. ~~Estimate Builder~~ ✅ DONE - Create estimates with parts, labor, custom items → push to QB
9. ~~Streamlined Create Job form~~ ✅ DONE - Typeahead customer search, job types
10. ~~Procurement Intelligence~~ ✅ DONE - Auto-notes, stock tracking, pre-schedule verification

**Next (Persistent Scheduling):**
1. Wire scheduling UI to jobs API (replace localStorage with DB-backed schedule)
2. Weekly grid queries `GET /api/jobs?territory=Original&scheduled_date_gte=X&scheduled_date_lte=Y`
3. "Add to Planning" writes `scheduled_date` + `assigned_to` via `PUT /api/jobs/:id`
4. Status updates (en_route, checked_in) flow through same API
5. $2.67M in draft work orders waiting to be scheduled — this is the bottleneck

**Short-term:**
1. Sales/Estimate Analytics Dashboard (pipeline health, territory win rates, deal size intelligence)
2. ServicePal Import Pipeline (data cleaning + batch import to Postgres)
3. Customer Database Migration (QB 1,000 customers → Postgres, replace hardcoded 7)
4. Signature capture for work orders
5. Offline mode for field staff
6. ~~ServicePal data migration~~ **IN PROGRESS** - scraper running (column alignment fixed)

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
- **Procurement info must survive the journey** - estimate → QB PrivateNote → work order metadata → scheduling gate. If it's known at estimate time, it should be enforced at schedule time.
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
