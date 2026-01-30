-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funnels table
CREATE TABLE public.funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT false,
  share_link TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nodes table for funnel components
CREATE TABLE public.nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('page', 'ad', 'email', 'form', 'conditional')),
  title TEXT NOT NULL,
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create edges table for connections between nodes
CREATE TABLE public.edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES public.nodes ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES public.nodes ON DELETE CASCADE,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels ON DELETE CASCADE,
  node_id UUID REFERENCES public.nodes ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('pageview', 'click', 'form_submit', 'conversion')),
  session_id TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table for collaboration
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels ON DELETE CASCADE,
  node_id UUID REFERENCES public.nodes ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for funnels
CREATE POLICY "Users can view their own funnels" ON public.funnels
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own funnels" ON public.funnels
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own funnels" ON public.funnels
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own funnels" ON public.funnels
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for nodes
CREATE POLICY "Users can view nodes from their funnels" ON public.nodes
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = nodes.funnel_id AND funnels.user_id = auth.uid()));
CREATE POLICY "Users can create nodes in their funnels" ON public.nodes
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = nodes.funnel_id AND funnels.user_id = auth.uid()));
CREATE POLICY "Users can update nodes in their funnels" ON public.nodes
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = nodes.funnel_id AND funnels.user_id = auth.uid()));
CREATE POLICY "Users can delete nodes from their funnels" ON public.nodes
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = nodes.funnel_id AND funnels.user_id = auth.uid()));

-- Create RLS policies for edges
CREATE POLICY "Users can view edges from their funnels" ON public.edges
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = edges.funnel_id AND funnels.user_id = auth.uid()));
CREATE POLICY "Users can create edges in their funnels" ON public.edges
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = edges.funnel_id AND funnels.user_id = auth.uid()));
CREATE POLICY "Users can update edges in their funnels" ON public.edges
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = edges.funnel_id AND funnels.user_id = auth.uid()));
CREATE POLICY "Users can delete edges from their funnels" ON public.edges
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = edges.funnel_id AND funnels.user_id = auth.uid()));

-- Create RLS policies for events (read-only for users)
CREATE POLICY "Users can view events from their funnels" ON public.events
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = events.funnel_id AND funnels.user_id = auth.uid()));

-- Create RLS policies for comments
CREATE POLICY "Users can view comments from their funnels" ON public.comments
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = comments.funnel_id AND funnels.user_id = auth.uid()));
CREATE POLICY "Users can create comments in their funnels" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = comments.funnel_id AND funnels.user_id = auth.uid()));

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funnels_updated_at
  BEFORE UPDATE ON public.funnels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();