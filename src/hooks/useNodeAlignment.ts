import { Node } from '@xyflow/react';
import { useFunnelStore } from '@/lib/store/funnelStore';
import { toast } from 'sonner';

export type AlignmentType = 
  | 'left' 
  | 'center-h' 
  | 'right' 
  | 'top' 
  | 'center-v' 
  | 'bottom'
  | 'distribute-h'
  | 'distribute-v'
  | 'space-h'
  | 'space-v';

// Default spacing for magnetic alignment (in pixels)
const DEFAULT_SPACING = 60;

export const useNodeAlignment = () => {
  const { nodes, setNodes, selectedNodeIds, pushHistory } = useFunnelStore();

  const getSelectedNodes = (): Node[] => {
    return nodes.filter(n => selectedNodeIds.includes(n.id));
  };

  const alignNodes = (type: AlignmentType) => {
    const selected = getSelectedNodes();
    
    if (selected.length < 2) {
      toast.error('Selecione pelo menos 2 nós para alinhar');
      return;
    }

    const updatedNodes = [...nodes];
    
    switch (type) {
      case 'left': {
        const minX = Math.min(...selected.map(n => n.position.x));
        selected.forEach(node => {
          const idx = updatedNodes.findIndex(n => n.id === node.id);
          if (idx !== -1) {
            updatedNodes[idx] = {
              ...updatedNodes[idx],
              position: { ...updatedNodes[idx].position, x: minX }
            };
          }
        });
        break;
      }
      
      case 'center-h': {
        const positions = selected.map(n => n.position.x + (n.data?.width as number || 100) / 2);
        const center = (Math.min(...positions) + Math.max(...positions)) / 2;
        selected.forEach(node => {
          const idx = updatedNodes.findIndex(n => n.id === node.id);
          if (idx !== -1) {
            const width = (node.data?.width as number) || 100;
            updatedNodes[idx] = {
              ...updatedNodes[idx],
              position: { ...updatedNodes[idx].position, x: center - width / 2 }
            };
          }
        });
        break;
      }
      
      case 'right': {
        const maxX = Math.max(...selected.map(n => n.position.x + ((n.data?.width as number) || 100)));
        selected.forEach(node => {
          const idx = updatedNodes.findIndex(n => n.id === node.id);
          if (idx !== -1) {
            const width = (node.data?.width as number) || 100;
            updatedNodes[idx] = {
              ...updatedNodes[idx],
              position: { ...updatedNodes[idx].position, x: maxX - width }
            };
          }
        });
        break;
      }
      
      case 'top': {
        const minY = Math.min(...selected.map(n => n.position.y));
        selected.forEach(node => {
          const idx = updatedNodes.findIndex(n => n.id === node.id);
          if (idx !== -1) {
            updatedNodes[idx] = {
              ...updatedNodes[idx],
              position: { ...updatedNodes[idx].position, y: minY }
            };
          }
        });
        break;
      }
      
      case 'center-v': {
        const positions = selected.map(n => n.position.y + (n.data?.height as number || 100) / 2);
        const center = (Math.min(...positions) + Math.max(...positions)) / 2;
        selected.forEach(node => {
          const idx = updatedNodes.findIndex(n => n.id === node.id);
          if (idx !== -1) {
            const height = (node.data?.height as number) || 100;
            updatedNodes[idx] = {
              ...updatedNodes[idx],
              position: { ...updatedNodes[idx].position, y: center - height / 2 }
            };
          }
        });
        break;
      }
      
      case 'bottom': {
        const maxY = Math.max(...selected.map(n => n.position.y + ((n.data?.height as number) || 100)));
        selected.forEach(node => {
          const idx = updatedNodes.findIndex(n => n.id === node.id);
          if (idx !== -1) {
            const height = (node.data?.height as number) || 100;
            updatedNodes[idx] = {
              ...updatedNodes[idx],
              position: { ...updatedNodes[idx].position, y: maxY - height }
            };
          }
        });
        break;
      }
      
      case 'distribute-h': {
        if (selected.length < 3) {
          toast.error('Selecione pelo menos 3 nós para distribuir');
          return;
        }
        
        const sorted = [...selected].sort((a, b) => a.position.x - b.position.x);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const totalWidth = last.position.x + ((last.data?.width as number) || 100) - first.position.x;
        const nodeWidths = sorted.reduce((acc, n) => acc + ((n.data?.width as number) || 100), 0);
        const spacing = (totalWidth - nodeWidths) / (sorted.length - 1);
        
        let currentX = first.position.x;
        sorted.forEach((node) => {
          const idx = updatedNodes.findIndex(n => n.id === node.id);
          if (idx !== -1) {
            updatedNodes[idx] = {
              ...updatedNodes[idx],
              position: { ...updatedNodes[idx].position, x: currentX }
            };
            currentX += ((node.data?.width as number) || 100) + spacing;
          }
        });
        break;
      }
      
      case 'distribute-v': {
        if (selected.length < 3) {
          toast.error('Selecione pelo menos 3 nós para distribuir');
          return;
        }
        
        const sorted = [...selected].sort((a, b) => a.position.y - b.position.y);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const totalHeight = last.position.y + ((last.data?.height as number) || 100) - first.position.y;
        const nodeHeights = sorted.reduce((acc, n) => acc + ((n.data?.height as number) || 100), 0);
        const spacing = (totalHeight - nodeHeights) / (sorted.length - 1);
        
        let currentY = first.position.y;
        sorted.forEach((node) => {
          const idx = updatedNodes.findIndex(n => n.id === node.id);
          if (idx !== -1) {
            updatedNodes[idx] = {
              ...updatedNodes[idx],
              position: { ...updatedNodes[idx].position, y: currentY }
            };
            currentY += ((node.data?.height as number) || 100) + spacing;
          }
        });
        break;
      }
      
      // NEW: Magnetic spacing with fixed distance
      case 'space-h': {
        const sorted = [...selected].sort((a, b) => a.position.x - b.position.x);
        const first = sorted[0];
        
        let currentX = first.position.x;
        sorted.forEach((node, i) => {
          const idx = updatedNodes.findIndex(n => n.id === node.id);
          if (idx !== -1) {
            updatedNodes[idx] = {
              ...updatedNodes[idx],
              position: { ...updatedNodes[idx].position, x: currentX }
            };
            currentX += ((node.data?.width as number) || 100) + DEFAULT_SPACING;
          }
        });
        toast.success(`Espaçamento de ${DEFAULT_SPACING}px aplicado`);
        break;
      }
      
      case 'space-v': {
        const sorted = [...selected].sort((a, b) => a.position.y - b.position.y);
        const first = sorted[0];
        
        let currentY = first.position.y;
        sorted.forEach((node, i) => {
          const idx = updatedNodes.findIndex(n => n.id === node.id);
          if (idx !== -1) {
            updatedNodes[idx] = {
              ...updatedNodes[idx],
              position: { ...updatedNodes[idx].position, y: currentY }
            };
            currentY += ((node.data?.height as number) || 100) + DEFAULT_SPACING;
          }
        });
        toast.success(`Espaçamento de ${DEFAULT_SPACING}px aplicado`);
        break;
      }
    }

    setNodes(updatedNodes);
    pushHistory();
    if (type !== 'space-h' && type !== 'space-v') {
      toast.success('Nós alinhados');
    }
  };

  return { alignNodes, selectedCount: selectedNodeIds.length };
};
