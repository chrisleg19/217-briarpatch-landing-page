import { NextRequest, NextResponse } from "next/server";
import { markAsRead, sendReply } from "@/lib/gmail";
import { setDraftStatus } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { emailId, threadId, to, subject, body } = (await req.json()) as {
      emailId?: string;
      threadId?: string;
      to?: string;
      subject?: string;
      body?: string;
    };

    if (!emailId || !threadId || !to || !body) {
      return NextResponse.json(
        { error: "emailId, threadId, to, and body are required" },
        { status: 400 }
      );
    }

    const result = await sendReply({
      threadId,
      to,
      subject: subject ?? "",
      body,
    });

    if (!result.ok) {
      return NextResponse.json({ error: "Failed to send reply" }, { status: 502 });
    }

    await Promise.all([setDraftStatus(emailId, "sent"), markAsRead(emailId)]);
    return NextResponse.json({ ok: true, id: result.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send reply" },
      { status: 500 }
    );
  }
}
