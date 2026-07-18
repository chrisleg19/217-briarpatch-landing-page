import { NextResponse } from "next/server";
import { fetchFormResponses } from "@/lib/forms";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const leads = await fetchFormResponses();
    return NextResponse.json({ leads });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load form responses" },
      { status: 500 }
    );
  }
}
