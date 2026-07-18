import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, hasSupabase } from "./config";
import type { DraftStatus } from "./types";

// Persists lightweight app state: which emails have had a reply sent or
// dismissed. Uses Supabase when configured; otherwise falls back to an
// in-memory map so actions still work within a running session.
//
// Expected Supabase table (see README):
//   create table draft_status (
//     email_id text primary key,
//     status text not null,
//     updated_at timestamptz default now()
//   );

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient | null {
  if (!hasSupabase()) return null;
  if (!client) client = createClient(env.supabaseUrl, env.supabaseKey);
  return client;
}

const memoryStore = new Map<string, DraftStatus>();

export async function setDraftStatus(emailId: string, status: DraftStatus): Promise<void> {
  const supabase = getClient();
  if (supabase) {
    await supabase
      .from("draft_status")
      .upsert({ email_id: emailId, status, updated_at: new Date().toISOString() });
    return;
  }
  memoryStore.set(emailId, status);
}

export async function getDraftStatuses(): Promise<Record<string, DraftStatus>> {
  const supabase = getClient();
  if (supabase) {
    const { data } = await supabase.from("draft_status").select("email_id,status");
    const map: Record<string, DraftStatus> = {};
    for (const row of data ?? []) {
      map[(row as { email_id: string }).email_id] = (row as { status: DraftStatus }).status;
    }
    return map;
  }
  return Object.fromEntries(memoryStore);
}
