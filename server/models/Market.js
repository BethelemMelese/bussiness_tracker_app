import mongoose from 'mongoose'

const researchItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['store', 'competitor', 'supplier'],
    required: true,
  },
  notes: { type: String, default: '' },
}, { _id: true })

const marketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  stores: [researchItemSchema],
  competitors: [researchItemSchema],
  suppliers: [researchItemSchema],
}, {
  timestamps: true,
})

export default mongoose.model('Market', marketSchema)
