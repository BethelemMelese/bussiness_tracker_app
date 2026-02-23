import mongoose from 'mongoose'

const studyEntrySchema = new mongoose.Schema({
  hours: { type: Number, required: true },
  topic: { type: String, default: 'General' },
  date: { type: String, required: true },
}, { _id: true })

const studySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  dailyHours: { type: Number, default: 0 },
  topics: [studyEntrySchema],
}, {
  timestamps: true,
})

export default mongoose.model('Study', studySchema)
