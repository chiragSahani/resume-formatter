const express = require('express');
const multer = require('multer');
const { parseAndFormatCV } = require('../services/aiProcessor'); // Updated import
const CVModel = require('../models/CVModel');

const router = express.Router();

// Configure multer for file uploads. It will save files to a temporary 'uploads/' directory.
const upload = multer({ dest: 'uploads/' });


/**
 * @route   POST /api/cv/upload
 * @desc    Upload, parse, and store a CV
 * @access  Public
 */
router.post('/upload', upload.single('cv'), async (req, res) => {
  // Use a try...catch block for robust error handling throughout the async process.
  try {
    const file = req.file;
    if (!file) {
      // If multer doesn't provide a file, send a bad request error.
      return res.status(400).json({ error: 'No file was uploaded. Please attach a CV file.' });
    }

    console.log(`Processing file: ${file.originalname}`);

    // --- Simplified Service Call ---
    // The aiProcessor service now handles everything internally:
    // 1. Extracts text (from DOCX, PDF, or by OCR on images).
    // 2. Heuristically detects and crops a photo using Tesseract.js.
    // 3. Uploads the cropped photo to Cloudinary.
    // 4. Formats all extracted data into a JSON object using the Gemini AI.
    // 5. Returns the final CV object with the Cloudinary photoUrl included.
    const { formattedCV, originalText } = await parseAndFormatCV(file);

    // Create a new MongoDB document instance using the Mongoose model.
    // The formattedCV object, including the photoUrl, is spread into the new document.
    const newCV = new CVModel({
      originalFileName: file.originalname,
      ...formattedCV
    });

    // Asynchronously save the new document to the database.
    await newCV.save();
    console.log(`Successfully saved CV for ${newCV.header.name} to the database.`);

    // Send a success response with the newly created CV data and the original text.
    res.status(201).json({
      message: 'CV uploaded and processed successfully!',
      cvData: newCV,
      originalText
    });

  } catch (err) {
    // If any error occurs during the process, log it and send a generic server error.
    console.error('CV Upload Process Failed:', err);
    res.status(500).json({ error: err.message || 'An unexpected error occurred on the server.' });
  }
});

module.exports = router;