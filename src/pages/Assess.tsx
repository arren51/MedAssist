import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, SkipForward, Stethoscope, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { questions, getVisibleQuestions, type Question } from "@/lib/questions";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Assess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tempInput, setTempInput] = useState("");
  const [tempUnit, setTempUnit] = useState<"c" | "f">("c");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const visibleQuestions = useMemo(() => getVisibleQuestions(answers), [answers]);
  const currentQuestion = visibleQuestions[currentIndex];
  const progress = visibleQuestions.length > 0 ? ((currentIndex) / visibleQuestions.length) * 100 : 0;
  const isLast = currentIndex === visibleQuestions.length - 1;

  const setAnswer = useCallback((questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const toggleMulti = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [questionId]: next };
    });
  }, []);

  const canProceed = () => {
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.id];
    if (currentQuestion.skippable) return true;
    if (currentQuestion.type === "temperature") return true;
    if (currentQuestion.type === "input") return !!answer && (answer as string).trim().length > 0;
    if (currentQuestion.type === "multi") return Array.isArray(answer) && answer.length > 0;
    return !!answer;
  };

  const handleNext = () => {
    if (currentQuestion?.type === "temperature" && tempInput) {
      const tempC = tempUnit === "f" ? ((parseFloat(tempInput) - 32) * 5) / 9 : parseFloat(tempInput);
      setAnswer(currentQuestion.id, `${tempC.toFixed(1)}°C`);
    }
    if (isLast) {
      handleSubmit();
    } else {
      setCurrentIndex((i) => Math.min(i + 1, visibleQuestions.length - 1));
      setTempInput("");
    }
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      navigate("/");
    } else {
      setCurrentIndex((i) => Math.max(0, i - 1));
    }
  };

  const handleSkip = () => {
    if (isLast) {
      handleSubmit();
    } else {
      setCurrentIndex((i) => Math.min(i + 1, visibleQuestions.length - 1));
      setTempInput("");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Build a summary of all answers for the AI
      const summaryParts: string[] = [];
      for (const q of visibleQuestions) {
        const a = answers[q.id];
        if (!a || (Array.isArray(a) && a.length === 0)) continue;
        const qDef = questions.find((qd) => qd.id === q.id);
        if (!qDef) continue;
        if (Array.isArray(a)) {
          const labels = a.map((aid) => qDef.options?.find((o) => o.id === aid)?.label || aid);
          summaryParts.push(`${qDef.question}: ${labels.join(", ")}`);
        } else if (qDef.type === "single") {
          const label = qDef.options?.find((o) => o.id === a)?.label || a;
          summaryParts.push(`${qDef.question}: ${label}`);
        } else {
          summaryParts.push(`${qDef.question}: ${a}`);
        }
      }

      const { data, error } = await supabase.functions.invoke("diagnose", {
        body: { symptomSummary: summaryParts.join("\n") },
      });

      if (error) throw error;

      // Navigate to results with the AI response
      navigate("/results", { state: { diagnosis: data, answers } });
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      toast({
        title: "Analysis failed",
        description: "We couldn't complete the analysis. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-foreground" />
            <span className="font-semibold text-sm">MedAssist</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Progress */}
      <div className="w-full bg-secondary">
        <motion.div
          className="h-1 bg-foreground"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <main className="flex-1 flex items-start justify-center px-6 pt-12 pb-24">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Category tag */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground bg-secondary rounded-full px-3 py-1">
                  {currentQuestion.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {currentIndex + 1} of {visibleQuestions.length}
                </span>
              </div>

              {/* Question text */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">{currentQuestion.question}</h1>
                {currentQuestion.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{currentQuestion.description}</p>
                )}
              </div>

              {/* Answer options */}
              <div className="space-y-3">
                {currentQuestion.type === "multi" && currentQuestion.options?.map((opt) => {
                  const selected = ((answers[currentQuestion.id] as string[]) || []).includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleMulti(currentQuestion.id, opt.id)}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                        selected
                          ? "border-foreground bg-secondary"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{opt.label}</p>
                          {opt.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                          )}
                        </div>
                        <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          selected ? "border-foreground bg-foreground" : "border-border"
                        }`}>
                          {selected && (
                            <svg className="h-3 w-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {currentQuestion.type === "single" && currentQuestion.options?.map((opt) => {
                  const selected = answers[currentQuestion.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAnswer(currentQuestion.id, opt.id)}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                        selected
                          ? "border-foreground bg-secondary"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{opt.label}</p>
                          {opt.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                          )}
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selected ? "border-foreground" : "border-border"
                        }`}>
                          {selected && <div className="h-2.5 w-2.5 rounded-full bg-foreground" />}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {currentQuestion.type === "input" && (
                  <Input
                    value={(answers[currentQuestion.id] as string) || ""}
                    onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="h-12 rounded-xl text-sm"
                  />
                )}

                {currentQuestion.type === "temperature" && (
                  <div className="space-y-4">
                    {/* Unit toggle */}
                    <div className="inline-flex rounded-lg bg-secondary p-1">
                      <button
                        onClick={() => setTempUnit("c")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                          tempUnit === "c" ? "bg-background shadow-sm" : "text-muted-foreground"
                        }`}
                      >
                        °C
                      </button>
                      <button
                        onClick={() => setTempUnit("f")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                          tempUnit === "f" ? "bg-background shadow-sm" : "text-muted-foreground"
                        }`}
                      >
                        °F
                      </button>
                    </div>
                    <Input
                      type="number"
                      step="0.1"
                      value={tempInput}
                      onChange={(e) => setTempInput(e.target.value)}
                      placeholder={tempUnit === "c" ? "e.g., 38.5" : "e.g., 101.3"}
                      className="h-12 rounded-xl text-sm"
                    />
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Or describe how you feel:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "normal", label: "Normal / no fever" },
                          { id: "slightly_warm", label: "Slightly warm" },
                          { id: "hot", label: "Noticeably hot" },
                          { id: "very_hot", label: "Very high / burning up" },
                          { id: "unsure", label: "I'm not sure" },
                        ].map((opt) => {
                          const currentVal = answers[currentQuestion.id] as string;
                          const selected = currentVal === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setAnswer(currentQuestion.id, opt.id);
                                setTempInput("");
                              }}
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                                selected
                                  ? "border-foreground bg-foreground text-background"
                                  : "border-border hover:border-muted-foreground/40"
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          {currentQuestion.skippable ? (
            <button
              onClick={handleSkip}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward className="h-3.5 w-3.5" /> Skip
            </button>
          ) : (
            <div />
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 h-10 text-sm font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing…
              </>
            ) : isLast ? (
              <>
                Get Results <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Assess;
