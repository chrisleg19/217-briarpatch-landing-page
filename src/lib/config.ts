// Central place to read environment configuration and decide whether the app
// runs against live Google/Gemini/Supabase services or in self-contained
// "demo mode" with realistic sample data.
//
// Demo mode lets the dashboard be opened and clicked through immediately -
// before any Google Cloud / Supabase / Gemini setup is done - so you can see
// exactly what it does. As soon as real credentials are added, the same
// screens switch to your live data automatically.

export const env = {
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  authSecret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
  supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "",
  // Property / business context used to steer AI drafts and confirmations.
  businessName: process.env.BUSINESS_NAME ?? "Legette Legacy Group LLC",
  agentName: process.env.AGENT_NAME ?? "LLG Leasing",
  agentPhone: process.env.AGENT_PHONE ?? "404-590-0295",
  propertyAddress: process.env.PROPERTY_ADDRESS ?? "217 Briarpatch Ct, Stockbridge, GA 30281",
  propertyRent: process.env.PROPERTY_RENT ?? "$1,900/month",
  formId: process.env.GOOGLE_FORM_ID ?? "",
  responsesSheetId: process.env.RESPONSES_SHEET_ID ?? "",
  showingCalendarId: process.env.SHOWING_CALENDAR_ID ?? "primary",
  // Google Calendar appointment-schedule link prospects use to self-book showings.
  bookingLink: process.env.BOOKING_LINK ?? "",
  // Twilio for sending SMS (e.g. lock box info) to prospects.
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? "",
  twilioFromNumber: process.env.TWILIO_FROM_NUMBER ?? "",
  // Lock box details used to pre-fill the SMS to a prospect.
  lockboxCode: process.env.LOCKBOX_CODE ?? "",
  // Explicit override: set DEMO_MODE=true to force sample data even if creds exist,
  // or DEMO_MODE=false to force live mode.
  demoModeOverride: process.env.DEMO_MODE,
};

export function hasGoogleAuth(): boolean {
  return Boolean(env.googleClientId && env.googleClientSecret && env.authSecret);
}

export function hasGemini(): boolean {
  return Boolean(env.geminiApiKey);
}

export function hasSupabase(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseKey);
}

export function hasTwilio(): boolean {
  return Boolean(env.twilioAccountSid && env.twilioAuthToken && env.twilioFromNumber);
}

// Demo mode is on when explicitly requested, or when Google auth is not yet
// configured (so the app is still fully viewable out of the box).
export function isDemoMode(): boolean {
  if (env.demoModeOverride === "true") return true;
  if (env.demoModeOverride === "false") return false;
  return !hasGoogleAuth();
}

export const businessContext = {
  businessName: env.businessName,
  agentName: env.agentName,
  agentPhone: env.agentPhone,
  propertyAddress: env.propertyAddress,
  propertyRent: env.propertyRent,
  bookingLink: env.bookingLink,
  lockboxCode: env.lockboxCode,
};
