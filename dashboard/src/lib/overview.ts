import { fetchEmails } from "./gmail";
import { fetchFormResponses } from "./forms";
import { fetchUpcomingBookings } from "./calendar";
import { getDraftStatuses } from "./store";
import { isDemoMode, hasGoogleAuth } from "./config";
import type { OverviewPayload } from "./types";

// Assembles the single-screen overview from all connected sources.
export async function getOverview(): Promise<OverviewPayload> {
  const [emails, leads, bookings, statuses] = await Promise.all([
    fetchEmails({ leadsOnly: false, max: 25 }),
    fetchFormResponses(),
    fetchUpcomingBookings(10),
    getDraftStatuses(),
  ]);

  const leadEmails = emails.filter((e) => e.isLead);
  const unreadEmails = emails.filter((e) => e.unread).length;
  const newFormResponses = leads.filter((l) => l.isNew).length;

  // A lead email is "awaiting review" until a reply has been sent or dismissed.
  const draftsAwaitingReview = leadEmails.filter(
    (e) => statuses[e.id] !== "sent" && statuses[e.id] !== "dismissed"
  ).length;

  const now = Date.now();
  const upcomingShowings = bookings.filter(
    (b) => b.status !== "cancelled" && new Date(b.start).getTime() >= now
  ).length;

  return {
    stats: {
      newLeads: newFormResponses,
      unreadEmails,
      draftsAwaitingReview,
      upcomingShowings,
      newFormResponses,
    },
    recentLeads: leads.slice(0, 5),
    recentEmails: leadEmails.slice(0, 5),
    upcomingBookings: bookings.slice(0, 5),
    demoMode: isDemoMode(),
    connected: hasGoogleAuth(),
  };
}
