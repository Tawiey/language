import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && anonKey);

// A single shared client. If env is missing we still export a client built
// with placeholders so the bundle compiles; the UI gates on `isConfigured`.
export const supabase: SupabaseClient = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
  {
    realtime: { params: { eventsPerSecond: 5 } },
  }
);

export const HOUSEHOLD_ID = "main";
