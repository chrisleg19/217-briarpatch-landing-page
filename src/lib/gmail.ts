import type { gmail_v1 } from "googleapis";
import { getGmailClient } from "./google";
import { isDemoMode } from "./config";
import { demoEmails } from "./demo";
import type { EmailMessage } from "./types";

// Keywords that suggest an inbound email is a prospective-tenant lead rather
// than an automated notification or newsletter.
const LEAD_KEYWORDS = [
  "available",
  "showing",
  "tour",
  "rent",
  "lease",
  "apply",
  "application",
  "pet",
  "deposit",
  "move",
  "briarpatch",
  "interested",
  "viewing",
  "schedule",
];

const NON_LEAD_SENDERS = ["no-reply", "noreply", "newsletter", "notification", "mailer-daemon"];

function decodeBase64Url(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

// Recursively pull the best text body from a Gmail message payload.
function extractBody(payload: gmail_v1.Schema$MessagePart | undefined): string {
  if (!payload) return "";
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  const parts = payload.parts ?? [];
  // Prefer text/plain, then text/html, then anything.
  const plain = parts.find((p) => p.mimeType === "text/plain");
  if (plain?.body?.data) return decodeBase64Url(plain.body.data);
  const html = parts.find((p) => p.mimeType === "text/html");
  if (html?.body?.data) {
    return decodeBase64Url(html.body.data)
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+\n/g, "\n")
      .trim();
  }
  for (const part of parts) {
    const nested = extractBody(part);
    if (nested) return nested;
  }
  return "";
}

function header(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string): string {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function parseFrom(from: string): { name: string; email: string } {
  const match = from.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/);
  if (match) {
    return { name: match[1].trim() || match[2].trim(), email: match[2].trim() };
  }
  return { name: from.trim(), email: from.trim() };
}

function isAutomatedSender(fromEmail: string): boolean {
  return NON_LEAD_SENDERS.some((s) => fromEmail.toLowerCase().includes(s));
}

function classifyLead(fromEmail: string, subject: string, snippet: string): boolean {
  if (isAutomatedSender(fromEmail)) return false;
  const haystack = `${subject} ${snippet}`.toLowerCase();
  return LEAD_KEYWORDS.some((k) => haystack.includes(k));
}

// Whether the app should offer to draft a reply. Only inbound prospect emails
// (leads) from real, non-automated senders warrant a response; newsletters,
// no-reply notifications, and mailer-daemon messages never get drafts.
function classifyNeedsResponse(fromEmail: string, isLead: boolean, unread: boolean): boolean {
  if (isAutomatedSender(fromEmail)) return false;
  return isLead && unread ? true : isLead;
}

function toEmailMessage(msg: gmail_v1.Schema$Message): EmailMessage {
  const headers = msg.payload?.headers;
  const from = header(headers, "From");
  const { name: fromName, email: fromEmail } = parseFrom(from);
  const subject = header(headers, "Subject");
  const dateHeader = header(headers, "Date");
  const snippet = msg.snippet ?? "";
  const labels = msg.labelIds ?? [];
  const unread = labels.includes("UNREAD");
  const isLead = classifyLead(fromEmail, subject, snippet);
  return {
    id: msg.id ?? "",
    threadId: msg.threadId ?? "",
    from,
    fromName,
    fromEmail,
    to: header(headers, "To"),
    subject,
    snippet,
    body: extractBody(msg.payload) || snippet,
    receivedAt: dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString(),
    unread,
    isLead,
    needsResponse: classifyNeedsResponse(fromEmail, isLead, unread),
    labels,
  };
}

export interface FetchEmailsOptions {
  leadsOnly?: boolean;
  max?: number;
}

export async function fetchEmails(options: FetchEmailsOptions = {}): Promise<EmailMessage[]> {
  const { leadsOnly = false, max = 25 } = options;

  if (isDemoMode()) {
    const list = leadsOnly ? demoEmails.filter((e) => e.isLead) : demoEmails;
    return list.slice(0, max);
  }

  const gmail = await getGmailClient();
  if (!gmail) return [];

  const list = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX"],
    maxResults: max,
  });
  const ids = (list.data.messages ?? []).map((m) => m.id!).filter(Boolean);

  const messages = await Promise.all(
    ids.map(async (id) => {
      const full = await gmail.users.messages.get({ userId: "me", id, format: "full" });
      return toEmailMessage(full.data);
    })
  );

  const parsed = messages.filter(Boolean);
  return leadsOnly ? parsed.filter((m) => m.isLead) : parsed;
}

export async function getEmail(id: string): Promise<EmailMessage | null> {
  if (isDemoMode()) {
    return demoEmails.find((e) => e.id === id) ?? null;
  }
  const gmail = await getGmailClient();
  if (!gmail) return null;
  const full = await gmail.users.messages.get({ userId: "me", id, format: "full" });
  return toEmailMessage(full.data);
}

export async function markAsRead(id: string): Promise<void> {
  if (isDemoMode()) return;
  const gmail = await getGmailClient();
  if (!gmail) return;
  await gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: { removeLabelIds: ["UNREAD"] },
  });
}

// Build an RFC 2822 message and send it as a reply within the same thread.
export async function sendReply(params: {
  threadId: string;
  to: string;
  subject: string;
  body: string;
  inReplyToMessageId?: string;
}): Promise<{ ok: boolean; id?: string }> {
  const { threadId, to, subject, body } = params;

  if (isDemoMode()) {
    // Simulate a successful send without touching a real mailbox.
    return { ok: true, id: `demo-sent-${Date.now()}` };
  }

  const gmail = await getGmailClient();
  if (!gmail) return { ok: false };

  const replySubject = subject.toLowerCase().startsWith("re:") ? subject : `Re: ${subject}`;
  const raw = [
    `To: ${to}`,
    `Subject: ${replySubject}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    body,
  ].join("\r\n");

  const encoded = Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encoded, threadId },
  });
  return { ok: true, id: res.data.id ?? undefined };
}
