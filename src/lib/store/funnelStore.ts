import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';

interface FunnelHistory {
  nodes: Node[];
  edges: Edge[];
}

interface FunnelStore {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  history: FunnelHistory[];
  historyIndex: number;
  dirty: boolean;
  lastSaved: Date | null;
  isSaving: boolean;
  
  // Actions
  addNode: (node: Node) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  removeNode: (id: string) => void;
  removeNodes: (ids: string[]) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  clear: () => void;
  loadSample: () => void;
  saveToLocal: () => void;
  loadFromLocal: () => void;
  exportJSON: () => void;
  importJSON: (data: any) => void;
  undo: () => void;
  redo: () => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  pushHistory: () => void;
  setLastSaved: (date: Date | null) => void;
  setIsSaving: (saving: boolean) => void;
}

const STORAGE_KEY = 'funnel:current';

export const useFunnelStore = create<FunnelStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedNodeIds: [],
  history: [],
  historyIndex: -1,
  dirty: false,
  lastSaved: null,
  isSaving: false,

  addNode: (node) => {
    set((state) => {
      const newState = {
        nodes: [...state.nodes, node],
        dirty: true,
      };
      return newState;
    });
    get().pushHistory();
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
      dirty: true,
    }));
  },

  removeNode: (id) => {
    set((state) => {
      const newState = {
        nodes: state.nodes.filter((node) => node.id !== id),
        edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        dirty: true,
      };
      return newState;
    });
    get().pushHistory();
  },

  addEdge: (edge) => {
    set((state) => ({
      edges: [...state.edges, edge],
      dirty: true,
    }));
    get().pushHistory();
  },

  removeEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
      dirty: true,
    }));
    get().pushHistory();
  },

  setSelectedNodeId: (id) => {
    set({ selectedNodeId: id, selectedNodeIds: id ? [id] : [] });
  },

  setSelectedNodeIds: (ids) => {
    set({ 
      selectedNodeIds: ids, 
      selectedNodeId: ids.length > 0 ? ids[0] : null 
    });
  },

  removeNodes: (ids) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => !ids.includes(node.id)),
      edges: state.edges.filter((edge) => !ids.includes(edge.source) && !ids.includes(edge.target)),
      selectedNodeId: null,
      selectedNodeIds: [],
      dirty: true,
    }));
    get().pushHistory();
  },

  clear: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      dirty: false,
    });
    get().pushHistory();
  },

  loadSample: () => {
    const sampleNodes: Node[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Anúncio Facebook',
          nodeType: 'ad',
          url: 'https://facebook.com/ads/123',
          meta: 1000,
          color: 'blue',
          tags: 'marketing,facebook'
        },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 300, y: 100 },
        data: { 
          label: 'Landing Page',
          nodeType: 'page',
          url: 'https://exemplo.com/lp',
          meta: 500,
          color: 'green',
          tags: 'conversao,landing'
        },
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 500, y: 100 },
        data: { 
          label: 'Formulário Contato',
          nodeType: 'form',
          url: '/contato',
          meta: 100,
          color: 'purple',
          tags: 'lead,formulario'
        },
      },
      {
        id: '4',
        type: 'custom',
        position: { x: 700, y: 50 },
        data: { 
          label: 'Aprovado?',
          nodeType: 'decision',
          url: '',
          meta: 80,
          color: 'yellow',
          tags: 'decisao,qualificacao'
        },
      },
      {
        id: '5',
        type: 'custom',
        position: { x: 900, y: 50 },
        data: { 
          label: 'Página Obrigado',
          nodeType: 'page',
          url: '/obrigado',
          meta: 80,
          color: 'green',
          tags: 'sucesso,conversao'
        },
      },
    ];

    const sampleEdges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
      { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
      { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
      { id: 'e4-5', source: '4', target: '5', type: 'smoothstep' },
    ];

    set({
      nodes: sampleNodes,
      edges: sampleEdges,
      selectedNodeId: null,
      dirty: true,
    });
    get().pushHistory();
  },

  saveToLocal: () => {
    const { nodes, edges } = get();
    const data = { nodes, edges, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    set({ dirty: false });
  },

  loadFromLocal: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        set({
          nodes: data.nodes || [],
          edges: data.edges || [],
          selectedNodeId: null,
          dirty: false,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
    }
  },

  exportJSON: () => {
    const { nodes, edges } = get();
    const data = {
      funnel: { nodes, edges },
      exported: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `funil-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importJSON: (data) => {
    try {
      if (data.funnel && data.funnel.nodes && data.funnel.edges) {
        set({
          nodes: data.funnel.nodes,
          edges: data.funnel.edges,
          selectedNodeId: null,
          dirty: true,
        });
        get().pushHistory();
      }
    } catch (error) {
      console.error('Erro ao importar JSON:', error);
    }
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      set({
        nodes: prevState.nodes,
        edges: prevState.edges,
        historyIndex: historyIndex - 1,
        selectedNodeId: null,
        dirty: true,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({
        nodes: nextState.nodes,
        edges: nextState.edges,
        historyIndex: historyIndex + 1,
        selectedNodeId: null,
        dirty: true,
      });
    }
  },

  setNodes: (nodes) => {
    set({ nodes, dirty: true });
  },

  setEdges: (edges) => {
    set({ edges, dirty: true });
  },

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newSnapshot = { nodes: [...nodes], edges: [...edges] };
    
    // Remove history after current index (for redo functionality)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSnapshot);
    
    // Keep only last 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      set({ historyIndex: historyIndex + 1 });
    }
    
    set({ history: newHistory });
  },

  setLastSaved: (date) => {
    set({ lastSaved: date });
  },

  setIsSaving: (saving) => {
    set({ isSaving: saving });
  },
}));
