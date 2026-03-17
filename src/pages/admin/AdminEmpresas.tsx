import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getApiBase } from '@/services/api';
import { listarEmpresas, criarEmpresa, atualizarEmpresa, type EmpresaItem } from '@/services/admin';
import { PageHeader } from '@/components/PageHeader';
import { PageContent } from '@/components/PageContent';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, Plus, Loader2, X, Search } from 'lucide-react';

const ROWS_PER_PAGE_OPCOES = [10, 20, 30, 50] as const;

function formatCnpj(v: string) {
  const n = v.replace(/\D/g, '');
  if (n.length <= 14) return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return v;
}

export default function AdminEmpresas() {
  const { isAdmin, token } = useAuth();
  const [empresas, setEmpresas] = useState<EmpresaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErro, setFormErro] = useState<string | null>(null);
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState<EmpresaItem | null>(null);
  const [editNomeFantasia, setEditNomeFantasia] = useState('');
  const [editEndereco, setEditEndereco] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFormErro, setEditFormErro] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const carregar = () => {
    if (!token || !getApiBase()) return;
    setLoading(true);
    setErro(null);
    listarEmpresas(token)
      .then((res) => {
        if (res.sucesso) setEmpresas(res.dados);
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Falha ao carregar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => carregar(), [token]);
  useEffect(() => setPage(0), [busca]);

  const buscaNorm = busca.trim().toLowerCase();
  const buscaSoDigitos = buscaNorm.replace(/\D/g, '');
  const empresasFiltradas = buscaNorm
    ? empresas.filter(
        (e) =>
          (e.razao_social ?? '').toLowerCase().includes(buscaNorm) ||
          (e.nome_fantasia ?? '').toLowerCase().includes(buscaNorm) ||
          (buscaSoDigitos.length >= 2 && e.cnpj.replace(/\D/g, '').includes(buscaSoDigitos))
      )
    : empresas;

  const totalRows = empresasFiltradas.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const pageIndex = Math.min(page, Math.max(0, totalPages - 1));
  const paginatedRows = empresasFiltradas.slice(pageIndex * rowsPerPage, (pageIndex + 1) * rowsPerPage);

  if (!isAdmin) return <Navigate to="/" replace />;

  const abrirModal = () => {
    setRazaoSocial('');
    setNomeFantasia('');
    setCnpj('');
    setEndereco('');
    setTelefone('');
    setFormErro(null);
    setModalAberto(true);
  };

  const fecharModal = () => setModalAberto(false);

  const abrirEdicao = (e: EmpresaItem) => {
    setEditando(e);
    setEditNomeFantasia(e.nome_fantasia ?? '');
    setEditEndereco(e.endereco ?? '');
    setEditTelefone(e.telefone ?? '');
    setEditFormErro(null);
  };

  const fecharEdicao = () => {
    setEditando(null);
    setEditFormErro(null);
  };

  const handleSubmitEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando || !token) return;
    setEditFormErro(null);
    setEditSubmitting(true);
    try {
      await atualizarEmpresa(token, editando.id, {
        nome_fantasia: editNomeFantasia.trim() || undefined,
        endereco: editEndereco.trim() || undefined,
        telefone: editTelefone.trim() || undefined,
      });
      fecharEdicao();
      carregar();
    } catch (err) {
      setEditFormErro(err instanceof Error ? err.message : 'Falha ao atualizar');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErro(null);
    if (!token) return;
    if (!razaoSocial.trim()) {
      setFormErro('Razão social é obrigatória');
      return;
    }
    if (!cnpj.replace(/\D/g, '').trim()) {
      setFormErro('CNPJ é obrigatório');
      return;
    }
    setSubmitting(true);
    try {
      await criarEmpresa(token, {
        razaoSocial: razaoSocial.trim(),
        nomeFantasia: nomeFantasia.trim() || undefined,
        cnpj: cnpj.replace(/\D/g, ''),
        endereco: endereco.trim() || undefined,
        telefone: telefone.trim() || undefined,
      });
      fecharModal();
      carregar();
    } catch (err) {
      setFormErro(err instanceof Error ? err.message : 'Falha ao criar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContent maxWidth="6xl">
      <PageHeader
        title="Empresas"
        description="Cadastro de empresas vinculadas ao sistema"
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Listagem</CardTitle>
            <CardDescription className="text-sm">Todas as empresas cadastradas</CardDescription>
          </div>
          <Button onClick={abrirModal}>
            <Plus className="size-4 mr-2" />
            Nova empresa
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {!loading && !erro && empresas.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 border-b border-border px-6 py-4">
              <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-input bg-muted/30 px-3 py-2">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                />
              </div>
              {buscaNorm && (
                <span className="text-sm text-muted-foreground">
                  {empresasFiltradas.length} de {empresas.length} resultado(s)
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
          ) : empresas.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma empresa cadastrada.</p>
          ) : empresasFiltradas.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum resultado para &quot;{busca.trim()}&quot;.</p>
          ) : (
            <>
              <div className="px-6 pb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Razão social</TableHead>
                      <TableHead>Nome fantasia</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Telefone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRows.map((e) => (
                      <TableRow
                        key={e.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => abrirEdicao(e)}
                      >
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <Building2 className="size-4 shrink-0 text-muted-foreground" />
                            {e.razao_social}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{e.nome_fantasia ?? '—'}</TableCell>
                        <TableCell className="font-mono text-sm">{formatCnpj(e.cnpj)}</TableCell>
                        <TableCell className="text-sm">{e.telefone ?? '—'}</TableCell>
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
              <CardTitle className="text-lg">Nova empresa</CardTitle>
              <Button variant="ghost" size="icon" onClick={fecharModal} aria-label="Fechar"><X className="size-5" /></Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {formErro && (
                  <p className="text-sm text-destructive">{formErro}</p>
                )}
                <FieldGroup>
                  <Field>
                    <FieldLabel>Razão social *</FieldLabel>
                    <Input value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder="Razão social" />
                  </Field>
                  <Field>
                    <FieldLabel>Nome fantasia</FieldLabel>
                    <Input value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} placeholder="Nome fantasia" />
                  </Field>
                  <Field>
                    <FieldLabel>CNPJ *</FieldLabel>
                    <Input
                      value={cnpj}
                      onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                      placeholder="00.000.000/0001-00"
                      maxLength={18}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Endereço</FieldLabel>
                    <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Endereço" />
                  </Field>
                  <Field>
                    <FieldLabel>Telefone</FieldLabel>
                    <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
                  </Field>
                </FieldGroup>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={fecharModal}>Cancelar</Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Salvando...' : 'Cadastrar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {editando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="editar-empresa-title"
          onClick={fecharEdicao}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle id="editar-empresa-title" className="text-lg">Editar empresa</CardTitle>
              <Button variant="ghost" size="icon" onClick={fecharEdicao} aria-label="Fechar"><X className="size-5" /></Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitEdicao} className="space-y-4">
                {editFormErro && (
                  <p className="text-sm text-destructive">{editFormErro}</p>
                )}
                <FieldGroup>
                  <Field>
                    <FieldLabel>Razão social</FieldLabel>
                    <Input value={editando.razao_social} readOnly disabled className="bg-muted" />
                  </Field>
                  <Field>
                    <FieldLabel>CNPJ</FieldLabel>
                    <Input value={formatCnpj(editando.cnpj)} readOnly disabled className="bg-muted font-mono" />
                  </Field>
                  <Field>
                    <FieldLabel>Nome fantasia</FieldLabel>
                    <Input
                      value={editNomeFantasia}
                      onChange={(e) => setEditNomeFantasia(e.target.value)}
                      placeholder="Nome fantasia"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Endereço</FieldLabel>
                    <Input
                      value={editEndereco}
                      onChange={(e) => setEditEndereco(e.target.value)}
                      placeholder="Endereço"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Telefone</FieldLabel>
                    <Input
                      value={editTelefone}
                      onChange={(e) => setEditTelefone(e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </Field>
                </FieldGroup>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={fecharEdicao}>Cancelar</Button>
                  <Button type="submit" disabled={editSubmitting}>
                    {editSubmitting ? 'Salvando...' : 'Salvar'}
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
