import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

import { connectDB } from './config/db.js'
import app from './app.js'

await connectDB()

const PORT = process.env.PORT || 4000

// Only listen when run directly (local dev); on Vercel the app is used by api/index.js
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`
    console.log(`Server running on ${baseUrl}`)
  })
}

export default app
