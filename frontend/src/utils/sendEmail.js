const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

async function generatePdfBuffer(name, score, examDetails) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    doc.fontSize(20).text('Exam Result', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Name: ${name}`);
    doc.text(`Score: ${score}`);
    doc.moveDown();

    if (Array.isArray(examDetails)) {
      examDetails.forEach((q, idx) => {
        doc.text(`Q${idx + 1}: ${q.question}`);
        doc.text(`Your Answer: ${q.answer}`);
        doc.text(`Correct Answer: ${q.correctAnswer}`);
        doc.moveDown();
      });
    }

    doc.end();
  });
}

async function sendEmailWithPdf(to, subject, htmlMessage, pdfBuffer) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or your mail provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlMessage,
    attachments: [
      {
        filename: 'Exam_Result.pdf',
        content: pdfBuffer,
      },
    ],
  });
}

module.exports = { sendEmailWithPdf, generatePdfBuffer };

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Online Exam" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log('📨 Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

module.exports = sendEmail;
