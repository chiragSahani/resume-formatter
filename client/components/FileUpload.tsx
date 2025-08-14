'use client';

import { useCallback, useState } from 'react';
import { useDropzone, DropzoneRootProps } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  X,
  Brain
} from 'lucide-react';
import { CVData } from '@/types/cv';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from './LoadingSpinner'; // Import the separate component

interface FileUploadProps {
  onFileProcessed: (cvData: CVData, originalText?: string) => void;
}

export default function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      toast({
        title: 'File Rejected',
        description: 'Please upload a valid PDF, DOCX, JPG, or PNG file.',
        variant: 'destructive',
      });
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  // FIX: Destructure onDrag from getRootProps to resolve type conflict
  const { onDrag, ...rootProps }: DropzoneRootProps = getRootProps();

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('cv', selectedFile);

      // Use the environment variable for the API URL, with a fallback
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/cv/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload CV');
      }

      const data = await res.json();
      onFileProcessed(data.cvData, data.originalText);
      toast({
        title: 'Upload Successful',
        description: 'Your CV has been processed.',
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Upload Failed',
        description: err.message || 'Upload failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <>
      {/* AI Loading Spinner Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingSpinner />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto py-12">
        {/* Apply the corrected props here */}
        <motion.div
          {...rootProps}
          className={`
            relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300
            bg-card shadow-lg
            ${isDragActive
              ? 'border-primary'
              : 'border-muted hover:border-primary/80'
            }
          `}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <input {...getInputProps()} />

          <div className="space-y-4">
            <motion.div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-muted"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Upload className={`h-8 w-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
            </motion.div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1">
                {isDragActive ? 'Drop your CV here!' : 'Upload Your CV'}
              </h3>
              <p className="text-muted-foreground mb-2">
                Drag & drop, or click to browse
              </p>
              <p className="text-xs text-muted-foreground/80">
                Supports PDF, DOCX, JPG, PNG • Max 10MB
              </p>
            </div>
          </div>
        </motion.div>

        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-card border border-muted rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <motion.button
                onClick={removeFile}
                className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300
                         bg-primary text-primary-foreground shadow-lg hover:bg-primary/90
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {isUploading ? (
                <div className="flex items-center space-x-3">
                  <Brain className="h-6 w-6 animate-pulse" />
                  <span>AI Processing in Progress...</span>
                </div>
              ) : (
                <span>Process CV with AI</span>
              )}
            </motion.button>
          </motion.div>
        )}
      </div>
    </>
  );
}