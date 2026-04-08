import { useChatStore } from "../../store/chat-store";

interface Props {
  name: string;
}

export function ChatHeader({ name }: Props) {
  const { activeChat, setRightPanel } = useChatStore();
  const status = "Visto por ultimo hoje as 10:45";
  const detailsPanel = activeChat?.jid.endsWith("@g.us") ? "group_info" : "contact_info";

  return (
    <header className="h-[59px] bg-whatsapp-panel flex items-center justify-between px-4 shrink-0 border-l border-whatsapp-border box-border w-full">
      <div
        className="flex items-center cursor-pointer flex-1"
        onClick={() => setRightPanel(detailsPanel)}
      >
        <div className="h-10 w-10 overflow-hidden rounded-full shrink-0 mr-4">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center flex-1 h-full w-full overflow-hidden">
          <h2 className="text-[16px] text-whatsapp-textPrimary truncate font-normal leading-snug">
            {name}
          </h2>
          <span className="text-[13px] text-whatsapp-textSecondary truncate font-normal leading-snug">
            {status}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-1 shrink-0 text-whatsapp-icon">
        <button className="p-2 rounded-full hover:bg-whatsapp-hover" title="Videochamada">
          <svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"></path>
          </svg>
        </button>
        <button className="p-2 rounded-full hover:bg-whatsapp-hover" title="Busca na conversa">
          <svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor">
            <path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.608 0a3.606 3.606 0 1 1 0-7.212 3.606 3.606 0 0 1 0 7.212z"></path>
          </svg>
        </button>
        <button className="p-2 rounded-full hover:bg-whatsapp-hover" title="Menu">
          <svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor">
            <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}
