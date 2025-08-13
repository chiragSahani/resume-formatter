const mongoose = require('mongoose');

const HeaderSchema = new mongoose.Schema({
  name: String,
  title: String,
  email: String,
  phone: String,
  linkedin: String,
  website: String,
});

const ExperienceItemSchema = new mongoose.Schema({
  title: String,
  company: String,
  startDate: String,
  endDate: String,
  responsibilities: [String],
});

const EducationItemSchema = new mongoose.Schema({
  degree: String,
  institution: String,
  year: String,
});

const CVSchema = new mongoose.Schema({
  originalFileName: String,
  header: HeaderSchema,
  summary: String,
  experience: [ExperienceItemSchema],
  education: [EducationItemSchema],
  skills: [String],
  photoUrl: String, // Added for photo detection
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CV', CVSchema);
