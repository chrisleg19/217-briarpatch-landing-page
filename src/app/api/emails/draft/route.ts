import { NextRequest, NextResponse } from "next/server";
import { getEmail } from "@/lib/gmail";
import { draftReply } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { emailId } = (await req.json()) as { emailId?: string };
    if (!emailId) {
      return NextResponse.json({ error: "emailId is required" }, { status: 400 });
    }
    const email = await getEmail(emailId);
    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }
    // Only draft for emails that actually warrant a response. Newsletters and
    // automated notifications are skipped.
    if (!email.needsResponse) {
      return NextResponse.json(
        { error: "This email does not require a response, so no draft was generated." },
        { status: 422 }
      );
    }
    const draft = await draftReply(email);
    return NextResponse.json({ draft });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to draft reply" },
      { status: 500 }
    );
  }
}
