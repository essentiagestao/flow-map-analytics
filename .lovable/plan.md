

# Plano: Autenticacao Google, Funis no Supabase e Templates Publicos

## Resumo

Tres grandes mudancas: (1) o editor sempre abre em branco, funis so existem quando salvos explicitamente, (2) autenticacao com Google para contas individuais, (3) persistencia no Supabase com templates publicos compartilhados.

---

## 1. Editor Sempre Abre em Branco

**Problema atual:** `EditorShell` chama `loadFromLocal()` no mount, carregando o ultimo estado do localStorage.

**Solucao:**
- Remover a chamada `loadFromLocal()` do `useEffect` no `EditorShell.tsx`
- Remover o auto-save para localStorage (intervalo de 5s)
- O canvas sempre inicia vazio; o usuario carrega um funil salvo ou cria um novo
- Manter `saveToLocal` apenas como backup temporario durante a sessao (opcional) ou remover completamente

---

## 2. Autenticacao com Google

**O que ja existe no Supabase:**
- Tabela `profiles` com trigger `handle_new_user` que cria perfil automaticamente no signup
- RLS configurado em todas as tabelas

**O que sera criado:**

### Pagina de Login (`src/pages/Login.tsx`)
- Botao "Entrar com Google" usando `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Design simples e limpo com branding do app

### Auth Context (`src/hooks/useAuth.ts`)
- Hook com `onAuthStateChange` + `getSession`
- Expoe `user`, `profile`, `loading`, `signOut`

### Protecao de Rotas
- `Index.tsx` verifica autenticacao: se nao logado, redireciona para `/login`; se logado, redireciona para `/editor`
- `App.tsx` ganha rota `/login`

### Topbar com Usuario
- Avatar e nome do usuario no canto direito da Topbar
- Botao de logout

**Requisito externo:** Configurar Google OAuth no Supabase Dashboard (Authentication > Providers > Google) com as credenciais do Google Cloud Console.

---

## 3. Funis Salvos no Supabase (em vez de localStorage)

**Abordagem:** A tabela `funnels` ja existe. Vamos adicionar uma coluna JSONB `canvas_data` para armazenar o snapshot completo de nodes + edges do React Flow (muito mais simples do que normalizar nos nas tabelas `nodes`/`edges` separadas, que tem schema diferente do formato React Flow).

### Nova Migracao
```sql
ALTER TABLE public.funnels ADD COLUMN IF NOT EXISTS canvas_data JSONB DEFAULT '{}';
```

### Refatorar `savedFunnelsStore.ts`
- Substituir localStorage por chamadas Supabase:
  - `loadSavedFunnels`: `supabase.from('funnels').select('*').eq('user_id', userId).order('updated_at', { ascending: false })`
  - `saveFunnel`: `supabase.from('funnels').insert({ user_id, title, canvas_data: { nodes, edges } })`
  - `updateFunnel`: `supabase.from('funnels').update({ canvas_data, updated_at }).eq('id', id)`
  - `renameFunnel`: `supabase.from('funnels').update({ title }).eq('id', id)`
  - `deleteFunnel`: `supabase.from('funnels').delete().eq('id', id)`

### Dialog "Meus Funis"
- Mesma UI atual, mas carregando do Supabase
- Indicador de loading enquanto busca
- Acessivel de qualquer dispositivo logado na mesma conta

---

## 4. Templates Publicos (Biblioteca Compartilhada)

### Nova Tabela `public_templates`
```sql
CREATE TABLE public.public_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  author_name TEXT,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'FaRocket',
  canvas_data JSONB NOT NULL DEFAULT '{}',
  category TEXT DEFAULT 'geral',
  usage_count INT DEFAULT 0,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.public_templates ENABLE ROW LEVEL SECURITY;

-- Todos podem ver templates aprovados
CREATE POLICY "Anyone can view approved templates"
  ON public.public_templates FOR SELECT
  USING (is_approved = true);

-- Usuarios podem criar templates
CREATE POLICY "Users can create templates"
  ON public.public_templates FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Autores podem editar seus templates
CREATE POLICY "Authors can update own templates"
  ON public.public_templates FOR UPDATE
  USING (auth.uid() = author_id);
```

### "Publicar como Template" no Dialog de Funis Salvos
- Botao ao lado de cada funil salvo: "Compartilhar como template"
- Pede nome, descricao e categoria
- Insere na tabela `public_templates` com `is_approved = true` (inicialmente sem moderacao)

### Refatorar `TemplateSelector.tsx`
- Duas abas: **"Templates do Sistema"** (os hardcoded atuais) e **"Comunidade"** (do Supabase)
- Busca templates publicos com `supabase.from('public_templates').select('*').eq('is_approved', true)`
- Mostra autor, contagem de uso e data
- Ao carregar, incrementa `usage_count`

---

## 5. Arquivos Impactados

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Login.tsx` | **Novo** - Pagina de login com Google |
| `src/hooks/useAuth.ts` | **Novo** - Hook de autenticacao |
| `src/App.tsx` | Adicionar rota `/login` |
| `src/pages/Index.tsx` | Verificar auth e redirecionar |
| `src/pages/Editor.tsx` | Verificar auth, redirecionar se nao logado |
| `src/components/Editor/EditorShell.tsx` | Remover `loadFromLocal`, remover auto-save localStorage |
| `src/components/Editor/Topbar.tsx` | Adicionar avatar/logout do usuario |
| `src/lib/store/savedFunnelsStore.ts` | Reescrever com Supabase em vez de localStorage |
| `src/lib/store/funnelStore.ts` | Remover `loadFromLocal`/`saveToLocal` ou simplificar |
| `src/components/Editor/SavedFunnelsDialog.tsx` | Adaptar para async Supabase + botao "publicar template" |
| `src/components/Editor/TemplateSelector.tsx` | Adicionar aba "Comunidade" com templates do Supabase |
| Nova migracao SQL | Adicionar `canvas_data` em funnels + criar tabela `public_templates` |

---

## Detalhes Tecnicos

- **Google OAuth**: Usa `supabase.auth.signInWithOAuth({ provider: 'google' })`. O usuario precisa configurar as credenciais no Supabase Dashboard.
- **Session**: `onAuthStateChange` configurado ANTES de `getSession` para evitar race conditions.
- **canvas_data JSONB**: Armazena `{ nodes: Node[], edges: Edge[] }` diretamente, preservando todo o formato React Flow sem perda de dados.
- **RLS**: Todas as politicas ja existem para `funnels`. A nova tabela `public_templates` permite SELECT publico para templates aprovados.

