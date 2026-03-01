// Board Engine v1 - Chunk loading/saving hook

import { useRef, useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChunkLRUCache } from '../store/chunkCache';
import { visibleChunkKeys, chunkKeyToBounds } from '../engine/ChunkManager';
import { useBoardStore } from '../store/boardStore';
import type { BoardChunk, BoardItem } from '../types';

export function useBoardChunks(boardId: string | null) {
  const cache = useRef(new ChunkLRUCache());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visibleChunks, setVisibleChunks] = useState<BoardChunk[]>([]);
  const { viewport, stageSize } = useBoardStore();

  // Load visible chunks
  const loadVisibleChunks = useCallback(async () => {
    if (!boardId) return;

    const keys = visibleChunkKeys(
      viewport.x, viewport.y,
      stageSize.width, stageSize.height,
      viewport.zoom
    );

    const missing = keys.filter(k => !cache.current.has(k));

    if (missing.length > 0) {
      const { data } = await supabase
        .from('board_v1_chunks' as any)
        .select('*')
        .eq('board_id', boardId)
        .in('chunk_key', missing);

      if (data) {
        for (const row of data as any[]) {
          const chunk: BoardChunk = {
            id: row.id,
            board_id: row.board_id,
            section_id: row.section_id,
            chunk_key: row.chunk_key,
            bounds: row.bounds,
            items: row.items || [],
            version: row.version,
            dirty: false,
          };
          const evicted = cache.current.set(chunk.chunk_key, chunk);
          if (evicted?.dirty) {
            saveChunk(evicted);
          }
        }
      }

      // Create empty cache entries for chunks not in DB
      for (const key of missing) {
        if (!cache.current.has(key)) {
          cache.current.set(key, {
            board_id: boardId,
            chunk_key: key,
            bounds: chunkKeyToBounds(key),
            items: [],
            version: 0,
            dirty: false,
          });
        }
      }
    }

    // Collect all visible chunks from cache
    const result: BoardChunk[] = [];
    for (const key of keys) {
      const c = cache.current.get(key);
      if (c) result.push(c);
    }
    setVisibleChunks(result);
  }, [boardId, viewport.x, viewport.y, viewport.zoom, stageSize.width, stageSize.height]);

  useEffect(() => {
    loadVisibleChunks();
  }, [loadVisibleChunks]);

  // Save a single chunk via upsert
  const saveChunk = useCallback(async (chunk: BoardChunk) => {
    if (!chunk.board_id) return;

    await supabase
      .from('board_v1_chunks' as any)
      .upsert(
        {
          board_id: chunk.board_id,
          chunk_key: chunk.chunk_key,
          bounds: chunk.bounds,
          items: chunk.items,
          version: chunk.version + 1,
          section_id: chunk.section_id || null,
        } as any,
        { onConflict: 'board_id,chunk_key' }
      );

    cache.current.markClean(chunk.chunk_key);
  }, []);

  // Debounced save of all dirty chunks
  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const dirty = cache.current.getDirtyChunks();
      await Promise.all(dirty.map(saveChunk));
    }, 1500);
  }, [saveChunk]);

  // Add item to appropriate chunk
  const addItem = useCallback((item: BoardItem) => {
    if (!boardId) return;

    const chunkKey = `${Math.floor(item.x / 2000)}_${Math.floor(item.y / 2000)}`;
    let chunk = cache.current.get(chunkKey);

    if (!chunk) {
      chunk = {
        board_id: boardId,
        chunk_key: chunkKey,
        bounds: chunkKeyToBounds(chunkKey),
        items: [],
        version: 0,
        dirty: false,
      };
      cache.current.set(chunkKey, chunk);
    }

    chunk.items = [...chunk.items, item];
    chunk.dirty = true;
    cache.current.set(chunkKey, chunk);

    scheduleSave();
    loadVisibleChunks();
  }, [boardId, scheduleSave, loadVisibleChunks]);

  // Update item position/props
  const updateItem = useCallback((itemId: string, updates: Partial<BoardItem>) => {
    for (const chunk of cache.current.values()) {
      const idx = chunk.items.findIndex(i => i.id === itemId);
      if (idx >= 0) {
        chunk.items = chunk.items.map(i => i.id === itemId ? { ...i, ...updates } : i);
        chunk.dirty = true;
        cache.current.set(chunk.chunk_key, chunk);
        scheduleSave();
        loadVisibleChunks();
        return;
      }
    }
  }, [scheduleSave, loadVisibleChunks]);

  // Delete item
  const deleteItem = useCallback((itemId: string) => {
    for (const chunk of cache.current.values()) {
      const idx = chunk.items.findIndex(i => i.id === itemId);
      if (idx >= 0) {
        chunk.items = chunk.items.filter(i => i.id !== itemId);
        chunk.dirty = true;
        cache.current.set(chunk.chunk_key, chunk);
        scheduleSave();
        loadVisibleChunks();
        return;
      }
    }
  }, [scheduleSave, loadVisibleChunks]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const dirty = cache.current.getDirtyChunks();
      dirty.forEach(saveChunk);
    };
  }, [saveChunk]);

  // Reset cache when board changes
  useEffect(() => {
    cache.current.clear();
  }, [boardId]);

  return { visibleChunks, addItem, updateItem, deleteItem };
}
