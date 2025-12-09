import pino from 'pino'

// logger.ts
export const createLogger = (options?: { requestId?: string }) => {
  return pino({
    level: process.env.LOG_LEVEL || 'info',
    base: {
      requestId: options?.requestId,
    },
  })
}
