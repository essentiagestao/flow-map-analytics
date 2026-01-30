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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useFunnelStore } from '@/lib/store/funnelStore';
import { AlignmentToolbar } from './AlignmentToolbar';
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

const CanvasComponent = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { 
    nodes: storeNodes, 
    edges: storeEdges, 
    addNode, 
    addEdge: storeAddEdge,
    setSelectedNodeId,
    setSelectedNodeIds,
    selectedNodeId,
    selectedNodeIds,
    setNodes,
    setEdges,
    updateNode,
  } = useFunnelStore();
  
  const [nodes, setLocalNodes, onNodesChange] = useNodesState([]);
  const [edges, setLocalEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();

  // Sync store changes to local state and apply selection
  useEffect(() => {
    const nodesWithSelection = storeNodes.map(node => ({
      ...node,
      selected: selectedNodeIds.includes(node.id) || selectedNodeId === node.id,
    }));
    setLocalNodes(nodesWithSelection);
  }, [storeNodes, selectedNodeId, selectedNodeIds, setLocalNodes]);

  useEffect(() => {
    setLocalEdges(storeEdges);
  }, [storeEdges, setLocalEdges]);

  // Custom onNodesChange to handle resize and selection properly
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // Filter out selection changes - we handle selection ourselves
    const nonSelectionChanges = changes.filter(change => change.type !== 'select');
    
    // Apply non-selection changes locally
    if (nonSelectionChanges.length > 0) {
      onNodesChange(nonSelectionChanges);
    }
    
    // Handle dimension changes (resize)
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

  // Sync local changes to store (position changes)
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Only sync position changes, not selection
      const storeNodesPositions = storeNodes.map(n => ({ id: n.id, position: n.position }));
      const localNodesPositions = nodes.map(n => ({ id: n.id, position: n.position }));
      
      if (JSON.stringify(storeNodesPositions) !== JSON.stringify(localNodesPositions)) {
        const updatedNodes = nodes.map(n => {
          const { selected, ...rest } = n as any;
          return rest;
        });
        setNodes(updatedNodes);
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [nodes, storeNodes, setNodes]);

  useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);

  const onConnect = useCallback((params: Connection) => {
    const newEdge: Edge = {
      id: `e${params.source}-${params.target}`,
      source: params.source!,
      target: params.target!,
      type: 'smoothstep',
      style: { 
        stroke: 'hsl(var(--muted-foreground))', 
        strokeWidth: 2,
      },
      animated: false,
    };
    storeAddEdge(newEdge);
  }, [storeAddEdge]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    const nodeType = event.dataTransfer.getData('application/reactflow');
    const category = event.dataTransfer.getData('application/category') as NodeCategory;

    if (!nodeType || !reactFlowBounds || !category) {
      return;
    }

    const position = screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
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
      },
    };

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
  }, [setSelectedNodeId, setSelectedNodeIds]);

  // Handle selection change for multi-select (box selection)
  const onSelectionChange = useCallback(({ nodes: selectedNodes }: OnSelectionChangeParams) => {
    if (selectedNodes.length > 1) {
      setSelectedNodeIds(selectedNodes.map(n => n.id));
    } else if (selectedNodes.length === 1) {
      setSelectedNodeId(selectedNodes[0].id);
    }
    // Don't clear selection here - let onPaneClick handle that
  }, [setSelectedNodeId, setSelectedNodeIds]);

  // Expose zoom functions to parent via global
  useEffect(() => {
    (window as any).reactFlowZoomIn = zoomIn;
    (window as any).reactFlowZoomOut = zoomOut;
    (window as any).reactFlowFitView = () => fitView();
  }, [zoomIn, zoomOut, fitView]);

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <AlignmentToolbar />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
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
          type: 'smoothstep',
          style: { 
            stroke: 'hsl(var(--muted-foreground))', 
            strokeWidth: 2,
          },
          animated: false,
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
