// Tipos centralizados do Adapter Node (Baseado no Baileys que simula a integridade do Whatsmeow)

export interface WhatsAppMessage {
  id: string; // remote message_id original
  remoteJid: string; // Para quem ou De quem
  fromMe: boolean;
  pushName?: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'other';
  body: string;
  timestamp: Date;
}

export interface WhatsAppChat {
  id: string;
  name?: string;
  unreadCount?: number;
  conversationTimestamp?: number;
}

export interface WhatsAppContact {
  id: string;
  name?: string;
  notify?: string; // Pushname
}
