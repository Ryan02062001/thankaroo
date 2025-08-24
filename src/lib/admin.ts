// src/utils/supabase/admin.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only
    if (!url || !serviceRoleKey) {
      throw new Error("Supabase admin env vars are missing");
    }
    adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}