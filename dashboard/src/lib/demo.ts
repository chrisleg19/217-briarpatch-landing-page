// Realistic sample data used when the app runs in demo mode (no live Google
// connection yet). All names/emails here are fictional.

import type {
  CalendarBooking,
  EmailMessage,
  FormResponse,
} from "./types";

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

function daysFromNow(d: number, hour = 10): string {
  const date = new Date();
  date.setDate(date.getDate() + d);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export const demoEmails: EmailMessage[] = [
  {
    id: "demo-email-1",
    threadId: "demo-thread-1",
    from: "Tasha Coleman <tasha.coleman@example.com>",
    fromName: "Tasha Coleman",
    fromEmail: "tasha.coleman@example.com",
    to: "leasing@legettelegacygroupllc.com",
    subject: "Is 217 Briarpatch Ct still available?",
    snippet:
      "Hi, I saw your listing and I'm very interested. Is the home still available and can I schedule a showing this weekend?",
    body:
      "Hi,\n\nI saw your listing for 217 Briarpatch Ct and I'm very interested. Is the home still available? I'd love to schedule a showing this weekend if possible. I have a stable job and can move in within 30 days.\n\nThank you,\nTasha Coleman\n(770) 555-0148",
    receivedAt: hoursAgo(2),
    unread: true,
    isLead: true,
    needsResponse: true,
    labels: ["INBOX", "UNREAD"],
  },
  {
    id: "demo-email-2",
    threadId: "demo-thread-2",
    from: "Marcus Reid <marcus.reid@example.com>",
    fromName: "Marcus Reid",
    fromEmail: "marcus.reid@example.com",
    to: "leasing@legettelegacygroupllc.com",
    subject: "Questions about pet policy and deposit",
    snippet:
      "Hello, we have a small dog (about 40 lbs). What is the pet deposit and are there any breed restrictions?",
    body:
      "Hello,\n\nWe are relocating to Stockbridge and love the look of your rental. We have one small dog (about 40 lbs). What is the pet deposit, and are there breed restrictions? Also, how much is the security deposit?\n\nBest,\nMarcus Reid",
    receivedAt: hoursAgo(6),
    unread: true,
    isLead: true,
    needsResponse: true,
    labels: ["INBOX", "UNREAD"],
  },
  {
    id: "demo-email-3",
    threadId: "demo-thread-3",
    from: "Priya Nair <priya.nair@example.com>",
    fromName: "Priya Nair",
    fromEmail: "priya.nair@example.com",
    to: "leasing@legettelegacygroupllc.com",
    subject: "Application follow-up",
    snippet:
      "Thank you for the showing yesterday! We submitted our RentSpree application. When should we expect to hear back?",
    body:
      "Hi,\n\nThank you so much for the showing yesterday, we really loved the home. We just submitted our RentSpree application for both adults. When should we expect to hear back on next steps?\n\nWarm regards,\nPriya Nair",
    receivedAt: hoursAgo(26),
    unread: false,
    isLead: true,
    needsResponse: true,
    labels: ["INBOX"],
  },
  {
    id: "demo-email-4",
    threadId: "demo-thread-4",
    from: "HOA Stockbridge <no-reply@hoa-notices.example.com>",
    fromName: "HOA Stockbridge",
    fromEmail: "no-reply@hoa-notices.example.com",
    to: "leasing@legettelegacygroupllc.com",
    subject: "Monthly community newsletter",
    snippet: "Reminder: community pool hours are changing for the season.",
    body:
      "This is the monthly community newsletter. Pool hours are changing for the season. No action needed.",
    receivedAt: hoursAgo(50),
    unread: false,
    isLead: false,
    needsResponse: false,
    labels: ["INBOX"],
  },
];

export const demoFormResponses: FormResponse[] = [
  {
    id: "demo-form-1",
    submittedAt: hoursAgo(1),
    name: "Tasha Coleman",
    email: "tasha.coleman@example.com",
    phone: "(770) 555-0148",
    desiredMoveIn: "Within 30 days",
    income: "$5,700/month",
    pets: "None",
    isNew: true,
    answers: [
      { question: "Desired move-in date", answer: "Within 30 days" },
      { question: "Monthly household income", answer: "$5,700" },
      { question: "Number of occupants", answer: "2" },
      { question: "Do you have pets?", answer: "No" },
      { question: "Have you been evicted in the last 5 years?", answer: "No" },
    ],
  },
  {
    id: "demo-form-2",
    submittedAt: hoursAgo(9),
    name: "Marcus Reid",
    email: "marcus.reid@example.com",
    phone: "(678) 555-0193",
    desiredMoveIn: "Next month",
    income: "$6,200/month",
    pets: "1 dog (40 lbs)",
    isNew: true,
    answers: [
      { question: "Desired move-in date", answer: "Next month" },
      { question: "Monthly household income", answer: "$6,200" },
      { question: "Number of occupants", answer: "2" },
      { question: "Do you have pets?", answer: "Yes - 1 dog, 40 lbs" },
      { question: "Have you been evicted in the last 5 years?", answer: "No" },
    ],
  },
  {
    id: "demo-form-3",
    submittedAt: hoursAgo(30),
    name: "Priya Nair",
    email: "priya.nair@example.com",
    phone: "(404) 555-0121",
    desiredMoveIn: "Flexible",
    income: "$7,000/month",
    pets: "None",
    isNew: false,
    answers: [
      { question: "Desired move-in date", answer: "Flexible" },
      { question: "Monthly household income", answer: "$7,000" },
      { question: "Number of occupants", answer: "2" },
      { question: "Do you have pets?", answer: "No" },
      { question: "Have you been evicted in the last 5 years?", answer: "No" },
    ],
  },
];

export const demoBookings: CalendarBooking[] = [
  {
    id: "demo-booking-1",
    title: "Showing - 217 Briarpatch Ct (Priya Nair)",
    start: daysFromNow(1, 11),
    end: daysFromNow(1, 11) /* patched below */,
    attendeeEmail: "priya.nair@example.com",
    attendeeName: "Priya Nair",
    location: "217 Briarpatch Ct, Stockbridge, GA 30281",
    status: "confirmed",
    description: "In-person showing. Confirmed via dashboard.",
  },
  {
    id: "demo-booking-2",
    title: "Showing - 217 Briarpatch Ct (Tasha Coleman)",
    start: daysFromNow(3, 14),
    end: daysFromNow(3, 14),
    attendeeEmail: "tasha.coleman@example.com",
    attendeeName: "Tasha Coleman",
    location: "217 Briarpatch Ct, Stockbridge, GA 30281",
    status: "tentative",
    description: "Requested via email. Awaiting confirmation.",
  },
];

// Fix end times to be 30 minutes after start.
for (const b of demoBookings) {
  b.end = new Date(new Date(b.start).getTime() + 30 * 60 * 1000).toISOString();
}
