import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/chat-store";
import { useChatMessages } from "../../hooks/use-chat-messages";
import { MessageBubble } from "./message-bubble";
import { Chat } from "../../types/domain";

export function MessageList({ chat }: { chat: Chat }) {
  const { messages } = useChatStore();
  const { isLoading } = useChatMessages(chat.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatMsgs = messages[chat.id] || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMsgs]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-[5%] py-4 z-10 flex flex-col gap-[2px]">
      {isLoading && (
        <div className="flex justify-center my-4">
          <span className="text-[#8696a0] bg-[#182229]/80 px-3 py-1 rounded-full text-xs">Carregando...</span>
        </div>
      )}
      
      {!isLoading && chatMsgs.length === 0 ? (
        <div className="flex justify-center mt-10">
          <span className="bg-[#182229]/95 text-[#e9edef] text-[12.5px] px-4 py-2 rounded-lg shadow-sm">
            As mensagens e chamadas são protegidas com a criptografia de ponta a ponta.
          </span>
        </div>
      ) : (
        chatMsgs.map((msg, index) => {
          const prevMsg = chatMsgs[index - 1];
          // Lógica básica para checar se deve agrupar o "rabo" do balão
          const isFirstInChain = !prevMsg || prevMsg.from_me !== msg.from_me;
          
          return (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              isFirstInChain={isFirstInChain} 
            />
          );
        })
      )}
    </div>
  );
}
