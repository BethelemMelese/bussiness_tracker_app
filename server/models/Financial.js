import mongoose from 'mongoose'

const financialSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  costPerUnit: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  monthlyFixedCosts: { type: Number, default: 0 },
  unitsSoldPerMonth: { type: Number, default: 0 },
}, {
  timestamps: true,
})

export default mongoose.model('Financial', financialSchema)
