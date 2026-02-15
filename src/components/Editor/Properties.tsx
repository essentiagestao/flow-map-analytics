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
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Trash2, Lock, Unlock, Layers, Move, Palette, Settings2, ArrowRight, Users, Percent, BarChart3, GitBranch } from 'lucide-react';
import { toast } from 'sonner';
import { updateEdgeSplitPercent, recalculateSplitRatios, isSimultaneousDistribution, toggleSimultaneousDistribution } from '@/lib/utils/splitRatioUtils';

interface PropertiesProps {
  onDelete?: () => void;
}

export const Properties = ({ onDelete }: PropertiesProps) => {
  const { 
    nodes, 
    edges,
    selectedNodeId,
    selectedNodeIds,
    selectedEdgeId,
    updateNode, 
    updateEdge,
    removeNode,
    removeNodes,
    removeEdge,
    addNode,
    setSelectedNodeId,
    setSelectedEdgeId,
  } = useFunnelStore();
  
  const selectedNode = nodes.find(node => node.id === selectedNodeId);
  const selectedEdge = edges.find(edge => edge.id === selectedEdgeId);
  const selectedCount = selectedNodeIds.length;
  
  const [formData, setFormData] = useState({
    label: '',
    url: '',
    meta: 0,
    visitors: 0,
    calculatedVisitors: 0,
    conversionRate: 0,
    utilizationRate: 60,
    splitRatio: 60,
    cost: 0,
    color: '',
    tags: '',
    notes: '',
    width: 160,
    height: 140,
  });

  const [isLocked, setIsLocked] = useState(false);

  // Calculate visitors for nodes that receive from previous nodes (recursive)
  const calculateIncomingVisitors = (nodeId: string, visited: Set<string> = new Set()): number => {
    // Prevent infinite loops
    if (visited.has(nodeId)) return 0;
    visited.add(nodeId);
    
    const incomingEdges = edges.filter(e => e.target === nodeId);
    if (incomingEdges.length === 0) return 0;
    
    let totalVisitors = 0;
    
    incomingEdges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      if (!sourceNode) return;
      
      const sourceConfig = getNodeConfig(String(sourceNode.data?.nodeType));
      const sourceCategory = sourceConfig?.category;
      
      // Get source node's base visitors (before applying its own rate)
      let sourceBaseVisitors = 0;
      
      if (sourceCategory === 'traffic') {
        // Traffic nodes have manual visitor input
        sourceBaseVisitors = Number(sourceNode.data?.visitors || 0);
      } else {
        // Other nodes: recursively calculate their incoming visitors
        sourceBaseVisitors = calculateIncomingVisitors(edge.source, new Set(visited));
      }
      
      // Apply source node's rate to calculate what flows OUT of that node
      const sourceRate = Number(
        sourceNode.data?.conversionRate || 
        sourceNode.data?.utilizationRate || 
        100
      );
      
      let outputVisitors = Math.round(sourceBaseVisitors * (sourceRate / 100));
      
      // Check if source has multiple outgoing edges (split scenario)
      const sourceOutgoingEdges = edges.filter(e => e.source === edge.source);
      if (sourceOutgoingEdges.length > 1) {
        const isSimultaneous = edge.data?.simultaneousDistribution === true;
        if (!isSimultaneous) {
          const edgeSplitPercent = Number(edge.data?.splitPercent || (100 / sourceOutgoingEdges.length));
          outputVisitors = Math.round(outputVisitors * (edgeSplitPercent / 100));
        }
        // If simultaneous, 100% flows through each path
      }
      
      totalVisitors += outputVisitors;
    });
    
    return totalVisitors;
  };

  // Memoize calculated visitors to avoid recalculating on every render
  const calculatedVisitors = selectedNode ? calculateIncomingVisitors(selectedNode.id) : 0;

  useEffect(() => {
    if (selectedNode?.data) {
      setFormData({
        label: String(selectedNode.data.label || ''),
        url: String(selectedNode.data.url || ''),
        meta: Number(selectedNode.data.meta || 0),
        visitors: Number(selectedNode.data.visitors || 0),
        calculatedVisitors,
        conversionRate: Number(selectedNode.data.conversionRate || 0),
        utilizationRate: Number(selectedNode.data.utilizationRate || 60),
        splitRatio: Number(selectedNode.data.splitRatio || 60),
        cost: Number(selectedNode.data.cost || 0),
        color: String(selectedNode.data.color || ''),
        tags: String(selectedNode.data.tags || ''),
        notes: String(selectedNode.data.notes || ''),
        width: Number(selectedNode.data.width || 160),
        height: Number(selectedNode.data.height || 140),
      });
      setIsLocked(Boolean(selectedNode.data.locked));
    }
  }, [selectedNode, calculatedVisitors]);

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

  // Get source and target node labels for edge
  const getEdgeNodeLabels = () => {
    if (!selectedEdge) return { source: '', target: '' };
    const sourceNode = nodes.find(n => n.id === selectedEdge.source);
    const targetNode = nodes.find(n => n.id === selectedEdge.target);
    return {
      source: sourceNode?.data?.label as string || selectedEdge.source,
      target: targetNode?.data?.label as string || selectedEdge.target,
    };
  };

  // Edge properties panel
  if (selectedEdge) {
    const edgeLabels = getEdgeNodeLabels();
    const edgeStyle = (selectedEdge.data?.style as string) || 'solid';
    
    // Get sibling edges (same source) for split ratio editing
    const sourceNode = nodes.find(n => n.id === selectedEdge.source);
    const siblingEdges = edges.filter(e => e.source === selectedEdge.source);
    const hasSplit = siblingEdges.length > 1;

    return (
      <div className="p-4 h-full overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <ArrowRight className="w-5 h-5" />
          Conexão
        </h3>
        
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Conexão</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium truncate">{edgeLabels.source}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium truncate">{edgeLabels.target}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edge-style" className="text-sm font-medium">
              Estilo da Linha
            </Label>
            <Select 
              value={edgeStyle} 
              onValueChange={(value) => {
                updateEdge(selectedEdge.id, {
                  data: { ...selectedEdge.data, style: value }
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-foreground" />
                    Linha Contínua
                  </div>
                </SelectItem>
                <SelectItem value="dashed">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 border-t-2 border-dashed border-foreground" />
                    Linha Tracejada
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Split Ratio Controls */}
          {hasSplit && (() => {
            const isSimultaneous = isSimultaneousDistribution(edges, selectedEdge.source);
            
            return (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm font-semibold">Distribuição de Saída</Label>
                </div>
                
                {/* Simultaneous distribution toggle */}
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border">
                  <Checkbox
                    id="simultaneous"
                    checked={isSimultaneous}
                    onCheckedChange={(checked) => {
                      const updated = toggleSimultaneousDistribution(edges, selectedEdge.source, !!checked);
                      useFunnelStore.getState().setEdges(updated);
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor="simultaneous" className="text-xs font-medium cursor-pointer">
                      Distribuição simultânea
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Envia 100% do volume para todos os caminhos
                    </p>
                  </div>
                </div>

                {!isSimultaneous && (
                  <>
                    <p className="text-[10px] text-muted-foreground">
                      Defina como as pessoas são distribuídas entre as {siblingEdges.length} saídas de &quot;{String(sourceNode?.data?.label)}&quot;
                    </p>
                    
                    {siblingEdges.map((sibEdge) => {
                      const targetNode = nodes.find(n => n.id === sibEdge.target);
                      const percent = Number(sibEdge.data?.splitPercent || Math.floor(100 / siblingEdges.length));
                      const isCurrentEdge = sibEdge.id === selectedEdge.id;
                      
                      return (
                        <div 
                          key={sibEdge.id} 
                          className={`p-2.5 rounded-lg border ${isCurrentEdge ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
                              → {String(targetNode?.data?.label || sibEdge.target)}
                            </span>
                            <span className="text-xs font-bold text-foreground">{percent}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Slider
                              value={[percent]}
                              onValueChange={(value) => {
                                const updated = updateEdgeSplitPercent(edges, sibEdge.id, value[0]);
                                useFunnelStore.getState().setEdges(updated);
                              }}
                              min={1}
                              max={99}
                              step={1}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              value={percent}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                const updated = updateEdgeSplitPercent(edges, sibEdge.id, val);
                                useFunnelStore.getState().setEdges(updated);
                              }}
                              className="w-14 text-center text-xs h-7"
                              min={1}
                              max={99}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            );
          })()}

          <div className="pt-4">
            <Button 
              variant="destructive" 
              onClick={() => {
                const sourceId = selectedEdge.source;
                removeEdge(selectedEdge.id);
                setSelectedEdgeId(null);
                toast.success('Conexão removida');
                // Recalculate split ratios for remaining edges
                setTimeout(() => {
                  const currentEdges = useFunnelStore.getState().edges;
                  const updated = recalculateSplitRatios(currentEdges, sourceId);
                  useFunnelStore.getState().setEdges(updated);
                }, 50);
              }}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remover Conexão
            </Button>
          </div>
        </Card>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2 text-foreground">Dica</h4>
          <p className="text-xs text-muted-foreground">
            {hasSplit 
              ? 'Ajuste os percentuais para controlar como os visitantes são distribuídos entre as saídas.'
              : 'Para criar novas conexões, passe o mouse sobre um nó e arraste a partir dos pontos de conexão que aparecem nas laterais.'
            }
          </p>
        </div>
      </div>
    );
  }

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

            {/* Metrics Section - Different fields based on node category */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Métricas</span>
              </div>
              
              {/* Traffic: Manual quantity of people */}
              {config?.category === 'traffic' && (
                <>
                  <div className="space-y-2 mb-3">
                    <Label htmlFor="node-visitors" className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      Quantidade de Pessoas
                    </Label>
                    <Input
                      id="node-visitors"
                      type="number"
                      value={formData.visitors}
                      onChange={(e) => handleInputChange('visitors', parseInt(e.target.value) || 0)}
                      placeholder="Ex: 1000"
                      disabled={isLocked}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Total de visitantes desta fonte de tráfego
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="node-cost" className="text-sm font-medium">
                      Custo (R$)
                    </Label>
                    <Input
                      id="node-cost"
                      type="number"
                      value={formData.cost}
                      onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                      placeholder="Ex: 500"
                      disabled={isLocked}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Investimento total nesta etapa
                    </p>
                  </div>
                </>
              )}
              
              {/* Communication: Calculated visitors + Utilization rate */}
              {config?.category === 'communication' && (
                <>
                  <div className="space-y-2 mb-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      Pessoas Recebidas (calculado)
                    </Label>
                    <div className="p-2.5 bg-muted/50 rounded-md border border-border">
                      <span className="text-lg font-bold text-foreground">
                        {formData.calculatedVisitors.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">pessoas</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Calculado automaticamente baseado nas conexões anteriores
                    </p>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <Label htmlFor="node-utilization-rate" className="text-sm font-medium flex items-center gap-2">
                      <Percent className="w-3.5 h-3.5 text-muted-foreground" />
                      Taxa de Aproveitamento (%)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[formData.utilizationRate]}
                        onValueChange={(value) => handleInputChange('utilizationRate', value[0])}
                        min={0}
                        max={100}
                        step={1}
                        disabled={isLocked}
                        className="flex-1"
                      />
                      <Input
                        id="node-utilization-rate"
                        type="number"
                        value={formData.utilizationRate}
                        onChange={(e) => handleInputChange('utilizationRate', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-16 text-center"
                        min={0}
                        max={100}
                        disabled={isLocked}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Percentual de pessoas que interagem com esta comunicação
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="node-cost-comm" className="text-sm font-medium">
                      Custo (R$)
                    </Label>
                    <Input
                      id="node-cost-comm"
                      type="number"
                      value={formData.cost}
                      onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                      placeholder="Ex: 50"
                      disabled={isLocked}
                    />
                  </div>
                </>
              )}
              
              {/* Pages: Calculated visitors + Conversion rate */}
              {config?.category === 'page' && (
                <>
                  <div className="space-y-2 mb-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      Visitantes (calculado)
                    </Label>
                    <div className="p-2.5 bg-muted/50 rounded-md border border-border">
                      <span className="text-lg font-bold text-foreground">
                        {formData.calculatedVisitors.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">pessoas</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Calculado automaticamente baseado nas conexões anteriores
                    </p>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <Label htmlFor="node-conversion-rate" className="text-sm font-medium flex items-center gap-2">
                      <Percent className="w-3.5 h-3.5 text-muted-foreground" />
                      Taxa de Conversão (%)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[formData.conversionRate]}
                        onValueChange={(value) => handleInputChange('conversionRate', value[0])}
                        min={0}
                        max={100}
                        step={1}
                        disabled={isLocked}
                        className="flex-1"
                      />
                      <Input
                        id="node-conversion-rate"
                        type="number"
                        value={formData.conversionRate}
                        onChange={(e) => handleInputChange('conversionRate', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-16 text-center"
                        min={0}
                        max={100}
                        disabled={isLocked}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Percentual de visitantes que avançam para a próxima etapa
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="node-cost-page" className="text-sm font-medium">
                      Custo da Página (R$)
                    </Label>
                    <Input
                      id="node-cost-page"
                      type="number"
                      value={formData.cost}
                      onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                      placeholder="Ex: 0"
                      disabled={isLocked}
                    />
                  </div>
                </>
              )}
              
              {/* Events: Calculated visitors + Utilization rate */}
              {config?.category === 'event' && (
                <>
                  <div className="space-y-2 mb-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      Pessoas (calculado)
                    </Label>
                    <div className="p-2.5 bg-muted/50 rounded-md border border-border">
                      <span className="text-lg font-bold text-foreground">
                        {formData.calculatedVisitors.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">pessoas</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Calculado automaticamente baseado nas conexões anteriores
                    </p>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <Label htmlFor="node-utilization-rate-event" className="text-sm font-medium flex items-center gap-2">
                      <Percent className="w-3.5 h-3.5 text-muted-foreground" />
                      Taxa de Aproveitamento (%)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[formData.utilizationRate]}
                        onValueChange={(value) => handleInputChange('utilizationRate', value[0])}
                        min={0}
                        max={100}
                        step={1}
                        disabled={isLocked}
                        className="flex-1"
                      />
                      <Input
                        id="node-utilization-rate-event"
                        type="number"
                        value={formData.utilizationRate}
                        onChange={(e) => handleInputChange('utilizationRate', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-16 text-center"
                        min={0}
                        max={100}
                        disabled={isLocked}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Percentual de aproveitamento deste evento (padrão: 60%)
                    </p>
                  </div>
                </>
              )}
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