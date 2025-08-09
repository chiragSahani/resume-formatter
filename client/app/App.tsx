'use client';

import { useState } from 'react';
import { CVData } from '@/types/cv';
import FileUpload from '@/components/FileUpload';
import CVPreview from '@/components/CVPreview';
import Header from '@/components/Header';

export default function App() {
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [originalText, setOriginalText] = useState<string>('');

  const handleFileProcessed = (data: CVData) => {
    setCvData(data);
  };

  const handleUpdateCV = (data: CVData) => {
    setCvData(data);
  };

  return (
    <>
      <Header cvData={cvData} />
      <main className="container mx-auto px-4 py-8">
        {!cvData ? (
          <FileUpload onFileProcessed={handleFileProcessed} />
        ) : (
          <CVPreview cvData={cvData} originalText={originalText} />
        )}
      </main>
    </>
  );
}
