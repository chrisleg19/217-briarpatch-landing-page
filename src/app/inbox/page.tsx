"use client";

import { useEffect, useState, useCallback } from "react";
import { Sparkles, Send, RefreshCw, XCircle, CheckCircle2, MailOpen } from "lucide-react";
import { StatusBanner, useAppStatus } from "@/components/StatusBanner";
import { timeAgo } from "@/lib/format";
import type { EmailMessage, ReplyDraft } from "@/lib/types";

type EmailWithStatus = EmailMessage & { draftStatus: string | null };

export default function InboxPage() {
  const status = useAppStatus();
  const [emails, setEmails] = useState<EmailWithStatus[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [leadsOnly, setLeadsOnly] = useState(true);

  const loadEmails = useCallback(() => {
    setLoading(true);
    fetch(`/api/emails?leadsOnly=${leadsOnly}`)
      .then((r) => r.json())
      .then((d) => {
        setEmails(d.emails ?? []);
        setSelectedId((prev) => prev ?? d.emails?.[0]?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, [leadsOnly]);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  const selected = emails.find((e) => e.id === selectedId) ?? null;

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Inbox</p>
          <h1 className="text-3xl text-forest">Email review</h1>
          <p className="mt-1 text-sm text-ink-soft">
            AI drafts a reply only for emails that need one. Review, then send or edit and send.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={leadsOnly}
              onChange={(e) => setLeadsOnly(e.target.checked)}
              className="accent-brass"
            />
            Leads only
          </label>
          <button onClick={loadEmails} className="btn-ghost">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </header>

      <StatusBanner status={status} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,340px)_1fr]">
        <div className="card max-h-[70vh] overflow-y-auto">
          {loading ? (
            <p className="p-6 text-center text-sm text-ink-soft">Loading emails...</p>
          ) : emails.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-soft">No emails found.</p>
          ) : (
            <ul className="divide-y divide-line">
              {emails.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => setSelectedId(e.id)}
                    className={`w-full px-4 py-3 text-left transition-colors ${
                      selectedId === e.id ? "bg-cream-alt" : "hover:bg-cream"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm ${
                          e.unread ? "font-semibold text-ink" : "text-ink-soft"
                        }`}
                      >
                        {e.fromName}
                      </span>
                      <span className="shrink-0 text-xs text-ink-soft">
                        {timeAgo(e.receivedAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-ink">{e.subject}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {e.draftStatus === "sent" && (
                        <span className="pill bg-green-100 text-green-700">replied</span>
                      )}
                      {e.draftStatus === "dismissed" && (
                        <span className="pill bg-cream-alt text-ink-soft">dismissed</span>
                      )}
                      {!e.needsResponse && (
                        <span className="pill bg-cream-alt text-ink-soft">no reply needed</span>
                      )}
                      {e.needsResponse && !e.draftStatus && (
                        <span className="pill bg-brass/15 text-brass">needs reply</span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {selected ? (
            <EmailDetail
              key={selected.id}
              email={selected}
              aiEnabled={status?.aiEnabled ?? false}
              onSent={() => {
                loadEmails();
              }}
              onDismissed={() => {
                loadEmails();
              }}
            />
          ) : (
            <div className="card flex h-full items-center justify-center p-10 text-sm text-ink-soft">
              Select an email to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmailDetail({
  email,
  aiEnabled,
  onSent,
  onDismissed,
}: {
  email: EmailWithStatus;
  aiEnabled: boolean;
  onSent: () => void;
  onDismissed: () => void;
}) {
  const [draft, setDraft] = useState<ReplyDraft | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const generateDraft = useCallback(async () => {
    setDrafting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/emails/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId: email.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ kind: "err", text: data.error ?? "Could not draft a reply." });
        return;
      }
      setDraft(data.draft);
    } catch {
      setMessage({ kind: "err", text: "Could not draft a reply." });
    } finally {
      setDrafting(false);
    }
  }, [email.id]);

  // Auto-draft when opening an email that needs a response and has no reply yet.
  useEffect(() => {
    setDraft(null);
    setMessage(null);
    if (email.needsResponse && email.draftStatus !== "sent") {
      generateDraft();
    }
  }, [email.id, email.needsResponse, email.draftStatus, generateDraft]);

  async function send() {
    if (!draft) return;
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailId: email.id,
          threadId: email.threadId,
          to: draft.to,
          subject: draft.subject,
          body: draft.body,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ kind: "err", text: data.error ?? "Failed to send." });
        return;
      }
      setMessage({ kind: "ok", text: "Reply sent." });
      onSent();
    } catch {
      setMessage({ kind: "err", text: "Failed to send." });
    } finally {
      setSending(false);
    }
  }

  async function dismiss() {
    await fetch("/api/emails/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailId: email.id }),
    });
    onDismissed();
  }

  return (
    <div className="card p-5">
      <div className="border-b border-line pb-4">
        <h2 className="text-2xl text-forest">{email.subject}</h2>
        <p className="mt-1 text-sm text-ink-soft">
          From <strong className="text-ink">{email.fromName}</strong> &lt;{email.fromEmail}&gt; ·{" "}
          {timeAgo(email.receivedAt)}
        </p>
      </div>

      <div className="max-h-56 overflow-y-auto whitespace-pre-wrap py-4 text-sm leading-relaxed text-ink">
        {email.body}
      </div>

      {!email.needsResponse ? (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-line bg-cream-alt/60 px-4 py-3 text-sm text-ink-soft">
          <MailOpen size={18} className="text-brass" />
          This looks like a notification or newsletter, so no reply was drafted.
        </div>
      ) : (
        <div className="mt-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg text-forest">
              <Sparkles size={18} className="text-brass" />
              {draft?.source === "template" ? "Suggested reply" : "AI-drafted reply"}
            </h3>
            <button onClick={generateDraft} disabled={drafting} className="btn-ghost">
              <RefreshCw size={16} className={drafting ? "animate-spin" : ""} />
              {drafting ? "Drafting..." : "Regenerate"}
            </button>
          </div>

          {!aiEnabled && (
            <p className="mb-2 text-xs text-ink-soft">
              Using a built-in template. Add a Gemini API key to enable AI-written drafts.
            </p>
          )}

          <textarea
            value={draft?.body ?? ""}
            onChange={(e) =>
              setDraft((d) => (d ? { ...d, body: e.target.value, status: "edited" } : d))
            }
            placeholder={drafting ? "Drafting a reply..." : "Your reply..."}
            rows={10}
            className="w-full resize-y rounded-lg border border-line bg-white p-3 text-sm leading-relaxed text-ink focus:border-brass focus:outline-none"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={send} disabled={sending || !draft?.body} className="btn-primary">
              <Send size={16} /> {sending ? "Sending..." : "Send reply"}
            </button>
            <span className="text-xs text-ink-soft">
              Edit the text above first if you like, then send.
            </span>
            <button onClick={dismiss} className="btn-ghost ml-auto">
              <XCircle size={16} /> Dismiss
            </button>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm ${
            message.kind === "ok"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.kind === "ok" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {message.text}
        </div>
      )}
    </div>
  );
}
