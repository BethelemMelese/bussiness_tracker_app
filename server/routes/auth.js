import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  )
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const user = await User.create({ email, password, name: name || '' })
    const token = generateToken(user._id)

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Not authorized' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    const u = await User.findById(decoded.userId).select('-password')
    if (!u) return res.status(401).json({ message: 'User not found' })
    res.json({ user: { id: u._id, email: u.email, name: u.name } })
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const match = await user.comparePassword(password)
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user._id)

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
