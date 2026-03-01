import { Rect, Circle, Text, Group, Transformer } from 'react-konva';
import { useRef, useEffect } from 'react';
import type { BoardItem } from '../types';
import type Konva from 'konva';

interface ShapeRendererProps {
  items: BoardItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onTransformEnd: (id: string, attrs: Partial<BoardItem>) => void;
}

export function ShapeRenderer({ items, selectedId, onSelect, onDragEnd, onTransformEnd }: ShapeRendererProps) {
  const trRef = useRef<Konva.Transformer>(null);
  const selectedRef = useRef<Konva.Shape | null>(null);

  useEffect(() => {
    if (trRef.current && selectedRef.current && selectedId) {
      trRef.current.nodes([selectedRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  return (
    <>
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        const commonProps = {
          key: item.id,
          x: item.x,
          y: item.y,
          fill: item.fill,
          stroke: item.stroke || (isSelected ? 'hsl(var(--primary))' : undefined),
          strokeWidth: item.strokeWidth || (isSelected ? 2 : 0),
          draggable: true,
          rotation: item.rotation || 0,
          onClick: () => onSelect(item.id),
          onTap: () => onSelect(item.id),
          onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
            onDragEnd(item.id, e.target.x(), e.target.y());
          },
          ref: isSelected ? (selectedRef as any) : undefined,
        };

        if (item.type === 'rect') {
          return <Rect {...commonProps} width={item.width || 100} height={item.height || 80} />;
        }
        if (item.type === 'circle') {
          return <Circle {...commonProps} radius={item.radius || 50} />;
        }
        if (item.type === 'text') {
          return (
            <Text
              {...commonProps}
              text={item.text || 'Texto'}
              fontSize={item.fontSize || 20}
              fill={item.fill || 'hsl(var(--foreground))'}
            />
          );
        }
        return null;
      })}
      {selectedId && <Transformer ref={trRef} />}
    </>
  );
}
