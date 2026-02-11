# Security Plan: Clerk Auth + PII Removal

## Context

The bleachers-app has no real authentication. The frontend sets a JS variable for "role" and sends it as a spoofable `X-User-Role` header. The backend trusts this header for write access. GET endpoints have zero auth. Real customer and employee PII is hardcoded in `js/data.js` in a public GitHub repo. The parts database, job data, and QB integration are all publicly accessible to anyone who finds the API URL.

**Goal:** Lock down the entire app with Clerk authentication, protect every API endpoint, and remove PII from the public repo.

---

## Current Vulnerabilities

| Issue | Severity | Details |
|-------|----------|---------|
| No real authentication | CRITICAL | Login is cosmetic — `login('admin')` in DevTools grants full access |
| API completely open | CRITICAL | All GET endpoints (parts, jobs, customers) require zero auth |
| Spoofable write access | CRITICAL | `X-User-Role: admin` header is all that's needed to create/edit/delete |
| Real customer PII in public repo | HIGH | Names, phones, emails of school district contacts in `js/data.js` |
| Real employee data in public repo | HIGH | 14 employees with names, emails, roles in `js/data.js` |
| Parts database publicly queryable | HIGH | `curl .../api/parts/search?q=anything` returns full catalog |
| QB connection status exposed | MEDIUM | Anyone can check if QB is connected |
| No rate limiting | MEDIUM | API can be scraped without restriction |

