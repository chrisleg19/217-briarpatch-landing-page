import type { forms_v1 } from "googleapis";
import { getFormsClient, getSheetsClient } from "./google";
import { env, isDemoMode } from "./config";
import { demoFormResponses } from "./demo";
import type { FormResponse } from "./types";

const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;

function isRecent(iso: string): boolean {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && Date.now() - t < NEW_WINDOW_MS;
}

function pick(obj: Record<string, string>, keys: string[]): string {
  for (const k of Object.keys(obj)) {
    const lower = k.toLowerCase();
    if (keys.some((needle) => lower.includes(needle))) return obj[k];
  }
  return "";
}

// Preferred path: read from the Google Sheet that a Form is linked to. This is
// the most reliable way to get all historical responses with named columns.
async function fetchFromSheet(): Promise<FormResponse[] | null> {
  const sheets = await getSheetsClient();
  if (!sheets || !env.responsesSheetId) return null;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: env.responsesSheetId,
    range: "A1:Z1000",
  });
  const rows = res.data.values ?? [];
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => String(h));
  return rows.slice(1).map((row, i) => {
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = row[idx] != null ? String(row[idx]) : "";
    });
    const timestamp = pick(record, ["timestamp", "date"]) || new Date().toISOString();
    const submittedAt = new Date(timestamp).toString() === "Invalid Date"
      ? new Date().toISOString()
      : new Date(timestamp).toISOString();
    return {
      id: `sheet-${i}`,
      submittedAt,
      name: pick(record, ["name"]) || "Unknown",
      email: pick(record, ["email"]),
      phone: pick(record, ["phone", "number"]),
      desiredMoveIn: pick(record, ["move"]),
      income: pick(record, ["income"]),
      pets: pick(record, ["pet"]),
      isNew: isRecent(submittedAt),
      answers: headers
        .filter((h) => !/timestamp/i.test(h))
        .map((h) => ({ question: h, answer: record[h] })),
    } satisfies FormResponse;
  });
}

// Fallback path: read directly from the Forms API and map question IDs to titles.
async function fetchFromForms(): Promise<FormResponse[] | null> {
  const forms = await getFormsClient();
  if (!forms || !env.formId) return null;

  const form = await forms.forms.get({ formId: env.formId });
  const questionTitleById = new Map<string, string>();
  for (const item of form.data.items ?? []) {
    const q = item.questionItem?.question;
    if (q?.questionId) questionTitleById.set(q.questionId, item.title ?? "Question");
  }

  const resp = await forms.forms.responses.list({ formId: env.formId });
  const responses: forms_v1.Schema$FormResponse[] = resp.data.responses ?? [];

  return responses.map((r, i) => {
    const answersMap: Record<string, string> = {};
    for (const [qid, ans] of Object.entries(r.answers ?? {})) {
      const title = questionTitleById.get(qid) ?? qid;
      const values = ans.textAnswers?.answers?.map((a) => a.value ?? "").join(", ") ?? "";
      answersMap[title] = values;
    }
    const submittedAt = r.lastSubmittedTime ?? r.createTime ?? new Date().toISOString();
    return {
      id: r.responseId ?? `resp-${i}`,
      submittedAt,
      name: pick(answersMap, ["name"]) || "Unknown",
      email: pick(answersMap, ["email"]),
      phone: pick(answersMap, ["phone", "number"]),
      desiredMoveIn: pick(answersMap, ["move"]),
      income: pick(answersMap, ["income"]),
      pets: pick(answersMap, ["pet"]),
      isNew: isRecent(submittedAt),
      answers: Object.entries(answersMap).map(([question, answer]) => ({ question, answer })),
    } satisfies FormResponse;
  });
}

export async function fetchFormResponses(): Promise<FormResponse[]> {
  if (isDemoMode()) {
    return [...demoFormResponses].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }

  // Prefer the linked Sheet, then the Forms API.
  const fromSheet = await fetchFromSheet();
  if (fromSheet) return fromSheet.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  const fromForms = await fetchFromForms();
  if (fromForms) return fromForms.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return [];
}
