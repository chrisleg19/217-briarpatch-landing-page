import { GoogleGenerativeAI } from "@google/generative-ai";
import { businessContext, env, hasGemini } from "./config";
import type { EmailMessage, ReplyDraft } from "./types";

function buildPrompt(email: EmailMessage): string {
  return [
    `You are the friendly, professional leasing assistant for ${businessContext.businessName}.`,
    `You reply to prospective tenants about the rental property at ${businessContext.propertyAddress}, listed at ${businessContext.propertyRent}.`,
    "",
    "Write a concise, warm, professional reply to the email below.",
    "Guidelines:",
    "- Answer the prospect's questions directly and helpfully.",
    "- Keep it fair-housing compliant: describe the property and process, never comment on the person or protected characteristics.",
    "- If they ask to see the home, offer to schedule a showing and invite them to share their availability.",
    `- If they have not applied yet, gently point them to the pre-screening form and the RentSpree application.`,
    `- Sign off as "${businessContext.agentName}" with phone ${businessContext.agentPhone}.`,
    "- Do not invent specific facts (exact deposit, fees) unless they are provided; if unsure, say you will confirm.",
    "- Return ONLY the email body text, no subject line and no explanations.",
    "",
    `From: ${email.fromName} <${email.fromEmail}>`,
    `Subject: ${email.subject}`,
    "Message:",
    email.body,
  ].join("\n");
}

// Deterministic template used when no Gemini key is configured (or as a
// graceful fallback if the AI call fails). Keeps the app fully functional
// without an AI key.
function templateDraft(email: EmailMessage): string {
  const firstName = email.fromName.split(" ")[0] || "there";
  return [
    `Hi ${firstName},`,
    "",
    `Thank you for your interest in ${businessContext.propertyAddress}. We're happy to help.`,
    "",
    "To move forward, the next steps are:",
    "1. Complete our quick pre-screening form (linked on the listing page).",
    "2. Let us know a few days/times that work for a showing and we'll get you scheduled.",
    "",
    "If you have any questions in the meantime, just reply here and we'll be glad to answer.",
    "",
    "Warm regards,",
    `${businessContext.agentName}`,
    `${businessContext.agentPhone}`,
  ].join("\n");
}

export async function draftReply(email: EmailMessage): Promise<ReplyDraft> {
  const base: Omit<ReplyDraft, "body" | "source"> = {
    emailId: email.id,
    threadId: email.threadId,
    to: email.fromEmail,
    subject: email.subject.toLowerCase().startsWith("re:") ? email.subject : `Re: ${email.subject}`,
    status: "suggested",
    generatedAt: new Date().toISOString(),
  };

  if (!hasGemini()) {
    return { ...base, body: templateDraft(email), source: "template" };
  }

  try {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: env.geminiModel });
    const result = await model.generateContent(buildPrompt(email));
    const text = result.response.text().trim();
    if (!text) throw new Error("Empty AI response");
    return { ...base, body: text, source: "ai" };
  } catch {
    // Fall back to the template so the reviewer always has something to send.
    return { ...base, body: templateDraft(email), source: "template" };
  }
}
