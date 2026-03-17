import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getApiBase } from '@/services/api';
import { listarSolicitacoes, type SolicitacaoItem } from '@/services/solicitacoes';
import { PageHeader } from '@/components/PageHeader';
import { PageContent } from '@/components/PageContent';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search, Download, Loader2 } from 'lucide-react';

const TIPOS = [
  '',
  'Manuais e Procedimentos',
  'Solicitação de PPP',
  'Abertura de CAT',
  'Inclusão de Cargo',
  'Inclusão de Setor | GHE',
  'Inclusão de Nova Unidade',
  'Solicitação de Visita Técnica',
  'Abertura de Chamado',
];

function toCSV(items: SolicitacaoItem[]): string {
  const header = 'ID;Empresa;Tipo;Data;Status;Descrição';
  const rows = items.map((s) => {
    const desc = (s.descricao ?? '').replace(/;/g, ',').replace(/\n/g, ' ');
    return `${s.id};"${(s.empresa ?? '').replace(/"/g, '""')}";"${(s.tipo ?? '').replace(/"/g, '""')}";${s.data};${s.status};"${desc}"`;
  });
  return [header, ...rows].join('\n');
}

export default function AdminRelatorios() {
  const { isAdmin, token } = useAuth();
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');
  const [dados, setDados] = useState<SolicitacaoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = () => {
    if (!token || !getApiBase()) return;
    setLoading(true);
    setErro(null);
    listarSolicitacoes(token, {
      tipo: filtroTipo || undefined,
      status: filtroStatus || undefined,
      busca: busca || undefined,
    })
      .then((res) => {
        if (res.sucesso) setDados(res.dados);
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Falha ao carregar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAdmin && token && getApiBase()) carregar();
  }, [isAdmin, token]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const exportarCSV = () => {
    const csv = toCSV(dados);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solicitacoes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContent maxWidth="6xl">
      <PageHeader
        title="Relatórios"
        description="Exporte a listagem de solicitações com filtros"
      />
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Exportar solicitações</CardTitle>
          <CardDescription className="text-sm">
            Aplique os filtros e clique em Carregar. Depois use Exportar CSV para baixar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-input bg-muted/30 px-3 py-2">
              <Search className="size-5 shrink-0 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <Select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="h-9 w-[220px] rounded-lg"
            >
              <option value="">Tipo (todos)</option>
              {TIPOS.filter(Boolean).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
            <Select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="h-9 w-[140px] rounded-lg"
            >
              <option value="">Status (todos)</option>
              <option value="Pendente">Pendente</option>
              <option value="Em análise">Em análise</option>
              <option value="Concluído">Concluído</option>
            </Select>
            <Button onClick={carregar} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Carregar
            </Button>
            <Button variant="secondary" onClick={exportarCSV} disabled={dados.length === 0}>
              <Download className="size-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <p className="text-sm text-muted-foreground">
            {dados.length} registro(s) listado(s). O CSV usa separador ponto e vírgula (;) e encoding UTF-8.
          </p>
        </CardContent>
      </Card>
    </PageContent>
  );
}
