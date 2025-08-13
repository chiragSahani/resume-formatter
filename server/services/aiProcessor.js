const fs = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const fetch = require('node-fetch');
const { v2: cloudinary } = require('cloudinary');
const { extractImages } = require('pdf-extraction');

require('dotenv').config();

// --- Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

// --- Pre-load Contextual Data on Server Start ---
let contextData = {};

async function loadContextualData() {
    console.log("Loading contextual documents for AI processing...");
    try {
        const contextDir = path.resolve(__dirname, '../context');
        const registrationFormBuffer = await fs.readFile(path.join(contextDir, 'RegistrationForm_Final.docx'));
        const templateNotesBuffer = await fs.readFile(path.join(contextDir, 'CVTemplate_Notes.docx'));
        const finalCVExampleBuffer = await fs.readFile(path.join(contextDir, 'Client_FinalCV.pdf'));

        const { value: intakeFormText } = await mammoth.extractRawText({ buffer: registrationFormBuffer });
        const { value: formattingRulesText } = await mammoth.extractRawText({ buffer: templateNotesBuffer });
        const { text: finalCvExampleText } = await pdfParse(finalCVExampleBuffer);

        contextData = { intakeFormText, formattingRulesText, finalCvExampleText };
        console.log("Contextual documents loaded successfully.");
    } catch (error) {
        console.error("Failed to load contextual documents:", error);
        process.exit(1);
    }
}
loadContextualData();

/**
 * A robust wrapper for the Gemini API call with retry logic.
 * @param {object} requestBody The body of the request to send to Gemini.
 * @param {number} retries The number of times to retry the request.
 * @returns {Promise<string>} The text response from the API.
 */
async function callGeminiWithRetry(requestBody, retries = 3) {
    let lastError = null;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const result = await response.json();
                const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) throw new Error("Empty content response from Gemini.");
                return text;
            }

            if (response.status === 503 || response.status === 429) {
                lastError = new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
                const delay = Math.pow(2, i) * 1000;
                console.log(`Gemini API unavailable, retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            throw new Error(`Gemini API Error: ${response.status} ${await response.text()}`);

        } catch (error) {
            lastError = error;
        }
    }
    throw lastError;
}

/**
 * Extracts the first image from a PDF buffer and uploads it to Cloudinary.
 * @param {Buffer} pdfBuffer The buffer of the uploaded PDF file.
 * @returns {Promise<string | null>} The secure URL of the uploaded image, or null if no image is found.
 */
async function extractAndUploadPhoto(pdfBuffer) {
    try {
        const images = await extractImages(pdfBuffer, {
            startPage: 1,
            endPage: 1,
        });

        if (images && images.length > 0) {
            console.log("Image found in PDF, attempting to upload...");
            const imageBuffer = images[0];
            
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'image', folder: 'cv-photos' },
                    (error, result) => {
                        if (error) return reject(error);
                        console.log("Photo successfully uploaded to Cloudinary:", result?.secure_url);
                        resolve(result?.secure_url || null);
                    }
                );
                uploadStream.end(imageBuffer);
            });
        }
        return null;
    } catch (error) {
        console.error("Failed to extract or upload photo:", error);
        return null;
    }
}

/**
 * Processes a CV using a unified, single-call approach to the Gemini API.
 * @param {Buffer} fileBuffer The buffer of the uploaded CV file.
 * @param {string} mimeType The MIME type of the file.
 * @returns {Promise<any>} The final, polished CV JSON.
 */
async function processCvWithUnifiedAgent(fileBuffer, mimeType) {
    console.log("Executing Unified AI Agent...");
    const base64Data = fileBuffer.toString('base64');

    const prompt = `
    You are an all-in-one CV processing expert. You will perform a multi-step analysis on the provided document and return a single, final JSON object.

    **Step 1: OCR & Photo Detection**
    - Analyze the document. Extract all text. Determine if a professional headshot photo is present.

    **Step 2: Initial JSON Structuring**
    - Convert extracted text into a structured JSON.

    **Step 3: Data Merging & Cleaning**
    - Use "Intake Form Data" as the source of truth for personal details.
    - Use "Formatting Rules" to add required fields (e.g., "Non Smoker") and remove forbidden fields (e.g., "Age").

    **Step 4: Strict Final Formatting**
    - Use the "Final CV Example" as a style guide.
    - Dates must be "MMM YYYY".
    - Responsibilities must be concise, action-oriented bullet points.
    - Job titles must be capitalized.
    - Add a 'meta' field with 'headerText' and 'footerText'.

    **CONTEXT DOCUMENTS:**
    ---
    **1. Intake Form Data (Source of Truth):**
    ${contextData.intakeFormText}
    ---
    **2. Formatting Rules:**
    ${contextData.formattingRulesText}
    ---
    **3. Final CV Example (Style Guide):**
    ${contextData.finalCvExampleText}
    ---

    **Final JSON Output Structure:**
    {
      "photoFound": boolean,
      "header": { "name": "", "title": "", "email": "", "phone": "", "linkedin": "", "website": "", "nationality": "", "languages": "", "dateOfBirth": "", "maritalStatus": "", "drivingLicence": "", "smokerStatus": "" },
      "summary": "",
      "experience": [{ "title": "", "company": "", "startDate": "", "endDate": "", "responsibilities": [""] }],
      "education": [{ "degree": "", "institution": "", "year": "" }],
      "skills": [""],
      "meta": { "headerText": "", "footerText": "" }
    }

    Now, process the provided document and return ONLY the final, clean JSON object.
    `;

    const requestBody = {
        contents: [{
            parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: base64Data } }
            ]
        }],
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ]
    };

    const rawText = await callGeminiWithRetry(requestBody);

    try {
        const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/);
        return JSON.parse(jsonMatch ? jsonMatch[1] : rawText);
    } catch (error) {
        console.error("Unified Agent JSON Parse Error. Raw output:", rawText);
        throw new Error("Failed to parse final JSON from the Unified Agent.");
    }
}

/**
 * Main orchestrator: Processes a CV using the unified agent.
 * @param {object} file - multer file object.
 */
async function parseAndFormatCV(file) {
    const cvBuffer = await fs.readFile(file.path);

    const finalCVJson = await processCvWithUnifiedAgent(cvBuffer, file.mimetype);
    
    let photoUrl = undefined;
    if (finalCVJson.photoFound && file.mimetype === 'application/pdf') {
        photoUrl = await extractAndUploadPhoto(cvBuffer);
    }
    
    finalCVJson.photoUrl = photoUrl || (finalCVJson.photoFound ? null : undefined);
    
    const originalText = "Original text is now processed and structured in a single step.";

    await fs.unlink(file.path);
    return { formattedCV: finalCVJson, originalText };
}

module.exports = { parseAndFormatCV };