import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Stethoscope, Star, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Diagnosis { condition: string; confidence: number; }

const ConfirmOutcome = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [topDiagnosis, setTopDiagnosis] = useState<string>("");
  const [pickedFromList, setPickedFromList] = useState<string | null>(null);
  const [actualText, setActualText] = useState("");
  const [rating, setRating] = useState(0);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      const { data: a } = await supabase.from("assessments").select("diagnoses, top_diagnosis").eq("id", id).maybeSingle();
      if (a) {
        setDiagnoses((a.diagnoses as any) || []);
        setTopDiagnosis(a.top_diagnosis || "");
      }
      const { data: o } = await supabase.from("assessment_outcomes").select("*").eq("assessment_id", id).maybeSingle();
      if (o) {
        setExisting(true);
        setPickedFromList(o.confirmed_diagnosis_from_list);
        setActualText(o.actual_diagnosis_text || "");
        setRating(o.accuracy_rating || 0);
        setDoctorNotes(o.doctor_notes || "");
      }
    })();
  }, [user, id]);

  const handleSave = async () => {
    if (!user || !id) return;
    if (!pickedFromList && !actualText.trim()) {
      toast({ title: "Pick or describe the diagnosis", description: "Either select from the list or type what the doctor said.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      user_id: user.id,
      assessment_id: id,
      confirmed_diagnosis_from_list: pickedFromList,
      actual_diagnosis_text: actualText.trim() || null,
      accuracy_rating: rating || null,
      doctor_notes: doctorNotes.trim() || null,
    };
    const { error } = existing
      ? await supabase.from("assessment_outcomes").update(payload).eq("assessment_id", id)
      : await supabase.from("assessment_outcomes").insert(payload);
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Thank you!", description: "Your confirmation makes future assessments more accurate." });
      navigate("/dashboard");
    }
  };

  if (loading || !user) return null;

  const noneOfThese = "__none__";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4" /><span className="font-semibold text-sm">MedAssist</span></div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success mb-4">
            <CheckCircle2 className="h-3.5 w-3.5" /> After your doctor visit
          </div>
          <h1 className="text-2xl font-bold tracking-tight">What did the doctor say?</h1>
          <p className="text-sm text-muted-foreground mt-1">Confirming the real diagnosis helps personalize your future assessments and improves the AI for everyone.</p>
        </motion.div>

        {/* Pick from AI's list */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Was it one of these?</h2>
          {diagnoses.map((d) => {
            const selected = pickedFromList === d.condition;
            return (
              <button
                key={d.condition}
                onClick={() => setPickedFromList(selected ? null : d.condition)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all ${selected ? "border-clinical bg-clinical/5" : "border-border hover:border-muted-foreground/30"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center ${selected ? "border-clinical bg-clinical" : "border-border"}`}>
                      {selected && <CheckCircle2 className="h-3.5 w-3.5 text-clinical-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{d.condition}</p>
                      <p className="text-xs text-muted-foreground">AI was {d.confidence}% confident</p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          <button
            onClick={() => setPickedFromList(pickedFromList === noneOfThese ? null : noneOfThese)}
            className={`w-full text-left rounded-xl border-2 p-4 transition-all ${pickedFromList === noneOfThese ? "border-foreground bg-secondary" : "border-dashed border-border hover:border-muted-foreground/40"}`}
          >
            <p className="text-sm font-medium">None of these — it was something else</p>
          </button>
        </section>

        {/* Free text */}
        <section className="space-y-2">
          <label className="text-sm font-medium">Actual diagnosis (from doctor)</label>
          <p className="text-xs text-muted-foreground">If your doctor used a different name or gave more detail, type it here.</p>
          <Input value={actualText} onChange={(e) => setActualText(e.target.value)} placeholder="e.g., Streptococcal pharyngitis (strep throat)" className="h-11 rounded-xl" />
        </section>

        {/* Rating */}
        <section className="space-y-2">
          <label className="text-sm font-medium">How accurate was MedAssist?</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} className="p-1">
                <Star className={`h-7 w-7 transition-all ${n <= rating ? "fill-clinical text-clinical" : "text-muted-foreground/30"}`} />
              </button>
            ))}
          </div>
        </section>

        {/* Doctor notes */}
        <section className="space-y-2">
          <label className="text-sm font-medium">Notes from your visit (optional)</label>
          <Textarea value={doctorNotes} onChange={(e) => setDoctorNotes(e.target.value)} rows={3} placeholder="Treatment, follow-up, anything you want to remember…" className="rounded-xl" />
        </section>

        <Button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-full bg-clinical text-clinical-foreground hover:bg-clinical/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save confirmation"}
        </Button>
      </main>
    </div>
  );
};

export default ConfirmOutcome;
