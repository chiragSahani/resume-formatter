const express = require('express');
const fs = require('fs');
const multer = require('multer');
const { parseAndFormatCV, extractText } = require('../services/aiProcessor');
const CVModel = require('../models/CVModel');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const router = express.Router();

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// POST /api/cv/upload - Upload and format a CV
router.post('/upload', upload.single('cv'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const originalText = await extractText(file);
    const formattedData = await parseAndFormatCV(originalText);

    const newCV = new CVModel({
      originalFileName: file.originalname,
      ...formattedData
    });
    await newCV.save();

    res.json({ cvData: newCV, originalText });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  } finally {
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
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

// Helper to generate a standardized filename
const generateFilename = (cv, extension) => {
  const name = cv.header?.name || 'Candidate';
  const candidateBHNo = 'BH12345'; // Placeholder
  return `${name} (${candidateBHNo}) Client CV.${extension}`;
};

// GET /api/cv/:id/export-docx - Export as .docx
router.get('/:id/export-docx', async (req, res) => {
    try {
      const cv = await CVModel.findById(req.params.id);
      if (!cv) return res.status(404).json({ error: 'CV not found' });

      const FONT_FAMILY = 'Palatino Linotype';

      const doc = new Document({
        creator: 'EHS CV Formatter',
        title: `CV for ${cv.header.name}`,
        styles: {
          default: {
            document: {
              run: {
                font: FONT_FAMILY,
                size: '22pt', // 11pt
              },
            },
          },
        },
        sections: [{
          children: [
            new Paragraph({
              children: [new TextRun({ text: cv.header.name, bold: true, size: '48pt' })], // 24pt
            }),
            new Paragraph({
              children: [new TextRun({ text: cv.header.title, bold: true, size: '36pt' })], // 18pt
            }),
            new Paragraph({
              text: `Email: ${cv.header.email} | Phone: ${cv.header.phone}`,
              spacing: { after: 200 },
            }),
            new Paragraph({ text: 'Profile', heading: 'Heading1', spacing: { before: 200, after: 100 } }),
            new Paragraph(cv.summary || ''),

            new Paragraph({ text: 'Experience', heading: 'Heading1', spacing: { before: 200, after: 100 } }),
            ...(cv.experience || []).flatMap(exp => [
              new Paragraph({
                children: [
                  new TextRun({ text: `${exp.title} at ${exp.company}`, bold: true }),
                  new TextRun({ text: `\t${exp.startDate} - ${exp.endDate}` }).break(),
                ],
              }),
              ...(exp.responsibilities || []).map(r => new Paragraph({ text: r, bullet: { level: 0 } })),
              new Paragraph(''), // spacing
            ]),

            new Paragraph({ text: 'Education', heading: 'Heading1', spacing: { before: 200, after: 100 } }),
            ...(cv.education || []).map(edu => new Paragraph(`${edu.degree} from ${edu.institution} (${edu.year})`)),

            new Paragraph({ text: 'Key Skills', heading: 'Heading1', spacing: { before: 200, after: 100 } }),
            new Paragraph({ text: (cv.skills || []).join(', ') }),

            ...(cv.interests && cv.interests.length > 0 ? [
              new Paragraph({ text: 'Interests', heading: 'Heading1', spacing: { before: 200, after: 100 } }),
              new Paragraph({ text: cv.interests.join(', ') })
            ] : []),

            ...(cv.personalDetails ? [
              new Paragraph({ text: 'Personal Details', heading: 'Heading1', spacing: { before: 200, after: 100 } }),
              new Paragraph(`Nationality: ${cv.personalDetails.nationality || 'N/A'}`),
              new Paragraph(`Languages: ${cv.personalDetails.languages || 'N/A'}`),
              new Paragraph(`Date of Birth: ${cv.personalDetails.dob || 'N/A'}`),
              new Paragraph(`Marital Status: ${cv.personalDetails.maritalStatus || 'N/A'}`),
            ] : []),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const filename = generateFilename(cv, 'docx');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.send(buffer);
    } catch (err) {
      console.error('DOCX Export Error:', err);
      res.status(500).json({ error: 'Failed to export DOCX', details: err.message });
    }
  });

// GET /api/cv/:id/export-pdf - Export as .pdf
router.get('/:id/export-pdf', async (req, res) => {
  try {
    const cv = await CVModel.findById(req.params.id);
    if (!cv) return res.status(404).json({ error: 'CV not found' });

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { height } = page.getSize();

    const palatinoFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const palatinoBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    let y = height - 50;
    const leftMargin = 50;

    const addLine = (text, options = {}) => {
      const { font = palatinoFont, size = 11, spaceAfter = 0, x = leftMargin } = options;
      if (y < 50) {
        page = pdfDoc.addPage();
        y = page.getSize().height - 50;
      }
      page.drawText(String(text || ''), { x, y, font, size });
      y -= size + 5 + spaceAfter;
    };

    const addHeading = (text) => {
      y -= 10;
      addLine(text, { font: palatinoBoldFont, size: 14 });
      y -= 5;
    };

    addLine(cv.header.name, { font: palatinoBoldFont, size: 24 });
    addLine(cv.header.title, { font: palatinoBoldFont, size: 18, spaceAfter: 10 });
    addLine(`Email: ${cv.header.email} | Phone: ${cv.header.phone}`, { spaceAfter: 20 });

    addHeading('Profile');
    addLine(cv.summary || '', { spaceAfter: 20 });

    addHeading('Experience');
    (cv.experience || []).forEach(exp => {
      addLine(`${exp.title} at ${exp.company}`, { font: palatinoBoldFont, size: 12 });
      addLine(`${exp.startDate} - ${exp.endDate}`, { size: 10 });
      (exp.responsibilities || []).forEach(r => addLine(`• ${r}`, { x: leftMargin + 15 }));
      y -= 10;
    });

    addHeading('Education');
    (cv.education || []).forEach(edu => addLine(`${edu.degree} from ${edu.institution} (${edu.year})`));
    y -= 20;

    addHeading('Key Skills');
    addLine((cv.skills || []).join(', '), { spaceAfter: 20 });

    if (cv.interests && cv.interests.length > 0) {
      addHeading('Interests');
      addLine(cv.interests.join(', '), { spaceAfter: 20 });
    }

    if (cv.personalDetails) {
      addHeading('Personal Details');
      addLine(`Nationality: ${cv.personalDetails.nationality || 'N/A'}`);
      addLine(`Languages: ${cv.personalDetails.languages || 'N/A'}`);
    }

    const pdfBytes = await pdfDoc.save();
    const filename = generateFilename(cv, 'pdf');

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdfBytes));

  } catch (err) {
    console.error('PDF Export Error:', err);
    res.status(500).json({ error: 'Failed to export PDF. ' + err.message });
  }
});

module.exports = router;