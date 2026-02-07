'use client';

import { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Plus } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NodeIcon } from './NodeIcon';
import { 
  trafficNodes, 
  pageNodes, 
  communicationNodes, 
  eventNodes,
  NodeTypeConfig,
  NodeCategory,
  getNodeConfig,
} from './nodeTypes';
import { useFunnelStore } from '@/lib/store/funnelStore';
import { Node } from '@xyflow/react';

interface AddNodeHandleProps {
  nodeId: string;
  position: Position;
  currentNodeType: string;
}

// Suggestions based on current node type
const getSuggestions = (currentType: string): NodeTypeConfig[] => {
  const config = getNodeConfig(currentType);
  if (!config) return [];
  
  switch (config.category) {
    case 'traffic':
      // Traffic → Pages
      return [
        pageNodes.find(n => n.id === 'landing')!,
        pageNodes.find(n => n.id === 'sales')!,
        pageNodes.find(n => n.id === 'webinar')!,
      ].filter(Boolean);
    case 'page':
      // Pages → Events, Communication, or other Pages
      if (currentType === 'landing') {
        return [
          pageNodes.find(n => n.id === 'sales')!,
          eventNodes.find(n => n.id === 'lead')!,
          communicationNodes.find(n => n.id === 'email')!,
        ].filter(Boolean);
      }
      if (currentType === 'sales') {
        return [
          pageNodes.find(n => n.id === 'checkout')!,
          eventNodes.find(n => n.id === 'customer')!,
          eventNodes.find(n => n.id === 'lost')!,
        ].filter(Boolean);
      }
      if (currentType === 'checkout') {
        return [
          pageNodes.find(n => n.id === 'thankyou')!,
          eventNodes.find(n => n.id === 'customer')!,
          pageNodes.find(n => n.id === 'sales')!,
        ].filter(Boolean);
      }
      return [
        eventNodes.find(n => n.id === 'lead')!,
        communicationNodes.find(n => n.id === 'email')!,
        pageNodes.find(n => n.id === 'thankyou')!,
      ].filter(Boolean);
    case 'communication':
      // Communication → Pages or Events
      return [
        pageNodes.find(n => n.id === 'sales')!,
        pageNodes.find(n => n.id === 'landing')!,
        eventNodes.find(n => n.id === 'customer')!,
      ].filter(Boolean);
    case 'event':
      // Events → Communication or Pages
      return [
        communicationNodes.find(n => n.id === 'email')!,
        communicationNodes.find(n => n.id === 'sequence')!,
        pageNodes.find(n => n.id === 'sales')!,
      ].filter(Boolean);
    default:
      return [];
  }
};

const allCategories = {
  traffic: trafficNodes,
  page: pageNodes,
  communication: communicationNodes,
  event: eventNodes,
};

const categoryLabels: Record<NodeCategory, string> = {
  traffic: 'Tráfego',
  page: 'Páginas',
  communication: 'Comunicação',
  event: 'Eventos',
};

const categoryToNodeType: Record<NodeCategory, string> = {
  traffic: 'traffic',
  page: 'page',
  communication: 'communication',
  event: 'event',
};

const defaultSizes: Record<NodeCategory, { width: number; height: number }> = {
  traffic: { width: 64, height: 64 },
  page: { width: 160, height: 140 },
  communication: { width: 56, height: 56 },
  event: { width: 56, height: 56 },
};

