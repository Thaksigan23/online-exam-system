import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import examRoutes from './routes/exams.js';
import examLinkRoutes from './routes/examlink.js';
import resultRoutes from './routes/results.js';
import sendEmail from './utils/sendEmail.js';
import testEmailRoutes from './routes/testEmail.js';

dotenv.config();

const app = express();

const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];
const configuredOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : defaultOrigins;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// ✅ Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/examlink', examLinkRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/email', testEmailRoutes);

// ✅ MongoDB connection and start server
try {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is missing in .env');
  }

  await mongoose.connect(mongoUri);

  console.log('✅ MongoDB connected');

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      await sendEmail({
        to: 'student@example.com',
        subject: 'Test Email',
        text: 'You passed the exam!',
      });
      console.log('📧 Test email sent');
    } catch (err) {
      console.error('❌ Failed to send test email:', err.message);
    }
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('❌ MongoDB connection error:', err.message);
}
