'use client';

import { useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
  NodeChange,
  OnSelectionChangeParams,
  BackgroundVariant,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useFunnelStore } from '@/lib/store/funnelStore';
import { AlignmentToolbar } from './AlignmentToolbar';
import { ConversionFunnelPanel } from './ConversionFunnelPanel';
import { getDefaultMetrics } from '@/lib/utils/defaultMetrics';
import { recalculateSplitRatios } from '@/lib/utils/splitRatioUtils';
import { 
  TrafficNode, 
  PageNode, 
  CommunicationNode, 
  EventNode,
  getNodeConfig,
  NodeCategory,
} from './nodes';

const nodeTypes = {
  traffic: TrafficNode,
  page: PageNode,
  communication: CommunicationNode,
  event: EventNode,
};

const categoryToNodeType: Record<NodeCategory, keyof typeof nodeTypes> = {
  traffic: 'traffic',
  page: 'page',
  communication: 'communication',
  event: 'event',
};

// Custom edge component with selection support
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
  source,
}: EdgeProps) => {
  const { selectedEdgeId, setSelectedEdgeId, edges } = useFunnelStore();
  const isSelected = selected || selectedEdgeId === id;
  const isDashed = data?.style === 'dashed';
  
  // Check if source has multiple outgoing edges
  const sourceOutgoing = edges.filter(e => e.source === source);
  const hasSplit = sourceOutgoing.length > 1;
  const splitPercent = Number(data?.splitPercent || 100);
  
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Invisible wider path for easier clicking */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedEdgeId(id);
        }}
      />
      {/* Visible edge */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        strokeWidth={isSelected ? 3 : 2}
        stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
        strokeDasharray={isDashed ? '8 4' : undefined}
        className="transition-all duration-200 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedEdgeId(id);
        }}
      />
      {/* Split percentage label */}
      {hasSplit && (
        <foreignObject
          x={labelX - 16}
          y={labelY - 10}
          width={32}
          height={20}
          className="pointer-events-none"
        >
          <div className="flex items-center justify-center w-full h-full">
            <span className="text-[9px] font-bold bg-card border border-border rounded px-1 py-0.5 text-foreground shadow-sm">
              {splitPercent}%
            </span>
          </div>
        </foreignObject>
      )}
    </>
  );
};

const edgeTypes = {
  custom: CustomEdge,
};

