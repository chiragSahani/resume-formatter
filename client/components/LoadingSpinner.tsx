'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ScanText, 
  FileJson, 
  Link, 
  CheckCircle, 
  Brain, 
  Zap, 
  Eye,
  Network,
  Cpu,
  Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Enhanced configuration with more sophisticated steps
const loadingSteps = [
  { 
    text: 'Initializing Neural Networks...', 
    subtext: 'Activating document analysis modules',
    icon: Brain, 
    duration: 2.5,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  { 
    text: 'Scanning Document Structure...', 
    subtext: 'Computer vision analyzing layout patterns',
    icon: Eye, 
    duration: 3,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  { 
    text: 'Processing Natural Language...', 
    subtext: 'Advanced NLP extracting semantic meaning',
    icon: Cpu, 
    duration: 3.5,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  { 
    text: 'Building Knowledge Graph...', 
    subtext: 'Connecting entities and relationships',
    icon: Network, 
    duration: 2.8,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  { 
    text: 'Optimizing Output Format...', 
    subtext: 'Applying professional standards',
    icon: Zap, 
    duration: 2,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10'
  },
  { 
    text: 'Finalizing AI Enhancement...', 
    subtext: 'Quality assurance complete',
    icon: CheckCircle, 
    duration: 1.5,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
];

// Floating particle component
const FloatingParticle = ({ delay = 0, size = 'small' }) => {
  const sizeClasses = {
    small: 'w-1 h-1',
    medium: 'w-1.5 h-1.5',
    large: 'w-2 h-2'
  };

  return (
    <motion.div
      className={`absolute rounded-full bg-primary/30 ${sizeClasses[size]}`}
      initial={{ 
        x: Math.random() * 400 - 200, 
        y: Math.random() * 400 - 200,
        opacity: 0 
      }}
      animate={{
        x: Math.random() * 400 - 200,
        y: Math.random() * 400 - 200,
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
        ease: 'easeInOut'
      }}
    />
  );
};

// Neural network visualization
const NeuralNode = ({ x, y, delay, active = false }) => (
  <motion.circle
    cx={x}
    cy={y}
    r={active ? 4 : 2}
    fill={active ? '#3b82f6' : '#6b7280'}
    initial={{ opacity: 0 }}
    animate={{ 
      opacity: [0.3, 1, 0.3],
      r: active ? [2, 6, 4] : [2, 3, 2]
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      ease: 'easeInOut'
    }}
  />
);

const NeuralConnection = ({ x1, y1, x2, y2, delay, active = false }) => (
  <motion.line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke={active ? '#3b82f6' : '#374151'}
    strokeWidth={active ? 2 : 1}
    initial={{ opacity: 0, pathLength: 0 }}
    animate={{ 
      opacity: [0.2, 0.8, 0.2],
      pathLength: [0, 1, 0]
    }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      ease: 'easeInOut'
    }}
  />
);

export default function LoadingSpinner() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeouts = loadingSteps.map((step, index) => {
      const totalPreviousDuration = loadingSteps.slice(0, index).reduce((acc, s) => acc + s.duration, 0);
      return setTimeout(() => {
        setCurrentStep(index);
      }, totalPreviousDuration * 1000);
    });

    const totalDuration = loadingSteps.reduce((acc, s) => acc + s.duration, 0);
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / (totalDuration * 10));
      });
    }, 100);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, []);

  const currentStepData = loadingSteps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="relative flex flex-col items-center justify-center py-20 text-center overflow-hidden">
      {/* Background animated grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.primary)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.primary)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_70%)]" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <FloatingParticle 
            key={i} 
            delay={i * 0.3} 
            size={['small', 'medium', 'large'][i % 3]}
          />
        ))}
      </div>

      {/* Neural network visualization */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
        <svg width="200" height="100" className="opacity-20">
          {/* Connections */}
          <NeuralConnection x1={20} y1={20} x2={60} y2={40} delay={0} active={currentStep >= 1} />
          <NeuralConnection x1={20} y1={20} x2={60} y2={60} delay={0.2} active={currentStep >= 2} />
          <NeuralConnection x1={60} y1={40} x2={140} y2={30} delay={0.4} active={currentStep >= 3} />
          <NeuralConnection x1={60} y1={60} x2={140} y2={50} delay={0.6} active={currentStep >= 4} />
          <NeuralConnection x1={140} y1={30} x2={180} y2={40} delay={0.8} active={currentStep >= 5} />
          <NeuralConnection x1={140} y1={50} x2={180} y2={40} delay={1} active={currentStep >= 6} />
          
          {/* Nodes */}
          <NeuralNode x={20} y={20} delay={0} active={currentStep >= 0} />
          <NeuralNode x={60} y={40} delay={0.3} active={currentStep >= 1} />
          <NeuralNode x={60} y={60} delay={0.6} active={currentStep >= 2} />
          <NeuralNode x={140} y={30} delay={0.9} active={currentStep >= 3} />
          <NeuralNode x={140} y={50} delay={1.2} active={currentStep >= 4} />
          <NeuralNode x={180} y={40} delay={1.5} active={currentStep >= 5} />
        </svg>
      </div>

      {/* Main content container */}
      <div className="relative z-10">
        {/* Central AI core */}
        <div className="relative w-32 h-32 mb-10">
          {/* Outer ring with rotating elements */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary/60 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0',
                  transform: `rotate(${i * 45}deg) translateX(60px) translateY(-4px)`
                }}
                animate={{
                  scale: [0.5, 1.5, 0.5],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </motion.div>

          {/* Middle ring */}
          <motion.div
            className="absolute inset-2 rounded-full border border-primary/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />

          {/* Inner core with icon */}
          <motion.div
            className={`absolute inset-4 rounded-full ${currentStepData.bgColor} flex items-center justify-center backdrop-blur-sm border border-primary/20`}
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 0 20px rgba(59, 130, 246, 0.3)',
                '0 0 40px rgba(59, 130, 246, 0.5)',
                '0 0 20px rgba(59, 130, 246, 0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ scale: 0, rotate: -90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 90, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'backOut' }}
              >
                <Icon className={`h-12 w-12 ${currentStepData.color}`} />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Pulsing energy rings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-primary/20"
              animate={{
                scale: [1, 1.5, 2],
                opacity: [0.5, 0.2, 0]
              }}
              transition={{
                duration: 3,
                delay: i * 1,
                repeat: Infinity,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>

        {/* Content section */}
        <div className="w-full max-w-md space-y-6">
          {/* Main title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary tracking-wider">AI PROCESSOR</span>
              <Activity className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Advanced Document Analysis
            </h3>
          </motion.div>

          {/* Current step */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="space-y-2"
            >
              <div className="flex items-center justify-center gap-3">
                <div className={`w-2 h-2 rounded-full ${currentStepData.color.replace('text-', 'bg-')} animate-pulse`} />
                <p className="text-lg font-medium text-foreground">
                  {currentStepData.text}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentStepData.subtext}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-mono">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 relative"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                  />
                </motion.div>
              </div>
              <div className="flex justify-between mt-2">
                {loadingSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                    animate={index === currentStep ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50"
          >
            <div className="text-center">
              <div className="text-lg font-mono text-primary">
                {currentStep + 1}/{loadingSteps.length}
              </div>
              <div className="text-xs text-muted-foreground">Steps</div>
            </div>
            <div className="text-center">
              <motion.div 
                className="text-lg font-mono text-primary"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {Math.round((currentStep / loadingSteps.length) * 100)}%
              </motion.div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
            <div className="text-center">
              <motion.div 
                className="text-lg font-mono text-emerald-500"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                AI
              </motion.div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
