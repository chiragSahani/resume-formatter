const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

require('dotenv').config();

// --- AI Service Initialization ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- In-Memory Cache ---
const cache = new Map();

/**
 * Extracts raw text from a file (PDF, DOCX, XLSX).
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

// --- AI Formatting Logic ---

const commonPrompt = `
You are an expert CV formatting AI. Your task is to parse the unstructured CV text provided and transform it into a clean, professional, and structured JSON object. You must strictly adhere to all the formatting and content rules below.

**JSON Output Structure:**
The final output MUST be a single, valid JSON object with the following structure. Do not add any fields that are not in this structure. Do not add any explanatory text before or after the JSON object.
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
1.  **Capitalization:** Job titles MUST be capitalized (e.g., "Software Engineer").
2.  **Date Formatting:** Dates MUST be formatted as the first three letters of the month and the year (e.g., "Jan 2020").
3.  **Content Cleanup:** Rephrase sentences to be direct and use active voice (e.g., "Managed a team" instead of "I was responsible for..."). Convert paragraphs of duties into concise bullet points in the "responsibilities" array. Correct spelling errors.
4.  **Remove Inappropriate Fields:** Exclude age, dependents, etc.
5.  **Organization:** Order experience in reverse chronological order.

**CV Input Text:**
---
%TEXT%
---

**Formatted JSON Output:**
`;

/**
 * Parses the JSON response from an AI model.
 */
function parseJsonResponse(text) {
    if (!text) return null;
    try {
        // Attempt to find a JSON block first
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            return JSON.parse(jsonMatch[1]);
        }
        // If no block, try to parse the whole string
        return JSON.parse(text);
    } catch (error) {
        console.error("Failed to parse JSON from AI response:", text);
        return null;
    }
}

async function formatWithGemini(text) {
    if (!GEMINI_API_KEY) throw new Error("Gemini API key is not configured.");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = commonPrompt.replace('%TEXT%', text);

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ]
        })
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);
    const result = await response.json();
    const formattedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!formattedText) {
        console.warn("Gemini returned a successful response but with no content.", result);
        throw new Error("Failed to format CV. The API returned an empty response.");
    }

    return parseJsonResponse(formattedText);
}

// --- Main Orchestration ---

/**
 * Orchestrates parsing and formatting a CV using Gemini, with caching.
 */
async function parseAndFormatCV(rawText) {
    if (!rawText || rawText.trim().length < 20) {
        throw new Error("Extracted text is too short or empty.");
    }

    // Check cache first
    if (cache.has(rawText)) {
        console.log("Returning cached result.");
        return cache.get(rawText);
    }

    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API provider is not configured. Please set the GEMINI_API_KEY.");
    }

    try {
        console.log(`Attempting to format with Gemini...`);
        const formattedCV = await formatWithGemini(rawText);
        if (formattedCV) {
            // Store result in cache
            cache.set(rawText, formattedCV);
            console.log(`Successfully formatted with Gemini.`);
            return formattedCV;
        } else {
            throw new Error(`Gemini returned an empty or invalid response.`);
        }
    } catch (error) {
        console.error(`Error with Gemini:`, error.message);
        throw new Error(`AI processing failed. Last error: ${error.message}`);
    }
}

module.exports = { parseAndFormatCV, extractText };
