import { useLocation } from 'react-router-dom';
import { useState, useCallback } from 'react';
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
import { PageHeader } from '@/components/PageHeader';
import { PageContent } from '@/components/PageContent';
import SolicitacoesPorTipoList from '@/components/SolicitacoesPorTipoList';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch, getApiBase } from '@/services/api';
import './InclusaoCargo.css';

const CARGO_STEPS = [
  { step: 1, title: 'Empresa', description: 'Dados da empresa' },
  { step: 2, title: 'Dados do cargo', description: 'Nome, CBO, setor e descrição' },
  { step: 3, title: 'Solicitação', description: 'Data e responsável' },
] as const;

export default function InclusaoCargo() {
  const location = useLocation();
  const { token, userEmpresaRazaoSocial, userEmpresaCnpj } = useAuth();
  const basePath = '/inclusao-cargo';
  const pathEnd = location.pathname.replace(basePath, '').replace(/^\//, '') || 'arquivos';
  const isAdicionar = pathEnd === 'adicionar' || location.pathname.endsWith('/adicionar');

  // 1. Dados da empresa
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');

  // 2. Dados do cargo
  const [nomeCargo, setNomeCargo] = useState('');
  const [cbo, setCbo] = useState('');
  const [setor, setSetor] = useState('');
  const [descricaoAtividades, setDescricaoAtividades] = useState('');
  const [grauRisco, setGrauRisco] = useState('');

  // 3. Solicitação
  const [dataSolicitacao, setDataSolicitacao] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [nomeSolicitante, setNomeSolicitante] = useState('');

  const [activeStep, setActiveStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const goToStep = useCallback((step: number) => setActiveStep(step), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      empresa: {
        razaoSocial: userEmpresaRazaoSocial ?? razaoSocial,
        cnpj: userEmpresaCnpj ?? cnpj,
        endereco,
        telefone,
      },
      cargo: { nomeCargo, cbo, setor, descricaoAtividades, grauRisco },
      solicitacao: { dataSolicitacao, nomeSolicitante },
    };
    if (!getApiBase() || !token) {
      alert('Solicitação registrada (modo offline). Configure a API e faça login para enviar ao servidor.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/cargos', token, { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { mensagem?: string }).mensagem ?? 'Falha ao enviar');
      alert('Solicitação de inclusão de cargo registrada.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao enviar');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdicionar) {
    return (
      <SolicitacoesPorTipoList
        tipo="Inclusão de Cargo"
        title="Inclusão de Cargo"
        description="Cadastro de novos cargos — suas solicitações"
        basePath="/inclusao-cargo"
        addLabel="Adicionar"
      />
    );
  }

  return (
    <PageContent maxWidth="6xl" className="pb-16 cargo-form-page">
      <PageHeader
        title="Inclusão de Cargo"
        description="Solicitação de inclusão de novo cargo — dados da empresa, do cargo e do solicitante"
        className="cargo-page-header"
      />

      <div className="cargo-step-indicator">
        <span className="cargo-step-label">
          Passo {activeStep} de {CARGO_STEPS.length}
        </span>
        <span className="cargo-step-title">{CARGO_STEPS[activeStep - 1].title}</span>
        <div className="cargo-step-bar" role="progressbar" aria-valuenow={activeStep} aria-valuemin={1} aria-valuemax={CARGO_STEPS.length}>
          <div className="cargo-step-bar-fill" style={{ width: `${(activeStep / CARGO_STEPS.length) * 100}%` }} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="cargo-form w-full space-y-6 mt-6">
        <div className="cargo-form__step min-h-[320px] w-full">
          {activeStep === 1 && (
            <Card className="cargo-card">
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
                      <FieldLabel>Telefone de contato</FieldLabel>
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
            <Card className="cargo-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">2. Dados do cargo</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Nome do cargo, CBO, setor, descrição das atividades e grau de risco</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>Nome do cargo</FieldLabel>
                    <Input value={nomeCargo} onChange={(e) => setNomeCargo(e.target.value)} placeholder="Ex.: Auxiliar administrativo" />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>CBO (Classificação Brasileira de Ocupações)</FieldLabel>
                      <Input value={cbo} onChange={(e) => setCbo(e.target.value)} placeholder="Código CBO" />
                    </Field>
                    <Field>
                      <FieldLabel>Setor</FieldLabel>
                      <Input value={setor} onChange={(e) => setSetor(e.target.value)} placeholder="Setor ou departamento" />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Grau de risco (eSocial)</FieldLabel>
                    <Select value={grauRisco} onChange={(e) => setGrauRisco(e.target.value)}>
                      <option value="">Selecione</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Descrição das atividades</FieldLabel>
                    <Textarea value={descricaoAtividades} onChange={(e) => setDescricaoAtividades(e.target.value)} placeholder="Descreva as atividades do cargo" rows={4} />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {activeStep === 3 && (
            <Card className="cargo-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">3. Solicitação</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Data e nome de quem solicitou a inclusão</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Data da solicitação</FieldLabel>
                      <Input type="date" value={dataSolicitacao} onChange={(e) => setDataSolicitacao(e.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel>Nome do solicitante</FieldLabel>
                      <Input value={nomeSolicitante} onChange={(e) => setNomeSolicitante(e.target.value)} placeholder="Nome completo" />
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="cargo-form-actions">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full min-w-0"
            onClick={() => setActiveStep((s) => s - 1)}
            disabled={activeStep === 1}
          >
            Anterior
          </Button>
          {activeStep < 3 ? (
            <Button type="button" variant="default" size="lg" className="w-full min-w-0" onClick={() => setActiveStep((s) => s + 1)}>
              Próximo
            </Button>
          ) : (
            <Button type="submit" variant="default" size="lg" className="w-full min-w-0" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar solicitação'}
            </Button>
          )}
        </div>
      </form>
    </PageContent>
  );
}
