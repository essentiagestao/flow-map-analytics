// Board Engine v1 - Zustand store (Miro-style, no studio modes)

import { create } from 'zustand';
import type { Board, BoardViewport, ToolMode } from '../types';

interface BoardState {
  currentBoard: Board | null;
  viewport: BoardViewport;
  tool: ToolMode;
  selectedItemId: string | null;
  stageSize: { width: number; height: number };
  propertiesOpen: boolean;

  setCurrentBoard: (board: Board | null) => void;
  setViewport: (viewport: Partial<BoardViewport>) => void;
  setTool: (tool: ToolMode) => void;
  setSelectedItemId: (id: string | null) => void;
  setStageSize: (size: { width: number; height: number }) => void;
  setPropertiesOpen: (open: boolean) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  currentBoard: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  tool: 'select',
  selectedItemId: null,
  stageSize: { width: 800, height: 600 },
  propertiesOpen: false,

  setCurrentBoard: (board) => set({ currentBoard: board }),
  setViewport: (vp) => set((s) => ({ viewport: { ...s.viewport, ...vp } })),
  setTool: (tool) => set({ tool, selectedItemId: null }),
  setSelectedItemId: (id) => set({ selectedItemId: id, propertiesOpen: id !== null }),
  setStageSize: (size) => set({ stageSize: size }),
  setPropertiesOpen: (open) => set({ propertiesOpen: open }),
}));
