// utils/generateResultPDF.js
import fs from 'fs';
import PDFDocument from 'pdfkit';

export default function generateResultPDF(result, student, exam, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text('Exam Result Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Student: ${student.name}`);
    doc.text(`Email: ${student.email}`);
    doc.text(`Exam: ${exam.title}`);
    doc.text(`Score: ${result.score} / ${result.total}`);
    doc.text(`Date: ${new Date(result.createdAt).toLocaleString()}`);
    doc.moveDown();

    doc.text('Thank you for participating!', { align: 'center' });
    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}
