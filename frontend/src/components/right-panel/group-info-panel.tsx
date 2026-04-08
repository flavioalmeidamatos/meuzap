import { X } from "lucide-react";
import { useChatStore } from "../../store/chat-store";

export function GroupInfoPanel() {
  const { activeChat, setRightPanel } = useChatStore();

  if (!activeChat) return null;

  return (
    <aside className="w-[30%] min-w-[300px] max-w-[400px] border-l border-[#222d34] flex-shrink-0 bg-[#111b21] h-full z-20 flex flex-col">
      <header className="h-[59px] px-4 flex items-center gap-6 bg-[#202c33] flex-shrink-0 text-[#e9edef]">
        <button onClick={() => setRightPanel(null)} className="text-[#aebac1] hover:text-white transition-colors">
          <X size={20} />
        </button>
        <h2 className="font-medium text-base">Dados do grupo</h2>
      </header>
      
      <div className="flex-1 overflow-y-auto w-full">
        <div className="flex flex-col items-center py-8 bg-[#111b21] border-b border-[#222d34]">
          <div className="w-[200px] h-[200px] rounded-full bg-gray-500 overflow-hidden mb-5">
            <img src={`https://i.pravatar.cc/300?u=${activeChat.jid}`} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-normal text-[#e9edef] mb-1">{activeChat.name}</h1>
          <span className="text-[#8696a0] text-sm">Grupo • 2 participantes</span>
        </div>
        
        <div className="bg-[#111b21] p-5 border-b border-[#222d34]">
          <h3 className="text-[#8696a0] text-sm mb-2">Descrição</h3>
          <p className="text-[#e9edef] text-[15px]">Descrição do grupo de trabalho.</p>
        </div>
      </div>
    </aside>
  );
}
