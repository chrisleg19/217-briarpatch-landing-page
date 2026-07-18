# Marketing Operations Dashboard

A single web app that runs the day-to-day marketing operations for the rental
business (starting with **217 Briarpatch Ct**). It connects to your Google
account and puts everything on one screen:

- **Email review** - see prospect emails, get an AI-drafted reply for the ones
  that need a response, then **one-click Send** or **edit and send**. Newsletters
  and automated notifications never get a draft.
- **Form responses** - every submission from your Google pre-screening form,
  newest first, with new ones flagged.
- **Showings** - track which showings prospects have booked through your Google
  Calendar appointment link, and their status (bookings happen in Google, not here).
- **Text prospects** - send lock box / self-showing info to a prospect's phone by
  SMS with a pre-filled message.
- **Overview** - counts and recent activity for all of the above in one place.

This is a standalone web app (its own repository, its own website), fully
independent of any other site you run.

> **Demo mode:** with no accounts or keys configured, the app runs on realistic
> sample data so it is fully clickable out of the box. Each feature switches to
> your live data the moment you add that integration's credentials (see
> [Connecting real data sources](#connecting-real-data-sources)). A gold banner
> tells you when you are in demo mode.

---

## Table of contents

1. [Run and manage locally](#run-and-manage-locally)
2. [Access and manage on the web (Vercel)](#access-and-manage-on-the-web-vercel)
3. [Connecting real data sources](#connecting-real-data-sources)
4. [Where things live in the code](#where-things-live-in-the-code)
5. [How it decides to draft a reply](#how-it-decides-to-draft-a-reply)
6. [Tech](#tech)

---

## Run and manage locally

Use this to run the app on your own computer (great for testing before you deploy).

### First time

You need [Node.js](https://nodejs.org) (LTS or newer) and Git installed.

```bash
git clone --branch main https://github.com/chrisleg19/llg-marketing-ops.git marketing-ops
cd marketing-ops
npm install
npm run dev
```

Then open **http://localhost:3000**.

> On Windows (Command Prompt), clone somewhere **outside** OneDrive to avoid sync
> issues with `node_modules`, for example:
> ```bat
> cd C:\Users\leget
> git clone --branch main https://github.com/chrisleg19/llg-marketing-ops.git marketing-ops
> cd C:\Users\leget\marketing-ops
> npm install
> npm run dev
> ```

### Everyday commands

| Task | Command |
|------|---------|
| Start the app (dev) | `npm run dev` then open http://localhost:3000 |
| Stop the app | Press `Ctrl+C` in the terminal |
| Get the latest code | `git pull` |
| Re-install after code updates | `npm install` |
| Build a production copy | `npm run build` |
| Run the production build | `npm run start` |
| Check for code problems | `npm run lint` |

### Local settings (optional)

To connect real data locally, copy `.env.example` to a new file named
`.env.local` and fill in the values you have (see
[Connecting real data sources](#connecting-real-data-sources)). Restart
`npm run dev` after changing it. `.env.local` is git-ignored, so your secrets are
never committed.

---

## Access and manage on the web (Vercel)

Vercel gives the app a public URL and redeploys automatically whenever you push
to GitHub. The free plan is enough for solo use.

### First deploy

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2. **Add New… → Project → Import** the `llg-marketing-ops` repository.
3. Leave **Root Directory** as the default (the app is at the repo root).
4. (Optional now, can add later) Under **Environment Variables**, paste in the
   keys from [Connecting real data sources](#connecting-real-data-sources).
   With none set, it deploys in demo mode.
5. Click **Deploy**. After ~1 minute you get a live URL like
   `https://llg-marketing-ops.vercel.app`.

### Day-to-day management (Vercel dashboard)

- **Open the app:** your project's **Domains** shows the live URL. Bookmark it.
- **Ship changes:** just `git push` to `main`. Vercel rebuilds and redeploys
  automatically. Watch progress under **Deployments**.
- **Manage keys/settings:** **Settings → Environment Variables**. Add or edit a
  value, then **Redeploy** (Deployments → ⋯ → Redeploy) for it to take effect.
  Set `AUTH_URL` and `NEXTAUTH_URL` to your Vercel URL here.
- **See logs / debug:** open a deployment → **Functions** / **Logs** to see
  server errors (useful if a Google or Twilio call fails).
- **Roll back:** **Deployments →** pick a previous working one **→ Promote**.
- **Custom domain:** **Settings → Domains → Add** (e.g.
  `ops.legettelegacygroupllc.com`) and follow the DNS instructions. Then add the
  new domain's `/api/auth/callback/google` URL to Google (see below).

> Important: any time your web URL changes (first deploy or a new custom domain),
> update `AUTH_URL`/`NEXTAUTH_URL` in Vercel **and** add
> `https://YOUR-URL/api/auth/callback/google` to your Google OAuth redirect URIs,
> or Google sign-in will fail.

---

## Connecting real data sources

The app is built so you can turn on real data **one integration at a time**.
Anything you leave unset simply stays in demo/simulated mode for that feature.

**Where to put these values:**
- **Locally:** in `.env.local` (copy from `.env.example`).
- **On Vercel:** in **Settings → Environment Variables**, then redeploy.

**Recommended order:** start with Google sign-in (unlocks email, forms, calendar
at once), then add Gemini, then the booking link, then Twilio, then Supabase.

### At a glance

| Feature you want live | Env variables to set | Where to get them |
|-----------------------|----------------------|-------------------|
| Sign-in + Gmail + Calendar + Forms | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, `AUTH_URL`, `NEXTAUTH_URL` | Google Cloud Console |
| AI-written email drafts | `GEMINI_API_KEY` (`GEMINI_MODEL` optional) | Google AI Studio |
| Form responses feed | `RESPONSES_SHEET_ID` (or `GOOGLE_FORM_ID`) | Your Google Form / linked Sheet |
| Showings booking link | `BOOKING_LINK` (`SHOWING_CALENDAR_ID` optional) | Google Calendar appointment schedule |
| Real SMS to prospects | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `LOCKBOX_CODE` | Twilio Console |
| Remember replied/dismissed | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase project |
| Your business details | `BUSINESS_NAME`, `AGENT_NAME`, `AGENT_PHONE`, `PROPERTY_ADDRESS`, `PROPERTY_RENT` | You |

The app auto-detects live vs demo mode: as soon as the Google keys +
`AUTH_SECRET` are present it leaves demo mode (logic in
[`src/lib/config.ts`](src/lib/config.ts) → `isDemoMode()`). You can force either
mode with `DEMO_MODE=true` / `DEMO_MODE=false`.

### 1. Google sign-in (unlocks email, calendar, forms)

Lets the app read your Gmail, send replies, read your calendar, and read your
form responses - all as you.

1. Go to https://console.cloud.google.com/ and create a project (e.g. "LLG Marketing Ops").
2. **APIs & Services → Library**: enable **Gmail API**, **Google Calendar API**,
   **Google Forms API**, and **Google Sheets API**.
3. **APIs & Services → OAuth consent screen**: choose **External**, fill in the
   app name and your email, and **add your own email as a Test user**. Keep it in
   **Testing** mode - since it is just you, you do not need Google's long
   verification review.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**, type
   **Web application**. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local)
   - `https://YOUR-VERCEL-URL/api/auth/callback/google` (after deploy)
5. Put the values in your settings:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   AUTH_SECRET=<run: openssl rand -base64 32>
   AUTH_URL=http://localhost:3000        # or your Vercel URL
   NEXTAUTH_URL=http://localhost:3000    # or your Vercel URL
   ```

Restart the app, click **Sign in with Google**, approve the permissions. (An
"unverified app" screen is expected in Testing mode - click **Advanced → Go to…**.)
Used by [`src/lib/auth.ts`](src/lib/auth.ts) and [`src/lib/google.ts`](src/lib/google.ts).

### 2. AI-written replies (Gemini)

Without this, replies use a built-in template. With it, they are written by
Google's Gemini.

1. Free key at https://aistudio.google.com/app/apikey
2. Set `GEMINI_API_KEY=...` (optionally `GEMINI_MODEL=gemini-1.5-flash`).

Used by [`src/lib/gemini.ts`](src/lib/gemini.ts).

### 3. Google Form responses

So real submissions show under **Form responses**:

- **Easiest:** open your Form's responses, click the Google Sheets icon to link a
  sheet, then copy the sheet ID from its URL (`/spreadsheets/d/THIS_PART/edit`)
  into `RESPONSES_SHEET_ID`.
- **Or** use the Form API directly: copy the form ID from its edit URL into
  `GOOGLE_FORM_ID`.

Used by [`src/lib/forms.ts`](src/lib/forms.ts) (prefers the Sheet, falls back to the Form).

### 4. Showings booking link

In Google Calendar, create an **Appointment schedule** with your showing times.
Copy its public booking page URL into `BOOKING_LINK`. Set `SHOWING_CALENDAR_ID`
if your showings are on a calendar other than `primary`.

Used by [`src/lib/calendar.ts`](src/lib/calendar.ts) and shown on the Showings page.

### 5. Texting prospects (Twilio)

For real SMS (otherwise texts are simulated):

1. Create a Twilio account at https://console.twilio.com and get a phone number.
2. Set:
   ```
   TWILIO_ACCOUNT_SID=...
   TWILIO_AUTH_TOKEN=...
   TWILIO_FROM_NUMBER=+1XXXXXXXXXX
   LOCKBOX_CODE=1234
   ```

Used by [`src/lib/sms.ts`](src/lib/sms.ts).

### 6. Remembering replied/dismissed (Supabase)

Without this, "replied / dismissed" status lasts only for the current session.
To persist it, create a free Supabase project (https://supabase.com) and run in
its SQL editor:

```sql
create table draft_status (
  email_id text primary key,
  status text not null,
  updated_at timestamptz default now()
);
```

Then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Used by
[`src/lib/store.ts`](src/lib/store.ts).

See [`.env.example`](.env.example) for the full annotated list of variables.

---

## Where things live in the code

Handy map if you (or a developer) want to extend it:

| Area | File(s) |
|------|---------|
| Config + demo-mode switch | [`src/lib/config.ts`](src/lib/config.ts) |
| Sample/demo data | [`src/lib/demo.ts`](src/lib/demo.ts) |
| Google sign-in / tokens | [`src/lib/auth.ts`](src/lib/auth.ts), [`src/lib/google.ts`](src/lib/google.ts) |
| Gmail read/send | [`src/lib/gmail.ts`](src/lib/gmail.ts) |
| Gemini drafting | [`src/lib/gemini.ts`](src/lib/gemini.ts) |
| Forms/Sheets responses | [`src/lib/forms.ts`](src/lib/forms.ts) |
| Calendar/booking tracking | [`src/lib/calendar.ts`](src/lib/calendar.ts) |
| SMS (Twilio) | [`src/lib/sms.ts`](src/lib/sms.ts) |
| Persistence (Supabase) | [`src/lib/store.ts`](src/lib/store.ts) |
| API endpoints | [`src/app/api/`](src/app/api) |
| Screens (UI) | [`src/app/`](src/app) (`page.tsx`, `inbox`, `leads`, `calendar`, `messages`) |

---

## How it decides to draft a reply

Only **inbound prospect emails** get an AI draft. The app skips anything from
no-reply / newsletter / mailer-daemon senders and anything that doesn't look
like a genuine inquiry, so you never send an AI reply to a notification. You can
always regenerate, edit, or dismiss a draft. (Logic in
[`src/lib/gmail.ts`](src/lib/gmail.ts); the draft endpoint refuses non-response
emails.)

---

## Tech

Next.js (App Router) + TypeScript + Tailwind, Auth.js (Google OAuth),
`googleapis` (Gmail/Calendar/Forms/Sheets), Gemini for drafting, Twilio for SMS,
optional Supabase for persistence. Everything degrades gracefully to demo /
simulated behavior when a given integration isn't configured.
