import { motion } from "framer-motion";

interface ConfidenceBarProps {
  score: number; // 0-100
  label: string;
}

const getConfidenceLevel = (score: number) => {
  if (score >= 85) return { text: "High Confidence", colorClass: "bg-success" };
  if (score >= 60) return { text: "Moderate Confidence", colorClass: "bg-clinical" };
  if (score >= 40) return { text: "Low Confidence", colorClass: "bg-caution" };
  return { text: "Inconclusive", colorClass: "bg-destructive" };
};

const ConfidenceBar = ({ score, label }: ConfidenceBarProps) => {
  const level = getConfidenceLevel(score);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between font-display text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground text-xs">{level.text} — {score}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${level.colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default ConfidenceBar;
