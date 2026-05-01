import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Stethoscope, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

const AssessmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [outcome, setOutcome] = useState<any>(null);

  useEffect(() => { if (!loading && !user) navigate("/auth", { replace: true }); }, [loading, user, navigate]);

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      const { data: a } = await supabase.from("assessments").select("*").eq("id", id).maybeSingle();
      setData(a);
      const { data: o } = await supabase.from("assessment_outcomes").select("*").eq("assessment_id", id).maybeSingle();
      setOutcome(o);
    })();
  }, [user, id]);

  if (loading || !user || !data) return null;

  const diagnoses: any[] = data.diagnoses || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </button>
          <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4" /><span className="font-semibold text-sm">MedAssist</span></div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(data.created_at), "MMMM d, yyyy 'at' h:mm a")}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{data.top_diagnosis || "Inconclusive assessment"}</h1>

        {outcome && (
          <div className="rounded-2xl border-2 border-success/30 bg-success/5 p-5 space-y-2">
            <div className="flex items-center gap-2 text-success font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4" /> Doctor-confirmed outcome
            </div>
            <p className="text-sm">{outcome.actual_diagnosis_text || outcome.confirmed_diagnosis_from_list}</p>
            {outcome.doctor_notes && <p className="text-xs text-muted-foreground">{outcome.doctor_notes}</p>}
          </div>
        )}

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">AI differential</h2>
          <div className="space-y-3">
            {diagnoses.map((d, i) => (
              <div key={i} className="rounded-xl border p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm">{d.condition}</p>
                  <span className="text-xs font-bold">{d.confidence}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden mb-2">
                  <div className="h-full rounded-full bg-clinical" style={{ width: `${d.confidence}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{d.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Reported symptoms</h2>
          <div className="rounded-xl border p-4">
            <pre className="text-xs whitespace-pre-wrap font-sans text-muted-foreground">{data.symptom_summary}</pre>
          </div>
        </section>

        {!outcome && (
          <Button onClick={() => navigate(`/confirm/${id}`)} className="w-full h-11 rounded-full bg-clinical text-clinical-foreground hover:bg-clinical/90">
            <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm doctor's diagnosis
          </Button>
        )}
      </main>
    </div>
  );
};

export default AssessmentDetail;
