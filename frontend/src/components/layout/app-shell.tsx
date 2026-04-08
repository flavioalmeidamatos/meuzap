import { Sidebar } from "../sidebar/sidebar";
import { ChatPane } from "../chat/chat-pane";
import { useChatStore } from "../../store/chat-store";

export function AppShell() {
  const { activeChat, rightPanelContent, setRightPanel } = useChatStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-whatsapp-bg">
      {/* Background container para telas ultra wide simulando o verde padrão (Opcional, omitido aqui focado em 100vw/100vh app view) */}
      <div className="flex w-full h-full text-whatsapp-textPrimary bg-whatsapp-bg relative z-10">
        
        {/* Lado Esquerdo - Painel principal de Conversas (Flex fixo) */}
        <div 
          className={`flex flex-col h-full bg-whatsapp-bg border-r border-whatsapp-border transition-all duration-300 md:min-w-[300px] md:max-w-[400px] md:w-[30%] lg:w-[30%] ${
            activeChat?.id ? 'hidden md:flex' : 'w-full'
          }`}
        >
          <Sidebar />
        </div>

        {/* Lado Direito - O Chat em Si */}
        <div 
          className={`flex-1 flex flex-col h-full relative transition-all duration-300 ${
            !activeChat?.id ? 'hidden md:flex' : 'flex w-full'
          }`}
        >
          <ChatPane />
        </div>

        {/* Painel Lateral Secundário (ex: Detalhes do Contato, Search in Chat) */}
        {rightPanelContent !== null && (
          <div className="hidden border-l border-whatsapp-border bg-whatsapp-bg md:flex flex-col w-[30%] xl:w-[25%] transition-all z-20">
            {/* Componente "Contact Details" entraria aqui */}
            <div className="flex h-[59px] items-center px-4 border-b border-whatsapp-border bg-whatsapp-panel">
              <button 
                onClick={() => setRightPanel(null)}
                className="p-2"
              >
                <svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor">
                  <path d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"></path>
                </svg>
              </button>
              <h2 className="ml-4 truncate text-lg">Dados do contato</h2>
            </div>
            <div className="flex-1 overflow-y-auto w-full p-4 flex flex-col items-center">
              <div className="w-48 h-48 rounded-full bg-gray-600 mb-4"></div>
              <h3 className="text-xl text-whatsapp-textPrimary">Contato</h3>
              <span className="text-whatsapp-textSecondary">+55 00 0000-0000</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
