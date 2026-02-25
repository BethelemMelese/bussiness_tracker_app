import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import capitalRoutes from './routes/capital.js'
import studyRoutes from './routes/study.js'
import marketRoutes from './routes/market.js'
import financialRoutes from './routes/financial.js'
import disciplineRoutes from './routes/discipline.js'

const app = express()

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

// Allow requests with no origin (e.g. Postman), exact match, or any *.vercel.app (preview + prod)
function corsOriginCheck(origin, callback) {
  if (!origin) return callback(null, true)
  if (corsOrigins.includes(origin)) return callback(null, true)
  if (origin.endsWith('.vercel.app')) return callback(null, true)
  callback(new Error('Not allowed by CORS'))
}

app.use(
  cors({
    origin: corsOriginCheck,
    credentials: true,
  })
)
app.use(express.json())

// Ensure MongoDB is connected before any route that uses DB (fixes Vercel serverless cold starts)
app.use(async (req, res, next) => {
  if (req.method === 'GET' && req.path === '/api/health') return next()
  try {
    await connectDB()
    next()
  } catch (err) {
    next(err)
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/capital', capitalRoutes)
app.use('/api/study', studyRoutes)
app.use('/api/market', marketRoutes)
app.use('/api/financial', financialRoutes)
app.use('/api/discipline', disciplineRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tracker API is running' })
})

// Ensure errors from async routes/middleware send a response (avoids hanging in serverless)
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)
  res.status(500).json({ message: err.message || 'Internal server error' })
})

export default app
