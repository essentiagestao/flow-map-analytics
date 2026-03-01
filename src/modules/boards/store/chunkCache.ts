// Board Engine v1 - LRU Cache for chunks in memory

import type { BoardChunk } from '../types';

const MAX_CACHE = 60;

export class ChunkLRUCache {
  private cache = new Map<string, BoardChunk>();
  private order: string[] = [];

  get(key: string): BoardChunk | undefined {
    const chunk = this.cache.get(key);
    if (chunk) {
      this.order = this.order.filter(k => k !== key);
      this.order.push(key);
    }
    return chunk;
  }

  set(key: string, chunk: BoardChunk): BoardChunk | null {
    if (this.cache.has(key)) {
      this.cache.set(key, chunk);
      this.order = this.order.filter(k => k !== key);
      this.order.push(key);
      return null;
    }

    let evicted: BoardChunk | null = null;
    if (this.cache.size >= MAX_CACHE) {
      // Find oldest non-dirty chunk to evict
      for (let i = 0; i < this.order.length; i++) {
        const oldKey = this.order[i];
        const old = this.cache.get(oldKey);
        if (old && !old.dirty) {
          this.cache.delete(oldKey);
          this.order.splice(i, 1);
          break;
        }
        if (old && old.dirty) {
          evicted = old;
          this.cache.delete(oldKey);
          this.order.splice(i, 1);
          break;
        }
      }
    }

    this.cache.set(key, chunk);
    this.order.push(key);
    return evicted;
  }

  getDirtyChunks(): BoardChunk[] {
    return Array.from(this.cache.values()).filter(c => c.dirty);
  }

  markClean(key: string) {
    const chunk = this.cache.get(key);
    if (chunk) chunk.dirty = false;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
    this.order = [];
  }

  values(): BoardChunk[] {
    return Array.from(this.cache.values());
  }
}
