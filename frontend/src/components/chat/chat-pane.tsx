import { useChatStore } from "../../store/chat-store";
import { ChatHeader } from "./chat-header";
import { Composer } from "./Composer";
import { MessageList } from "./message-list";

export function ChatPane() {
  const { activeChat } = useChatStore();

  if (!activeChat?.id) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-whatsapp-panel text-center relative border-b-4 border-whatsapp-green px-6">
        <div className="max-w-[460px]">
          <div className="w-[250px] h-[160px] sm:w-[320px] sm:h-[200px] mb-8 opacity-80 mx-auto bg-[url('https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669aeOSwR.png')] bg-no-repeat bg-center bg-cover mix-blend-screen"></div>
          <h1 className="text-3xl font-light text-whatsapp-textPrimary mb-4">WhatsApp Web Clone</h1>
          <p className="text-sm text-whatsapp-textSecondary leading-6">
            Entre com sua conta, pareie seu aparelho e selecione uma conversa para começar.
          </p>
          <div className="mt-10 flex items-center justify-center text-whatsapp-textSecondary text-xs">
            <svg viewBox="0 0 10 12" height="12" width="10" className="mr-2" fill="currentColor">
              <path d="M5 0C2.24 0 0 2.24 0 5v2.5C0 8.88 1.12 10 2.5 10v1c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-1c1.38 0 2.5-1.12 2.5-2.5V5C10 2.24 7.76 0 5 0zm0 1c2.21 0 4 1.79 4 4v2.5C9 8.33 8.33 9 7.5 9H2.5C1.67 9 1 8.33 1 7.5V5c0-2.21 1.79-4 4-4zm-2 4h4v3H3V5z"></path>
            </svg>
            Protegido com a criptografia de ponta a ponta
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full relative bg-whatsapp-chatBg overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-chat-pattern opacity-[0.06] bg-repeat bg-[scale:1] pointer-events-none"
        style={{ backgroundSize: "412.5px" }}
      ></div>

      <div className="flex flex-col h-full w-full relative z-10 box-border">
        <ChatHeader name={activeChat.name || "Chat"} />

        <MessageList chat={activeChat} />

        <div className="w-full shrink-0">
          <Composer />
        </div>
      </div>
    </div>
  );
}
