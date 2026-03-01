import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBoardStore } from '../../store/boardStore';
import {
  LayoutGrid, Plus, Eye, EyeOff, GripVertical, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import type { BoardSection } from '../../types';

export function OrganizeSidebar() {
  const { currentBoard } = useBoardStore();
  const [sections, setSections] = useState<BoardSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const loadSections = useCallback(async () => {
    if (!currentBoard) return;
    const { data } = await supabase
      .from('board_v1_sections' as any)
      .select('*')
      .eq('board_id', currentBoard.id)
      .order('order_index', { ascending: true });
    if (data) setSections(data as unknown as BoardSection[]);
    setLoading(false);
  }, [currentBoard]);

  useEffect(() => { loadSections(); }, [loadSections]);

  const addSection = async () => {
    if (!currentBoard) return;
    const { data } = await supabase
      .from('board_v1_sections' as any)
      .insert({
        board_id: currentBoard.id,
        title: `Seção ${sections.length + 1}`,
        order_index: sections.length,
      } as any)
      .select()
      .single();
    if (data) setSections(prev => [...prev, data as unknown as BoardSection]);
  };

  const toggleVisibility = async (section: BoardSection) => {
    await supabase
      .from('board_v1_sections' as any)
      .update({ is_hidden: !section.is_hidden } as any)
      .eq('id', section.id);
    setSections(prev =>
      prev.map(s => s.id === section.id ? { ...s, is_hidden: !s.is_hidden } : s)
    );
  };

  const saveTitle = async (sectionId: string) => {
    if (!editTitle.trim()) { setEditingId(null); return; }
    await supabase
      .from('board_v1_sections' as any)
      .update({ title: editTitle.trim() } as any)
      .eq('id', sectionId);
    setSections(prev =>
      prev.map(s => s.id === sectionId ? { ...s, title: editTitle.trim() } : s)
    );
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <LayoutGrid className="h-4 w-4 text-yellow-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Seções</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{sections.length}</span>
      </div>

      <div className="px-2 py-2">
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={addSection}>
          <Plus className="h-3 w-3 mr-1" />
          Nova Seção
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : sections.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <LayoutGrid className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhuma seção criada</p>
          </div>
        ) : (
          <div className="p-1 space-y-0.5">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`
                  flex items-center gap-1 px-2 py-1.5 rounded text-xs group
                  ${section.is_hidden ? 'opacity-50' : ''}
                  hover:bg-muted transition-colors
                `}
              >
                <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0 cursor-grab" />
                <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />

                {editingId === section.id ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => saveTitle(section.id)}
                    onKeyDown={(e) => e.key === 'Enter' && saveTitle(section.id)}
                    className="h-5 text-xs px-1 flex-1"
                    autoFocus
                  />
                ) : (
                  <span
                    className="truncate flex-1 cursor-pointer"
                    onDoubleClick={() => {
                      setEditingId(section.id);
                      setEditTitle(section.title);
                    }}
                  >
                    {section.title}
                  </span>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={() => toggleVisibility(section)}
                >
                  {section.is_hidden
                    ? <EyeOff className="h-3 w-3" />
                    : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
