'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit3, Download, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CVData } from '@/types/cv';
import CVEditor from './CVEditor';
import CVDisplay from './CVDisplay';
import ExportCV from './ExportCV';

interface CVPreviewProps {
  cvData?: CVData;
  originalText?: string;
  onUpdateCV?: (data: CVData) => void;
}

export default function CVPreview({ cvData: propCvData, originalText: propOriginalText, onUpdateCV }: CVPreviewProps) {
  const router = useRouter();
  
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [originalText, setOriginalText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'original'>('preview');
  const [showExport, setShowExport] = useState(false);

  const tabs = [
    { id: 'original', label: 'Original Text', icon: Eye },
    { id: 'preview', label: 'Formatted CV', icon: Eye },
    { id: 'edit', label: 'Edit CV', icon: Edit3 },
  ] as const;

  // Load data from props or localStorage
  useEffect(() => {
    if (propCvData) {
      setCvData(propCvData);
      localStorage.setItem('cvData', JSON.stringify(propCvData));
    } else {
      const savedData = localStorage.getItem('cvData');
      if (savedData) setCvData(JSON.parse(savedData));
    }

    if (propOriginalText) {
      setOriginalText(propOriginalText);
      localStorage.setItem('originalText', propOriginalText);
    } else {
      const savedText = localStorage.getItem('originalText');
      if (savedText) setOriginalText(savedText);
    }
  }, [propCvData, propOriginalText]);

  if (!cvData) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-600">No CV data found. Please upload your CV again.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {cvData.header.name}
            </h2>
            <p className="text-slate-600">{cvData.header.title}</p>
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
              <CVDisplay cvData={cvData} />
            )}

            {activeTab === 'edit' && (
              <CVEditor cvData={cvData} onUpdateCV={(updatedData) => {
                setCvData(updatedData);
                localStorage.setItem('cvData', JSON.stringify(updatedData));
                onUpdateCV?.(updatedData);
              }} />
            )}
          </motion.div>
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <ExportCV
          cvData={cvData}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
