## Situação

O erro "Auth session missing!" aparece na tela `/.lovable/oauth/consent` quando o Claude te envia para autorizar a conexão. Essa mensagem vem da biblioteca de autenticação: no momento em que a página chamou o servidor de autorização, o cliente de autenticação do navegador não tinha uma sessão válida disponível.

O que já foi verificado:
- O servidor OAuth está ativo, com registro dinâmico de clientes habilitado.
- O caminho da tela de consentimento está correto: `/.lovable/oauth/consent`.
- A URL oficial de autorização é `https://flow-map-analytics.lovable.app` (o app publicado), e essa URL está na lista de permissões.
- A tela de consentimento hoje só verifica se existe um "usuário" carregado pelo hook interno, e chama o servidor de autorização imediatamente depois.

Causa provável (ainda não confirmada em execução): a chamada de autorização acontece antes de a sessão estar realmente pronta/renovada no navegador — por exemplo, quando o Claude abre a autorização em uma janela nova, ou quando o token guardado expirou e precisa ser renovado antes do uso. Os registros de autenticação mostram, no mesmo período, falhas de renovação de token ("refresh token não encontrado") vindas do domínio de pré-visualização, o que reforça essa hipótese.

## Plano

1. Confirmar a causa
   - Reproduzir o fluxo no app com um teste automatizado de navegador, restaurando a sessão e abrindo a URL de consentimento, capturando o erro exato e a chamada de rede que falha.
   - Se o erro vier de outro ponto (por exemplo, do próprio servidor de autorização), ajustar o passo 2 conforme o resultado.

2. Endurecer a tela de consentimento
   - Antes de qualquer chamada de autorização, obter a sessão diretamente do cliente de autenticação e, se o token estiver expirado ou próximo do vencimento, renová-lo; só então buscar os detalhes da autorização.
   - Se não houver sessão, redirecionar para o login preservando a URL completa de consentimento (com o `authorization_id`), em vez de mostrar erro.
   - Repetir a mesma verificação de sessão no momento de "Autorizar"/"Cancelar", já que o usuário pode ficar parado na tela até o token expirar.
   - Adicionar uma nova tentativa automática única quando o erro for especificamente de sessão ausente.

3. Melhorar as mensagens de erro
   - Distinguir "sessão expirada — entrar novamente" (com botão que leva ao login e volta para a mesma autorização) de erros reais do servidor de autorização, em vez de exibir a mensagem técnica crua.

4. Garantir o domínio correto
   - Se a tela de consentimento for aberta em um domínio diferente do domínio oficial de autorização, redirecionar para o domínio oficial mantendo o `authorization_id`, evitando o caso em que a sessão existe em um domínio mas não no outro.

5. Validar
   - Repetir o fluxo de conexão do Claude do início ao fim: abrir a autorização, aprovar e confirmar que o cliente recebe o token e lista as ferramentas do app.

## Detalhes técnicos

- Arquivo principal: `src/pages/OAuthConsent.tsx` — trocar a dependência do estado do hook `useAuth` por `supabase.auth.getSession()` + `refreshSession()` antes de `getAuthorizationDetails`, `approveAuthorization` e `denyAuthorization`.
- `src/pages/Login.tsx` já consome o parâmetro `next` corretamente; nenhuma mudança prevista lá, apenas verificação.
- Nenhuma alteração no servidor MCP (`src/lib/mcp/`) nem redeploy da função é esperada; se a validação indicar problema do lado do servidor de recursos, isso vira um passo adicional.
