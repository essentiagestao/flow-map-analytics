import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { FaGoogle } from 'react-icons/fa';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/editor');
    }
  }, [user, loading, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error('Erro ao fazer login com Google');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm mx-auto space-y-8 px-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Flow Map
          </h1>
          <p className="text-muted-foreground">
            Editor visual de funis de conversão
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6 shadow-sm">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Entrar na sua conta</h2>
            <p className="text-sm text-muted-foreground">
              Use sua conta Google para acessar seus funis
            </p>
          </div>

          <Button
            onClick={handleGoogleLogin}
            className="w-full gap-3 h-12 text-base"
            variant="outline"
          >
            <FaGoogle className="w-5 h-5" />
            Entrar com Google
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Ao entrar, seus funis ficam salvos na nuvem e acessíveis de qualquer dispositivo.
        </p>
      </div>
    </div>
  );
};

export default Login;
