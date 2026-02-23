import express from 'express'
import Study from '../models/Study.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
router.use(protect)

router.get('/', async (req, res) => {
  try {
    let doc = await Study.findOne({ userId: req.user._id })
    if (!doc) {
      doc = await Study.create({ userId: req.user._id })
    }
    res.json({
      dailyHours: doc.dailyHours,
      topics: doc.topics.map((t) => ({
        id: t._id.toString(),
        hours: t.hours,
        topic: t.topic,
        date: t.date,
      })),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/session', async (req, res) => {
  try {
    const { hours, topic } = req.body
    const h = Number(hours)
    if (isNaN(h) || h <= 0) {
      return res.status(400).json({ message: 'Valid hours required' })
    }

    let doc = await Study.findOne({ userId: req.user._id })
    if (!doc) {
      doc = await Study.create({ userId: req.user._id })
    }

    const entry = {
      hours: h,
      topic: topic || 'General',
      date: new Date().toLocaleDateString(),
    }
    doc.dailyHours += h
    doc.topics.unshift(entry)
    await doc.save()

    const added = doc.topics[0]
    res.status(201).json({
      dailyHours: doc.dailyHours,
      topics: doc.topics.map((t) => ({
        id: t._id.toString(),
        hours: t.hours,
        topic: t.topic,
        date: t.date,
      })),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/session/:id', async (req, res) => {
  try {
    const { hours, topic, date } = req.body
    const doc = await Study.findOne({ userId: req.user._id })
    if (!doc) return res.status(404).json({ message: 'Not found' })

    const entry = doc.topics.id(req.params.id)
    if (!entry) return res.status(404).json({ message: 'Session not found' })

    const h = Number(hours)
    if (!isNaN(h) && h > 0) {
      doc.dailyHours = doc.dailyHours - entry.hours + h
      entry.hours = h
    }
    if (topic != null) entry.topic = String(topic)
    if (date != null) entry.date = String(date)
    await doc.save()

    res.json({
      dailyHours: doc.dailyHours,
      topics: doc.topics.map((t) => ({
        id: t._id.toString(),
        hours: t.hours,
        topic: t.topic,
        date: t.date,
      })),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.delete('/session/:id', async (req, res) => {
  try {
    const doc = await Study.findOne({ userId: req.user._id })
    if (!doc) return res.status(404).json({ message: 'Not found' })

    const entry = doc.topics.id(req.params.id)
    if (!entry) return res.status(404).json({ message: 'Session not found' })

    doc.dailyHours -= entry.hours
    doc.topics.pull(entry._id)
    await doc.save()

    res.json({
      dailyHours: doc.dailyHours,
      topics: doc.topics.map((t) => ({
        id: t._id.toString(),
        hours: t.hours,
        topic: t.topic,
        date: t.date,
      })),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.delete('/', async (req, res) => {
  try {
    let doc = await Study.findOne({ userId: req.user._id })
    if (!doc) {
      doc = await Study.create({ userId: req.user._id })
    }
    doc.dailyHours = 0
    doc.topics = []
    await doc.save()
    res.json({
      dailyHours: doc.dailyHours,
      topics: doc.topics.map((t) => ({
        id: t._id.toString(),
        hours: t.hours,
        topic: t.topic,
        date: t.date,
      })),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
