'use client';

import React from 'react';
import Image from 'next/image';
import { CVData, ExperienceItem, EducationItem } from '@/types/cv';
import { ImageIcon } from 'lucide-react';

// --- PROPS INTERFACE (No changes here) ---
interface CVDisplayProps {
  cvData: CVData;
  onUpdate: (field: keyof CVData, value: any) => void;
  onHeaderUpdate: (headerField: keyof CVData['header'], value: string) => void;
  onExperienceUpdate: (index: number, field: keyof ExperienceItem, value: string | string[]) => void;
  onEducationUpdate: (index: number, field: keyof EducationItem, value: string) => void;
  onSkillsUpdate: (index: number, value: string) => void;
}

// --- SUB-COMPONENTS for better structure ---

// A reusable, editable field component to reduce repetition
const EditableField = ({ onBlur, children, className = '' }: { onBlur: (e: React.FocusEvent<HTMLElement>) => void; children: React.ReactNode; className?: string }) => (
  <span
    contentEditable
    suppressContentEditableWarning
    onBlur={onBlur}
    className={`outline-none focus:ring-2 focus:ring-blue-400 px-1 rounded ${className}`}
  >
    {children}
  </span>
);

// Photo Placeholder Component (4.7cm width as specified in notes)
const PhotoPlaceholder = () => (
  <div className="w-[177px] h-[212px] mx-auto">
    <Image 
      src="https://res.cloudinary.com/dlyctssmy/image/upload/v1755153315/Radu_Cojocaru_ezoxw1.jpg" 
      alt="Profile Photo" 
      width={177} 
      height={212} 
      className="object-cover" 
    />
  </div>
);

// Generic Section Component
const CVSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h3 className="text-xl font-bold border-b border-gray-300 pb-1 mb-3">{title}</h3>
    {children}
  </section>
);

