// Board Engine v1 - Isolated Zustand store

import { create } from 'zustand';
import type { Board, BoardViewport, ToolMode, BoardItem, StudioMode } from '../types';

const DEFAULT_TOOLS: Record<StudioMode, ToolMode> = {
  structure: 'select',
  organize: 'select',
  create: 'select',
};

interface BoardState {
  currentBoard: Board | null;
  viewport: BoardViewport;
  tool: ToolMode;
  studioMode: StudioMode;
  selectedItemId: string | null;
  stageSize: { width: number; height: number };

  setCurrentBoard: (board: Board | null) => void;
  setViewport: (viewport: Partial<BoardViewport>) => void;
  setTool: (tool: ToolMode) => void;
  setStudioMode: (mode: StudioMode) => void;
  setSelectedItemId: (id: string | null) => void;
  setStageSize: (size: { width: number; height: number }) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  currentBoard: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  tool: 'select',
  studioMode: 'structure',
  selectedItemId: null,
  stageSize: { width: 800, height: 600 },

  setCurrentBoard: (board) => {
    const savedMode = (board?.settings as any)?.studioMode as StudioMode | undefined;
    const mode = savedMode && ['structure', 'organize', 'create'].includes(savedMode) ? savedMode : 'structure';
    set({ currentBoard: board, studioMode: mode, tool: DEFAULT_TOOLS[mode] });
  },
  setViewport: (vp) => set((s) => ({ viewport: { ...s.viewport, ...vp } })),
  setTool: (tool) => set({ tool, selectedItemId: null }),
  setStudioMode: (mode) => set({ studioMode: mode, tool: DEFAULT_TOOLS[mode], selectedItemId: null }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  setStageSize: (size) => set({ stageSize: size }),
}));
