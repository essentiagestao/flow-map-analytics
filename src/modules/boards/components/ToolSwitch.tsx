import {
  MousePointer2, Hand, Square, Circle, Type,
  Minus, ArrowRight, Frame, LayoutGrid,
  StickyNote, Pen, Highlighter, Image,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBoardStore } from '../store/boardStore';
import type { ToolMode, StudioMode } from '../types';

interface ToolDef {
  mode: ToolMode;
  icon: React.ElementType;
  label: string;
  shortcut?: string;
}

const TOOLS_BY_STUDIO: Record<StudioMode, ToolDef[]> = {
  structure: [
    { mode: 'select', icon: MousePointer2, label: 'Selecionar', shortcut: 'V' },
    { mode: 'pan', icon: Hand, label: 'Mover', shortcut: 'H' },
    { mode: 'rect', icon: Square, label: 'Retângulo', shortcut: 'R' },
    { mode: 'ellipse', icon: Circle, label: 'Elipse', shortcut: 'E' },
    { mode: 'line', icon: Minus, label: 'Linha', shortcut: 'L' },
    { mode: 'connector', icon: ArrowRight, label: 'Conector' },
    { mode: 'text', icon: Type, label: 'Texto', shortcut: 'T' },
    { mode: 'frame', icon: Frame, label: 'Frame', shortcut: 'F' },
  ],
  organize: [
    { mode: 'select', icon: MousePointer2, label: 'Selecionar', shortcut: 'V' },
    { mode: 'pan', icon: Hand, label: 'Mover', shortcut: 'H' },
    { mode: 'section', icon: LayoutGrid, label: 'Seção', shortcut: 'S' },
    { mode: 'frame', icon: Frame, label: 'Frame', shortcut: 'F' },
  ],
  create: [
    { mode: 'select', icon: MousePointer2, label: 'Selecionar', shortcut: 'V' },
    { mode: 'pan', icon: Hand, label: 'Mover', shortcut: 'H' },
    { mode: 'sticky', icon: StickyNote, label: 'Sticky Note', shortcut: 'N' },
    { mode: 'freedraw', icon: Pen, label: 'Desenho Livre', shortcut: 'P' },
    { mode: 'highlighter', icon: Highlighter, label: 'Marcador' },
    { mode: 'text', icon: Type, label: 'Texto', shortcut: 'T' },
    { mode: 'image', icon: Image, label: 'Imagem' },
  ],
};

export function ToolSwitch() {
  const { tool, setTool, studioMode } = useBoardStore();
  const tools = TOOLS_BY_STUDIO[studioMode];

  return (
    <div className="flex items-center gap-0.5 bg-card border border-border rounded-lg p-1 shadow-sm">
      {tools.map(({ mode, icon: Icon, label, shortcut }) => (
        <Tooltip key={mode}>
          <TooltipTrigger asChild>
            <Button
              variant={tool === mode ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setTool(mode)}
            >
              <Icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {label}{shortcut ? ` (${shortcut})` : ''}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
