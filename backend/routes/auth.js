import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import authMiddleware from '../middleware/auth.js'; // ✅ Correct default import


const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ Error in register:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});


router.get('/students', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teachers only.' });
    }

    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

router.get('/test-email', async (req, res) => {
  try {
    await sendEmail({
      to: 'yourpersonalemail@gmail.com',
      subject: 'Test Email',
      text: 'This is a test message!',
    });
    res.send('Email sent!');
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).send('Failed to send email.');
  }
});

export default router; // ✅ CORRECT
