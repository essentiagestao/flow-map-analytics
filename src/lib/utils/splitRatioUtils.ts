import { Edge } from '@xyflow/react';

/**
 * Check if a source node's outgoing edges are in simultaneous mode.
 */
export const isSimultaneousDistribution = (edges: Edge[], sourceNodeId: string): boolean => {
  const outgoing = edges.filter(e => e.source === sourceNodeId);
  return outgoing.some(e => e.data?.simultaneousDistribution === true);
};

/**
 * Toggle simultaneous distribution for all outgoing edges of a source node.
 */
export const toggleSimultaneousDistribution = (
  edges: Edge[],
  sourceNodeId: string,
  enabled: boolean
): Edge[] => {
  return edges.map(e => {
    if (e.source === sourceNodeId) {
      return { ...e, data: { ...e.data, simultaneousDistribution: enabled, splitPercent: 100 } };
    }
    return e;
  });
};

/**
 * Recalculate split percentages for all outgoing edges of a node.
 * Distributes evenly when no valid ratios exist.
 * Skips recalculation if simultaneous distribution is enabled.
 */
export const recalculateSplitRatios = (
  edges: Edge[],
  sourceNodeId: string
): Edge[] => {
  // If simultaneous mode is on, keep all at 100%
  if (isSimultaneousDistribution(edges, sourceNodeId)) {
    return edges.map(e => 
      e.source === sourceNodeId 
        ? { ...e, data: { ...e.data, splitPercent: 100 } }
        : e
    );
  }

  const outgoing = edges.filter(e => e.source === sourceNodeId);
  if (outgoing.length <= 1) {
    return edges.map(e => 
      e.source === sourceNodeId 
        ? { ...e, data: { ...e.data, splitPercent: 100 } }
        : e
    );
  }

  // Check if existing ratios sum to ~100
  const existingPercents = outgoing.map(e => Number(e.data?.splitPercent || 0));
  const total = existingPercents.reduce((a, b) => a + b, 0);
  
  if (total > 0 && Math.abs(total - 100) < 2) {
    return edges;
  }

  // Distribute evenly
  const evenPercent = Math.floor(100 / outgoing.length);
  const remainder = 100 - evenPercent * outgoing.length;
  const outgoingIds = outgoing.map(e => e.id);

  return edges.map(e => {
    const outIdx = outgoingIds.indexOf(e.id);
    if (outIdx !== -1) {
      const percent = evenPercent + (outIdx < remainder ? 1 : 0);
      return { ...e, data: { ...e.data, splitPercent: percent } };
    }
    return e;
  });
};

/**
 * Update one edge's split percent, redistribute remainder proportionally among siblings.
 */
export const updateEdgeSplitPercent = (
  edges: Edge[],
  edgeId: string,
  newPercent: number
): Edge[] => {
  const edge = edges.find(e => e.id === edgeId);
  if (!edge) return edges;

  const siblings = edges.filter(e => e.source === edge.source && e.id !== edgeId);
  if (siblings.length === 0) return edges;

  const clamped = Math.max(1, Math.min(100 - siblings.length, newPercent));
  const remaining = 100 - clamped;
  
  const siblingTotal = siblings.reduce((sum, s) => sum + Number(s.data?.splitPercent || 0), 0);
  const siblingIds = siblings.map(s => s.id);
  
  // Calculate new sibling percentages proportionally
  const newSiblingPercents: Record<string, number> = {};
  let assigned = 0;
  
  siblingIds.forEach((id, i) => {
    const sib = siblings[i];
    if (i === siblingIds.length - 1) {
      newSiblingPercents[id] = Math.max(1, remaining - assigned);
    } else {
      const ratio = siblingTotal > 0 
        ? Number(sib.data?.splitPercent || 0) / siblingTotal 
        : 1 / siblings.length;
      const val = Math.max(1, Math.round(remaining * ratio));
      newSiblingPercents[id] = val;
      assigned += val;
    }
  });

  return edges.map(e => {
    if (e.id === edgeId) {
      return { ...e, data: { ...e.data, splitPercent: clamped } };
    }
    if (newSiblingPercents[e.id] !== undefined) {
      return { ...e, data: { ...e.data, splitPercent: newSiblingPercents[e.id] } };
    }
    return e;
  });
};
