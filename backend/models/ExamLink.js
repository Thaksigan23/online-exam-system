import mongoose from 'mongoose';

const examLinkSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Online Quiz',
    trim: true,
  },
  url: {
    type: String,
    default: '',
  },
  link: {
    type: String,
    default: 'default-online-quiz',
    trim: true,
  },
  durationMinutes: {
    type: Number,
    default: 30,
    min: 1,
  },
  startTime: {
    type: Date,
    default: null,
  },
  endTime: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
});

const ExamLink = mongoose.model('ExamLink', examLinkSchema);
export default ExamLink;
