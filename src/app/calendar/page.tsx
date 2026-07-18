"use client";

import { useEffect, useState } from "react";
import { RefreshCw, CalendarCheck, ExternalLink, Copy, Check, MapPin } from "lucide-react";
import { StatusBanner, useAppStatus } from "@/components/StatusBanner";
import { formatDateTime, timeAgo } from "@/lib/format";
import type { CalendarBooking } from "@/lib/types";

export default function CalendarPage() {
  const status = useAppStatus();
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const bookingLink = status?.bookingLink;

  function copyLink() {
    if (!bookingLink) return;
    navigator.clipboard.writeText(bookingLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Showings</p>
          <h1 className="text-3xl text-forest">Booking tracker</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Prospects self-book showings through your Google appointment link. Track who has booked
            and the status here.
          </p>
        </div>
        <button onClick={load} className="btn-ghost">
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <StatusBanner status={status} />

      <section className="card mb-6 p-5">
        <h2 className="text-xl text-forest">Your booking link</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Share this Google Calendar appointment link so prospects can pick an available showing
          time.
        </p>
        {bookingLink ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="max-w-full truncate rounded-lg border border-line bg-cream-alt/50 px-3 py-2 text-sm text-ink">
              {bookingLink}
            </code>
            <button onClick={copyLink} className="btn-ghost">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <a href={bookingLink} target="_blank" rel="noreferrer" className="btn-primary">
              <ExternalLink size={16} /> Open
            </a>
          </div>
        ) : (
          <p className="mt-3 rounded-lg border border-brass/40 bg-brass/10 px-4 py-3 text-sm text-ink">
            No booking link set yet. Create a Google Calendar{" "}
            <strong>Appointment schedule</strong> with your showing times, then add its public URL
            as <code>BOOKING_LINK</code> in your settings to show it here.
          </p>
        )}
      </section>

      <h2 className="mb-3 text-xl text-forest">Scheduled showings</h2>
      {loading ? (
        <p className="py-10 text-center text-sm text-ink-soft">Loading showings...</p>
      ) : bookings.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-soft">
          No showings booked yet. When a prospect books through your link, it appears here.
        </div>
      ) : (
        <div className="grid gap-3">
          {bookings.map((b) => (
            <article key={b.id} className="card flex flex-wrap items-center gap-4 p-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-forest text-cream">
                <CalendarCheck size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{b.attendeeName ?? b.title}</p>
                <p className="text-sm text-ink-soft">{formatDateTime(b.start)}</p>
                {b.location && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
                    <MapPin size={12} /> {b.location}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusPill status={b.status} />
                <span className="text-xs text-ink-soft">
                  {new Date(b.start).getTime() > Date.now()
                    ? `in ${timeAgo(b.start).replace(" ago", "")}`
                    : "past"}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
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
