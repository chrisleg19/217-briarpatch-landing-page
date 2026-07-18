import { NextRequest, NextResponse } from "next/server";
import { fetchEmails } from "@/lib/gmail";
import { getDraftStatuses } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const leadsOnly = req.nextUrl.searchParams.get("leadsOnly") === "true";
    const [emails, statuses] = await Promise.all([
      fetchEmails({ leadsOnly, max: 30 }),
      getDraftStatuses(),
    ]);
    return NextResponse.json({
      emails: emails.map((e) => ({ ...e, draftStatus: statuses[e.id] ?? null })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load emails" },
      { status: 500 }
    );
  }
}
