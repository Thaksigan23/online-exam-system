import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { isTeacher, isStudent } from '../middleware/roleCheck.js';
import ExamLink from '../models/ExamLink.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';
import generateResultPDF from '../utils/generatePDF.js';
import sendEmail from '../utils/sendEmail.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const DEFAULT_EXAM_LINK = 'default-online-quiz';

const hashStringToSeed = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const mulberry32 = (seed) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let n = Math.imul(t ^ (t >>> 15), 1 | t);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleWithSeed = (items, seed) => {
  const rand = mulberry32(seed);
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const getOrCreateActiveExam = async () => {
  let exam = await ExamLink.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (!exam) {
    exam = await ExamLink.create({
      title: 'Online Quiz',
      link: DEFAULT_EXAM_LINK,
      durationMinutes: 30,
      isActive: true,
    });
  }
  return exam;
};

const getExamQuestions = async (examId) =>
  Question.find({
    $or: [{ examId }, { examId: null }],
  }).lean();

router.post('/', authMiddleware, isTeacher, async (req, res) => {
  try {
    const { title, link, questions = [], durationMinutes } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required.' });
    }

    const exam = new ExamLink({
      title: title || 'Online Quiz',
      link: link || `${DEFAULT_EXAM_LINK}-${Date.now()}`,
      durationMinutes: Number(durationMinutes) > 0 ? Number(durationMinutes) : 30,
      createdBy: req.user._id,
      isActive: true,
    });
    await exam.save();
    await ExamLink.updateMany({ _id: { $ne: exam._id } }, { $set: { isActive: false } });

    for (const q of questions) {
      const question = new Question({
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        examId: exam._id,
      });
      await question.save();
    }

    res.status(201).json({ message: 'Exam created successfully', examId: exam._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

router.get('/questions', authMiddleware, isStudent, async (req, res) => {
  try {
    const exam = await getOrCreateActiveExam();
    const existingAttempt = await Result.findOne({ studentId: req.user._id, examId: exam._id }).lean();
    if (existingAttempt) {
      return res.status(409).json({
        message: 'You have already submitted this quiz. Only one attempt is allowed.',
        alreadySubmitted: true,
      });
    }

    const questions = await getExamQuestions(exam._id);
    const shuffleSeed = hashStringToSeed(`${req.user._id.toString()}-${exam._id.toString()}`);
    const shuffledQuestions = shuffleWithSeed(
      questions.map((q, index) => ({
        ...q,
        options: shuffleWithSeed(q.options, shuffleSeed + index + 1),
      })),
      shuffleSeed
    ).map((q) => ({
      _id: q._id,
      text: q.text,
      options: q.options,
    }));

    res.json({
      examId: exam._id,
      title: exam.title,
      durationMinutes: exam.durationMinutes || 30,
      questions: shuffledQuestions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error loading exam questions' });
  }
});

router.post('/submit', authMiddleware, isStudent, async (req, res) => {
  try {
    const { answers = {}, autoSubmitted = false } = req.body;
    const exam = await getOrCreateActiveExam();

    const existingAttempt = await Result.findOne({ studentId: req.user._id, examId: exam._id }).lean();
    if (existingAttempt) {
      return res.status(409).json({ message: 'Attempt already submitted. Retakes are not allowed.' });
    }

    const questions = await getExamQuestions(exam._id);
    if (questions.length === 0) {
      return res.status(400).json({ message: 'No questions available for the current exam.' });
    }

    let score = 0;
    const answerSummary = questions.map((q) => {
      const selectedAnswer = answers[q._id?.toString()] || '';
      const isCorrect = selectedAnswer === q.correctAnswer;
      if (isCorrect) score += 1;

      return {
        questionId: q._id,
        question: q.text,
        selectedAnswer: selectedAnswer || 'No Answer',
        correctAnswer: q.correctAnswer,
        isCorrect,
      };
    });

    const total = questions.length;
    const result = new Result({
      studentId: req.user._id,
      examId: exam._id,
      answers: answerSummary,
      score,
      total,
      autoSubmitted: Boolean(autoSubmitted),
      shuffleSeed: hashStringToSeed(`${req.user._id.toString()}-${exam._id.toString()}`),
    });
    await result.save();

    const student = req.user;
    const filePath = path.resolve(`./temp/result_${result._id}.pdf`);
    const pdfAnswerSummary = answerSummary.map((answer) => ({
      question: answer.question,
      answer: answer.selectedAnswer,
      correctAnswer: answer.correctAnswer,
      isCorrect: answer.isCorrect,
    }));
    const pdfBuffer = await generateResultPDF(student.name, score, total, pdfAnswerSummary);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, pdfBuffer);

    try {
      await sendEmail({
        to: student.email,
        subject: `Your Quiz Result: ${exam.title}`,
        text: `Hi ${student.name},\n\nYour score for "${exam.title}" is ${result.score}/${result.total}.`,
        attachments: [{ filename: 'quiz-result.pdf', path: filePath }],
      });
    } catch (emailError) {
      console.error('Failed to send result email:', emailError.message);
    }

    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete temp PDF:', err);
    });

    res.json({
      message: 'Exam submitted successfully',
      score,
      total,
      autoSubmitted: Boolean(autoSubmitted),
      answers: answerSummary,
      submittedAt: result.submittedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const filter = req.user.role === 'teacher' ? {} : { studentId: req.user._id };
    const results = await Result.find(filter).lean();
    const examsTaken = results.length;
    const totalAnswers = results.reduce((sum, result) => sum + (result.total || 0), 0);
    const correctAnswers = results.reduce((sum, result) => sum + (result.score || 0), 0);
    const averageScore = examsTaken === 0 ? 0 : Number((correctAnswers / examsTaken).toFixed(2));

    res.json({ examsTaken, totalAnswers, correctAnswers, averageScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch exam stats' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user._id }).sort({ submittedAt: 1 }).lean();
    res.json(
      results.map((result) => ({
        date: new Date(result.submittedAt || result.createdAt).toLocaleDateString(),
        score: result.total ? Math.round((result.score / result.total) * 100) : 0,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch exam history' });
  }
});

router.get('/:link', authMiddleware, isStudent, async (req, res) => {
  try {
    const exam = await ExamLink.findOne({ link: req.params.link, isActive: true }).lean();
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const questions = await getExamQuestions(exam._id);
    res.json({
      examId: exam._id,
      title: exam.title,
      durationMinutes: exam.durationMinutes || 30,
      questions: questions.map((q) => ({ _id: q._id, text: q.text, options: q.options })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load exam' });
  }
});

export default router;
