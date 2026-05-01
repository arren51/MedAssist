import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: "", date_of_birth: "", biological_sex: "",
    height_cm: "", weight_kg: "",
    chronic_conditions: "", allergies: "", medications: "", notes: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setForm({
          display_name: data.display_name || "",
          date_of_birth: data.date_of_birth || "",
          biological_sex: data.biological_sex || "",
          height_cm: data.height_cm?.toString() || "",
          weight_kg: data.weight_kg?.toString() || "",
          chronic_conditions: (data.chronic_conditions || []).join(", "),
          allergies: (data.allergies || []).join(", "),
          medications: (data.medications || []).join(", "),
          notes: data.notes || "",
        });
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const toArr = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      display_name: form.display_name || null,
      date_of_birth: form.date_of_birth || null,
      biological_sex: form.biological_sex || null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      chronic_conditions: toArr(form.chronic_conditions),
      allergies: toArr(form.allergies),
      medications: toArr(form.medications),
      notes: form.notes || null,
    }, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: "Profile saved", description: "Future assessments will use this info." });
  };

  if (loading || !user) return null;

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Medical profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Used by the AI on every assessment to give you more accurate results. Your data stays private.</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Basics</h2>
          <Field label="Display name"><Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="h-11 rounded-xl" /></Field>
          <Field label="Date of birth"><Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="h-11 rounded-xl" /></Field>
          <Field label="Biological sex">
            <div className="flex gap-2">
              {["female", "male", "intersex", "prefer_not_to_say"].map((s) => (
                <button
                  key={s}
                  onClick={() => setForm({ ...form, biological_sex: s })}
                  className={`flex-1 rounded-full border-2 px-4 py-2 text-xs font-medium transition-all ${
                    form.biological_sex === s ? "border-clinical bg-clinical/5 text-clinical" : "border-border"
                  }`}
                >{s.replace(/_/g, " ")}</button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Height (cm)"><Input type="number" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} className="h-11 rounded-xl" /></Field>
            <Field label="Weight (kg)"><Input type="number" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} className="h-11 rounded-xl" /></Field>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Medical history</h2>
          <Field label="Chronic conditions" hint="Comma-separated. e.g., asthma, type 2 diabetes">
            <Textarea value={form.chronic_conditions} onChange={(e) => setForm({ ...form, chronic_conditions: e.target.value })} rows={2} className="rounded-xl" />
          </Field>
          <Field label="Allergies" hint="Comma-separated. e.g., penicillin, peanuts">
            <Textarea value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} rows={2} className="rounded-xl" />
          </Field>
          <Field label="Current medications" hint="Comma-separated. e.g., metformin 500mg, ibuprofen as needed">
            <Textarea value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} rows={2} className="rounded-xl" />
          </Field>
          <Field label="Other notes" hint="Anything else relevant — surgeries, family history, lifestyle">
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="rounded-xl" />
          </Field>
        </section>

        <Button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-full bg-clinical text-clinical-foreground hover:bg-clinical/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Save profile</>}
        </Button>
      </main>
    </div>
  );
};

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <label className="block space-y-1.5">
    <span className="text-sm font-medium">{label}</span>
    {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    {children}
  </label>
);

export default Profile;
