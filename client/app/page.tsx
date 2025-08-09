'use client';

import { useState } from 'react';
import { CVData } from '@/types/cv';
import FileUpload from '@/components/FileUpload';
import CVPreview from '@/components/CVPreview';
import Header from '@/components/Header';
import ApiStatus from '@/components/ApiStatus';

export default function HomePage() {
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [originalText, setOriginalText] = useState<string | undefined>(undefined);

  const handleFileProcessed = (data: CVData, text?: string) => {
    setCvData(data);
    setOriginalText(text);
  };

  const handleUploadNew = () => {
    setCvData(null);
    setOriginalText(undefined);
  };

  return (
    <>
      <Header />
      <ApiStatus />
      <main className="container mx-auto px-4 py-8">
        {cvData ? (
          <CVPreview 
            cvData={cvData} 
            originalText={originalText}
            onUploadNew={handleUploadNew}
          />
        ) : (
          <FileUpload onFileProcessed={handleFileProcessed} />
        )}
      </main>
    </>
  );
}
