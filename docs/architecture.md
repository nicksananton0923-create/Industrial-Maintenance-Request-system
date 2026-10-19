# Architecture

## Stack
- **Frontend:** HTML/CSS/JS served by Apps Script `HtmlService`
- **Backend:** Google Apps Script (V8 runtime)
- **Storage:** Google Sheets (data) + Google Drive (photos)
- **Auth:** Google Workspace domain (`executeAs: USER_DEPLOYING`, `access: DOMAIN`)

## Why Apps Script?
✅ Zero infrastructure, free tier, native Google auth, Drive photo storage
❌ Not for high-concurrency (Sheets API ~100 req/min), no real DB transactions

**Verdict:** Suitable for a single-site industrial maintenance workflow with
<50 users and <500 work orders/month. Migrate to Cloud SQL + AppSheet/Firebase
if you exceed that.

## Data flow
1. User opens web app → `doGet()` → `Index.html`
2. `getCurrentUser()` resolves role from `Users` sheet
3. `submitRequest()` appends row to `Requests`, generates WO ID, writes to `AuditLog`
4. Supervisor calls `assignTechnician()` → status = Assigned
5. Technician calls `startWork()` → status = In Progress, StartTime set
6. Technician calls `completeWork()` → status = Completed, photos saved to Drive
7. `getDashboard()` aggregates KPIs

## Security model
- Web app restricted to Google Workspace domain
- Role checks in every mutating function (`requireRole_`)
- Requesters see only their own requests
- Technicians see only their assigned requests
- Photos shared as "domain with link, view only"
- No secrets in code — spreadsheet ID stored in Script Properties
