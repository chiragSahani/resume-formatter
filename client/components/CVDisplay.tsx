'use client';

import React from 'react';
import Image from 'next/image';
import { CVData, ExperienceItem, EducationItem } from '@/types/cv';
import { ImageIcon } from 'lucide-react';

// --- PROPS INTERFACE ---
interface CVDisplayProps {
  cvData: CVData;
  onUpdate: (field: keyof CVData, value: any) => void;
  onHeaderUpdate: (headerField: keyof CVData['header'], value: string) => void;
  onExperienceUpdate: (index: number, field: keyof ExperienceItem, value: string | string[]) => void;
  onEducationUpdate: (index: number, field: keyof EducationItem, value: string) => void;
  onSkillsUpdate: (index: number, value: string) => void;
}

// --- PHOTO UPLOAD PLACEHOLDER ---
const PhotoPlaceholder = () => (
    <div
        className="w-[150px] h-[180px] bg-gray-100 flex flex-col items-center justify-center text-gray-500 cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-gray-200 transition-all group"
        onClick={() => alert('Photo upload functionality to be added here.')}
    >
        <ImageIcon size={40} className="group-hover:text-blue-500 transition-colors" />
        <span className="text-xs mt-2 group-hover:text-blue-500 transition-colors">Upload Photo</span>
    </div>
);

