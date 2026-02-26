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
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFunnelStore } from '@/lib/store/funnelStore';
import { useSavedFunnelsStore } from '@/lib/store/savedFunnelsStore';
import { getSampleFunnel } from '@/lib/utils/sampleData';
import { importFromJSON } from '@/lib/utils/exportImport';
import { toast } from 'sonner';
import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { SaveIndicator } from './SaveIndicator';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopbarProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onOpenShortcuts?: () => void;
  onOpenExport?: () => void;
  onOpenTemplates?: () => void;
  onOpenSavedFunnels?: () => void;
}

export const Topbar = ({ onZoomIn, onZoomOut, onFitView, onOpenShortcuts, onOpenExport, onOpenTemplates, onOpenSavedFunnels }: TopbarProps) => {
  const { 
    clear, 
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
  } = useFunnelStore();
  const { currentFunnelName } = useSavedFunnelsStore();
  const { user, profile, signOut } = useAuth();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNew = () => {
    clear();
    useSavedFunnelsStore.getState().setCurrentFunnelId(null);
    useSavedFunnelsStore.getState().setCurrentFunnelName('Funil sem nome');
    toast.success('Novo funil criado');
  };

  const handleLoadSample = () => {
    const { nodes, edges } = getSampleFunnel();
    setNodes(nodes);
    setEdges(edges);
    pushHistory();
    toast.success('Funil de exemplo carregado');
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
    e.target.value = '';
  };

  const handleUndo = () => { undo(); };
  const handleRedo = () => { redo(); };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado');
    } catch {
      toast.error('Erro ao sair');
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const displayName = profile?.full_name || user?.email || '';
  const avatarUrl = profile?.avatar_url || '';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground truncate max-w-[200px]">{currentFunnelName}</h1>
        <SaveIndicator dirty={dirty} lastSaved={lastSaved} isSaving={isSaving} />
      </div>
      
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" onClick={handleNew} title="Novo funil">
          <File className="w-4 h-4" />
          <span className="hidden lg:inline">Novo</span>
        </Button>
        
        <Button variant="outline" size="sm" onClick={onOpenSavedFunnels} title="Meus funis salvos">
          <FolderOpen className="w-4 h-4" />
          <span className="hidden lg:inline">Meus Funis</span>
        </Button>
        
        <Button variant="outline" size="sm" onClick={onOpenTemplates} title="Templates prontos">
          <LayoutTemplate className="w-4 h-4" />
          <span className="hidden lg:inline">Templates</span>
        </Button>
        
        <Button variant="outline" size="sm" onClick={onOpenExport} title="Exportar Imagem/PDF">
          <Image className="w-4 h-4" />
          <span className="hidden lg:inline">Exportar</span>
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button variant="outline" size="sm" onClick={handleExport} title="Exportar JSON">
          <Download className="w-4 h-4" />
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleImportClick} title="Importar JSON">
          <Upload className="w-4 h-4" />
        </Button>
        
        <Input ref={fileInputRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button variant="outline" size="sm" onClick={() => (window as any).reactFlowZoomIn?.()} title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => (window as any).reactFlowZoomOut?.()} title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => (window as any).reactFlowFitView?.()} title="Ajustar à tela">
          <RotateCw className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button variant="outline" size="sm" onClick={handleUndo} disabled={!canUndo} title="Desfazer">
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleRedo} disabled={!canRedo} title="Refazer">
          <Redo2 className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button variant="outline" size="sm" onClick={onOpenShortcuts} title="Atalhos de teclado">
          <Keyboard className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 px-2">
              <Avatar className="w-7 h-7">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden xl:inline text-sm font-medium truncate max-w-[120px]">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
