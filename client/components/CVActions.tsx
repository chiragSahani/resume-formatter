'use client';

import { motion } from 'framer-motion';
import { Download, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface CVActionsProps {
  onExport: () => void;
  onUploadNew: () => void;
  onToggleOriginal: () => void; // New prop to toggle original text view
  isOriginalVisible: boolean;   // New prop to determine button state
}

export default function CVActions({ onExport, onUploadNew, onToggleOriginal, isOriginalVisible }: CVActionsProps) {
  return (
    <div className="flex items-center space-x-3">
      {/* Upload New Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onUploadNew}
        className="flex items-center space-x-2 px-4 py-2 text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Upload New</span>
      </motion.button>

      {/* Toggle Original Text Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onToggleOriginal}
        className="flex items-center space-x-2 px-4 py-2 text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
      >
        {isOriginalVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span>{isOriginalVisible ? 'View Formatted CV' : 'View Original'}</span>
      </motion.button>
      
      {/* Export Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onExport}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        <span>Export</span>
      </motion.button>
    </div>
  );
}