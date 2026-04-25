import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    question: { type: String, required: true },
    selectedAnswer: { type: String, default: '' },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamLink',
    required: true,
  },
  score: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  answers: {
    type: [answerSchema],
    default: [],
  },
  shuffleSeed: {
    type: Number,
    default: 0,
  },
  autoSubmitted: {
    type: Boolean,
    default: false,
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

resultSchema.index({ studentId: 1, examId: 1 }, { unique: true });

const Result = mongoose.model('Result', resultSchema);
export default Result;