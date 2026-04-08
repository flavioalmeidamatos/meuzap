import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { logger } from '../lib/logger';
import { getActiveInstanceId } from '../lib/instance-state';
import { MessageService } from '../services/message-service';
import { SessionService } from '../services/session-service';

export let globalSocket: ReturnType<typeof makeWASocket> | null = null;
export let globalQr: string | null = null;

export async function initWhatsAppAdapter() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(`Usando WA v${version.join('.')}, isLatest: ${isLatest}`);

  globalSocket = makeWASocket({
    version,
    logger: logger as any,
    printQRInTerminal: true,
    auth: state,
    generateHighQualityLinkPreview: true,
  });

  globalSocket.ev.on('creds.update', async () => {
    await saveCreds();

    const instanceId = getActiveInstanceId();
    const jid = globalSocket?.authState.creds.me?.id || null;

    if (instanceId) {
      await SessionService.saveSessionData(instanceId, state.creds, jid);
    }
  });

  globalSocket.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      globalQr = qr;
      logger.info('Novo QR Code gerado');
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      logger.info(
        'Sessao fechada devido a ',
        lastDisconnect?.error,
        ', tentando reconectar:',
        shouldReconnect
      );

      const instanceId = getActiveInstanceId();
      if (!shouldReconnect && instanceId) {
        void SessionService.clearSession(instanceId);
      }

      if (shouldReconnect) {
        void initWhatsAppAdapter();
      }
    } else if (connection === 'open') {
      logger.info('Conexao estabelecida com WhatsApp.');
      globalQr = null;

      const instanceId = getActiveInstanceId();
      const jid = globalSocket?.authState.creds.me?.id || null;

      if (instanceId) {
        void SessionService.saveSessionData(instanceId, state.creds, jid);
      }
    }
  });

  globalSocket.ev.on('messages.upsert', async (batch) => {
    logger.info(`Evento messages.upsert recebido: ${batch.messages.length} mensagens`);

    for (const msg of batch.messages) {
      if (!msg.message || msg.key.remoteJid === 'status@broadcast') {
        continue;
      }

      const body =
        msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      if (!body) {
        continue;
      }

      const instanceId = getActiveInstanceId();
      if (!instanceId) {
        logger.warn('Mensagem recebida sem instanceId ativo.');
        continue;
      }

      await MessageService.handleIncomingMessage(instanceId, {
        id: msg.key.id!,
        remoteJid: msg.key.remoteJid!,
        fromMe: msg.key.fromMe || false,
        type: 'text',
        body,
        timestamp: new Date((msg.messageTimestamp as number) * 1000),
      });
    }
  });

  return globalSocket;
}
