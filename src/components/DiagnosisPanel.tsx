import { motion } from "framer-motion";
import { Shield, Clock, Stethoscope } from "lucide-react";
import ConfidenceBar from "./ConfidenceBar";
import InconclusiveGate from "./InconclusiveGate";

export interface DiagnosisResult {
  condition: string;
  confidence: number;
  description: string;
  recommendations: string[];
}

interface DiagnosisPanelProps {
  results: DiagnosisResult[];
  isAnalyzing: boolean;
  hasInput: boolean;
}

const DiagnosisPanel = ({ results, isAnalyzing, hasInput }: DiagnosisPanelProps) => {
  const topResult = results[0];
  const isInconclusive = topResult && topResult.confidence < 60;

  if (!hasInput) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-4">
        <div className="rounded-full bg-muted p-4">
          <Stethoscope className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-display text-sm font-medium text-foreground">Awaiting Patient Data</p>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Enter symptoms and vitals to begin diagnostic analysis.
          </p>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="rounded-full border-2 border-clinical border-t-transparent h-8 w-8"
        />
        <p className="font-display text-sm font-medium text-foreground">Analyzing Symptoms…</p>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
          Live Analysis
        </h3>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-body">
          <Clock className="h-3.5 w-3.5" /> Just now
        </span>
      </div>

      {/* Inconclusive gate */}
      {isInconclusive && <InconclusiveGate />}

      {/* Results */}
      {!isInconclusive && (
        <div className="space-y-4">
          {results.map((result, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: i * 0.05 }}
              className={`rounded-lg border p-4 space-y-3 ${
                i === 0 ? "border-clinical bg-clinical-light" : "border-border bg-card"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {i === 0 && <Shield className="h-4 w-4 text-clinical" />}
                    <h4 className="font-display text-sm font-semibold text-foreground">
                      {result.condition}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    {result.description}
                  </p>
                </div>
              </div>

              <ConfidenceBar score={result.confidence} label="Diagnostic Confidence" />

              {result.recommendations.length > 0 && (
                <div>
                  <p className="text-xs font-display font-medium text-foreground mb-1.5">Recommended Actions:</p>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, j) => (
                      <li key={j} className="text-xs text-muted-foreground font-body flex items-start gap-1.5">
                        <span className="text-clinical mt-0.5">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-md bg-muted p-3">
        <p className="text-[11px] text-muted-foreground font-body leading-relaxed">
          <strong className="font-display">Important:</strong> This tool provides preliminary analysis only and does not constitute medical advice. 
          All results must be reviewed and confirmed by a licensed healthcare professional before any clinical decisions are made.
        </p>
      </div>
    </div>
  );
};

export default DiagnosisPanel;
