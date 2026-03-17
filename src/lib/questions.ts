export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

export interface Question {
  id: string;
  category: string;
  question: string;
  description?: string;
  type: "single" | "multi" | "input" | "temperature";
  options?: QuestionOption[];
  skippable?: boolean;
  placeholder?: string;
  /** Show this question only if a specific answer was given */
  showIf?: { questionId: string; answerId: string };
}

export const questions: Question[] = [
  // Stage 1: General symptoms
  {
    id: "general_symptoms",
    category: "General",
    question: "What are you experiencing?",
    description: "Select all that apply. This helps us narrow things down.",
    type: "multi",
    options: [
      { id: "fever", label: "Fever or feeling hot", description: "Feeling unusually warm, chills, or sweating" },
      { id: "pain", label: "Pain or discomfort", description: "Any aching, sharp, or dull pain" },
      { id: "fatigue", label: "Fatigue or weakness", description: "Feeling unusually tired or low energy" },
      { id: "breathing", label: "Breathing difficulties", description: "Shortness of breath, wheezing, or tightness" },
      { id: "digestive", label: "Stomach or digestive issues", description: "Nausea, vomiting, diarrhea, or cramps" },
      { id: "skin", label: "Skin changes", description: "Rash, itching, swelling, or redness" },
      { id: "head", label: "Headache or dizziness", description: "Head pain, lightheadedness, or vertigo" },
      { id: "throat", label: "Sore throat or cough", description: "Throat irritation, coughing, or hoarseness" },
    ],
  },
  // Stage 2: Fever deep-dive
  {
    id: "temperature",
    category: "Temperature",
    question: "Do you know your temperature?",
    description: "You can enter it in °C or describe how you feel. It's okay to skip this.",
    type: "temperature",
    skippable: true,
    showIf: { questionId: "general_symptoms", answerId: "fever" },
  },
  {
    id: "fever_duration",
    category: "Temperature",
    question: "How long have you had a fever?",
    description: "An estimate is fine.",
    type: "single",
    skippable: true,
    showIf: { questionId: "general_symptoms", answerId: "fever" },
    options: [
      { id: "hours", label: "Less than a day" },
      { id: "1-2days", label: "1–2 days" },
      { id: "3-5days", label: "3–5 days" },
      { id: "week_plus", label: "More than a week" },
    ],
  },
  // Stage 2: Pain deep-dive
  {
    id: "pain_location",
    category: "Pain",
    question: "Where is the pain?",
    description: "Select the area that best describes it.",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "pain" },
    options: [
      { id: "head", label: "Head" },
      { id: "chest", label: "Chest" },
      { id: "abdomen", label: "Abdomen" },
      { id: "back", label: "Back" },
      { id: "joints", label: "Joints or muscles" },
      { id: "throat", label: "Throat" },
    ],
  },
  {
    id: "pain_severity",
    category: "Pain",
    question: "How severe is the pain?",
    description: "On a general scale.",
    type: "single",
    showIf: { questionId: "general_symptoms", answerId: "pain" },
    options: [
      { id: "mild", label: "Mild", description: "Noticeable but manageable" },
      { id: "moderate", label: "Moderate", description: "Affecting daily activities" },
      { id: "severe", label: "Severe", description: "Very difficult to bear" },
    ],
  },
  // Stage 2: Breathing deep-dive
  {
    id: "breathing_details",
    category: "Breathing",
    question: "Can you describe the breathing difficulty?",
    description: "Select what applies.",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "breathing" },
    options: [
      { id: "shortness", label: "Shortness of breath" },
      { id: "wheezing", label: "Wheezing" },
      { id: "chest_tight", label: "Chest tightness" },
      { id: "cough", label: "Cough with breathing issues" },
    ],
  },
  // Stage 2: Head deep-dive
  {
    id: "headache_details",
    category: "Head",
    question: "Tell us more about the headache.",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "head" },
    options: [
      { id: "throbbing", label: "Throbbing or pulsing" },
      { id: "pressure", label: "Pressure or tightness" },
      { id: "light_sensitive", label: "Sensitive to light" },
      { id: "nausea", label: "Nausea with headache" },
      { id: "dizziness", label: "Dizziness or vertigo" },
    ],
  },
  // Stage 2: Digestive deep-dive
  {
    id: "digestive_details",
    category: "Digestive",
    question: "What digestive symptoms are you having?",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "digestive" },
    options: [
      { id: "nausea", label: "Nausea" },
      { id: "vomiting", label: "Vomiting" },
      { id: "diarrhea", label: "Diarrhea" },
      { id: "cramps", label: "Stomach cramps" },
      { id: "bloating", label: "Bloating" },
    ],
  },
  // Stage 2: Skin deep-dive
  {
    id: "skin_details",
    category: "Skin",
    question: "Describe the skin changes.",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "skin" },
    options: [
      { id: "rash", label: "Rash" },
      { id: "itching", label: "Itching" },
      { id: "swelling", label: "Swelling" },
      { id: "redness", label: "Redness" },
      { id: "blisters", label: "Blisters or sores" },
    ],
  },
  // Stage 3: Duration & context
  {
    id: "symptom_duration",
    category: "Timeline",
    question: "How long have you been feeling this way?",
    type: "single",
    options: [
      { id: "today", label: "Started today" },
      { id: "few_days", label: "A few days" },
      { id: "week", label: "About a week" },
      { id: "longer", label: "More than a week" },
    ],
  },
  {
    id: "existing_conditions",
    category: "History",
    question: "Do you have any existing medical conditions?",
    description: "This helps provide more accurate analysis. You can skip if you prefer.",
    type: "input",
    skippable: true,
    placeholder: "e.g., asthma, diabetes, heart condition…",
  },
  {
    id: "medications",
    category: "History",
    question: "Are you currently taking any medications?",
    description: "Include both prescription and over-the-counter.",
    type: "input",
    skippable: true,
    placeholder: "e.g., ibuprofen, insulin, birth control…",
  },
  {
    id: "age_group",
    category: "About you",
    question: "What's your age range?",
    type: "single",
    options: [
      { id: "under18", label: "Under 18" },
      { id: "18-30", label: "18–30" },
      { id: "31-50", label: "31–50" },
      { id: "51-70", label: "51–70" },
      { id: "over70", label: "Over 70" },
    ],
  },
];

export function getVisibleQuestions(answers: Record<string, string | string[]>): Question[] {
  return questions.filter((q) => {
    if (!q.showIf) return true;
    const parentAnswer = answers[q.showIf.questionId];
    if (Array.isArray(parentAnswer)) {
      return parentAnswer.includes(q.showIf.answerId);
    }
    return parentAnswer === q.showIf.answerId;
  });
}
