import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listarSolicitacoes, atualizarSolicitacao, type SolicitacaoItem } from '../services/solicitacoes';
import {
  Building2,
  FileText,
  Search,
  Eye,
  Loader2,
  CircleCheck,
  Clock,
  Cog,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
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

const MOCK_SOLICITACOES: SolicitacaoItem[] = [
  { id: 1, empresa: 'Empresa Alpha', tipo: 'Abertura de Chamado', data: '2025-03-11', status: 'Pendente' },
  { id: 2, empresa: 'Empresa Beta', tipo: 'Solicitação de PPP', data: '2025-03-10', status: 'Em análise' },
  { id: 3, empresa: 'Empresa Alpha', tipo: 'Manuais e Procedimentos', data: '2025-03-10', status: 'Concluído' },
  { id: 4, empresa: 'Empresa Gamma', tipo: 'Inclusão de Cargo', data: '2025-03-09', status: 'Pendente' },
  { id: 5, empresa: 'Empresa Beta', tipo: 'Solicitação de Visita Técnica', data: '2025-03-09', status: 'Em análise' },
  { id: 6, empresa: 'Empresa Alpha', tipo: 'Abertura de CAT', data: '2025-03-08', status: 'Concluído' },
];

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
  const [useApi, setUseApi] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (!token || !import.meta.env.VITE_API_URL) {
      setSolicitacoes(MOCK_SOLICITACOES);
      setUseApi(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    listarSolicitacoes(token, {
      tipo: filtroTipo || undefined,
      status: filtroStatus || undefined,
      busca: busca || undefined,
    })
      .then((res) => {
        if (!cancelled && res.sucesso) {
          setSolicitacoes(res.dados);
          setUseApi(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSolicitacoes(MOCK_SOLICITACOES);
          setUseApi(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token, filtroTipo, filtroStatus, busca]);

  const [, setAtualizandoId] = useState<number | null>(null);

  const alterarStatus = useCallback(
    async (item: SolicitacaoItem, novoStatus: string) => {
      if (item.status === novoStatus) return;
      if (useApi && token) {
        setAtualizandoId(item.id);
        try {
          const atualizado = await atualizarSolicitacao(token, item.id, { status: novoStatus });
          setSolicitacoes((prev) =>
            prev.map((s) => (s.id === item.id ? { ...s, status: atualizado.status } : s))
          );
        } catch {
          // manter estado anterior
        } finally {
          setAtualizandoId(null);
        }
      } else {
        setSolicitacoes((prev) =>
          prev.map((s) => (s.id === item.id ? { ...s, status: novoStatus } : s))
        );
      }
    },
    [useApi, token]
  );

  const exibir = useApi
    ? solicitacoes
    : solicitacoes.filter((s) => {
        if (filtroTipo && s.tipo !== filtroTipo) return false;
        if (filtroStatus && s.status !== filtroStatus) return false;
        if (busca) {
          const b = busca.toLowerCase();
          if (!s.empresa.toLowerCase().includes(b) && !s.tipo.toLowerCase().includes(b)) return false;
        }
        return true;
      });

  const totalRows = exibir.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const pageIndex = Math.min(page, totalPages - 1);
  const paginatedRows = exibir.slice(pageIndex * rowsPerPage, (pageIndex + 1) * rowsPerPage);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="acompanhamento">
      <header className="acompanhamento-header">
        <h1 className="acompanhamento-title">Acompanhamento de solicitações</h1>
        <p className="acompanhamento-subtitle">
          Visualize e gerencie solicitações de todas as empresas
        </p>
      </header>

      <div className="acompanhamento-filtros">
        <div className="acompanhamento-busca">
          <Search size={18} className="acompanhamento-busca-icon" />
          <input
            type="text"
            placeholder="Buscar por empresa ou tipo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="acompanhamento-busca-input"
          />
        </div>
        <div className="acompanhamento-filtros-select">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="acompanhamento-select"
          >
            <option value="">Tipo</option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="acompanhamento-select"
          >
            <option value="">Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Em análise">Em análise</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>
      </div>

      <div className="acompanhamento-card">
        {loading ? (
          <div className="acompanhamento-loading">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p>Carregando...</p>
          </div>
        ) : (
          <>
            <div className="acompanhamento-table-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">ID</TableHead>
                    <TableHead>Nome da empresa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quando foi criado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-28 acompanhamento-col-acao">
                      <span className="flex items-center justify-center gap-1.5">
                        <Eye className="size-4" />
                        Ação
                      </span>
                    </TableHead>
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
                        className={index % 2 === 0 ? 'acompanhamento-row-even' : 'acompanhamento-row-odd'}
                      >
                        <TableCell className="font-medium font-mono">{s.id}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <Building2 className="size-4 text-muted-foreground" />
                            {s.empresa}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="acompanhamento-tipo-cell">
                            <FileText className="size-4" />
                            {s.tipo}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(s.data)}</TableCell>
                        <TableCell>
                          <span className={`acompanhamento-status-cell acompanhamento-status-cell--${statusBadgeVariant(s.status)}`}>
                            {s.status === 'Concluído' && <CircleCheck className="acompanhamento-status-icon" />}
                            {s.status === 'Em análise' && <Cog className="acompanhamento-status-icon" />}
                            {s.status === 'Pendente' && <Clock className="acompanhamento-status-icon" />}
                            {s.status}
                          </span>
                        </TableCell>
                        <TableCell className="acompanhamento-col-acao">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="acompanhamento-action-trigger" title="Ação" aria-label="Ações">
                              <Eye className="size-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="acompanhamento-dropdown-content">
                              <DropdownMenuItem onClick={() => alterarStatus(s, 'Pendente')}>
                                Marcar como Pendente
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => alterarStatus(s, 'Em análise')}>
                                Marcar como Em análise
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => alterarStatus(s, 'Concluído')}>
                                Concluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="acompanhamento-pagination">
              <p className="text-sm text-muted-foreground">
                Total: {totalRows} linha(s).
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Linhas por página</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(0);
                    }}
                    className="acompanhamento-select acompanhamento-select--sm"
                  >
                    {ROWS_PER_PAGE_OPCOES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
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

            {!useApi && (
              <p className="acompanhamento-hint">
                Dados de exemplo. Configure VITE_API_URL e use o backend em C# para listar as solicitações reais.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
