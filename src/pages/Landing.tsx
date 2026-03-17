import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Clock, Heart, Stethoscope, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-background" />
            </div>
            <span className="font-semibold text-sm tracking-tight">MedAssist</span>
          </div>
          <Button
            onClick={() => navigate("/assess")}
            variant="ghost"
            size="sm"
            className="text-sm font-medium"
          >
            Start Assessment <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground mb-8 animate-fade-in">
            <Shield className="h-3.5 w-3.5" />
            Your health comes first. Always.
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.08] mb-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Understand your symptoms.
            <br />
            <span className="text-muted-foreground">Know what to do next.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 opacity-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            A guided, AI-powered assessment that helps you understand what might be going on — and tells you honestly when it's not sure.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 opacity-0 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button
              onClick={() => navigate("/assess")}
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 h-12 text-sm font-semibold"
            >
              Start Free Assessment <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground">No account needed · Takes 2–3 minutes</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Faster answers",
                desc: "Get a preliminary understanding in minutes, not hours in a waiting room.",
              },
              {
                icon: Shield,
                title: "Honest when unsure",
                desc: "If we can't reach a confident diagnosis, we'll tell you — and guide you to the right care.",
              },
              {
                icon: Heart,
                title: "Guided, not guessing",
                desc: "Step-by-step questions that narrow down possibilities, like a doctor's consultation.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border bg-card opacity-0 animate-fade-up"
                style={{ animationDelay: `${0.4 + i * 0.1}s` }}
              >
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
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
              { step: "1", label: "Answer general questions", sub: "Pain, fever, fatigue…" },
              { step: "2", label: "Go deeper where needed", sub: "Specific symptoms & vitals" },
              { step: "3", label: "AI analyzes patterns", sub: "Cross-referencing conditions" },
              { step: "4", label: "Get guided next steps", sub: "With location-based care" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold">
                  {s.step}
                </div>
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 px-6 border-t">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Built for trust, not speed</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto">
            MedAssist never guesses. If the confidence in a diagnosis is below our threshold, we'll flag it as inconclusive and recommend you see a professional. Your safety is non-negotiable.
          </p>
          <Button
            onClick={() => navigate("/assess")}
            size="lg"
            className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 h-12 text-sm font-semibold"
          >
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
