import React, { useState } from 'react';
import { format } from 'date-fns';
import { Message } from '../../types/domain';

interface Props {
  message: Message;
  isFirstInChain: boolean; // Controla se mostramos a "cauda" do balão
}

export function MessageBubble({ message, isFirstInChain }: Props) {
  const isMine = message.from_me;
  
  // O horário no WA web fica no final do texto
  const timeString = format(new Date(message.timestamp), 'HH:mm');

  return (
    <div className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
      <div 
        className={`relative max-w-[65%] rounded-md px-[9px] py-[6px] text-[14.2px] leading-[19px] shadow-wa ${
          isMine ? 'bg-whatsapp-bubbleOut text-whatsapp-textPrimary' : 'bg-whatsapp-bubbleIn text-whatsapp-textPrimary'
        } ${isFirstInChain ? (isMine ? 'rounded-tr-none msg-tail-out' : 'rounded-tl-none msg-tail-in') : ''}`}
      >
        {/* Usar padding right grande permite que o tempo caiba no fluxo normal, ou usar float */}
        <span className="break-words" style={{ paddingRight: '45px' }}>
          {message.content}
        </span>
        
        <div className="absolute right-[9px] bottom-[4px] flex items-center space-x-[2px]">
          <span className="text-[11px] text-whatsapp-textSecondary whitespace-nowrap">
            {timeString}
          </span>
          {isMine && (
            <span className="inline-flex items-center text-whatsapp-icon">
              {message.status === 'read' ? (
                // Lida (Azul no sistema, mas manteremos o SVG)
                <svg viewBox="0 0 16 15" width="16" height="15" className="text-[#53bdeb]">
                  <path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path>
                </svg>
              ) : message.status === 'delivered' ? (
                // Entregue
                <svg viewBox="0 0 16 15" width="16" height="15" fill="currentColor">
                   <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path>
                </svg>
              ) : (
                // Enviado (1 check)
                <svg viewBox="0 0 11 14" width="11" height="14" fill="currentColor">
                   <path d="M10.428 3.238l-6.4 8c-.122.152-.34.167-.482.032l-2.8-2.67a.414.414 0 0 1 .035-.589l.482-.387a.322.322 0 0 1 .46.046l1.986 1.89 5.679-7.1a.363.363 0 0 1 .512-.064l.478.38a.32.32 0 0 1 .05.462z"></path>
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