// --- MAIN CV DISPLAY COMPONENT (Refactored with centered photo) ---
const CVDisplay = React.forwardRef<HTMLDivElement, CVDisplayProps>(({
    cvData,
    onUpdate,
    onHeaderUpdate,
    onExperienceUpdate,
    onEducationUpdate,
    onSkillsUpdate
}, ref) => {

  if (!cvData) {
    return null;
  }

  const { header, summary, experience, education, skills, photoUrl } = cvData;

  const handleHeaderBlur = (field: keyof CVData['header']) => (e: React.FocusEvent<HTMLElement>) => {
    onHeaderUpdate(field, e.currentTarget.textContent || '');
  };

  return (
    <div ref={ref} className="bg-white text-black font-serif shadow-lg max-w-4xl mx-auto">
      {/* Header with Company Logo */}
      <header className="px-12 pt-12">
        <div className="flex items-center justify-center space-x-4 border-b-2 border-gray-300 pb-4 mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-[#940128] rounded-full flex-shrink-0">
            <span className="text-white text-3xl font-serif italic">ehs</span>
          </div>
          <div>
            <p className="text-3xl font-serif italic text-[#940128]">exclusive</p>
            <p className="text-lg font-sans tracking-widest text-gray-700">HOUSEHOLD STAFF</p>
          </div>
        </div>
      </header>

      {/* Main CV Content */}
      <main className="p-12 pt-0 space-y-6">
        {/* Centered Photo */}
        <div className="flex justify-center mb-6">
          {photoUrl ? (
            <Image src={photoUrl} alt="Profile Photo" width={177} height={212} className="object-cover" />
          ) : (
            <PhotoPlaceholder />
          )}
        </div>

        {/* Name and Title - Centered */}
        <div className="text-center">
          <h1 className="text-5xl font-bold">
            <EditableField onBlur={handleHeaderBlur('name')}>{header.name}</EditableField>
          </h1>
          <p className="text-2xl text-gray-700 mt-2">
            <EditableField onBlur={handleHeaderBlur('title')}>{header.title}</EditableField>
          </p>
        </div>

        {/* Personal Details - Two Columns */}
        <div className="grid grid-cols-2 gap-x-12 text-sm">
          <div>
            <p><strong>Nationality:</strong> <EditableField onBlur={handleHeaderBlur('nationality')}>{header.nationality}</EditableField></p>
            <p><strong>Languages:</strong> <EditableField onBlur={handleHeaderBlur('languages')}>{header.languages}</EditableField></p>
            <p><strong>Date of Birth:</strong> <EditableField onBlur={handleHeaderBlur('dateOfBirth')}>{header.dateOfBirth}</EditableField></p>
          </div>
          <div>
            <p><strong>Marital Status:</strong> <EditableField onBlur={handleHeaderBlur('maritalStatus')}>{header.maritalStatus}</EditableField></p>
            <p><strong>Non-Smoker:</strong> <EditableField onBlur={handleHeaderBlur('smokerStatus')}>{header.smokerStatus}</EditableField></p>
            <p><strong>Driving Licence:</strong> <EditableField onBlur={handleHeaderBlur('drivingLicence')}>{header.drivingLicence}</EditableField></p>
          </div>
        </div>

        {summary && (
          <CVSection title="Profile">
            <p className="text-sm leading-relaxed">
              <EditableField onBlur={(e) => onUpdate('summary', e.currentTarget.textContent || '')}>{summary}</EditableField>
            </p>
          </CVSection>
        )}

        {experience?.length > 0 && (
          <CVSection title="Experience">
            <div className="space-y-4">
              {experience.map((item, i) => (
                <div key={i} className="text-sm">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold">
                      <EditableField onBlur={(e) => onExperienceUpdate(i, 'company', e.currentTarget.textContent || '')}>{item.company}</EditableField>
                    </h4>
                    <p className="text-gray-600">
                      <EditableField onBlur={(e) => onExperienceUpdate(i, 'startDate', e.currentTarget.textContent || '')}>{item.startDate}</EditableField> -
                      <EditableField onBlur={(e) => onExperienceUpdate(i, 'endDate', e.currentTarget.textContent || '')}>{item.endDate}</EditableField>
                    </p>
                  </div>
                  <p className="italic">
                    <EditableField onBlur={(e) => onExperienceUpdate(i, 'title', e.currentTarget.textContent || '')}>{item.title}</EditableField>
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {item.responsibilities.map((res, j) => (
                      <li key={j}>
                        <EditableField onBlur={(e) => {
                          const newResponsibilities = [...item.responsibilities];
                          newResponsibilities[j] = e.currentTarget.textContent || '';
                          onExperienceUpdate(i, 'responsibilities', newResponsibilities);
                        }}>{res}</EditableField>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CVSection>
        )}

        {education?.length > 0 && (
          <CVSection title="Education">
            <div className="space-y-2">
              {education.map((item, i) => (
                <div key={i} className="text-sm">
                  <p>
                    <strong><EditableField onBlur={(e) => onEducationUpdate(i, 'degree', e.currentTarget.textContent || '')}>{item.degree}</EditableField></strong>,
                    <EditableField onBlur={(e) => onEducationUpdate(i, 'institution', e.currentTarget.textContent || '')} className="ml-1">{item.institution}</EditableField>
                    (<EditableField onBlur={(e) => onEducationUpdate(i, 'year', e.currentTarget.textContent || '')}>{item.year}</EditableField>)
                  </p>
                </div>
              ))}
            </div>
          </CVSection>
        )}

        {skills?.length > 0 && (
          <CVSection title="Key Skills">
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              {skills.map((skill, i) => (
                <li key={i}>
                  <EditableField onBlur={(e) => onSkillsUpdate(i, e.currentTarget.textContent || '')}>{skill}</EditableField>
                </li>
              ))}
            </ul>
          </CVSection>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#800000] text-white font-serif text-center p-4">
        <p>Exclusive Household Staff & Nannies</p>
        <a href="http://www.exclusivehouseholdstaff.com" className="underline hover:text-gray-300">www.exclusivehouseholdstaff.com</a>
        <p>Telephone: +44 (0) 203 358 7000</p>
      </footer>
    </div>
  );
});

CVDisplay.displayName = 'CVDisplay';
export default CVDisplay;