// --- MAIN CV DISPLAY COMPONENT ---
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

  // --- HANDLER FUNCTIONS FOR INLINE EDITING ---
  const handleHeaderBlur = (field: keyof CVData['header']) => (e: React.FocusEvent<HTMLElement>) => {
      onHeaderUpdate(field, e.currentTarget.textContent || '');
  };
  const handleSummaryBlur = (e: React.FocusEvent<HTMLElement>) => {
      onUpdate('summary', e.currentTarget.textContent || '');
  };
  const handleExperienceBlur = (index: number, field: keyof ExperienceItem) => (e: React.FocusEvent<HTMLElement>) => {
      onExperienceUpdate(index, field, e.currentTarget.textContent || '');
  };
  const handleResponsibilityBlur = (expIndex: number, respIndex: number) => (e: React.FocusEvent<HTMLLIElement>) => {
      const newResponsibilities = [...experience[expIndex].responsibilities];
      newResponsibilities[respIndex] = e.currentTarget.textContent || '';
      onExperienceUpdate(expIndex, 'responsibilities', newResponsibilities);
  };
  const handleEducationBlur = (index: number, field: keyof EducationItem) => (e: React.FocusEvent<HTMLElement>) => {
      onEducationUpdate(index, field, e.currentTarget.textContent || '');
  };
  const handleSkillBlur = (index: number) => (e: React.FocusEvent<HTMLLIElement>) => {
      onSkillsUpdate(index, e.currentTarget.textContent || '');
  };

  return (
    <div ref={ref} className="bg-white text-black font-serif shadow-lg max-w-4xl mx-auto">
        {/* EHS Document Header (Styled Text) */}
        <header className="px-12 pt-12">
            <div className="flex justify-between items-center border-b-2 border-gray-300 pb-4">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-[#940128] rounded-full">
                        <span className="text-white text-3xl font-serif italic">ehs</span>
                    </div>
                    <div>
                        <p className="text-3xl font-serif italic text-[#940128]">exclusive</p>
                        <p className="text-lg font-sans tracking-widest text-gray-700">HOUSEHOLD STAFF</p>
                    </div>
                </div>
                {photoUrl ? (
                    <Image src={photoUrl} alt="Profile Photo" width={150} height={180} className="object-cover" />
                ) : (
                    <PhotoPlaceholder />
                )}
            </div>
        </header>

        {/* Main CV Content */}
        <main className="p-12 space-y-6">
            <div className="text-center">
                <h1 contentEditable suppressContentEditableWarning onBlur={handleHeaderBlur('name')} className="text-5xl font-bold outline-none focus:ring-2 focus:ring-blue-400 px-2 rounded">{header.name}</h1>
                <p contentEditable suppressContentEditableWarning onBlur={handleHeaderBlur('title')} className="text-2xl text-gray-700 mt-2 outline-none focus:ring-2 focus:ring-blue-400 px-2 rounded">{header.title}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-12 text-sm">
                <div>
                    <p><strong>Nationality:</strong> <span contentEditable suppressContentEditableWarning onBlur={handleHeaderBlur('nationality')}>{header.nationality}</span></p>
                    <p><strong>Languages:</strong> <span contentEditable suppressContentEditableWarning onBlur={handleHeaderBlur('languages')}>{header.languages}</span></p>
                    <p><strong>Date of Birth:</strong> <span contentEditable suppressContentEditableWarning onBlur={handleHeaderBlur('dateOfBirth')}>{header.dateOfBirth}</span></p>
                </div>
                <div>
                    <p><strong>Marital Status:</strong> <span contentEditable suppressContentEditableWarning onBlur={handleHeaderBlur('maritalStatus')}>{header.maritalStatus}</span></p>
                    <p><strong>Non-Smoker:</strong> <span contentEditable suppressContentEditableWarning onBlur={handleHeaderBlur('smokerStatus')}>{header.smokerStatus}</span></p>
                    <p><strong>Driving Licence:</strong> <span contentEditable suppressContentEditableWarning onBlur={handleHeaderBlur('drivingLicence')}>{header.drivingLicence}</span></p>
                </div>
            </div>

            {/* Other Sections (Profile, Experience, etc.) remain the same */}
            {summary && (
                <section>
                    <h3 className="text-xl font-bold border-b border-gray-300 pb-1 mb-2">Profile</h3>
                    <p contentEditable suppressContentEditableWarning onBlur={handleSummaryBlur} className="text-sm leading-relaxed outline-none focus:ring-2 focus:ring-blue-400 p-2 rounded">{summary}</p>
                </section>
            )}

            {experience?.length > 0 && (
                <section>
                    <h3 className="text-xl font-bold border-b border-gray-300 pb-1 mb-3">Experience</h3>
                    <div className="space-y-4">
                        {experience.map((item, i) => (
                            <div key={i} className="text-sm">
                                <div className="flex justify-between items-baseline">
                                    <h4 contentEditable suppressContentEditableWarning onBlur={handleExperienceBlur(i, 'company')} className="font-bold outline-none focus:ring-2 focus:ring-blue-400 px-2 rounded">{item.company}</h4>
                                    <p className="text-gray-600">
                                        <span contentEditable suppressContentEditableWarning onBlur={handleExperienceBlur(i, 'startDate')} className="outline-none focus:ring-2 focus:ring-blue-400 px-2 rounded">{item.startDate}</span> - 
                                        <span contentEditable suppressContentEditableWarning onBlur={handleExperienceBlur(i, 'endDate')} className="outline-none focus:ring-2 focus:ring-blue-400 px-2 rounded">{item.endDate}</span>
                                    </p>
                                </div>
                                <p contentEditable suppressContentEditableWarning onBlur={handleExperienceBlur(i, 'title')} className="italic outline-none focus:ring-2 focus:ring-blue-400 px-2 rounded">{item.title}</p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    {item.responsibilities.map((res, j) => <li key={j} contentEditable suppressContentEditableWarning onBlur={handleResponsibilityBlur(i, j)} className="outline-none focus:ring-2 focus:ring-blue-400 rounded">{res}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {education?.length > 0 && (
                 <section>
                    <h3 className="text-xl font-bold border-b border-gray-300 pb-1 mb-3">Education</h3>
                     <div className="space-y-2">
                        {education.map((item, i) => (
                            <div key={i} className="text-sm">
                                <p>
                                    <strong contentEditable suppressContentEditableWarning onBlur={handleEducationBlur(i, 'degree')} className="outline-none focus:ring-2 focus:ring-blue-400 px-2 rounded">{item.degree}</strong>, 
                                    <span contentEditable suppressContentEditableWarning onBlur={handleEducationBlur(i, 'institution')} className="outline-none focus:ring-2 focus:ring-blue-400 px-2 rounded ml-1">{item.institution}</span> 
                                    (<span contentEditable suppressContentEditableWarning onBlur={handleEducationBlur(i, 'year')} className="outline-none focus:ring-2 focus:ring-blue-400 px-2 rounded">{item.year}</span>)
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {skills?.length > 0 && (
                <section>
                    <h3 className="text-xl font-bold border-b border-gray-300 pb-1 mb-2">Key Skills</h3>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
                        {skills.map((skill, i) => <li key={i} contentEditable suppressContentEditableWarning onBlur={handleSkillBlur(i)} className="outline-none focus:ring-2 focus:ring-blue-400 rounded">{skill}</li>)}
                    </ul>
                </section>
            )}
        </main>

        {/* EHS Document Footer (Styled Text) */}
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