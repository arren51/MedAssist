-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  date_of_birth DATE,
  biological_sex TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  chronic_conditions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ASSESSMENTS
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_summary TEXT NOT NULL,
  diagnoses JSONB NOT NULL DEFAULT '[]'::jsonb,
  top_diagnosis TEXT,
  top_confidence NUMERIC,
  is_inconclusive BOOLEAN NOT NULL DEFAULT false,
  iterations INT NOT NULL DEFAULT 0,
  images_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own assessments" ON public.assessments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own assessments" ON public.assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own assessments" ON public.assessments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own assessments" ON public.assessments
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_assessments_user_created ON public.assessments(user_id, created_at DESC);

-- OUTCOMES
CREATE TABLE public.assessment_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  confirmed_diagnosis_from_list TEXT,
  actual_diagnosis_text TEXT,
  accuracy_rating INT CHECK (accuracy_rating BETWEEN 1 AND 5),
  doctor_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assessment_id)
);

ALTER TABLE public.assessment_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own outcomes" ON public.assessment_outcomes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own outcomes" ON public.assessment_outcomes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own outcomes" ON public.assessment_outcomes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own outcomes" ON public.assessment_outcomes
  FOR DELETE USING (auth.uid() = user_id);

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_outcomes_updated_at BEFORE UPDATE ON public.assessment_outcomes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();