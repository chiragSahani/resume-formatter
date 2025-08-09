'use client';

import { useState, useRef } from 'react'; // Added useRef
import { motion } from 'framer-motion';
import { Eye, Edit3, Download, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CVData } from '@/types/cv';
import CVEditor from './CVEditor';
import CVDisplay from './CVDisplay';
import ExportCV from './ExportCV';

// Import html2canvas and jspdf
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CVPreviewProps {
  cvData: CVData; // No longer optional, always passed from server component
  originalText?: string;
}

export default function CVPreview({ cvData: initialCvData, originalText }: CVPreviewProps) {
  const router = useRouter();
  
  const [cvData, setCvData] = useState<CVData>(initialCvData);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'original'>('preview');
  const [showExport, setShowExport] = useState(false);

  const cvDisplayRef = useRef<HTMLDivElement>(null); // Ref for CVDisplay component

  const tabs = [
    { id: 'original', label: 'Original Text', icon: Eye },
    { id: 'preview', label: 'Formatted CV', icon: Eye },
    { id: 'edit', label: 'Edit CV', icon: Edit3 },
  ] as const;

  const handleUpdateCV = (updatedData: CVData) => {
    setCvData(updatedData);
  };

  // Function to handle visual PDF export
  const handleVisualPdfExport = async () => {
    if (cvDisplayRef.current) {
      setShowExport(false); // Close the export modal
      const input = cvDisplayRef.current;
      const canvas = await html2canvas(input, { scale: 2 }); // Scale for better quality
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            {cvData.header && (
            <h2 className="text-2xl font-bold text-slate-800">
              {cvData.header.name}
            </h2>
          )}
          {cvData.header && (
            <p className="text-slate-600">{cvData.header.title}</p>
          )}
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Upload New</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowExport(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'original' && (
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Original Extracted Text</h3>
                <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                  {originalText}
                </pre>
              </div>
            )}

            {activeTab === 'preview' && (
              <CVDisplay cvData={cvData} ref={cvDisplayRef} />
            )}

            {activeTab === 'edit' && (
              <CVEditor cvData={cvData} onUpdateCV={handleUpdateCV} />
            )}
          </motion.div>
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <ExportCV
          cvData={cvData}
          onClose={() => setShowExport(false)}
          onVisualExport={handleVisualPdfExport} // Pass the new handler
        />
      )}
    </div>
  );
}