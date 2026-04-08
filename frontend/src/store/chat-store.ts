import { create } from 'zustand';
import { Chat, Message } from '../types/domain';

interface ChatState {
  activeChat: Chat | null;
  chats: Chat[];
  messages: Record<string, Message[]>; // Mapeia chat_id para a lista de mensagens
  searchQuery: string;
  isSidebarOpen: boolean;
  rightPanelContent: 'contact_info' | 'group_info' | null;
  
  setActiveChat: (chat: Chat | null) => void;
  setChats: (chats: Chat[]) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  setRightPanel: (panel: 'contact_info' | 'group_info' | null) => void;
  
  addMessage: (chatId: string, message: Message) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeChat: null,
  chats: [],
  messages: {},
  searchQuery: '',
  isSidebarOpen: true,
  rightPanelContent: null,
  
  setActiveChat: (chat) => set({ activeChat: chat, rightPanelContent: null }),
  setChats: (chats) => set({ chats }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setRightPanel: (panel) => set({ rightPanelContent: panel }),
  
  addMessage: (chatId, message) => set((state) => {
    const existing = state.messages[chatId] || [];
    // Evita duplicação otimista por ID
    if (existing.some((m) => m.message_id === message.message_id)) {
      return state;
    }
    return {
      messages: {
        ...state.messages,
        [chatId]: [...existing, message]
      }
    };
  }),
  setMessages: (chatId, msgs) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: msgs
    }
  }))
}));
