import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Shield, AlertTriangle, MapPin, Navigation, Stethoscope, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Diagnosis {
  condition: string;
  confidence: number;
  description: string;
  urgency: "emergency" | "urgent" | "routine" | "self-care";
  recommendations: string[];
  whereToGo: string;
}

interface DiagnosisResponse {
  diagnoses: Diagnosis[];
  isInconclusive: boolean;
  disclaimer: string;
}

const urgencyColors: Record<string, { bg: string; text: string; label: string }> = {
  emergency: { bg: "bg-destructive/10", text: "text-destructive", label: "Emergency" },
  urgent: { bg: "bg-caution-light", text: "text-caution-foreground", label: "Urgent Care" },
  routine: { bg: "bg-clinical-light", text: "text-clinical", label: "Routine" },
  "self-care": { bg: "bg-success-light", text: "text-success", label: "Self-Care" },
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [locationRequested, setLocationRequested] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const state = location.state as { diagnosis: DiagnosisResponse } | null;

  if (!state?.diagnosis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No results to display.</p>
          <Button onClick={() => navigate("/assess")} variant="outline" className="rounded-full">
            Start Assessment
          </Button>
        </div>
      </div>
    );
  }

  const { diagnoses, isInconclusive, disclaimer } = state.diagnosis;

  const handleRequestLocation = () => {
    setLocationRequested(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
  };

  const getMapUrl = (query: string) => {
    if (userLocation) {
      return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${userLocation.lat},${userLocation.lng},14z`;
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Home
          </button>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            <span className="font-semibold text-sm">MedAssist</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        {/* Inconclusive warning */}
        {isInconclusive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-caution bg-caution-light p-6 space-y-3"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-caution" />
              <h2 className="font-bold text-base">We couldn't reach a confident diagnosis</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Based on your symptoms, we weren't able to narrow things down with enough confidence. This doesn't mean something is wrong — it means you should see a healthcare professional who can examine you properly.
            </p>
          </motion.div>
        )}

        {/* Results header */}
        {!isInconclusive && (
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Your Results</h1>
            <p className="text-sm text-muted-foreground">
              Ranked from most to least likely based on your responses.
            </p>
          </div>
        )}

        {/* Location prompt */}
        {!locationRequested && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border p-5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-semibold">Find care near you</h3>
                <p className="text-xs text-muted-foreground">Allow location to see nearby facilities, or search manually.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRequestLocation}
                size="sm"
                className="bg-foreground text-background hover:bg-foreground/90 rounded-full text-xs"
              >
                <Navigation className="h-3.5 w-3.5 mr-1.5" /> Use My Location
              </Button>
              <Button
                onClick={() => setLocationRequested(true)}
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
              >
                Skip
              </Button>
            </div>
          </motion.div>
        )}

        {/* Diagnosis cards */}
        <div className="space-y-4">
          {diagnoses.map((d, i) => {
            const urgency = urgencyColors[d.urgency] || urgencyColors.routine;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className={`rounded-2xl border p-6 space-y-4 ${i === 0 ? "border-foreground" : ""}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    {i === 0 && !isInconclusive && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Shield className="h-3.5 w-3.5 text-foreground" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Provisional Diagnosis</span>
                      </div>
                    )}
                    <h3 className="text-lg font-bold">{d.condition}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{d.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${urgency.bg} ${urgency.text}`}>
                      {urgency.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{d.confidence}% match</span>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-foreground"
                      initial={{ width: 0 }}
                      animate={{ width: `${d.confidence}%` }}
                      transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    />
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">What to do</p>
                  <ul className="space-y-1.5">
                    {d.recommendations.map((r, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-foreground mt-1.5 h-1 w-1 rounded-full bg-foreground shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Where to go */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{d.whereToGo}</span>
                    </div>
                    {locationRequested && (
                      <a
                        href={getMapUrl(d.whereToGo)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
                      >
                        Find nearby <ArrowRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl bg-secondary p-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Important:</strong> {disclaimer || "This tool provides preliminary analysis only and does not constitute medical advice. All results must be reviewed by a licensed healthcare professional."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-12">
          <Button
            onClick={() => navigate("/assess")}
            variant="outline"
            className="rounded-full flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Start New Assessment
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-foreground text-background hover:bg-foreground/90 rounded-full flex-1"
          >
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Results;
