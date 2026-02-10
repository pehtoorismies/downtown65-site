import { ConsoleTransport, LogLayer, LogLevel } from 'loglayer'

export const Levels = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
  'silent',
] as const

type InternalLogLevel = (typeof Levels)[number]

type LoggerOptions = {
  appContext: string
  level: InternalLogLevel
}

const toLogLevel = (level: InternalLogLevel): LogLevel | null => {
  switch (level) {
    case 'trace': {
      return LogLevel.trace
    }
    case 'debug': {
      return LogLevel.debug
    }
    case 'info': {
      return LogLevel.info
    }
    case 'warn': {
      return LogLevel.warn
    }
    case 'error': {
      return LogLevel.error
    }
    case 'fatal': {
      return LogLevel.fatal
    }
    case 'silent': {
      return null
    }
  }
}

export const createLogger = (options: LoggerOptions): LogLayer => {
  // const logLevel = getLogLevel(options.level)

  const logger = new LogLayer({
    contextFieldName: 'context',
    enabled: options.level !== 'silent',
    transport: [
      new ConsoleTransport({
        dateField: 'timestamp',
        level: toLogLevel(options.level) ?? LogLevel.info,
        levelField: 'level',
        logger: console,
        messageField: 'msg',
      }),
    ],
  })

  return logger.withContext({ appContext: options.appContext })
}

type Logger = LogLayer
export type { Logger }
