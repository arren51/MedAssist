import { useState } from "react";
import { Plus, X, Thermometer, Heart, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SymptomInputProps {
  symptoms: string[];
  onAddSymptom: (symptom: string) => void;
  onRemoveSymptom: (index: number) => void;
  vitals: { temp: string; heartRate: string; bp: string };
  onVitalsChange: (vitals: { temp: string; heartRate: string; bp: string }) => void;
}

const SymptomInput = ({ symptoms, onAddSymptom, onRemoveSymptom, vitals, onVitalsChange }: SymptomInputProps) => {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !symptoms.includes(trimmed)) {
      onAddSymptom(trimmed);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="space-y-6">
      {/* Vitals */}
      <div>
        <h3 className="font-display text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Patient Vitals</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5" /> Temp (°F)
            </label>
            <Input
              value={vitals.temp}
              onChange={(e) => onVitalsChange({ ...vitals, temp: e.target.value })}
              placeholder="98.6"
              className="h-9 text-sm font-body"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" /> Heart Rate
            </label>
            <Input
              value={vitals.heartRate}
              onChange={(e) => onVitalsChange({ ...vitals, heartRate: e.target.value })}
              placeholder="72"
              className="h-9 text-sm font-body"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Blood Pressure
            </label>
            <Input
              value={vitals.bp}
              onChange={(e) => onVitalsChange({ ...vitals, bp: e.target.value })}
              placeholder="120/80"
              className="h-9 text-sm font-body"
            />
          </div>
        </div>
      </div>

      {/* Symptoms */}
      <div>
        <h3 className="font-display text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Reported Symptoms</h3>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a symptom (e.g., persistent cough)"
            className="h-9 text-sm font-body flex-1"
          />
          <Button onClick={handleAdd} size="sm" className="h-9 bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {symptoms.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {symptoms.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-md bg-clinical-light text-clinical px-2.5 py-1 text-xs font-medium font-body animate-fade-in"
              >
                {s}
                <button onClick={() => onRemoveSymptom(i)} className="hover:text-destructive transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {symptoms.length === 0 && (
          <p className="text-xs text-muted-foreground mt-3 font-body">
            No symptoms entered. Add symptoms to begin analysis.
          </p>
        )}
      </div>
    </div>
  );
};

export default SymptomInput;
