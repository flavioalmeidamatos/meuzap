export type Chat = {
  id: string;
  instance_id: string;
  jid: string;
  contact_id?: string;
  name: string;
  unread_count: number;
  last_message_preview: string;
  last_message_at: string;
  is_archived: boolean;
  is_pinned: boolean;
  is_muted: boolean;
};

export type Message = {
  id: string;
  chat_id: string;
  message_id: string;
  sender_jid: string;
  from_me: boolean;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document';
  media_url?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
};

// Dummy database type to avoid TS errors when generating
export type Database = any;
