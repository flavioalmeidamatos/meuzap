import { useEffect } from 'react';
import { getSupabaseClient, hasSupabaseConfig } from '../lib/supabase';
import { useChatStore } from '../store/chat-store';
import { Message } from '../types/domain';

export function useRealtimeChat() {
  const { addMessage } = useChatStore();

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      console.warn('Supabase nao configurado para realtime.');
      return;
    }

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          // Dispara alteração otimista globalmente
          addMessage(newMsg.chat_id, newMsg);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addMessage]);
}
