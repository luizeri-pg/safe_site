import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiBase } from '@/services/api';
import { listarSolicitacoes, atualizarSolicitacao, obterDetalheSolicitacao, type SolicitacaoItem, type DetalheSolicitacao } from '../services/solicitacoes';
import {
  Building2,
  FileText,
  Search,
  Loader2,
  CircleCheck,
  Clock,
  Cog,
  X,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PageHeader } from '@/components/PageHeader';
import { PageContent } from '@/components/PageContent';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import './Acompanhamento.css';

const ROWS_PER_PAGE_OPCOES = [10, 20, 30, 50] as const;

const TIPOS = [
  'Manuais e Procedimentos',
  'Solicitação de PPP',
  'Abertura de CAT',
  'Inclusão de Cargo',
  'Inclusão de Setor | GHE',
  'Inclusão de Nova Unidade',
  'Solicitação de Visita Técnica',
  'Abertura de Chamado',
] as const;

function formatDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function statusBadgeVariant(status: string): 'pendente' | 'em-análise' | 'concluído' {
  const n = status.replace(/\s/g, '-').toLowerCase();
  if (n === 'concluído') return 'concluído';
  if (n === 'em-análise') return 'em-análise';
  return 'pendente';
}

export default function Acompanhamento() {
  const { isAdmin, token } = useAuth();
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalSolicitacao, setModalSolicitacao] = useState<SolicitacaoItem | null>(null);
  const [modalDetalhe, setModalDetalhe] = useState<DetalheSolicitacao | null>(null);
  const [modalDetalheLoading, setModalDetalheLoading] = useState(false);
  const [modalDetalheNaoEncontrado, setModalDetalheNaoEncontrado] = useState(false);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

  const apiConfigurada = !!getApiBase() && !!token;

  useEffect(() => {
    if (!modalSolicitacao) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalSolicitacao(null);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [modalSolicitacao]);

  useEffect(() => {
    if (!modalSolicitacao || !token || !getApiBase()) {
      setModalDetalhe(null);
      setModalDetalheLoading(false);
      setModalDetalheNaoEncontrado(false);
      return;
    }
    setModalDetalheLoading(true);
    setModalDetalhe(null);
    setModalDetalheNaoEncontrado(false);
    obterDetalheSolicitacao(token, modalSolicitacao.id)
      .then((res) => {
        if (res.naoEncontrado) setModalDetalheNaoEncontrado(true);
        else if (res.sucesso && res.dados) setModalDetalhe(res.dados);
      })
      .catch(() => {
        setModalDetalhe(null);
        setModalDetalheNaoEncontrado(false);
      })
      .finally(() => setModalDetalheLoading(false));
  }, [modalSolicitacao?.id, token]);

  useEffect(() => {
    if (!apiConfigurada) {
      setSolicitacoes([]);
      setErroApi(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setErroApi(null);
    listarSolicitacoes(token!, {
      tipo: filtroTipo || undefined,
      status: filtroStatus || undefined,
      busca: busca || undefined,
    })
      .then((res) => {
        if (!cancelled && res.sucesso) {
          setSolicitacoes(res.dados);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSolicitacoes([]);
          setErroApi(err instanceof Error ? err.message : 'Falha ao carregar solicitações');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [apiConfigurada, token, filtroTipo, filtroStatus, busca]);

  const alterarStatus = useCallback(
    async (item: SolicitacaoItem, novoStatus: string) => {
      if (item.status === novoStatus) return;
      if (apiConfigurada && token) {
        setAtualizandoStatus(true);
        try {
          const atualizado = await atualizarSolicitacao(token, item.id, { status: novoStatus });
          setSolicitacoes((prev) =>
            prev.map((s) => (s.id === item.id ? { ...s, status: atualizado.status } : s))
          );
          setModalSolicitacao((prev) => (prev?.id === item.id ? { ...prev, status: atualizado.status } : prev));
          setErroApi(null);
        } catch {
          setErroApi('Falha ao atualizar status');
        } finally {
          setAtualizandoStatus(false);
        }
      }
    },
    [apiConfigurada, token]
  );

  const exibir = solicitacoes;

  const totalRows = exibir.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const pageIndex = Math.min(page, totalPages - 1);
  const paginatedRows = exibir.slice(pageIndex * rowsPerPage, (pageIndex + 1) * rowsPerPage);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageContent maxWidth="6xl">
      <PageHeader
        title="Acompanhamento de solicitações"
        description="Visualize e gerencie solicitações de todas as empresas"
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Solicitações</CardTitle>
            <CardDescription className="text-sm">
              Listagem e gestão de status. Filtre por tipo, status ou busque por empresa.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!loading && !erroApi && solicitacoes.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 border-b border-border px-6 py-4">
            <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-input bg-muted/30 px-3 py-2">
              <Search className="size-5 shrink-0 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por empresa ou tipo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="h-9 w-[200px] rounded-lg"
              >
                <option value="">Tipo</option>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
              <Select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="h-9 w-[140px] rounded-lg"
              >
                <option value="">Status</option>
                <option value="Pendente">Pendente</option>
                <option value="Em análise">Em análise</option>
                <option value="Concluído">Concluído</option>
              </Select>
            </div>
          </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : solicitacoes.length === 0 ? (
            <div className="px-6 py-8">
              <p className="text-center text-sm text-muted-foreground">
                {erroApi ? (
                  <span className="text-destructive">{erroApi}</span>
                ) : !apiConfigurada ? (
                  'Configure a API (VITE_API_URL) e faça login para listar as solicitações.'
                ) : (
                  'Nenhuma solicitação encontrada. Crie solicitações (CAT, PPP, Cargo, etc.) para vê-las aqui.'
                )}
              </p>
            </div>
          ) : (
            <>
              <div className="px-6 pb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">ID</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-28 text-center">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          Nenhuma solicitação encontrada com os filtros aplicados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRows.map((s, index) => (
                        <TableRow
                          key={s.id}
                          className={`cursor-pointer ${index % 2 === 0 ? 'acompanhamento-row-even' : 'acompanhamento-row-odd'} ${modalSolicitacao?.id === s.id ? 'acompanhamento-row-selected' : ''} hover:bg-muted/50`}
                          onClick={() => setModalSolicitacao(s)}
                        >
                          <TableCell className="font-mono text-sm font-medium">{s.id}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-2">
                              <Building2 className="size-4 shrink-0 text-muted-foreground" />
                              {s.empresa}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-2 text-sm">
                              <FileText className="size-4 shrink-0 text-muted-foreground" />
                              {s.tipo}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{formatDate(s.data)}</TableCell>
                          <TableCell>
                            <span className={`acompanhamento-status-cell acompanhamento-status-cell--${statusBadgeVariant(s.status)}`}>
                              {s.status === 'Concluído' && <CircleCheck className="acompanhamento-status-icon" />}
                              {s.status === 'Em análise' && <Cog className="acompanhamento-status-icon" />}
                              {s.status === 'Pendente' && <Clock className="acompanhamento-status-icon" />}
                              {s.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-muted-foreground text-xs">Clique para abrir</span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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

              {erroApi && (
                <p className="px-6 pb-4 text-sm text-destructive">
                  {erroApi}
                </p>
              )}
              {!apiConfigurada && !loading && (
                <p className="px-6 pb-4 text-sm text-muted-foreground">
                  Configure VITE_API_URL no .env (ex.: http://localhost:3001), inicie o backend e faça login como administrador para listar todas as solicitações.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {modalSolicitacao && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => setModalSolicitacao(null)}
        >
          <Card
            className="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <CardTitle id="modal-title" className="text-lg">Detalhes da solicitação</CardTitle>
                <CardDescription className="mt-1">
                  ID {modalSolicitacao.id} · {modalSolicitacao.tipo}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full"
                onClick={() => setModalSolicitacao(null)}
                aria-label="Fechar"
              >
                <X className="size-5" />
              </Button>
            </CardHeader>
            <CardContent className="py-4 overflow-y-auto flex-1">
              {modalDetalheLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Carregando detalhes...</p>
                </div>
              ) : modalDetalheNaoEncontrado ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Solicitação não encontrada. Ela pode ter sido removida ou você não tem permissão para visualizá-la.
                </p>
              ) : (
                <>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">ID</dt>
                      <dd className="font-mono font-medium">{modalSolicitacao.id}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Tipo</dt>
                      <dd>{modalSolicitacao.tipo}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Data</dt>
                      <dd>{formatDate(modalSolicitacao.data)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>
                        <span className={`acompanhamento-status-cell acompanhamento-status-cell--${statusBadgeVariant(modalSolicitacao.status)}`}>
                          {modalSolicitacao.status === 'Concluído' && <CircleCheck className="acompanhamento-status-icon" />}
                          {modalSolicitacao.status === 'Em análise' && <Cog className="acompanhamento-status-icon" />}
                          {modalSolicitacao.status === 'Pendente' && <Clock className="acompanhamento-status-icon" />}
                          {modalSolicitacao.status}
                        </span>
                      </dd>
                    </div>
                    {modalDetalhe?.referencia_id && (
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Referência (ID da entidade)</dt>
                        <dd className="font-mono text-xs break-all">{modalDetalhe.referencia_id}</dd>
                      </div>
                    )}
                    {(modalSolicitacao.descricao || (modalDetalhe?.descricao && !modalSolicitacao.descricao)) && (
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Descrição</dt>
                        <dd className="mt-0.5">{modalSolicitacao.descricao || modalDetalhe?.descricao}</dd>
                      </div>
                    )}
                  </dl>

                  {modalDetalhe?.empresa && (
                    <div className="mt-5 rounded-lg border border-border bg-muted/20 p-4">
                      <p className="mb-3 text-sm font-medium text-foreground">Dados da empresa</p>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <dt className="text-muted-foreground">Razão social</dt>
                          <dd className="font-medium">{modalDetalhe.empresa.razao_social}</dd>
                        </div>
                        {modalDetalhe.empresa.nome_fantasia && (
                          <div>
                            <dt className="text-muted-foreground">Nome fantasia</dt>
                            <dd>{modalDetalhe.empresa.nome_fantasia}</dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-muted-foreground">CNPJ</dt>
                          <dd className="font-mono">
                            {modalDetalhe.empresa.cnpj.length === 14
                              ? modalDetalhe.empresa.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
                              : modalDetalhe.empresa.cnpj}
                          </dd>
                        </div>
                        {modalDetalhe.empresa.endereco && (
                          <div className="sm:col-span-2">
                            <dt className="text-muted-foreground">Endereço</dt>
                            <dd>{modalDetalhe.empresa.endereco}</dd>
                          </div>
                        )}
                        {modalDetalhe.empresa.telefone && (
                          <div>
                            <dt className="text-muted-foreground">Telefone</dt>
                            <dd>{modalDetalhe.empresa.telefone}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}

                  {(modalDetalhe?.solicitante?.nome || modalDetalhe?.solicitante?.email || modalDetalhe?.solicitante?.telefone) && (
                    <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4">
                      <p className="mb-3 text-sm font-medium text-foreground">Responsável pela solicitação</p>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                        {modalDetalhe.solicitante.nome && (
                          <div>
                            <dt className="text-muted-foreground">Nome</dt>
                            <dd className="font-medium">{modalDetalhe.solicitante.nome}</dd>
                          </div>
                        )}
                        {modalDetalhe.solicitante.email && (
                          <div>
                            <dt className="text-muted-foreground">E-mail</dt>
                            <dd>{modalDetalhe.solicitante.email}</dd>
                          </div>
                        )}
                        {modalDetalhe.solicitante.telefone && (
                          <div>
                            <dt className="text-muted-foreground">Telefone</dt>
                            <dd>{modalDetalhe.solicitante.telefone}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}

                  {modalDetalhe?.payload != null && typeof modalDetalhe.payload === 'object' && Object.keys(modalDetalhe.payload as object).length > 0 && (
                    <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4">
                      <p className="mb-3 text-sm font-medium text-foreground">Dados específicos da solicitação</p>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                        {Object.entries(modalDetalhe.payload as Record<string, unknown>)
                          .filter(([, v]) => v != null && v !== '')
                          .map(([key, value]) => {
                            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
                            const display = typeof value === 'object'
                              ? (Array.isArray(value) ? value.join(', ') : JSON.stringify(value))
                              : String(value);
                            return (
                              <div key={key} className={display.length > 80 ? 'sm:col-span-2' : undefined}>
                                <dt className="text-muted-foreground">{label}</dt>
                                <dd className="mt-0.5 break-words">{display}</dd>
                              </div>
                            );
                          })}
                      </dl>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="mb-3 text-sm font-medium text-foreground">Alterar status</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={modalSolicitacao.status === 'Pendente' ? 'default' : 'outline'}
                    size="sm"
                    disabled={atualizandoStatus}
                    onClick={() => alterarStatus(modalSolicitacao, 'Pendente')}
                  >
                    <Clock className="size-4 mr-1.5 shrink-0" />
                    Pendente
                  </Button>
                  <Button
                    variant={modalSolicitacao.status === 'Em análise' ? 'default' : 'outline'}
                    size="sm"
                    disabled={atualizandoStatus}
                    onClick={() => alterarStatus(modalSolicitacao, 'Em análise')}
                  >
                    <Cog className="size-4 mr-1.5 shrink-0" />
                    Em análise
                  </Button>
                  <Button
                    variant={modalSolicitacao.status === 'Concluído' ? 'default' : 'outline'}
                    size="sm"
                    disabled={atualizandoStatus}
                    onClick={() => alterarStatus(modalSolicitacao, 'Concluído')}
                  >
                    <CircleCheck className="size-4 mr-1.5 shrink-0" />
                    Concluído
                  </Button>
                </div>
                {atualizandoStatus && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    Atualizando...
                  </p>
                )}
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-row justify-end gap-2 border-t border-border">
              <Button variant="outline" onClick={() => setModalSolicitacao(null)}>
                Fechar
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </PageContent>
  );
}
