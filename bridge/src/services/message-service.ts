import { getSupabaseAdmin } from "../lib/supabase-admin";
import { WhatsAppMessage } from "../types/whatsapp";
import { logger } from "../lib/logger";
import { ChatService } from "./chat-service";

export class MessageService {
  static async handleIncomingMessage(instanceId: string, msg: WhatsAppMessage) {
    try {
      const supabaseAdmin = getSupabaseAdmin();

      let chatId = await ChatService.ensureChatExists(instanceId, msg.remoteJid);
      if (!chatId) {
        logger.warn(`Nao foi possivel confirmar/criar o chat ${msg.remoteJid}`);
        return;
      }

      const { error } = await supabaseAdmin
        .from('messages')
        .upsert({
          chat_id: chatId,
          message_id: msg.id,
          sender_jid: msg.fromMe ? 'me' : msg.remoteJid,
          from_me: msg.fromMe,
          content: msg.body,
          message_type: msg.type,
          status: msg.fromMe ? 'sent' : 'delivered',
          timestamp: msg.timestamp.toISOString(),
        }, { onConflict: 'chat_id, message_id' });

      if (error) {
        logger.error(`Erro ao inserir msg ${msg.id}:`, error);
        return;
      }

      await ChatService.updateChatLastMessage(chatId, msg.body, msg.timestamp, !msg.fromMe);
      logger.debug(`Message processada com sucesso: ${msg.id}`);
    } catch (e) {
      logger.error('Erro processando msg:', e);
    }
  }
}
