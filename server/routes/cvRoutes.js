const express = require('express');
const fs = require('fs');
const multer = require('multer');
const { parseAndFormatCV } = require('../services/aiProcessor');
const CVModel = require('../models/CVModel');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const router = express.Router();

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// POST /api/cv/upload - Upload and format a CV
router.post('/upload', upload.single('cv'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const formattedData = await parseAndFormatCV(file);
    const newCV = new CVModel({
      originalFileName: file.originalname,
      ...formattedData
    });
    await newCV.save();
    res.json(newCV);
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET /api/cv/all - Get all CVs
router.get('/all', async (req, res) => {
  try {
    const cvs = await CVModel.find().sort({ uploadDate: -1 });
    res.json(cvs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch CVs' });
  }
});

// GET /api/cv/:id - Get a single CV by ID
router.get('/:id', async (req, res) => {
  try {
    const cv = await CVModel.findById(req.params.id);
    if (!cv) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json(cv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch CV' });
  }
});

// PUT /api/cv/:id - Update a CV
router.put('/:id', async (req, res) => {
  try {
    const updatedCV = await CVModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCV) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json(updatedCV);
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ error: 'Failed to update CV' });
  }
});

// Helper to convert CV JSON to a simple text format
const cvToText = (cv) => {
  let text = ``;
  text += `${cv.header.name}\n`;
  text += `${cv.header.title}\n\n`;
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
  text += '\n--- Skills ---\n';
  text += cv.skills.join(', ');
  return text;
};

// GET /api/cv/:id/export - Export CV as .txt
router.get('/:id/export', async (req, res) => {
  try {
    const cv = await CVModel.findById(req.params.id);
    if (!cv) return res.status(404).json({ error: 'CV not found' });
    const textContent = cvToText(cv);
    const filename = `${cv.header.name.replace(/ /g, '_')}_CV.txt`;
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(textContent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export CV' });
  }
});

// GET /api/cv/:id/export-docx - Export as .docx
router.get('/:id/export-docx', async (req, res) => {
  try {
    const cv = await CVModel.findById(req.params.id);
    if (!cv) return res.status(404).json({ error: 'CV not found' });
    const textContent = cvToText(cv);
    const paragraphs = textContent.split('\n').map(line => new Paragraph({ children: [new TextRun(line)] }));
    const doc = new Document({ sections: [{ children: paragraphs }] });
    const buffer = await Packer.toBuffer(doc);
    const filename = `${cv.header.name.replace(/ /g, '_')}_CV.docx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (err) {
    console.error('DOCX Export Error:', err);
    res.status(500).json({ error: 'Failed to export DOCX' });
  }
});

// GET /api/cv/:id/export-pdf - Export as .pdf
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

    const addLine = (text, options = {}) => {
      const { f = font, size = 12, spaceAfter = 0 } = options;
      if (y < 50) {
        page = pdfDoc.addPage();
        y = page.getSize().height - 50;
      }
      // Ensure text is a string
      const textToDraw = String(text || '');
      page.drawText(textToDraw, { x: 50, y, font: f, size });
      y -= size + 5 + spaceAfter;
    };

    addLine(cv.header?.name, { f: boldFont, size: 24 });
    addLine(cv.header?.title, { f: boldFont, size: 18, spaceAfter: 10 });
    addLine(`Email: ${cv.header?.email || ''} | Phone: ${cv.header?.phone || ''}`, { spaceAfter: 20 });

    if (cv.summary) {
        addLine('Summary', { f: boldFont, size: 16 });
        addLine(cv.summary, { spaceAfter: 20 });
    }

    if (cv.experience && cv.experience.length > 0) {
        addLine('Experience', { f: boldFont, size: 16 });
        cv.experience.forEach(exp => {
          addLine(`${exp.title || ''} at ${exp.company || ''}`, { f: boldFont, size: 14 });
          addLine(`${exp.startDate || ''} - ${exp.endDate || ''}`, { size: 10 });
          if (exp.responsibilities && exp.responsibilities.length > 0) {
            exp.responsibilities.forEach(r => addLine(`- ${r || ''}`));
          }
          y -= 10;
        });
    }

    if (cv.education && cv.education.length > 0) {
        addLine('Education', { f: boldFont, size: 16 });
        cv.education.forEach(edu => {
          addLine(`${edu.degree || ''} from ${edu.institution || ''} (${edu.year || ''})`);
        });
        y -= 20;
    }

    if (cv.skills && cv.skills.length > 0) {
        addLine('Skills', { f: boldFont, size: 16 });
        page.drawText((cv.skills || []).join(', '), { x: 50, y, font, size: 12 });
    }

    const pdfBytes = await pdfDoc.save();
    const filename = `${(cv.header?.name || 'CV').replace(/ /g, '_')}_CV.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdfBytes));

  } catch (err) {
    console.error('PDF Export Error:', err);
    res.status(500).json({ error: 'Failed to export PDF. ' + err.message });
  }
});

module.exports = router;