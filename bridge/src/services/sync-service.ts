import { WhatsAppChat, WhatsAppContact } from "../types/whatsapp";
import { ChatService } from "./chat-service";
import { ContactService } from "./contact-service";
import { logger } from "../lib/logger";

export class SyncService {
  /**
   * Chamado quando recebemos um HistorySync do WhatsApp inicial.
   * Processamos em batch.
   */
  static async syncChatsAndContacts(instanceId: string, chats: WhatsAppChat[], contacts: WhatsAppContact[]) {
    try {
      logger.info(`Syncando ${chats.length} chats e ${contacts.length} contatos`);

      // 1. Sync Contacts
      for (const contact of contacts) {
        await ContactService.upsertContact(instanceId, contact);
      }

      // 2. Sync Chats
      for (const chat of chats) {
        // Encontra UUID do contato se existir
        const contactInfo = await ContactService.getContactByJid(instanceId, chat.id);
        
        await ChatService.upsertChat(instanceId, chat, contactInfo?.id);
      }

      logger.info('Sync finalizado.');

    } catch (error) {
      logger.error('Erro na sincronizacao:', error);
    }
  }
}
