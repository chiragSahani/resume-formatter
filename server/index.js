const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const cvRoutes = require('./routes/cvRoutes');

dotenv.config();
const app = express();

// CORS Configuration
const whitelist = [
    'http://localhost:3000', // Local frontend
    'https://resume-formatter-7rc4.onrender.com', // Deployed backend
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow Netlify preview URLs and the main site URL
        if (/\.netlify\.app$/.test(origin)) {
            return callback(null, true);
        }

        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection failed:', err));

// Use Routes
app.use('/api/cv', cvRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
