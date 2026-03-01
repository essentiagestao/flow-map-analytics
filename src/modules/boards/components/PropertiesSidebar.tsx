import { useBoardStore } from '../store/boardStore';
import { useBoardChunksContext } from '../context/BoardChunksContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Trash2 } from 'lucide-react';
import type { BoardItem } from '../types';

export function PropertiesSidebar() {
  const { selectedItemId, propertiesOpen, setPropertiesOpen, setSelectedItemId } = useBoardStore();
  const { allItems, updateItem, deleteItem } = useBoardChunksContext();

  if (!propertiesOpen || !selectedItemId) return null;

  const item = allItems.find((i: BoardItem) => i.id === selectedItemId);
  if (!item) return null;

  const handleChange = (key: string, value: string | number) => {
    updateItem(selectedItemId, { [key]: value });
  };

  return (
    <div className="w-60 border-l border-border bg-card shrink-0 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="text-sm font-medium capitalize">{item.type}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPropertiesOpen(false)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="p-3 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">X</Label>
            <Input type="number" value={Math.round(item.x)} className="h-8 text-xs"
              onChange={e => handleChange('x', Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Y</Label>
            <Input type="number" value={Math.round(item.y)} className="h-8 text-xs"
              onChange={e => handleChange('y', Number(e.target.value))} />
          </div>
        </div>

        {(item.width !== undefined || item.height !== undefined) && (
          <div className="grid grid-cols-2 gap-2">
            {item.width !== undefined && (
              <div>
                <Label className="text-xs text-muted-foreground">W</Label>
                <Input type="number" value={Math.round(item.width)} className="h-8 text-xs"
                  onChange={e => handleChange('width', Number(e.target.value))} />
              </div>
            )}
            {item.height !== undefined && (
              <div>
                <Label className="text-xs text-muted-foreground">H</Label>
                <Input type="number" value={Math.round(item.height)} className="h-8 text-xs"
                  onChange={e => handleChange('height', Number(e.target.value))} />
              </div>
            )}
          </div>
        )}

        <div>
          <Label className="text-xs text-muted-foreground">Fill</Label>
          <div className="flex gap-2 items-center">
            <input type="color" value={item.fill} className="h-8 w-8 rounded border cursor-pointer"
              onChange={e => handleChange('fill', e.target.value)} />
            <Input value={item.fill} className="h-8 text-xs flex-1"
              onChange={e => handleChange('fill', e.target.value)} />
          </div>
        </div>

        {item.text !== undefined && (
          <div>
            <Label className="text-xs text-muted-foreground">Text</Label>
            <Input value={item.text} className="h-8 text-xs"
              onChange={e => handleChange('text', e.target.value)} />
          </div>
        )}

        {item.fontSize !== undefined && (
          <div>
            <Label className="text-xs text-muted-foreground">Font Size</Label>
            <Input type="number" value={item.fontSize} className="h-8 text-xs"
              onChange={e => handleChange('fontSize', Number(e.target.value))} />
          </div>
        )}

        <Button variant="destructive" size="sm" className="w-full mt-4" onClick={() => {
          deleteItem(selectedItemId);
          setSelectedItemId(null);
        }}>
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
        </Button>
      </div>
    </div>
  );
}
