import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';

export interface SavedFunnel {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
}

interface SavedFunnelsStore {
  savedFunnels: SavedFunnel[];
  currentFunnelId: string | null;
  currentFunnelName: string;
  loading: boolean;

  loadSavedFunnels: () => Promise<void>;
  saveFunnel: (name: string, nodes: Node[], edges: Edge[]) => Promise<string | null>;
  updateFunnel: (id: string, nodes: Node[], edges: Edge[]) => Promise<void>;
  renameFunnel: (id: string, name: string) => Promise<void>;
  deleteFunnel: (id: string) => Promise<void>;
  setCurrentFunnelId: (id: string | null) => void;
  setCurrentFunnelName: (name: string) => void;
}

export const useSavedFunnelsStore = create<SavedFunnelsStore>((set, get) => ({
  savedFunnels: [],
  currentFunnelId: null,
  currentFunnelName: 'Funil sem nome',
  loading: false,

  loadSavedFunnels: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { set({ loading: false }); return; }

      const { data, error } = await supabase
        .from('funnels')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const funnels: SavedFunnel[] = (data || []).map((f: any) => ({
        id: f.id,
        name: f.title,
        nodes: (f.canvas_data as any)?.nodes || [],
        edges: (f.canvas_data as any)?.edges || [],
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      }));

      set({ savedFunnels: funnels, loading: false });
    } catch (e) {
      console.error('Erro ao carregar funis:', e);
      set({ loading: false });
    }
  },

  saveFunnel: async (name, nodes, edges) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('funnels')
        .insert({
          user_id: user.id,
          title: name,
          canvas_data: { nodes, edges } as any,
        })
        .select()
        .single();

      if (error) throw error;

      const newFunnel: SavedFunnel = {
        id: data.id,
        name: data.title,
        nodes,
        edges,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      set((state) => ({
        savedFunnels: [newFunnel, ...state.savedFunnels],
        currentFunnelId: data.id,
        currentFunnelName: name,
      }));

      return data.id;
    } catch (e) {
      console.error('Erro ao salvar funil:', e);
      return null;
    }
  },

  updateFunnel: async (id, nodes, edges) => {
    try {
      const { error } = await supabase
        .from('funnels')
        .update({ canvas_data: { nodes, edges } as any })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        savedFunnels: state.savedFunnels.map(f =>
          f.id === id ? { ...f, nodes, edges, updatedAt: new Date().toISOString() } : f
        ),
      }));
    } catch (e) {
      console.error('Erro ao atualizar funil:', e);
    }
  },

  renameFunnel: async (id, name) => {
    try {
      const { error } = await supabase
        .from('funnels')
        .update({ title: name })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        savedFunnels: state.savedFunnels.map(f =>
          f.id === id ? { ...f, name, updatedAt: new Date().toISOString() } : f
        ),
        currentFunnelName: state.currentFunnelId === id ? name : state.currentFunnelName,
      }));
    } catch (e) {
      console.error('Erro ao renomear funil:', e);
    }
  },

  deleteFunnel: async (id) => {
    try {
      const { error } = await supabase
        .from('funnels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        savedFunnels: state.savedFunnels.filter(f => f.id !== id),
        currentFunnelId: state.currentFunnelId === id ? null : state.currentFunnelId,
        currentFunnelName: state.currentFunnelId === id ? 'Funil sem nome' : state.currentFunnelName,
      }));
    } catch (e) {
      console.error('Erro ao deletar funil:', e);
    }
  },

  setCurrentFunnelId: (id) => set({ currentFunnelId: id }),
  setCurrentFunnelName: (name) => set({ currentFunnelName: name }),
}));
