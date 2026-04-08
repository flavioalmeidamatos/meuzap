import { NextResponse } from 'next/server';
import {
  getAuthenticatedUser,
  getOrCreatePrimaryInstance,
  getSupabaseAdminClient,
} from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const instance = await getOrCreatePrimaryInstance(user);
    const supabase = getSupabaseAdminClient();

    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .eq('instance_id', instance.id)
      .order('last_message_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      chats,
      instance: {
        id: instance.id,
        status: instance.status,
        jid: instance.jid,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
