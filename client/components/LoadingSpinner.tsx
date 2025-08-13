'use client';

import { motion } from 'framer-motion';
import { Sparkles, ScanText, FileJson, Link, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

// --- Configuration for the loading steps ---
const loadingSteps = [
  { text: 'Analyzing Document Layout...', icon: ScanText, duration: 2 },
  { text: 'Structuring Content via AI...', icon: FileJson, duration: 3 },
  { text: 'Enriching Data & Applying Rules...', icon: Link, duration: 2.5 },
  { text: 'Finalizing Professional Format...', icon: CheckCircle, duration: 1.5 },
];

export default function LoadingSpinner() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timeouts = loadingSteps.map((step, index) => {
      const totalPreviousDuration = loadingSteps.slice(0, index).reduce((acc, s) => acc + s.duration, 0);
      return setTimeout(() => {
        setCurrentStep(index);
      }, totalPreviousDuration * 1000);
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const totalDuration = loadingSteps.reduce((acc, s) => acc + s.duration, 0);
  const Icon = loadingSteps[currentStep].icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative w-24 h-24 mb-8">
        {/* Orbiting sparkles for a more dynamic effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="h-6 w-6 text-primary absolute top-0 left-1/2 -translate-x-1/2" />
        </motion.div>
        
        {/* Main Icon that pulses */}
        <motion.div
            className="w-full h-full rounded-full bg-muted flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
            <Icon className="h-10 w-10 text-primary" />
        </motion.div>
      </div>
      
      <div className="w-full max-w-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          AI is Processing Your CV...
        </h3>
        
        {/* Animated text for the current step */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-6" // Fixed height to prevent layout shift
        >
          <p className="text-muted-foreground">{loadingSteps[currentStep].text}</p>
        </motion.div>
        
        {/* Dynamic Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden mt-4">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: totalDuration, ease: 'linear' }}
          />
        </div>
      </div>
    </div>
  );
}