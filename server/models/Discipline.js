import mongoose from 'mongoose'

const habitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  checkedDays: { type: [Boolean], default: Array(21).fill(false) },
  startDate: { type: String, default: '' },
  habitFormed: { type: Boolean, default: false },
}, { _id: true })

const disciplineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  habits: [habitSchema],
}, {
  timestamps: true,
})

export default mongoose.model('Discipline', disciplineSchema)