export const AddNodeHandle = ({ nodeId, position, currentNodeType }: AddNodeHandleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { addNode, addEdge } = useFunnelStore();
  const { getNode } = useReactFlow();
  
  const suggestions = getSuggestions(currentNodeType);

  const handleAddNode = useCallback((nodeType: NodeTypeConfig) => {
    const sourceNode = getNode(nodeId);
    if (!sourceNode) return;
    
    const size = defaultSizes[nodeType.category];
    const offsetX = position === Position.Right ? 200 : -200;
    
    const newNode: Node = {
      id: `${nodeType.id}-${Date.now()}`,
      type: categoryToNodeType[nodeType.category],
      position: {
        x: sourceNode.position.x + offsetX,
        y: sourceNode.position.y,
      },
      data: {
        label: nodeType.label,
        nodeType: nodeType.id,
        url: '',
        width: size.width,
        height: size.height,
      },
    };

    addNode(newNode);
    
    // Create edge with custom type
    const newEdge = {
      id: `e${nodeId}-${newNode.id}-${Date.now()}`,
      source: position === Position.Right ? nodeId : newNode.id,
      target: position === Position.Right ? newNode.id : nodeId,
      type: 'custom',
      data: { style: 'solid' },
    };
    
    addEdge(newEdge);
    setIsOpen(false);
  }, [nodeId, position, addNode, addEdge, getNode]);

  const renderNodePreview = (item: NodeTypeConfig) => {
    if (item.category === 'traffic' || item.category === 'communication') {
      return (
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: item.bgColor }}
        >
          <NodeIcon iconName={item.icon} className="w-3 h-3 text-white" />
        </div>
      );
    }
    
    if (item.category === 'page') {
      return (
        <div 
          className="w-6 h-7 rounded border flex flex-col overflow-hidden flex-shrink-0"
          style={{ borderColor: item.color, backgroundColor: '#fff' }}
        >
          <div 
            className="h-2 flex items-center justify-center"
            style={{ backgroundColor: item.color }}
          >
            <NodeIcon iconName={item.icon} className="w-1.5 h-1.5 text-white" />
          </div>
          <div className="flex-1 p-0.5 space-y-0.5">
            <div className="h-[1px] bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      );
    }
    
    if (item.category === 'event') {
      return (
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <div 
            className="w-4 h-4 rotate-45 rounded-sm border flex items-center justify-center"
            style={{ 
              backgroundColor: item.bgColor,
              borderColor: item.borderColor,
            }}
          >
            <div className="-rotate-45">
              <NodeIcon 
                iconName={item.icon} 
                className="w-2 h-2" 
                style={{ color: item.color }}
              />
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className={`absolute ${position === Position.Right ? '-right-3' : '-left-3'} top-1/2 -translate-y-1/2 z-10`}>
          {/* Hidden actual handle for connections */}
          <Handle 
            type={position === Position.Right ? 'source' : 'target'}
            position={position}
            className="!opacity-0 !w-6 !h-6"
          />
          
          {/* Visual plus button */}
          <button
            className={`
              w-6 h-6 rounded-full bg-card border-2 border-muted-foreground/30
              flex items-center justify-center cursor-pointer
              hover:border-primary hover:bg-primary hover:text-primary-foreground
              transition-all duration-200 hover:scale-110
              shadow-sm hover:shadow-md
              group
            `}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
          </button>
        </div>
      </PopoverTrigger>
      
      <PopoverContent 
        side={position === Position.Right ? 'right' : 'left'} 
        align="start"
        className="w-64 p-0 bg-card border-border shadow-xl rounded-xl overflow-hidden z-[100]"
        sideOffset={8}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-border bg-muted/30">
          <h4 className="text-sm font-semibold text-foreground">Adicionar próximo passo</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Conecte um novo elemento ao funil</p>
        </div>
        
        <ScrollArea className="h-[320px]">
          {/* Suggestions Section */}
          {suggestions.length > 0 && (
            <div className="p-2 border-b border-border">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1.5">
                Sugeridos
              </p>
              <div className="space-y-0.5">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-left"
                    onClick={() => handleAddNode(item)}
                  >
                    {renderNodePreview(item)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* All Categories */}
          <div className="p-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1.5">
              Todos os elementos
            </p>
            
            {(Object.entries(allCategories) as [NodeCategory, NodeTypeConfig[]][]).map(([category, items]) => (
              <div key={category} className="mb-2">
                <p className="text-[10px] font-medium text-muted-foreground px-2 py-1">
                  {categoryLabels[category]}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-left"
                      onClick={() => handleAddNode(item)}
                    >
                      {renderNodePreview(item)}
                      <span className="text-xs font-medium text-foreground truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};