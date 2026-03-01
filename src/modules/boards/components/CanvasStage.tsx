import { useRef, useCallback, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import type Konva from 'konva';
import { useBoardStore } from '../store/boardStore';
import { useBoardChunks } from '../hooks/useBoardChunks';
import { ShapeRenderer } from './ShapeRenderer';
import type { BoardItem } from '../types';

const COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function generateId() {
  return crypto.randomUUID();
}

interface CanvasStageProps {
  boardId: string;
}

export function CanvasStage({ boardId }: CanvasStageProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { viewport, setViewport, tool, selectedItemId, setSelectedItemId, setStageSize, stageSize } = useBoardStore();
  const { visibleChunks, addItem, updateItem, deleteItem } = useBoardChunks(boardId);
  const isDrawing = useRef(false);
  const drawStart = useRef<{ x: number; y: number } | null>(null);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setStageSize({ width, height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [setStageSize]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const store = useBoardStore.getState();
      switch (e.key.toLowerCase()) {
        case 'v': store.setTool('select'); break;
        case 'h': store.setTool('pan'); break;
        case 'r': store.setTool('rect'); break;
        case 'c': store.setTool('circle'); break;
        case 't': store.setTool('text'); break;
        case 'delete':
        case 'backspace':
          if (store.selectedItemId) {
            deleteItem(store.selectedItemId);
            store.setSelectedItemId(null);
          }
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deleteItem]);

  // Collect all items from visible chunks
  const allItems: BoardItem[] = visibleChunks.flatMap(c => c.items);

  const getWorldPos = useCallback((stage: Konva.Stage) => {
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    return {
      x: (pointer.x - viewport.x) / viewport.zoom,
      y: (pointer.y - viewport.y) / viewport.zoom,
    };
  }, [viewport]);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldZoom = viewport.zoom;
    const pointer = stage.getPointerPosition()!;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const factor = 1.08;
    const newZoom = Math.min(Math.max(direction > 0 ? oldZoom * factor : oldZoom / factor, 0.1), 5);

    const mousePointTo = {
      x: (pointer.x - viewport.x) / oldZoom,
      y: (pointer.y - viewport.y) / oldZoom,
    };

    setViewport({
      zoom: newZoom,
      x: pointer.x - mousePointTo.x * newZoom,
      y: pointer.y - mousePointTo.y * newZoom,
    });
  }, [viewport, setViewport]);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    if (tool === 'pan') {
      // Pan is handled by stage draggable
      return;
    }

    if (tool === 'select') {
      // Clicking empty area deselects
      if (e.target === stage) {
        setSelectedItemId(null);
      }
      return;
    }

    // Drawing tools
    const pos = getWorldPos(stage);
    if (!pos) return;

    if (tool === 'text') {
      addItem({
        id: generateId(),
        type: 'text',
        x: pos.x,
        y: pos.y,
        fill: '#1a1a1a',
        text: 'Texto',
        fontSize: 24,
      });
      return;
    }

    if (tool === 'rect' || tool === 'circle') {
      const item: BoardItem = {
        id: generateId(),
        type: tool === 'rect' ? 'rect' : 'circle',
        x: pos.x,
        y: pos.y,
        fill: randomColor(),
        ...(tool === 'rect' ? { width: 120, height: 80 } : { radius: 50 }),
      };
      addItem(item);
    }
  }, [tool, getWorldPos, addItem, setSelectedItemId]);

  const handleDragEnd = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    setViewport({ x: stage.x(), y: stage.y() });
  }, [setViewport]);

  const handleItemDragEnd = useCallback((id: string, x: number, y: number) => {
    updateItem(id, { x, y });
  }, [updateItem]);

  return (
    <div ref={containerRef} className="flex-1 bg-muted/30 overflow-hidden relative">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.zoom}
        scaleY={viewport.zoom}
        draggable={tool === 'pan'}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onDragEnd={handleDragEnd}
        style={{ cursor: tool === 'pan' ? 'grab' : tool === 'select' ? 'default' : 'crosshair' }}
      >
        <Layer>
          <ShapeRenderer
            items={allItems}
            selectedId={selectedItemId}
            onSelect={setSelectedItemId}
            onDragEnd={handleItemDragEnd}
            onTransformEnd={(id, attrs) => updateItem(id, attrs)}
          />
        </Layer>
      </Stage>

      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 bg-card border border-border rounded px-2 py-1 text-xs text-muted-foreground font-mono">
        {Math.round(viewport.zoom * 100)}%
      </div>
    </div>
  );
}
