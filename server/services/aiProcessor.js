const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

require('dotenv').config();

// --- AI Service Initialization ---
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
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
    return parseJsonResponse(result?.candidates?.[0]?.content?.parts?.[0]?.text);
}

async function formatWithOpenAI(text) {
    if (!openai) throw new Error("OpenAI API key is not configured.");
    const prompt = commonPrompt.replace('%TEXT%', text);

    const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
    });

    return parseJsonResponse(completion.choices[0].message.content);
}

async function formatWithAnthropic(text) {
    if (!anthropic) throw new Error("Anthropic API key is not configured.");
    const prompt = commonPrompt.replace('%TEXT%', text);

    const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
    });

    return parseJsonResponse(msg.content[0].text);
}

// --- Main Orchestration ---

/**
 * Orchestrates parsing and formatting a CV, with fallback and caching.
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

    // Define the order of AI providers to try
    const providers = [
        { name: 'Gemini', fn: formatWithGemini, enabled: !!GEMINI_API_KEY },
        { name: 'OpenAI', fn: formatWithOpenAI, enabled: !!openai },
        { name: 'Anthropic', fn: formatWithAnthropic, enabled: !!anthropic }
    ].filter(p => p.enabled);

    if (providers.length === 0) {
        throw new Error("No AI providers are configured. Please set at least one API key.");
    }

    let lastError = null;
    for (const provider of providers) {
        try {
            console.log(`Attempting to format with ${provider.name}...`);
            const formattedCV = await provider.fn(rawText);
            if (formattedCV) {
                // Store result in cache
                cache.set(rawText, formattedCV);
                console.log(`Successfully formatted with ${provider.name}.`);
                return formattedCV;
            }
            lastError = new Error(`Provider ${provider.name} returned an empty or invalid response.`);
        } catch (error) {
            console.error(`Error with ${provider.name}:`, error.message);
            lastError = error;
        }
    }

    // If all providers fail
    throw new Error(`All AI providers failed. Last error: ${lastError.message}`);
}

module.exports = { parseAndFormatCV, extractText };
