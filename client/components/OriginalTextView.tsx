
import { motion } from 'framer-motion';

interface OriginalTextViewProps {
  text: string;
}

export default function OriginalTextView({ text }: OriginalTextViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Original Extracted Text</h3>
        <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
          {text}
        </pre>
      </div>
    </motion.div>
  );
}
