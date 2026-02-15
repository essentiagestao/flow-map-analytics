import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';

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

  loadSavedFunnels: () => void;
  saveFunnel: (name: string, nodes: Node[], edges: Edge[]) => string;
  updateFunnel: (id: string, nodes: Node[], edges: Edge[]) => void;
  renameFunnel: (id: string, name: string) => void;
  deleteFunnel: (id: string) => void;
  setCurrentFunnelId: (id: string | null) => void;
  setCurrentFunnelName: (name: string) => void;
}

const SAVED_FUNNELS_KEY = 'funnels:saved';

export const useSavedFunnelsStore = create<SavedFunnelsStore>((set, get) => ({
  savedFunnels: [],
  currentFunnelId: null,
  currentFunnelName: 'Funil sem nome',

  loadSavedFunnels: () => {
    try {
      const stored = localStorage.getItem(SAVED_FUNNELS_KEY);
      if (stored) {
        set({ savedFunnels: JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Erro ao carregar funis salvos:', e);
    }
  },

  saveFunnel: (name, nodes, edges) => {
    const id = `funnel-${Date.now()}`;
    const now = new Date().toISOString();
    const newFunnel: SavedFunnel = { id, name, nodes, edges, createdAt: now, updatedAt: now };
    
    set((state) => {
      const updated = [newFunnel, ...state.savedFunnels];
      localStorage.setItem(SAVED_FUNNELS_KEY, JSON.stringify(updated));
      return { savedFunnels: updated, currentFunnelId: id, currentFunnelName: name };
    });
    return id;
  },

  updateFunnel: (id, nodes, edges) => {
    set((state) => {
      const updated = state.savedFunnels.map(f =>
        f.id === id ? { ...f, nodes, edges, updatedAt: new Date().toISOString() } : f
      );
      localStorage.setItem(SAVED_FUNNELS_KEY, JSON.stringify(updated));
      return { savedFunnels: updated };
    });
  },

  renameFunnel: (id, name) => {
    set((state) => {
      const updated = state.savedFunnels.map(f =>
        f.id === id ? { ...f, name, updatedAt: new Date().toISOString() } : f
      );
      localStorage.setItem(SAVED_FUNNELS_KEY, JSON.stringify(updated));
      return { savedFunnels: updated, currentFunnelName: name };
    });
  },

  deleteFunnel: (id) => {
    set((state) => {
      const updated = state.savedFunnels.filter(f => f.id !== id);
      localStorage.setItem(SAVED_FUNNELS_KEY, JSON.stringify(updated));
      return {
        savedFunnels: updated,
        currentFunnelId: state.currentFunnelId === id ? null : state.currentFunnelId,
        currentFunnelName: state.currentFunnelId === id ? 'Funil sem nome' : state.currentFunnelName,
      };
    });
  },

  setCurrentFunnelId: (id) => set({ currentFunnelId: id }),
  setCurrentFunnelName: (name) => set({ currentFunnelName: name }),
}));
