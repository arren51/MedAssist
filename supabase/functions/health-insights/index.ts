import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profile, assessments } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (!Array.isArray(assessments) || assessments.length === 0) {
      return new Response(
        JSON.stringify({
          overallScore: null,
          immuneScore: null,
          fitnessScore: null,
          summary: "Not enough data yet. Complete a few assessments to unlock personalized health insights.",
          patterns: [],
          recommendations: [],
          frequency: {},
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Frequency stats
    const freq: Record<string, number> = {};
    let confirmedCount = 0;
    const now = Date.now();
    let last90 = 0;
    for (const a of assessments) {
      const dx = a.confirmed_diagnosis || a.actual_diagnosis_text || a.top_diagnosis;
      if (dx) freq[dx] = (freq[dx] || 0) + 1;
      if (a.confirmed_diagnosis || a.actual_diagnosis_text) confirmedCount++;
      if (a.created_at && now - new Date(a.created_at).getTime() < 90 * 86400000) last90++;
    }

    const profileLines: string[] = [];
    if (profile) {
      if (profile.date_of_birth) {
        const age = Math.floor((now - new Date(profile.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        profileLines.push(`Age: ${age}`);
      }
      if (profile.biological_sex) profileLines.push(`Sex: ${profile.biological_sex}`);
      if (profile.height_cm) profileLines.push(`Height: ${profile.height_cm} cm`);
      if (profile.weight_kg) profileLines.push(`Weight: ${profile.weight_kg} kg`);
      if (profile.chronic_conditions?.length) profileLines.push(`Chronic: ${profile.chronic_conditions.join(", ")}`);
      if (profile.allergies?.length) profileLines.push(`Allergies: ${profile.allergies.join(", ")}`);
      if (profile.medications?.length) profileLines.push(`Meds: ${profile.medications.join(", ")}`);
    }

    const historyLines = assessments.slice(0, 30).map((a: any) => {
      const date = a.created_at ? new Date(a.created_at).toISOString().slice(0, 10) : "?";
      const ai = a.top_diagnosis || "inconclusive";
      const confirmed = a.confirmed_diagnosis || a.actual_diagnosis_text;
      const symptoms = (a.symptom_summary || "").split("\n")[0].slice(0, 200);
      return `- ${date} | symptoms: ${symptoms} | AI: ${ai}${confirmed ? ` | doctor: ${confirmed}` : ""}`;
    });

    const systemPrompt = `You are a holistic health analyst. Based on a patient's profile and assessment history, produce a JSON-only health overview.

Patient profile:
${profileLines.join("\n") || "(none)"}

Total assessments: ${assessments.length} (last 90 days: ${last90}, doctor-confirmed: ${confirmedCount})
Diagnosis frequency: ${JSON.stringify(freq)}

History:
${historyLines.join("\n")}

Return STRICT JSON:
{
  "overallScore": number 0-100,
  "immuneScore": number 0-100,
  "fitnessScore": number 0-100,
  "summary": "2-3 sentence plain-English overview",
  "patterns": ["short bullet of pattern noticed", ...up to 5],
  "recommendations": ["actionable suggestion", ...up to 5],
  "frequency": { "Condition Name": count, ... }
}

Scoring rubric:
- overallScore: holistic. Frequent illness, unresolved chronic patterns, or many recent assessments lower it.
- immuneScore: based on infection frequency, recurring colds/flu/respiratory/sinus issues, recovery time.
- fitnessScore: based on profile (BMI if available), musculoskeletal complaints, energy/fatigue patterns, age-adjusted.
Be honest but encouraging. Never diagnose — give general wellness guidance only.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: "Generate the health overview JSON." }],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`AI gateway error: ${resp.status} ${t}`);
    }
    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    parsed.frequency = parsed.frequency || freq;

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("health-insights error", e);
    return new Response(JSON.stringify({ error: e.message || "Failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
