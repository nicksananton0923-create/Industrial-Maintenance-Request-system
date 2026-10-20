# Industrial Maintenance Request & Work Order Management System

A Google Apps Script project intended to help an industrial maintenance team record equipment issues, organise work orders, track status, and document maintenance actions.

> **Status:** Prototype / under review. The repository contains backend and front-end source files, a Google Apps Script manifest, sample work-order data, and documentation. The code has not been independently executed, deployed, or end-to-end tested as part of this review. Do not treat it as a production-ready system without the security and deployment checks listed below.

## Project goals

- Record equipment and maintenance requests with category, priority, location, and description.
- Track work-order states such as Open, Assigned, In Progress, and Completed.
- Record assignment, start/completion times, actions taken, and remarks.
- Provide basic work-order summaries and recurring-equipment indicators.
- Keep an audit trail of selected workflow actions.
- Explore Google Sheets for records and Google Drive for maintenance-photo storage.

These are intended capabilities reflected in the current source; they are not a claim that every workflow is complete or verified.

## Technology shown in the repository

- Google Apps Script (V8 runtime)
- Google Sheets for work-order and user data
- Google Drive for photo storage
- HTML, CSS, and client-side JavaScript for the web interface

## Current repository contents

- `src/Code.gs` — Apps Script backend
- `src/src/Index.html` and `src/src/Styles.html` — interface files
- `src/src/src/JavaScript.html` — client-side interactions
- `Appsscript.json` — Apps Script manifest
- `Sample-data` — example work-order rows
- `docs/architecture.md` and nested documentation folders — architecture, setup, user guide, schema, and testing notes

**Repository layout note:** The HTML files are currently nested under multiple `src/` directories, while some setup instructions describe a flatter layout. Confirm and reconcile the actual Apps Script project structure before copying files or deploying. Existing paths have not been changed in this documentation update.

## Intended workflow

1. A requester submits an equipment issue.
2. The backend creates a work-order record and due date.
3. A supervisor or administrator assigns a technician.
4. Work progress and completion details are recorded.
5. Dashboard summaries help review work-order status.

The current UI and backend do not yet expose or enforce every step consistently. See the security and verification checklist below.

## Important security and deployment review

Before using real employee or factory data, review and test at least the following:

- Enforce role-based authorisation inside every server-side operation that changes a work order or uploads a photo. UI visibility alone is not security.
- Check ownership/assignment and permitted status transitions in `startWork()`, `completeWork()`, and related functions.
- Review HTML rendering of user- or sheet-sourced values in the client. Avoid inserting untrusted values through `innerHTML`; escape or render them safely.
- Confirm photo-sharing permissions are appropriate for the organisation and intended users.
- Verify the Apps Script time-zone setting and OAuth scopes.
- Reconcile the manifest's web-app access setting with the deployment instructions.
- Check work-order ID generation under simultaneous submissions.
- Test setup, request creation, assignment, completion, filtering, dashboards, and audit logging in a non-production test project.

These are review items, not claims that the checks have passed. The manifest currently contains a time-zone string that appears invalid; configuration changes are intentionally not included in this README-only change.

## Testing status

The repository includes a manual testing plan, but a test plan is not evidence that tests have passed. No automated test run, live deployment, permission review, or end-to-end verification is claimed here.

## Sample data and privacy

Treat `Sample-data` as illustrative sample data. Before publishing or deploying, ensure that public examples contain no real employee information, email addresses, confidential equipment details, spreadsheet IDs, credentials, or internal URLs.

## Suggested next steps

1. Review and approve the separate code/configuration findings before changing implementation.
2. Fix and test server-side authorisation and safe output rendering.
3. Correct and validate the manifest/deployment settings.
4. Reconcile the nested file layout with setup instructions without moving files until that change is approved.
5. Record actual test results and add screenshots only after the application is verified.

## Author

Technical portfolio project focused on industrial maintenance workflows, equipment documentation, and practical digital tools.
