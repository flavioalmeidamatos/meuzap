import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { logger } from './lib/logger';
import { initWhatsAppAdapter } from './adapters/whatsmeow-adapter';
import messagesRouter from './routes/messages';
import sessionsRouter from './routes/sessions';
import healthRouter from './routes/health';
import syncRouter from './routes/sync';

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/health', healthRouter);
app.use('/messages', messagesRouter);
app.use('/sessions', sessionsRouter);
app.use('/sync', syncRouter);

const PORT = env.PORT || 3001;

app.listen(PORT, async () => {
  logger.info(`Bridge server running on port ${PORT}`);
  
  // Inicializar sessão WhatsApp nativa no startup
  try {
    await initWhatsAppAdapter();
    logger.info('WhatsApp Adapter instanciado');
  } catch (e) {
    logger.error('Erro ao instanciar WhatsApp no boot:', e);
  }
});
