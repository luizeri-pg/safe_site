import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch, getApiBase } from '@/services/api';
import { Search, Ticket, Calendar, AlertCircle, Building2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
import { PageHeader } from '@/components/PageHeader';
import { PageContent } from '@/components/PageContent';
import './AberturaChamado.css';

const CHAMADO_STEPS = [
  { step: 1, title: 'Empresa', description: 'Dados da empresa' },
  { step: 2, title: 'Dados do chamado', description: 'Título, prioridade e descrição' },
  { step: 3, title: 'Solicitante', description: 'Quem está abrindo o chamado' },
] as const;

/** Chamado para o painel */
interface ChamadoItem {
  id: number | string;
  numero: string;
  titulo: string;
  prioridade: string;
  status: string;
  dataAbertura: string;
  empresa: string;
}

const IS_DEV = import.meta.env.DEV;

/** Dados de exemplo para o painel em desenvolvimento */
const MOCK_CHAMADOS: ChamadoItem[] = [
  { id: 'mock-1', numero: '2024-001', titulo: 'Falha no equipamento de proteção', prioridade: 'Alta', status: 'Em atendimento', dataAbertura: new Date().toISOString().slice(0, 10), empresa: 'Safe Gestão' },
  { id: 'mock-2', numero: '2024-002', titulo: 'Solicitação de laudo técnico', prioridade: 'Média', status: 'Aberto', dataAbertura: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), empresa: 'Safe Gestão' },
  { id: 'mock-3', numero: '2024-003', titulo: 'Dúvida sobre NR-12', prioridade: 'Baixa', status: 'Resolvido', dataAbertura: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), empresa: 'Safe Gestão' },
  { id: 'mock-4', numero: '2024-004', titulo: 'Manutenção preventiva - máquina X', prioridade: 'Média', status: 'Fechado', dataAbertura: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), empresa: 'Safe Gestão' },
  { id: 'mock-5', numero: '2024-005', titulo: 'Troca de EPI - lote vencido', prioridade: 'Alta', status: 'Aberto', dataAbertura: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), empresa: 'Safe Gestão' },
];

function formatDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AberturaChamado() {
  const location = useLocation();
  const { token, userEmpresaNome, userEmpresaRazaoSocial, userEmpresaCnpj } = useAuth();
  const basePath = '/abertura-chamado';
  const pathEnd = location.pathname.replace(basePath, '').replace(/^\//, '') || 'gera-chamado';
  const isPainel = pathEnd === 'painel';

  // --- Formulário Gera chamado
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');

  const [tituloChamado, setTituloChamado] = useState('');
  const [descricaoChamado, setDescricaoChamado] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [categoria, setCategoria] = useState('');

  const [nomeSolicitante, setNomeSolicitante] = useState('');
  const [emailSolicitante, setEmailSolicitante] = useState('');
  const [telefoneSolicitante, setTelefoneSolicitante] = useState('');

  const [activeStep, setActiveStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // --- Painel (dados da API)
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [chamados, setChamados] = useState<ChamadoItem[]>([]);
  const [chamadosLoading, setChamadosLoading] = useState(false);

  useEffect(() => {
    if (!isPainel || !getApiBase() || !token) return;
    let cancelled = false;
    setChamadosLoading(true);
    apiFetch('/api/chamados', token)
      .then((res) => res.json())
      .then((data: { sucesso?: boolean; dados?: { id: string; numero: string; titulo: string; prioridade: string; status: string; data_abertura: string; empresa: string }[] }) => {
        if (!cancelled && data.sucesso && Array.isArray(data.dados)) {
          setChamados(
            data.dados.map((c) => ({
              id: c.id,
              numero: c.numero ?? '',
              titulo: c.titulo,
              prioridade: c.prioridade,
              status: c.status,
              dataAbertura: c.data_abertura,
              empresa: c.empresa,
            }))
          );
        }
      })
      .catch(() => { if (!cancelled) setChamados([]); })
      .finally(() => { if (!cancelled) setChamadosLoading(false); });
    return () => { cancelled = true; };
  }, [isPainel, token]);

  const useMockChamados = IS_DEV && isPainel && chamados.length === 0;
  const chamadosDaEmpresa = chamados.length > 0 ? chamados : (useMockChamados ? MOCK_CHAMADOS : []);
  const chamadosFiltrados = chamadosDaEmpresa.filter((c) => {
    if (filtroStatus && c.status !== filtroStatus) return false;
    if (filtroPrioridade && c.prioridade !== filtroPrioridade) return false;
    if (busca) {
      const b = busca.toLowerCase();
      if (!c.titulo.toLowerCase().includes(b) && !c.numero.toLowerCase().includes(b)) return false;
    }
    return true;
  });

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const enviarChamado = async () => {
    if (activeStep !== CHAMADO_STEPS.length) return;
    const payload = {
      empresa: {
        razaoSocial: userEmpresaRazaoSocial ?? razaoSocial,
        cnpj: userEmpresaCnpj ?? cnpj,
        endereco,
        telefone,
      },
      chamado: { titulo: tituloChamado, descricao: descricaoChamado, prioridade, categoria },
      solicitante: { nome: nomeSolicitante, email: emailSolicitante, telefone: telefoneSolicitante },
    };
    if (!getApiBase() || !token) {
      alert('Chamado registrado (modo offline). Configure a API e faça login para enviar ao servidor.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/chamados', token, { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { mensagem?: string }).mensagem ?? 'Falha ao enviar');
      alert('Chamado registrado. Número de protocolo será gerado em breve.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao enviar');
    } finally {
      setSubmitting(false);
    }
  };

  // ========== PAINEL DE ACOMPANHAMENTO ==========
  if (isPainel) {
    return (
      <PageContent maxWidth="6xl">
        <PageHeader
          title="Abertura de Chamado"
          description={
            userEmpresaNome
              ? `Painel de acompanhamento — chamados da sua empresa (${userEmpresaNome})`
              : 'Painel de acompanhamento — chamados da sua empresa'
          }
        />

        {!userEmpresaNome && (
          <Card className="chamado-painel-card chamado-painel-aviso">
            <CardContent className="py-6">
              <p className="text-center text-sm text-muted-foreground">
                Você não está vinculado a uma empresa. Entre em contato com o administrador para vincular seu usuário a uma empresa e acompanhar seus chamados.
              </p>
            </CardContent>
          </Card>
        )}

        {(userEmpresaNome || useMockChamados) && (
          <>
        <div className="chamado-painel-filtros">
          <div className="chamado-painel-busca">
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por número ou título..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="chamado-painel-selects">
            <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="h-9 w-[180px] rounded-lg">
              <option value="">Status</option>
              <option value="Aberto">Aberto</option>
              <option value="Em atendimento">Em atendimento</option>
              <option value="Resolvido">Resolvido</option>
              <option value="Fechado">Fechado</option>
            </Select>
            <Select value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)} className="h-9 w-[140px] rounded-lg">
              <option value="">Prioridade</option>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </Select>
          </div>
        </div>

        {useMockChamados && (
          <p className="mb-3 text-center text-xs text-muted-foreground">
            Dados de exemplo. Abra um chamado real em &quot;Gerar Chamado&quot; ou configure a API para ver seus chamados.
          </p>
        )}
        <Card className="chamado-painel-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Nº</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead className="w-28">Prioridade</TableHead>
                    <TableHead className="w-32">Status</TableHead>
                    <TableHead className="w-28">Data abertura</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chamadosLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : chamadosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Nenhum chamado encontrado com os filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    chamadosFiltrados.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-sm font-medium">{c.numero}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <Ticket className="size-4 shrink-0 text-muted-foreground" />
                            {c.titulo}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <Building2 className="size-4 shrink-0 text-muted-foreground" />
                            {c.empresa}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`chamado-prioridade chamado-prioridade--${c.prioridade.toLowerCase()}`}>
                            {c.prioridade === 'Alta' && <AlertCircle className="size-4 shrink-0" />}
                            {c.prioridade}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="chamado-status chamado-status--aberto">{c.status}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="size-4 shrink-0" />
                            {formatDate(c.dataAbertura)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </PageContent>
    );
  }

  // ========== GERA CHAMADO (formulário) ==========
  return (
    <PageContent maxWidth="6xl" className="pb-16 chamado-form-page">
      <PageHeader
        title="Abertura de Chamado"
        description="Gera chamado — preencha os dados para abrir um novo chamado"
        className="chamado-page-header"
      />

      <div className="chamado-step-indicator">
        <span className="chamado-step-label">
          Passo {activeStep} de {CHAMADO_STEPS.length}
        </span>
        <span className="chamado-step-title">{CHAMADO_STEPS[activeStep - 1].title}</span>
        <div className="chamado-step-bar" role="progressbar" aria-valuenow={activeStep} aria-valuemin={1} aria-valuemax={CHAMADO_STEPS.length}>
          <div className="chamado-step-bar-fill" style={{ width: `${(activeStep / CHAMADO_STEPS.length) * 100}%` }} />
        </div>
      </div>

      <form onSubmit={handleSubmitForm} className="chamado-form w-full space-y-6 mt-6">
        <div className="chamado-form__step min-h-[320px] w-full">
          {activeStep === 1 && (
            <Card className="chamado-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">1. Dados da empresa</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Razão social, CNPJ, endereço e contato</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>Razão social</FieldLabel>
                    <Input
                      value={userEmpresaRazaoSocial ?? razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      placeholder="Razão social"
                      readOnly={!!userEmpresaRazaoSocial}
                      className={userEmpresaRazaoSocial ? 'bg-muted/50' : ''}
                    />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>CNPJ</FieldLabel>
                      <Input
                        value={userEmpresaCnpj ?? cnpj}
                        onChange={(e) => setCnpj(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        readOnly={!!userEmpresaCnpj}
                        className={userEmpresaCnpj ? 'bg-muted/50' : ''}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Telefone</FieldLabel>
                      <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Endereço</FieldLabel>
                    <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Endereço completo" />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {activeStep === 2 && (
            <Card className="chamado-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">2. Dados do chamado</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Título, prioridade, categoria e descrição do problema ou solicitação</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>Título do chamado</FieldLabel>
                    <Input value={tituloChamado} onChange={(e) => setTituloChamado(e.target.value)} placeholder="Resumo do problema ou solicitação" />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Prioridade</FieldLabel>
                      <Select value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
                        <option value="">Selecione</option>
                        <option value="Baixa">Baixa</option>
                        <option value="Média">Média</option>
                        <option value="Alta">Alta</option>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Categoria</FieldLabel>
                      <Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                        <option value="">Selecione</option>
                        <option value="Técnico">Técnico</option>
                        <option value="Vistoria">Vistoria</option>
                        <option value="Dúvida">Dúvida</option>
                        <option value="Outros">Outros</option>
                      </Select>
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Descrição</FieldLabel>
                    <Textarea value={descricaoChamado} onChange={(e) => setDescricaoChamado(e.target.value)} placeholder="Descreva o problema ou solicitação em detalhes" rows={4} />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {activeStep === 3 && (
            <Card className="chamado-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">3. Solicitante</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Dados de quem está abrindo o chamado</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>Nome do solicitante</FieldLabel>
                    <Input value={nomeSolicitante} onChange={(e) => setNomeSolicitante(e.target.value)} placeholder="Nome completo" />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>E-mail</FieldLabel>
                      <Input type="email" value={emailSolicitante} onChange={(e) => setEmailSolicitante(e.target.value)} placeholder="email@empresa.com" />
                    </Field>
                    <Field>
                      <FieldLabel>Telefone</FieldLabel>
                      <Input value={telefoneSolicitante} onChange={(e) => setTelefoneSolicitante(e.target.value)} placeholder="(00) 00000-0000" />
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="chamado-form-actions">
          <Button type="button" variant="outline" size="lg" className="w-full min-w-0" onClick={() => setActiveStep((s) => s - 1)} disabled={activeStep === 1}>
            Anterior
          </Button>
          {activeStep < 3 ? (
            <Button type="button" variant="default" size="lg" className="w-full min-w-0" onClick={() => setActiveStep((s) => s + 1)}>Próximo</Button>
          ) : (
            <Button type="button" variant="default" size="lg" className="w-full min-w-0" disabled={submitting} onClick={enviarChamado}>
              {submitting ? 'Enviando...' : 'Abrir chamado'}
            </Button>
          )}
        </div>
      </form>
    </PageContent>
  );
}
