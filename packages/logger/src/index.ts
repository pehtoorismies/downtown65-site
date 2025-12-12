import pino from 'pino'

export const createLogger = (_options?: { requestId?: string }) =>
  pino({
    browser: {
      asObject: true,
      formatters: {
        level(label, _number) {
          return { level: label.toUpperCase() }
        },
      },
    },
    enabled: true,
    level: 'trace',
    timestamp: pino.stdTimeFunctions.isoTime,
  })
