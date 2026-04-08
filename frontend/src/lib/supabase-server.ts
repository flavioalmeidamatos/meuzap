import { createClient, type User } from '@supabase/supabase-js';
import { Database } from '../types/domain';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let authClient: ReturnType<typeof createClient<Database>> | null = null;
let adminClient: ReturnType<typeof createClient<Database>> | null = null;

function getSupabaseAuthClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Supabase URL e publishable key são obrigatórias no servidor.');
  }

  if (!authClient) {
    authClient = createClient<Database>(supabaseUrl, supabasePublishableKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return authClient;
}

export function getSupabaseAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL e service key são obrigatórias no servidor.');
  }

  if (!adminClient) {
    adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return adminClient;
}

export async function registerUserWithPassword(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      name: input.name?.trim() || undefined,
    },
  });

  if (error) {
    throw error;
  }

  if (data.user) {
    await ensureUserProfile(data.user);
  }

  return data.user;
}

function getBearerToken(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice(7).trim();
}

export async function getAuthenticatedUser(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function ensureUserProfile(user: User) {
  const supabase = getSupabaseAdminClient();
  const profileName =
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'usuario';

  const { error } = await supabase.from('user_profiles').upsert(
    {
      id: user.id,
      name: profileName,
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw error;
  }
}

export async function getOrCreatePrimaryInstance(user: User) {
  const supabase = getSupabaseAdminClient();

  await ensureUserProfile(user);

  const { data: existing, error: fetchError } = await supabase
    .from('whatsapp_instances')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: createError } = await supabase
    .from('whatsapp_instances')
    .insert({
      user_id: user.id,
      status: 'disconnected',
    })
    .select('*')
    .single();

  if (createError) {
    throw createError;
  }

  return created;
}

export async function getOwnedChat(user: User, chatId: string) {
  const instance = await getOrCreatePrimaryInstance(user);
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .eq('instance_id', instance.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
