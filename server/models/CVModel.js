const mongoose = require('mongoose');

const HeaderSchema = new mongoose.Schema({
  name: String,
  title: String,
  email: String,
  phone: String,
  linkedin: String,
  website: String,
  // New fields to be added by Agent 3 from the registration form
  nationality: String,
  languages: String,
  dateOfBirth: String,
  maritalStatus: String,
  drivingLicence: String,
  smokerStatus: String,
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

// New schema for the CV metadata (header/footer)
const MetaSchema = new mongoose.Schema({
    headerText: String,
    footerText: String,
});

const CVSchema = new mongoose.Schema({
  originalFileName: String,
  header: HeaderSchema,
  summary: String,
  experience: [ExperienceItemSchema],
  education: [EducationItemSchema],
  skills: [String],
  photoUrl: String,
  photoFound: Boolean, // Added to store the result of photo detection
  meta: MetaSchema, // Added to store header/footer content
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CV', CVSchema);