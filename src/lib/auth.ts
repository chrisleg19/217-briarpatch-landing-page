import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { env, hasGoogleAuth } from "./config";

// Scopes requested from Google. Kept as narrow as practical:
// - gmail.modify: read messages and mark them read/labelled
// - gmail.send: send replies
// - calendar: view and create showing events
// - forms.responses.readonly + spreadsheets.readonly: read pre-screening responses
const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/forms.responses.readonly",
  "https://www.googleapis.com/auth/spreadsheets.readonly",
].join(" ");

async function refreshGoogleAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAt: number;
} | null> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token: string; expires_in: number };
    return {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
  } catch {
    return null;
  }
}

// A dev-only fallback secret so NextAuth can initialise even before you set
// AUTH_SECRET. Never used in production because there hasGoogleAuth() is true
// and a real AUTH_SECRET is required.
const fallbackSecret = "demo-mode-insecure-secret-set-AUTH_SECRET-before-production";

const providers = hasGoogleAuth()
  ? [
      Google({
        clientId: env.googleClientId,
        clientSecret: env.googleClientSecret,
        authorization: {
          params: {
            scope: GOOGLE_SCOPES,
            access_type: "offline",
            prompt: "consent",
          },
        },
      }),
    ]
  : [];

export const authConfig: NextAuthConfig = {
  secret: env.authSecret || fallbackSecret,
  trustHost: true,
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: persist tokens from Google.
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token ?? token.refreshToken;
        token.expiresAt = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
        return token;
      }

      // Return existing token if it is still valid.
      if (token.expiresAt && Date.now() < (token.expiresAt as number) - 60_000) {
        return token;
      }

      // Otherwise try to refresh.
      if (token.refreshToken) {
        const refreshed = await refreshGoogleAccessToken(token.refreshToken as string);
        if (refreshed) {
          token.accessToken = refreshed.accessToken;
          token.expiresAt = refreshed.expiresAt;
        } else {
          token.error = "RefreshFailed";
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as string | undefined;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
