import { getSupabaseAdmin } from "../lib/supabase-admin";
import { WhatsAppChat } from "../types/whatsapp";
import { logger } from "../lib/logger";

export class ChatService {
  static async upsertChat(instanceId: string, chat: WhatsAppChat, contactId?: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const ts = chat.conversationTimestamp
      ? new Date(chat.conversationTimestamp * 1000).toISOString()
      : new Date().toISOString();

    await supabaseAdmin.from('chats').upsert({
      instance_id: instanceId,
      jid: chat.id,
      name: chat.name || chat.id.split('@')[0],
      contact_id: contactId,
      unread_count: chat.unreadCount || 0,
      last_message_at: ts,
    }, { onConflict: 'instance_id, jid' });
  }

  static async ensureChatExists(instanceId: string, jid: string): Promise<string | null> {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: existing, error } = await supabaseAdmin
      .from('chats')
      .select('id')
      .eq('instance_id', instanceId)
      .eq('jid', jid)
      .single();

    if (existing) return existing.id;
    if (error && error.code !== 'PGRST116') {
      logger.error('Erro get chat', error);
      return null;
    }

    const { data: novo, error: insErr } = await supabaseAdmin
      .from('chats')
      .insert({
        instance_id: instanceId,
        jid,
        name: jid.split('@')[0],
        unread_count: 0
      })
      .select('id')
      .single();

    if (insErr) {
      logger.error('Erro force create chat', insErr);
      return null;
    }

    return novo?.id || null;
  }

  static async updateChatLastMessage(chatUUID: string, preview: string, ts: Date, incrementUnread: boolean) {
    const supabaseAdmin = getSupabaseAdmin();
    const updatePayload: any = {
      last_message_preview: preview,
      last_message_at: ts.toISOString()
    };

    void incrementUnread;

    await supabaseAdmin
      .from('chats')
      .update(updatePayload)
      .eq('id', chatUUID);
  }
}
