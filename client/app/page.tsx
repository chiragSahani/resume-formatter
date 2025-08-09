'use client';

import { useRouter } from 'next/navigation';
import { CVData } from '@/types/cv';
import FileUpload from '@/components/FileUpload';
import Header from '@/components/Header'; // Assuming Header is a general layout component

export default function UploadPage() {
  const router = useRouter();

  const handleFileProcessed = (data: CVData) => {
    // After upload, redirect to the new dynamic page for preview
    router.push(`/cv/${data._id}`);
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <FileUpload onFileProcessed={handleFileProcessed} />
      </main>
    </>
  );
}