
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL DEFAULT '',
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create funnels table
CREATE TABLE IF NOT EXISTS public.funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Funil sem nome',
  description TEXT,
  canvas_data JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  share_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own funnels" ON public.funnels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own funnels" ON public.funnels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own funnels" ON public.funnels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own funnels" ON public.funnels FOR DELETE USING (auth.uid() = user_id);

-- Create public_templates table
CREATE TABLE IF NOT EXISTS public.public_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL,
  author_name TEXT,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'FaRocket',
  canvas_data JSONB NOT NULL DEFAULT '{}',
  category TEXT DEFAULT 'geral',
  usage_count INT DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.public_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved templates" ON public.public_templates FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create templates" ON public.public_templates FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own templates" ON public.public_templates FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own templates" ON public.public_templates FOR DELETE USING (auth.uid() = author_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_funnels_updated_at BEFORE UPDATE ON public.funnels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_public_templates_updated_at BEFORE UPDATE ON public.public_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
