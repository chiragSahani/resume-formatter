'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, X, AlertCircle, Loader2 } from 'lucide-react';
import { CVData } from '@/types/cv';

interface FileUploadProps {
  onFileProcessed: (cvData: CVData, originalText?: string) => void;
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cv/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload CV');
      }

      const data = await res.json();
      onFileProcessed(data.cvData, data.originalText);
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
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-500 ease-out
          bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg hover:shadow-xl
          ${isDragActive 
            ? 'border-blue-500 bg-blue-900' 
            : 'border-gray-600 hover:border-blue-400'
          }
        `}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />
      
        <div className="space-y-6">
          <motion.div
            className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300
              ${isDragActive ? 'bg-blue-900' : 'bg-gray-700'}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Upload className={`h-10 w-10 ${isDragActive ? 'text-blue-400' : 'text-gray-400'}`} />
          </motion.div>
          
          <div>
            <h3 className="text-2xl font-extrabold text-gray-200 mb-2">
              {isDragActive ? 'Drop your CV here!' : 'Upload Your CV with AI'}
            </h3>
            <p className="text-gray-400 mb-4 text-lg">
              Drag & drop your file, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, DOCX • Max size: 10MB
            </p>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 shadow-md"
        >
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-base font-medium">{error}</p>
        </motion.div>
      )}

      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-gray-800 border border-gray-700 rounded-2xl shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-900 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-lg text-gray-200">{selectedFile.name}</p>
                <p className="text-sm text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <motion.button
              onClick={removeFile}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-6 w-6 text-gray-400" />
            </motion.button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300
                       bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Processing with AI...</span>
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