const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const cvUploadRoutes = require('./routes/cvUploadRoutes');
const cvReadRoutes = require('./routes/cvReadRoutes');
const cvUpdateRoutes = require('./routes/cvUpdateRoutes');
const cvExportRoutes = require('./routes/cvExportRoutes');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection failed:', err));

// Use Routes
app.use('/api/cv', cvUploadRoutes);
app.use('/api/cv', cvReadRoutes);
app.use('/api/cv', cvUpdateRoutes);
app.use('/api/cv', cvExportRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
