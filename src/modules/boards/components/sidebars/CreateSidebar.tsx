import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBoardStore } from '../../store/boardStore';
import {
  Palette, Image, Upload, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const QUICK_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#0EA5E9', '#8B5CF6',
  '#EC4899', '#F97316', '#14B8A6', '#6366F1', '#1a1a1a',
  '#6B7280', '#FFFFFF',
];

interface Asset {
  id: string;
  storage_path: string;
  type: string;
  created_at: string;
  meta: any;
}

export function CreateSidebar() {
  const { currentBoard } = useBoardStore();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadAssets = useCallback(async () => {
    if (!currentBoard) return;
    const { data } = await supabase
      .from('board_v1_assets' as any)
      .select('*')
      .eq('board_id', currentBoard.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setAssets(data as unknown as Asset[]);
    setLoading(false);
  }, [currentBoard]);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentBoard) return;

    setUploading(true);
    const path = `${currentBoard.id}/${crypto.randomUUID()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('board-v1-assets')
      .upload(path, file);

    if (!uploadError) {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      if (userId) {
        await supabase.from('board_v1_assets' as any).insert({
          board_id: currentBoard.id,
          owner_id: userId,
          storage_path: path,
          type: file.type.startsWith('image') ? 'image' : 'file',
          meta: { name: file.name, size: file.size },
        } as any);
        loadAssets();
      }
    }
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Color palette */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="h-4 w-4 text-purple-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cores</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {QUICK_COLORS.map(color => (
            <button
              key={color}
              className="h-6 w-6 rounded-md border border-border hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Upload */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Image className="h-4 w-4 text-purple-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assets</span>
        </div>
        <label>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
          <Button variant="outline" size="sm" className="w-full text-xs" asChild disabled={uploading}>
            <span className="cursor-pointer">
              <Upload className="h-3 w-3 mr-1" />
              {uploading ? 'Enviando…' : 'Upload de Imagem'}
            </span>
          </Button>
        </label>
      </div>

      {/* Recent uploads */}
      <div className="px-3 py-2 flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recentes</span>
      </div>
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : assets.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <Image className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhum asset enviado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 p-2">
            {assets.map(asset => {
              const url = supabase.storage.from('board-v1-assets').getPublicUrl(asset.storage_path).data.publicUrl;
              return (
                <div
                  key={asset.id}
                  className="aspect-square rounded-md border border-border overflow-hidden bg-muted hover:border-primary/50 transition-colors cursor-pointer"
                >
                  {asset.type === 'image' ? (
                    <img src={url} alt={(asset.meta as any)?.name || 'asset'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      {(asset.meta as any)?.name?.slice(0, 12) || 'Arquivo'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
