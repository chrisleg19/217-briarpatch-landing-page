import { NextResponse } from "next/server";
import { getOverview } from "@/lib/overview";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getOverview();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load overview" },
      { status: 500 }
    );
  }
}
