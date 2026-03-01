import { useCallback, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBoardStore } from '../store/boardStore';
import { supabase } from '@/integrations/supabase/client';
import type { StudioMode } from '../types';

const modes: { mode: StudioMode; label: string; shortcut: string; description: string; color: string }[] = [
  {
    mode: 'structure',
    label: 'Structure',
    shortcut: 'F2',
    description: 'Modelagem de fluxo e arquitetura visual',
    color: 'bg-blue-500',
  },
  {
    mode: 'organize',
    label: 'Organize',
    shortcut: 'F3',
    description: 'Organização macro com seções e grupos',
    color: 'bg-yellow-500',
  },
  {
    mode: 'create',
    label: 'Create',
    shortcut: 'F4',
    description: 'Ideação livre, notas e brainstorm',
    color: 'bg-purple-500',
  },
];

export function StudioSwitch() {
  const { studioMode, setStudioMode, currentBoard } = useBoardStore();

  const persistMode = useCallback(async (mode: StudioMode) => {
    if (!currentBoard) return;
    const settings = { ...((currentBoard.settings as any) || {}), studioMode: mode };
    await supabase
      .from('board_v1_boards' as any)
      .update({ settings } as any)
      .eq('id', currentBoard.id);
  }, [currentBoard]);

  const handleSwitch = useCallback((mode: StudioMode) => {
    if (mode === studioMode) return;
    setStudioMode(mode);
    persistMode(mode);
  }, [studioMode, setStudioMode, persistMode]);

  // F2/F3/F4 shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case 'F2': e.preventDefault(); handleSwitch('structure'); break;
        case 'F3': e.preventDefault(); handleSwitch('organize'); break;
        case 'F4': e.preventDefault(); handleSwitch('create'); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSwitch]);

  return (
    <div className="flex items-center bg-muted rounded-full p-0.5 gap-0.5">
      {modes.map(({ mode, label, shortcut, description, color }) => {
        const isActive = studioMode === mode;
        return (
          <Tooltip key={mode}>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleSwitch(mode)}
                className={`
                  relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                  transition-all duration-200 ease-out select-none
                  ${isActive
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? color : 'bg-muted-foreground/40'} transition-colors`} />
                {label}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p className="font-medium">{label} ({shortcut})</p>
              <p className="text-muted-foreground">{description}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
