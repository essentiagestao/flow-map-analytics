'use client';

import { useEffect, useState } from 'react';
import { Check, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveIndicatorProps {
  dirty: boolean;
  lastSaved?: Date | null;
  isSaving?: boolean;
}

export const SaveIndicator = ({ 
  dirty, 
  lastSaved, 
  isSaving = false 
}: SaveIndicatorProps) => {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!dirty && !isSaving && lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [dirty, isSaving, lastSaved]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isSaving) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="text-xs">Salvando...</span>
      </div>
    );
  }

  if (dirty) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <Cloud className="w-3.5 h-3.5 text-amber-500" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />
        </div>
        <span className="text-xs text-amber-600 dark:text-amber-400">
          Alterações pendentes
        </span>
      </div>
    );
  }

  if (showSaved || lastSaved) {
    return (
      <div className={cn(
        "flex items-center gap-1.5 transition-opacity duration-300",
        showSaved ? "opacity-100" : "opacity-70"
      )}>
        <Check className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-xs text-emerald-600 dark:text-emerald-400">
          {showSaved ? 'Salvo!' : `Salvo às ${formatTime(lastSaved!)}`}
        </span>
      </div>
    );
  }

  return null;
};
