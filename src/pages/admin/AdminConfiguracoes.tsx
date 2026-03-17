import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { PageContent } from '@/components/PageContent';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';

const STORAGE_KEY = 'safesite_admin_dias_pendente_alerta';
const DEFAULT_DIAS = 7;

export default function AdminConfiguracoes() {
  const { isAdmin } = useAuth();
  const [diasPendenteAlerta, setDiasPendenteAlerta] = useState(DEFAULT_DIAS);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v !== null) {
      const n = parseInt(v, 10);
      if (!isNaN(n) && n >= 1 && n <= 365) setDiasPendenteAlerta(n);
    }
  }, []);

  if (!isAdmin) return <Navigate to="/" replace />;

  const handleSave = () => {
    const n = Math.max(1, Math.min(365, diasPendenteAlerta));
    setDiasPendenteAlerta(n);
    localStorage.setItem(STORAGE_KEY, String(n));
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  return (
    <PageContent maxWidth="4xl">
      <PageHeader
        title="Configurações"
        description="Parâmetros do painel administrativo"
      />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Alertas</CardTitle>
          <CardDescription className="text-sm">
            Configure quando uma solicitação pendente deve ser destacada no dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel>Dias para alerta de pendência</FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={365}
                value={diasPendenteAlerta}
                onChange={(e) => setDiasPendenteAlerta(parseInt(e.target.value, 10) || DEFAULT_DIAS)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                Solicitações pendentes há mais de X dias aparecerão em destaque no dashboard.
              </span>
            </div>
          </Field>
          <Button onClick={handleSave}>{salvo ? 'Salvo!' : 'Salvar'}</Button>
        </CardContent>
      </Card>
    </PageContent>
  );
}
