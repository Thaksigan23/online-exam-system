import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import examRoutes from './routes/exams.js';
import examLinkRoutes from './routes/examlink.js';
import resultRoutes from './routes/results.js';
import sendEmail from './utils/sendEmail.js';
import testEmailRoutes from './routes/testEmail.js';

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
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
