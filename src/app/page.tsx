"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail,
  ClipboardList,
  CalendarCheck,
  Users,
  PenLine,
  ArrowRight,
} from "lucide-react";
import { StatusBanner, useAppStatus } from "@/components/StatusBanner";
import { timeAgo, formatDateTime } from "@/lib/format";
import type { OverviewPayload } from "@/lib/types";

const STAT_META = [
  { key: "newLeads", label: "New leads", icon: Users, href: "/leads" },
  { key: "unreadEmails", label: "Unread emails", icon: Mail, href: "/inbox" },
  { key: "draftsAwaitingReview", label: "Awaiting reply", icon: PenLine, href: "/inbox" },
  { key: "upcomingShowings", label: "Upcoming showings", icon: CalendarCheck, href: "/calendar" },
  { key: "newFormResponses", label: "New form responses", icon: ClipboardList, href: "/leads" },
] as const;

export default function OverviewPage() {
  const status = useAppStatus();
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/overview")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow">Marketing Operations</p>
        <h1 className="text-3xl text-forest md:text-4xl">Good day. Here is your control center.</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Everything for {status?.business.propertyAddress ?? "your rental"} in one place.
        </p>
      </header>

      <StatusBanner status={status} />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {STAT_META.map(({ key, label, icon: Icon, href }) => (
          <Link key={key} href={href} className="card p-4 transition-shadow hover:shadow-brand">
            <Icon size={20} className="text-brass" />
            <p className="mt-3 text-3xl font-semibold text-forest">
              {loading ? "-" : data?.stats[key] ?? 0}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-ink-soft">{label}</p>
          </Link>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Emails needing a reply" href="/inbox" cta="Review inbox">
          {loading ? (
            <Skeleton />
          ) : data && data.recentEmails.length > 0 ? (
            <ul className="divide-y divide-line">
              {data.recentEmails.map((e) => (
                <li key={e.id} className="flex items-start gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{e.fromName}</p>
                    <p className="truncate text-sm text-ink-soft">{e.subject}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-ink-soft">{timeAgo(e.receivedAt)}</span>
                    {e.unread && (
                      <span className="pill bg-brass/15 text-brass">new</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No prospect emails waiting. Nice and clear." />
          )}
        </Panel>

        <Panel title="Latest form responses" href="/leads" cta="View responses">
          {loading ? (
            <Skeleton />
          ) : data && data.recentLeads.length > 0 ? (
            <ul className="divide-y divide-line">
              {data.recentLeads.map((l) => (
                <li key={l.id} className="flex items-start gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{l.name}</p>
                    <p className="truncate text-sm text-ink-soft">
                      {l.desiredMoveIn ? `Move-in: ${l.desiredMoveIn}` : l.email}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-ink-soft">{timeAgo(l.submittedAt)}</span>
                    {l.isNew && <span className="pill bg-green-100 text-green-700">new</span>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No form responses yet." />
          )}
        </Panel>

        <Panel title="Upcoming showings" href="/calendar" cta="Track showings">
          {loading ? (
            <Skeleton />
          ) : data && data.upcomingBookings.length > 0 ? (
            <ul className="divide-y divide-line">
              {data.upcomingBookings.map((b) => (
                <li key={b.id} className="flex items-start gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {b.attendeeName ?? b.title}
                    </p>
                    <p className="truncate text-sm text-ink-soft">{formatDateTime(b.start)}</p>
                  </div>
                  <StatusPill status={b.status} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No showings booked yet." />
          )}
        </Panel>

        <Panel title="Quick actions" href="/messages" cta="Text a prospect">
          <div className="flex flex-col gap-2 py-2">
            <QuickLink href="/inbox" label="Review & send AI-drafted replies" />
            <QuickLink href="/leads" label="Check new pre-screening responses" />
            <QuickLink href="/calendar" label="See who has booked a showing" />
            <QuickLink href="/messages" label="Text lock box info to a prospect" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  href,
  cta,
  children,
}: {
  title: string;
  href: string;
  cta: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xl text-forest">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-sm text-brass hover:underline">
          {cta} <ArrowRight size={14} />
        </Link>
      </div>
      {children}
    </section>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    tentative: "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return <span className={`pill ${map[status] ?? "bg-cream-alt text-ink-soft"}`}>{status}</span>;
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5 text-sm text-ink transition-colors hover:bg-cream-alt"
    >
      {label}
      <ArrowRight size={14} className="text-brass" />
    </Link>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 py-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-10 animate-pulse rounded bg-cream-alt" />
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-ink-soft">{text}</p>;
}
