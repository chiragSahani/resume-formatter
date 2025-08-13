export interface CVData {
  _id: string;
  header: Header;
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  photoUrl?: string | null; // Can be a string, null (placeholder), or undefined (no photo)
  photoFound?: boolean; // Result from AI photo detection
  meta?: Meta; // Holds header/footer text
  uploadDate: Date;
}

export interface Header {
  name: string;
  title: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  // New fields from the registration form
  nationality?: string;
  languages?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  drivingLicence?: string;
  smokerStatus?: string;
}

export interface ExperienceItem {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
}

export interface Meta {
  headerText?: string;
  footerText?: string;
}