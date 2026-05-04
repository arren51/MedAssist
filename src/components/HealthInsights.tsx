import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Heart, Shield, Activity, Sparkles, Loader2, TrendingUp, Lightbulb } from "lucide-react";

interface Insights {
  overallScore: number | null;
  immuneScore: number | null;
  fitnessScore: number | null;
  summary: string;
  patterns: string[];
  recommendations: string[];
  frequency: Record<string, number>;
}

export const HealthInsights = ({ userId, refreshKey }: { userId: string; refreshKey?: number }) => {
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [{ data: profile }, { data: assessments }] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
          supabase
            .from("assessments")
            .select("id, symptom_summary, top_diagnosis, top_confidence, created_at, assessment_outcomes(actual_diagnosis_text, confirmed_diagnosis_from_list)")
            .order("created_at", { ascending: false })
            .limit(50),
        ]);
        const enriched = (assessments || []).map((a: any) => ({
          ...a,
          confirmed_diagnosis:
            a.assessment_outcomes?.[0]?.actual_diagnosis_text ||
            (a.assessment_outcomes?.[0]?.confirmed_diagnosis_from_list && a.assessment_outcomes[0].confirmed_diagnosis_from_list !== "__none__"
              ? a.assessment_outcomes[0].confirmed_diagnosis_from_list
              : null),
        }));
        const { data: result, error: fnError } = await supabase.functions.invoke("health-insights", {
          body: { profile, assessments: enriched },
        });
        if (fnError) throw fnError;
        setData(result as Insights);
      } catch (e: any) {
        setError(e.message || "Failed to load insights");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, refreshKey]);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-gradient-to-br from-clinical/5 to-success/5 p-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Analyzing your health history…
      </div>
    );
  }
  if (error || !data) {
    return <div className="rounded-2xl border p-5 text-sm text-muted-foreground">Couldn't load insights right now.</div>;
  }

  const ScoreCard = ({ label, value, icon: Icon, color }: { label: string; value: number | null; icon: any; color: string }) => (
    <div className="rounded-2xl border bg-card p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight">{value ?? "—"}</span>
        {value != null && <span className="text-sm text-muted-foreground">/100</span>}
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value ?? 0}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${color.replace("/10", "")}`}
        />
      </div>
    </div>
  );

  const topConditions = Object.entries(data.frequency || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-clinical" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your health overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ScoreCard label="Overall" value={data.overallScore} icon={Heart} color="bg-clinical/10 text-clinical" />
        <ScoreCard label="Immune" value={data.immuneScore} icon={Shield} color="bg-success/10 text-success" />
        <ScoreCard label="Fitness" value={data.fitnessScore} icon={Activity} color="bg-caution/10 text-caution" />
      </div>

      {data.summary && (
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.patterns?.length > 0 && (
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-clinical" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patterns we noticed</h3>
            </div>
            <ul className="space-y-2">
              {data.patterns.map((p, i) => (
                <li key={i} className="text-sm flex gap-2"><span className="text-clinical">•</span>{p}</li>
              ))}
            </ul>
          </div>
        )}
        {data.recommendations?.length > 0 && (
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-success" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommendations</h3>
            </div>
            <ul className="space-y-2">
              {data.recommendations.map((r, i) => (
                <li key={i} className="text-sm flex gap-2"><span className="text-success">•</span>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {topConditions.length > 0 && (
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Most frequent conditions</h3>
          <div className="space-y-2">
            {topConditions.map(([name, count]) => {
              const max = topConditions[0][1];
              return (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-40 truncate">{name}</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-clinical" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{count}×</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
