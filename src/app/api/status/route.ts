import { NextResponse } from "next/server";
import {
  businessContext,
  hasGemini,
  hasGoogleAuth,
  hasSupabase,
  hasTwilio,
  isDemoMode,
} from "@/lib/config";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  return NextResponse.json({
    demoMode: isDemoMode(),
    googleConfigured: hasGoogleAuth(),
    signedIn: Boolean(session?.accessToken),
    userEmail: session?.user?.email ?? null,
    aiEnabled: hasGemini(),
    smsEnabled: hasTwilio(),
    persistenceEnabled: hasSupabase(),
    bookingLink: businessContext.bookingLink,
    lockboxConfigured: Boolean(businessContext.lockboxCode),
    business: {
      name: businessContext.businessName,
      agentName: businessContext.agentName,
      agentPhone: businessContext.agentPhone,
      propertyAddress: businessContext.propertyAddress,
      propertyRent: businessContext.propertyRent,
    },
  });
}
