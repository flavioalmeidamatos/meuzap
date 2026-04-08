import { getSupabaseAdminClient as getClient } from './supabase-server';

export function hasSupabaseAdminConfig() {
  return Boolean(
    process.env.SUPABASE_SERVICE_KEY &&
      (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)
  );
}

export function getSupabaseAdminClient() {
  return getClient();
}
