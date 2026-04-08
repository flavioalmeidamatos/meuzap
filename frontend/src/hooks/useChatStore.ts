import { create } from 'zustand'
import { Chat, Message } from '../shared/types'

interface ChatState {
  activeChat: Chat | null;
  chats: Chat[];
  messages: Record<string, Message[]>; // chat_id -> messages
  setActiveChat: (chat: Chat) => void;
  setChats: (chats: Chat[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeChat: null,
  chats: [],
  messages: {},
  setActiveChat: (chat) => set({ activeChat: chat }),
  setChats: (chats) => set({ chats }),
  addMessage: (chatId, message) => set((state) => {
    const existing = state.messages[chatId] || []
    return {
      messages: {
        ...state.messages,
        [chatId]: [...existing, message]
      }
    }
  }),
  setMessages: (chatId, msgs) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: msgs
    }
  }))
}))
