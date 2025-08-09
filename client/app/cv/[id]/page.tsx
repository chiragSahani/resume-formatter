'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import CVPreview from "@/components/CVPreview";
import CVEditor from "@/components/CVEditor";
import ExportCV from "@/components/ExportCV";
import { CVData } from "@/types/cv";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function CVPage() {
  const { id } = useParams();
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cvPreviewRef = useRef<HTMLDivElement>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const getCvData = async () => {
      try {
        const res = await fetch(`https://resume-formatter-7rc4.onrender.com/api/cv/${id}`);
        if (!res.ok) {
          throw new Error('CV not found');
        }
        const data = await res.json();
        setCvData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      getCvData();
    }
  }, [id]);

  const handleUpdateCV = (updatedData: CVData) => {
    setCvData(updatedData);
  };

  const handleVisualExport = async () => {
    if (!cvPreviewRef.current) {
      console.error('CV Preview ref is not available.');
      return;
    }

    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const input = cvPreviewRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${cvData?.header.name || 'cv'}_visual.pdf`);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading CV...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-slate-600">{error}</p>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">CV Not Found</h1>
        <p className="text-slate-600">
          The CV you are looking for does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <header className="bg-white dark:bg-slate-900 shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">CV Builder</h1>
          <Button onClick={() => setShowExportModal(true)}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1">
          <CVEditor cvData={cvData} onUpdateCV={handleUpdateCV} />
        </div>
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">CV Preview</h2>
          <div ref={cvPreviewRef} className="border p-4 rounded-md">
            <CVPreview cvData={cvData} />
          </div>
        </div>
      </main>
      {showExportModal && (
        <ExportCV
          cvData={cvData}
          onClose={() => setShowExportModal(false)}
          onVisualExport={handleVisualExport}
        />
      )}
    </div>
  );
}
