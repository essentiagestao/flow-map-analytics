'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFunnelStore } from '@/lib/store/funnelStore';
import { useSavedFunnelsStore, SavedFunnel } from '@/lib/store/savedFunnelsStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FolderOpen, Save, Trash2, Edit2, Check, X, Share2, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SavedFunnelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SavedFunnelsDialog = ({ open, onOpenChange }: SavedFunnelsDialogProps) => {
  const { nodes, edges, setNodes, setEdges, pushHistory } = useFunnelStore();
  const {
    savedFunnels,
    currentFunnelId,
    currentFunnelName,
    loading,
    loadSavedFunnels,
    saveFunnel,
    updateFunnel,
    renameFunnel,
    deleteFunnel,
    setCurrentFunnelId,
    setCurrentFunnelName,
  } = useSavedFunnelsStore();
  const { user, profile } = useAuth();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    if (open) loadSavedFunnels();
  }, [open, loadSavedFunnels]);

  const handleSaveNew = async () => {
    const name = newName.trim() || `Funil ${savedFunnels.length + 1}`;
    const id = await saveFunnel(name, nodes, edges);
    if (id) {
      setNewName('');
      toast.success(`Funil "${name}" salvo!`);
    } else {
      toast.error('Erro ao salvar funil');
    }
  };

  const handleSaveCurrent = async () => {
    if (currentFunnelId) {
      await updateFunnel(currentFunnelId, nodes, edges);
      toast.success('Funil atualizado!');
    }
  };

  const handleLoad = (funnel: SavedFunnel) => {
    setNodes(funnel.nodes);
    setEdges(funnel.edges);
    pushHistory();
    setCurrentFunnelId(funnel.id);
    setCurrentFunnelName(funnel.name);
    onOpenChange(false);
    toast.success(`Funil "${funnel.name}" carregado!`);
  };

  const handleDelete = async (id: string, name: string) => {
    await deleteFunnel(id);
    toast.success(`Funil "${name}" excluído`);
  };

  const handleStartRename = (funnel: SavedFunnel) => {
    setEditingId(funnel.id);
    setEditName(funnel.name);
  };

  const handleConfirmRename = async () => {
    if (editingId && editName.trim()) {
      await renameFunnel(editingId, editName.trim());
      setEditingId(null);
      toast.success('Funil renomeado');
    }
  };

  const handlePublishAsTemplate = async (funnel: SavedFunnel) => {
    if (!user) return;
    setPublishing(funnel.id);
    try {
      const { error } = await supabase
        .from('public_templates')
        .insert({
          author_id: user.id,
          author_name: profile?.full_name || user.email || 'Anônimo',
          name: funnel.name,
          description: `Template baseado no funil "${funnel.name}"`,
          canvas_data: { nodes: funnel.nodes, edges: funnel.edges } as any,
        });

      if (error) throw error;
      toast.success('Template publicado na comunidade!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao publicar template');
    } finally {
      setPublishing(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Meus Funis
          </DialogTitle>
          <DialogDescription>
            Salve, renomeie e carregue seus funis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Save new */}
          <div className="flex gap-2">
            <Input
              placeholder="Nome do funil..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveNew()}
            />
            <Button onClick={handleSaveNew} className="gap-1 shrink-0">
              <Save className="w-4 h-4" />
              Salvar novo
            </Button>
          </div>

          {currentFunnelId && (
            <Button variant="outline" size="sm" onClick={handleSaveCurrent} className="gap-1 w-full">
              <Save className="w-4 h-4" />
              Atualizar "{currentFunnelName}"
            </Button>
          )}

          {/* Saved list */}
          <ScrollArea className="max-h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {savedFunnels.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Nenhum funil salvo ainda
                  </p>
                ) : (
                  savedFunnels.map((funnel) => (
                    <div
                      key={funnel.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                        funnel.id === currentFunnelId
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      {editingId === funnel.id ? (
                        <div className="flex-1 flex gap-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename()}
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Button size="sm" variant="ghost" onClick={handleConfirmRename}>
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div
                            className="flex-1 cursor-pointer min-w-0"
                            onClick={() => handleLoad(funnel)}
                          >
                            <div className="font-medium text-sm truncate">{funnel.name}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {funnel.nodes.length} nós · Atualizado {formatDate(funnel.updatedAt)}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePublishAsTemplate(funnel)}
                            disabled={publishing === funnel.id}
                            title="Publicar como template"
                          >
                            {publishing === funnel.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleStartRename(funnel)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(funnel.id, funnel.name)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
