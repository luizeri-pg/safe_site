import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getApiBase } from '@/services/api';
import { listarSolicitacoes, type SolicitacaoItem } from '@/services/solicitacoes';
import { PageHeader } from '@/components/PageHeader';
import { PageContent } from '@/components/PageContent';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select } from '@/components/ui/select';
import { Building2, Loader2, Plus } from 'lucide-react';

const ROWS_PER_PAGE_OPCOES = [10, 20, 30, 50] as const;

const IS_DEV = import.meta.env.DEV;

/** Dados de exemplo para visualizar a listagem em desenvolvimento (quando API vazia ou não configurada) */
function getMockSolicitacoes(tipo: string): SolicitacaoItem[] {
  const hoje = new Date().toISOString().slice(0, 10);
  const datas = [
    hoje,
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  ];
  const statuses = ['Pendente', 'Em análise', 'Concluído', 'Pendente', 'Concluído'] as const;
  const empresas = ['Safe Gestão', 'Empresa Alpha Ltda', 'Safe Gestão', 'Empresa Beta SA', 'Safe Gestão'];
  return datas.map((data, i) => ({
    id: 1000 + i,
    empresa: empresas[i],
    tipo,
    data,
    status: statuses[i],
  }));
}

function formatDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export interface SolicitacoesPorTipoListProps {
  tipo: string;
  title: string;
  description: string;
  basePath: string;
  addLabel?: string;
}

export default function SolicitacoesPorTipoList({
  tipo,
  title,
  description,
  basePath,
  addLabel = 'Adicionar',
}: SolicitacoesPorTipoListProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const apiConfigurada = !!getApiBase() && !!token;

  useEffect(() => {
    if (!apiConfigurada) {
      setSolicitacoes([]);
      setErro(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setErro(null);
    listarSolicitacoes(token!, { tipo })
      .then((res) => {
        if (!cancelled && res.sucesso) setSolicitacoes(res.dados);
      })
      .catch((err) => {
        if (!cancelled) {
          setSolicitacoes([]);
          setErro(err instanceof Error ? err.message : 'Falha ao carregar');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [apiConfigurada, token, tipo]);

  const useMock = IS_DEV && (solicitacoes.length === 0 || !apiConfigurada);
  const displayList = solicitacoes.length > 0 ? solicitacoes : (useMock ? getMockSolicitacoes(tipo) : []);
  const totalRows = displayList.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const pageIndex = Math.min(page, Math.max(0, totalPages - 1));
  const paginatedRows = displayList.slice(pageIndex * rowsPerPage, (pageIndex + 1) * rowsPerPage);

  return (
    <PageContent maxWidth="6xl">
      <PageHeader title={title} description={description} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Suas solicitações</CardTitle>
            <CardDescription className="text-sm">
              Todas as solicitações deste tipo que você enviou
            </CardDescription>
          </div>
          <Button onClick={() => navigate(`${basePath}/adicionar`)}>
            <Plus className="size-4 mr-2" />
            {addLabel}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : !apiConfigurada && !useMock ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Configure a API (VITE_API_URL) e faça login para listar suas solicitações.
            </p>
          ) : erro ? (
            <p className="py-8 text-center text-sm text-destructive">{erro}</p>
          ) : displayList.length === 0 ? (
            <div className="px-6 py-8">
              <p className="text-center text-sm text-muted-foreground">
                Nenhuma solicitação enviada ainda. Use &quot;{addLabel}&quot; para criar uma nova.
              </p>
              <div className="mt-4 flex justify-center">
                <Button onClick={() => navigate(`${basePath}/adicionar`)}>
                  <Plus className="size-4 mr-2" />
                  {addLabel}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {useMock && (
                <p className="px-6 pt-4 text-center text-xs text-muted-foreground">
                  {apiConfigurada
                    ? 'Dados de exemplo para visualização. Envie uma solicitação real para ver seu histórico.'
                    : 'Dados de exemplo. Configure a API (VITE_API_URL) e faça login para ver suas solicitações reais.'}
                </p>
              )}
              <div className="px-6 pb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">ID</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRows.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-sm font-medium">{s.id}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <Building2 className="size-4 shrink-0 text-muted-foreground" />
                            {s.empresa}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(s.data)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{s.status}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-3 bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Total: {totalRows} linha(s).
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Linhas por página</span>
                    <Select
                      value={String(rowsPerPage)}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setPage(0);
                      }}
                      className="h-9 w-20 rounded-lg"
                    >
                      {ROWS_PER_PAGE_OPCOES.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Página {pageIndex + 1} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(0)}
                      disabled={pageIndex === 0}
                      aria-label="Primeira página"
                    >
                      «
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={pageIndex === 0}
                      aria-label="Página anterior"
                    >
                      ‹
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={pageIndex >= totalPages - 1}
                      aria-label="Próxima página"
                    >
                      ›
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(totalPages - 1)}
                      disabled={pageIndex >= totalPages - 1}
                      aria-label="Última página"
                    >
                      »
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageContent>
  );
}
