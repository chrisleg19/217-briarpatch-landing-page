# 217 Briarpatch Court — Rental Landing Page

A single-page rental landing site for **217 Briarpatch Ct, Stockbridge, GA 30281**.
Its job: present the property professionally and drive visitors to the Google
pre-screening / showing-request form.

## Files

```
Landing Page Site/
├── index.html        # The page (all content + sections)
├── styles.css        # Styling (forest-green + brass palette, responsive)
├── script.js         # Mobile menu, sticky nav, photo lightbox
├── images/           # Property photos used on the page
├── serve.ps1         # Local preview server (optional, Windows)
└── README.md         # This file
```

## What's on the page

- Sticky header + utility bar with agent name and phone
- Full-bleed hero with rent, beds, baths, sq ft, and a "Start Pre-Screening Form" button
- About / overview with a key-facts grid
- Features & amenities list
- Photo gallery (click any photo for a full-size lightbox)
- Lease terms grid (rent, deposit, fees, pet policy, utilities, screening, showings)
- "How It Works" 3-step process
- Location with embedded Google Map, schools, and a Google Maps link
- Apply call-to-action section
- Footer with showing contact and **Equal Housing Opportunity** statement

## Key details shown (from the FMLS guide)

| Item | Value |
|------|-------|
| Rent | $1,900 / month |
| Security deposit | $1,900 |
| Lease term | 12-month minimum |
| Availability | Available now |
| Move-in admin fee | $150 (approved tenant) |
| Application fee | $100 per adult (RentSpree) |
| Pets | Up to 2, max 60 lbs each; $350 first / $150 second (non-refundable) |
| Utilities | Tenant pays all |
| Garage | 2 spaces (confirmed) |
| Pre-screening form | https://docs.google.com/forms/d/e/1FAIpQLSd4HCCBHfHP5qSLWcfCCc9Hl_EybYRiT3BY14VlRrsjiHlTXw/viewform?usp=header |

## Preview locally (Windows)

The page must be served over HTTP (browsers block some features on `file://`).

```powershell
powershell -ExecutionPolicy Bypass -File ".\serve.ps1" -Port 8123
```

Then open http://localhost:8123/ in your browser. Press `Ctrl+C` to stop.

(You can also just double-click `index.html` — most things work, but the local
server is the most reliable way to preview.)

## Publish to GitHub Pages (free live URL, no software to install)

Goal: a live page now, structured so it can become a subpage of
`legettelegacygroupllc.com` later without changes. All links in this site are
relative, so it works at a root, a subfolder, or a subdomain.

### Step 1 — Create a GitHub account
- Go to https://github.com and sign up (free). Verify your email.

### Step 2 — Create the repository
1. Click **+** (top right) → **New repository**.
2. **Repository name:** `217-briarpatch`
   (this makes the URL read `.../217-briarpatch/`, already subpage-shaped)
3. Set it to **Public**. Do NOT add a README (we already have one).
4. Click **Create repository**.

### Step 3 — Upload the files (drag & drop, no Git needed)
1. On the new repo page, click **uploading an existing file**
   (or **Add file → Upload files**).
2. Open the `Landing Page Site` folder on your computer.
3. Select everything inside it — `index.html`, `styles.css`, `script.js`,
   `README.md`, `.gitignore`, and the **`images` folder** — and drag it all
   into the browser. (Chrome/Edge keep the `images` folder intact.)
4. Scroll down, click **Commit changes**.

### Step 4 — Turn on GitHub Pages
1. In the repo, go to **Settings → Pages** (left sidebar).
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Branch: **`main`**, folder: **`/ (root)`** → **Save**.
4. Wait ~1–2 minutes. The live URL appears at the top of that page:
   **`https://<your-username>.github.io/217-briarpatch/`**

That URL is your live, shareable standalone page.

## Turning it into a subpage later (after you build your homepage)

When `legettelegacygroupllc.com` exists, pick ONE:

- **Subdomain (works no matter where the homepage is hosted):**
  Add a DNS `CNAME` record `briarpatch` → `<your-username>.github.io`, then in
  this repo's **Settings → Pages → Custom domain** enter
  `briarpatch.legettelegacygroupllc.com`. Link to it from your homepage menu.
- **Subfolder (only if the homepage is ALSO on GitHub Pages):**
  Move these files into a `217-briarpatch/` folder inside the homepage repo;
  it will serve at `legettelegacygroupllc.com/217-briarpatch/`. No code changes
  needed because all links are relative.

### Faster alternative for an instant URL (optional, not GitHub)
Drag the `Landing Page Site` folder onto https://app.netlify.com/drop for an
instant `*.netlify.app` URL. Useful for a quick share; GitHub Pages above is the
path you asked for.

## After publishing — pre-launch checklist

- [ ] Open the live URL on a phone (not just desktop)
- [ ] Tap "Start Pre-Screening Form" → confirm the Google Form opens
- [ ] Confirm the Google Form rent/terms say **$1,900** (not an old price)
- [ ] Submit a test response and confirm you receive the Google Forms notification
- [ ] Verify contact info in the footer (LLG Leasing, 404-590-0295)
- [ ] Confirm school zoning with the district/broker if you want it displayed
- [ ] Copy the live URL for FMLS/GAMLS, Zillow, Facebook, a QR code, and the yard sign

## Updating content later

- **Text / terms:** edit `index.html`
- **Colors / spacing:** edit the variables at the top of `styles.css` (`:root`)
- **Photos:** drop new images into `images/` and update the `<img src="...">`
  paths in the gallery and hero/apply background styles in `index.html`

## Notes

- Copy is written to be fair-housing-safe (describes the property, not ideal tenants).
- Photos: `front2.heic` was intentionally excluded because browsers don't display
  HEIC. If you want that shot on the page, export it to JPG/PNG and add it to `images/`.
