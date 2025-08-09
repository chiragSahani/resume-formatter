'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2, FileText, FileType, FileJson } from 'lucide-react';
import { CVData } from '@/types/cv';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { api, ApiError } from '@/lib/api';

interface ExportCVProps {
  cvData: CVData;
  onClose: () => void;
  onVisualExport: () => void; // New prop for visual export
}

type ExportFormat = 'pdf' | 'docx' | 'txt';

const formatConfig: Record<
  ExportFormat,
  { icon: React.ElementType; endpoint: string }
> = {
  pdf: { icon: FileType, endpoint: 'export-pdf' },
  docx: { icon: FileText, endpoint: 'export-docx' },
  txt: { icon: FileJson, endpoint: 'export' },
};

export default function ExportCV({ cvData, onClose, onVisualExport }: ExportCVProps) { // Added onVisualExport
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const { toast } = useToast();

  const handleExport = async (format: ExportFormat) => {
    if (!cvData._id || !cvData.header.name) {
      toast({
        title: 'Incomplete Data',
        description: 'CV data is incomplete and cannot be exported.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(format);
    const filename = `${cvData.header.name.replace(/\s+/g, '_')}_CV.${format === 'txt' ? 'txt' : format}`;
    
    try {
      switch (format) {
        case 'pdf':
          await api.exportCVAsPdf(cvData._id, filename);
          break;
        case 'docx':
          await api.exportCVAsDocx(cvData._id, filename);
          break;
        case 'txt':
          await api.exportCVAsText(cvData._id, filename);
          break;
      }

      toast({
        title: 'Export Successful',
        description: `Your CV has been exported as a ${format.toUpperCase()} file.`,
      });
    } catch (err) {
      console.error('Export error:', err);
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'An unexpected error occurred. Please try again.';
      
      toast({
        title: 'Export Failed',
        description: `Could not export as ${format.toUpperCase()}. ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Export CV
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Button>
          </div>

          <div className="space-y-4">
            {(Object.keys(formatConfig) as ExportFormat[]).map((format) => {
              const { icon: Icon } = formatConfig[format];
              const isCurrentFormatExporting = isExporting === format;
              return (
                <motion.button
                  key={format}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleExport(format)}
                  disabled={!!isExporting}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center space-x-3"
                >
                  {isCurrentFormatExporting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Icon className="h-5 w-5" />
                      <span>Download {format.toUpperCase()}</span>
                    </>
                  )}
                </motion.button>
              );
            })}
            {/* New button for visual PDF export */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onVisualExport} // Call the new prop
              disabled={!!isExporting}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center space-x-3"
            >
              <Download className="h-5 w-5" />
              <span>Export Visual PDF</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
