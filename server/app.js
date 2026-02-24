import express from 'express'
import cors from 'cors'
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

export default app
