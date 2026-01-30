'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  trafficNodes,
  pageNodes,
  communicationNodes,
  eventNodes,
  NodeTypeConfig,
} from './nodes/nodeTypes';

interface ComponentSearchProps {
  onFilter: (query: string) => void;
}

export const ComponentSearch = ({ onFilter }: ComponentSearchProps) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    onFilter(query);
  }, [query, onFilter]);

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder="Buscar componentes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-8 pr-8 h-9 text-sm"
      />
      {query && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          onClick={handleClear}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
};

export const useFilteredNodes = (query: string) => {
  return useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return {
        traffic: trafficNodes,
        page: pageNodes,
        communication: communicationNodes,
        event: eventNodes,
      };
    }

    const filterNodes = (nodes: NodeTypeConfig[]) =>
      nodes.filter(
        (node) =>
          node.label.toLowerCase().includes(normalizedQuery) ||
          node.id.toLowerCase().includes(normalizedQuery) ||
          node.description?.toLowerCase().includes(normalizedQuery)
      );

    return {
      traffic: filterNodes(trafficNodes),
      page: filterNodes(pageNodes),
      communication: filterNodes(communicationNodes),
      event: filterNodes(eventNodes),
    };
  }, [query]);
};
