const express = require('express');
const multer = require('multer');
const { parseAndFormatCV } = require('../services/aiProcessor');
const CVModel = require('../models/CVModel');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/cv/upload
router.post('/upload', upload.single('cv'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // This now supports OCR automatically (thanks to aiProcessor.js)
    const { formattedCV, originalText } = await parseAndFormatCV(file);

    const newCV = new CVModel({
      originalFileName: file.originalname,
      ...formattedCV
    });
    await newCV.save();

    res.json({ cvData: newCV, originalText });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;
