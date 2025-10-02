/**
 * Структурированное логирование для приложения
 * В продакшене можно заменить на Winston, Pino и т.д.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: string
  data?: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, data } = entry
    const contextStr = context ? `[${context}]` : ''
    const dataStr = data ? ` ${JSON.stringify(data)}` : ''
    return `${timestamp} ${level.toUpperCase()} ${contextStr} ${message}${dataStr}`
  }

  private log(level: LogLevel, message: string, context?: string, data?: any) {
    if (!this.isDevelopment && level === 'debug') return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data
    }

    const formattedMessage = this.formatMessage(entry)

    switch (level) {
      case 'debug':
        console.debug(formattedMessage)
        break
      case 'info':
        console.info(formattedMessage)
        break
      case 'warn':
        console.warn(formattedMessage)
        break
      case 'error':
        console.error(formattedMessage)
        break
    }
  }

  debug(message: string, context?: string, data?: any) {
    this.log('debug', message, context, data)
  }

  info(message: string, context?: string, data?: any) {
    this.log('info', message, context, data)
  }

  warn(message: string, context?: string, data?: any) {
    this.log('warn', message, context, data)
  }

  error(message: string, context?: string, data?: any) {
    this.log('error', message, context, data)
  }
}

export const logger = new Logger()
