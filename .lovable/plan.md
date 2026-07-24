# Plano: Login por email/senha + servidor MCP para Claude

## Objetivo
1. Substituir o login por Google por um login por email/senha, criando automaticamente o usuário proprietário (sem formulário de cadastro).
2. Adicionar uma conexão segura com Claude via MCP, restrita ao usuário proprietário.

## Parte 1 — Autenticação por email/senha

### Banco de dados
- Criar o trigger `on_auth_user_created` que chama `handle_new_user()` após insert em `auth.users`, para que o perfil seja criado automaticamente.
- Garantir que a tabela `profiles` tenha GRANT e RLS para `authenticated` e `service_role`.

### Backend
- Criar a Edge Function `create-owner-user` que usa `service_role` para criar o usuário `estevaopbxs@gmail.com` com a senha fornecida pelo usuário. Esta função só pode ser chamada uma vez e só quando o usuário ainda não existe.

### Frontend
- Refatorar `src/pages/Login.tsx` para:
  - Campos de email e senha.
  - Botão para alternar a visibilidade da senha.
  - Remover o botão de "Entrar com Google" e qualquer opção de criar conta.
- Atualizar `src/hooks/useAuth.ts` para expor `signInWithEmail` e `signOut`.
- Garantir que `Index.tsx` e `Editor.tsx` continuem redirecionando corretamente.

### Operação única
- Após o deploy da função `create-owner-user`, chamá-la para criar o usuário proprietário.

## Parte 2 — Servidor MCP seguro para Claude Desktop

Como o usuário já usa Claude Desktop com conexões personalizadas, a forma mais segura é expor este app como um servidor MCP remoto usando OAuth 2.1 do Lovable Cloud. Assim, o Claude Desktop se conecta a uma URL segura e cada chamada de ferramenta é autenticada como o usuário logado.

### Configuração OAuth
- Ativar o servidor OAuth 2.1 do projeto (`supabase--configure_oauth_server`).
- Criar a página de consentimento em `/.lovable/oauth/consent` usando o client Supabase do navegador.
- Restringir a aprovação de conexão ao email `estevaopbxs@gmail.com`.

### Servidor MCP
- Instalar `@lovable.dev/mcp-js` e `zod`.
- Criar `src/lib/mcp/index.ts` com `defineMcp`, auth OAuth e as ferramentas do app.
- Criar tool(s) que exponham operações seguras dos funis (listar, criar, resumir) usando o token do usuário e RLS.
- Adicionar `mcpPlugin()` em `vite.config.ts`.

### UI de configuração
- Adicionar uma tela/modal de "Integração com Claude" no editor, acessível apenas quando o usuário logado é `estevaopbxs@gmail.com`.
- Mostrar a URL do servidor MCP para colar no Claude Desktop e o botão de copiar.

### Deploy
- Atualizar o favicon se necessário.
- Rodar `extract_mcp_manifest` para gerar o manifesto.
- Deploy da Edge Function `mcp`.

## Arquivos a serem criados/modificados
- `src/pages/Login.tsx` (rewrite)
- `src/hooks/useAuth.ts` (edit)
- `src/App.tsx` (adicionar rota de consentimento)
- `src/pages/OAuthConsent.tsx` (novo)
- `src/lib/mcp/index.ts` (novo)
- `src/lib/mcp/tools/*.ts` (novos)
- `supabase/functions/create-owner-user/index.ts` (novo)
- `vite.config.ts` (edit)
- `src/components/Editor/Topbar.tsx` (adicionar item de menu MCP)
- Migration SQL para trigger de perfil

## Considerações de segurança
- A senha do usuário proprietário nunca será escrita em código front-end ou commitada; ela é usada uma única vez na Edge Function `create-owner-user`.
- As ferramentas MCP executam com o token do usuário, então RLS e políticas de ownership se aplicam automaticamente.
- Apenas o email `estevaopbxs@gmail.com` pode aprovar a conexão MCP.

## Resumo da escolha MCP
A opção mais segura para o Claude Desktop é um servidor MCP remoto protegido por OAuth 2.1. Você cola a URL do servidor MCP nas configurações personalizadas do Claude Desktop e, ao conectar, o Claude abre uma tela de aprovação dentro do app. Só a sua conta pode aprovar, e cada chamada de ferramenta respeita o que você pode acessar no app.