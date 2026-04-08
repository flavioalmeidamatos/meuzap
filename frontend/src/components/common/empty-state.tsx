import { Lock } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#222e35] border-b-[6px] border-[#00a884] h-full w-full relative">
      <div className="max-w-[460px] text-center">
        {/* Placeholder para a famosa ilustração do WA Web, usando CSS simples */}
        <div className="mx-auto w-[250px] h-[150px] mb-8 opacity-50 bg-[#202c33] rounded-full blur-[2px] flex items-center justify-center">
             <span className="text-3xl">MeuZap Web</span>
        </div>
        <h1 className="text-[32px] font-light text-[#e9edef] mb-4">MeuZap Web</h1>
        <p className="text-[#8696a0] text-[14px] mb-8 leading-5">
          Envie e receba mensagens sem precisar manter seu celular conectado à internet.<br/>
          Use o MeuZap em até 4 aparelhos conectados e 1 celular ao mesmo tempo.
        </p>
      </div>
      
      <div className="absolute bottom-10 flex items-center gap-1.5 text-[#8696a0] text-xs">
        <Lock size={12} />
        <span>Protegido com a criptografia de ponta a ponta</span>
      </div>
    </div>
  );
}
