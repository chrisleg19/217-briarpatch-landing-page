// Shared domain types for the Marketing Operations Dashboard.

export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  receivedAt: string; // ISO
  unread: boolean;
  isLead: boolean;
  // True when this is an inbound prospect email that warrants a reply/action.
  // Automated notifications, newsletters, and no-reply senders are false, so
  // the app never drafts a reply to them.
  needsResponse: boolean;
  labels: string[];
}

export type DraftStatus = "suggested" | "edited" | "sent" | "dismissed";

export interface ReplyDraft {
  emailId: string;
  threadId: string;
  to: string;
  subject: string;
  body: string;
  status: DraftStatus;
  generatedAt: string; // ISO
  source: "ai" | "template";
}

export interface FormResponse {
  id: string;
  submittedAt: string; // ISO
  name: string;
  email: string;
  phone: string;
  answers: { question: string; answer: string }[];
  // Convenience fields commonly pulled from a pre-screening form.
  desiredMoveIn?: string;
  income?: string;
  pets?: string;
  isNew: boolean;
}

export interface CalendarBooking {
  id: string;
  title: string;
  start: string; // ISO
  end: string; // ISO
  attendeeEmail?: string;
  attendeeName?: string;
  location?: string;
  status: "confirmed" | "tentative" | "cancelled";
  description?: string;
}

export interface OverviewStats {
  newLeads: number;
  unreadEmails: number;
  draftsAwaitingReview: number;
  upcomingShowings: number;
  newFormResponses: number;
}

export interface OverviewPayload {
  stats: OverviewStats;
  recentLeads: FormResponse[];
  recentEmails: EmailMessage[];
  upcomingBookings: CalendarBooking[];
  demoMode: boolean;
  connected: boolean;
}
