const isDev = process.env.NODE_ENV !== 'production'

export class HttpError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   */
  constructor(statusCode, message) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
  }
}

export function notFoundHandler(req, _res, next) {
  next(new HttpError(404, `Cannot ${req.method} ${req.originalUrl}`))
}

export function errorHandler(err, _req, res, _next) {
  let status = typeof err?.statusCode === 'number' ? err.statusCode : 500
  let message = typeof err?.message === 'string' ? err.message : 'Internal Server Error'

  if (err instanceof SyntaxError && 'body' in err) {
    status = 400
    message = 'Invalid JSON body'
  }

  if (err?.code === 'AI_VALIDATION_RETRY_FAILED') {
    status = 500
    message = 'AI response failed validation after retry'
  }

  if (err?.code && typeof err.code === 'string' && err.code.length === 5) {
    status = 502 
    message = isDev ? `Database error (${err.code}): ${err.message}` : 'A database error occurred'
  }

  if (isDev && err?.stack) {
    // eslint-disable-next-line no-console
    console.error(err.stack)
  }

  const stack = isDev && typeof err?.stack === 'string' ? err.stack : ''

  res.status(status).json({
    success: false,
    message,
    stack
  })
}