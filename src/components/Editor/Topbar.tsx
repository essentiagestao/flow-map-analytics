'use client';

import { 
  File, 
  FolderOpen, 
  Image, 
  Download, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  Undo2, 
  Redo2,
  RotateCw,
  Keyboard,
  LayoutTemplate,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFunnelStore } from '@/lib/store/funnelStore';
import { getSampleFunnel } from '@/lib/utils/sampleData';
import { importFromJSON } from '@/lib/utils/exportImport';
import { toast } from 'sonner';
import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { SaveIndicator } from './SaveIndicator';

interface TopbarProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onOpenShortcuts?: () => void;
  onOpenExport?: () => void;
  onOpenTemplates?: () => void;
}

export const Topbar = ({ onZoomIn, onZoomOut, onFitView, onOpenShortcuts, onOpenExport, onOpenTemplates }: TopbarProps) => {
  const { 
    clear, 
    saveToLocal, 
    exportJSON, 
    importJSON, 
    undo, 
    redo, 
    history, 
    historyIndex,
    setNodes,
    setEdges,
    pushHistory,
    dirty,
    lastSaved,
    isSaving,
    setLastSaved,
    setIsSaving,
  } = useFunnelStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNew = () => {
    clear();
    toast.success('Novo funil criado');
  };

  const handleLoadSample = () => {
    const { nodes, edges } = getSampleFunnel();
    setNodes(nodes);
    setEdges(edges);
    pushHistory();
    toast.success('Funil de exemplo carregado');
  };

  const handleExportImage = async () => {
    const canvas = document.querySelector('.react-flow') as HTMLElement;
    if (!canvas) {
      toast.error('Canvas não encontrado');
      return;
    }
    
    try {
      const dataUrl = await toPng(canvas, {
        backgroundColor: '#ffffff',
        quality: 1,
      });
      
      const link = document.createElement('a');
      link.download = `funil-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success('Imagem exportada com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar imagem');
      console.error(error);
    }
  };

  const handleExport = () => {
    exportJSON();
    toast.success('Funil exportado!');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromJSON(file);
      importJSON(data);
      toast.success('Funil importado com sucesso!');
    } catch (error) {
      toast.error('Erro ao importar arquivo');
    }
    
    // Reset input
    e.target.value = '';
  };

  const handleUndo = () => {
    undo();
    toast.success('Desfeito');
  };

  const handleRedo = () => {
    redo();
    toast.success('Refeito');
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-foreground">Editor de Funis</h1>
        <SaveIndicator dirty={dirty} lastSaved={lastSaved} isSaving={isSaving} />
      </div>
      
      <div className="flex items-center gap-2">
        {/* Arquivo */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNew}
          title="Novo funil (Ctrl+N)"
        >
          <File className="w-4 h-4" />
          Novo
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onOpenTemplates}
          title="Templates prontos"
        >
          <LayoutTemplate className="w-4 h-4" />
          Templates
        </Button>
        
        <Button
          variant="outline" 
          size="sm" 
          onClick={onOpenExport}
          title="Exportar Imagem/PDF"
        >
          <Image className="w-4 h-4" />
          Exportar
        </Button>
        
        <div className="w-px h-6 bg-border mx-2" />
        
        {/* Import/Export */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExport}
          title="Exportar JSON"
        >
          <Download className="w-4 h-4" />
          Exportar
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleImportClick}
          title="Importar JSON"
        >
          <Upload className="w-4 h-4" />
          Importar
        </Button>
        
        <Input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          className="hidden"
        />
        
        <div className="w-px h-6 bg-border mx-2" />
        
        {/* Zoom */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => (window as any).reactFlowZoomIn?.()}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => (window as any).reactFlowZoomOut?.()}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => (window as any).reactFlowFitView?.()}
          title="Ajustar à tela"
        >
          <RotateCw className="w-4 h-4" />
          Ajustar
        </Button>
        
        <div className="w-px h-6 bg-border mx-2" />
        
        {/* Undo/Redo */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleUndo}
          disabled={!canUndo}
          title="Desfazer (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRedo}
          disabled={!canRedo}
          title="Refazer (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-2" />
        
        {/* Keyboard shortcuts */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onOpenShortcuts}
          title="Atalhos de teclado (?)"
        >
          <Keyboard className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};