'use client';

import { useEffect, useCallback, useState } from 'react';
import { useFunnelStore } from '@/lib/store/funnelStore';
import { Topbar } from './Topbar';
import { Palette } from './Palette';
import { Canvas } from './Canvas';
import { Properties } from './Properties';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
import { useNodeAlignment } from '@/hooks/useNodeAlignment';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { DeleteConfirmDialog, shouldShowDeleteConfirm } from './DeleteConfirmDialog';
import { OnboardingOverlay } from './Onboarding/OnboardingOverlay';
import { ExportDialog } from './Export/ExportDialog';
import { TemplateSelector } from './TemplateSelector';

export const EditorShell = () => {
  const { 
    loadFromLocal, 
    saveToLocal, 
    dirty, 
    removeNode, 
    removeNodes,
    removeEdge, 
    selectedNodeId,
    selectedNodeIds,
    nodes,
    edges,
    undo,
    redo,
    setNodes,
    pushHistory,
    setLastSaved,
    setIsSaving,
  } = useFunnelStore();

  const { alignNodes } = useNodeAlignment();
  
  // Dialog states
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteCount, setPendingDeleteCount] = useState(0);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    loadFromLocal();
  }, [loadFromLocal]);

  // Auto-save every 5 seconds if dirty
  useEffect(() => {
    if (!dirty) return;
    
    const interval = setInterval(() => {
      if (dirty) {
        setIsSaving?.(true);
        saveToLocal();
        setIsSaving?.(false);
        setLastSaved?.(new Date());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [dirty, saveToLocal, setLastSaved, setIsSaving]);

  // Duplicate selected nodes
  const duplicateSelected = useCallback(() => {
    const selected = nodes.filter(n => selectedNodeIds.includes(n.id));
    if (selected.length === 0 && selectedNodeId) {
      const node = nodes.find(n => n.id === selectedNodeId);
      if (node) {
        const newNode = {
          ...node,
          id: `${node.id}-copy-${Date.now()}`,
          position: { x: node.position.x + 50, y: node.position.y + 50 },
        };
        setNodes([...nodes, newNode]);
        pushHistory();
        toast.success('Nó duplicado');
      }
    } else if (selected.length > 0) {
      const newNodes = selected.map(node => ({
        ...node,
        id: `${node.id}-copy-${Date.now()}`,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
      }));
      setNodes([...nodes, ...newNodes]);
      pushHistory();
      toast.success(`${newNodes.length} nós duplicados`);
    }
  }, [nodes, selectedNodeId, selectedNodeIds, setNodes, pushHistory]);

  // Handle delete with optional confirmation
  const handleDelete = useCallback(() => {
    const count = selectedNodeIds.length > 1 ? selectedNodeIds.length : selectedNodeId ? 1 : 0;
    
    if (count === 0) return;
    
    if (count > 1 && shouldShowDeleteConfirm()) {
      setPendingDeleteCount(count);
      setDeleteDialogOpen(true);
    } else {
      executeDelete();
    }
  }, [selectedNodeIds, selectedNodeId]);

  const executeDelete = useCallback(() => {
    if (selectedNodeIds.length > 1) {
      removeNodes(selectedNodeIds);
      toast.success(`${selectedNodeIds.length} nós removidos`);
    } else if (selectedNodeId) {
      removeNode(selectedNodeId);
      toast.success('Nó removido');
    }
  }, [selectedNodeIds, selectedNodeId, removeNodes, removeNode]);

  // Keyboard shortcuts
  useHotkeys('ctrl+s, meta+s', (e) => {
    e.preventDefault();
    setIsSaving?.(true);
    saveToLocal();
    setIsSaving?.(false);
    setLastSaved?.(new Date());
    toast.success('Funil salvo!');
  });

  useHotkeys('ctrl+z, meta+z', (e) => {
    e.preventDefault();
    undo();
  });

  useHotkeys('ctrl+shift+z, meta+shift+z', (e) => {
    e.preventDefault();
    redo();
  });

  useHotkeys('delete, backspace', () => {
    handleDelete();
  });

  // Duplicate shortcut
  useHotkeys('ctrl+d, meta+d', (e) => {
    e.preventDefault();
    duplicateSelected();
  });

  // Select all shortcut
  useHotkeys('ctrl+a, meta+a', (e) => {
    e.preventDefault();
    const nodeIds = nodes.map(n => n.id);
    useFunnelStore.getState().setSelectedNodeIds(nodeIds);
    toast.success('Todos os nós selecionados');
  });

  // Alignment shortcuts
  useHotkeys('alt+l', () => alignNodes('left'));
  useHotkeys('alt+c', () => alignNodes('center-h'));
  useHotkeys('alt+r', () => alignNodes('right'));
  useHotkeys('alt+t', () => alignNodes('top'));
  useHotkeys('alt+m', () => alignNodes('center-v'));
  useHotkeys('alt+b', () => alignNodes('bottom'));
  useHotkeys('alt+h', () => alignNodes('distribute-h'));
  useHotkeys('alt+v', () => alignNodes('distribute-v'));
  
  // Magnetic spacing shortcuts
  useHotkeys('alt+shift+h', () => alignNodes('space-h'));
  useHotkeys('alt+shift+v', () => alignNodes('space-v'));

  // Escape to deselect ALL
  useHotkeys('escape', () => {
    useFunnelStore.getState().setSelectedNodeId(null);
    useFunnelStore.getState().setSelectedNodeIds([]);
  });

  // Open keyboard shortcuts
  useHotkeys('shift+/', () => {
    setShortcutsOpen(true);
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      <Topbar 
        onOpenShortcuts={() => setShortcutsOpen(true)} 
        onOpenExport={() => setExportDialogOpen(true)}
        onOpenTemplates={() => setTemplatesOpen(true)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar esquerda - Paleta */}
        <div className="w-64 bg-card border-r border-border flex-shrink-0">
          <Palette />
        </div>
        
        {/* Canvas central */}
        <div className="flex-1 bg-muted/30">
          <Canvas />
        </div>
        
        {/* Painel direito - Propriedades */}
        <div className="w-80 bg-card border-l border-border flex-shrink-0">
          <Properties onDelete={handleDelete} />
        </div>
      </div>
      
      {/* Dialogs */}
      <KeyboardShortcutsDialog 
        open={shortcutsOpen} 
        onOpenChange={setShortcutsOpen} 
      />
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        count={pendingDeleteCount}
        onConfirm={executeDelete}
      />
      
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
      />
      
      <TemplateSelector
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
      />
      
      {/* Onboarding for first-time users */}
      <OnboardingOverlay />
    </div>
  );
};