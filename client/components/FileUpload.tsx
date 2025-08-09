'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, X, AlertCircle, Loader2 } from 'lucide-react';
import { CVData } from '@/types/cv';

interface FileUploadProps {
  onFileProcessed: (cvData: CVData) => void;
}

export default function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      setError('Please upload a valid PDF or DOCX file.');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('cv', selectedFile);

      const res = await fetch('https://resume-formatter-7rc4.onrender.com/api/cv/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload CV');
      }

      const data = await res.json();
      onFileProcessed(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors
            ${isDragActive ? 'bg-blue-100' : 'bg-slate-100'}`}>
            <Upload className={`h-8 w-8 ${isDragActive ? 'text-blue-600' : 'text-slate-600'}`} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {isDragActive ? 'Drop your CV here' : 'Upload your CV'}
            </h3>
            <p className="text-slate-600 mb-4">
              Drag and drop your file here, or click to select
            </p>
            <p className="text-sm text-slate-500">
              Supports PDF, DOCX • Max size: 10MB
            </p>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
        >
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </motion.div>
      )}

      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-white border border-slate-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{selectedFile.name}</p>
                <p className="text-sm text-slate-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Process CV with AI</span>
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
