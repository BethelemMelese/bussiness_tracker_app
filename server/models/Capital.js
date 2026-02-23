import mongoose from 'mongoose'

const capitalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  monthlyIncome: { type: Number, default: 0 },
  savings: { type: Number, default: 0 },
  target: { type: Number, default: 10000 },
}, {
  timestamps: true,
})

export default mongoose.model('Capital', capitalSchema)
