import pino from 'pino';

const level = process.env.LOG_LEVEL || 'info';

function createLogger() {
  try {
    require.resolve('pino-pretty');

    return pino({
      level,
      transport: {
        target: 'pino-pretty',
        options: { colorize: true }
      }
    });
  } catch {
    return pino({ level });
  }
}

export const logger = createLogger();
