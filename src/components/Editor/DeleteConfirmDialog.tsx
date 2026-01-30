'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  onConfirm: () => void;
}

const STORAGE_KEY = 'funnel-editor-skip-delete-confirm';

export const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  count,
  onConfirm,
}: DeleteConfirmDialogProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a excluir {count} {count === 1 ? 'nó' : 'nós'}.
            Esta ação não pode ser desfeita diretamente, mas você pode usar Ctrl+Z para desfazer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="dont-show"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked === true)}
          />
          <Label 
            htmlFor="dont-show" 
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Não mostrar esta mensagem novamente
          </Label>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const shouldShowDeleteConfirm = (): boolean => {
  return localStorage.getItem(STORAGE_KEY) !== 'true';
};

export const resetDeleteConfirmPreference = () => {
  localStorage.removeItem(STORAGE_KEY);
};
