import express from 'express'
import Discipline from '../models/Discipline.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
router.use(protect)

function toResponse(doc) {
  return {
    habits: doc.habits.map((h) => ({
      id: h._id.toString(),
      name: h.name,
      checkedDays: h.checkedDays || Array(21).fill(false),
      startDate: h.startDate || '',
      habitFormed: h.habitFormed || false,
    })),
  }
}

router.get('/', async (req, res) => {
  try {
    let doc = await Discipline.findOne({ userId: req.user._id })
    if (!doc) {
      doc = await Discipline.create({ userId: req.user._id })
    }
    res.json(toResponse(doc))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/habit', async (req, res) => {
  try {
    const { name } = req.body
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Habit name required' })
    }

    let doc = await Discipline.findOne({ userId: req.user._id })
    if (!doc) {
      doc = await Discipline.create({ userId: req.user._id })
    }

    doc.habits.unshift({
      name: name.trim(),
      checkedDays: Array(21).fill(false),
      startDate: new Date().toLocaleDateString(),
      habitFormed: false,
    })
    await doc.save()

    res.status(201).json(toResponse(doc))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/habit/:id', async (req, res) => {
  try {
    const { checkedDays, habitFormed } = req.body

    const doc = await Discipline.findOne({ userId: req.user._id })
    if (!doc) return res.status(404).json({ message: 'Not found' })

    const habit = doc.habits.id(req.params.id)
    if (!habit) return res.status(404).json({ message: 'Habit not found' })

    if (Array.isArray(checkedDays)) habit.checkedDays = checkedDays
    if (typeof habitFormed === 'boolean') habit.habitFormed = habitFormed
    await doc.save()

    res.json(toResponse(doc))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.delete('/habit/:id', async (req, res) => {
  try {
    const doc = await Discipline.findOne({ userId: req.user._id })
    if (!doc) return res.status(404).json({ message: 'Not found' })

    const habit = doc.habits.id(req.params.id)
    if (!habit) return res.status(404).json({ message: 'Habit not found' })

    doc.habits.pull(req.params.id)
    await doc.save()

    res.json(toResponse(doc))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
