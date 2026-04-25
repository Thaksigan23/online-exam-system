import express from 'express';
import authMiddleware from '../middleware/auth.js';
import ExamLink from '../models/ExamLink.js';

const router = express.Router();

/**
 * @route   POST /api/examlink
 * @desc    Set or update the exam link (Teachers only)
 * @access  Private (Teachers)
 */
router.post('/', authMiddleware, async (req, res) => {
  // Only teachers allowed
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied: Teachers only' });
  }

  const { url, startTime, endTime } = req.body;

  if (!url || !startTime || !endTime) {
    return res.status(400).json({ message: 'URL, start time, and end time are required.' });
  }

  try {
    let link = await ExamLink.findOne();
    if (link) {
      link.url = url;
      link.startTime = new Date(startTime);
      link.endTime = new Date(endTime);
      await link.save();
    } else {
      link = new ExamLink({
        url,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });
      await link.save();
    }
    res.status(200).json({ message: 'Link and time window saved successfully.' });
  } catch (err) {
    console.error('❌ Error saving exam link:', err);
    res.status(500).json({ message: 'Failed to save exam link.' });
  }
});

/**
 * @route   GET /api/examlink
 * @desc    Get the current exam link (All authenticated users)
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const link = await ExamLink.findOne();
    if (!link) {
      return res.status(404).json({ message: 'No exam link found.' });
    }

    res.json({
      url: link.url,
      startTime: link.startTime,
      endTime: link.endTime,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get exam link.' });
  }
});

export default router;
