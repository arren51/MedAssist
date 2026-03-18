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
  showIf?: { questionId: string; answerId: string };
}

export const questions: Question[] = [
  // ─── STAGE 1: General symptoms ───
  {
    id: "general_symptoms",
    category: "General",
    question: "What are you experiencing?",
    description: "Select all that apply. We'll ask follow-up questions for each one you select.",
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
      { id: "swelling", label: "Swelling", description: "Any body part that feels swollen or puffy" },
      { id: "numbness", label: "Numbness or tingling", description: "Loss of sensation, pins and needles" },
      { id: "vision", label: "Vision changes", description: "Blurry vision, spots, or light sensitivity" },
      { id: "urinary", label: "Urinary symptoms", description: "Painful urination, frequency, or blood in urine" },
      { id: "mood", label: "Mood or mental changes", description: "Anxiety, confusion, difficulty concentrating" },
      { id: "sleep", label: "Sleep problems", description: "Insomnia, waking up frequently, excessive sleepiness" },
    ],
  },

  // ─── STAGE 2: FEVER deep-dive ───
  {
    id: "temperature",
    category: "Fever",
    question: "Do you know your temperature?",
    description: "You can enter it in °C or °F, or describe how you feel. It's okay to skip.",
    type: "temperature",
    skippable: true,
    showIf: { questionId: "general_symptoms", answerId: "fever" },
  },
  {
    id: "fever_pattern",
    category: "Fever",
    question: "How does the fever behave?",
    description: "This pattern helps distinguish between conditions.",
    type: "single",
    showIf: { questionId: "general_symptoms", answerId: "fever" },
    options: [
      { id: "constant", label: "Constant", description: "Stays elevated all the time" },
      { id: "comes_goes", label: "Comes and goes", description: "Spikes then returns to normal" },
      { id: "night_only", label: "Mainly at night", description: "Worse in the evening/night, better in morning" },
      { id: "after_activity", label: "After activity", description: "Appears after physical exertion" },
      { id: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "fever_duration",
    category: "Fever",
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
  {
    id: "fever_associated",
    category: "Fever",
    question: "Do you have any of these alongside the fever?",
    type: "multi",
    skippable: true,
    showIf: { questionId: "general_symptoms", answerId: "fever" },
    options: [
      { id: "chills", label: "Chills or shivering" },
      { id: "sweats", label: "Night sweats" },
      { id: "body_aches", label: "Body aches" },
      { id: "loss_appetite", label: "Loss of appetite" },
      { id: "dehydration", label: "Feeling dehydrated" },
    ],
  },

  // ─── STAGE 2: PAIN deep-dive ───
  {
    id: "pain_location",
    category: "Pain",
    question: "Where exactly is the pain?",
    description: "Select all areas. Be as specific as you can.",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "pain" },
    options: [
      { id: "head", label: "Head" },
      { id: "face_jaw", label: "Face or jaw" },
      { id: "neck", label: "Neck" },
      { id: "shoulder", label: "Shoulder(s)" },
      { id: "upper_arm", label: "Upper arm(s)" },
      { id: "elbow", label: "Elbow(s)" },
      { id: "forearm_wrist", label: "Forearm or wrist" },
      { id: "hand_fingers", label: "Hand or fingers" },
      { id: "chest", label: "Chest" },
      { id: "upper_back", label: "Upper back" },
      { id: "lower_back", label: "Lower back" },
      { id: "abdomen_upper", label: "Upper abdomen" },
      { id: "abdomen_lower", label: "Lower abdomen" },
      { id: "hip", label: "Hip(s)" },
      { id: "groin", label: "Groin area" },
      { id: "thigh", label: "Thigh(s)" },
      { id: "knee", label: "Knee(s)" },
      { id: "shin_calf", label: "Shin or calf" },
      { id: "ankle", label: "Ankle(s)" },
      { id: "foot_toes", label: "Foot or toes" },
    ],
  },
  {
    id: "pain_type",
    category: "Pain",
    question: "How would you describe the pain?",
    description: "Select the descriptions that best match.",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "pain" },
    options: [
      { id: "sharp", label: "Sharp or stabbing" },
      { id: "dull", label: "Dull or aching" },
      { id: "burning", label: "Burning" },
      { id: "throbbing", label: "Throbbing or pulsing" },
      { id: "cramping", label: "Cramping" },
      { id: "shooting", label: "Shooting or radiating", description: "Travels from one area to another" },
      { id: "pressure", label: "Pressure or squeezing" },
      { id: "stiffness", label: "Stiffness", description: "Difficulty moving the area" },
    ],
  },
  {
    id: "pain_severity",
    category: "Pain",
    question: "How severe is the pain?",
    type: "single",
    showIf: { questionId: "general_symptoms", answerId: "pain" },
    options: [
      { id: "mild", label: "Mild (1-3)", description: "Noticeable but manageable" },
      { id: "moderate", label: "Moderate (4-6)", description: "Affecting daily activities" },
      { id: "severe", label: "Severe (7-8)", description: "Very difficult to bear" },
      { id: "extreme", label: "Extreme (9-10)", description: "Worst pain imaginable" },
    ],
  },
  {
    id: "pain_timing",
    category: "Pain",
    question: "When is the pain worst?",
    type: "multi",
    skippable: true,
    showIf: { questionId: "general_symptoms", answerId: "pain" },
    options: [
      { id: "constant", label: "It's constant" },
      { id: "morning", label: "Worse in the morning" },
      { id: "night", label: "Worse at night" },
      { id: "movement", label: "Worse with movement" },
      { id: "rest", label: "Worse at rest" },
      { id: "eating", label: "Worse after eating" },
      { id: "touch", label: "Worse when touched" },
    ],
  },
  {
    id: "pain_onset",
    category: "Pain",
    question: "How did the pain start?",
    type: "single",
    showIf: { questionId: "general_symptoms", answerId: "pain" },
    options: [
      { id: "sudden", label: "Suddenly", description: "Came on quickly, within minutes" },
      { id: "gradual", label: "Gradually", description: "Built up over hours or days" },
      { id: "injury", label: "After an injury or fall" },
      { id: "exercise", label: "After exercise or physical activity" },
      { id: "no_reason", label: "No obvious reason" },
    ],
  },

  // ─── STAGE 2: FATIGUE deep-dive ───
  {
    id: "fatigue_severity",
    category: "Fatigue",
    question: "How severe is the fatigue?",
    type: "single",
    showIf: { questionId: "general_symptoms", answerId: "fatigue" },
    options: [
      { id: "mild", label: "Mild", description: "A bit tired, can still function normally" },
      { id: "moderate", label: "Moderate", description: "Struggling with daily tasks" },
      { id: "severe", label: "Severe", description: "Can barely get out of bed" },
      { id: "extreme", label: "Extreme", description: "Completely unable to function" },
    ],
  },
  {
    id: "fatigue_duration",
    category: "Fatigue",
    question: "How long have you felt fatigued?",
    type: "single",
    showIf: { questionId: "general_symptoms", answerId: "fatigue" },
    options: [
      { id: "days", label: "A few days" },
      { id: "1-2weeks", label: "1–2 weeks" },
      { id: "weeks", label: "Several weeks" },
      { id: "months", label: "Months or longer" },
    ],
  },
  {
    id: "fatigue_associated",
    category: "Fatigue",
    question: "Do you experience any of these with the fatigue?",
    type: "multi",
    skippable: true,
    showIf: { questionId: "general_symptoms", answerId: "fatigue" },
    options: [
      { id: "brain_fog", label: "Brain fog / difficulty concentrating" },
      { id: "muscle_weakness", label: "Muscle weakness" },
      { id: "unrefreshed_sleep", label: "Waking up unrefreshed" },
      { id: "weight_change", label: "Unexplained weight change" },
      { id: "cold_sensitivity", label: "Feeling unusually cold" },
      { id: "exercise_worse", label: "Worse after even light exercise" },
    ],
  },

  // ─── STAGE 2: BREATHING deep-dive ───
  {
    id: "breathing_details",
    category: "Breathing",
    question: "Can you describe the breathing difficulty?",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "breathing" },
    options: [
      { id: "shortness", label: "Shortness of breath" },
      { id: "wheezing", label: "Wheezing" },
      { id: "chest_tight", label: "Chest tightness" },
      { id: "cough_breathing", label: "Cough with breathing issues" },
      { id: "cant_deep_breath", label: "Can't take a deep breath" },
      { id: "rapid_breathing", label: "Rapid or shallow breathing" },
    ],
  },
  {
    id: "breathing_triggers",
    category: "Breathing",
    question: "What triggers or worsens the breathing difficulty?",
    type: "multi",
    skippable: true,
    showIf: { questionId: "general_symptoms", answerId: "breathing" },
    options: [
      { id: "exertion", label: "Physical exertion" },
      { id: "lying_down", label: "Lying down" },
      { id: "cold_air", label: "Cold air" },
      { id: "allergens", label: "Dust, pollen, or pets" },
      { id: "stress", label: "Stress or anxiety" },
      { id: "at_rest", label: "Happens even at rest" },
    ],
  },
  {
    id: "breathing_onset",
    category: "Breathing",
    question: "When did the breathing difficulty start?",
    type: "single",
    showIf: { questionId: "general_symptoms", answerId: "breathing" },
    options: [
      { id: "sudden", label: "Suddenly", description: "Came on within minutes" },
      { id: "gradual", label: "Gradually", description: "Over hours or days" },
      { id: "recurring", label: "It comes and goes", description: "Episodic, have had it before" },
      { id: "chronic", label: "Long-standing", description: "Have had it for weeks/months" },
    ],
  },

  // ─── STAGE 2: HEAD deep-dive ───
  {
    id: "headache_location",
    category: "Headache",
    question: "Where exactly is the headache?",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "head" },
    options: [
      { id: "forehead", label: "Forehead" },
      { id: "temples", label: "Temples (sides)" },
      { id: "top", label: "Top of head" },
      { id: "back_head", label: "Back of head" },
      { id: "behind_eyes", label: "Behind the eyes" },
      { id: "one_side", label: "One side only" },
      { id: "all_over", label: "All over" },
    ],
  },
  {
    id: "headache_type",
    category: "Headache",
    question: "How does the headache feel?",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "head" },
    options: [
      { id: "throbbing", label: "Throbbing or pulsing" },
      { id: "pressure", label: "Pressure or tightness", description: "Like a band around your head" },
      { id: "sharp", label: "Sharp or stabbing" },
      { id: "dull", label: "Dull, constant ache" },
    ],
  },
  {
    id: "headache_associated",
    category: "Headache",
    question: "Do you have any of these with the headache?",
    type: "multi",
    skippable: true,
    showIf: { questionId: "general_symptoms", answerId: "head" },
    options: [
      { id: "light_sensitive", label: "Sensitive to light" },
      { id: "sound_sensitive", label: "Sensitive to sound" },
      { id: "nausea", label: "Nausea or vomiting" },
      { id: "visual_aura", label: "Visual disturbances (aura)", description: "Zigzag lines, blind spots, flashing lights" },
      { id: "dizziness", label: "Dizziness or vertigo" },
      { id: "neck_stiffness", label: "Neck stiffness" },
      { id: "confusion", label: "Confusion or difficulty thinking" },
    ],
  },
  {
    id: "headache_severity",
    category: "Headache",
    question: "How severe is the headache?",
    type: "single",
    showIf: { questionId: "general_symptoms", answerId: "head" },
    options: [
      { id: "mild", label: "Mild", description: "Annoying but can function" },
      { id: "moderate", label: "Moderate", description: "Difficult to concentrate" },
      { id: "severe", label: "Severe", description: "Debilitating" },
      { id: "worst_ever", label: "Worst headache of my life", description: "Sudden, extreme — seek emergency care" },
    ],
  },

  // ─── STAGE 2: DIGESTIVE deep-dive ───
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
      { id: "constipation", label: "Constipation" },
      { id: "cramps", label: "Stomach cramps" },
      { id: "bloating", label: "Bloating or gas" },
      { id: "heartburn", label: "Heartburn or acid reflux" },
      { id: "blood_stool", label: "Blood in stool", description: "Seek medical attention if present" },
      { id: "loss_appetite", label: "Loss of appetite" },
    ],
  },
  {
    id: "digestive_timing",
    category: "Digestive",
    question: "When are the symptoms worst?",
    type: "multi",
    skippable: true,
    showIf: { questionId: "general_symptoms", answerId: "digestive" },
    options: [
      { id: "after_eating", label: "After eating" },
      { id: "empty_stomach", label: "On an empty stomach" },
      { id: "specific_foods", label: "After specific foods" },
      { id: "morning", label: "In the morning" },
      { id: "constant", label: "Constant throughout the day" },
    ],
  },

  // ─── STAGE 2: SKIN deep-dive ───
  {
    id: "skin_details",
    category: "Skin",
    question: "Describe the skin changes.",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "skin" },
    options: [
      { id: "rash", label: "Rash", description: "Red, discolored, or raised area" },
      { id: "itching", label: "Itching" },
      { id: "swelling", label: "Swelling" },
      { id: "redness", label: "Redness or warmth" },
      { id: "blisters", label: "Blisters or sores" },
      { id: "dry_flaky", label: "Dry or flaky skin" },
      { id: "bruising", label: "Unexplained bruising" },
      { id: "hives", label: "Hives (raised, itchy welts)" },
      { id: "colour_change", label: "Colour change (yellow, pale, blue)" },
    ],
  },
  {
    id: "skin_location",
    category: "Skin",
    question: "Where on the body are the skin changes?",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "skin" },
    options: [
      { id: "face", label: "Face" },
      { id: "scalp", label: "Scalp" },
      { id: "neck", label: "Neck" },
      { id: "chest", label: "Chest" },
      { id: "back", label: "Back" },
      { id: "arms", label: "Arms" },
      { id: "hands", label: "Hands" },
      { id: "legs", label: "Legs" },
      { id: "feet", label: "Feet" },
      { id: "groin", label: "Groin area" },
      { id: "widespread", label: "Widespread / all over" },
    ],
  },
  {
    id: "skin_onset",
    category: "Skin",
    question: "When did the skin changes start?",
    type: "single",
    showIf: { questionId: "general_symptoms", answerId: "skin" },
    options: [
      { id: "hours", label: "Within the last few hours" },
      { id: "days", label: "A few days ago" },
      { id: "week", label: "About a week ago" },
      { id: "longer", label: "More than a week ago" },
      { id: "recurring", label: "It comes and goes" },
    ],
  },

  // ─── STAGE 2: THROAT deep-dive ───
  {
    id: "throat_details",
    category: "Throat",
    question: "Tell us more about the throat/cough symptoms.",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "throat" },
    options: [
      { id: "sore_throat", label: "Sore throat" },
      { id: "difficulty_swallowing", label: "Difficulty swallowing" },
      { id: "dry_cough", label: "Dry cough" },
      { id: "wet_cough", label: "Wet/productive cough", description: "Producing mucus or phlegm" },
      { id: "hoarseness", label: "Hoarse or lost voice" },
      { id: "post_nasal", label: "Post-nasal drip", description: "Mucus dripping down the back of your throat" },
      { id: "swollen_glands", label: "Swollen glands in neck" },
    ],
  },
  {
    id: "cough_details",
    category: "Throat",
    question: "If you have a cough, what comes up?",
    type: "single",
    skippable: true,
    showIf: { questionId: "general_symptoms", answerId: "throat" },
    options: [
      { id: "nothing", label: "Nothing (dry)" },
      { id: "clear_mucus", label: "Clear mucus" },
      { id: "yellow_green", label: "Yellow or green mucus" },
      { id: "blood", label: "Blood or blood-streaked", description: "Seek medical attention" },
      { id: "no_cough", label: "I don't have a cough" },
    ],
  },

  // ─── STAGE 2: SWELLING deep-dive ───
  {
    id: "swelling_location",
    category: "Swelling",
    question: "Where is the swelling?",
    description: "Select all areas that are swollen.",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "swelling" },
    options: [
      { id: "face", label: "Face" },
      { id: "eyes", label: "Around the eyes" },
      { id: "lips_tongue", label: "Lips or tongue" },
      { id: "neck_throat", label: "Neck or throat" },
      { id: "hands", label: "Hands or fingers" },
      { id: "arms", label: "Arms" },
      { id: "abdomen", label: "Abdomen" },
      { id: "legs", label: "Legs" },
      { id: "ankles_feet", label: "Ankles or feet" },
      { id: "joints", label: "Around a joint" },
      { id: "lymph_nodes", label: "Lymph nodes (armpit, groin, neck)" },
    ],
  },
  {
    id: "swelling_characteristics",
    category: "Swelling",
    question: "Describe the swelling.",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "swelling" },
    options: [
      { id: "painful", label: "Painful to touch" },
      { id: "warm", label: "Warm to touch" },
      { id: "red", label: "Red or discolored" },
      { id: "hard", label: "Hard or firm" },
      { id: "soft", label: "Soft or squishy" },
      { id: "one_side", label: "Only on one side" },
      { id: "both_sides", label: "Both sides equally" },
      { id: "pitting", label: "Leaves a dent when pressed" },
    ],
  },

  // ─── STAGE 2: NUMBNESS deep-dive ───
  {
    id: "numbness_location",
    category: "Numbness",
    question: "Where do you feel numbness or tingling?",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "numbness" },
    options: [
      { id: "face", label: "Face" },
      { id: "hands_fingers", label: "Hands or fingers" },
      { id: "arms", label: "Arms" },
      { id: "feet_toes", label: "Feet or toes" },
      { id: "legs", label: "Legs" },
      { id: "one_side_body", label: "One entire side of body", description: "Seek emergency care if sudden" },
    ],
  },
  {
    id: "numbness_pattern",
    category: "Numbness",
    question: "How does the numbness behave?",
    type: "single",
    showIf: { questionId: "general_symptoms", answerId: "numbness" },
    options: [
      { id: "constant", label: "Constant" },
      { id: "intermittent", label: "Comes and goes" },
      { id: "position", label: "Related to position", description: "E.g. worse when sitting" },
      { id: "spreading", label: "Getting worse or spreading" },
    ],
  },

  // ─── STAGE 2: VISION deep-dive ───
  {
    id: "vision_details",
    category: "Vision",
    question: "What vision changes are you experiencing?",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "vision" },
    options: [
      { id: "blurry", label: "Blurry vision" },
      { id: "double", label: "Double vision" },
      { id: "spots", label: "Spots, floaters, or flashes" },
      { id: "light_sensitive", label: "Light sensitivity" },
      { id: "tunnel", label: "Tunnel vision or blind spots" },
      { id: "sudden_loss", label: "Sudden vision loss", description: "Seek emergency care immediately" },
      { id: "one_eye", label: "Affecting one eye only" },
    ],
  },

  // ─── STAGE 2: URINARY deep-dive ───
  {
    id: "urinary_details",
    category: "Urinary",
    question: "What urinary symptoms do you have?",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "urinary" },
    options: [
      { id: "painful", label: "Painful or burning urination" },
      { id: "frequent", label: "Urinating more often" },
      { id: "urgency", label: "Sudden urge to urinate" },
      { id: "blood", label: "Blood in urine" },
      { id: "cloudy", label: "Cloudy or dark urine" },
      { id: "difficulty", label: "Difficulty starting or weak stream" },
      { id: "incontinence", label: "Leaking or incontinence" },
    ],
  },

  // ─── STAGE 2: SLEEP deep-dive ───
  {
    id: "sleep_details",
    category: "Sleep",
    question: "What sleep problems are you having?",
    type: "multi",
    showIf: { questionId: "general_symptoms", answerId: "sleep" },
    options: [
      { id: "cant_fall_asleep", label: "Can't fall asleep" },
      { id: "waking_up", label: "Waking up frequently" },
      { id: "early_waking", label: "Waking up too early" },
      { id: "excessive_sleep", label: "Sleeping too much" },
      { id: "unrefreshed", label: "Not feeling rested after sleep" },
      { id: "snoring", label: "Snoring or gasping" },
    ],
  },

  // ─── STAGE 3: Duration & Timeline ───
  {
    id: "symptom_duration",
    category: "Timeline",
    question: "How long have you been feeling this way overall?",
    type: "single",
    options: [
      { id: "hours", label: "Started in the last few hours" },
      { id: "today", label: "Started today" },
      { id: "few_days", label: "A few days" },
      { id: "week", label: "About a week" },
      { id: "2_weeks", label: "1–2 weeks" },
      { id: "month", label: "About a month" },
      { id: "longer", label: "More than a month" },
    ],
  },
  {
    id: "symptom_progression",
    category: "Timeline",
    question: "How are your symptoms changing?",
    type: "single",
    options: [
      { id: "getting_worse", label: "Getting worse" },
      { id: "stable", label: "Staying the same" },
      { id: "improving", label: "Getting better" },
      { id: "fluctuating", label: "Fluctuating — good days and bad days" },
    ],
  },

  // ─── STAGE 4: Context & History ───
  {
    id: "recent_exposure",
    category: "Context",
    question: "Have you had any recent exposures?",
    description: "Select any that apply. This helps identify infectious or environmental causes.",
    type: "multi",
    skippable: true,
    options: [
      { id: "sick_contact", label: "Contact with someone sick" },
      { id: "travel", label: "Recent travel" },
      { id: "new_food", label: "New or unusual food" },
      { id: "new_medication", label: "Started a new medication" },
      { id: "allergen", label: "Known allergen exposure" },
      { id: "insect_bite", label: "Insect or animal bite" },
      { id: "none", label: "None of these" },
    ],
  },
  {
    id: "existing_conditions",
    category: "Medical History",
    question: "Do you have any existing medical conditions?",
    description: "This helps provide more accurate analysis. You can skip if you prefer.",
    type: "input",
    skippable: true,
    placeholder: "e.g., asthma, diabetes, heart condition, high blood pressure…",
  },
  {
    id: "medications",
    category: "Medical History",
    question: "Are you currently taking any medications?",
    description: "Include both prescription and over-the-counter.",
    type: "input",
    skippable: true,
    placeholder: "e.g., ibuprofen, insulin, birth control, blood pressure meds…",
  },
  {
    id: "allergies",
    category: "Medical History",
    question: "Do you have any known allergies?",
    type: "input",
    skippable: true,
    placeholder: "e.g., penicillin, peanuts, latex…",
  },
  {
    id: "age_group",
    category: "About You",
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
  {
    id: "sex",
    category: "About You",
    question: "What is your biological sex?",
    description: "Some conditions are more common in certain groups. You can skip this.",
    type: "single",
    skippable: true,
    options: [
      { id: "male", label: "Male" },
      { id: "female", label: "Female" },
      { id: "prefer_not", label: "Prefer not to say" },
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
