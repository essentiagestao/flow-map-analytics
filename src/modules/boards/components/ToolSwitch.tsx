import {
  MousePointer2, Hand, Square, Circle, Type,
  Minus, ArrowRight, Frame, StickyNote, Pen, Image,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBoardStore } from '../store/boardStore';
import type { ToolMode } from '../types';
import { Separator } from '@/components/ui/separator';

interface ToolDef {
  mode: ToolMode;
  icon: React.ElementType;
  label: string;
  shortcut?: string;
}

const TOOLS: ToolDef[] = [
  { mode: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { mode: 'pan', icon: Hand, label: 'Hand', shortcut: 'H' },
];

const SHAPE_TOOLS: ToolDef[] = [
  { mode: 'frame', icon: Frame, label: 'Frame', shortcut: 'F' },
  { mode: 'rect', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { mode: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
];

const DRAW_TOOLS: ToolDef[] = [
  { mode: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
  { mode: 'connector', icon: ArrowRight, label: 'Connector' },
  { mode: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { mode: 'sticky', icon: StickyNote, label: 'Sticky', shortcut: 'N' },
  { mode: 'freedraw', icon: Pen, label: 'Draw', shortcut: 'P' },
  { mode: 'image', icon: Image, label: 'Upload' },
];

function ToolButton({ mode, icon: Icon, label, shortcut }: ToolDef) {
  const { tool, setTool } = useBoardStore();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={tool === mode ? 'default' : 'ghost'}
          size="icon"
          className="h-9 w-9"
          onClick={() => setTool(mode)}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {label}{shortcut ? ` (${shortcut})` : ''}
      </TooltipContent>
    </Tooltip>
  );
}

export function ToolSwitch() {
  return (
    <div className="flex flex-col items-center gap-0.5 bg-card border border-border rounded-xl p-1.5 shadow-md">
      {TOOLS.map(t => <ToolButton key={t.mode} {...t} />)}
      <Separator className="my-1 w-6" />
      {SHAPE_TOOLS.map(t => <ToolButton key={t.mode} {...t} />)}
      <Separator className="my-1 w-6" />
      {DRAW_TOOLS.map(t => <ToolButton key={t.mode} {...t} />)}
    </div>
  );
}
