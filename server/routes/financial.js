import express from 'express'
import Financial from '../models/Financial.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
router.use(protect)

router.get('/', async (req, res) => {
  try {
    let doc = await Financial.findOne({ userId: req.user._id })
    if (!doc) {
      doc = await Financial.create({ userId: req.user._id })
    }
    res.json({
      costPerUnit: doc.costPerUnit,
      sellingPrice: doc.sellingPrice,
      monthlyFixedCosts: doc.monthlyFixedCosts,
      unitsSoldPerMonth: doc.unitsSoldPerMonth,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/', async (req, res) => {
  try {
    const { costPerUnit, sellingPrice, monthlyFixedCosts, unitsSoldPerMonth } = req.body
    const doc = await Financial.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          costPerUnit: Number(costPerUnit) || 0,
          sellingPrice: Number(sellingPrice) || 0,
          monthlyFixedCosts: Number(monthlyFixedCosts) || 0,
          unitsSoldPerMonth: Number(unitsSoldPerMonth) || 0,
        },
      },
      { new: true, upsert: true }
    )
    res.json({
      costPerUnit: doc.costPerUnit,
      sellingPrice: doc.sellingPrice,
      monthlyFixedCosts: doc.monthlyFixedCosts,
      unitsSoldPerMonth: doc.unitsSoldPerMonth,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
