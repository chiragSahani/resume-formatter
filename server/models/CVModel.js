const mongoose = require('mongoose');

const HeaderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  title: { type: String, trim: true },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'is invalid'],
  },
  phone: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  website: { type: String, trim: true },
  nationality: { type: String, trim: true },
  languages: { type: String, trim: true },
  dateOfBirth: { type: String, trim: true },
  maritalStatus: { type: String, trim: true },
  drivingLicence: { type: String, trim: true },
  smokerStatus: { type: String, trim: true },
});

const ExperienceItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  startDate: { type: String, trim: true },
  endDate: { type: String, trim: true },
  responsibilities: [{ type: String, trim: true }],
});

const EducationItemSchema = new mongoose.Schema({
  degree: { type: String, required: true, trim: true },
  institution: { type: String, required: true, trim: true },
  year: { type: String, trim: true },
});

const MetaSchema = new mongoose.Schema({
  headerText: { type: String, trim: true },
  footerText: { type: String, trim: true },
});

const CVSchema = new mongoose.Schema(
  {
    originalFileName: { type: String, trim: true },
    header: { type: HeaderSchema, required: true },
    summary: { type: String, trim: true },
    experience: [ExperienceItemSchema],
    education: [EducationItemSchema],
    skills: [String],
    photoUrl: { type: String, trim: true },
    photoFound: { type: Boolean, default: false },
    meta: MetaSchema,
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

module.exports = mongoose.model('CV', CVSchema);