# Bleachers & Seats - App Development Reference

**Last Updated:** February 8, 2026
**Version:** v3.3.1
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

**Test v3.3.0 Features:**
1. Login as **Office** → **Estimates** → See real QuickBooks estimates with line items
2. Click any estimate → View full details with parts/labor breakdown
3. Filter by status: All, Pending, Accepted

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
- `v3.3.1` - **Current:** Jobs view mirrors field staff for real-time visibility

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

4. PROCUREMENT
   └── Order parts from vendors OR pull from inventory

5. WORK ORDER CREATED  ← Separate from Estimate!
   └── Labor lines from estimate become work instructions
   └── Internal operations document for scheduling

6. PARTS RECEIVED → 7. SCHEDULE → 8. COMPLETE WORK → 9. BILL CUSTOMER
```

**Key Distinction:**
- **Estimate** = Financial quote to customer. Lives in QuickBooks. Created in app → pushed to QB.
- **Work Order** = Internal ops document. Created from accepted estimate's labor lines. Tracks scheduling, assignment, completion.

---

## What's Built (v3.3.0)

**Core Features:**
- **Home Page** - Role-specific landing with bulletins, notifications, and action items
- Multi-bank inspection flow (Basketball, Indoor/Outdoor Bleacher templates)
- **Digital Parts Catalog** - 2,100+ Hussey parts via Vercel Postgres with image support
- **Parts Management** - Admin/Office can add/edit parts, upload images, bulk CSV import
- **Image Lightbox** - Click any part with image to view full-size with details pill bar
- **Estimates View** - Real QuickBooks data with All/Pending/Accepted tabs
- **Estimate Detail** - Full line item breakdown with amounts
- **Jobs View** - Office sees same format as field staff "My Jobs" (real-time visibility)
- **Work Orders Database** - Postgres tables for work orders, attachments, inspection banks
- **Sales Pipeline** - Pre-sale tracking with A/B/C deal grading
- **Project Tracker** - Post-sale operations with date tracking
- **Live status tracking** (scheduled → en route → checked in → complete/unable)
- Scheduling (spreadsheet view with Confirmed column, Equipment badges)
- CRM with customer hierarchy (District → Locations)

**Navigation:**
- **Office/Admin:** Home | Search | Sales (Sales Pipeline, Accounts) | Procurement (Ops Review, Estimates, Parts Orders) | Logistics (Shipping, Jobs, Scheduling, Project Tracker) | Resources (Parts Catalog) | Settings
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
│   ├── config.js              # API keys (deprecated)
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
│   │   └── scheduling.js      # Scheduling, Jobs list, QB sync
│   └── utils/
│       ├── parts-api.js       # Parts API client
│       ├── jobs-api.js        # Work Orders API client
│       ├── estimates-api.js   # QB Estimates API client
│       ├── parts-catalog.js   # Parts search UI
│       └── search.js          # Global search utilities
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
└── metadata (JSONB)

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
**Work Order Status:** `draft`, `scheduled`, `in_progress`, `completed`, `on_hold`, `cancelled`

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
| PUT | `/:id` | Update work order |
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
4. **Create Work Order from Accepted Estimate** - Button exists, needs implementation
5. **Estimate Builder** - Create estimates in app → push to QB

**Short-term:**
1. Parts tracking on work orders (needed, ordered, received)
2. Signature capture for work orders
3. Offline mode for parts catalog
4. Field Guide / Help Desk

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

---

## Critical Principles

- **"If it didn't happen in QuickBooks, it didn't happen at all"**
- **Estimates are created IN the app, pushed TO QuickBooks** (not imported from QB)
- **Work Orders are separate from Estimates** - internal ops documents
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

# List work orders (currently empty - create from accepted estimates)
curl https://bleachers-api.vercel.app/api/jobs
```

---

*For version history, see `bleacher-app-history.md`*
