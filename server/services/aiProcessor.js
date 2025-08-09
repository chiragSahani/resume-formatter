const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

require('dotenv').config();

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

/**
 * Extracts raw text from a PDF or DOCX file buffer.
 * @param {object} file - The file object from multer or similar.
 * @returns {Promise<string>} The extracted text content.
 */
async function extractText(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  const filePath = file.path;

  try {
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (ext === '.docx') {
      const { value } = await mammoth.extractRawText({ path: filePath });
      return value;
    } else {
      // It's good practice to clean up the uploaded file on error
      fs.unlinkSync(filePath); 
      throw new Error('Unsupported file type. Only PDF and DOCX are supported.');
    }
  } finally {
    // Ensure the temporary file is deleted after text extraction
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

/**
 * Sends extracted CV text to the Gemini API for professional formatting.
 * @param {string} text - The raw text from the CV.
 * @returns {Promise<string>} The formatted CV content.
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

  // Improved error handling to parse the actual error message from the API
  if (!response.ok) {
    let errorDetails = `Status: ${response.status} ${response.statusText}`;
    try {
      // The API's error response is usually JSON, so we try to parse it
      const errorJson = await response.json();
      errorDetails = JSON.stringify(errorJson.error, null, 2);
    } catch (e) {
      // If the error response isn't JSON, use the raw text
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
    // The response from Gemini might be wrapped in markdown, so we need to extract the JSON
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
 * @param {object} file - The uploaded file object.
 * @returns {Promise<string>} The fully formatted CV text.
 */
async function parseAndFormatCV(file) {
  const rawText = await extractText(file);
  if (!rawText || rawText.trim().length < 20) {
      throw new Error("Extracted text is too short or empty. Please check the document content.");
  }
  const formattedCV = await formatWithAI(rawText);
  return formattedCV;
}

module.exports = { parseAndFormatCV };
