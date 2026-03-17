import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { PageContent } from '@/components/PageContent';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { User, Building2, Lock, Mail } from 'lucide-react';

export default function Perfil() {
  const { userEmpresaNome, userEmpresaRazaoSocial, isAdmin } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);
    if (novaSenha.length < 4) {
      setMensagem('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setMensagem('A confirmação da senha não confere.');
      return;
    }
    setSalvando(true);
    try {
      // TODO: chamar API de alteração de senha do próprio usuário quando disponível
      setMensagem('Para alterar sua senha, entre em contato com o administrador do sistema.');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <PageContent maxWidth="2xl">
      <PageHeader
        title="Meu perfil"
        description="Dados da sua conta"
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="size-4" />
              Dados da conta
            </CardTitle>
            <CardDescription className="text-sm">
              Informações do seu perfil no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Perfil</FieldLabel>
                <p className="text-sm font-medium text-foreground py-2">
                  {isAdmin ? 'Administrador' : 'Cliente'}
                </p>
              </Field>
              <Field>
                <FieldLabel className="flex items-center gap-2">
                  <Mail className="size-4" />
                  E-mail
                </FieldLabel>
                <p className="text-sm text-muted-foreground py-2">
                  Exibido conforme cadastro no sistema. Para alterar, entre em contato com o administrador.
                </p>
              </Field>
              {!isAdmin && (userEmpresaNome || userEmpresaRazaoSocial) && (
                <Field>
                  <FieldLabel className="flex items-center gap-2">
                    <Building2 className="size-4" />
                    Empresa vinculada
                  </FieldLabel>
                  <p className="text-sm text-foreground py-2">
                    {userEmpresaRazaoSocial || userEmpresaNome || '—'}
                  </p>
                  {userEmpresaNome && userEmpresaRazaoSocial && userEmpresaNome !== userEmpresaRazaoSocial && (
                    <p className="text-sm text-muted-foreground">
                      {userEmpresaNome}
                    </p>
                  )}
                </Field>
              )}
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="size-4" />
              Alterar senha
            </CardTitle>
            <CardDescription className="text-sm">
              Defina uma nova senha para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAlterarSenha} className="space-y-4">
              {mensagem && (
                <p className={`text-sm ${mensagem.includes('contato') ? 'text-muted-foreground' : 'text-destructive'}`}>
                  {mensagem}
                </p>
              )}
              <FieldGroup>
                <Field>
                  <FieldLabel>Senha atual</FieldLabel>
                  <Input
                    type="password"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </Field>
                <Field>
                  <FieldLabel>Nova senha</FieldLabel>
                  <Input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    autoComplete="new-password"
                  />
                </Field>
                <Field>
                  <FieldLabel>Confirmar nova senha</FieldLabel>
                  <Input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a nova senha"
                    autoComplete="new-password"
                  />
                </Field>
              </FieldGroup>
              <Button type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Alterar senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
}
