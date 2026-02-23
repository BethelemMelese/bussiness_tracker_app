import 'dotenv/config'
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

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
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
  console.log(`Server running on http://localhost:${PORT}`)
})
