"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare, Send, CheckCircle2, XCircle, KeyRound } from "lucide-react";
import { StatusBanner, useAppStatus } from "@/components/StatusBanner";

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesInner />
    </Suspense>
  );
}

function MessagesInner() {
  const status = useAppStatus();
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Pre-fill from a lead if we arrived from the Form Responses page.
  useEffect(() => {
    const n = params.get("name") ?? "";
    const p = params.get("phone") ?? "";
    setName(n);
    setPhone(p);
  }, [params]);

  // Load a suggested lock box message from the server (uses configured code).
  useEffect(() => {
    fetch(`/api/sms?name=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((d) => setBody(d.message ?? ""))
      .catch(() => {});
  }, [name]);

  async function send() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ kind: "err", text: data.error ?? "Failed to send text." });
        return;
      }
      setResult({
        kind: "ok",
        text: data.simulated
          ? "Text simulated (demo mode / SMS not configured). Nothing was actually sent."
          : "Text message sent.",
      });
    } catch {
      setResult({ kind: "err", text: "Failed to send text." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow">SMS</p>
        <h1 className="text-3xl text-forest">Text a prospect</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Send lock box and self-showing details straight to a prospect&apos;s phone.
        </p>
      </header>

      <StatusBanner status={status} />

      {status && !status.smsEnabled && !status.demoMode && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-brass/40 bg-brass/10 px-4 py-3 text-sm text-ink">
          <KeyRound size={18} className="text-brass" />
          Texting is not configured yet. Add your Twilio credentials in settings to send real
          messages. Until then, sends are simulated.
        </div>
      )}

      <div className="card max-w-2xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-ink-soft">Prospect name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tasha Coleman"
              className="mt-1 w-full rounded-lg border border-line bg-white p-2.5 text-sm focus:border-brass focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-soft">Mobile number</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. (770) 555-0148"
              className="mt-1 w-full rounded-lg border border-line bg-white p-2.5 text-sm focus:border-brass focus:outline-none"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-ink-soft">Message</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={7}
            className="mt-1 w-full resize-y rounded-lg border border-line bg-white p-3 text-sm leading-relaxed focus:border-brass focus:outline-none"
          />
        </label>
        <p className="mt-1 text-xs text-ink-soft">{body.length} characters</p>

        {status && !status.lockboxConfigured && (
          <p className="mt-2 text-xs text-ink-soft">
            Tip: set <code>LOCKBOX_CODE</code> in settings so the code fills in automatically.
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button onClick={send} disabled={sending || !phone || !body} className="btn-brass">
            <Send size={16} /> {sending ? "Sending..." : "Send text"}
          </button>
          <span className="flex items-center gap-1 text-xs text-ink-soft">
            <MessageSquare size={14} /> Delivered via SMS
          </span>
        </div>

        {result && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm ${
              result.kind === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {result.kind === "ok" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {result.text}
          </div>
        )}
      </div>
    </div>
  );
}
