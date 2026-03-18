import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, SkipForward, Stethoscope, Loader2, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { questions, getVisibleQuestions, type Question } from "@/lib/questions";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FollowUpQuestion {
  id: string;
  question: string;
  description: string;
  type: "single" | "multi";
  options: { id: string; label: string; description?: string }[];
}

interface Diagnosis {
  condition: string;
  confidence: number;
  description: string;
  urgency: string;
  recommendations: string[];
  whereToGo: string;
}

interface DiagnoseResponse {
  diagnoses: Diagnosis[];
  isNarrowed: boolean;
  cannotNarrow: boolean;
  isInconclusive: boolean;
  followUpQuestions: FollowUpQuestion[];
  narrowingReason?: string;
  disclaimer: string;
}

type Phase = "static" | "analyzing" | "narrowing" | "done";

const Assess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tempInput, setTempInput] = useState("");
  const [tempUnit, setTempUnit] = useState<"c" | "f">("c");

  // Iterative narrowing state
  const [phase, setPhase] = useState<Phase>("static");
  const [iteration, setIteration] = useState(0);
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [followUpIndex, setFollowUpIndex] = useState(0);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string | string[]>>({});
  const [currentDiagnoses, setCurrentDiagnoses] = useState<Diagnosis[]>([]);
  const [narrowingReason, setNarrowingReason] = useState("");
  const [allSymptomText, setAllSymptomText] = useState("");

  const visibleQuestions = useMemo(() => getVisibleQuestions(answers), [answers]);
  const currentQuestion = visibleQuestions[currentIndex];

  // Progress calculation
  const staticProgress = visibleQuestions.length > 0 ? (currentIndex / visibleQuestions.length) * 100 : 0;
  const followUpProgress = followUpQuestions.length > 0 ? (followUpIndex / followUpQuestions.length) * 100 : 0;

  const isLast = phase === "static" && currentIndex === visibleQuestions.length - 1;
  const isLastFollowUp = phase === "narrowing" && followUpIndex === followUpQuestions.length - 1;

  const setAnswer = useCallback((questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const toggleMulti = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
      return { ...prev, [questionId]: next };
    });
  }, []);

  const setFollowUpAnswer = useCallback((questionId: string, value: string | string[]) => {
    setFollowUpAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const toggleFollowUpMulti = useCallback((questionId: string, optionId: string) => {
    setFollowUpAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
      return { ...prev, [questionId]: next };
    });
  }, []);

  const buildSymptomSummary = () => {
    const parts: string[] = [];
    for (const q of visibleQuestions) {
      const a = answers[q.id];
      if (!a || (Array.isArray(a) && a.length === 0)) continue;
      const qDef = questions.find((qd) => qd.id === q.id);
      if (!qDef) continue;
      if (Array.isArray(a)) {
        const labels = a.map((aid) => qDef.options?.find((o) => o.id === aid)?.label || aid);
        parts.push(`${qDef.question}: ${labels.join(", ")}`);
      } else if (qDef.type === "single") {
        const label = qDef.options?.find((o) => o.id === a)?.label || a;
        parts.push(`${qDef.question}: ${label}`);
      } else {
        parts.push(`${qDef.question}: ${a}`);
      }
    }
    return parts.join("\n");
  };

  const buildFollowUpSummary = () => {
    const parts: string[] = [];
    for (const q of followUpQuestions) {
      const a = followUpAnswers[q.id];
      if (!a || (Array.isArray(a) && a.length === 0)) continue;
      if (Array.isArray(a)) {
        const labels = a.map((aid) => q.options?.find((o) => o.id === aid)?.label || aid);
        parts.push(`${q.question}: ${labels.join(", ")}`);
      } else {
        const label = q.options?.find((o) => o.id === a)?.label || a;
        parts.push(`${q.question}: ${label}`);
      }
    }
    return parts.join("\n");
  };

  const callDiagnose = async (symptomText: string, iter: number, prevDiagnoses?: Diagnosis[]) => {
    setPhase("analyzing");
    try {
      const { data, error } = await supabase.functions.invoke("diagnose", {
        body: {
          symptomSummary: symptomText,
          iteration: iter,
          previousDiagnoses: prevDiagnoses,
        },
      });

      if (error) throw error;
      const response = data as DiagnoseResponse;

      setCurrentDiagnoses(response.diagnoses);

      if (response.isNarrowed || response.cannotNarrow || response.isInconclusive || response.followUpQuestions.length === 0) {
        // Done — go to results
        navigate("/results", {
          state: {
            diagnosis: {
              diagnoses: response.diagnoses,
              isInconclusive: response.isInconclusive,
              cannotNarrow: response.cannotNarrow,
              disclaimer: response.disclaimer,
            },
            answers,
          },
        });
      } else {
        // More questions needed
        setFollowUpQuestions(response.followUpQuestions);
        setFollowUpIndex(0);
        setFollowUpAnswers({});
        setNarrowingReason(response.narrowingReason || "");
        setIteration(iter + 1);
        setAllSymptomText(symptomText);
        setPhase("narrowing");
      }
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      toast({
        title: "Analysis failed",
        description: "We couldn't complete the analysis. Please try again.",
        variant: "destructive",
      });
      setPhase("static");
    }
  };

  const canProceedStatic = () => {
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.id];
    if (currentQuestion.skippable) return true;
    if (currentQuestion.type === "temperature") return true;
    if (currentQuestion.type === "input") return !!answer && (answer as string).trim().length > 0;
    if (currentQuestion.type === "multi") return Array.isArray(answer) && answer.length > 0;
    return !!answer;
  };

  const canProceedFollowUp = () => {
    const q = followUpQuestions[followUpIndex];
    if (!q) return false;
    const a = followUpAnswers[q.id];
    if (q.type === "multi") return Array.isArray(a) && a.length > 0;
    return !!a;
  };

  const handleNextStatic = () => {
    if (currentQuestion?.type === "temperature" && tempInput) {
      const tempC = tempUnit === "f" ? ((parseFloat(tempInput) - 32) * 5) / 9 : parseFloat(tempInput);
      setAnswer(currentQuestion.id, `${tempC.toFixed(1)}°C`);
    }
    if (isLast) {
      const summary = buildSymptomSummary();
      callDiagnose(summary, 0);
    } else {
      setCurrentIndex((i) => Math.min(i + 1, visibleQuestions.length - 1));
      setTempInput("");
    }
  };

  const handleNextFollowUp = () => {
    if (isLastFollowUp) {
      // Submit follow-up answers
      const followUpText = buildFollowUpSummary();
      const fullText = allSymptomText + "\n\nAdditional information:\n" + followUpText;
      callDiagnose(fullText, iteration, currentDiagnoses);
    } else {
      setFollowUpIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    if (phase === "narrowing" && followUpIndex > 0) {
      setFollowUpIndex((i) => i - 1);
    } else if (phase === "narrowing" && followUpIndex === 0) {
      // Go back to results preview? Or just stay. Let's go to static end.
      setPhase("static");
      setCurrentIndex(visibleQuestions.length - 1);
    } else if (currentIndex === 0) {
      navigate("/");
    } else {
      setCurrentIndex((i) => Math.max(0, i - 1));
    }
  };

  const handleSkip = () => {
    if (phase === "narrowing") {
      handleNextFollowUp();
    } else if (isLast) {
      const summary = buildSymptomSummary();
      callDiagnose(summary, 0);
    } else {
      setCurrentIndex((i) => Math.min(i + 1, visibleQuestions.length - 1));
      setTempInput("");
    }
  };

  // Render analyzing state
  if (phase === "analyzing") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b">
          <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-foreground" />
              <span className="font-semibold text-sm">MedAssist</span>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 rounded-full border-2 border-clinical border-t-transparent"
          />
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold flex items-center gap-2 justify-center">
              <Brain className="h-5 w-5 text-clinical" />
              {iteration === 0 ? "Analyzing your symptoms…" : "Narrowing down…"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              {iteration === 0
                ? "Cross-referencing your responses against known conditions."
                : `Iteration ${iteration + 1} — refining the differential diagnosis.`}
            </p>
          </div>
          {currentDiagnoses.length > 0 && iteration > 0 && (
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">Current possibilities:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {currentDiagnoses.slice(0, 3).map((d, i) => (
                  <span key={i} className="text-xs bg-clinical/10 text-clinical px-3 py-1 rounded-full">
                    {d.condition} · {d.confidence}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Determine what question to render
  const isFollowUp = phase === "narrowing";
  const activeQuestion = isFollowUp ? followUpQuestions[followUpIndex] : currentQuestion;
  const activeAnswers = isFollowUp ? followUpAnswers : answers;
  const activeIndex = isFollowUp ? followUpIndex : currentIndex;
  const activeTotal = isFollowUp ? followUpQuestions.length : visibleQuestions.length;
  const activeProgress = isFollowUp ? followUpProgress : staticProgress;

  if (!activeQuestion) return null;

  // Unified question rendering
  const renderOptions = () => {
    const q = activeQuestion;
    const qType = "type" in q ? q.type : "single";
    const qOptions = "options" in q ? q.options : [];

    if (qType === "multi" && qOptions) {
      return qOptions.map((opt: any) => {
        const selected = ((activeAnswers[q.id] as string[]) || []).includes(opt.id);
        return (
          <button
            key={opt.id}
            onClick={() => isFollowUp ? toggleFollowUpMulti(q.id, opt.id) : toggleMulti(q.id, opt.id)}
            className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
              selected ? "border-clinical bg-clinical/5" : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                {opt.description && <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>}
              </div>
              <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                selected ? "border-clinical bg-clinical" : "border-border"
              }`}>
                {selected && (
                  <svg className="h-3 w-3 text-clinical-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          </button>
        );
      });
    }

    if (qType === "single" && qOptions) {
      return qOptions.map((opt: any) => {
        const selected = activeAnswers[q.id] === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => isFollowUp ? setFollowUpAnswer(q.id, opt.id) : setAnswer(q.id, opt.id)}
            className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
              selected ? "border-clinical bg-clinical/5" : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                {opt.description && <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>}
              </div>
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selected ? "border-clinical" : "border-border"
              }`}>
                {selected && <div className="h-2.5 w-2.5 rounded-full bg-clinical" />}
              </div>
            </div>
          </button>
        );
      });
    }

    // Temperature & input (static only)
    if (!isFollowUp && "type" in currentQuestion!) {
      if (currentQuestion!.type === "input") {
        return (
          <Input
            value={(answers[currentQuestion!.id] as string) || ""}
            onChange={(e) => setAnswer(currentQuestion!.id, e.target.value)}
            placeholder={currentQuestion!.placeholder}
            className="h-12 rounded-xl text-sm"
          />
        );
      }
      if (currentQuestion!.type === "temperature") {
        return (
          <div className="space-y-4">
            <div className="inline-flex rounded-lg bg-secondary p-1">
              <button onClick={() => setTempUnit("c")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tempUnit === "c" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>°C</button>
              <button onClick={() => setTempUnit("f")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tempUnit === "f" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>°F</button>
            </div>
            <Input type="number" step="0.1" value={tempInput} onChange={(e) => setTempInput(e.target.value)} placeholder={tempUnit === "c" ? "e.g., 38.5" : "e.g., 101.3"} className="h-12 rounded-xl text-sm" />
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
                  const selected = answers[currentQuestion!.id] === opt.id;
                  return (
                    <button key={opt.id} onClick={() => { setAnswer(currentQuestion!.id, opt.id); setTempInput(""); }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${selected ? "border-clinical bg-clinical text-clinical-foreground" : "border-border hover:border-muted-foreground/40"}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
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
          className={`h-1 ${isFollowUp ? "bg-clinical" : "bg-foreground"}`}
          initial={{ width: 0 }}
          animate={{ width: `${activeProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <main className="flex-1 flex items-start justify-center px-6 pt-12 pb-24">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${phase}-${activeQuestion.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Narrowing context banner */}
              {isFollowUp && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-clinical/5 border border-clinical/20 p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-clinical" />
                    <span className="text-xs font-semibold text-clinical">Narrowing Down</span>
                  </div>
                  {narrowingReason && (
                    <p className="text-xs text-muted-foreground">{narrowingReason}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {currentDiagnoses.slice(0, 4).map((d, i) => (
                      <span key={i} className="text-[11px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                        {d.condition} · {d.confidence}%
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Category tag */}
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium rounded-full px-3 py-1 ${isFollowUp ? "bg-clinical/10 text-clinical" : "bg-secondary text-muted-foreground"}`}>
                  {isFollowUp ? `Follow-up ${iteration}` : (currentQuestion as Question)?.category || "Question"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {activeIndex + 1} of {activeTotal}
                </span>
              </div>

              {/* Question text */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">
                  {activeQuestion.question}
                </h1>
                {activeQuestion.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{activeQuestion.description}</p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {renderOptions()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          {(!isFollowUp && currentQuestion?.skippable) || (isFollowUp) ? (
            <button onClick={handleSkip} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <SkipForward className="h-3.5 w-3.5" /> Skip
            </button>
          ) : <div />}
          <Button
            onClick={isFollowUp ? handleNextFollowUp : handleNextStatic}
            disabled={isFollowUp ? !canProceedFollowUp() : !canProceedStatic()}
            className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 h-10 text-sm font-semibold"
          >
            {isLast || isLastFollowUp ? (
              <>
                {isLastFollowUp ? "Analyze" : "Get Results"} <ArrowRight className="h-4 w-4 ml-2" />
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
