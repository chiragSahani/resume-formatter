import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mb-6"
      >
        <Loader2 className="h-12 w-12 text-blue-600" />
      </motion.div>
      
      <div className="text-center space-y-3">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-gray-200 flex items-center justify-center"
        >
          <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
          AI is processing your CV...
        </motion.h3>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-1"
        >
          <p className="text-gray-400">Extracting and analyzing content</p>
          <p className="text-gray-400">Formatting for professional presentation</p>
          <p className="text-gray-400">Optimizing for recruiter readability</p>
        </motion.div>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, delay: 0.6 }}
          className="w-64 mx-auto mt-4"
        >
          <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 3, delay: 0.6 }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}