const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

require('dotenv').config();

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

/**
 * Extracts raw text from a PDF, DOCX, or XLSX file.
 * @param {object} file - The file object from multer.
 * @returns {Promise<string>} The extracted text content.
 */
async function extractText(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  const filePath = file.path;

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }

  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } else if (ext === '.docx') {
    const { value } = await mammoth.extractRawText({ path: filePath });
    return value;
  } else if (ext === '.xlsx' || ext === '.xls') {
    const workbook = xlsx.readFile(filePath);
    let fullText = '';
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const sheetText = xlsx.utils.sheet_to_txt(worksheet);
      fullText += sheetText + '\n';
    });
    return fullText;
  } else {
    throw new Error('Unsupported file type. Only PDF, DOCX, and XLSX are supported.');
  }
}

/**
 * Sends extracted CV text to the Gemini API for professional formatting.
 * @param {string} text - The raw text from the CV.
 * @returns {Promise<object>} The formatted CV content as a JSON object.
 */
async function formatWithAI(text) {
  const prompt = `
You are an expert CV formatting AI. Your task is to parse the unstructured CV text provided and transform it into a clean, professional, and structured JSON object. You must strictly adhere to all the formatting and content rules below.

**JSON Output Structure:**
The final output MUST be a single JSON object with the following structure. Do not add any fields that are not in this structure.
{
  "header": { "name": "string", "title": "string", "email": "string", "phone": "string", "linkedin": "string", "website": "string" },
  "summary": "string",
  "experience": [
    { "title": "string", "company": "string", "startDate": "string", "endDate": "string", "responsibilities": ["string"] }
  ],
  "education": [
    { "degree": "string", "institution": "string", "year": "string" }
  ],
  "skills": ["string"],
  "interests": ["string"],
  "personalDetails": { "nationality": "string", "languages": "string", "dob": "string", "maritalStatus": "string" }
}

**Formatting and Content Rules (MANDATORY):**

1.  **Capitalization:**
    *   Job titles MUST be capitalized (e.g., "Software Engineer", not "software engineer").
    *   Proper nouns (names, companies, institutions) must be correctly capitalized.

2.  **Date Formatting:**
    *   All dates in the 'experience' section (startDate, endDate) and 'education' section (year) MUST be formatted as the first three letters of the month followed by the year (e.g., "Jan 2020", "Dec 2022").
    *   If a month is not specified, infer it if possible or use the year alone (e.g., "2020").

3.  **Content Cleanup & Professional Tone:**
    *   **Remove Redundancy:** Rephrase sentences to be more direct. For example, "I was responsible for managing a team" should become "Managed a team".
    *   **Active Voice:** Use active voice and bullet points for responsibilities. Convert paragraphs describing job duties into a list of concise bullet points. Each responsibility should be a string in the "responsibilities" array.
    *   **Spelling Correction:** Correct common professional spelling mistakes (e.g., "Principle" -> "Principal", "Discrete" -> "Discreet").
    *   **Remove Inappropriate Fields:** Do NOT include fields like Age or Number of Dependants in the final JSON. Extract other personal details into the 'personalDetails' object.

4.  **Section Organization:**
    *   Categorize the information accurately into the sections defined in the JSON structure.
    *   'Experience' should be in reverse chronological order (most recent first).
    *   'Key Skills', 'Education', and 'Interests' should be presented as bullet-pointed lists (arrays of strings in the JSON).

**CV Input Text:**
---
${text}
---

**Formatted JSON Output:**
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
 * @param {string} rawText - The raw text extracted from the CV.
 * @returns {Promise<object>} The fully formatted CV JSON object.
 */
async function parseAndFormatCV(rawText) {
  if (!rawText || rawText.trim().length < 20) {
      throw new Error("Extracted text is too short or empty. Please check the document content.");
  }
  const formattedCV = await formatWithAI(rawText);
  return formattedCV;
}

module.exports = { parseAndFormatCV, extractText };
