
-- 1. board_v1_boards
CREATE TABLE IF NOT EXISTS public.board_v1_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Board sem nome',
  viewport jsonb DEFAULT '{"x":0,"y":0,"zoom":1}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.board_v1_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_v1_boards_select" ON public.board_v1_boards FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "board_v1_boards_insert" ON public.board_v1_boards FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "board_v1_boards_update" ON public.board_v1_boards FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "board_v1_boards_delete" ON public.board_v1_boards FOR DELETE USING (auth.uid() = owner_id);

CREATE TRIGGER board_v1_boards_updated_at
  BEFORE UPDATE ON public.board_v1_boards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Security definer function (plpgsql to avoid early SQL binding)
CREATE OR REPLACE FUNCTION public.board_v1_is_owner(_board_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.board_v1_boards
    WHERE id = _board_id AND owner_id = auth.uid()
  );
END;
$$;

-- 3. board_v1_sections
CREATE TABLE IF NOT EXISTS public.board_v1_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES public.board_v1_boards(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Seção',
  order_index int NOT NULL DEFAULT 0,
  is_hidden boolean NOT NULL DEFAULT false
);
ALTER TABLE public.board_v1_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_v1_sections_select" ON public.board_v1_sections FOR SELECT USING (public.board_v1_is_owner(board_id));
CREATE POLICY "board_v1_sections_insert" ON public.board_v1_sections FOR INSERT WITH CHECK (public.board_v1_is_owner(board_id));
CREATE POLICY "board_v1_sections_update" ON public.board_v1_sections FOR UPDATE USING (public.board_v1_is_owner(board_id));
CREATE POLICY "board_v1_sections_delete" ON public.board_v1_sections FOR DELETE USING (public.board_v1_is_owner(board_id));

-- 4. board_v1_chunks
CREATE TABLE IF NOT EXISTS public.board_v1_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES public.board_v1_boards(id) ON DELETE CASCADE,
  section_id uuid REFERENCES public.board_v1_sections(id) ON DELETE SET NULL,
  chunk_key text NOT NULL,
  bounds jsonb NOT NULL DEFAULT '{"x":0,"y":0,"w":2000,"h":2000}'::jsonb,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  version int NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(board_id, chunk_key)
);
ALTER TABLE public.board_v1_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_v1_chunks_select" ON public.board_v1_chunks FOR SELECT USING (public.board_v1_is_owner(board_id));
CREATE POLICY "board_v1_chunks_insert" ON public.board_v1_chunks FOR INSERT WITH CHECK (public.board_v1_is_owner(board_id));
CREATE POLICY "board_v1_chunks_update" ON public.board_v1_chunks FOR UPDATE USING (public.board_v1_is_owner(board_id));
CREATE POLICY "board_v1_chunks_delete" ON public.board_v1_chunks FOR DELETE USING (public.board_v1_is_owner(board_id));

CREATE TRIGGER board_v1_chunks_updated_at
  BEFORE UPDATE ON public.board_v1_chunks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. board_v1_assets
CREATE TABLE IF NOT EXISTS public.board_v1_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES public.board_v1_boards(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'image',
  storage_path text NOT NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.board_v1_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_v1_assets_select" ON public.board_v1_assets FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "board_v1_assets_insert" ON public.board_v1_assets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "board_v1_assets_update" ON public.board_v1_assets FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "board_v1_assets_delete" ON public.board_v1_assets FOR DELETE USING (auth.uid() = owner_id);

-- 6. Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('board-v1-assets', 'board-v1-assets', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "board_v1_storage_select" ON storage.objects FOR SELECT USING (bucket_id = 'board-v1-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "board_v1_storage_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'board-v1-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "board_v1_storage_delete" ON storage.objects FOR DELETE USING (bucket_id = 'board-v1-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
