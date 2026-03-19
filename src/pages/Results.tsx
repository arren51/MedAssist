import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Shield, AlertTriangle, MapPin, Navigation, Stethoscope, RotateCcw, HelpCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  cannotNarrow?: boolean;
  disclaimer: string;
}

const urgencyConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  emergency: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30", label: "Emergency" },
  urgent: { bg: "bg-caution-light", text: "text-caution-foreground", border: "border-caution/30", label: "Urgent Care" },
  routine: { bg: "bg-clinical-light", text: "text-clinical", border: "border-clinical/30", label: "Routine" },
  "self-care": { bg: "bg-success-light", text: "text-success", border: "border-success/30", label: "Self-Care" },
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [locationRequested, setLocationRequested] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [mapQuery, setMapQuery] = useState("");

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

  const { diagnoses, isInconclusive, cannotNarrow, disclaimer } = state.diagnosis;
  const topDiagnosis = diagnoses[0];
  const isNarrowed = !isInconclusive && !cannotNarrow && diagnoses.length > 0;

  const handleRequestLocation = () => {
    setLocationRequested(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          // Auto-show map with top diagnosis facility
          if (topDiagnosis) {
            setMapQuery(topDiagnosis.whereToGo);
            setShowMap(true);
          }
        },
        () => {
          setLocationDenied(true);
        }
      );
    }
  };

  const handleManualSearch = () => {
    if (manualLocation.trim()) {
      setLocationRequested(true);
      setMapQuery(topDiagnosis?.whereToGo || "hospital");
      setShowMap(true);
    }
  };

  const getMapEmbedUrl = (query: string) => {
    const baseQuery = encodeURIComponent(query);
    if (userLocation) {
      return `https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${baseQuery}&center=${userLocation.lat},${userLocation.lng}&zoom=13`;
    }
    if (manualLocation.trim()) {
      return `https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${baseQuery}+near+${encodeURIComponent(manualLocation)}`;
    }
    return `https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${baseQuery}`;
  };

  const getMapLinkUrl = (query: string) => {
    if (userLocation) {
      return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${userLocation.lat},${userLocation.lng},14z`;
    }
    if (manualLocation.trim()) {
      return `https://www.google.com/maps/search/${encodeURIComponent(query + " near " + manualLocation)}`;
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  };

  const handleFindNearby = (query: string) => {
    setMapQuery(query);
    setShowMap(true);
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
        {/* Inconclusive / Cannot narrow warning */}
        {(isInconclusive || cannotNarrow) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-caution bg-caution-light p-6 space-y-3"
          >
            <div className="flex items-center gap-3">
              {isInconclusive ? (
                <AlertTriangle className="h-5 w-5 text-caution" />
              ) : (
                <HelpCircle className="h-5 w-5 text-caution" />
              )}
              <h2 className="font-bold text-base">
                {isInconclusive
                  ? "We couldn't reach a confident diagnosis"
                  : "Multiple conditions remain possible"}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isInconclusive
                ? "Based on your symptoms, we weren't able to narrow things down with enough confidence. Please see a healthcare professional for a proper evaluation."
                : "After thorough questioning, several conditions still match your symptoms. We've ranked them below with match percentages. A healthcare professional can provide definitive testing."}
            </p>
          </motion.div>
        )}

        {/* Results header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            {isNarrowed ? "Your Provisional Diagnosis" : "Your Results"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isNarrowed
              ? "Based on your responses, the most likely match is shown below."
              : "Ranked from most to least likely based on your responses."}
          </p>
        </div>

        {/* Location section */}
        {!locationRequested && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-clinical/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-clinical" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Find care near you</h3>
                <p className="text-xs text-muted-foreground">Use your location or enter an address to find nearby facilities.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRequestLocation} size="sm" className="bg-clinical text-clinical-foreground hover:bg-clinical/90 rounded-full text-xs">
                <Navigation className="h-3.5 w-3.5 mr-1.5" /> Use My Location
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="Or enter city, postcode, or address…"
                className="h-9 rounded-full text-xs flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
              />
              <Button onClick={handleManualSearch} size="sm" variant="outline" className="rounded-full text-xs h-9" disabled={!manualLocation.trim()}>
                <Search className="h-3.5 w-3.5 mr-1" /> Search
              </Button>
            </div>
          </motion.div>
        )}

        {/* Location denied fallback */}
        {locationDenied && !manualLocation.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-caution/30 bg-caution-light p-4 space-y-3"
          >
            <p className="text-sm text-muted-foreground">Location permission denied. Enter your location manually:</p>
            <div className="flex gap-2">
              <Input
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="City, postcode, or address…"
                className="h-9 rounded-full text-xs flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
              />
              <Button onClick={handleManualSearch} size="sm" className="bg-clinical text-clinical-foreground hover:bg-clinical/90 rounded-full text-xs h-9">
                <Search className="h-3.5 w-3.5 mr-1" /> Find
              </Button>
            </div>
          </motion.div>
        )}

        {/* Embedded map */}
        {showMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-2xl overflow-hidden border"
          >
            <div className="bg-clinical/5 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-clinical" />
                <span className="text-xs font-semibold">Showing: {mapQuery}</span>
              </div>
              <a
                href={getMapLinkUrl(mapQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-clinical hover:underline"
              >
                Open in Google Maps →
              </a>
            </div>
            <iframe
              src={getMapEmbedUrl(mapQuery)}
              className="w-full h-72 border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Nearby facilities map"
            />
          </motion.div>
        )}

        {/* Diagnosis cards */}
        <div className="space-y-4">
          {diagnoses.map((d, i) => {
            const urgency = urgencyConfig[d.urgency] || urgencyConfig.routine;
            const isTop = i === 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className={`rounded-2xl border p-6 space-y-4 ${isTop ? "border-clinical bg-clinical/[0.02]" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    {isTop && !isInconclusive && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Shield className="h-3.5 w-3.5 text-clinical" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-clinical">
                          {isNarrowed ? "Provisional Diagnosis" : "Most Likely"}
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-bold">{d.condition}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{d.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${urgency.bg} ${urgency.text}`}>
                      {urgency.label}
                    </span>
                    <span className="text-sm font-bold text-foreground">{d.confidence}%</span>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${isTop ? "bg-clinical" : "bg-muted-foreground/30"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${d.confidence}%` }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  />
                </div>

                {/* Recommendations */}
                <div>
                  <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">What to do</p>
                  <ul className="space-y-1.5">
                    {d.recommendations.map((r, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-clinical shrink-0" />
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
                      <button
                        onClick={() => handleFindNearby(d.whereToGo)}
                        className="text-xs font-medium text-clinical hover:underline flex items-center gap-1"
                      >
                        Show on map <ArrowRight className="h-3 w-3" />
                      </button>
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
          <Button onClick={() => navigate("/assess")} variant="outline" className="rounded-full flex-1">
            <RotateCcw className="h-4 w-4 mr-2" /> Start New Assessment
          </Button>
          <Button onClick={() => navigate("/")} className="bg-foreground text-background hover:bg-foreground/90 rounded-full flex-1">
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Results;
