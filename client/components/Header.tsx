import { motion } from 'framer-motion';
import { FileText, Sparkles, User, Briefcase } from 'lucide-react';
import { CVData } from '@/types/cv';

interface HeaderProps {
  cvData?: CVData | null;
}

export default function Header({ cvData }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-xl"
    >
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="bg-white p-3 rounded-full shadow-md"
          >
            <FileText className="h-7 w-7 text-blue-700" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">CV Formatter</h1>
            <p className="text-sm text-blue-200 flex items-center mt-1">
              <Sparkles className="h-4 w-4 mr-1 text-blue-300" />
              AI-Powered Resume Optimization
            </p>
          </div>
        </div>
          
        {cvData && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden md:flex items-center space-x-8 text-blue-100 text-base"
          >
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-300" />
              <span>{cvData.header.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-blue-300" />
              <span>{cvData.header.title}</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}