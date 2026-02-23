import express from 'express'
import Capital from '../models/Capital.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
router.use(protect)

router.get('/', async (req, res) => {
  try {
    let doc = await Capital.findOne({ userId: req.user._id })
    if (!doc) {
      doc = await Capital.create({
        userId: req.user._id,
        monthlyIncome: 0,
        savings: 0,
        target: 10000,
      })
    }
    res.json({
      monthlyIncome: doc.monthlyIncome,
      savings: doc.savings,
      target: doc.target,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/', async (req, res) => {
  try {
    const { monthlyIncome, savings, target } = req.body
    const doc = await Capital.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { monthlyIncome, savings, target } },
      { new: true, upsert: true }
    )
    res.json({
      monthlyIncome: doc.monthlyIncome,
      savings: doc.savings,
      target: doc.target,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/add-income', async (req, res) => {
  try {
    const { amount } = req.body
    const num = Number(amount)
    if (isNaN(num) || num <= 0) {
      return res.status(400).json({ message: 'Valid amount required' })
    }

    let doc = await Capital.findOne({ userId: req.user._id })
    if (!doc) {
      doc = await Capital.create({
        userId: req.user._id,
        monthlyIncome: num,
        savings: num,
        target: 10000,
      })
    } else {
      doc.monthlyIncome += num
      doc.savings += num
      await doc.save()
    }

    res.json({
      monthlyIncome: doc.monthlyIncome,
      savings: doc.savings,
      target: doc.target,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
