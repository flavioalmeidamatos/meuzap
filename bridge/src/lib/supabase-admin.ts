import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';

let supabaseAdminClient: SupabaseClient | null = null;

export function hasSupabaseAdminConfig() {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY);
}

export function getSupabaseAdmin() {
  if (!hasSupabaseAdminConfig()) {
    throw new Error('Configure SUPABASE_URL e SUPABASE_SERVICE_KEY para usar a bridge com Supabase.');
  }

  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }

  return supabaseAdminClient;
}
