"use client";

import { useEffect, useState } from "react";
import { Info, CheckCircle2, LogIn } from "lucide-react";

export interface AppStatus {
  demoMode: boolean;
  googleConfigured: boolean;
  signedIn: boolean;
  userEmail: string | null;
  aiEnabled: boolean;
  smsEnabled: boolean;
  persistenceEnabled: boolean;
  bookingLink: string;
  lockboxConfigured: boolean;
  business: {
    name: string;
    agentName: string;
    agentPhone: string;
    propertyAddress: string;
    propertyRent: string;
  };
}

export function useAppStatus() {
  const [status, setStatus] = useState<AppStatus | null>(null);
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);
  return status;
}

export function StatusBanner({ status }: { status: AppStatus | null }) {
  if (!status) return null;

  if (status.demoMode) {
    return (
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-brass/40 bg-brass/10 px-4 py-3 text-sm">
        <Info size={18} className="text-brass" />
        <span className="text-ink">
          <strong>Demo mode.</strong> Showing sample data so you can explore. Connect your Google
          account (see the setup guide) to switch to your live inbox, forms, and calendar.
        </span>
        {status.googleConfigured && (
          <a href="/api/auth/signin" className="btn-primary ml-auto">
            <LogIn size={16} /> Connect Google
          </a>
        )}
      </div>
    );
  }

  if (!status.signedIn) {
    return (
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-forest/30 bg-forest/5 px-4 py-3 text-sm">
        <LogIn size={18} className="text-forest" />
        <span className="text-ink">Sign in with Google to load your live data.</span>
        <a href="/api/auth/signin" className="btn-primary ml-auto">
          <LogIn size={16} /> Sign in with Google
        </a>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-green-600/30 bg-green-50 px-4 py-3 text-sm">
      <CheckCircle2 size={18} className="text-green-700" />
      <span className="text-ink">
        Connected as <strong>{status.userEmail}</strong>.
      </span>
      <a href="/api/auth/signout" className="btn-ghost ml-auto">
        Sign out
      </a>
    </div>
  );
}
