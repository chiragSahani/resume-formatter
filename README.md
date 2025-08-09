# Resume Formatter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful and intuitive web application that leverages AI to transform unstructured resume/CV documents (PDF, DOCX) into a structured, editable format, and allows users to export them into various professional formats (PDF, DOCX, TXT).

## ✨ Features

*   **AI-Powered Parsing**: Automatically extracts and structures resume data from PDF and DOCX files using the Gemini API.
*   **Interactive Editing**: A user-friendly interface to review and edit the parsed CV data.
*   **Multi-Format Export**: Export your formatted CV into professional PDF, DOCX, or plain TXT formats.
*   **Modern Stack**: Built with Next.js for a fast and responsive frontend, and a robust Node.js Express backend.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: [LTS version recommended](https://nodejs.org/en/download/)
*   **npm** (comes with Node.js) or **Yarn**
*   **MongoDB**: A running instance of MongoDB. You can install it locally or use a cloud service like MongoDB Atlas.
*   **Gemini API Key**: Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/chiragSahani/resume-formatter.git
    cd resume-formatter
    ```

2.  **Backend Setup:**
    Navigate to the `server` directory, install dependencies, and set up environment variables.
    ```bash
    cd server
    npm install # or yarn install
    ```
    Create a `.env` file in the `server` directory and add your MongoDB URI and Gemini API Key:
    ```
    MONGO_URI=your_mongodb_connection_string
    GEMINI_API_KEY=your_gemini_api_key
    PORT=5000 # Optional, default is 5000
    ```

3.  **Frontend Setup:**
    Navigate to the `client` directory, install dependencies, and set up environment variables.
    ```bash
    cd ../client
    npm install # or yarn install
    ```
    Create a `.env.local` file in the `client` directory and add your Gemini API Key (this is used by the client-side AI calls if any, and also by Next.js API routes if you decide to migrate AI processing to Next.js):
    ```
    NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
    ```
    *Note: The current setup uses the backend's Gemini API key for processing. This `NEXT_PUBLIC_GEMINI_API_KEY` might be used for future client-side AI features or if you migrate AI processing to Next.js API routes.*

### Running the Application

1.  **Start the Backend Server:**
    From the `server` directory:
    ```bash
    npm start # or node index.js
    ```
    The backend server will typically run on `http://localhost:5000`.

2.  **Start the Frontend Development Server:**
    From the `client` directory:
    ```bash
    npm run dev # or yarn dev
    ```
    The frontend application will typically run on `http://localhost:3000`.

Open your browser and visit `http://localhost:3000` to use the application.

## 📂 Project Structure

The project is divided into two main parts: `client` (Next.js frontend) and `server` (Node.js Express backend).

```
resume-formatter/
├── client/                 # Next.js frontend application
│   ├── app/                # Next.js App Router pages and layouts
│   ├── components/         # Reusable React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and client-side configurations
│   ├── public/             # Static assets
│   ├── types/              # TypeScript type definitions
│   ├── .env.local          # Environment variables for frontend (local)
│   ├── package.json        # Frontend dependencies and scripts
│   └── ...
├── server/                 # Node.js Express backend application
│   ├── models/             # Mongoose schemas and models
│   ├── routes/             # Express API routes
│   ├── services/           # Backend services (e.g., AI processing, file extraction)
│   ├── uploads/            # Directory for temporary file uploads
│   ├── .env                # Environment variables for backend (local)
│   ├── index.js            # Backend server entry point
│   ├── package.json        # Backend dependencies and scripts
│   └── ...
├── .gitignore              # Specifies intentionally untracked files to ignore
├── README.md               # This file
└── ...
```

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://opensource.org/licenses/MIT) file for details.
