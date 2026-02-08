# Bleachers & Seats App - Reference Guide

## Overview

Field service management app for bleacher inspection, repair, and maintenance. Integrates with QuickBooks Online for estimates and invoicing.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (GitHub Pages)                                     │
│  christiancbs.github.io/bleachers-app                       │
│  - Vanilla JS, single HTML file                             │
│  - Custom CSS (no framework)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  API (Vercel Serverless)                                     │
│  bleachers-api.vercel.app                                   │
│  - Node.js serverless functions                             │
│  - CORS configured for GitHub Pages origin                  │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Neon Postgres  │ │  Vercel Blob    │ │  QuickBooks API │
│  (via Vercel)   │ │  (images/files) │ │  (OAuth 2.0)    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Business Flow

```
1. INSPECTION
   └── Inspector documents issues at school site
       └── Uses inspection form linked to parts catalog
       └── Creates Part Specification Form (PSF)

2. OPS REVIEW
   └── Reviews inspection findings
       └── Generates ESTIMATE (parts + labor pricing)
       └── Pushes estimate TO QuickBooks

3. CUSTOMER ACCEPTANCE
   └── Customer reviews and accepts estimate
       └── Status updated in QB → synced to app

4. PROCUREMENT
   └── Order parts from vendors OR pull from inventory
       └── Track parts status

5. WORK ORDER CREATED
   └── Labor lines from estimate become work instructions
       └── NOT the same as the estimate - internal ops document

6. PARTS RECEIVED
   └── Parts arrive or shipped to job site
       └── Update work order status

7. SCHEDULE
   └── Assign technician(s) and date
       └── Coordinate with customer

8. COMPLETE WORK
   └── Technician performs repairs
       └── Photos, notes, hours logged

9. BILL CUSTOMER
   └── Invoice generated in QuickBooks
```

## Key Concepts

