// utils/generatePDF.js
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

const generateResultPDF = async (studentName, score, total, answers) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    doc.fontSize(20).text('Exam Results', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Student: ${studentName}`);
    doc.text(`Score: ${score} / ${total}`);
    doc.moveDown();

    if (answers && answers.length > 0) {
      doc.text('Answers:', { underline: true });
      answers.forEach((a, index) => {
        doc.text(
          `${index + 1}. Q: ${a.question}\n   Your Answer: ${a.answer}\n   Correct Answer: ${a.correctAnswer}\n   ${a.isCorrect ? '✅ Correct' : '❌ Incorrect'}`
        );
        doc.moveDown(0.5);
      });
    }

    doc.end();
  });
};

export default generateResultPDF;
