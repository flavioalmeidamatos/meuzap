import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getOwnedChat } from '@/lib/supabase-server';

const BRIDGE_URL = process.env.BRIDGE_API_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const { chatId, content, targetJid } = await request.json();

    if (!chatId || !content?.trim()) {
      return NextResponse.json(
        { error: 'chatId e content são obrigatórios.' },
        { status: 400 }
      );
    }

    const chat = await getOwnedChat(user, chatId);

    if (!chat) {
      return NextResponse.json({ error: 'Conversa não encontrada.' }, { status: 404 });
    }

    const response = await fetch(`${BRIDGE_URL}/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId,
        content,
        targetJid: targetJid || chat.jid,
        instanceId: chat.instance_id,
      }),
    });

    if (!response.ok) {
      throw new Error('Falha ao enviar mensagem na bridge');
    }

    const data = await response.json();

    return NextResponse.json({ success: true, messageId: data.messageId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
