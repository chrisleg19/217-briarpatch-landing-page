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

This is a standalone web app (its own repository, its own website). It shares a
forest-green + brass visual style but is fully independent of any other site.

---

## Try it right now (demo mode)

You do **not** need any accounts or keys to see how it works. Out of the box the
app runs in **demo mode** with realistic sample data.

```bash
npm install
npm run dev
```

Open http://localhost:3000 and click around. A gold banner reminds you it is
demo data. As soon as you add real Google credentials (below), the same screens
switch to your live inbox, forms, and calendar automatically.

---

## Going live - one-time setup

You only do this once. Fill in whatever you have; anything you skip just stays in
demo/simulated mode for that feature. Copy `.env.example` to `.env.local` and add
values as you go.

### 1. Google sign-in (required for live data)

This lets the app read your Gmail, send replies, read your calendar, and read
your form responses - all as you.

1. Go to https://console.cloud.google.com/ and create a project (e.g.
   "LLG Marketing Ops").
2. In **APIs & Services > Library**, enable: **Gmail API**, **Google Calendar
   API**, **Google Forms API**, and **Google Sheets API**.
3. In **APIs & Services > OAuth consent screen**: choose **External**, fill in the
   app name and your email, and **add your own email as a Test user**. Keep it in
   **Testing** mode - because it is just you, you do not need Google's long
   verification review.
4. In **APIs & Services > Credentials**, create an **OAuth client ID** of type
   **Web application**. Add these Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for local testing)
   - `https://YOUR-DEPLOYED-URL/api/auth/callback/google` (after you deploy)
5. Copy the **Client ID** and **Client secret** into `.env.local`:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```
6. Generate a session secret and add it:
   ```bash
   openssl rand -base64 32
   ```
   ```
   AUTH_SECRET=the-value-above
   AUTH_URL=http://localhost:3000
   NEXTAUTH_URL=http://localhost:3000
   ```

Restart the app, click **Sign in with Google**, and approve the permissions.
(You may see an "unverified app" screen because it is in Testing mode - click
**Advanced > Go to ...** to continue. That is expected for a private, single-user app.)

### 2. AI-written replies (optional but recommended)

Without this, the app still writes replies using a built-in template. With it,
replies are tailored by Google's Gemini AI.

1. Get a free key at https://aistudio.google.com/app/apikey
2. Add it:
   ```
   GEMINI_API_KEY=...
   ```

### 3. Your Google Form responses (optional)

So real submissions show up under **Form responses**:

- **Easiest:** open your Form's responses, click the Google Sheets icon to link a
  sheet, then copy the sheet ID from its URL
  (`/spreadsheets/d/THIS_PART/edit`) into `RESPONSES_SHEET_ID`.
- **Or** use the Form directly: copy the form ID from its edit URL into
  `GOOGLE_FORM_ID`.

### 4. Showings booking link (optional)

In Google Calendar, create an **Appointment schedule** with your available
showing times. Copy its public booking page URL into `BOOKING_LINK`. The
**Showings** page will show it (with copy/open buttons) and list who has booked.

### 5. Texting prospects (optional)

To send real SMS (otherwise texts are simulated):

1. Create a Twilio account at https://console.twilio.com and get a phone number.
2. Add:
   ```
   TWILIO_ACCOUNT_SID=...
   TWILIO_AUTH_TOKEN=...
   TWILIO_FROM_NUMBER=+1XXXXXXXXXX
   LOCKBOX_CODE=1234
   ```

### 6. Remembering what you replied to (optional)

Without this, "replied / dismissed" status is remembered only for the current
session. To keep it permanently, create a free Supabase project
(https://supabase.com), then in its SQL editor run:

```sql
create table draft_status (
  email_id text primary key,
  status text not null,
  updated_at timestamptz default now()
);
```

Add to `.env.local`:
```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Deploying (Vercel, free)

1. Push this repository to GitHub.
2. At https://vercel.com, **New Project > Import** this repository. Leave the
   **Root Directory** as the default (this project is at the repo root).
3. Add all the variables from your `.env.local` under **Settings > Environment
   Variables**. Set `AUTH_URL` and `NEXTAUTH_URL` to your Vercel URL.
4. Back in Google Cloud Credentials, add
   `https://YOUR-VERCEL-URL/api/auth/callback/google` to the redirect URIs.
5. Deploy. Visit the URL and sign in.

This app is completely standalone - it has its own repository and its own
website, independent of any other site you run.

---

## How it decides to draft a reply

Only **inbound prospect emails** get an AI draft. The app skips anything from
no-reply / newsletter / mailer-daemon senders and anything that doesn't look
like a genuine inquiry, so you never send an AI reply to a notification. You can
always regenerate, edit, or dismiss a draft.

## Environment variables

See `.env.example` for the full annotated list.

## Tech

Next.js (App Router) + TypeScript + Tailwind, Auth.js (Google OAuth),
`googleapis` (Gmail/Calendar/Forms/Sheets), Gemini for drafting, Twilio for SMS,
optional Supabase for persistence. Everything degrades gracefully to demo/
simulated behavior when a given integration isn't configured.
