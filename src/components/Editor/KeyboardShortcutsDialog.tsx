'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Arquivo',
    shortcuts: [
      { keys: ['Ctrl', 'S'], description: 'Salvar funil' },
      { keys: ['Ctrl', 'Z'], description: 'Desfazer' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Refazer' },
    ],
  },
  {
    title: 'Seleção',
    shortcuts: [
      { keys: ['Ctrl', 'A'], description: 'Selecionar todos os nós' },
      { keys: ['Shift', 'Click'], description: 'Adicionar à seleção' },
      { keys: ['Esc'], description: 'Limpar seleção' },
      { keys: ['Click', 'Arraste'], description: 'Seleção retangular' },
    ],
  },
  {
    title: 'Edição',
    shortcuts: [
      { keys: ['Ctrl', 'D'], description: 'Duplicar selecionados' },
      { keys: ['Delete'], description: 'Remover selecionados' },
      { keys: ['Backspace'], description: 'Remover selecionados' },
    ],
  },
  {
    title: 'Alinhamento',
    shortcuts: [
      { keys: ['Alt', 'L'], description: 'Alinhar à esquerda' },
      { keys: ['Alt', 'C'], description: 'Centralizar horizontalmente' },
      { keys: ['Alt', 'R'], description: 'Alinhar à direita' },
      { keys: ['Alt', 'T'], description: 'Alinhar ao topo' },
      { keys: ['Alt', 'M'], description: 'Centralizar verticalmente' },
      { keys: ['Alt', 'B'], description: 'Alinhar à base' },
      { keys: ['Alt', 'H'], description: 'Distribuir horizontalmente' },
      { keys: ['Alt', 'V'], description: 'Distribuir verticalmente' },
    ],
  },
];

interface KeyboardShortcutsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const KeyboardShortcutsDialog = ({ 
  open, 
  onOpenChange 
}: KeyboardShortcutsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                {group.title}
              </h4>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center">
                          <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="mx-0.5 text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Pressione <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border border-border rounded">?</kbd> para abrir este menu
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const KeyboardShortcutsButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          title="Atalhos de teclado (?)"
        >
          <Keyboard className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                {group.title}
              </h4>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center">
                          <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="mx-0.5 text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Pressione <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border border-border rounded">?</kbd> para abrir este menu
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
