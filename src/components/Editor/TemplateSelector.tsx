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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { funnelTemplates, FunnelTemplate } from '@/lib/utils/funnelTemplates';
import { useFunnelStore } from '@/lib/store/funnelStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  FaInstagram, 
  FaRocket, 
  FaArrowUp, 
  FaVideo, 
  FaEnvelope,
  FaCheck,
} from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { Loader2, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FaInstagram,
  FaRocket,
  FaArrowUp,
  FaVideo,
  FaEnvelope,
};

interface CommunityTemplate {
  id: string;
  name: string;
  description: string | null;
  author_name: string | null;
  icon: string | null;
  canvas_data: any;
  usage_count: number;
  category: string | null;
  created_at: string;
}

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TemplateSelector = ({ open, onOpenChange }: TemplateSelectorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [communityTemplates, setCommunityTemplates] = useState<CommunityTemplate[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const { setNodes, setEdges, pushHistory, clear } = useFunnelStore();

  useEffect(() => {
    if (open) {
      loadCommunityTemplates();
    }
  }, [open]);

  const loadCommunityTemplates = async () => {
    setLoadingCommunity(true);
    try {
      const { data, error } = await supabase
        .from('public_templates')
        .select('*')
        .eq('is_approved', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setCommunityTemplates(data || []);
    } catch (e) {
      console.error('Erro ao carregar templates:', e);
    } finally {
      setLoadingCommunity(false);
    }
  };

  const handleLoadSystemTemplate = () => {
    if (!selectedTemplate) return;
    const template = funnelTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    clear();
    setTimeout(() => {
      setNodes(template.nodes);
      setEdges(template.edges);
      pushHistory();
      toast.success(`Template "${template.name}" carregado!`);
      onOpenChange(false);
      setSelectedTemplate(null);
    }, 50);
  };

  const handleLoadCommunityTemplate = async () => {
    if (!selectedCommunity) return;
    const template = communityTemplates.find(t => t.id === selectedCommunity);
    if (!template) return;

    clear();
    setTimeout(async () => {
      const canvasData = template.canvas_data as any;
      setNodes(canvasData?.nodes || []);
      setEdges(canvasData?.edges || []);
      pushHistory();
      toast.success(`Template "${template.name}" carregado!`);
      onOpenChange(false);
      setSelectedCommunity(null);

      // Increment usage count
      await supabase
        .from('public_templates')
        .update({ usage_count: (template.usage_count || 0) + 1 })
        .eq('id', template.id);
    }, 50);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Escolha um Template</DialogTitle>
          <DialogDescription>
            Comece rapidamente com um funil pré-configurado
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="system" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="system" className="flex-1">Templates do Sistema</TabsTrigger>
            <TabsTrigger value="community" className="flex-1 gap-1.5">
              <Users className="w-4 h-4" />
              Comunidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
              {funnelTemplates.map((template) => {
                const IconComponent = iconMap[template.icon];
                const isSelected = selectedTemplate === template.id;
                
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={cn(
                      "relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left",
                      "hover:border-primary/50 hover:bg-muted/50",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border bg-card"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <FaCheck className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {IconComponent && <IconComponent className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                          {template.nodes.length} nós
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleLoadSystemTemplate} disabled={!selectedTemplate}>
                Carregar Template
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="community">
            <ScrollArea className="max-h-[400px]">
              {loadingCommunity ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : communityTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum template da comunidade disponível ainda.
                  <br />
                  Publique seus funis para compartilhar!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
                  {communityTemplates.map((template) => {
                    const isSelected = selectedCommunity === template.id;
                    const IconComponent = iconMap[template.icon || 'FaRocket'] || FaRocket;

                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelectedCommunity(template.id)}
                        className={cn(
                          "relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left",
                          "hover:border-primary/50 hover:bg-muted/50",
                          isSelected 
                            ? "border-primary bg-primary/5" 
                            : "border-border bg-card"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <FaCheck className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}

                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          <IconComponent className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{template.name}</h3>
                          {template.description && (
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                              por {template.author_name || 'Anônimo'}
                            </span>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                              {template.usage_count || 0} usos
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleLoadCommunityTemplate} disabled={!selectedCommunity}>
                Carregar Template
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
