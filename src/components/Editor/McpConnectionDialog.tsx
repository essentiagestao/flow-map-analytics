import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const McpConnectionDialog = ({ open, onOpenChange }: Props) => {
  const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
  const mcpUrl = `https://${projectRef}.supabase.co/functions/v1/mcp`;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(mcpUrl);
    setCopied(true);
    toast.success('URL copiada');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Conectar Claude via MCP</DialogTitle>
          <DialogDescription>
            Servidor MCP remoto protegido por OAuth 2.1. Somente sua conta pode autorizar
            a conexão.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">URL do servidor MCP</label>
            <div className="flex gap-2">
              <Input value={mcpUrl} readOnly className="font-mono text-xs" />
              <Button size="icon" variant="outline" onClick={copy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Como conectar no Claude Desktop:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Abra o Claude Desktop → Settings → Connectors → Add custom connector.</li>
              <li>Cole a URL acima como endereço do servidor MCP.</li>
              <li>Ao conectar, o Claude abrirá uma página de autorização no navegador.</li>
              <li>
                Faça login com sua conta autorizada e clique em <strong>Autorizar</strong>.
              </li>
              <li>O Claude terá acesso apenas aos seus funis via as ferramentas do app.</li>
            </ol>
          </div>

          <div className="text-xs text-muted-foreground border border-border rounded-md p-3 bg-muted/30">
            🔒 A conexão é protegida por OAuth 2.1. Cada requisição é autenticada como
            você e respeita todas as regras de acesso do app. Nenhum outro usuário pode
            aprovar esta conexão.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
