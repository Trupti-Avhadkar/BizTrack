# BizTrack — Small Business Manager

A mobile-first installable Progressive Web App for the MAD college project. It works in a modern browser and stores its records locally on the device.

## Features
- Dashboard with sales, expenses, net profit, stock and low-stock alerts.
- Product add/edit/delete/search.
- Sales recording, automatic totals, stock deduction, insufficient-stock prevention, and stock restoration if a sale is deleted.
- Expense tracking with category and date.
- Reports with sales-vs-expenses and sales-by-product charts.
- CSV export for product, sales and expense records.
- Editable sample data, validation, success/error messages, local persistence.
- Installable PWA with offline app-shell caching when served over HTTPS or localhost.

## Quick preview on a computer
Open `index.html` in a modern browser. Core features work, but service-worker/offline and install functionality require a local web server or HTTPS.

## Run on your Android phone (recommended)
PWA installation requires the app to be served from **HTTPS** (or localhost). The simplest approach:
1. Upload the contents of this folder to a static hosting provider that supports HTTPS, such as GitHub Pages, Netlify, or Cloudflare Pages.
2. Open the deployed HTTPS URL in Chrome on your Android phone.
3. Open Chrome's menu (⋮) and tap **Install app** or **Add to Home screen**.
4. Open BizTrack from the new home-screen icon.

For GitHub Pages: create a repository, upload all files from this folder to the repository root, then open **Settings → Pages** and enable deployment from the main branch/root. Wait for the HTTPS URL to appear.

## Local testing
With Python installed, open a terminal in this folder and run:
```bash
python -m http.server 8000
```
On the same computer, visit `http://localhost:8000`. For phone testing on the same Wi-Fi, use your computer's LAN IP (for example `http://192.168.1.5:8000`); this is useful for testing the UI but is not a secure install URL. Use HTTPS hosting for installation.

## Data and limitations
- Records are saved in this browser's local storage, not a cloud database. Data is local to the browser/device and may be lost if browser storage is cleared. Use CSV export for backups.
- This is a PWA fallback implementation, not a native Kotlin/Room Android Studio project. It does not include multi-user accounts, cloud sync, tax handling, or payment gateway integration.
- The dashboard totals are calculated from recorded sales and expenses; sample entries are provided and can be deleted. Sample sales are starting examples and do not reduce sample inventory automatically on first launch.
