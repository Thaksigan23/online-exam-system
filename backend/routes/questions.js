import express from 'express';
import Question from '../models/Question.js';
import ExamLink from '../models/ExamLink.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// To keep track of exam release status globally (simple approach)
let examReleaseStatus = false;

// GET /api/questions
// Get all questions + exam release status
// ✅ CORRECT GET /api/examlink
router.get('/examlink', authMiddleware, async (req, res) => {
  try {
    const link = await ExamLink.findOne();
    if (!link) {
      return res.status(404).json({ message: 'No exam link found.' });
    }
    res.json({ url: link.url });
  } catch (err) {
    console.error('❌ Error fetching exam link:', err);
    res.status(500).json({ message: 'Failed to get exam link.' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const questions = await Question.find().lean();
    res.json({ questions, isReleased: examReleaseStatus });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error fetching questions.' });
  }
});

// POST /api/questions
// Add new question (teachers only)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { text, options, correctAnswer } = req.body;
  if (!text || !options || options.length !== 4 || !correctAnswer) {
    return res.status(400).json({ message: 'Invalid question data' });
  }
  try {
    const newQuestion = new Question({ text, options, correctAnswer });
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ message: 'Server error adding question' });
  }
});

// DELETE /api/questions/:id
// Delete question by id (teachers only)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    await question.remove();
    res.json({ message: 'Question deleted' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Server error deleting question' });
  }
});

// PATCH /api/questions/release
// Toggle exam release status (teachers only)
router.patch('/release', authMiddleware, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { isReleased } = req.body;
  if (typeof isReleased !== 'boolean') {
    return res.status(400).json({ message: 'Invalid release status' });
  }

  examReleaseStatus = isReleased;
  res.json({ message: `Exam release status set to ${isReleased}` });
});


export default router;
