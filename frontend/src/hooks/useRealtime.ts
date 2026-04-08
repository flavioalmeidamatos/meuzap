import { useEffect } from 'react';
import { getSupabaseClient, hasSupabaseConfig } from '../config/supabase';
import { useChatStore } from './useChatStore';
import { Message } from '../shared/types';

export function useRealtime() {
  const { addMessage } = useChatStore();

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      console.warn('Supabase nao configurado para realtime.');
      return;
    }

    const supabase = getSupabaseClient();

    // Inscreve para ouvir inserts na tabela de mensagens
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          addMessage(newMsg.chat_id, newMsg);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addMessage]);
}
