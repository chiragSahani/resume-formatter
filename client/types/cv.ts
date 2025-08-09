export interface CVData {
  _id: string;
  header: {
    name: string;
    title: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
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
