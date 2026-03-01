import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useBoardStore } from '../store/boardStore';
import { useBoardChunks } from '../hooks/useBoardChunks';
import { BoardChunksProvider } from '../context/BoardChunksContext';
import { CanvasStage } from './CanvasStage';
import { ToolSwitch } from './ToolSwitch';
import { PropertiesSidebar } from './PropertiesSidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Board, BoardItem } from '../types';

export function BoardEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentBoard, setCurrentBoard } = useBoardStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('board_v1_boards' as any)
        .select('*')
        .eq('id', id)
        .single();
      if (data) setCurrentBoard(data as unknown as Board);
      setLoading(false);
    })();
    return () => setCurrentBoard(null);
  }, [id, setCurrentBoard]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">Board não encontrado</p>
        <Button variant="outline" onClick={() => navigate('/workspace/boards')}>Voltar</Button>
      </div>
    );
  }

  return <BoardEditorInner boardId={currentBoard.id} navigate={navigate} />;
}

function BoardEditorInner({ boardId, navigate }: { boardId: string; navigate: ReturnType<typeof useNavigate> }) {
  const { currentBoard } = useBoardStore();
  const { visibleChunks, addItem, updateItem, deleteItem } = useBoardChunks(boardId);
  const allItems: BoardItem[] = visibleChunks.flatMap(c => c.items);

  return (
    <BoardChunksProvider value={{ allItems, addItem, updateItem, deleteItem }}>
      <div className="h-screen flex flex-col bg-background">
        {/* Top bar — simple, Miro-style */}
        <div className="h-11 border-b border-border flex items-center px-3 gap-3 bg-card shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/workspace/boards')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium truncate">{currentBoard?.title}</span>
        </div>

        {/* Body: left toolbar + canvas + right properties */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Vertical toolbar — floating left */}
          <div className="absolute top-3 left-3 z-10">
            <ToolSwitch />
          </div>

          {/* Canvas */}
          <CanvasStage boardId={boardId} />

          {/* Right properties sidebar */}
          <PropertiesSidebar />
        </div>
      </div>
    </BoardChunksProvider>
  );
}
