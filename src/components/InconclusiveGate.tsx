import { AlertTriangle, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const InconclusiveGate = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg border-2 border-caution bg-caution-light p-6 text-center space-y-4"
    >
      <div className="flex justify-center">
        <div className="rounded-full bg-caution/10 p-3">
          <AlertTriangle className="h-8 w-8 text-caution" />
        </div>
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-caution-foreground">
          Inconclusive — Manual Review Required
        </h3>
        <p className="text-sm text-muted-foreground mt-2 font-body max-w-md mx-auto">
          The analysis could not reach a high-confidence diagnosis based on the provided data. 
          This case requires professional medical consultation. Do not act on this result without physician review.
        </p>
      </div>
      <Button
        variant="outline"
        className="border-caution text-caution-foreground hover:bg-caution/10 font-display text-sm"
        onClick={() => {
          // In a real app, this would generate a PDF export
          alert("Export feature will be available when connected to a backend.");
        }}
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export for Physician Review
      </Button>
    </motion.div>
  );
};

export default InconclusiveGate;
