"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Mail, Phone, MessageSquare, ChevronDown } from "lucide-react";
import { StatusBanner, useAppStatus } from "@/components/StatusBanner";
import { timeAgo } from "@/lib/format";
import type { FormResponse } from "@/lib/types";

export default function LeadsPage() {
  const status = useAppStatus();
  const [leads, setLeads] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => setLeads(d.leads ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Pre-screening</p>
          <h1 className="text-3xl text-forest">Form responses</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Every submission from your Google pre-screening form, newest first.
          </p>
        </div>
        <button onClick={load} className="btn-ghost">
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <StatusBanner status={status} />

      {loading ? (
        <p className="py-10 text-center text-sm text-ink-soft">Loading responses...</p>
      ) : leads.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-soft">
          No form responses yet. New submissions to your Google Form will appear here.
        </div>
      ) : (
        <div className="grid gap-4">
          {leads.map((lead) => (
            <article key={lead.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl text-forest">{lead.name}</h2>
                    {lead.isNew && (
                      <span className="pill bg-green-100 text-green-700">new</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    Submitted {timeAgo(lead.submittedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="btn-ghost">
                      <Mail size={16} /> Email
                    </a>
                  )}
                  {lead.phone && (
                    <>
                      <a href={`tel:${lead.phone}`} className="btn-ghost">
                        <Phone size={16} /> Call
                      </a>
                      <Link
                        href={`/messages?name=${encodeURIComponent(lead.name)}&phone=${encodeURIComponent(lead.phone)}`}
                        className="btn-brass"
                      >
                        <MessageSquare size={16} /> Text lock box
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Fact label="Move-in" value={lead.desiredMoveIn} />
                <Fact label="Income" value={lead.income} />
                <Fact label="Pets" value={lead.pets} />
                <Fact label="Phone" value={lead.phone} />
              </div>

              <button
                onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                className="mt-4 inline-flex items-center gap-1 text-sm text-brass hover:underline"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform ${expanded === lead.id ? "rotate-180" : ""}`}
                />
                {expanded === lead.id ? "Hide full response" : "See full response"}
              </button>

              {expanded === lead.id && (
                <dl className="mt-3 divide-y divide-line border-t border-line">
                  {lead.answers.map((a, i) => (
                    <div key={i} className="grid grid-cols-1 gap-1 py-2 md:grid-cols-3">
                      <dt className="text-sm font-medium text-ink-soft">{a.question}</dt>
                      <dd className="text-sm text-ink md:col-span-2">{a.answer || "-"}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-line bg-cream-alt/40 p-3">
      <p className="text-xs uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value || "-"}</p>
    </div>
  );
}
