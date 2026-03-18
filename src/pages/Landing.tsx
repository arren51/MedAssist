import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Clock, Heart, Stethoscope, ChevronRight, Activity, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-clinical flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-clinical-foreground" />
            </div>
            <span className="font-semibold text-sm tracking-tight">MedAssist</span>
          </div>
          <Button onClick={() => navigate("/assess")} variant="ghost" size="sm" className="text-sm font-medium">
            Start Assessment <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-clinical/10 px-4 py-1.5 text-xs font-medium text-clinical mb-8"
          >
            <Activity className="h-3.5 w-3.5" />
            AI-guided diagnostic assessment
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.08] mb-6"
          >
            Understand your symptoms.
            <br />
            <span className="text-clinical">Know what to do next.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-10"
          >
            A guided assessment that narrows down possibilities step by step — and tells you honestly when it's not sure.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button onClick={() => navigate("/assess")} size="lg"
              className="bg-clinical text-clinical-foreground hover:bg-clinical/90 rounded-full px-8 h-12 text-sm font-semibold shadow-lg shadow-clinical/20">
              Start Free Assessment <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground">No account needed · Takes 2–3 minutes</p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Iterative narrowing",
                desc: "Like a doctor's consultation — each question sharpens the diagnosis until we reach a conclusion.",
                color: "text-clinical bg-clinical/10",
              },
              {
                icon: Shield,
                title: "Honest when unsure",
                desc: "If we can't narrow it down, we'll tell you — with match percentages for each possibility.",
                color: "text-success bg-success/10",
              },
              {
                icon: Clock,
                title: "Faster answers",
                desc: "Get a preliminary understanding in minutes, with guidance on exactly where to go next.",
                color: "text-caution bg-caution/10",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="p-6 rounded-2xl border bg-card"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-secondary/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-12 tracking-tight">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { step: "1", label: "General symptoms", sub: "Pain, fever, fatigue…", color: "bg-clinical text-clinical-foreground" },
              { step: "2", label: "Deep-dive questions", sub: "Location, severity, timing" , color: "bg-clinical/80 text-clinical-foreground" },
              { step: "3", label: "AI narrows down", sub: "Iterative follow-ups", color: "bg-clinical/60 text-clinical-foreground" },
              { step: "4", label: "Diagnosis + guidance", sub: "Where to go, what to do", color: "bg-clinical/40 text-clinical-foreground" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${s.color}`}>
                  {s.step}
                </div>
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 px-6 border-t">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Built for trust, not speed</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto">
            MedAssist keeps asking until it's confident — or tells you honestly that it can't reach a single conclusion. Your safety is non-negotiable.
          </p>
          <Button onClick={() => navigate("/assess")} size="lg"
            className="bg-clinical text-clinical-foreground hover:bg-clinical/90 rounded-full px-8 h-12 text-sm font-semibold shadow-lg shadow-clinical/20">
            Begin Your Assessment <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 MedAssist. For informational purposes only.</span>
          <span>This is not a substitute for professional medical advice.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
