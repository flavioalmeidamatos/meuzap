import useSWR from 'swr';
import { apiClient } from '../lib/api-client';
import { useChatStore } from '../store/chat-store';
import { useEffect } from 'react';

export function useChatMessages(chatId?: string) {
  const { setMessages } = useChatStore();
  
  const { data, error, isLoading } = useSWR(
    chatId ? `/chats/${chatId}/messages` : null, 
    apiClient.get,
    {
      revalidateOnFocus: false,
      refreshInterval: 3000,
    }
  );

  useEffect(() => {
    if (chatId && data?.messages) {
      setMessages(chatId, data.messages);
    }
  }, [data, chatId, setMessages]);

  return { isLoading, error };
}
