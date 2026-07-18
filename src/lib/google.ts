import { google } from "googleapis";
import { auth } from "./auth";

// Build an OAuth2 client from the signed-in user's current access token.
// Returns null when there is no authenticated Google session, in which case
// callers fall back to demo data.
export async function getGoogleAuthClient() {
  const session = await auth();
  const accessToken = session?.accessToken;
  if (!accessToken) return null;

  const oauth2 = new google.auth.OAuth2();
  oauth2.setCredentials({ access_token: accessToken });
  return oauth2;
}

export async function getGmailClient() {
  const authClient = await getGoogleAuthClient();
  if (!authClient) return null;
  return google.gmail({ version: "v1", auth: authClient });
}

export async function getCalendarClient() {
  const authClient = await getGoogleAuthClient();
  if (!authClient) return null;
  return google.calendar({ version: "v3", auth: authClient });
}

export async function getFormsClient() {
  const authClient = await getGoogleAuthClient();
  if (!authClient) return null;
  return google.forms({ version: "v1", auth: authClient });
}

export async function getSheetsClient() {
  const authClient = await getGoogleAuthClient();
  if (!authClient) return null;
  return google.sheets({ version: "v4", auth: authClient });
}
