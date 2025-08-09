import { motion } from 'framer-motion';
import { FileText, Sparkles, User, Briefcase } from 'lucide-react';
import { CVData } from '@/types/cv';

interface HeaderProps {
  cvData?: CVData | null;
}

export default function Header({ cvData }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-b border-slate-200 shadow-sm"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">CV Formatter</h1>
              <p className="text-sm text-slate-600 flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </p>
            </div>
          </div>
          
          {cvData && cvData.header && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden md:flex items-center space-x-6 text-sm text-slate-600"
            >
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-slate-500" />
                <span>{cvData.header.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-slate-500" />
                <span>{cvData.header.title}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
