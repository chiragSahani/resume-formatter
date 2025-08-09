'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CVData } from '@/types/cv';
import CVEditor from './CVEditor';
import CVDisplay from './CVDisplay';
import ExportCV from './ExportCV';
import CVActions from './CVActions';
import CVTabs, { Tab } from './CVTabs';
import OriginalTextView from './OriginalTextView';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

interface CVPreviewProps {
  cvData: CVData;
  originalText?: string;
  onUploadNew: () => void;
}

export default function CVPreview({ cvData: initialCvData, originalText, onUploadNew }: CVPreviewProps) {
  const [cvData, setCvData] = useState<CVData>(initialCvData);
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [showExport, setShowExport] = useState(false);
  const { toast } = useToast();

  const cvDisplayRef = useRef<HTMLDivElement>(null);

  const handleUpdateCV = (updatedData: CVData) => {
    setCvData(updatedData);
    setActiveTab('preview');
  };

  const handleVisualPdfExport = async () => {
    if (cvDisplayRef.current) {
      setShowExport(false);
      
      try {
        toast({
          title: 'Generating PDF...',
          description: 'Please wait while we create your visual PDF.',
        });

        const input = cvDisplayRef.current;
        const canvas = await html2canvas(input, { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
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
        
        toast({
          title: 'Success!',
          description: 'Your visual PDF has been downloaded.',
        });
      } catch (error) {
        console.error('Visual PDF export error:', error);
        toast({
          title: 'Export Failed',
          description: 'Failed to generate visual PDF. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {cvData.header.name}
            </h2>
            <p className="text-slate-600">{cvData.header.title}</p>
          </div>
          <CVActions onExport={() => setShowExport(true)} onUploadNew={onUploadNew} />
        </div>
      </div>

      <CVTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="p-6">
        {activeTab === 'original' && originalText && (
          <OriginalTextView text={originalText} />
        )}

        {activeTab === 'preview' && (
          <CVDisplay cvData={cvData} ref={cvDisplayRef} />
        )}

        {activeTab === 'edit' && (
          <CVEditor cvData={cvData} onUpdateCV={handleUpdateCV} />
        )}
      </div>

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
