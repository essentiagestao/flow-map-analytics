import { useNavigate } from 'react-router-dom';
import { useBoardList } from '../hooks/useBoardList';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ArrowLeft, LayoutGrid } from 'lucide-react';

export function BoardsListPage() {
  const navigate = useNavigate();
  const { boards, loading, createBoard, deleteBoard } = useBoardList();

  const handleCreate = async () => {
    const board = await createBoard();
    if (board) navigate(`/workspace/boards/${board.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <LayoutGrid className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Meus Boards</h1>
          <div className="flex-1" />
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Board
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-20">
            <LayoutGrid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum board criado ainda</p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Criar primeiro board
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map(board => (
              <div
                key={board.id}
                className="group border border-border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/workspace/boards/${board.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate">{board.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(board.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBoard(board.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
