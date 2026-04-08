import { SidebarHeader } from "./sidebar-header";
import { SidebarSearch } from "./sidebar-search";
import { ChatListItem } from "./chat-list-item";
import { useChatList } from "../../hooks/use-chat-list";
import { useChatStore } from "../../store/chat-store";
import { useMemo } from "react";

export function Sidebar() {
  const { isLoading } = useChatList();
  const { chats, activeChat } = useChatStore();

  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      const db = new Date(b.last_message_at || 0).getTime();
      const da = new Date(a.last_message_at || 0).getTime();
      return db - da; // Order by recent
    });
  }, [chats]);

  return (
    <div className="flex flex-col h-full bg-whatsapp-bg w-full">
      <SidebarHeader />
      <SidebarSearch />

      {/* Lista de Chats com Scroll Exato (Sem barra horizontal e sem track feio se for dark theme) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-1 relative bg-whatsapp-bg">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex animate-pulse items-center">
                <div className="h-12 w-12 rounded-full bg-whatsapp-hover shrink-0"></div>
                <div className="ml-4 flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-whatsapp-hover rounded"></div>
                  <div className="h-3 w-1/2 bg-whatsapp-hover rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedChats.length === 0 ? (
          <div className="flex items-center justify-center h-full text-whatsapp-textSecondary text-sm">
            Nenhuma conversa
          </div>
        ) : (
          <div className="flex flex-col w-full">
            {sortedChats.map((c) => (
              <ChatListItem
                key={c.id}
                chat={c}
                isActive={activeChat?.id === c.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
