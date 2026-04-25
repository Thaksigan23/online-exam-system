import mongoose from 'mongoose';

const ExamResultSchema = new mongoose.Schema({
  studentName: String,
  studentEmail: String,
  score: Number,
  answers: Array,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ExamResult = mongoose.model('ExamResult', ExamResultSchema);

export default ExamResult;
