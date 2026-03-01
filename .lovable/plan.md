
# Boards Engine v1 -- Modulo Isolado

## Resumo

Criar um modulo totalmente independente (`/src/modules/boards/`) com canvas infinito baseado em react-konva, persistencia por chunks no banco de dados, e zero impacto no app existente. Apenas uma linha sera adicionada ao `App.tsx` (nova rota lazy).

---

## 1. Banco de Dados (4 tabelas + 1 bucket)

Todas as tabelas com prefixo `board_v1_` e RLS isolado.

### board_v1_boards
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| owner_id | uuid NOT NULL | auth.uid() |
| title | text | default 'Board sem nome' |
| viewport | jsonb | {x, y, zoom} |
| settings | jsonb | cores, grid, etc |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

### board_v1_sections
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| board_id | uuid FK | -> board_v1_boards |
| title | text | |
| order_index | int | default 0 |
| is_hidden | boolean | default false |

### board_v1_chunks
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| board_id | uuid FK | -> board_v1_boards |
| section_id | uuid nullable | |
| chunk_key | text | ex: "3_-2" (grid coord) |
| bounds | jsonb | {x, y, w, h} |
| items | jsonb | array de shapes |
| version | int | default 1 |
| updated_at | timestamptz | now() |
| UNIQUE(board_id, chunk_key) | | |

### board_v1_assets
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| board_id | uuid FK | |
| owner_id | uuid | auth.uid() |
| type | text | 'image', 'pdf', etc |
| storage_path | text | |
| meta | jsonb | |
| created_at | timestamptz | now() |

### Storage bucket
- Nome: `board-v1-assets` (public: false)

### RLS (todas as tabelas)
- SELECT/INSERT/UPDATE/DELETE: `auth.uid() = owner_id` (boards, assets)
- sections/chunks: acesso via subquery `board_id IN (SELECT id FROM board_v1_boards WHERE owner_id = auth.uid())`
- Usa funcao `security definer` para evitar recursao

---

## 2. Estrutura de Arquivos

```text
src/modules/boards/
  store/
    boardStore.ts          -- Zustand isolado (board atual, viewport)
    chunkCache.ts          -- LRU cache em memoria (max 60 chunks)
  hooks/
    useBoardChunks.ts      -- Carrega/salva chunks por viewport
    useBoardList.ts        -- CRUD de boards via Supabase
    useBoardAuth.ts        -- Reutiliza useAuth existente (somente leitura)
  engine/
    ChunkManager.ts        -- Logica de grid: worldToChunk, visibleChunks
    ItemSerializer.ts      -- Converte Konva shapes <-> JSON
  components/
    BoardsListPage.tsx     -- Lista de boards do usuario
    BoardEditorPage.tsx    -- Layout do editor
    CanvasStage.tsx        -- react-konva Stage com zoom/pan infinito
    ToolSwitch.tsx         -- Toolbar: select, rect, circle, text, pan
    SectionsSidebar.tsx    -- Painel lateral de secoes
    Minimap.tsx            -- Preview miniatura do board
    ShapeRenderer.tsx      -- Renderiza items de um chunk no canvas
  types/
    index.ts               -- Tipos isolados do modulo
  index.tsx                -- Lazy export das paginas
```

---

## 3. Rota (unica alteracao no App.tsx)

Adicionar rotas lazy **acima** do catch-all:

```tsx
const BoardsList = lazy(() => import('./modules/boards').then(m => ({ default: m.BoardsListPage })));
const BoardEditor = lazy(() => import('./modules/boards').then(m => ({ default: m.BoardEditorPage })));

<Route path="/workspace/boards" element={<Suspense><BoardsList /></Suspense>} />
<Route path="/workspace/boards/:id" element={<Suspense><BoardEditor /></Suspense>} />
```

Nenhuma outra rota ou componente existente e alterado.

---

## 4. Engine -- Canvas Infinito

### Grid de Chunks
- Tamanho do chunk: 2000x2000px no mundo
- chunk_key = `${Math.floor(x/2000)}_${Math.floor(y/2000)}`
- Ao fazer pan/zoom, calcula quais chunk_keys estao visiveis

### Virtualizacao
- `useBoardChunks` observa viewport do Konva Stage
- Calcula chunks visiveis com margem de 1 chunk extra
- Carrega do banco apenas chunks que nao estao no LRU cache
- Remove chunks do canvas quando saem do viewport + margem

### LRU Cache
- Maximo 60 chunks em memoria
- Quando excede, descarta o chunk menos recentemente acessado
- Chunks modificados (dirty) sao salvos antes de descartar

### Salvamento Incremental
- Debounce de 1.5s apos ultima modificacao
- Salva apenas chunks marcados como dirty
- Usa UPSERT com `ON CONFLICT (board_id, chunk_key)`
- Incrementa `version` a cada save

---

## 5. ToolSwitch

Modos de interacao (nao altera estrutura do board):
- **Select**: clicar/arrastar shapes
- **Pan**: arrastar canvas
- **Rectangle**: desenhar retangulo
- **Circle**: desenhar circulo
- **Text**: clicar para adicionar texto

Toolbar posicionado no topo do editor, usando componentes UI existentes (Button, Tooltip).

---

## 6. Dependencia Nova

- `react-konva` + `konva` -- canvas 2D performatico com React bindings

---

## 7. Sequencia de Implementacao

1. Migrar banco: criar 4 tabelas + bucket + RLS + funcao security definer
2. Criar tipos e store isolado (`boardStore.ts`, `chunkCache.ts`)
3. Criar hooks de dados (`useBoardList`, `useBoardChunks`)
4. Criar `ChunkManager` e `ItemSerializer`
5. Criar componentes de UI (lista, editor, canvas, toolbar)
6. Adicionar rotas lazy no `App.tsx`

---

## 8. Garantias de Isolamento

- Zero alteracoes em: funnelStore, savedFunnelsStore, EditorShell, Canvas, nodes, Topbar, Properties
- Zero alteracoes em tabelas existentes (funnels, profiles, public_templates)
- Zero alteracoes em RLS policies existentes
- Store Zustand proprio em `/modules/boards/store/`
- Componentes proprios em `/modules/boards/components/`
- Unica linha tocada fora do modulo: rotas no `App.tsx`
