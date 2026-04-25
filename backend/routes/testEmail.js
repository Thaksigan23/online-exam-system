import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/send-test-email', async (req, res) => {
  const { to, subject, html } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password'
      }
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

export default router;
