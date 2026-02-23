import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import capitalRoutes from './routes/capital.js'
import studyRoutes from './routes/study.js'
import marketRoutes from './routes/market.js'
import financialRoutes from './routes/financial.js'
import disciplineRoutes from './routes/discipline.js'

await connectDB()

const app = express()
const PORT = process.env.PORT || 4000

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/capital', capitalRoutes)
app.use('/api/study', studyRoutes)
app.use('/api/market', marketRoutes)
app.use('/api/financial', financialRoutes)
app.use('/api/discipline', disciplineRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tracker API is running' })
})

app.listen(PORT, () => {
  const baseUrl =
    process.env.API_BASE_URL ||
    process.env.BASE_URL ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.RAILWAY_STATIC_URL ||
    `http://localhost:${PORT}`
  console.log(`Server running on ${baseUrl}`)
})
