const express = require('express');
const CVModel = require('../models/CVModel');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { PDFDocument, StandardFonts } = require('pdf-lib');

const router = express.Router();

// Helper: Convert CV JSON to plain text
const cvToText = (cv) => {
  let text = `${cv.header.name}\n${cv.header.title}\n\n`;
  text += `Email: ${cv.header.email} | Phone: ${cv.header.phone}\n`;
  text += `LinkedIn: ${cv.header.linkedin} | Website: ${cv.header.website}\n\n`;
  text += `--- Summary ---\n${cv.summary}\n\n`;

  text += `--- Experience ---\n`;
  cv.experience.forEach(exp => {
    text += `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n`;
    exp.responsibilities.forEach(r => text += `- ${r}\n`);
    text += '\n';
  });

  text += `--- Education ---\n`;
  cv.education.forEach(edu => {
    text += `${edu.degree} from ${edu.institution} (${edu.year})\n`;
  });

  text += '\n--- Skills ---\n' + cv.skills.join(', ');
  return text;
};

// TXT export
router.get('/:id/export', async (req, res) => {
  try {
    const cv = await CVModel.findById(req.params.id);
    if (!cv) return res.status(404).json({ error: 'CV not found' });
    const textContent = cvToText(cv);
    res.setHeader('Content-Disposition', `attachment; filename="${cv.header.name}_CV.txt"`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(textContent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export CV' });
  }
});

// DOCX export
router.get('/:id/export-docx', async (req, res) => {
  try {
    const cv = await CVModel.findById(req.params.id);
    if (!cv) return res.status(404).json({ error: 'CV not found' });

    const textContent = cvToText(cv);
    const paragraphs = textContent.split('\n').map(line => new Paragraph({ children: [new TextRun(line)] }));
    const doc = new Document({ sections: [{ children: paragraphs }] });
    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Disposition', `attachment; filename="${cv.header.name}_CV.docx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export DOCX' });
  }
});

// PDF export (same as your code)
router.get('/:id/export-pdf', async (req, res) => {
  try {
    const cv = await CVModel.findById(req.params.id);
    if (!cv) return res.status(404).json({ error: 'CV not found' });

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;
    const addLine = (text, { f = font, size = 12, spaceAfter = 0 } = {}) => {
      if (y < 50) { page = pdfDoc.addPage(); y = height - 50; }
      page.drawText(String(text || ''), { x: 50, y, font: f, size });
      y -= size + 5 + spaceAfter;
    };

    addLine(cv.header?.name, { f: boldFont, size: 24 });
    addLine(cv.header?.title, { f: boldFont, size: 18, spaceAfter: 10 });
    addLine(`Email: ${cv.header?.email || ''} | Phone: ${cv.header?.phone || ''}`, { spaceAfter: 20 });

    if (cv.summary) {
      addLine('Summary', { f: boldFont, size: 16 });
      addLine(cv.summary, { spaceAfter: 20 });
    }

    if (cv.experience?.length) {
      addLine('Experience', { f: boldFont, size: 16 });
      cv.experience.forEach(exp => {
        addLine(`${exp.title} at ${exp.company}`, { f: boldFont, size: 14 });
        addLine(`${exp.startDate} - ${exp.endDate}`, { size: 10 });
        exp.responsibilities?.forEach(r => addLine(`- ${r}`));
        y -= 10;
      });
    }

    if (cv.education?.length) {
      addLine('Education', { f: boldFont, size: 16 });
      cv.education.forEach(edu => addLine(`${edu.degree} from ${edu.institution} (${edu.year})`));
      y -= 20;
    }

    if (cv.skills?.length) {
      addLine('Skills', { f: boldFont, size: 16 });
      page.drawText(cv.skills.join(', '), { x: 50, y, font, size: 12 });
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Disposition', `attachment; filename="${cv.header.name}_CV.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

module.exports = router;
