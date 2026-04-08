import { useChatStore } from "../../store/chat-store";
import { ChatListItem } from "./chat-list-item";

export function ChatList() {
  const { chats, searchQuery, activeChat } = useChatStore();

  const filteredChats = chats.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#111b21]">
      {filteredChats.map(chat => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isActive={activeChat?.id === chat.id}
        />
      ))}
      
      {filteredChats.length === 0 && (
        <div className="text-center p-8 text-[#8696a0] text-sm font-light">
          Nenhuma conversa encontrada
        </div>
      )}
    </div>
  );
}
