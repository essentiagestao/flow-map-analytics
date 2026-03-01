// Board Engine v1 - Isolated types

export interface BoardItem {
  id: string;
  type: 'rect' | 'circle' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface ChunkBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BoardChunk {
  id?: string;
  board_id: string;
  section_id?: string | null;
  chunk_key: string;
  bounds: ChunkBounds;
  items: BoardItem[];
  version: number;
  dirty?: boolean;
}

export interface BoardViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface Board {
  id: string;
  owner_id: string;
  title: string;
  viewport: BoardViewport;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BoardSection {
  id: string;
  board_id: string;
  title: string;
  order_index: number;
  is_hidden: boolean;
}

export type ToolMode =
  | 'select'
  | 'pan'
  | 'rect'
  | 'circle'
  | 'ellipse'
  | 'text'
  | 'line'
  | 'connector'
  | 'frame'
  | 'section'
  | 'sticky'
  | 'freedraw'
  | 'highlighter'
  | 'image';

export type StudioMode = 'structure' | 'organize' | 'create';
