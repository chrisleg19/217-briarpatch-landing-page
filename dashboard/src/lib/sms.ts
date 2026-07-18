import { businessContext, env, hasTwilio, isDemoMode } from "./config";

// Sends SMS to prospects (e.g. lock box access info) via Twilio's REST API.
// Uses fetch directly to avoid a heavy SDK dependency. Falls back to a
// simulated send in demo mode or when Twilio is not configured.

export function buildLockboxMessage(prospectName?: string): string {
  const greeting = prospectName ? `Hi ${prospectName.split(" ")[0]}, ` : "Hi, ";
  const codeLine = businessContext.lockboxCode
    ? `The lock box code is ${businessContext.lockboxCode}.`
    : "The lock box code is [ADD CODE].";
  return [
    `${greeting}this is ${businessContext.agentName} with ${businessContext.businessName}.`,
    `Here is the self-showing info for ${businessContext.propertyAddress}:`,
    codeLine,
    "The lock box is on the front door. Please lock up and return the key when you leave.",
    `Any questions, call/text ${businessContext.agentPhone}. Enjoy the tour!`,
  ].join(" ");
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`; // assume US
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits;
}

export async function sendSms(params: {
  to: string;
  body: string;
}): Promise<{ ok: boolean; sid?: string; simulated?: boolean; error?: string }> {
  const to = normalizePhone(params.to);
  if (!to) return { ok: false, error: "A valid phone number is required." };

  if (isDemoMode() || !hasTwilio()) {
    // Simulated send: nothing is actually texted.
    return { ok: true, simulated: true, sid: `demo-sms-${Date.now()}` };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.twilioAccountSid}/Messages.json`;
  const auth = Buffer.from(`${env.twilioAccountSid}:${env.twilioAuthToken}`).toString("base64");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: to,
      From: env.twilioFromNumber,
      Body: params.body,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return { ok: false, error: `Twilio error (${res.status}): ${detail.slice(0, 200)}` };
  }
  const data = (await res.json()) as { sid?: string };
  return { ok: true, sid: data.sid };
}
