import { NextRequest, NextResponse } from "next/server";
import { setDraftStatus } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { emailId } = (await req.json()) as { emailId?: string };
    if (!emailId) {
      return NextResponse.json({ error: "emailId is required" }, { status: 400 });
    }
    await setDraftStatus(emailId, "dismissed");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to dismiss" },
      { status: 500 }
    );
  }
}
