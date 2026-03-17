import { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getApiBase } from '@/services/api';
import { getDashboardStats, type DashboardStats } from '@/services/admin';
import { PageHeader } from '@/components/PageHeader';
import { PageContent } from '@/components/PageContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FileText, Clock, CircleCheck, Cog, AlertTriangle, Loader2, Building2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const CHART_GRID = 'hsl(var(--border))';
const CHART_AXIS = 'hsl(var(--muted-foreground))';
const CHART_PRIMARY = 'hsl(var(--primary))';

function formatDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminDashboard() {
  const { isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin || !token || !getApiBase()) {
      setLoading(false);
      return;
    }
    const diasStr = typeof localStorage !== 'undefined' ? localStorage.getItem('safesite_admin_dias_pendente_alerta') : null;
    const dias = diasStr ? Math.max(1, Math.min(365, parseInt(diasStr, 10) || 7)) : 7;
    getDashboardStats(token, dias)
      .then((res) => {
        if (res.sucesso) setStats(res.dados);
      })
      .catch((err) => setErro(err instanceof Error ? err.message : 'Erro ao carregar'))
      .finally(() => setLoading(false));
  }, [isAdmin, token]);

  if (!isAdmin) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <PageContent>
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </PageContent>
    );
  }

  if (erro || !stats) {
    return (
      <PageContent>
        <PageHeader title="Dashboard Admin" description="Visão geral do sistema" />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {erro ?? 'Configure a API e faça login como admin para ver o dashboard.'}
          </CardContent>
        </Card>
      </PageContent>
    );
  }

  return (
    <PageContent maxWidth="6xl">
      <PageHeader
        title="Dashboard Admin"
        description="Visão geral de solicitações e indicadores"
      />

      {stats.pendentes_ha_mais_dias > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="size-5 shrink-0 text-amber-600" />
            <p className="text-sm">
              <strong>{stats.pendentes_ha_mais_dias}</strong> solicitação(ões) pendente(s) há mais de{' '}
              <strong>{stats.dias_pendente_alerta} dias</strong>.{' '}
              <Link to="/acompanhamento" className="text-primary underline">
                Ver acompanhamento
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-row items-center gap-4 pt-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <FileText className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total de solicitações</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-row items-center gap-4 pt-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600">
              <Clock className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{stats.pendentes}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-row items-center gap-4 pt-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/30 text-primary">
              <Cog className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{stats.em_analise}</p>
              <p className="text-sm text-muted-foreground">Em análise</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-row items-center gap-4 pt-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-green-500/20 text-green-600">
              <CircleCheck className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{stats.concluidas}</p>
              <p className="text-sm text-muted-foreground">Concluídas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Solicitações por tipo</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.por_tipo.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">Nenhuma solicitação ainda.</p>
            ) : (
              <ul className="space-y-2">
                {stats.por_tipo.map((x) => (
                  <li key={x.tipo} className="flex items-center justify-between text-sm">
                    <span className="truncate pr-2">{x.tipo}</span>
                    <span className="font-medium tabular-nums">{x.quantidade}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Solicitações por período</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.por_mes.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">Nenhum dado ainda.</p>
            ) : (
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.por_mes} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                    <XAxis dataKey="label" stroke={CHART_AXIS} fontSize={11} tickLine={false} />
                    <YAxis stroke={CHART_AXIS} fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: `1px solid ${CHART_GRID}`,
                        borderRadius: 'var(--radius)',
                        fontSize: '12px',
                      }}
                      labelFormatter={(_, payload) => payload[0]?.payload?.label}
                    />
                    <Bar dataKey="quantidade" fill={CHART_PRIMARY} radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Últimas solicitações</CardTitle>
          <Link to="/acompanhamento" className="text-sm text-primary hover:underline">
            Ver todas
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {stats.ultimas.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma solicitação.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">ID</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.ultimas.map((s) => (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate('/acompanhamento')}
                  >
                    <TableCell className="font-mono text-sm">{s.id}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <Building2 className="size-4 shrink-0 text-muted-foreground" />
                        {s.empresa}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{s.tipo}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(s.data)}</TableCell>
                    <TableCell>{s.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContent>
  );
}
