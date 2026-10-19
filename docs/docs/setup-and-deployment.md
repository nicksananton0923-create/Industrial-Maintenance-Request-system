# Setup & Deployment

## Prerequisites
- Google Workspace account (domain-restricted access)
- A Google Sheet (or let `setup()` create one)

## Steps
1. Go to https://script.google.com → **New project**
2. Rename to `Industrial Maintenance System`
3. Replace `appsscript.json` with the one in this repo (Project Settings → "Show manifest")
4. Create files in `src/` matching this repo:
   - `Code.gs`
   - `Index.html`
   - `Styles.html`
   - `JavaScript.html`
5. Run `setup()` once → authorize → note the returned Sheet URL
6. Deploy → **New deployment** → Web app
   - Execute as: **User accessing the web app** (or "Me" for testing)
   - Who has access: **Anyone in your domain**
7. Copy the web app URL — that's your live app

## Adding users
Open the `Users` sheet and add rows:
