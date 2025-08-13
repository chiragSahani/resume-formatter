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
      <div className="bg-card border border-muted rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4">Original Extracted Text</h3>
        <pre className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed bg-background/50 p-4 rounded-md">
          {text}
        </pre>
      </div>
    </motion.div>
  );
}