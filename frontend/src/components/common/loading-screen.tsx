import { Lock } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-full bg-[#111b21] items-center justify-center flex-col relative">
      <div className="mb-10 opacity-70">
        {/* Simple visual indicator */}
        <div className="w-[100px] h-[100px] rounded-full border-[3px] border-[#222d34] border-t-[#00a884] animate-spin border-solid"></div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-xl font-light text-[#e9edef]">MeuZap</h1>
        <div className="absolute bottom-10 flex flex-col items-center text-[#8696a0] text-xs gap-1">
          <div className="flex items-center gap-1.5">
            <Lock size={12} />
            <span>Com a criptografia de ponta a ponta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
