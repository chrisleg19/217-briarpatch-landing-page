import { NextRequest, NextResponse } from "next/server";
import { buildLockboxMessage, sendSms } from "@/lib/sms";

export const dynamic = "force-dynamic";

// GET returns a suggested lock box message so the UI can pre-fill the textarea.
export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name") ?? undefined;
  return NextResponse.json({ message: buildLockboxMessage(name) });
}

export async function POST(req: NextRequest) {
  try {
    const { to, body } = (await req.json()) as { to?: string; body?: string };
    if (!to || !body) {
      return NextResponse.json({ error: "to and body are required" }, { status: 400 });
    }
    const result = await sendSms({ to, body });
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "Failed to send SMS" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, sid: result.sid, simulated: result.simulated ?? false });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send SMS" },
      { status: 500 }
    );
  }
}
