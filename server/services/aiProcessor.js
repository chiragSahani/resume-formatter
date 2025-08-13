const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fetch = require('node-fetch');

require('dotenv').config();

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

/**
 * Extracts raw text from a file buffer.
 * @param {Buffer} buffer - The file buffer.
 * @param {string} originalname - The original file name.
 * @returns {Promise<string>} The extracted text content.
 */
async function extractText(buffer, originalname) {
  const ext = path.extname(originalname).toLowerCase();

  if (ext === '.pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (ext === '.docx') {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  } else {
    throw new Error('Unsupported file type. Only PDF and DOCX are supported.');
  }
}

/**
 * Sends extracted CV text to the Gemini API for professional formatting.
 * @param {string} text - The raw text from the CV.
 * @returns {Promise<object>} The formatted CV JSON object.
 */
async function formatWithAI(text) {
  const prompt = `
You are a professional CV formatter. Given the following unstructured CV content, convert it into a structured JSON object.

The JSON object should conform to this structure:
{
  "header": {
    "name": "string",
    "title": "string",
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "website": "string"
  },
  "summary": "string",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "startDate": "string",
      "endDate": "string",
      "responsibilities": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string"
    }
  ],
  "skills": ["string"]
}

CV Input:
${text}

Formatted JSON:
`;

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ]
    })
  });

  if (!response.ok) {
    let errorDetails = `Status: ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorDetails = JSON.stringify(errorJson.error, null, 2);
    } catch (e) {
      errorDetails = await response.text();
    }
    throw new Error(`Gemini API Error:\n${errorDetails}`);
  }

  const result = await response.json();
  const formattedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!formattedText) {
    console.warn("Gemini returned a successful response but with no content.", result);
    throw new Error("Failed to format CV. The API returned an empty response.");
  }

  try {
    const jsonMatch = formattedText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(formattedText);
  } catch (error) {
    console.error("Failed to parse JSON from Gemini response:", formattedText);
    throw new Error("Failed to parse formatted CV from AI response.");
  }
}

/**
 * Main function to orchestrate parsing and formatting a CV file.
 * @param {object} file - The uploaded file object from multer.
 * @returns {Promise<{formattedCV: object, originalText: string}>} The formatted CV object and the original text.
 */
async function parseAndFormatCV(file) {
  const buffer = await fs.readFile(file.path);
  const originalText = await extractText(buffer, file.originalname);

  if (!originalText || originalText.trim().length < 20) {
    await fs.unlink(file.path);
    throw new Error("Extracted text is too short or empty. Please check the document content.");
  }

  const formattedCV = await formatWithAI(originalText);
  
  // TODO: Integrate Mistral OCR here to detect and extract photo URL.
  // For now, we'll add a placeholder photoUrl.
  formattedCV.photoUrl = null; // Replace with actual photo URL from OCR if detected

  // Clean up the uploaded file
  await fs.unlink(file.path);

  return { formattedCV, originalText };
}

module.exports = { parseAndFormatCV, extractText };
