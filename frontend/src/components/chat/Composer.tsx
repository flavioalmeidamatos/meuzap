import React, { useState } from 'react';
import { apiClient } from '../../lib/api-client';
import { useChatStore } from '../../store/chat-store';

export function Composer() {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const { activeChat, addMessage } = useChatStore();

  const handleSend = async () => {
    if (!text.trim() || !activeChat?.id || isSending) return;

    const content = text.trim();
    setIsSending(true);
    setSendError(null);

    try {
      const data = await apiClient.post('/messages/send', {
        chatId: activeChat.id,
        content,
      });

      addMessage(activeChat.id, {
        id: `local-${data.messageId || Date.now()}`,
        chat_id: activeChat.id,
        message_id: data.messageId || `local-${Date.now()}`,
        sender_jid: 'me',
        from_me: true,
        content,
        message_type: 'text',
        status: 'sent',
        timestamp: new Date().toISOString(),
      });
      setText('');
    } catch (error: any) {
      setSendError(error.message || 'Falha ao enviar mensagem.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full border-t border-whatsapp-border bg-whatsapp-panel px-3 py-2 sm:px-4">
      {sendError && (
        <div className="mb-2 rounded-xl border border-[#5f2f39] bg-[#2a1218] px-3 py-2 text-xs text-[#ffb3c1]">
          {sendError}
        </div>
      )}

      <div className="flex items-end gap-2 sm:gap-4">
        <div className="flex items-center gap-2 text-whatsapp-icon shrink-0 sm:gap-4">
          <button className="p-1 hover:text-whatsapp-textPrimary" title="Emoji">
            <svg viewBox="0 0 24 24" height="26" width="26" fill="currentColor">
              <path d="M9.153 11.603c.795 0 1.44-.88 1.44-1.962s-.645-1.96-1.44-1.96c-.795 0-1.44.88-1.44 1.96s.645 1.965 1.44 1.965zM5.95 12.965c-.027-.307-.132 5.218 6.062 5.55 6.066-.25 6.066-5.55 6.066-5.55-6.078 1.416-12.13 0-12.13 0zm11.362 1.108s1.66-.813 3.015-3.136c-.712-2.368-2.542-4.135-4.9-4.86-.286-.067-.5-.043-.64.08-.13.11-.186.27-.145.474.208 1.05.5 2.188.88 3.376.326 1.02.7 2.052 1.134 3.078.07.168.175.342.316.51.137.16.29.317.47.464l-.13-.986z" opacity=".25"></path>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.15-5.31c.16-.31.54-.43.85-.27.31.16.43.54.27.85-1.39 2.69-4.8 2.37-5.07 2.34-.34-.04-.59-.35-.55-.69.04-.34.34-.59.69-.55.07.01 2.82.26 3.81-1.68zM8.88 9C8.35 9 7.92 9.49 7.92 10.1s.43 1.1.96 1.1c.54 0 .97-.49.97-1.1C9.85 9.49 9.42 9 8.88 9zm6.24 0c-.54 0-.96.49-.96 1.1s.42 1.1.96 1.1c.53 0 .96-.49.96-1.1C16.08 9.49 15.65 9 15.12 9z"></path>
            </svg>
          </button>
          <button className="p-1 hover:text-whatsapp-textPrimary" title="Anexar">
            <svg viewBox="0 0 24 24" height="26" width="26" fill="currentColor">
              <path d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.335.127-.433.03-.143-.143-.093-.292.042-.427l7.912-7.912c.573-.573 1.575-.585 2.51.35.851.851 1.008 1.846.64 2.215l-9.55 9.548a4.015 4.015 0 0 1-2.863 1.185 4.01 4.01 0 0 1-2.86-1.184 4.012 4.012 0 0 1-1.185-2.86c0-1.077.42-2.09 1.185-2.855l8.729-8.728c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04L3.46 11.583a5.583 5.583 0 0 0-1.644 3.973z"></path>
            </svg>
          </button>
        </div>

        <div className="flex-1">
          <div className="bg-whatsapp-active rounded-2xl flex items-center min-h-[48px]">
            <input
              className="w-full bg-transparent border-none outline-none px-4 py-3 text-whatsapp-textPrimary text-[15px] placeholder-whatsapp-textSecondary"
              placeholder={
                activeChat ? "Digite uma mensagem" : "Selecione uma conversa"
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              disabled={!activeChat || isSending}
            />
          </div>
        </div>

        <div className="flex items-center text-whatsapp-icon shrink-0">
          <button
            className="p-1 hover:text-whatsapp-textPrimary disabled:opacity-50"
            onClick={() => void handleSend()}
            title={text ? "Enviar" : "Mensagem de voz"}
            disabled={!activeChat || isSending || !text.trim()}
          >
            {text ? (
              <svg viewBox="0 0 24 24" height="26" width="26" fill="currentColor">
                <path d="M1.101 21.757 23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" height="26" width="26" fill="currentColor">
                <path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.349 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2.002z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
