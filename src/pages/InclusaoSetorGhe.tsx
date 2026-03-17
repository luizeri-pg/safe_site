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
import './InclusaoSetorGhe.css';

const SETOR_STEPS = [
  { step: 1, title: 'Empresa', description: 'Dados da empresa' },
  { step: 2, title: 'Dados do setor e GHE', description: 'Nome, código, descrição e GHE' },
  { step: 3, title: 'Solicitação', description: 'Data e responsável' },
] as const;

export default function InclusaoSetorGhe() {
  const location = useLocation();
  const { token, userEmpresaRazaoSocial, userEmpresaCnpj } = useAuth();
  const basePath = '/inclusao-setor-ghe';
  const pathEnd = location.pathname.replace(basePath, '').replace(/^\//, '') || 'arquivos';
  const isAdicionar = pathEnd === 'adicionar' || location.pathname.endsWith('/adicionar');

  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');

  const [nomeSetor, setNomeSetor] = useState('');
  const [codigoSetor, setCodigoSetor] = useState('');
  const [codigoGhe, setCodigoGhe] = useState('');
  const [descricaoSetor, setDescricaoSetor] = useState('');

  const [dataSolicitacao, setDataSolicitacao] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [nomeSolicitante, setNomeSolicitante] = useState('');

  const [activeStep, setActiveStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      empresa: {
        razaoSocial: userEmpresaRazaoSocial ?? razaoSocial,
        cnpj: userEmpresaCnpj ?? cnpj,
        endereco,
        telefone,
      },
      setorGhe: { nomeSetor, codigoSetor, codigoGhe, descricaoSetor },
      solicitacao: { dataSolicitacao, nomeSolicitante },
    };
    if (!getApiBase() || !token) {
      alert('Solicitação registrada (modo offline). Configure a API e faça login para enviar ao servidor.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/setores-ghe', token, { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { mensagem?: string }).mensagem ?? 'Falha ao enviar');
      alert('Solicitação de inclusão de setor/GHE registrada.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao enviar');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdicionar) {
    return (
      <SolicitacoesPorTipoList
        tipo="Inclusão de Setor | GHE"
        title="Inclusão de Setor | GHE"
        description="Cadastro de novos setores e grupos homogêneos de exposição — suas solicitações"
        basePath="/inclusao-setor-ghe"
        addLabel="Adicionar"
      />
    );
  }

  return (
    <PageContent maxWidth="6xl" className="pb-16 setor-form-page">
      <PageHeader
        title="Inclusão de Setor | GHE"
        description="Solicitação de inclusão de novo setor ou GHE — dados da empresa, do setor e do solicitante"
        className="setor-page-header"
      />

      <div className="setor-step-indicator">
        <span className="setor-step-label">
          Passo {activeStep} de {SETOR_STEPS.length}
        </span>
        <span className="setor-step-title">{SETOR_STEPS[activeStep - 1].title}</span>
        <div className="setor-step-bar" role="progressbar" aria-valuenow={activeStep} aria-valuemin={1} aria-valuemax={SETOR_STEPS.length}>
          <div className="setor-step-bar-fill" style={{ width: `${(activeStep / SETOR_STEPS.length) * 100}%` }} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="setor-form w-full space-y-6 mt-6">
        <div className="setor-form__step min-h-[320px] w-full">
          {activeStep === 1 && (
            <Card className="setor-card">
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
            <Card className="setor-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">2. Dados do setor e GHE</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Nome do setor, código, GHE (Grupo Homogêneo de Exposição) e descrição</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>Nome do setor</FieldLabel>
                    <Input value={nomeSetor} onChange={(e) => setNomeSetor(e.target.value)} placeholder="Ex.: Produção, Administrativo" />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Código do setor</FieldLabel>
                      <Input value={codigoSetor} onChange={(e) => setCodigoSetor(e.target.value)} placeholder="Código interno" />
                    </Field>
                    <Field>
                      <FieldLabel>Código GHE</FieldLabel>
                      <Input value={codigoGhe} onChange={(e) => setCodigoGhe(e.target.value)} placeholder="Código GHE (eSocial)" />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Descrição do setor</FieldLabel>
                    <Textarea value={descricaoSetor} onChange={(e) => setDescricaoSetor(e.target.value)} placeholder="Descreva as atividades e características do setor" rows={4} />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {activeStep === 3 && (
            <Card className="setor-card">
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

        <div className="setor-form-actions">
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