const CanvasComponent = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // Track drag state to prevent store from overwriting local positions during drag
  const isDraggingRef = useRef(false);
  // Track last store sync to prevent loops
  const lastStoreSyncRef = useRef<string>('');
  
  const { 
    nodes: storeNodes, 
    edges: storeEdges, 
    addNode, 
    addEdge: storeAddEdge,
    setSelectedNodeId,
    setSelectedNodeIds,
    setSelectedEdgeId,
    selectedNodeId,
    selectedNodeIds,
    selectedEdgeId,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    updateNode,
    pushHistory,
  } = useFunnelStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();

  /**
   * SYNC STRATEGY:
   * - Store is the source of truth for node DATA (label, nodeType, url, etc.)
   * - React Flow is the source of truth for node POSITION during drag
   * - On drag end, positions sync back to store
   * - Selection state is derived from store's selectedNodeId/selectedNodeIds
   */

  // Sync store nodes to React Flow local state
  // Key: preserve React Flow's internal metadata and positions during drag
  useEffect(() => {
    const storeKey = JSON.stringify(storeNodes.map(n => n.id).sort());
    
    setNodes(currentLocalNodes => {
      // Create a map of current local nodes for quick lookup
      const localNodeMap = new Map(currentLocalNodes.map(n => [n.id, n]));
      const storeNodeIds = new Set(storeNodes.map(n => n.id));
      
      // Build the new nodes array
      const newNodes: Node[] = [];
      
      for (const storeNode of storeNodes) {
        const localNode = localNodeMap.get(storeNode.id);
        const isSelected = selectedNodeIds.includes(storeNode.id) || selectedNodeId === storeNode.id;
        
        if (localNode) {
          // Node exists locally - preserve React Flow's internal state and position during drag
          newNodes.push({
            ...localNode,
            // Always update data from store
            data: storeNode.data,
            type: storeNode.type,
            // Update position only if NOT dragging
            position: isDraggingRef.current ? localNode.position : storeNode.position,
            // Update selection
            selected: isSelected,
          });
        } else {
          // New node from store - add it fresh
          newNodes.push({
            ...storeNode,
            selected: isSelected,
          });
        }
      }
      
      // Check if anything changed
      if (newNodes.length === currentLocalNodes.length) {
        const hasChanges = newNodes.some((newNode, i) => {
          const oldNode = currentLocalNodes.find(n => n.id === newNode.id);
          if (!oldNode) return true;
          return (
            oldNode.selected !== newNode.selected ||
            (!isDraggingRef.current && (
              oldNode.position.x !== newNode.position.x ||
              oldNode.position.y !== newNode.position.y
            )) ||
            JSON.stringify(oldNode.data) !== JSON.stringify(newNode.data)
          );
        });
        if (!hasChanges) return currentLocalNodes;
      }
      
      return newNodes;
    });
  }, [storeNodes, selectedNodeId, selectedNodeIds, setNodes]);

  // Sync edges from store
  useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges, setEdges]);

  // Handle all node changes from React Flow (position, dimensions, add, remove, select)
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // Filter out selection changes - we handle selection through our store
    const nonSelectionChanges = changes.filter(change => change.type !== 'select');
    
    // Apply changes to local React Flow state
    if (nonSelectionChanges.length > 0) {
      onNodesChange(nonSelectionChanges);
    }
    
    // Sync dimension changes (resize) to store immediately
    changes.forEach((change) => {
      if (change.type === 'dimensions' && change.dimensions) {
        const node = nodes.find(n => n.id === change.id);
        if (node) {
          updateNode(change.id, {
            data: {
              ...node.data,
              width: change.dimensions.width,
              height: change.dimensions.height,
            }
          });
        }
      }
    });
  }, [onNodesChange, nodes, updateNode]);

  // Called when node drag STARTS
  const onNodeDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  // Called when node drag ENDS - sync positions to store
  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node, draggedNodes: Node[]) => {
    // Get all dragged nodes (supports multi-select drag)
    const nodesToSync = draggedNodes.length > 0 ? draggedNodes : [node];
    
    // Update store with final positions
    const updatedStoreNodes = storeNodes.map(storeNode => {
      const draggedNode = nodesToSync.find(n => n.id === storeNode.id);
      if (draggedNode) {
        return {
          ...storeNode,
          position: { x: draggedNode.position.x, y: draggedNode.position.y },
        };
      }
      return storeNode;
    });
    
    // Sync to store
    setStoreNodes(updatedStoreNodes);
    pushHistory();
    
    // Reset drag flag after a small delay to ensure store sync completes
    requestAnimationFrame(() => {
      isDraggingRef.current = false;
    });
  }, [storeNodes, setStoreNodes, pushHistory]);

  // Sync edge changes to store
  useEffect(() => {
    const storeEdgeIds = storeEdges.map(e => e.id).sort().join(',');
    const localEdgeIds = edges.map(e => e.id).sort().join(',');
    
    if (localEdgeIds !== storeEdgeIds && localEdgeIds !== lastStoreSyncRef.current) {
      lastStoreSyncRef.current = localEdgeIds;
      setStoreEdges(edges);
    }
  }, [edges, storeEdges, setStoreEdges]);

  const onConnect = useCallback((params: Connection) => {
    const newEdge: Edge = {
      id: `e${params.source}-${params.target}-${Date.now()}`,
      source: params.source!,
      target: params.target!,
      type: 'custom',
      data: { style: 'solid', splitPercent: 100 },
    };
    storeAddEdge(newEdge);
    
    // Recalculate split ratios for all outgoing edges of the source node
    setTimeout(() => {
      const currentEdges = useFunnelStore.getState().edges;
      const updated = recalculateSplitRatios(currentEdges, params.source!);
      setStoreEdges(updated);
    }, 50);
  }, [storeAddEdge, setStoreEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop from palette (new nodes)
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    const nodeType = event.dataTransfer.getData('application/reactflow');
    const category = event.dataTransfer.getData('application/category') as NodeCategory;

    if (!nodeType || !reactFlowBounds || !category) {
      return;
    }

    // Calculate position accounting for canvas offset and zoom
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const config = getNodeConfig(nodeType);
    const reactFlowNodeType = categoryToNodeType[category];
    
    // Default sizes based on category
    const defaultSizes: Record<NodeCategory, { width: number; height: number }> = {
      traffic: { width: 64, height: 64 },
      page: { width: 160, height: 140 },
      communication: { width: 56, height: 56 },
      event: { width: 56, height: 56 },
    };

    const size = defaultSizes[category];
    const defaultMetrics = getDefaultMetrics(nodeType, category);

    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: reactFlowNodeType,
      position,
      data: {
        label: config?.label || 'Novo nó',
        nodeType: nodeType,
        url: '',
        width: size.width,
        height: size.height,
        ...defaultMetrics,
      },
    };

    // Add to store - will sync to local state via useEffect
    addNode(newNode);
    // Select the newly added node
    setSelectedNodeId(newNode.id);
  }, [screenToFlowPosition, addNode, setSelectedNodeId]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedNodeIds([]);
    setSelectedEdgeId(null);
  }, [setSelectedNodeId, setSelectedNodeIds, setSelectedEdgeId]);

  // Handle edge click
  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
  }, [setSelectedEdgeId]);

  // Handle multi-select (box selection)
  const onSelectionChange = useCallback(({ nodes: selectedNodes }: OnSelectionChangeParams) => {
    if (selectedNodes.length > 1) {
      setSelectedNodeIds(selectedNodes.map(n => n.id));
    } else if (selectedNodes.length === 1) {
      setSelectedNodeId(selectedNodes[0].id);
    }
    // Don't clear selection here - onPaneClick handles that
  }, [setSelectedNodeId, setSelectedNodeIds]);

  // Expose zoom functions globally
  useEffect(() => {
    (window as any).reactFlowZoomIn = zoomIn;
    (window as any).reactFlowZoomOut = zoomOut;
    (window as any).reactFlowFitView = () => fitView();
  }, [zoomIn, zoomOut, fitView]);

  // Transform edges to use custom type
  const edgesWithType = edges.map(edge => ({
    ...edge,
    type: 'custom',
    selected: edge.id === selectedEdgeId,
  }));

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <AlignmentToolbar />
      <ConversionFunnelPanel />
      
      <ReactFlow
        nodes={nodes}
        edges={edgesWithType}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onEdgeClick={onEdgeClick}
        onSelectionChange={onSelectionChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={4}
        attributionPosition="bottom-left"
        panOnScroll
        zoomOnScroll
        panOnDrag={[1, 2]}
        selectionOnDrag
        selectNodesOnDrag
        selectionKeyCode={null}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'custom',
          data: { style: 'solid' },
        }}
        className="bg-[hsl(var(--muted))]"
      >
        <Background 
          variant={BackgroundVariant.Dots}
          gap={20} 
          size={1.5}
          color="hsl(var(--muted-foreground) / 0.3)"
          className="!bg-[hsl(var(--background))]"
        />
        <Controls 
          showZoom={false}
          showFitView={false}
          showInteractive={false}
          className="!bg-card !border-border !shadow-lg !rounded-lg"
        />
        <MiniMap 
          nodeColor={(node) => {
            const nodeType = node.data?.nodeType as string;
            const config = getNodeConfig(nodeType);
            return config?.color || 'hsl(var(--muted-foreground))';
          }}
          pannable
          zoomable
          className="!bg-card !border !border-border !rounded-lg !shadow-lg"
          maskColor="hsl(var(--background) / 0.8)"
        />
      </ReactFlow>
    </div>
  );
};

export const Canvas = () => {
  return (
    <ReactFlowProvider>
      <CanvasComponent />
    </ReactFlowProvider>
  );
};