### What IS properly secured
- QuickBooks OAuth tokens stored server-side in Upstash Redis (not exposed to frontend)
- No API keys or secrets committed to git
- CORS origin locked to `christiancbs.github.io` (helps but doesn't prevent direct API calls)
- SQL queries use parameterized statements (no SQL injection)
- QB integration is read-only except estimate creation

---

## Architecture Overview

```
BEFORE (current):
Browser → sets currentRole variable → sends X-User-Role header → API trusts it

AFTER (with Clerk):
Browser → Clerk sign-in → gets JWT → sends Bearer token → API verifies with Clerk → extracts real role
Scripts → send X-API-Key header → API verifies against env var → grants admin access
```

---

## Phase 1: Clerk Setup (Manual)

1. Create a Clerk application at clerk.com
2. Configure sign-in: email/password (internal staff only)
3. Create user accounts for each employee
4. Set each user's `publicMetadata.role` via Clerk Dashboard:
   - `{ "role": "admin" }` — full access
   - `{ "role": "office" }` — office staff (read/write jobs, parts, estimates)
   - `{ "role": "technician" }` — field tech (read jobs, update status)
   - `{ "role": "inspector" }` — inspector (read jobs, create inspections)
5. Environment variables needed:
   - `CLERK_PUBLISHABLE_KEY` — frontend (safe to expose)
   - `CLERK_SECRET_KEY` — backend only (add to Vercel env vars)
   - `ADMIN_API_KEY` — backend only (random secret for script access)

---

## Phase 2: Backend Auth (Deploy First)

Deploy with backward-compatible auth so the live app doesn't break during transition.

### 2a. Install dependency
```bash
cd ~/bleachers-api
npm install @clerk/backend
```

### 2b. Rewrite `api/_lib/auth.js`

New auth flow (in priority order):
1. `Authorization: Bearer <token>` → verify JWT with Clerk → extract user + role
2. `X-API-Key: <key>` → compare against `ADMIN_API_KEY` env var → grant admin
3. `X-User-Role: <role>` → **temporary legacy fallback** (removed in Phase 5)

New exports:
- `requireAuth(req, res)` — returns `{ userId, role, email }` or sends 401
- `hasWriteAccess(user)` — checks `user.role === 'admin' || user.role === 'office'`

### 2c. Protect all routes

**13 route files to update:**

| File | Current Auth | Change |
|------|-------------|--------|
| `api/parts/search.js` | NONE | Add `requireAuth()` |
| `api/parts/index.js` | hasWriteAccess (POST) | Replace with `requireAuth()` + role check |
| `api/parts/[id].js` | hasWriteAccess (PUT/DELETE) | Same |
| `api/parts/import.js` | hasWriteAccess (POST) | Same |
| `api/parts/images/index.js` | hasWriteAccess (POST) | Same |
| `api/parts/images/bulk.js` | hasWriteAccess (POST) | Same |
| `api/jobs/index.js` | NONE (GET), hasWriteAccess (POST) | Add `requireAuth()` to all |
| `api/jobs/[id].js` | NONE (GET), hasWriteAccess (PUT/DELETE) | Same |
| `api/jobs/attachments.js` | hasWriteAccess | Replace |
| `api/jobs/inspections.js` | hasWriteAccess | Replace |
| `api/jobs/sync.js` | hasWriteAccess (POST) | Replace |
| `api/qb/estimates.js` | NONE | Add `requireAuth()` |
| `api/qb/customers.js` | NONE | Add `requireAuth()` |

**Leave public** (QB OAuth flow):
- `api/auth/connect.js` — initiates OAuth redirect
- `api/auth/callback.js` — receives OAuth callback

**Add auth:**
- `api/auth/status.js` — only authenticated users should check QB status
- `api/qb/company-info.js` — same

### 2d. Update CORS

**File:** `vercel.json`

Add `Authorization` to allowed headers:
```json
"Access-Control-Allow-Headers": "Content-Type, X-User-Role, X-API-Key, Authorization"
```

---

## Phase 3: Frontend Auth

### 3a. Add Clerk JS SDK

**File:** `index.html`
```html
<script src="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"></script>
```

### 3b. New auth module

**New file:** `js/utils/clerk-auth.js`
- Initialize Clerk with publishable key
- `getAuthHeaders()` (async) — gets session token, returns `{ Authorization: 'Bearer <token>' }`
- `getCurrentUser()` — returns user info + role from `publicMetadata`
- Sets `currentRole` global so existing UI role-switching logic still works

### 3c. Replace fake login

**File:** `index.html`
- Remove hardcoded email/password form and demo account buttons
- Mount Clerk's `<SignIn />` component in the login screen div
- On sign-in success: read `user.publicMetadata.role`, call existing `login(role)`

### 3d. Update API clients

**Files:** `js/utils/parts-api.js`, `js/utils/jobs-api.js`, `js/utils/estimates-api.js`

Change in each:
```javascript
// BEFORE
getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (typeof currentRole !== 'undefined' && currentRole) {
        headers['X-User-Role'] = currentRole;
    }
    return headers;
}

// AFTER
async getHeaders() {
    return await getAuthHeaders();  // from clerk-auth.js
}
```

Every call site changes from `this.getHeaders()` to `await this.getHeaders()`. All calling methods are already async so this is mechanical.

### 3e. Sign-out

- Add sign-out button (replaces demo account switcher)
- `clerk.signOut()` → clear `currentRole` → show login screen

---

## Phase 4: PII Removal

### 4a. Remove from code

**File:** `js/data.js`
- `CUSTOMERS` array (lines ~33-258) — replace with `[]` (data now comes from API/QB)
- `EMPLOYEES` array (lines ~722-737) — replace with `[]` (load from Clerk user list or API)

### 4b. Remove demo credentials

**File:** `index.html`
- Hardcoded `office@bleachers.com` / `password` removed when Clerk replaces the login form

### 4c. Git history (optional)

Two options:
- **Simple:** Remove PII in a new commit, accept it exists in history. Auth protects the app now.
- **Thorough:** Use `git filter-repo` or BFG Repo-Cleaner to scrub history, then force push.

---

## Phase 5: Remove Legacy Fallback

After confirming Clerk auth works end-to-end:

**File:** `api/_lib/auth.js`
- Remove `X-User-Role` header fallback
- Only accept: Clerk Bearer token OR API key

This is the point of no return — the old spoofable header stops working.

---

## Phase 6: Script Access

**File:** `scripts/data-import/config.js`
- Replace `authRole: 'admin'` with API key from env var

**File:** `scripts/data-import/lib/api-client.js`
- Send `X-API-Key` header instead of `X-User-Role`

Usage:
```bash
ADMIN_API_KEY=your-secret npm run step1
```

---

## Deployment Order

| Step | What | Where | Risk |
|------|------|-------|------|
| 1 | Backend with Clerk + legacy fallback | bleachers-api → Vercel | Zero — old frontend keeps working |
| 2 | Frontend with Clerk login | bleachers-app → GitHub Pages | Low — if Clerk fails, no one can log in (rollback by reverting) |
| 3 | Remove PII from data.js | bleachers-app → GitHub | Zero |
| 4 | Remove legacy fallback | bleachers-api → Vercel | Medium — confirms old auth path is dead |
| 5 | Update import scripts | bleachers-app (local) | Zero — only affects local scripts |

---

## Verification Checklist

- [ ] Visit app — Clerk sign-in appears instead of fake login
- [ ] Sign in as admin — admin dashboard loads, all features work
- [ ] Sign in as technician — limited access, can't see admin features
- [ ] DevTools: `login('admin')` — UI may change but API calls fail without valid token
- [ ] `curl https://bleachers-api.vercel.app/api/parts/search` — returns 401
- [ ] `curl -H "X-User-Role: admin" .../api/parts/search` — returns 401 (after Phase 5)
- [ ] `curl -H "X-API-Key: <secret>" .../api/parts/search` — works
- [ ] `curl -H "Authorization: Bearer <expired>" .../api/parts/search` — returns 401
- [ ] Create estimate through app — still pushes to QuickBooks
- [ ] Run data-import scripts with API key — still work
- [ ] Check `js/data.js` on GitHub — no customer/employee PII
- [ ] Parts search works for authenticated users
- [ ] Job scheduling works for authenticated users
- [ ] QB sync (import estimates) works for office/admin roles

---

## Files Modified Summary

### bleachers-api (backend) — 16 files

| File | Change |
|------|--------|
| `package.json` | Add `@clerk/backend` dependency |
| `api/_lib/auth.js` | Complete rewrite — Clerk JWT verification + API key fallback |
| `vercel.json` | Add `Authorization` to CORS allowed headers |
| `api/parts/search.js` | Add requireAuth() |
| `api/parts/index.js` | Replace hasWriteAccess → requireAuth() |
| `api/parts/[id].js` | Same |
| `api/parts/import.js` | Same |
| `api/parts/images/index.js` | Same |
| `api/parts/images/bulk.js` | Same |
| `api/jobs/index.js` | Add requireAuth() to GET + POST |
| `api/jobs/[id].js` | Add requireAuth() to GET + PUT + DELETE |
| `api/jobs/attachments.js` | Replace hasWriteAccess → requireAuth() |
| `api/jobs/inspections.js` | Same |
| `api/jobs/sync.js` | Same |
| `api/qb/estimates.js` | Add requireAuth() |
| `api/qb/customers.js` | Add requireAuth() |

### bleachers-app (frontend) — 8 files

| File | Change |
|------|--------|
| `index.html` | Clerk SDK script, replace login form, add sign-out |
| `js/utils/clerk-auth.js` | **New** — Clerk init, token management, role bridge |
| `js/utils/parts-api.js` | async getHeaders() with Bearer token |
| `js/utils/jobs-api.js` | Same |
| `js/utils/estimates-api.js` | Same |
| `js/data.js` | Remove CUSTOMERS + EMPLOYEES arrays |
| `scripts/data-import/config.js` | API key config |
| `scripts/data-import/lib/api-client.js` | X-API-Key header |
