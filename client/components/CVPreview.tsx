'use client';

import { useState, useRef } from 'react';
import { CVData } from '@/types/cv';
import CVDisplay from './CVDisplay';
import ExportCV from './ExportCV';
import CVActions from './CVActions';
import OriginalTextView from './OriginalTextView';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


interface CVPreviewProps {
  cvData: CVData;
  originalText?: string;
  onUploadNew: () => void;
}

export default function CVPreview({ cvData: initialCvData, originalText, onUploadNew }: CVPreviewProps) {
  const [cvData, setCvData] = useState<CVData>(initialCvData);
  const [showExport, setShowExport] = useState(false);
  const { toast } = useToast();

  const cvDisplayRef = useRef<HTMLDivElement>(null);

  const handleVisualPdfExport = async () => {
    if (cvDisplayRef.current && cvData?.header?.name) {
      setShowExport(false);
      
      try {
        toast({
          title: 'Generating PDF...',
          description: 'Please wait while we create your visual PDF.',
        });

        const input = cvDisplayRef.current;
        // When taking the screenshot, temporarily set the background to white
        const originalBg = input.style.backgroundColor;
        input.style.backgroundColor = '#ffffff';

        const canvas = await html2canvas(input, { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
        });

        // Restore original background color
        input.style.backgroundColor = originalBg;

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
    } else {
      toast({
        title: 'Error',
        description: 'Cannot export: CV data is incomplete.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg shadow-sm border-border p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {cvData.header.name}
            </h2>
            <p className="text-muted-foreground">{cvData.header.title}</p>
          </div>
          <CVActions onExport={() => setShowExport(true)} onUploadNew={onUploadNew} />
        </div>
      </div>

      <Tabs defaultValue="formatted">
        <TabsList>
          <TabsTrigger value="formatted">Formatted CV</TabsTrigger>
          <TabsTrigger value="original">Original Text</TabsTrigger>
        </TabsList>
        <TabsContent value="formatted" className="p-6">
            <CVDisplay cvData={cvData} setCvData={setCvData} ref={cvDisplayRef} />
        </TabsContent>
        <TabsContent value="original" className="p-6">
            {originalText ? (
                <OriginalTextView text={originalText} />
            ) : (
                <p>No original text available.</p>
            )}
        </TabsContent>
      </Tabs>


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
