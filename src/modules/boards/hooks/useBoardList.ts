// Board Engine v1 - CRUD hook for boards list

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Board } from '../types';

export function useBoardList() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('board_v1_boards' as any)
      .select('*')
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setBoards(data as unknown as Board[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBoards(); }, [fetchBoards]);

  const createBoard = useCallback(async (title?: string): Promise<Board | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('board_v1_boards' as any)
      .insert({ owner_id: user.id, title: title || 'Board sem nome' } as any)
      .select()
      .single();

    if (!error && data) {
      const board = data as unknown as Board;
      setBoards(prev => [board, ...prev]);
      return board;
    }
    return null;
  }, []);

  const deleteBoard = useCallback(async (id: string) => {
    await supabase.from('board_v1_boards' as any).delete().eq('id', id);
    setBoards(prev => prev.filter(b => b.id !== id));
  }, []);

  return { boards, loading, createBoard, deleteBoard, refetch: fetchBoards };
}
