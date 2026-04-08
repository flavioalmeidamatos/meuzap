import useSWR from 'swr';
import { apiClient } from '../lib/api-client';
import { useChatStore } from '../store/chat-store';
import { useEffect } from 'react';

export function useChatList() {
  const { setChats } = useChatStore();
  
  const { data, error, isLoading } = useSWR('/chats', apiClient.get, {
    revalidateOnFocus: false,
    refreshInterval: 5000,
  });

  useEffect(() => {
    if (data?.chats) {
      setChats(data.chats);
    }
  }, [data, setChats]);

  return { error, isLoading };
}
