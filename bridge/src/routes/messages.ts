import { Router } from 'express';
import { globalSocket } from '../adapters/whatsmeow-adapter';
import { setActiveInstanceId } from '../lib/instance-state';
import { logger } from '../lib/logger';

const router = Router();

router.post('/send', async (req, res) => {
  const { content, targetJid, instanceId } = req.body;

  if (instanceId) {
    setActiveInstanceId(instanceId);
  }

  if (!globalSocket) {
    return res.status(500).json({ error: 'WhatsApp socket nao esta inicializado' });
  }

  if (!targetJid || !content?.trim()) {
    return res.status(400).json({ error: 'targetJid e content sao obrigatorios' });
  }

  try {
    const sentMsg = await globalSocket.sendMessage(targetJid, { text: content });
    return res.json({ success: true, messageId: sentMsg?.key.id });
  } catch (err: any) {
    logger.error('Erro ao enviar mensagem', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
