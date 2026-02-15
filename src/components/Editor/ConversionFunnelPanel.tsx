'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Users, Target, DollarSign, Percent, BarChart3, AlertTriangle } from 'lucide-react';
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
  lostVisitors: number;
  cost?: number;
  color: string;
  isBottleneck?: boolean;
}

export const ConversionFunnelPanel = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const { nodes, edges } = useFunnelStore();

  // Calculate incoming visitors for a node based on edges (recursive)
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
      
      const sourceConfig = getNodeConfig(sourceNode.data?.nodeType as string);
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
      
      // Handle split when source has multiple outgoing edges
      const sourceOutgoingEdges = edges.filter(e => e.source === edge.source);
      if (sourceOutgoingEdges.length > 1) {
        const isSimultaneous = edge.data?.simultaneousDistribution === true;
        if (!isSimultaneous) {
          const edgeSplitPercent = Number(edge.data?.splitPercent || (100 / sourceOutgoingEdges.length));
          outputVisitors = Math.round(outputVisitors * (edgeSplitPercent / 100));
        }
      }
      
      totalVisitors += outputVisitors;
    });
    
    return totalVisitors;
  };

  // Build funnel steps from nodes
  const funnelSteps = useMemo((): FunnelStep[] => {
    if (nodes.length === 0) return [];

    // Find the starting nodes (no incoming edges)
    const targetIds = new Set(edges.map(e => e.target));
    const startNodes = nodes.filter(n => !targetIds.has(n.id));
    
    // Build ordered list by following edges
    const orderedSteps: FunnelStep[] = [];
    const visited = new Set<string>();
    
    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      const config = getNodeConfig(node.data?.nodeType as string);
      const category = config?.category;
      
      let visitors = 0;
      let rate = 0;
      let incomingVisitors = 0;
      
      // Traffic: Use direct visitor count (manual input)
      if (category === 'traffic') {
        visitors = (node.data?.visitors as number) || 0;
        incomingVisitors = visitors; // For display purposes
        rate = 100;
      } 
      // Communication & Events: Use utilizationRate
      else if (category === 'communication' || category === 'event') {
        incomingVisitors = calculateIncomingVisitors(nodeId);
        rate = (node.data?.utilizationRate as number) || 60;
        visitors = incomingVisitors; // Show incoming visitors, rate affects what flows OUT
      }
      // Pages: Use conversionRate
      else {
        incomingVisitors = calculateIncomingVisitors(nodeId);
        rate = (node.data?.conversionRate as number) || 0;
        visitors = incomingVisitors; // Show incoming visitors, rate affects what flows OUT
      }
      
      const lostVisitors = Math.round(incomingVisitors * ((100 - rate) / 100));
      
      orderedSteps.push({
        id: node.id,
        name: (node.data?.label as string) || 'Sem nome',
        nodeType: (node.data?.nodeType as string) || 'unknown',
        visitors,
        conversionRate: rate,
        dropoffRate: 100 - rate,
        lostVisitors,
        cost: node.data?.cost as number | undefined,
        color: config?.color || 'hsl(var(--muted-foreground))',
      });
      
      // Find outgoing edges and traverse
      const outgoingEdges = edges.filter(e => e.source === nodeId);
      outgoingEdges.forEach(edge => traverse(edge.target));
    };
    
    // Start traversal from all start nodes
    startNodes.forEach(node => traverse(node.id));
    
    // Also traverse any nodes not yet visited (disconnected)
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        traverse(node.id);
      }
    });
    
    return orderedSteps;
  }, [nodes, edges]);

  // Calculate totals and identify bottleneck
  const { totals, biggestBottleneck } = useMemo(() => {
    if (funnelSteps.length === 0) return { totals: null, biggestBottleneck: null };
    
    const firstStep = funnelSteps[0];
    const lastStep = funnelSteps[funnelSteps.length - 1];
    const totalCost = funnelSteps.reduce((acc, step) => acc + (step.cost || 0), 0);
    const overallConversion = firstStep.visitors > 0 
      ? Math.round((lastStep.visitors / firstStep.visitors) * 100) 
      : 0;
    const totalLost = firstStep.visitors - lastStep.visitors;
    
    // Find the biggest bottleneck (step with lowest conversion rate, excluding first and 100% steps)
    let bottleneck: FunnelStep | null = null;
    let maxLoss = 0;
    
    funnelSteps.forEach((step, index) => {
      if (index > 0 && step.lostVisitors > maxLoss && step.conversionRate < 100) {
        maxLoss = step.lostVisitors;
        bottleneck = step;
      }
    });
    
    // Mark bottleneck in steps
    if (bottleneck) {
      const bottleneckStep = funnelSteps.find(s => s.id === bottleneck!.id);
      if (bottleneckStep) bottleneckStep.isBottleneck = true;
    }
    
    return {
      totals: {
        totalVisitors: firstStep.visitors,
        totalConversions: lastStep.visitors,
        overallConversion,
        totalCost,
        totalLost,
        cpa: lastStep.visitors > 0 ? Math.round(totalCost / lastStep.visitors) : 0,
      },
      biggestBottleneck: bottleneck,
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
      data-conversion-panel
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
            {/* Bottleneck Alert */}
            {biggestBottleneck && biggestBottleneck.lostVisitors > 0 && (
              <div className="mx-3 mt-3 p-2.5 bg-destructive/10 border border-destructive/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-xs font-semibold text-destructive">Maior Gargalo</span>
                </div>
                <p className="text-[11px] text-foreground">
                  <span className="font-semibold">{biggestBottleneck.name}</span> está perdendo{' '}
                  <span className="font-bold text-destructive">{biggestBottleneck.lostVisitors.toLocaleString()}</span> pessoas ({biggestBottleneck.dropoffRate}% de drop)
                </p>
              </div>
            )}

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
                      <TrendingDown className="w-3 h-3 text-destructive" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Perdidos</span>
                    </div>
                    <p className="text-lg font-bold text-destructive">
                      -{totals.totalLost.toLocaleString()}
                    </p>
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
                        className={cn(
                          "rounded-lg p-2.5 border transition-colors",
                          step.isBottleneck 
                            ? "bg-destructive/10 border-destructive/40" 
                            : "bg-muted/20 border-border/50 hover:border-border"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {step.isBottleneck && (
                              <AlertTriangle className="w-3 h-3 text-destructive" />
                            )}
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: step.color }}
                            />
                            <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
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
                            animate={{ width: `${Math.min(step.conversionRate, 100)}%` }}
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
                              {index === 0 ? 'Início' : `${step.conversionRate}%`}
                            </span>
                          </div>
                          {index > 0 && step.lostVisitors > 0 && (
                            <span className="text-[10px] font-medium text-destructive">
                              -{step.lostVisitors.toLocaleString()} pessoas
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
                💡 Valores calculados automaticamente • Edite as métricas nos nós
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
