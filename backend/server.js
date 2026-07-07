import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import missionRoutes from './src/routes/missionRoutes.js'
import {
  errorHandler,
  HttpError,
  notFoundHandler
} from './src/middleware/errorMiddleware.js'
import { writeDevPortConfig } from './src/utils/writeDevPortConfig.js'

const app = express()
const isProduction = process.env.NODE_ENV === 'production'

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : []

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      
        if (allowedOrigins.length === 0) {
        if (isProduction) {
          return callback(
            new HttpError(
              403,
              'CORS Policy: set ALLOWED_ORIGINS in production (comma-separated browser origins).'
            )
          )
        }
        return callback(null, true)
      }
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      if (
        origin.endsWith('.vercel.app') &&
        origin.includes('ai-mission-assistant-demo')
      ) {
        return callback(null, true)
      }

      return callback(
        new HttpError(403, 'CORS Policy: This origin is not allowed.')
      )
    }
  })
)

app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true })
})

app.use('/api', missionRoutes)

app.use(notFoundHandler)

app.use(errorHandler)

function getInitialPort() {
  const raw = process.env.PORT
  if (raw === undefined || raw === '') return 3001
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1 || n > 65535) {
    console.error('[CRITICAL] Invalid PORT:', raw)
    process.exit(1)
  }
  return Math.trunc(n)
}

function listenOnPort(expressApp, listenPort, listenHost) {
  return new Promise((resolve, reject) => {
    const server = listenHost
      ? expressApp.listen(listenPort, listenHost)
      : expressApp.listen(listenPort)

    const onError = (err) => {
      server.removeListener('listening', onListening)
      if (err.code === 'EADDRINUSE') {
        server.close(() => reject(err))
      } else {
        server.close(() => reject(err))
      }
    }

    const onListening = () => {
      server.removeListener('error', onError)
      resolve(server)
    }

    server.once('error', onError)
    server.once('listening', onListening)
  })
}

async function startServer() {
  const initialPort = getInitialPort()
  const listenHost = process.env.LISTEN_HOST?.trim() || undefined
  let attemptPort = initialPort
  const maxPort = 65535

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const server = await listenOnPort(app, attemptPort, listenHost)

      if (!isProduction) {
        try {
          await writeDevPortConfig(attemptPort)
        } catch (writeErr) {
          console.warn('[port_config] Could not write frontend/.port_config.json:', writeErr)
        }
      }

      console.log('Using Gemini model:', process.env.GOOGLE_MODEL)
      console.log(
        listenHost
          ? `Server ready at http://${listenHost}:${attemptPort}`
          : `Server ready at http://localhost:${attemptPort}`
      )

      if (!isProduction && attemptPort !== initialPort) {
        console.log(
          `[dev] Port ${initialPort} was busy; bound to ${attemptPort}. ` +
          'frontend/.port_config.json was updated — restart Vite if it was already running, or set VITE_PROXY_TARGET explicitly.'
        )
      }

      server.on('error', (err) => {
        console.error(err)
        process.exit(1)
      })

      return server
    } catch (err) {
      if (err.code === 'EADDRINUSE') {
        if (isProduction) {
          console.error(
            `[CRITICAL] Listen port ${initialPort} is already in use in production. ` +
            'Refusing to auto-increment. Fix PORT / the container port mapping or stop the conflicting process.'
          )
          process.exit(1)
        }
        attemptPort += 1
        if (attemptPort > maxPort) {
          console.error('[EADDRINUSE] No free port found in development before reaching', maxPort)
          process.exit(1)
        }
        console.warn(`[dev] Port ${attemptPort - 1} in use, trying ${attemptPort}…`)
        continue
      }
      console.error(err)
      process.exit(1)
    }
  }
}

startServer().catch((err) => {
  console.error(err)
  process.exit(1)
})