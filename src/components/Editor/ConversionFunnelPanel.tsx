'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Users, Target, DollarSign, Percent, BarChart3 } from 'lucide-react';
import { useFunnelStore } from '@/lib/store/funnelStore';
import { getNodeConfig } from './nodes';
import { cn } from '@/lib/utils';

interface FunnelStep {
  id: string;
  name: string;
  nodeType: string;
  visitors: number;
  conversionRate: number;
  dropoffRate: number;
  cost?: number;
  color: string;
}

export const ConversionFunnelPanel = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const { nodes, edges } = useFunnelStore();

  // Build funnel steps from nodes
  const funnelSteps = useMemo((): FunnelStep[] => {
    if (nodes.length === 0) return [];

    // Find the starting nodes (no incoming edges)
    const targetIds = new Set(edges.map(e => e.target));
    const startNodes = nodes.filter(n => !targetIds.has(n.id));
    
    // Build ordered list by following edges
    const orderedSteps: FunnelStep[] = [];
    const visited = new Set<string>();
    let previousVisitors = 0;
    
    const traverse = (nodeId: string, incomingVisitors: number) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      const config = getNodeConfig(node.data?.nodeType as string);
      const category = config?.category;
      
      let visitors = 0;
      let conversionRate = 0;
      
      // Traffic & Communication: Use direct visitor count
      if (category === 'traffic' || category === 'communication') {
        visitors = (node.data?.visitors as number) || 0;
        conversionRate = incomingVisitors > 0 ? 100 : 100; // First step is always 100%
      } 
      // Pages & Events: Calculate visitors from previous step * conversion rate
      else {
        const nodeConversionRate = (node.data?.conversionRate as number) || 0;
        visitors = incomingVisitors > 0 ? Math.round(incomingVisitors * (nodeConversionRate / 100)) : 0;
        conversionRate = nodeConversionRate;
      }
      
      orderedSteps.push({
        id: node.id,
        name: (node.data?.label as string) || 'Sem nome',
        nodeType: (node.data?.nodeType as string) || 'unknown',
        visitors,
        conversionRate,
        dropoffRate: 100 - conversionRate,
        cost: node.data?.cost as number | undefined,
        color: config?.color || 'hsl(var(--muted-foreground))',
      });
      
      // Find outgoing edges and pass current visitors to next nodes
      const outgoingEdges = edges.filter(e => e.source === nodeId);
      outgoingEdges.forEach(edge => traverse(edge.target, visitors));
    };
    
    // Start traversal from all start nodes
    startNodes.forEach(node => {
      const nodeData = nodes.find(n => n.id === node.id);
      const initialVisitors = (nodeData?.data?.visitors as number) || 0;
      traverse(node.id, initialVisitors);
    });
    
    // Also traverse any nodes not yet visited (disconnected)
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        traverse(node.id, 0);
      }
    });
    
    // Recalculate conversion rates between steps for display
    for (let i = 1; i < orderedSteps.length; i++) {
      const prevVisitors = orderedSteps[i - 1].visitors;
      const currentVisitors = orderedSteps[i].visitors;
      if (prevVisitors > 0) {
        orderedSteps[i].conversionRate = Math.round((currentVisitors / prevVisitors) * 100);
        orderedSteps[i].dropoffRate = 100 - orderedSteps[i].conversionRate;
      }
    }
    
    return orderedSteps;
  }, [nodes, edges]);

  // Calculate totals
  const totals = useMemo(() => {
    if (funnelSteps.length === 0) return null;
    
    const firstStep = funnelSteps[0];
    const lastStep = funnelSteps[funnelSteps.length - 1];
    const totalCost = funnelSteps.reduce((acc, step) => acc + (step.cost || 0), 0);
    const overallConversion = firstStep.visitors > 0 
      ? Math.round((lastStep.visitors / firstStep.visitors) * 100) 
      : 0;
    
    return {
      totalVisitors: firstStep.visitors,
      totalConversions: lastStep.visitors,
      overallConversion,
      totalCost,
      cpa: lastStep.visitors > 0 ? Math.round(totalCost / lastStep.visitors) : 0,
    };
  }, [funnelSteps]);

  const getConversionColor = (rate: number) => {
    if (rate >= 70) return 'text-[hsl(142_76%_36%)]';
    if (rate >= 40) return 'text-[hsl(38_92%_50%)]';
    return 'text-destructive';
  };

  const getBarColor = (rate: number) => {
    if (rate >= 70) return 'bg-[hsl(142_76%_36%)]';
    if (rate >= 40) return 'bg-[hsl(38_92%_50%)]';
    return 'bg-destructive';
  };

  if (nodes.length === 0) return null;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "absolute right-4 top-4 z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden",
        "backdrop-blur-sm bg-card/95",
        isMinimized ? "w-auto" : "w-80"
      )}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-muted/50 border-b border-border cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          {!isMinimized && (
            <div>
              <h3 className="text-sm font-semibold text-foreground">Funil de Conversão</h3>
              <p className="text-[10px] text-muted-foreground">Análise de performance</p>
            </div>
          )}
        </div>
        <button className="p-1 hover:bg-muted rounded-md transition-colors">
          {isMinimized ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Summary Cards */}
            {totals && (
              <div className="p-3 border-b border-border">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/30 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Entrada</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{totals.totalVisitors.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Conversões</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{totals.totalConversions.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Percent className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Taxa Total</span>
                    </div>
                    <p className={cn("text-lg font-bold", getConversionColor(totals.overallConversion))}>
                      {totals.overallConversion}%
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <DollarSign className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">CPA</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {totals.cpa > 0 ? `R$${totals.cpa}` : '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Funnel Steps */}
            <div className="p-3">
              <div 
                className="flex items-center justify-between mb-2 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Etapas ({funnelSteps.length})
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                )}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1"
                  >
                    {funnelSteps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-muted/20 rounded-lg p-2.5 border border-border/50 hover:border-border transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: step.color }}
                            />
                            <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
                              {step.name}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-foreground">
                            {step.visitors.toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Conversion bar */}
                        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${step.conversionRate}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={cn("h-full rounded-full", getBarColor(step.conversionRate))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-1">
                          {index > 0 && (
                              step.conversionRate >= 50 ? (
                                <TrendingUp className="w-3 h-3 text-[hsl(142_76%_36%)]" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-destructive" />
                              )
                            )}
                            <span className={cn(
                              "text-[10px] font-medium",
                              index === 0 ? "text-muted-foreground" : getConversionColor(step.conversionRate)
                            )}>
                              {index === 0 ? 'Início' : `${step.conversionRate}% conversão`}
                            </span>
                          </div>
                          {index > 0 && step.dropoffRate > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              -{step.dropoffRate}% drop
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-3 pb-3">
              <p className="text-[9px] text-muted-foreground text-center">
                💡 Selecione um nó e preencha as métricas no painel de propriedades
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
