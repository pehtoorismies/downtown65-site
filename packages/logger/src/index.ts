import { ConsoleTransport, LogLayer } from 'loglayer'

interface LoggerOptions {
  appContext: string
}

const _censorSecrets = (value: unknown) => {
  console.warn('censorSecrets called wit value:', value)
  const _secretKeys = new Set([
    'password',
    'pass',
    'pwd',
    'secret',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'authorization',
    'auth',
    'cookie',
    'session',
  ])
  // if (typeof key === 'string' && secretKeys.has(key)) {
  //   return '[redacted]'
  // }
  return value
}

export const createLogger = (options?: LoggerOptions) => {
  const logger = new LogLayer({
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
