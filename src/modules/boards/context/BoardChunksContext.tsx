import { createContext, useContext } from 'react';
import type { BoardItem } from '../types';

interface BoardChunksContextValue {
  allItems: BoardItem[];
  addItem: (item: BoardItem) => void;
  updateItem: (id: string, updates: Partial<BoardItem>) => void;
  deleteItem: (id: string) => void;
}

const BoardChunksContext = createContext<BoardChunksContextValue>({
  allItems: [],
  addItem: () => {},
  updateItem: () => {},
  deleteItem: () => {},
});

export const BoardChunksProvider = BoardChunksContext.Provider;
export const useBoardChunksContext = () => useContext(BoardChunksContext);
