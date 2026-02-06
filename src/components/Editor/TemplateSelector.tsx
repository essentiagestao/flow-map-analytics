'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { funnelTemplates, FunnelTemplate } from '@/lib/utils/funnelTemplates';
import { useFunnelStore } from '@/lib/store/funnelStore';
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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FaInstagram,
  FaRocket,
  FaArrowUp,
  FaVideo,
  FaEnvelope,
};

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TemplateSelector = ({ open, onOpenChange }: TemplateSelectorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { setNodes, setEdges, pushHistory, clear } = useFunnelStore();

  const handleLoadTemplate = () => {
    if (!selectedTemplate) return;
    
    const template = funnelTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    // Clear existing and load template
    clear();
    
    // Use setTimeout to ensure clear completes first
    setTimeout(() => {
      setNodes(template.nodes);
      setEdges(template.edges);
      pushHistory();
      toast.success(`Template "${template.name}" carregado!`);
      onOpenChange(false);
      setSelectedTemplate(null);
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
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <FaCheck className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                
                {/* Icon */}
                <div 
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {IconComponent && <IconComponent className="w-5 h-5" />}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {template.nodes.length} nós
                    </span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {template.edges.length} conexões
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleLoadTemplate}
            disabled={!selectedTemplate}
          >
            Carregar Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
