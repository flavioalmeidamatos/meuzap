import { NextResponse } from 'next/server';
import {
  getAuthenticatedUser,
  getOwnedChat,
  getSupabaseAdminClient,
} from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const { chatId } = params;
    const chat = await getOwnedChat(user, chatId);

    if (!chat) {
      return NextResponse.json({ error: 'Conversa não encontrada.' }, { status: 404 });
    }

    const supabase = getSupabaseAdminClient();

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: true })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({ messages, chat });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
