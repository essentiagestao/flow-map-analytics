import { useBoardStore } from '../../store/boardStore';
import { useBoardChunksContext } from '../../context/BoardChunksContext';
import {
  Square, Circle, Type, Layers, Eye, EyeOff, Trash2, MousePointer2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { BoardItem } from '../../types';

const ITEM_ICONS: Record<string, React.ElementType> = {
  rect: Square,
  circle: Circle,
  ellipse: Circle,
  text: Type,
};

function itemLabel(item: BoardItem) {
  if (item.type === 'text' && item.text) return item.text.slice(0, 24);
  const names: Record<string, string> = { rect: 'Retângulo', circle: 'Círculo', ellipse: 'Elipse', text: 'Texto' };
  return names[item.type] || item.type;
}

export function StructureSidebar() {
  const { selectedItemId, setSelectedItemId } = useBoardStore();
  const { allItems, deleteItem } = useBoardChunksContext();

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <Layers className="h-4 w-4 text-blue-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Layers</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{allItems.length}</span>
      </div>

      <ScrollArea className="flex-1">
        {allItems.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <MousePointer2 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhum objeto no canvas</p>
          </div>
        ) : (
          <div className="p-1">
            {allItems.map((item) => {
              const Icon = ITEM_ICONS[item.type] || Square;
              const isSelected = selectedItemId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`
                    w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors
                    ${isSelected ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}
                  `}
                >
                  <span
                    className="h-3 w-3 rounded-sm shrink-0 border border-border"
                    style={{ backgroundColor: item.fill }}
                  />
                  <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="truncate flex-1 text-left">{itemLabel(item)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:text-destructive shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                      if (isSelected) setSelectedItemId(null);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
