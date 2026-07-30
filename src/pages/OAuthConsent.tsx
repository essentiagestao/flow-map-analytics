import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { OWNER_EMAIL } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

// Local typed wrapper for the beta supabase.auth.oauth namespace
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

function oauth(): OAuthApi {
  return (supabase.auth as any).oauth as OAuthApi;
}

const CANONICAL_HOST = 'flow-map-analytics.lovable.app';

function isSessionError(err: any) {
  const msg = String(err?.message ?? err ?? '').toLowerCase();
  return (
    msg.includes('auth session missing') ||
    msg.includes('session_not_found') ||
    msg.includes('refresh token') ||
    msg.includes('jwt expired') ||
    err?.name === 'AuthSessionMissingError'
  );
}

/** Returns a valid, non-expiring-soon session, refreshing it if needed. */
async function ensureSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return null;

  const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
  if (!expiresAt || expiresAt - Date.now() > 60_000) return session;

  const { data: refreshed, error } = await supabase.auth.refreshSession();
  if (error) return null;
  return refreshed.session ?? null;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get('authorization_id') ?? '';
  const [session, setSession] = useState<Session | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [busy, setBusy] = useState(false);
  const retried = useRef(false);

  const goToLogin = useCallback(() => {
    const next = window.location.pathname + window.location.search;
    window.location.href = '/login?next=' + encodeURIComponent(next);
  }, []);

  useEffect(() => {
    // Consent must run on the canonical auth origin, otherwise the browser
    // session may live on a different origin than the one Claude opened.
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    if (!isLocal && host !== CANONICAL_HOST && host.endsWith('lovableproject.com')) {
      window.location.href =
        `https://${CANONICAL_HOST}` + window.location.pathname + window.location.search;
      return;
    }

    if (!authorizationId) {
      setError('Parâmetro authorization_id ausente');
      return;
    }

    let active = true;

    const load = async (): Promise<void> => {
      const current = await ensureSession();
      if (!active) return;
      if (!current) {
        setNeedsLogin(true);
        goToLogin();
        return;
      }
      setSession(current);

      const { data, error: err } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;

      if (err) {
        if (isSessionError(err) && !retried.current) {
          retried.current = true;
          const refreshed = await supabase.auth.refreshSession();
          if (!active) return;
          if (refreshed.data.session) return load();
          setNeedsLogin(true);
          return;
        }
        if (isSessionError(err)) {
          setNeedsLogin(true);
          return;
        }
        setError(err.message ?? 'Erro do servidor de autorização');
        return;
      }

      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    };

    load();
    return () => {
      active = false;
    };
  }, [authorizationId, goToLogin]);

  async function decide(approve: boolean) {
    setBusy(true);
    const current = await ensureSession();
    if (!current) {
      setBusy(false);
      setNeedsLogin(true);
      return;
    }

    const { data, error: err } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);

    if (err) {
      setBusy(false);
      if (isSessionError(err)) {
        setNeedsLogin(true);
        return;
      }
      setError(err.message ?? 'Erro do servidor de autorização');
      return;
    }

    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError('O servidor de autorização não retornou uma URL de redirecionamento.');
      return;
    }
    window.location.href = target;
  }

  if (needsLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
          <h1 className="text-lg font-semibold">Sua sessão expirou</h1>
          <p className="text-sm text-muted-foreground">
            Entre novamente para concluir a autorização. Você voltará automaticamente para
            esta tela.
          </p>
          <Button className="w-full" onClick={goToLogin}>
            Entrar novamente
          </Button>
        </div>
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

  if (!details) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const email = session?.user?.email ?? '';
  const notOwner = email.toLowerCase() !== OWNER_EMAIL;

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
            <span className="text-muted-foreground">Conta:</span> {email}
          </div>
          {details.client?.redirect_uri && (
            <div className="truncate">
              <span className="text-muted-foreground">Redirect URI:</span> {details.client.redirect_uri}
            </div>
          )}
        </div>

        {notOwner ? (
          <div className="text-sm text-destructive">
            Apenas o proprietário do app pode autorizar essa conexão. Faça login com a conta autorizada.
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            As políticas do app continuam valendo — o cliente só consegue acessar dados que você já pode acessar.
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
            Cancelar
          </Button>
          <Button className="flex-1" disabled={busy || notOwner} onClick={() => decide(true)}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Autorizar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
