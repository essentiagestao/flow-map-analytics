'use client';

import {
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignHorizontalSpaceBetween,
  AlignVerticalSpaceBetween,
  Magnet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNodeAlignment, AlignmentType } from '@/hooks/useNodeAlignment';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const alignmentButtons: { type: AlignmentType; icon: React.ReactNode; label: string; shortcut?: string }[] = [
  { 
    type: 'left', 
    icon: <AlignHorizontalJustifyStart className="w-4 h-4" />, 
    label: 'Alinhar à Esquerda',
    shortcut: 'Alt+L'
  },
  { 
    type: 'center-h', 
    icon: <AlignHorizontalJustifyCenter className="w-4 h-4" />, 
    label: 'Centralizar Horizontal',
    shortcut: 'Alt+C'
  },
  { 
    type: 'right', 
    icon: <AlignHorizontalJustifyEnd className="w-4 h-4" />, 
    label: 'Alinhar à Direita',
    shortcut: 'Alt+R'
  },
  { 
    type: 'top', 
    icon: <AlignVerticalJustifyStart className="w-4 h-4" />, 
    label: 'Alinhar ao Topo',
    shortcut: 'Alt+T'
  },
  { 
    type: 'center-v', 
    icon: <AlignVerticalJustifyCenter className="w-4 h-4" />, 
    label: 'Centralizar Vertical',
    shortcut: 'Alt+M'
  },
  { 
    type: 'bottom', 
    icon: <AlignVerticalJustifyEnd className="w-4 h-4" />, 
    label: 'Alinhar à Base',
    shortcut: 'Alt+B'
  },
  { 
    type: 'distribute-h', 
    icon: <AlignHorizontalSpaceBetween className="w-4 h-4" />, 
    label: 'Distribuir Horizontal',
    shortcut: 'Alt+H'
  },
  { 
    type: 'distribute-v', 
    icon: <AlignVerticalSpaceBetween className="w-4 h-4" />, 
    label: 'Distribuir Vertical',
    shortcut: 'Alt+V'
  },
];

const spacingButtons: { type: AlignmentType; icon: React.ReactNode; label: string; shortcut?: string }[] = [
  { 
    type: 'space-h', 
    icon: <Magnet className="w-4 h-4 rotate-90" />, 
    label: 'Espaçamento Magnético H',
    shortcut: 'Alt+Shift+H'
  },
  { 
    type: 'space-v', 
    icon: <Magnet className="w-4 h-4" />, 
    label: 'Espaçamento Magnético V',
    shortcut: 'Alt+Shift+V'
  },
];

export const AlignmentToolbar = () => {
  const { alignNodes, selectedCount } = useNodeAlignment();

  if (selectedCount < 2) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-xl shadow-xl p-1.5 flex items-center gap-1">
      <TooltipProvider delayDuration={300}>
        {alignmentButtons.slice(0, 3).map((btn) => (
          <Tooltip key={btn.type}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted rounded-lg"
                onClick={() => alignNodes(btn.type)}
              >
                {btn.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs bg-popover border-border">
              {btn.label} <span className="text-muted-foreground ml-1">({btn.shortcut})</span>
            </TooltipContent>
          </Tooltip>
        ))}
        
        <Separator orientation="vertical" className="h-5 mx-0.5 bg-border" />
        
        {alignmentButtons.slice(3, 6).map((btn) => (
          <Tooltip key={btn.type}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted rounded-lg"
                onClick={() => alignNodes(btn.type)}
              >
                {btn.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs bg-popover border-border">
              {btn.label} <span className="text-muted-foreground ml-1">({btn.shortcut})</span>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {selectedCount >= 3 && (
          <>
            <Separator orientation="vertical" className="h-5 mx-0.5 bg-border" />
            
            {alignmentButtons.slice(6).map((btn) => (
              <Tooltip key={btn.type}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted rounded-lg"
                    onClick={() => alignNodes(btn.type)}
                  >
                    {btn.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs bg-popover border-border">
                  {btn.label} <span className="text-muted-foreground ml-1">({btn.shortcut})</span>
                </TooltipContent>
              </Tooltip>
            ))}
          </>
        )}
        
        <Separator orientation="vertical" className="h-5 mx-0.5 bg-border" />
        
        {/* Magnetic spacing buttons */}
        {spacingButtons.map((btn) => (
          <Tooltip key={btn.type}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-lg"
                onClick={() => alignNodes(btn.type)}
              >
                {btn.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs bg-popover border-border">
              {btn.label} <span className="text-muted-foreground ml-1">({btn.shortcut})</span>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
};
