import { MousePointer2, Hand, Square, Circle, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBoardStore } from '../store/boardStore';
import type { ToolMode } from '../types';

const tools: { mode: ToolMode; icon: React.ElementType; label: string; shortcut: string }[] = [
  { mode: 'select', icon: MousePointer2, label: 'Selecionar', shortcut: 'V' },
  { mode: 'pan', icon: Hand, label: 'Mover', shortcut: 'H' },
  { mode: 'rect', icon: Square, label: 'Retângulo', shortcut: 'R' },
  { mode: 'circle', icon: Circle, label: 'Círculo', shortcut: 'C' },
  { mode: 'text', icon: Type, label: 'Texto', shortcut: 'T' },
];

export function ToolSwitch() {
  const { tool, setTool } = useBoardStore();

  return (
    <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 shadow-sm">
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
            {label} ({shortcut})
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
