import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamLink',
    default: null,
    index: true,
  },
  text: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true }
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
