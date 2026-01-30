'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFunnelStore } from '@/lib/store/funnelStore';
import { getNodeConfig, NodeCategory } from './nodes';
import { Copy, Trash2, Lock, Unlock, Layers, Move, Palette, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

interface PropertiesProps {
  onDelete?: () => void;
}

export const Properties = ({ onDelete }: PropertiesProps) => {
  const { 
    nodes, 
    edges,
    selectedNodeId,
    selectedNodeIds,
    updateNode, 
    removeNode,
    removeNodes,
    addNode,
    setSelectedNodeId 
  } = useFunnelStore();
  
  const selectedNode = nodes.find(node => node.id === selectedNodeId);
  const selectedCount = selectedNodeIds.length;
  
  const [formData, setFormData] = useState({
    label: '',
    url: '',
    meta: 0,
    color: '',
    tags: '',
    notes: '',
    width: 160,
    height: 140,
  });

  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (selectedNode?.data) {
      setFormData({
        label: String(selectedNode.data.label || ''),
        url: String(selectedNode.data.url || ''),
        meta: Number(selectedNode.data.meta || 0),
        color: String(selectedNode.data.color || ''),
        tags: String(selectedNode.data.tags || ''),
        notes: String(selectedNode.data.notes || ''),
        width: Number(selectedNode.data.width || 160),
        height: Number(selectedNode.data.height || 140),
      });
      setIsLocked(Boolean(selectedNode.data.locked));
    }
  }, [selectedNode]);

  const handleInputChange = (field: string, value: string | number) => {
    if (isLocked && field !== 'locked') return;
    
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    if (selectedNodeId) {
      updateNode(selectedNodeId, {
        data: {
          ...selectedNode?.data,
          [field]: value
        }
      });
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number[]) => {
    if (isLocked) return;
    
    const newValue = value[0];
    setFormData(prev => ({ ...prev, [dimension]: newValue }));
    
    if (selectedNodeId) {
      updateNode(selectedNodeId, {
        data: {
          ...selectedNode?.data,
          [dimension]: newValue
        }
      });
    }
  };

  const handleToggleLock = () => {
    const newLocked = !isLocked;
    setIsLocked(newLocked);
    
    if (selectedNodeId) {
      updateNode(selectedNodeId, {
        data: {
          ...selectedNode?.data,
          locked: newLocked
        },
        draggable: !newLocked,
      });
    }
    
    toast.success(newLocked ? 'Nó bloqueado' : 'Nó desbloqueado');
  };

  const handleDuplicate = () => {
    if (!selectedNode) return;
    
    const newNode = {
      ...selectedNode,
      id: `${selectedNode.data.nodeType}-${Date.now()}`,
      position: {
        x: selectedNode.position.x + 50,
        y: selectedNode.position.y + 50
      },
      data: {
        ...selectedNode.data,
        label: `${selectedNode.data.label} (Cópia)`
      }
    };
    
    addNode(newNode);
    toast.success('Nó duplicado');
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete();
    } else {
      // Fallback if no onDelete provided
      if (selectedCount > 1) {
        removeNodes(selectedNodeIds);
        toast.success(`${selectedCount} nós removidos`);
      } else if (selectedNodeId) {
        removeNode(selectedNodeId);
        setSelectedNodeId(null);
        toast.success('Nó removido');
      }
    }
  };

  // Get connections info
  const getConnectionsInfo = () => {
    if (!selectedNodeId) return { incoming: 0, outgoing: 0 };
    
    const incoming = edges.filter(e => e.target === selectedNodeId).length;
    const outgoing = edges.filter(e => e.source === selectedNodeId).length;
    
    return { incoming, outgoing };
  };

  const connections = getConnectionsInfo();
  const config = selectedNode ? getNodeConfig(String(selectedNode.data.nodeType)) : null;

  // Multi-selection panel
  if (selectedCount > 1) {
    return (
      <div className="p-4 h-full">
        <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <Layers className="w-5 h-5" />
          {selectedCount} Nós Selecionados
        </h3>
        
        <Card className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Múltiplos nós selecionados. Use as ações abaixo para gerenciá-los.
          </p>
          
          <div className="space-y-2">
            <Button 
              variant="destructive" 
              onClick={handleDeleteClick}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Deletar {selectedCount} Nós
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Arraste para mover todos juntos</p>
            <p>• Delete para remover todos</p>
            <p>• Clique fora para desselecionar</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!selectedNode) {
    return (
      <div className="p-4 h-full">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Propriedades</h3>
        <Card className="p-4">
          <p className="text-muted-foreground text-sm mb-4">
            Selecione um nó no canvas para editar suas propriedades.
          </p>
          <div className="text-xs text-muted-foreground space-y-2">
            <p className="font-medium">Dicas de uso:</p>
            <p>• Clique e arraste para selecionar múltiplos</p>
            <p>• Shift + clique para adicionar à seleção</p>
            <p>• Delete para remover selecionados</p>
            <p>• Arraste handles para redimensionar</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Propriedades</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleLock}
          title={isLocked ? 'Desbloquear nó' : 'Bloquear nó'}
        >
          {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </Button>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="general" className="text-xs">
            <Settings2 className="w-3 h-3 mr-1" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs">
            <Palette className="w-3 h-3 mr-1" />
            Visual
          </TabsTrigger>
          <TabsTrigger value="position" className="text-xs">
            <Move className="w-3 h-3 mr-1" />
            Posição
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="node-label" className="text-sm font-medium">
                Nome do Nó
              </Label>
              <Input
                id="node-label"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                placeholder="Ex: Landing Page"
                disabled={isLocked}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="node-type" className="text-sm font-medium">
                Tipo
              </Label>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: config?.color || '#94a3b8' }}
                />
                <span className="text-sm">{config?.label || String(selectedNode.data.nodeType)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="node-url" className="text-sm font-medium">
                URL / ID
              </Label>
              <Input
                id="node-url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="https://exemplo.com ou ID único"
                disabled={isLocked}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="node-meta" className="text-sm font-medium">
                Meta de Conversão
              </Label>
              <Input
                id="node-meta"
                type="number"
                value={formData.meta}
                onChange={(e) => handleInputChange('meta', parseInt(e.target.value) || 0)}
                placeholder="Ex: 1000"
                disabled={isLocked}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="node-tags" className="text-sm font-medium">
                Tags (separadas por vírgula)
              </Label>
              <Textarea
                id="node-tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="marketing,conversao,lead"
                rows={2}
                disabled={isLocked}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="node-notes" className="text-sm font-medium">
                Notas / Observações
              </Label>
              <Textarea
                id="node-notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Anotações sobre este nó..."
                rows={3}
                disabled={isLocked}
              />
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="node-color" className="text-sm font-medium">
                Cor / Categoria
              </Label>
              <Select 
                value={formData.color} 
                onValueChange={(value) => handleInputChange('color', value)}
                disabled={isLocked}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma cor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="red">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Vermelho
                    </div>
                  </SelectItem>
                  <SelectItem value="blue">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      Azul
                    </div>
                  </SelectItem>
                  <SelectItem value="green">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Verde
                    </div>
                  </SelectItem>
                  <SelectItem value="yellow">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      Amarelo
                    </div>
                  </SelectItem>
                  <SelectItem value="purple">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      Roxo
                    </div>
                  </SelectItem>
                  <SelectItem value="orange">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      Laranja
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Largura: {formData.width}px</Label>
              <Slider
                value={[formData.width]}
                onValueChange={(value) => handleSizeChange('width', value)}
                min={80}
                max={300}
                step={10}
                disabled={isLocked}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Altura: {formData.height}px</Label>
              <Slider
                value={[formData.height]}
                onValueChange={(value) => handleSizeChange('height', value)}
                min={60}
                max={250}
                step={10}
                disabled={isLocked}
              />
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="position" className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Posição X</Label>
                <Input
                  type="number"
                  value={Math.round(selectedNode.position.x)}
                  onChange={(e) => {
                    if (isLocked) return;
                    updateNode(selectedNodeId!, {
                      position: {
                        ...selectedNode.position,
                        x: parseInt(e.target.value) || 0
                      }
                    });
                  }}
                  disabled={isLocked}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Posição Y</Label>
                <Input
                  type="number"
                  value={Math.round(selectedNode.position.y)}
                  onChange={(e) => {
                    if (isLocked) return;
                    updateNode(selectedNodeId!, {
                      position: {
                        ...selectedNode.position,
                        y: parseInt(e.target.value) || 0
                      }
                    });
                  }}
                  disabled={isLocked}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <Label className="text-sm font-medium mb-2 block">Conexões</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-muted rounded-md text-center">
                  <div className="font-semibold text-lg">{connections.incoming}</div>
                  <div className="text-xs text-muted-foreground">Entradas</div>
                </div>
                <div className="p-2 bg-muted rounded-md text-center">
                  <div className="font-semibold text-lg">{connections.outgoing}</div>
                  <div className="text-xs text-muted-foreground">Saídas</div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4 pt-4 border-t border-border space-y-2">
        <Button 
          variant="outline" 
          onClick={handleDuplicate}
          className="w-full"
          disabled={isLocked}
        >
          <Copy className="w-4 h-4 mr-2" />
          Duplicar Nó
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={handleDeleteClick}
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Deletar Nó
        </Button>
      </div>
      
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <h4 className="text-sm font-medium mb-2 text-foreground">Info do Nó</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>ID: <span className="font-mono">{selectedNode.id}</span></div>
          <div>Tipo React Flow: {selectedNode.type}</div>
          <div>Status: {isLocked ? '🔒 Bloqueado' : '🔓 Desbloqueado'}</div>
        </div>
      </div>
    </div>
  );
};