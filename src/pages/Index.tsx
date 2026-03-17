import { useState, useCallback } from "react";
import { Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import SymptomInput from "@/components/SymptomInput";
import DiagnosisPanel, { DiagnosisResult } from "@/components/DiagnosisPanel";
import { runDiagnosis } from "@/lib/mockDiagnosis";

const Index = () => {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [vitals, setVitals] = useState({ temp: "", heartRate: "", bp: "" });
  const [results, setResults] = useState<DiagnosisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const handleAddSymptom = useCallback((symptom: string) => {
    setSymptoms((prev) => [...prev, symptom]);
  }, []);

  const handleRemoveSymptom = useCallback((index: number) => {
    setSymptoms((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAnalyze = useCallback(() => {
    if (symptoms.length === 0) return;
    setIsAnalyzing(true);
    setHasRun(true);
    // Simulate analysis delay
    setTimeout(() => {
      const diagnosis = runDiagnosis(symptoms);
      setResults(diagnosis);
      setIsAnalyzing(false);
    }, 800);
  }, [symptoms]);

  const handleClear = useCallback(() => {
    setSymptoms([]);
    setVitals({ temp: "", heartRate: "", bp: "" });
    setResults([]);
    setHasRun(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="rounded-md bg-secondary p-1.5">
              <Shield className="h-4 w-4 text-secondary-foreground" />
            </div>
            <span className="font-display text-sm font-semibold text-foreground tracking-tight">
              MedAssist Diagnostic Engine
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground font-body">
            v1.0 — For Clinical Support Only
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-8rem)]">
          {/* Left: Input Panel */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-foreground">
                  Patient Assessment
                </h2>
                <button
                  onClick={handleClear}
                  className="text-xs text-muted-foreground hover:text-foreground font-body transition-colors"
                >
                  Clear All
                </button>
              </div>

              <SymptomInput
                symptoms={symptoms}
                onAddSymptom={handleAddSymptom}
                onRemoveSymptom={handleRemoveSymptom}
                vitals={vitals}
                onVitalsChange={setVitals}
              />

              <Button
                onClick={handleAnalyze}
                disabled={symptoms.length === 0 || isAnalyzing}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-display text-sm h-10"
              >
                <Search className="h-4 w-4 mr-2" />
                {isAnalyzing ? "Analyzing…" : "Run Diagnostic Analysis"}
              </Button>
            </div>

            {/* Quick reference */}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-display text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                How It Works
              </h3>
              <ol className="space-y-2 text-xs text-muted-foreground font-body">
                <li className="flex gap-2">
                  <span className="font-display font-semibold text-clinical">1.</span>
                  Enter patient vitals and reported symptoms
                </li>
                <li className="flex gap-2">
                  <span className="font-display font-semibold text-clinical">2.</span>
                  Run the diagnostic analysis engine
                </li>
                <li className="flex gap-2">
                  <span className="font-display font-semibold text-clinical">3.</span>
                  Review results with confidence scores
                </li>
                <li className="flex gap-2">
                  <span className="font-display font-semibold text-clinical">4.</span>
                  If inconclusive, export for physician review
                </li>
              </ol>
            </div>
          </div>

          {/* Right: Diagnosis Panel */}
          <div className="rounded-lg border bg-card p-5">
            <DiagnosisPanel
              results={results}
              isAnalyzing={isAnalyzing}
              hasInput={hasRun}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
