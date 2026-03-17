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
import './SolicitacaoVisitaTecnica.css';

const VISITA_STEPS = [
  { step: 1, title: 'Empresa', description: 'Dados da empresa' },
  { step: 2, title: 'Dados da visita', description: 'Objetivo, data e local' },
  { step: 3, title: 'Solicitação', description: 'Data e responsável' },
] as const;

export default function SolicitacaoVisitaTecnica() {
  const location = useLocation();
  const { token, userEmpresaRazaoSocial, userEmpresaCnpj } = useAuth();
  const basePath = '/solicitacao-visita-tecnica';
  const pathEnd = location.pathname.replace(basePath, '').replace(/^\//, '') || 'arquivos';
  const isAdicionar = pathEnd === 'adicionar' || location.pathname.endsWith('/adicionar');

  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');

  const [objetivoVisita, setObjetivoVisita] = useState('');
  const [dataPreferencial, setDataPreferencial] = useState('');
  const [enderecoVisita, setEnderecoVisita] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [uf, setUf] = useState('');
  const [descricaoNecessidade, setDescricaoNecessidade] = useState('');
  const [tipoVisita, setTipoVisita] = useState('');

  const [dataSolicitacao, setDataSolicitacao] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [nomeSolicitante, setNomeSolicitante] = useState('');
  const [emailSolicitante, setEmailSolicitante] = useState('');
  const [telefoneSolicitante, setTelefoneSolicitante] = useState('');

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
      visita: {
        objetivoVisita,
        dataPreferencial,
        enderecoVisita,
        municipio,
        uf,
        descricaoNecessidade,
        tipoVisita,
      },
      solicitacao: { dataSolicitacao, nomeSolicitante, emailSolicitante, telefoneSolicitante },
    };
    if (!getApiBase() || !token) {
      alert('Solicitação registrada (modo offline). Configure a API e faça login para enviar ao servidor.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/visitas', token, { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { mensagem?: string }).mensagem ?? 'Falha ao enviar');
      alert('Solicitação de visita técnica registrada. Entraremos em contato para agendar.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao enviar');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdicionar) {
    return (
      <SolicitacoesPorTipoList
        tipo="Solicitação de Visita Técnica"
        title="Solicitação de Visita Técnica"
        description="Solicite uma visita técnica ao seu estabelecimento — suas solicitações"
        basePath="/solicitacao-visita-tecnica"
        addLabel="Adicionar"
      />
    );
  }

  return (
    <PageContent maxWidth="6xl" className="pb-16 visita-form-page">
      <PageHeader
        title="Solicitação de Visita Técnica"
        description="Solicite uma visita técnica — dados da empresa, da visita e do solicitante"
        className="visita-page-header"
      />

      <div className="visita-step-indicator">
        <span className="visita-step-label">
          Passo {activeStep} de {VISITA_STEPS.length}
        </span>
        <span className="visita-step-title">{VISITA_STEPS[activeStep - 1].title}</span>
        <div className="visita-step-bar" role="progressbar" aria-valuenow={activeStep} aria-valuemin={1} aria-valuemax={VISITA_STEPS.length}>
          <div className="visita-step-bar-fill" style={{ width: `${(activeStep / VISITA_STEPS.length) * 100}%` }} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="visita-form w-full space-y-6 mt-6">
        <div className="visita-form__step min-h-[320px] w-full">
          {activeStep === 1 && (
            <Card className="visita-card">
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
            <Card className="visita-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">2. Dados da visita</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Objetivo, data preferencial, local e descrição do que será avaliado</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>Tipo de visita</FieldLabel>
                    <Select value={tipoVisita} onChange={(e) => setTipoVisita(e.target.value)}>
                      <option value="">Selecione</option>
                      <option value="Vistoria">Vistoria</option>
                      <option value="Avaliação técnica">Avaliação técnica</option>
                      <option value="Laudo">Laudo</option>
                      <option value="Outros">Outros</option>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Objetivo da visita</FieldLabel>
                    <Input value={objetivoVisita} onChange={(e) => setObjetivoVisita(e.target.value)} placeholder="Ex.: Vistoria de segurança, avaliação de riscos" />
                  </Field>
                  <Field>
                    <FieldLabel>Data preferencial para a visita</FieldLabel>
                    <Input type="date" value={dataPreferencial} onChange={(e) => setDataPreferencial(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel>Endereço do local da visita</FieldLabel>
                    <Input value={enderecoVisita} onChange={(e) => setEnderecoVisita(e.target.value)} placeholder="Endereço completo do local a ser visitado" />
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
                        {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Descrição da necessidade / o que será avaliado</FieldLabel>
                    <Textarea value={descricaoNecessidade} onChange={(e) => setDescricaoNecessidade(e.target.value)} placeholder="Descreva o que precisa ser vistoriado ou avaliado na visita" rows={4} />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {activeStep === 3 && (
            <Card className="visita-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">3. Solicitação</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Data da solicitação e dados de quem está solicitando</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>Data da solicitação</FieldLabel>
                    <Input type="date" value={dataSolicitacao} onChange={(e) => setDataSolicitacao(e.target.value)} />
                  </Field>
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

        <div className="visita-form-actions">
          <Button type="button" variant="outline" size="lg" className="w-full min-w-0" onClick={() => setActiveStep((s) => s - 1)} disabled={activeStep === 1}>
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
