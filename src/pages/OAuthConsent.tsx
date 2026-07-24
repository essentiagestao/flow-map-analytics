import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, OWNER_EMAIL } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Local typed wrapper for the beta supabase.auth.oauth namespace
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

function oauth(): OAuthApi {
  return (supabase.auth as any).oauth as OAuthApi;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const authorizationId = params.get('authorization_id') ?? '';
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!authorizationId) {
      setError('Parâmetro authorization_id ausente');
      return;
    }
    if (!user) {
      const next = window.location.pathname + window.location.search;
      navigate('/login?next=' + encodeURIComponent(next), { replace: true });
      return;
    }
    let active = true;
    (async () => {
      const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId, user, loading, navigate]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError('O servidor de autorização não retornou uma URL de redirecionamento.');
    }
    window.location.href = target;
  }

  if (loading || (!details && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 space-y-3">
          <h1 className="text-lg font-semibold">Não foi possível autorizar</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const ownerOnly = user?.email?.toLowerCase() !== OWNER_EMAIL;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">
            Conectar {details.client?.name ?? 'aplicativo externo'} ao Flow Map
          </h1>
          <p className="text-sm text-muted-foreground">
            Isso permite que {details.client?.name ?? 'este cliente'} use as ferramentas do Flow Map como você.
          </p>
        </div>

        <div className="text-sm space-y-1 border border-border rounded-lg p-3 bg-muted/30">
          <div>
            <span className="text-muted-foreground">Conta:</span> {user?.email}
          </div>
          {details.client?.redirect_uri && (
            <div className="truncate">
              <span className="text-muted-foreground">Redirect URI:</span> {details.client.redirect_uri}
            </div>
          )}
        </div>

        {ownerOnly ? (
          <div className="text-sm text-destructive">
            Apenas o proprietário do app pode autorizar essa conexão. Faça login com a conta autorizada.
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            As políticas do app continuam valendo — o cliente só consegue acessar dados que você já pode acessar.
          </p>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={busy}
            onClick={() => decide(false)}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={busy || ownerOnly}
            onClick={() => decide(true)}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Autorizar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
