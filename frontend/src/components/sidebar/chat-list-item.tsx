import { Chat } from "../../types/domain";
import { useChatStore } from "../../store/chat-store";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  chat: Chat;
  isActive: boolean;
}

export function ChatListItem({ chat, isActive }: Props) {
  const setActiveChat = useChatStore((state) => state.setActiveChat);

  const formatTime = (isoDate?: string | null) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (isToday(date)) return format(date, 'HH:mm', { locale: ptBR });
    if (isYesterday(date)) return 'Ontem';
    return format(date, 'dd/MM/yy', { locale: ptBR });
  };

  return (
    <div
      onClick={() => setActiveChat(chat)}
      className={`flex items-center w-full h-[72px] cursor-pointer relative hover:bg-whatsapp-hover transition-colors group ${
        isActive ? 'bg-whatsapp-active' : ''
      }`}
    >
      {/* Container do Avatar - Padding rígido do WA: pr-3, pl-3 e w-20 aprox */}
      <div className="flex h-full px-[13px] items-center justify-center shrink-0 z-10 w-[77px] box-border">
        <div className="h-[49px] w-[49px] overflow-hidden rounded-full shrink-0">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random&color=fff`}
            alt={chat.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Container Principal do Item: Nome + Linha de Texto (borda apenas abaixo desse elemento e não no avatar) */}
      <div className="flex-1 flex flex-col justify-center h-full pr-[15px] border-b border-whatsapp-border box-border w-[calc(100%-77px)] relative">
        <div className="flex justify-between items-center w-full">
          {/* Nome e Indicador de Lida/Horario */}
          <span className="text-[17px] text-whatsapp-textPrimary truncate mb-[2px] leading-snug font-normal w-full"
                title={chat.name}>
             {chat.name}
          </span>
          <span className={`text-[12px] shrink-0 ml-4 mb-[2px] leading-snug mt-1 ${
             chat.unread_count > 0 ? 'text-whatsapp-green font-medium' : 'text-whatsapp-textSecondary'
          }`}>
             {formatTime(chat.last_message_at)}
          </span>
        </div>

        <div className="flex justify-between items-center w-full min-h-[20px]">
          {/* Preview / Ícone duplo v */}
          <div className="flex items-center text-sm w-full font-normal overflow-hidden gap-1 text-whatsapp-textSecondary">
            <span className="truncate w-[90%]" title={chat.last_message_preview || ''}>
              {chat.last_message_preview || ''}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {chat.unread_count > 0 && (
              <div className="bg-whatsapp-green text-[#111b21] text-[12px] font-bold h-[20px] min-w-[20px] rounded-full flex items-center justify-center px-[6px]">
                {chat.unread_count}
              </div>
            )}
            {/* Ícone de Seta pra baixo que aparece no Hover em conversas do WA */}
            <div className={`text-whatsapp-icon transition-transform transform translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 ${isActive ? 'opacity-100 translate-x-0' : ''}`}>
              <svg viewBox="0 0 19 20" height="20" width="19" fill="currentColor">
                 <path d="M3.8 6.7l5.7 5.7 5.7-5.7 1.6 1.6-7.3 7.2-7.3-7.2 1.6-1.6z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
