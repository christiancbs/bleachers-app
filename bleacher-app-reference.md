# Bleachers & Seats - App Development Reference

**Last Updated:** February 5, 2026
**Version:** v2.0
**Purpose:** Active development context. Historical changelog in `bleacher-app-history.md`.
**Active Branch:** `main`

---

## Quick Reference

| Resource | URL |
|----------|-----|
| **App Live** | christiancbs.github.io/bleachers-app/ |
| **App Repo** | github.com/christiancbs/bleachers-app |
| **API Live** | bleachers-api.vercel.app/ |
| **API Repo** | github.com/christiancbs/bleachers-api |

**Dev Workflow:** Edit files → test with `python3 -m http.server 8080` → push to GitHub

**Versions:**
- `v1.0` - Original navigation structure (archived)
- `v2.0` - Current: Navigation refactor + field create feature

---

## Current Build Status (v2.0 - February 5, 2026)

### What's Built & Working

**Core Features:**
- Multi-bank inspection flow (issue-first, Top Side → Understructure)
- Digital parts catalog (2,142 Hussey parts via Airtable)
- 3 inspection templates (Basketball, Indoor Bleacher, Outdoor Bleacher)
- Unified job numbering (Job # = Estimate # = Work Order # = QB #)
- Ops Review with status flow (submitted → under_review → approved)
- Pipeline view (8 status stages, territory filter)
- Scheduling (dense spreadsheet, Mon-Thu + Friday, territory separation)

**CRM / Accounts:**
- Customer hierarchy: District (billing entity) → Locations (schools)
- Multi-contact support at both customer and location level
- Contact roles with badges: 📅 Scheduling, 📝 Contracts, 💰 Billing, 🔧 Equipment, 🔑 Access, 📞 Primary
- CRUD for customers, contacts, and locations
- Territory filter (Original, Southern, House Account)
- Helper functions: `getPrimaryContact()`, `getContactForRole()`

**Navigation:**
- Office/Admin default: Pipeline
- Field default: My Jobs
- Sidebar uses `data-view` attributes for reliable highlighting
- Settings at bottom of sidebar (all roles)
- **Office/Admin:** Search | Sales (Pipeline, Accounts) | Procurement (Ops Review, Estimates, Parts Orders) | Logistics (Shipping, Scheduling) | Resources (Parts Catalog) | Settings
- **Field:** Search | Inspections & Service (My Jobs with "+ Create Job" button, Team Schedule) | Resources (Parts Catalog) | Settings

**Field Create Feature (NEW in v2.0):**
- "+ Create Job" button in My Jobs view for field staff
- Unified create form supporting: Inspection, Work Order, Parts Spec
- Same customer selection and workflow as office create
- Returns to My Jobs after creation (or launches inspection flow)

**Estimates View:**
- Tabbed interface: All | Pending Estimates | Accepted Estimates | + Create Estimate
- Badge counts on Pending/Accepted tabs

**Settings View (role-based sections):**
- Profile (all roles): name, phone, email - saved to localStorage
- QuickBooks Integration (Office + Admin): connection status, reconnect button
- Manage (Admin only): Employees, Parts Catalog, Import Pricing, Vendors tabs

**Infrastructure:**
- Vercel API with OAuth + QB endpoints (pending Intuit credentials)
- Upstash Redis for token storage
- API keys in `js/config.js` (gitignored, not in repo)
- Modular file structure (main branch)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Plain HTML/CSS/JS (no framework) |
| Backend API | Vercel serverless (Node.js ESM) |
| Parts Data | Airtable |
| Token Storage | Upstash Redis |
| QB Integration | QuickBooks Online API (OAuth 2.0) |
| Hosting | GitHub Pages (app), Vercel (API) |

---

## File Structure

### App (`~/bleachers-app/`)

| File | Purpose |
|------|---------|
| `index.html` | HTML skeleton, all view containers |
| `css/app.css` | All styles |
| `js/config.js` | API keys (gitignored) |
| `js/data.js` | Constants, CUSTOMERS, CONTACT_ROLES, sample data |
| `js/app.js` | Core - init, login, showView, sidebar |
| `js/views/inspection.js` | Multi-bank inspection flow |
| `js/views/scheduling.js` | Schedule grid, planning, backlog |
| `js/views/dashboard.js` | Dashboard, estimates, pipeline, accounts, CRM CRUD |
| `js/views/office.js` | Office work order detail |
| `js/views/admin.js` | Settings, employees, manage section, QB status, user profile |
| `js/views/field.js` | Tech work order detail |
| `js/views/ops-review.js` | Ops review list + detail |
| `js/views/my-jobs.js` | My Jobs + Team Schedule |
| `js/views/create.js` | Office and field create forms |
| `js/utils/parts-catalog.js` | Airtable search |
| `js/utils/search.js` | Unified search |

### API (`~/bleachers-api/`)

| File | Purpose |
|------|---------|
| `api/auth/connect.js` | OAuth flow initiation |
| `api/auth/callback.js` | OAuth callback, token storage |
| `api/auth/status.js` | QB connection status |
| `api/qb/customers.js` | List/search QB customers |
| `api/qb/estimates.js` | GET/POST estimates |
| `api/_lib/qb.js` | Token management |

---

## Data Structures

### Customer with Contacts
```javascript
{
    id: 'cust1',
    name: 'Wilson County Schools',
    type: 'county',  // 'county' or 'private'
    billingAddress: '...',
    phone: '...',
    territory: 'Original',  // 'Original', 'Southern', or 'House'
    contacts: [
        { id: 'con1', name: '...', title: '...', phone: '...', mobile: '...', email: '...', roles: ['contracts', 'billing'] }
    ],
    locations: [
        {
            id: 'loc1',
            name: 'Central High School',
            address: '...',
            contacts: [
                { id: 'loc1con1', name: '...', title: '...', phone: '...', roles: ['scheduling', 'access'] }
            ]
        }
    ]
}
```

### Contact Roles
```javascript
const CONTACT_ROLES = {
    scheduling: { label: 'Scheduling', icon: '📅', color: '#2196F3' },
    contracts: { label: 'Contracts', icon: '📝', color: '#9C27B0' },
    billing: { label: 'Billing', icon: '💰', color: '#4CAF50' },
    equipment: { label: 'Equipment', icon: '🔧', color: '#FF9800' },
    access: { label: 'Access', icon: '🔑', color: '#795548' },
    primary: { label: 'Primary', icon: '📞', color: '#607D8B' }
};
```

---

## Airtable

| Setting | Value |
|---------|-------|
| Base ID | `appAT4ZwbRAgIyzUW` |
| Table ID | `tbl4mDv20NaJnaaN7` |
| API Token | In `js/config.js` (regenerate at airtable.com/create/tokens) |

---

## Next Steps

### Immediate
1. Get Draper CSV and add to Airtable
2. Test demo with inspector - get feedback
3. Receive part images from Hussey (PNG format)

### QuickBooks Integration
1. Set `QB_CLIENT_ID` and `QB_CLIENT_SECRET` env vars in Vercel
2. Create sandbox company at developer.intuit.com
3. Test OAuth flow: bleachers-api.vercel.app/api/auth/connect
4. Wire up frontend to call API endpoints
5. Test estimate creation: POST /api/qb/estimates

### Medium-term
1. Proxy Airtable calls through Vercel (so parts search works on live site)
2. Offline capability (cache parts locally)
3. Work order PDF generation
4. Connect work order completion to actual job data

---

## Critical Principles

- **"If it didn't happen in QuickBooks, it didn't happen at all"**
- **Inspector after-hours work is the #1 pain point**
- **Schools have poor WiFi** - offline mode is critical
- **Multi-vendor jobs are common** - search across all vendors
- **Building in-house** - DIY approach is working

---

*For version history, see `bleacher-app-history.md`*
