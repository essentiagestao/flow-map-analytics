// Board Engine v1 - Chunk grid logic

export const CHUNK_SIZE = 2000;

export function worldToChunkKey(x: number, y: number): string {
  const cx = Math.floor(x / CHUNK_SIZE);
  const cy = Math.floor(y / CHUNK_SIZE);
  return `${cx}_${cy}`;
}

export function chunkKeyToBounds(key: string) {
  const [cx, cy] = key.split('_').map(Number);
  return {
    x: cx * CHUNK_SIZE,
    y: cy * CHUNK_SIZE,
    w: CHUNK_SIZE,
    h: CHUNK_SIZE,
  };
}

export function visibleChunkKeys(
  viewportX: number,
  viewportY: number,
  viewportWidth: number,
  viewportHeight: number,
  zoom: number,
  margin: number = 1
): string[] {
  const worldLeft = -viewportX / zoom;
  const worldTop = -viewportY / zoom;
  const worldRight = worldLeft + viewportWidth / zoom;
  const worldBottom = worldTop + viewportHeight / zoom;

  const startCx = Math.floor(worldLeft / CHUNK_SIZE) - margin;
  const startCy = Math.floor(worldTop / CHUNK_SIZE) - margin;
  const endCx = Math.floor(worldRight / CHUNK_SIZE) + margin;
  const endCy = Math.floor(worldBottom / CHUNK_SIZE) + margin;

  const keys: string[] = [];
  for (let cx = startCx; cx <= endCx; cx++) {
    for (let cy = startCy; cy <= endCy; cy++) {
      keys.push(`${cx}_${cy}`);
    }
  }
  return keys;
}
