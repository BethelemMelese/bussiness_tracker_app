import express from 'express'
import Market from '../models/Market.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
router.use(protect)

function toResponse(doc) {
  const mapItem = (item) => ({
    id: item._id.toString(),
    name: item.name,
    category: item.category,
    notes: item.notes || '',
  })
  return {
    stores: doc.stores.map(mapItem),
    competitors: doc.competitors.map(mapItem),
    suppliers: doc.suppliers.map(mapItem),
  }
}

router.get('/', async (req, res) => {
  try {
    let doc = await Market.findOne({ userId: req.user._id })
    if (!doc) {
      doc = await Market.create({ userId: req.user._id })
    }
    res.json(toResponse(doc))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/item', async (req, res) => {
  try {
    const { name, category, notes } = req.body
    if (!name || !['store', 'competitor', 'supplier'].includes(category)) {
      return res.status(400).json({ message: 'Name and valid category required' })
    }

    let doc = await Market.findOne({ userId: req.user._id })
    if (!doc) {
      doc = await Market.create({ userId: req.user._id })
    }

    const item = { name, category, notes: notes || '' }
    if (category === 'store') doc.stores.unshift(item)
    else if (category === 'competitor') doc.competitors.unshift(item)
    else doc.suppliers.unshift(item)
    await doc.save()

    res.status(201).json(toResponse(doc))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/item/:category/:id', async (req, res) => {
  try {
    const { category, id } = req.params
    const { name, notes, category: newCategory } = req.body
    if (!['store', 'competitor', 'supplier'].includes(category)) {
      return res.status(400).json({ message: 'Invalid category' })
    }

    const doc = await Market.findOne({ userId: req.user._id })
    if (!doc) return res.status(404).json({ message: 'Not found' })

    const arr = doc[category + 's']
    const item = arr.id(id)
    if (!item) return res.status(404).json({ message: 'Item not found' })

    if (name != null && name.trim()) item.name = name.trim()
    if (notes != null) item.notes = String(notes)
    if (newCategory && ['store', 'competitor', 'supplier'].includes(newCategory) && newCategory !== category) {
      arr.pull(id)
      const newArr = doc[newCategory + 's']
      newArr.unshift({ name: item.name, category: newCategory, notes: item.notes || '' })
    }
    await doc.save()

    res.json(toResponse(doc))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.delete('/item/:category/:id', async (req, res) => {
  try {
    const { category, id } = req.params
    if (!['store', 'competitor', 'supplier'].includes(category)) {
      return res.status(400).json({ message: 'Invalid category' })
    }

    const doc = await Market.findOne({ userId: req.user._id })
    if (!doc) return res.status(404).json({ message: 'Not found' })

    const arr = doc[category + 's']
    const item = arr.id(id)
    if (!item) return res.status(404).json({ message: 'Item not found' })

    arr.pull(id)
    await doc.save()

    res.json(toResponse(doc))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
