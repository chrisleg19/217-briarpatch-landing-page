import { getCalendarClient } from "./google";
import { env, isDemoMode } from "./config";
import { demoBookings } from "./demo";
import type { CalendarBooking } from "./types";

// Bookings are made by prospects themselves through a Google Calendar
// appointment-schedule link. This module is READ-ONLY: it reads the calendar
// so you can track which showings have been booked and their status. It does
// not create events.

function mapStatus(status?: string | null): CalendarBooking["status"] {
  if (status === "cancelled") return "cancelled";
  if (status === "tentative") return "tentative";
  return "confirmed";
}

export async function fetchUpcomingBookings(max = 30): Promise<CalendarBooking[]> {
  if (isDemoMode()) {
    return [...demoBookings].sort((a, b) => a.start.localeCompare(b.start)).slice(0, max);
  }

  const calendar = await getCalendarClient();
  if (!calendar) return [];

  const res = await calendar.events.list({
    calendarId: env.showingCalendarId,
    timeMin: new Date().toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: max,
  });

  return (res.data.items ?? []).map((ev) => {
    const attendee = ev.attendees?.find((a) => !a.organizer) ?? ev.attendees?.[0];
    return {
      id: ev.id ?? "",
      title: ev.summary ?? "(no title)",
      start: ev.start?.dateTime ?? ev.start?.date ?? "",
      end: ev.end?.dateTime ?? ev.end?.date ?? "",
      attendeeEmail: attendee?.email ?? undefined,
      attendeeName: attendee?.displayName ?? undefined,
      location: ev.location ?? undefined,
      status: mapStatus(ev.status),
      description: ev.description ?? undefined,
    };
  });
}
