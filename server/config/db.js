import mongoose from 'mongoose'

// Cache the connection promise for serverless (Vercel): reuse one connection across invocations.
let connectionPromise = null

export async function connectDB() {
  if (connectionPromise) return connectionPromise
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tracker'
  const isAtlas = uri.includes('mongodb+srv://')
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI not set; using default local URI. Is server/.env loaded?')
  } else if (isAtlas) {
    console.log('Connecting to MongoDB Atlas...')
  }

  const options = {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  }
  const maxRetries = 3
  let lastError
  const tryConnect = async () => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await mongoose.connect(uri, options)
        console.log('MongoDB connected')
        return
      } catch (error) {
        lastError = error
        const msg = error.message || ''
        const code = error.code || error.name || ''
        console.error(`MongoDB connection attempt ${attempt}/${maxRetries}:`, msg)
        if (code) console.error('Error code/name:', code)
        if (isAtlas && (msg.includes('auth') || msg.includes('Authentication') || code === 'AuthenticationFailed')) {
          console.error('Atlas tip: Check username/password. If password has special chars, URL-encode them (e.g. @ -> %40).')
        }
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 2000))
        }
      }
    }
    console.error('MongoDB connection failed:', lastError.message)
    if (process.env.VERCEL === '1') throw lastError
    process.exit(1)
  }
  connectionPromise = tryConnect()
  return connectionPromise
}
