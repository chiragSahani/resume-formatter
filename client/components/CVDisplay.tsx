'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CVData } from '@/types/cv';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mail, Phone, Linkedin, Globe } from 'lucide-react';

interface CVDisplayProps {
  cvData: CVData;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
    <h3 className="text-2xl font-bold text-slate-800 border-b-2 border-blue-500 pb-2 mb-4">{title}</h3>
    <div className="space-y-4 text-slate-700">{children}</div>
  </motion.div>
);

const ExperienceItem = ({ item }: { item: any }) => (
  <div>
    <h4 className="text-lg font-semibold text-slate-900">{item.title} at {item.company}</h4>
    <p className="text-sm text-slate-500">{item.startDate} - {item.endDate}</p>
    <ul className="list-disc list-inside mt-2 space-y-1">
      {item.responsibilities.map((res: string, i: number) => <li key={i}>{res}</li>)}
    </ul>
  </div>
);

const EducationItem = ({ item }: { item: any }) => (
  <div>
    <h4 className="text-lg font-semibold text-slate-900">{item.degree}</h4>
    <p className="text-slate-600">{item.institution} ({item.year})</p>
  </div>
);

const CVDisplay = React.forwardRef<HTMLDivElement, CVDisplayProps>(({ cvData }, ref) => {
  if (!cvData) {
    return <p className="text-center text-red-500">No CV data to display.</p>;
  }

  const { header, summary, experience, education, skills } = cvData;

  return (
    <Card ref={ref} className="max-w-4xl mx-auto p-8 shadow-lg">
      <CardHeader className="text-center p-0 border-b pb-6 mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <CardTitle className="text-5xl font-extrabold text-slate-900">{header.name}</CardTitle>
          <p className="text-2xl text-blue-600 font-medium mt-2">{header.title}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex justify-center items-center space-x-6 text-slate-600 mt-4">
          {header.email && <a href={`mailto:${header.email}`} className="flex items-center space-x-2 hover:text-blue-500"><Mail size={16} /><span>{header.email}</span></a>}
          {header.phone && <span className="flex items-center space-x-2"><Phone size={16} /><span>{header.phone}</span></span>}
          {header.linkedin && <a href={header.linkedin} className="flex items-center space-x-2 hover:text-blue-500"><Linkedin size={16} /><span>LinkedIn</span></a>}
          {header.website && <a href={header.website} className="flex items-center space-x-2 hover:text-blue-500"><Globe size={16} /><span>Website</span></a>}
          </motion.div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-10">
          {summary && <Section title="Professional Summary">{summary}</Section>}
          
          {experience?.length > 0 && (
            <Section title="Work Experience">
              {experience.map((item, i) => <ExperienceItem key={i} item={item} />)}
            </Section>
          )}

          {education?.length > 0 && (
            <Section title="Education">
              {education.map((item, i) => <EducationItem key={i} item={item} />)}
            </Section>
          )}

          {skills?.length > 0 && (
            <Section title="Skills">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => <Badge key={i} variant="secondary">{skill}</Badge>)}
              </div>
            </Section>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default CVDisplay;