import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../lib/supabase';
import { useAuthSession } from '../../hooks/use-auth-session';

const SvgIcon = ({ d, viewBox = "0 0 24 24" }: { d: string; viewBox?: string }) => (
  <svg viewBox={viewBox} height="24" width="24" fill="currentColor">
    <path d={d}></path>
  </svg>
);

export function SidebarHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuthSession();

  const avatarName = useMemo(() => {
    return user?.user_metadata?.name || user?.email || 'User';
  }, [user]);

  const handleSignOut = async () => {
    await getSupabaseClient().auth.signOut();
    router.replace('/login');
  };

  return (
    <header className="h-[59px] bg-whatsapp-panel flex items-center justify-between px-4 shrink-0 box-border z-10 w-full relative">
      <div className="flex items-center min-w-0">
        <div className="h-10 w-10 overflow-hidden rounded-full shrink-0">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=00a884&color=fff&size=80`}
            alt={avatarName}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="ml-3 min-w-0 md:block hidden">
          <p className="truncate text-sm font-medium text-whatsapp-textPrimary">
            {avatarName}
          </p>
          <p className="truncate text-xs text-whatsapp-textSecondary">
            Sessão protegida
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-whatsapp-icon">
        <button className="p-2 rounded-full hover:bg-whatsapp-hover" title="Comunidades">
          <SvgIcon d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        </button>
        <button className="p-2 rounded-full hover:bg-whatsapp-hover" title="Status">
          <svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".2"/>
            <path d="M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6zm0-10c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4z"/>
          </svg>
        </button>
        <button className="p-2 rounded-full hover:bg-whatsapp-hover" title="Nova conversa">
          <SvgIcon d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-.932 2.064-1.964V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z" />
        </button>
        
        <div className="relative">
          <button 
            className={`p-2 rounded-full hover:bg-whatsapp-hover ${dropdownOpen ? 'bg-whatsapp-hover' : ''}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title="Menu"
          >
            <SvgIcon d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z" />
          </button>
          {dropdownOpen && (
            <div className="absolute top-12 right-0 w-52 bg-whatsapp-panel border border-whatsapp-border rounded shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 origin-top-right">
              <button
                className="w-full text-left px-4 py-2 hover:bg-whatsapp-hover text-whatsapp-textPrimary text-sm"
                onClick={() => router.push('/login')}
              >
                Parear aparelho
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-whatsapp-hover text-whatsapp-textPrimary text-sm">
                Configurações
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-whatsapp-hover text-whatsapp-textPrimary text-sm border-t border-whatsapp-border mt-2"
                onClick={handleSignOut}
              >
                Sair da conta
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
