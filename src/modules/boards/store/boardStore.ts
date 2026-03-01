// Board Engine v1 - Isolated Zustand store

import { create } from 'zustand';
import type { Board, BoardViewport, ToolMode, BoardItem } from '../types';

interface BoardState {
  currentBoard: Board | null;
  viewport: BoardViewport;
  tool: ToolMode;
  selectedItemId: string | null;
  stageSize: { width: number; height: number };

  setCurrentBoard: (board: Board | null) => void;
  setViewport: (viewport: Partial<BoardViewport>) => void;
  setTool: (tool: ToolMode) => void;
  setSelectedItemId: (id: string | null) => void;
  setStageSize: (size: { width: number; height: number }) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  currentBoard: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  tool: 'select',
  selectedItemId: null,
  stageSize: { width: 800, height: 600 },

  setCurrentBoard: (board) => set({ currentBoard: board }),
  setViewport: (vp) => set((s) => ({ viewport: { ...s.viewport, ...vp } })),
  setTool: (tool) => set({ tool, selectedItemId: null }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  setStageSize: (size) => set({ stageSize: size }),
}));
