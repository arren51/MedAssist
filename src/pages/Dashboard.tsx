import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Stethoscope, Plus, User as UserIcon, LogOut, Calendar, CheckCircle2, AlertTriangle, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Assessment {
  id: string;
  symptom_summary: string;
  top_diagnosis: string | null;
  top_confidence: number | null;
  is_inconclusive: boolean;
  created_at: string;
  outcome?: { id: string; confirmed_diagnosis_from_list: string | null; actual_diagnosis_text: string | null } | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [profileName, setProfileName] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: ass }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("assessments")
          .select("id, symptom_summary, top_diagnosis, top_confidence, is_inconclusive, created_at, assessment_outcomes(id, confirmed_diagnosis_from_list, actual_diagnosis_text)")
          .order("created_at", { ascending: false }),
      ]);
      setProfileName(profile?.display_name || "");
      setAssessments(
        (ass || []).map((a: any) => ({ ...a, outcome: a.assessment_outcomes?.[0] || null }))
      );
      setFetching(false);
    })();
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-xl z-40">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-clinical flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-clinical-foreground" />
            </div>
            <span className="font-semibold text-sm">MedAssist</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/profile")} variant="ghost" size="sm"><UserIcon className="h-4 w-4 mr-1.5" /> Profile</Button>
            <Button onClick={async () => { await signOut(); navigate("/"); }} variant="ghost" size="sm"><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{profileName ? `Welcome, ${profileName.split(" ")[0]}` : "Welcome"}</h1>
            <p className="text-sm text-muted-foreground mt-1">Your assessment history and care record.</p>
          </div>
          <Button onClick={() => navigate("/assess")} className="bg-clinical text-clinical-foreground hover:bg-clinical/90 rounded-full">
            <Plus className="h-4 w-4 mr-1.5" /> New assessment
          </Button>
        </motion.div>

        {/* History */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Past assessments</h2>
          {fetching ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : assessments.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No assessments yet. Your first one builds your medical history.</p>
              <Button onClick={() => navigate("/assess")} className="rounded-full bg-clinical text-clinical-foreground hover:bg-clinical/90">Start now</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map((a) => {
                const hasOutcome = !!a.outcome;
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border p-5 hover:border-clinical/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{format(new Date(a.created_at), "MMM d, yyyy · h:mm a")}</span>
                          {a.is_inconclusive && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-caution bg-caution/10 px-2 py-0.5 rounded-full">Inconclusive</span>
                          )}
                          {hasOutcome && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-success bg-success/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Confirmed
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-base mb-1">
                          {a.top_diagnosis || "Inconclusive assessment"}
                          {a.top_confidence != null && <span className="text-muted-foreground font-normal text-sm ml-2">· {Number(a.top_confidence).toFixed(0)}% match</span>}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{a.symptom_summary.split("\n")[0]}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {!hasOutcome && (
                          <Button onClick={() => navigate(`/confirm/${a.id}`)} size="sm" variant="outline" className="rounded-full text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Confirm outcome
                          </Button>
                        )}
                        <Button onClick={() => navigate(`/assessment/${a.id}`)} size="sm" variant="ghost" className="rounded-full text-xs">
                          View <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                    {hasOutcome && (a.outcome?.confirmed_diagnosis_from_list || a.outcome?.actual_diagnosis_text) && (
                      <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs">
                        <Stethoscope className="h-3.5 w-3.5 text-success" />
                        <span className="text-muted-foreground">Doctor confirmed:</span>
                        <span className="font-medium">{a.outcome.actual_diagnosis_text || a.outcome.confirmed_diagnosis_from_list}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {assessments.some((a) => !a.outcome) && (
          <div className="rounded-2xl bg-clinical/5 border border-clinical/20 p-5 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-clinical shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">Help MedAssist get smarter</p>
              <p className="text-xs text-muted-foreground">After you've seen a doctor, confirm what they actually diagnosed. We use this to make your future assessments more accurate.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
