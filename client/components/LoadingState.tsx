'use client';

import { motion } from 'framer-motion';
import { Loader2, FileText, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export default function LoadingState({ 
  message = "Processing your CV...", 
  submessage = "This may take a few moments" 
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        {/* Animated Icon */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto"
          >
            <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-800 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {message}
          </h3>
          <p className="text-slate-600">{submessage}</p>
        </div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-2 text-sm text-slate-500"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Extracting content from document</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            ></motion.div>
            <span>AI processing and formatting</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
            <span>Preparing structured output</span>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 8, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}