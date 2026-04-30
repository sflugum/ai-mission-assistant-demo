import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import missionRoutes from './src/routes/missionRoutes.js'

// Nodemon does not reload .env on change — restart the server after editing backend/.env.

const app = express()
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : []


app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error('CORS Policy: This origin is not allowed.'))
    }
  })
)
app.use(express.json({ limit: '1mb' }))

app.use(missionRoutes)

const port = Number(process.env.PORT || 3001)
app.listen(port, () => {
  console.log('Using Gemini model:', process.env.GOOGLE_MODEL)
  // eslint-disable-next-line no-console
  console.log(`AI Mission Assistant backend listening on http://localhost:${port}`)
})
