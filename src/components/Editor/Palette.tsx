'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { NodeIcon } from './nodes/NodeIcon';
import { 
  trafficNodes, 
  pageNodes, 
  communicationNodes, 
  eventNodes,
  categoryLabels,
  NodeCategory,
  NodeTypeConfig,
} from './nodes/nodeTypes';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ComponentSearch, useFilteredNodes } from './ComponentSearch';

interface CategorySectionProps {
  category: NodeCategory;
  items: NodeTypeConfig[];
  onDragStart: (e: React.DragEvent, nodeType: string, category: NodeCategory) => void;
}

const CategorySection = ({ category, items, onDragStart }: CategorySectionProps) => {
  if (items.length === 0) return null;

  const renderNodePreview = (item: NodeTypeConfig) => {
    if (category === 'traffic' || category === 'communication') {
      // Circular preview
      const size = category === 'traffic' ? 'w-9 h-9' : 'w-8 h-8';
      
      return (
        <div 
          className={`${size} rounded-full flex items-center justify-center flex-shrink-0`}
          style={{ background: item.bgColor }}
        >
          <NodeIcon iconName={item.icon} className="w-4 h-4 text-white" />
        </div>
      );
    }
    
    if (category === 'page') {
      // Rectangular preview
      return (
        <div 
          className="w-9 h-11 rounded border-2 flex flex-col overflow-hidden flex-shrink-0"
          style={{ borderColor: item.color, backgroundColor: '#fff' }}
        >
          <div 
            className="h-2.5 flex items-center justify-center"
            style={{ backgroundColor: item.color }}
          >
            <NodeIcon iconName={item.icon} className="w-2 h-2 text-white" />
          </div>
          <div className="flex-1 p-0.5 space-y-0.5">
            <div className="h-0.5 bg-gray-200 rounded w-full"></div>
            <div className="h-0.5 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      );
    }
    
    if (category === 'event') {
      // Diamond preview
      return (
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
          <div 
            className="w-6 h-6 rotate-45 rounded-sm border-2 flex items-center justify-center"
            style={{ 
              backgroundColor: item.bgColor,
              borderColor: item.borderColor,
            }}
          >
            <div className="-rotate-45">
              <NodeIcon 
                iconName={item.icon} 
                className="w-2.5 h-2.5" 
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
    <div className="space-y-1.5">
      {items.map((item) => (
        <TooltipProvider key={item.id} delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card
                className="p-2 cursor-move hover:shadow-md transition-all duration-200 hover:scale-[1.02] border border-border bg-card"
                draggable
                onDragStart={(e) => onDragStart(e, item.id, category)}
              >
                <div className="flex items-center gap-2">
                  {renderNodePreview(item)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs text-foreground truncate">
                      {item.label}
                    </div>
                  </div>
                </div>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[200px]">
              <p className="font-medium">{item.label}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export const Palette = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredNodes = useFilteredNodes(searchQuery);
  
  const handleDragStart = (e: React.DragEvent, nodeType: string, category: NodeCategory) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.setData('application/category', category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFilter = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const hasResults = 
    filteredNodes.traffic.length > 0 ||
    filteredNodes.page.length > 0 ||
    filteredNodes.communication.length > 0 ||
    filteredNodes.event.length > 0;

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3 text-foreground">Componentes</h3>
        
        <div className="mb-4">
          <ComponentSearch onFilter={handleFilter} />
        </div>
        
        {!hasResults ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Nenhum componente encontrado
            </p>
          </div>
        ) : searchQuery ? (
          // Flat list when searching
          <div className="space-y-4">
            {filteredNodes.traffic.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {categoryLabels.traffic}
                </h4>
                <CategorySection 
                  category="traffic" 
                  items={filteredNodes.traffic} 
                  onDragStart={handleDragStart}
                />
              </div>
            )}
            {filteredNodes.page.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {categoryLabels.page}
                </h4>
                <CategorySection 
                  category="page" 
                  items={filteredNodes.page} 
                  onDragStart={handleDragStart}
                />
              </div>
            )}
            {filteredNodes.communication.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {categoryLabels.communication}
                </h4>
                <CategorySection 
                  category="communication" 
                  items={filteredNodes.communication} 
                  onDragStart={handleDragStart}
                />
              </div>
            )}
            {filteredNodes.event.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {categoryLabels.event}
                </h4>
                <CategorySection 
                  category="event" 
                  items={filteredNodes.event} 
                  onDragStart={handleDragStart}
                />
              </div>
            )}
          </div>
        ) : (
          // Accordion when not searching
          <Accordion type="single" collapsible defaultValue="traffic" className="space-y-2">
            <AccordionItem value="traffic" className="border-none">
              <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline py-2">
                {categoryLabels.traffic} ({trafficNodes.length})
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-3">
                <CategorySection 
                  category="traffic" 
                  items={trafficNodes} 
                  onDragStart={handleDragStart}
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="page" className="border-none">
              <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline py-2">
                {categoryLabels.page} ({pageNodes.length})
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-3">
                <CategorySection 
                  category="page" 
                  items={pageNodes} 
                  onDragStart={handleDragStart}
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="communication" className="border-none">
              <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline py-2">
                {categoryLabels.communication} ({communicationNodes.length})
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-3">
                <CategorySection 
                  category="communication" 
                  items={communicationNodes} 
                  onDragStart={handleDragStart}
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="event" className="border-none">
              <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline py-2">
                {categoryLabels.event} ({eventNodes.length})
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-3">
                <CategorySection 
                  category="event" 
                  items={eventNodes} 
                  onDragStart={handleDragStart}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2 text-foreground">Como usar:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Arraste componentes para o canvas</li>
            <li>• Conecte os nós pelas bolinhas</li>
            <li>• Pressione <kbd className="px-1 py-0.5 bg-background border border-border rounded text-[10px]">?</kbd> para ver atalhos</li>
          </ul>
        </div>
      </div>
    </ScrollArea>
  );
};
