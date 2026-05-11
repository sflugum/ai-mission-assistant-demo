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

/**
 * Express 404 handler — pass to global error middleware as HttpError.
 */
export function notFoundHandler(req, _res, next) {
  next(new HttpError(404, `Cannot ${req.method} ${req.originalUrl}`))
}

/**
 * Global Express error handler — mount after all routes.
 */
export function errorHandler(err, _req, res, _next) {
  const statusFromErr =
    typeof err?.statusCode === 'number'
      ? err.statusCode
      : typeof err?.status === 'number'
        ? err.status
        : undefined

  let status = statusFromErr ?? 500
  let message = typeof err?.message === 'string' ? err.message : 'Internal Server Error'

  if (err instanceof SyntaxError && 'body' in err) {
    status = 400
    message = 'Invalid JSON body'
  }

  if (err?.code === 'AI_VALIDATION_RETRY_FAILED') {
    status = 500
    message = 'AI response failed validation after retry'
  }

  if (isDev && err?.stack) {
    // eslint-disable-next-line no-console
    console.error(err.stack)
  }

  const stack = isDev && typeof err?.stack === 'string' ? err.stack : ''

  // In production, `stack` is omitted so clients never see server paths or internals.
  res.status(status).json({
    success: false,
    message,
    stack
  })
}
