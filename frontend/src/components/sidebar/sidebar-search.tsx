import React, { useState } from 'react';

export function SidebarSearch() {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <div className="h-[49px] border-b border-whatsapp-border flex items-center px-3 gap-2 bg-whatsapp-bg relative transition-colors">
      <div className="bg-whatsapp-search bg-opacity-100 flex items-center w-full h-[35px] rounded-lg px-3 overflow-hidden relative">
        <div className="flex h-full items-center justify-center shrink-0 w-8 transition-all duration-300">
          {isFocused ? (
            <button 
              className="text-whatsapp-green hover:text-whatsapp-textPrimary absolute transform rotate-90 opacity-100 transition-all duration-200"
              style={{ transform: isFocused ? 'rotate(0deg)' : 'rotate(-90deg)' }}
              onClick={() => {
                setIsFocused(false);
                setQuery('');
              }}
            >
              <svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor">
                <path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20v-2z"></path>
              </svg>
            </button>
          ) : (
            <div className="text-whatsapp-icon absolute transition-all duration-200 transform">
              <svg viewBox="0 0 24 24" height="20" width="20" fill="currentColor">
                <path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.608 0a3.606 3.606 0 1 1 0-7.212 3.606 3.606 0 0 1 0 7.212z"></path>
              </svg>
            </div>
          )}
        </div>
        
        <input 
          type="text" 
          placeholder="Pesquisar ou começar uma nova conversa" 
          className="bg-transparent border-none outline-none w-full h-full text-whatsapp-textPrimary text-sm font-normal placeholder-whatsapp-textSecondary placeholder:text-[14px] pl-3"
          onFocus={() => setIsFocused(true)}
          onBlur={() => { if(!query) setIsFocused(false) }}
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
        
        {query && (
          <button 
            className="text-whatsapp-icon shrink-0 hover:text-whatsapp-textSecondary"
            onClick={() => setQuery('')}
          >
            <svg viewBox="0 0 24 24" height="20" width="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg>
          </button>
        )}
      </div>

      <button className="text-whatsapp-icon p-1 hover:text-whatsapp-textPrimary" title="Filtro de conversas não lidas">
        <svg viewBox="0 0 24 24" height="20" width="20" fill="currentColor">
          <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"></path>
        </svg>
      </button>
    </div>
  );
}
