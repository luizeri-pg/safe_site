import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getApiBase } from '@/services/api';
import {
  listarUsuarios,
  listarEmpresas,
  criarUsuario,
  atualizarUsuario,
  type UsuarioItem,
  type EmpresaItem,
} from '@/services/admin';
import { PageHeader } from '@/components/PageHeader';
import { PageContent } from '@/components/PageContent';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserPlus, Loader2, Pencil, X, Search } from 'lucide-react';

const ROWS_PER_PAGE_OPCOES = [10, 20, 30, 50] as const;

export default function AdminUsuarios() {
  const { isAdmin, token } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState<'criar' | 'editar' | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErro, setFormErro] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('client');
  const [empresaId, setEmpresaId] = useState('');
  const [busca, setBusca] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('');
  const [filtroEmpresaId, setFiltroEmpresaId] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const carregar = () => {
    if (!token || !getApiBase()) return;
    setLoading(true);
    setErro(null);
    Promise.all([listarUsuarios(token), listarEmpresas(token)])
      .then(([r1, r2]) => {
        if (r1.sucesso) setUsuarios(r1.dados);
        if (r2.sucesso) setEmpresas(r2.dados);
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Falha ao carregar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => carregar(), [token]);
  useEffect(() => setPage(0), [busca, filtroPerfil, filtroEmpresaId]);

  const buscaNorm = busca.trim().toLowerCase();
  const usuariosFiltrados = usuarios.filter((u) => {
    if (filtroPerfil === 'admin' && u.role !== 'admin') return false;
    if (filtroPerfil === 'client' && u.role !== 'client') return false;
    if (filtroEmpresaId && (u.empresa_id ?? '') !== filtroEmpresaId) return false;
    if (buscaNorm) {
      const matchEmail = (u.email ?? '').toLowerCase().includes(buscaNorm);
      const matchEmpresa = (u.empresa_nome ?? '').toLowerCase().includes(buscaNorm);
      if (!matchEmail && !matchEmpresa) return false;
    }
    return true;
  });

  const totalRows = usuariosFiltrados.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const pageIndex = Math.min(page, Math.max(0, totalPages - 1));
  const paginatedRows = usuariosFiltrados.slice(pageIndex * rowsPerPage, (pageIndex + 1) * rowsPerPage);

  if (!isAdmin) return <Navigate to="/" replace />;

  const abrirCriar = () => {
    setEmail('');
    setSenha('');
    setRole('client');
    setEmpresaId('');
    setEditandoId(null);
    setFormErro(null);
    setModalAberto('criar');
  };

  const abrirEditar = (u: UsuarioItem) => {
    setEditandoId(u.id);
    setEmail(u.email);
    setSenha('');
    setRole(u.role);
    setEmpresaId(u.empresa_id ?? '');
    setFormErro(null);
    setModalAberto('editar');
  };

  const fecharModal = () => {
    setModalAberto(null);
    setEditandoId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErro(null);
    if (!token) return;
    const emailTrim = email.trim().toLowerCase();
    if (!emailTrim) {
      setFormErro('E-mail é obrigatório');
      return;
    }
    if (modalAberto === 'criar' && !senha) {
      setFormErro('Senha é obrigatória');
      return;
    }
    if (modalAberto === 'criar' && senha.length < 4) {
      setFormErro('Senha deve ter no mínimo 4 caracteres');
      return;
    }
    setSubmitting(true);
    try {
      if (modalAberto === 'criar') {
        await criarUsuario(token, {
          email: emailTrim,
          senha,
          role,
          empresaId: empresaId || undefined,
        });
      } else if (editandoId) {
        await atualizarUsuario(token, editandoId, {
          email: emailTrim,
          ...(senha ? { senha } : {}),
          role,
          empresaId: empresaId || undefined,
        });
      }
      fecharModal();
      carregar();
    } catch (err) {
      setFormErro(err instanceof Error ? err.message : 'Falha ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContent maxWidth="6xl">
      <PageHeader
        title="Usuários"
        description="Cadastro e gestão de usuários do sistema"
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Listagem</CardTitle>
            <CardDescription className="text-sm">Usuários e vínculo com empresas</CardDescription>
          </div>
          <Button onClick={abrirCriar}>
            <UserPlus className="size-4 mr-2" />
            Novo usuário
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {!loading && !erro && usuarios.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 border-b border-border px-6 py-4">
              <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-input bg-muted/30 px-3 py-2">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por e-mail ou nome da empresa (razão social / fantasia)..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <Select
                value={filtroPerfil}
                onChange={(e) => setFiltroPerfil(e.target.value)}
                className="h-9 w-[160px] rounded-lg"
              >
                <option value="">Perfil (todos)</option>
                <option value="admin">Administrador</option>
                <option value="client">Cliente</option>
              </Select>
              <Select
                value={filtroEmpresaId}
                onChange={(e) => setFiltroEmpresaId(e.target.value)}
                className="h-9 w-[200px] rounded-lg"
              >
                <option value="">Empresa (todas)</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nome_fantasia || emp.razao_social}
                  </option>
                ))}
              </Select>
              {(buscaNorm || filtroPerfil || filtroEmpresaId) && (
                <span className="text-sm text-muted-foreground">
                  {usuariosFiltrados.length} de {usuarios.length} resultado(s)
                </span>
              )}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Carregando...</span>
            </div>
          ) : erro ? (
            <p className="py-8 text-center text-sm text-destructive">{erro}</p>
          ) : usuarios.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum usuário cadastrado.</p>
          ) : usuariosFiltrados.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum resultado com os filtros aplicados.
            </p>
          ) : (
            <>
              <div className="px-6 pb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead className="w-28">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRows.map((u) => (
                      <TableRow
                        key={u.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => abrirEditar(u)}
                      >
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>{u.role === 'admin' ? 'Administrador' : 'Cliente'}</TableCell>
                        <TableCell className="text-muted-foreground">{u.empresa_nome ?? '—'}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" onClick={() => abrirEditar(u)}>
                            <Pencil className="size-4 mr-1" />
                            Editar
                          </Button>
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

      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
          onClick={fecharModal}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">
                {modalAberto === 'criar' ? 'Novo usuário' : 'Editar usuário'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={fecharModal} aria-label="Fechar">
                <X className="size-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {formErro && <p className="text-sm text-destructive">{formErro}</p>}
                <FieldGroup>
                  <Field>
                    <FieldLabel>E-mail *</FieldLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>
                      Senha {modalAberto === 'editar' && '(deixe em branco para não alterar)'}
                    </FieldLabel>
                    <Input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Perfil</FieldLabel>
                    <Select value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="client">Cliente</option>
                      <option value="admin">Administrador</option>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Empresa</FieldLabel>
                    <Select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}>
                      <option value="">— Nenhuma —</option>
                      {empresas.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nome_fantasia || emp.razao_social}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </FieldGroup>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={fecharModal}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Salvando...' : modalAberto === 'criar' ? 'Cadastrar' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContent>
  );
}
