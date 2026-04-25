import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { isTeacher } from '../middleware/roleCheck.js';

import Result from '../models/Result.js';

const router = express.Router();

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user._id })
      .populate('examId', 'title durationMinutes')
      .sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch student results' });
  }
});

const getTeacherResults = async (req, res) => {
  try {
    const {
      studentName,
      studentEmail,
      examTitle,
      minScore,
      maxScore,
      startDate,
      endDate,
      page = 1
    } = req.query;

    const filters = {};
    const limit = Number(req.query.limit || 100);

    if (minScore || maxScore) {
      filters.score = {};
      if (minScore) filters.score.$gte = Number(minScore);
      if (maxScore) filters.score.$lte = Number(maxScore);
    }

    if (startDate || endDate) {
      filters.submittedAt = {};
      if (startDate) filters.submittedAt.$gte = new Date(startDate);
      if (endDate) filters.submittedAt.$lte = new Date(endDate);
    }

    let query = Result.find(filters)
      .populate('studentId', 'name email')
      .populate('examId', 'title')
      .sort({ submittedAt: -1 });

    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const results = await query.exec();
    let filteredResults = results;

    if (studentName) {
      filteredResults = filteredResults.filter((r) =>
        r.studentId?.name.toLowerCase().includes(studentName.toLowerCase())
      );
    }
    if (studentEmail) {
      filteredResults = filteredResults.filter((r) =>
        r.studentId?.email.toLowerCase().includes(studentEmail.toLowerCase())
      );
    }
    if (examTitle) {
      filteredResults = filteredResults.filter((r) =>
        r.examId?.title.toLowerCase().includes(examTitle.toLowerCase())
      );
    }

    res.json(filteredResults);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch results' });
  }
};

router.get('/', authMiddleware, isTeacher, getTeacherResults);
router.get('/all', authMiddleware, isTeacher, getTeacherResults);

router.get('/analytics', authMiddleware, isTeacher, async (req, res) => {
  try {
    const results = await Result.find().populate('examId', 'title').lean();
    const attemptCount = results.length;
    const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
    const totalPossible = results.reduce((sum, result) => sum + (result.total || 0), 0);
    const averageScore = attemptCount === 0 ? 0 : Number((totalScore / attemptCount).toFixed(2));
    const passRate = attemptCount === 0
      ? 0
      : Number(((results.filter((r) => r.total > 0 && r.score / r.total >= 0.5).length / attemptCount) * 100).toFixed(2));

    const questionPerformanceMap = new Map();
    for (const result of results) {
      for (const answer of result.answers || []) {
        if (!questionPerformanceMap.has(answer.questionId?.toString())) {
          questionPerformanceMap.set(answer.questionId?.toString(), {
            questionId: answer.questionId,
            question: answer.question,
            totalAttempts: 0,
            correctAttempts: 0,
          });
        }
        const entry = questionPerformanceMap.get(answer.questionId?.toString());
        entry.totalAttempts += 1;
        if (answer.isCorrect) entry.correctAttempts += 1;
      }
    }

    const questionPerformance = [...questionPerformanceMap.values()]
      .map((item) => ({
        ...item,
        accuracy: item.totalAttempts === 0 ? 0 : Number(((item.correctAttempts / item.totalAttempts) * 100).toFixed(2)),
      }))
      .sort((a, b) => a.accuracy - b.accuracy);

    res.json({
      attemptCount,
      averageScore,
      passRate,
      totalScore,
      totalPossible,
      questionPerformance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

export default router;
