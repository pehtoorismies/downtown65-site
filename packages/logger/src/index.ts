import { ConsoleTransport, LogLayer } from 'loglayer'

interface LoggerOptions {
  appContext: string
}

export const createLogger = (options?: LoggerOptions) => {
  const logger = new LogLayer({
    contextFieldName: 'context',
    transport: [
      new ConsoleTransport({
        logger: console,
        messageField: 'msg',
        dateField: 'timestamp',
        levelField: 'level',
      }),
    ],
  })

  if (options?.appContext) {
    // Seed initial context; LogLayer will call appendContext on its manager
    logger.withContext({ appContext: options.appContext })
  }
  return logger
}
