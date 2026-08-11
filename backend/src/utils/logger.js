import pino from 'pino'

const isProduction = process.env.NODE_ENV === 'production'

// pino-pretty is only used in dev, it's slower and not meant for prod log
// pipelines, which usually want raw JSON lines.
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: !isProduction ? { target: 'pino-pretty' } : undefined,
})