import { useLocation } from 'react-router-dom';
import { useState } from 'react';
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
import './InclusaoNovaUnidade.css';

const UNIDADE_STEPS = [
  { step: 1, title: 'Empresa', description: 'Dados da empresa' },
  { step: 2, title: 'Dados da unidade', description: 'Nome, endereço, CNPJ e contato' },
  { step: 3, title: 'Solicitação', description: 'Data e responsável' },
] as const;

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'] as const;

export default function InclusaoNovaUnidade() {
  const location = useLocation();
  const { token, userEmpresaRazaoSocial, userEmpresaCnpj } = useAuth();
  const basePath = '/inclusao-nova-unidade';
  const pathEnd = location.pathname.replace(basePath, '').replace(/^\//, '') || 'arquivos';
  const isAdicionar = pathEnd === 'adicionar' || location.pathname.endsWith('/adicionar');

  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');

  const [nomeUnidade, setNomeUnidade] = useState('');
  const [cnpjUnidade, setCnpjUnidade] = useState('');
  const [enderecoUnidade, setEnderecoUnidade] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [uf, setUf] = useState('');
  const [telefoneUnidade, setTelefoneUnidade] = useState('');

  const [dataSolicitacao, setDataSolicitacao] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [nomeSolicitante, setNomeSolicitante] = useState('');

  const [activeStep, setActiveStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeStep !== UNIDADE_STEPS.length) return;
    setSubmitError(null);
    const payload = {
      empresa: {
        razaoSocial: userEmpresaRazaoSocial ?? razaoSocial,
        cnpj: userEmpresaCnpj ?? cnpj,
        endereco,
        telefone,
      },
      unidade: { nomeUnidade, cnpjUnidade, enderecoUnidade, municipio, uf, telefoneUnidade },
      solicitacao: { dataSolicitacao, nomeSolicitante },
    };

    if (!getApiBase() || !token) {
      alert('Solicitação de inclusão de nova unidade registrada (modo offline). Configure a API e faça login para enviar ao servidor.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/unidades', token, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { mensagem?: string }).mensagem ?? 'Falha ao enviar solicitação');
      }
      alert('Solicitação de inclusão de nova unidade registrada.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao enviar';
      setSubmitError(msg);
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdicionar) {
    return (
      <SolicitacoesPorTipoList
        tipo="Inclusão de Nova Unidade"
        title="Inclusão de Nova Unidade"
        description="Cadastro de novas unidades — suas solicitações"
        basePath="/inclusao-nova-unidade"
        addLabel="Adicionar"
      />
    );
  }

  return (
    <PageContent maxWidth="6xl" className="pb-16 unidade-form-page">
      <PageHeader
        title="Inclusão de Nova Unidade"
        description="Solicitação de inclusão de nova unidade — dados da empresa, da unidade e do solicitante"
        className="unidade-page-header"
      />

      <div className="unidade-step-indicator">
        <span className="unidade-step-label">
          Passo {activeStep} de {UNIDADE_STEPS.length}
        </span>
        <span className="unidade-step-title">{UNIDADE_STEPS[activeStep - 1].title}</span>
        <div className="unidade-step-bar" role="progressbar" aria-valuenow={activeStep} aria-valuemin={1} aria-valuemax={UNIDADE_STEPS.length}>
          <div className="unidade-step-bar-fill" style={{ width: `${(activeStep / UNIDADE_STEPS.length) * 100}%` }} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="unidade-form w-full space-y-6 mt-6">
        <div className="unidade-form__step min-h-[320px] w-full">
          {activeStep === 1 && (
            <Card className="unidade-card">
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
            <Card className="unidade-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">2. Dados da unidade</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Nome, CNPJ, endereço, município, UF e telefone da nova unidade</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>Nome da unidade</FieldLabel>
                    <Input value={nomeUnidade} onChange={(e) => setNomeUnidade(e.target.value)} placeholder="Ex.: Filial São Paulo" />
                  </Field>
                  <Field>
                    <FieldLabel>CNPJ da unidade</FieldLabel>
                    <Input value={cnpjUnidade} onChange={(e) => setCnpjUnidade(e.target.value)} placeholder="00.000.000/0000-00" />
                  </Field>
                  <Field>
                    <FieldLabel>Endereço da unidade</FieldLabel>
                    <Input value={enderecoUnidade} onChange={(e) => setEnderecoUnidade(e.target.value)} placeholder="Endereço completo" />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Município</FieldLabel>
                      <Input value={municipio} onChange={(e) => setMunicipio(e.target.value)} placeholder="Município" />
                    </Field>
                    <Field>
                      <FieldLabel>UF</FieldLabel>
                      <Select value={uf} onChange={(e) => setUf(e.target.value)}>
                        <option value="">Selecione</option>
                        {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </Select>
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Telefone da unidade</FieldLabel>
                    <Input value={telefoneUnidade} onChange={(e) => setTelefoneUnidade(e.target.value)} placeholder="(00) 00000-0000" />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {activeStep === 3 && (
            <Card className="unidade-card">
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

        <div className="unidade-form-actions">
          <Button type="button" variant="outline" size="lg" className="w-full min-w-0" onClick={() => setActiveStep((s) => s - 1)} disabled={activeStep === 1}>
            Anterior
          </Button>
          {activeStep < 3 ? (
            <Button type="button" variant="default" size="lg" className="w-full min-w-0" onClick={() => setActiveStep((s) => s + 1)}>Próximo</Button>
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
