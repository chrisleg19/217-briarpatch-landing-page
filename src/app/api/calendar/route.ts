import { NextResponse } from "next/server";
import { fetchUpcomingBookings } from "@/lib/calendar";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bookings = await fetchUpcomingBookings(30);
    return NextResponse.json({ bookings });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load calendar" },
      { status: 500 }
    );
  }
}
