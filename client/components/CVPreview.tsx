'use client';

import { useState, useRef } from 'react';
import { CVData, ExperienceItem, EducationItem } from '@/types/cv';
import CVDisplay from './CVDisplay';
import ExportCV from './ExportCV';
import CVActions from './CVActions';
import OriginalTextView from './OriginalTextView';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CVPreviewProps {
  cvData: CVData;
  originalText?: string;
  onUploadNew: () => void;
}

export default function CVPreview({ cvData: initialCvData, originalText, onUploadNew }: CVPreviewProps) {
  const [cvData, setCvData] = useState<CVData>(initialCvData);
  const [showExport, setShowExport] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false); // State to toggle original text view

  const cvDisplayRef = useRef<HTMLDivElement>(null);
  
  // --- STATE UPDATE HANDLERS ---

  const handleUpdate = (field: keyof CVData, value: any) => {
    setCvData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleHeaderUpdate = (headerField: keyof CVData['header'], value: string) => {
    setCvData(prev => ({
      ...prev,
      header: { ...prev.header, [headerField]: value }
    }));
  };
  
  const onExperienceUpdate = (index: number, field: keyof ExperienceItem, value: string | string[]) => {
      const newExperience = [...cvData.experience];
      (newExperience[index] as any)[field] = value;
      setCvData(prev => ({ ...prev, experience: newExperience }));
  };

  const onEducationUpdate = (index: number, field: keyof EducationItem, value: string) => {
      const newEducation = [...cvData.education];
      (newEducation[index] as any)[field] = value;
      setCvData(prev => ({ ...prev, education: newEducation }));
  };
  
  const onSkillsUpdate = (index: number, value: string) => {
      const newSkills = [...cvData.skills];
      newSkills[index] = value;
      setCvData(prev => ({ ...prev, skills: newSkills }));
  };


  // --- PDF EXPORT FUNCTION ---

  const handleVisualPdfExport = async () => {
    if (cvDisplayRef.current) {
      setShowExport(false);
      const input = cvDisplayRef.current;
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${cvData.header.name.replace(/\s+/g, '_')}_Visual_CV.pdf`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="bg-card border border-muted rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {cvData.header.name}
            </h2>
            <p className="text-muted-foreground">{cvData.header.title}</p>
          </div>
          <CVActions 
            onExport={() => setShowExport(true)} 
            onUploadNew={onUploadNew} 
            onToggleOriginal={() => setShowOriginal(!showOriginal)}
            isOriginalVisible={showOriginal}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 md:p-6">
        {showOriginal && originalText ? (
          <OriginalTextView text={originalText} />
        ) : (
          <CVDisplay 
            cvData={cvData} 
            ref={cvDisplayRef} 
            onUpdate={handleUpdate}
            onHeaderUpdate={handleHeaderUpdate}
            onExperienceUpdate={onExperienceUpdate}
            onEducationUpdate={onEducationUpdate}
            onSkillsUpdate={onSkillsUpdate}
          />
        )}
      </div>

      {/* Export Modal */}
      {showExport && (
        <ExportCV
          cvData={cvData}
          onClose={() => setShowExport(false)}
          onVisualExport={handleVisualPdfExport}
        />
      )}
    </div>
  );
}