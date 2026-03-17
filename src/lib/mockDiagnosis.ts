import type { DiagnosisResult } from "@/components/DiagnosisPanel";

// Mock diagnostic engine - will be replaced by AI backend
const symptomDatabase: Record<string, { conditions: DiagnosisResult[] }> = {
  default: {
    conditions: [
      {
        condition: "Inconclusive Analysis",
        confidence: 35,
        description: "Insufficient symptom data to determine a diagnosis with acceptable confidence.",
        recommendations: [
          "Provide additional symptom details",
          "Schedule in-person evaluation with a physician",
          "Consider laboratory testing for further clarity",
        ],
      },
    ],
  },
};

const conditionMap: { keywords: string[]; result: DiagnosisResult }[] = [
  {
    keywords: ["fever", "cough", "fatigue", "body ache", "sore throat"],
    result: {
      condition: "Upper Respiratory Infection",
      confidence: 87,
      description: "Viral infection of the upper respiratory tract, commonly presenting with fever, cough, and general malaise.",
      recommendations: [
        "Rest and adequate hydration",
        "Over-the-counter antipyretics for fever management",
        "Monitor for symptom progression over 5–7 days",
        "Seek immediate care if breathing difficulty develops",
      ],
    },
  },
  {
    keywords: ["headache", "nausea", "sensitivity to light", "visual disturbance"],
    result: {
      condition: "Migraine",
      confidence: 82,
      description: "Neurovascular condition characterized by recurrent moderate-to-severe headaches, often with associated symptoms.",
      recommendations: [
        "Administer prescribed migraine-specific medication",
        "Rest in a dark, quiet environment",
        "Maintain a headache diary for pattern identification",
        "Consult neurology if frequency exceeds 4 episodes per month",
      ],
    },
  },
  {
    keywords: ["chest pain", "shortness of breath", "dizziness"],
    result: {
      condition: "Cardiac Evaluation Required",
      confidence: 45,
      description: "Symptoms may indicate a cardiac event. Confidence is insufficient for remote diagnosis.",
      recommendations: [
        "Immediate emergency department evaluation recommended",
        "ECG and cardiac biomarker testing required",
        "Do not delay seeking in-person medical attention",
      ],
    },
  },
  {
    keywords: ["rash", "itching", "swelling", "redness"],
    result: {
      condition: "Allergic Dermatitis",
      confidence: 78,
      description: "Inflammatory skin reaction likely triggered by allergen exposure.",
      recommendations: [
        "Identify and avoid suspected allergens",
        "Topical corticosteroid application as directed",
        "Oral antihistamine for symptomatic relief",
        "Refer to dermatology if symptoms persist beyond 2 weeks",
      ],
    },
  },
];

export function runDiagnosis(symptoms: string[]): DiagnosisResult[] {
  if (symptoms.length === 0) return [];

  const lowerSymptoms = symptoms.map((s) => s.toLowerCase());

  const scored = conditionMap.map((entry) => {
    const matchCount = entry.keywords.filter((kw) =>
      lowerSymptoms.some((s) => s.includes(kw))
    ).length;
    const matchRatio = matchCount / entry.keywords.length;
    // Adjust confidence based on match ratio
    const adjustedConfidence = Math.round(entry.result.confidence * matchRatio);
    return { ...entry.result, confidence: adjustedConfidence, matchCount };
  });

  const relevant = scored
    .filter((s) => s.matchCount > 0)
    .sort((a, b) => b.confidence - a.confidence);

  if (relevant.length === 0) {
    return symptomDatabase.default.conditions;
  }

  // If top result is low confidence, only return that with inconclusive
  if (relevant[0].confidence < 60) {
    return [relevant[0]];
  }

  return relevant.slice(0, 3);
}