| Term | Definition |
|------|------------|
| **Estimate** | Financial quote to customer (parts + labor). Lives in QuickBooks. Created in app → pushed to QB. |
| **Work Order** | Internal ops document for scheduling/tracking work. Created from accepted estimate's labor lines. |
| **PSF** | Part Specification Form - inspection output listing needed parts |
| **Job Number** | Unified identifier (Estimate # = Job # = Work Order #) |
| **Bank** | A single bleacher unit within a facility (e.g., "East Bleachers", "Section A") |

## API Endpoints

### QuickBooks Integration (`/api/qb/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/qb/estimates` | GET | List estimates from QB |
| `/api/qb/estimates` | POST | Create new estimate in QB |
| `/api/qb/customers` | GET | List/search QB customers |
| `/api/qb/company-info` | GET | Test QB connection |

### Parts Catalog (`/api/parts/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/parts/search` | GET | Search parts catalog |
| `/api/parts` | POST | Add new part |
| `/api/parts/:id` | PUT | Update part |
| `/api/parts/:id` | DELETE | Delete part |
| `/api/parts/import` | POST | Bulk CSV import |
| `/api/parts/images` | POST | Upload part image |

### Jobs/Work Orders (`/api/jobs/`) - NEEDS REWORK

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jobs` | GET | List work orders |
| `/api/jobs` | POST | Create work order |
| `/api/jobs/:id` | GET | Get work order with attachments |
| `/api/jobs/:id` | PUT | Update work order |
| `/api/jobs/attachments` | POST | Upload photo/document |
| `/api/jobs/inspections` | POST | Add inspection bank |

**Note:** The jobs table was initially populated incorrectly from QB estimates. Work orders should be created from ACCEPTED estimates, not imported directly.

### Auth (`/api/auth/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/connect` | GET | Start QB OAuth flow |
| `/api/auth/callback` | GET | OAuth callback handler |
| `/api/auth/status` | GET | Check connection status |
| `/api/auth/disconnect` | POST | Disconnect QB |

## Database Schema

### `parts` (Vercel Postgres via Neon)
```sql
- id, part_number, product_name, description
- price, price_note, category, subcategory
- product_line, model_info, vendor, image_url
- created_at, updated_at
```

### `jobs` (Work Orders)
```sql
- id, job_number (unique), job_type, status
- customer_id, customer_name, location_name, address
- contact_name, contact_phone, contact_email
- title, description, special_instructions
- assigned_to, scheduled_date, estimated_hours
- qb_estimate_id, qb_estimate_total, qb_synced_at
- created_at, updated_at, completed_at, metadata (JSONB)
```

### `job_attachments`
```sql
- id, job_id (FK), type, filename, blob_url
- content_type, file_size, part_number, vendor
- uploaded_by, uploaded_at, metadata (JSONB)
```

### `inspection_banks`
```sql
- id, job_id (FK), bank_name, bleacher_type
- row_count, seat_count, checklist_data (JSONB)
- issues (JSONB), status, inspected_at, inspected_by
```

## Frontend Structure

```
bleachers-app/
├── index.html              # Single HTML file with all views
├── css/
│   └── app.css            # All styles
└── js/
    ├── app.js             # Core routing, auth, init
    ├── data.js            # Constants, sample data
    ├── utils/
    │   ├── parts-api.js       # Parts catalog API client
    │   ├── jobs-api.js        # Jobs/work orders API client
    │   ├── estimates-api.js   # QB estimates API client
    │   ├── parts-catalog.js   # Parts search UI
    │   └── search.js          # Global search
    └── views/
        ├── dashboard.js       # Home, estimates, pipeline
        ├── scheduling.js      # Schedule grid, jobs list
        ├── office.js          # Work order management
        ├── inspection.js      # Inspection workflow
        ├── field.js           # Field tech operations
        └── admin.js           # Admin features
```

## Roles

| Role | Access |
|------|--------|
| `admin` | Full access, all features |
| `office` | Estimates, scheduling, work orders |
| `inspector` | Inspections, read-only estimates |
| `field` | Assigned jobs, completion, photos |

## Vendors

- **Hussey Seating Co** - Primary bleacher manufacturer
- **Interkal** - Secondary vendor
- **Draper** - Basketball goals, gym equipment

## Status Values

### Estimate Status (from QB)
- `Pending` - Awaiting customer response
- `Accepted` - Customer approved
- `Closed` - Completed/archived
- `Rejected` - Customer declined

### Work Order Status
- `draft` - Created, not scheduled
- `scheduled` - Assigned tech + date
- `in_progress` - Work underway
- `completed` - Work finished
- `on_hold` - Waiting (parts, customer, etc.)
- `cancelled` - Cancelled

### Job Types
- `repair` - Fix existing equipment
- `inspection` - Annual/periodic inspection
- `service_call` - Troubleshooting visit
- `go_see` - Site evaluation/quote

## Environment

- **Frontend**: GitHub Pages (christiancbs.github.io)
- **API**: Vercel (Pro plan, 17 serverless functions)
- **Database**: Neon Postgres (via Vercel integration)
- **Storage**: Vercel Blob
- **Cache**: Upstash Redis (QB tokens)
- **Accounting**: QuickBooks Online

## TODO / Known Issues

1. **Jobs view incorrectly populated** - Was importing QB estimates as jobs. Need to clear and repurpose as Work Orders view.

2. **Create Work Order flow** - When estimate is accepted, create work order with labor lines as instructions.

3. **Estimate Builder** - Build estimates in app (parts + labor) and push to QB. Currently placeholder.

4. **Parts in Work Order** - Track which parts are needed, ordered, received for each job.

5. **Offline capability** - Field staff need to work without internet (future).

## Quick Commands

```bash
# Test QB connection
curl https://bleachers-api.vercel.app/api/qb/company-info

# Get estimates
curl "https://bleachers-api.vercel.app/api/qb/estimates?limit=10"

# Search parts
curl "https://bleachers-api.vercel.app/api/parts/search?q=seat+board"

# List work orders
curl https://bleachers-api.vercel.app/api/jobs
```
