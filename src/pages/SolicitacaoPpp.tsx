import { useLocation } from 'react-router-dom';
import { useState, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Building2,
  User,
  AlertTriangle,
  Briefcase,
  Leaf,
  Shield,
  HelpCircle,
  Scale,
  FileEdit,
  Play,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  useStepper,
} from '@/components/ui/stepper';
import { cn } from '@/lib/utils';
import './SolicitacaoPpp.css';

/** Indicador do step com badge (play = ativo, estrela = inativo/concluído) no canto */
function StepIndicatorWithBadge({
  step,
  icon: Icon,
}: {
  step: number;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const { activeStep } = useStepper();
  const state = step < activeStep ? 'completed' : step === activeStep ? 'active' : 'inactive';
  return (
    <span className="relative inline-flex shrink-0">
      <StepperIndicator className="bg-muted">
        {Icon ? <Icon className="size-4" /> : <span>{step}</span>}
      </StepperIndicator>
      <span
        className={cn(
          'ppp-step-badge absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2',
          state === 'active' ? 'bg-white text-[#00ACD4]' : 'bg-white/90 text-slate-500'
        )}
      >
        {state === 'active' ? (
          <Play className="size-2.5 fill-current" />
        ) : (
          <Sparkles className="size-2.5" />
        )}
      </span>
    </span>
  );
}

const PPP_STEPS = [
  { step: 1, title: 'Empresa', description: 'Dados cadastrais', icon: Building2 },
  { step: 2, title: 'Trabalhador', description: 'Identificação e vínculo', icon: User },
  { step: 3, title: 'CAT', description: 'Comunicação de acidente', icon: AlertTriangle },
  { step: 4, title: 'Histórico', description: 'Trabalho do funcionário', icon: Briefcase },
  { step: 5, title: 'Aval. ambiental', description: 'Programas ambientais', icon: Leaf },
  { step: 6, title: 'EPIs', description: 'Fornecidos e CA', icon: Shield },
  { step: 7, title: 'Perg. EPI', description: 'Sim ou Não', icon: HelpCircle },
  { step: 8, title: 'Resp. legal', description: 'Representante', icon: Scale },
  { step: 9, title: 'Solicitação', description: 'Data e solicitante', icon: FileEdit },
] as const;

/** Um período do histórico de trabalho */
interface HistoricoItem {
  id: string;
  periodoInicio: string;
  periodoFim: string;
  setor: string;
  cargo: string;
  funcao: string;
  cbo: string;
  descricaoAtividades: string;
  codigoGfip: string;
  localLotacao: string;
}

/** Uma linha da tabela de EPIs */
interface EpiItem {
  id: string;
  tipoEpi: string;
  numeroCa: string;
}

const emptyHistorico = (): HistoricoItem => ({
  id: crypto.randomUUID(),
  periodoInicio: '',
  periodoFim: '',
  setor: '',
  cargo: '',
  funcao: '',
  cbo: '',
  descricaoAtividades: '',
  codigoGfip: '',
  localLotacao: '',
});

const emptyEpi = (): EpiItem => ({
  id: crypto.randomUUID(),
  tipoEpi: '',
  numeroCa: '',
});

export default function SolicitacaoPpp() {
  const location = useLocation();
  const basePath = '/solicitacao-ppp';
  const pathEnd = location.pathname.replace(basePath, '').replace(/^\//, '') || 'arquivos';
  const isAdicionar = pathEnd === 'adicionar';

  // 1. Informações da empresa
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [ceiCaepfCno, setCeiCaepfCno] = useState('');
  const [cnae, setCnae] = useState('');

  // 2. Dados do trabalhador
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [matriculaEsocial, setMatriculaEsocial] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [regimeRevezamento, setRegimeRevezamento] = useState('');
  const [brOuPdh, setBrOuPdh] = useState<'nenhum' | 'BR' | 'PDH'>('nenhum');

  // 3. Comunicação de acidente (se houver)
  const [temCat, setTemCat] = useState(false);
  const [numeroCat, setNumeroCat] = useState('');
  const [dataRegistroCat, setDataRegistroCat] = useState('');

  // 4. Histórico de trabalho
  const [historicos, setHistoricos] = useState<HistoricoItem[]>([emptyHistorico()]);

  // 5. Dados da avaliação ambiental
  const [nomeResponsavelAmbiental, setNomeResponsavelAmbiental] = useState('');
  const [cpfResponsavelAmbiental, setCpfResponsavelAmbiental] = useState('');

  // 6. EPIs fornecidos
  const [epis, setEpis] = useState<EpiItem[]>([emptyEpi()]);

  // 7. Perguntas obrigatórias EPI
  const [protecaoColetivaAntes, setProtecaoColetivaAntes] = useState<'sim' | 'nao'>('nao');
  const [usoContinuo, setUsoContinuo] = useState<'sim' | 'nao'>('nao');
  const [respeitouValidadeCa, setRespeitouValidadeCa] = useState<'sim' | 'nao'>('nao');
  const [trocaPeriodica, setTrocaPeriodica] = useState<'sim' | 'nao'>('nao');
  const [higienizacao, setHigienizacao] = useState<'sim' | 'nao'>('nao');

  // 8. Responsável legal
  const [nomeRepresentanteLegal, setNomeRepresentanteLegal] = useState('');
  const [cargoRepresentanteLegal, setCargoRepresentanteLegal] = useState('');
  const [cpfRepresentanteLegal, setCpfRepresentanteLegal] = useState('');

  // 9. Solicitação
  const [dataSolicitacao, setDataSolicitacao] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [nomeSolicitante, setNomeSolicitante] = useState('');

  const [activeStep, setActiveStep] = useState(1);
  const goToStep = useCallback((step: number) => setActiveStep(step), []);

  const addHistorico = () => setHistoricos((prev) => [...prev, emptyHistorico()]);
  const removeHistorico = (id: string) =>
    setHistoricos((prev) => (prev.length > 1 ? prev.filter((h) => h.id !== id) : prev));
  const updateHistorico = (id: string, field: keyof HistoricoItem, value: string) =>
    setHistoricos((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );

  const addEpi = () => setEpis((prev) => [...prev, emptyEpi()]);
  const removeEpi = (id: string) =>
    setEpis((prev) => (prev.length > 1 ? prev.filter((e) => e.id !== id) : prev));
  const updateEpi = (id: string, field: keyof EpiItem, value: string) =>
    setEpis((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: enviar para API
    const payload = {
      empresa: { razaoSocial, cnpj, ceiCaepfCno, cnae },
      trabalhador: {
        nomeCompleto,
        cpf,
        dataNascimento,
        sexo,
        matriculaEsocial,
        dataAdmissao,
        regimeRevezamento,
        brOuPdh,
      },
      cat: temCat ? { numeroCat, dataRegistroCat } : null,
      historicos,
      avaliacaoAmbiental: {
        nomeResponsavelAmbiental,
        cpfResponsavelAmbiental,
      },
      epis,
      perguntasEpi: {
        protecaoColetivaAntes,
        usoContinuo,
        respeitouValidadeCa,
        trocaPeriodica,
        higienizacao,
      },
      responsavelLegal: {
        nomeRepresentanteLegal,
        cargoRepresentanteLegal,
        cpfRepresentanteLegal,
      },
      solicitacao: { dataSolicitacao, nomeSolicitante },
    };
    console.log('PPP submit', payload);
    alert('Solicitação de PPP registrada. Em breve você poderá enviar para o sistema.');
  };

  if (!isAdicionar) {
    return (
      <div className="ppp-page dark w-full px-6 py-6">
        <div className="ppp-page__inner mx-auto">
          <header className="ppp-page__header text-center mb-8">
            <h1 className="ppp-page__title">Solicitação de PPP</h1>
            <p className="ppp-page__subtitle">Todos os registros</p>
          </header>
          <Card className="ppp-card">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                Nenhum registro. Use &quot;Adicionar&quot; no menu para criar uma nova solicitação.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="ppp-page dark w-full px-6 py-6 pb-12">
      <div className="ppp-page__inner mx-auto">
        <header className="ppp-page__header text-center mb-8">
          <h1 className="ppp-page__title">Solicitação de PPP</h1>
          <p className="ppp-page__subtitle">Perfil Profissiográfico Previdenciário (INSS / SAFE)</p>
        </header>

        <Stepper
          activeStep={activeStep}
          onStepClick={goToStep}
          className="ppp-stepper flex flex-nowrap items-start justify-center gap-2 pb-8 border-b border-border mx-auto"
        >
          {PPP_STEPS.map((item) => (
            <StepperItem
              key={item.step}
              step={item.step}
              className="ppp-stepper-item relative flex flex-1 min-w-0 flex-col items-center justify-center"
            >
              <StepperTrigger step={item.step}>
                <StepIndicatorWithBadge step={item.step} icon={item.icon} />
              </StepperTrigger>
              {item.step !== PPP_STEPS[PPP_STEPS.length - 1]?.step && (
                <StepperSeparator
                  className="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
                />
              )}
              <div className="flex flex-col items-center gap-0.5 pt-1 w-full min-w-0">
                <StepperTitle>{item.title}</StepperTitle>
                <StepperDescription>{item.description}</StepperDescription>
              </div>
            </StepperItem>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit} className="ppp-form space-y-6 mt-8">
        <div className="ppp-form__step min-h-[320px]">
          {activeStep === 1 && (
            <Card className="ppp-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">1. Informações da empresa</CardTitle>
            <CardDescription>Dados cadastrais da empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Razão social</FieldLabel>
                <Input
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  placeholder="Razão social"
                />
              </Field>
              <Field>
                <FieldLabel>CNPJ</FieldLabel>
                <Input
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </Field>
              <Field>
                <FieldLabel>CEI / CAEPF / CNO</FieldLabel>
                <Input
                  value={ceiCaepfCno}
                  onChange={(e) => setCeiCaepfCno(e.target.value)}
                  placeholder="CEI, CAEPF ou CNO"
                />
              </Field>
              <Field>
                <FieldLabel>CNAE</FieldLabel>
                <Input
                  value={cnae}
                  onChange={(e) => setCnae(e.target.value)}
                  placeholder="Código CNAE"
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
          )}

          {activeStep === 2 && (
            <Card className="ppp-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">2. Dados do trabalhador</CardTitle>
            <CardDescription>Identificação e vínculo</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Nome completo</FieldLabel>
                <Input
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  placeholder="Nome completo"
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>CPF</FieldLabel>
                  <Input
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </Field>
                <Field>
                  <FieldLabel>Data de nascimento</FieldLabel>
                  <Input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Sexo</FieldLabel>
                  <Select value={sexo} onChange={(e) => setSexo(e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Outro">Outro</option>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Matrícula no eSocial</FieldLabel>
                  <Input
                    value={matriculaEsocial}
                    onChange={(e) => setMatriculaEsocial(e.target.value)}
                    placeholder="Matrícula"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Data de admissão</FieldLabel>
                  <Input
                    type="date"
                    value={dataAdmissao}
                    onChange={(e) => setDataAdmissao(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Regime de revezamento</FieldLabel>
                  <Input
                    value={regimeRevezamento}
                    onChange={(e) => setRegimeRevezamento(e.target.value)}
                    placeholder="Ex.: 12x36, 6x1, etc."
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel>BR ou PDH</FieldLabel>
                <Select
                  value={brOuPdh}
                  onChange={(e) => setBrOuPdh(e.target.value as 'nenhum' | 'BR' | 'PDH')}
                >
                  <option value="nenhum">Nenhum</option>
                  <option value="BR">BR (beneficiário reabilitado)</option>
                  <option value="PDH">PDH (pessoa com deficiência habilitada)</option>
                </Select>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
          )}

          {activeStep === 3 && (
            <Card className="ppp-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">3. Comunicação de acidente de trabalho</CardTitle>
            <CardDescription>Preencher somente se houver CAT</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Checkbox
                id="tem-cat"
                checked={temCat}
                onChange={(e) => setTemCat(e.target.checked)}
              />
              <Label htmlFor="tem-cat" className="text-sm font-medium cursor-pointer">
                Há comunicação de acidente de trabalho (CAT)
              </Label>
            </div>
            {temCat && (
              <FieldGroup className="gap-4 mt-4">
                <Field>
                  <FieldLabel>Número da CAT</FieldLabel>
                  <Input
                    value={numeroCat}
                    onChange={(e) => setNumeroCat(e.target.value)}
                    placeholder="Número"
                  />
                </Field>
                <Field>
                  <FieldLabel>Data de registro</FieldLabel>
                  <Input
                    type="date"
                    value={dataRegistroCat}
                    onChange={(e) => setDataRegistroCat(e.target.value)}
                  />
                </Field>
              </FieldGroup>
            )}
          </CardContent>
        </Card>
          )}

          {activeStep === 4 && (
            <Card className="ppp-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">4. Histórico de trabalho do funcionário</CardTitle>
            <CardDescription>Um período por bloco. Adicione quantos forem necessários.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historicos.map((h) => (
                <div
                  key={h.id}
                  className="rounded-lg border border-border bg-muted/30 p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Período</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeHistorico(h.id)}
                      disabled={historicos.length === 1}
                    >
                      <Trash2 className="size-4 mr-1.5" />
                      Remover
                    </Button>
                  </div>
                  <FieldGroup className="gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Período início</FieldLabel>
                        <Input
                          type="date"
                          value={h.periodoInicio}
                          onChange={(e) => updateHistorico(h.id, 'periodoInicio', e.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Período fim</FieldLabel>
                        <Input
                          type="date"
                          value={h.periodoFim}
                          onChange={(e) => updateHistorico(h.id, 'periodoFim', e.target.value)}
                        />
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel>Setor</FieldLabel>
                      <Input
                        value={h.setor}
                        onChange={(e) => updateHistorico(h.id, 'setor', e.target.value)}
                        placeholder="Setor"
                      />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Cargo</FieldLabel>
                        <Input
                          value={h.cargo}
                          onChange={(e) => updateHistorico(h.id, 'cargo', e.target.value)}
                          placeholder="Cargo"
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Função</FieldLabel>
                        <Input
                          value={h.funcao}
                          onChange={(e) => updateHistorico(h.id, 'funcao', e.target.value)}
                          placeholder="Função"
                        />
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel>CBO</FieldLabel>
                      <Input
                        value={h.cbo}
                        onChange={(e) => updateHistorico(h.id, 'cbo', e.target.value)}
                        placeholder="Código CBO"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Descrição das atividades</FieldLabel>
                      <Textarea
                        value={h.descricaoAtividades}
                        onChange={(e) => updateHistorico(h.id, 'descricaoAtividades', e.target.value)}
                        placeholder="Descreva as atividades"
                        rows={3}
                      />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Código GFIP / eSocial</FieldLabel>
                        <Input
                          value={h.codigoGfip}
                          onChange={(e) => updateHistorico(h.id, 'codigoGfip', e.target.value)}
                          placeholder="Código"
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Local de lotação</FieldLabel>
                        <Input
                          value={h.localLotacao}
                          onChange={(e) => updateHistorico(h.id, 'localLotacao', e.target.value)}
                          placeholder="Local de lotação"
                        />
                      </Field>
                    </div>
                  </FieldGroup>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addHistorico} className="w-full sm:w-auto">
                <Plus className="size-4 mr-2" />
                Adicionar período
              </Button>
            </div>
          </CardContent>
        </Card>
          )}

          {activeStep === 5 && (
            <Card className="ppp-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">5. Dados da avaliação ambiental</CardTitle>
            <CardDescription>
              Obrigatório para períodos anteriores à gestão da SAFE
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Nome do responsável pelos programas ambientais</FieldLabel>
                <Input
                  value={nomeResponsavelAmbiental}
                  onChange={(e) => setNomeResponsavelAmbiental(e.target.value)}
                  placeholder="Nome completo"
                />
              </Field>
              <Field>
                <FieldLabel>CPF do responsável</FieldLabel>
                <Input
                  value={cpfResponsavelAmbiental}
                  onChange={(e) => setCpfResponsavelAmbiental(e.target.value)}
                  placeholder="000.000.000-00"
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
          )}

          {activeStep === 6 && (
            <Card className="ppp-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">6. EPIs fornecidos</CardTitle>
            <CardDescription>Tipo de EPI e número do CA (Certificado de Aprovação)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de EPI</TableHead>
                  <TableHead>Número do CA</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {epis.map((epi) => (
                  <TableRow key={epi.id}>
                    <TableCell>
                      <Input
                        value={epi.tipoEpi}
                        onChange={(e) => updateEpi(epi.id, 'tipoEpi', e.target.value)}
                        placeholder="Ex.: Luvas, Óculos"
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={epi.numeroCa}
                        onChange={(e) => updateEpi(epi.id, 'numeroCa', e.target.value)}
                        placeholder="Nº CA"
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeEpi(epi.id)}
                        disabled={epis.length === 1}
                        title="Remover linha"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button type="button" variant="outline" onClick={addEpi} className="mt-4">
              <Plus className="size-4 mr-2" />
              Adicionar EPI
            </Button>
          </CardContent>
        </Card>
          )}

          {activeStep === 7 && (
            <Card className="ppp-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">7. Perguntas obrigatórias sobre EPI</CardTitle>
            <CardDescription>Responder Sim ou Não</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  label: 'Houve tentativa de proteção coletiva antes do EPI?',
                  value: protecaoColetivaAntes,
                  set: setProtecaoColetivaAntes,
                },
                { label: 'O uso do EPI foi contínuo?', value: usoContinuo, set: setUsoContinuo },
                { label: 'Respeitou a validade do CA?', value: respeitouValidadeCa, set: setRespeitouValidadeCa },
                { label: 'Houve troca periódica?', value: trocaPeriodica, set: setTrocaPeriodica },
                { label: 'Houve higienização?', value: higienizacao, set: setHigienizacao },
              ].map(({ label, value, set }) => (
                <div key={label} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <Label className="text-sm font-medium">{label}</Label>
                  <Select
                    value={value}
                    onChange={(e) => set(e.target.value as 'sim' | 'nao')}
                    className="w-full sm:w-28"
                  >
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
          )}

          {activeStep === 8 && (
            <Card className="ppp-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">8. Responsável legal</CardTitle>
            <CardDescription>Representante legal da empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Nome do representante legal</FieldLabel>
                <Input
                  value={nomeRepresentanteLegal}
                  onChange={(e) => setNomeRepresentanteLegal(e.target.value)}
                  placeholder="Nome completo"
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Cargo</FieldLabel>
                  <Input
                    value={cargoRepresentanteLegal}
                    onChange={(e) => setCargoRepresentanteLegal(e.target.value)}
                    placeholder="Cargo"
                  />
                </Field>
                <Field>
                  <FieldLabel>CPF</FieldLabel>
                  <Input
                    value={cpfRepresentanteLegal}
                    onChange={(e) => setCpfRepresentanteLegal(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
          )}

          {activeStep === 9 && (
            <Card className="ppp-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">9. Solicitação</CardTitle>
            <CardDescription>Data e solicitante</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Data da solicitação</FieldLabel>
                  <Input
                    type="date"
                    value={dataSolicitacao}
                    onChange={(e) => setDataSolicitacao(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Nome de quem solicitou</FieldLabel>
                  <Input
                    value={nomeSolicitante}
                    onChange={(e) => setNomeSolicitante(e.target.value)}
                    placeholder="Nome completo"
                  />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
          )}
        </div>

        {activeStep === 9 && (
          <Card className="ppp-card ppp-card-prazo">
            <CardContent className="pt-6">
              <p className="text-sm text-foreground">
                <strong>Prazo:</strong> 5 dias úteis — funcionário com período durante a gestão da SAFE.
              </p>
              <p className="text-sm text-foreground mt-1">
                <strong>7 dias úteis</strong> — períodos anteriores (é necessário enviar laudos e programas ambientais).
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="ppp-btn-outline w-full h-12 text-base"
            onClick={() => setActiveStep((s) => s - 1)}
            disabled={activeStep === 1}
          >
            Anterior
          </Button>
          {activeStep < 9 ? (
            <Button type="button" size="lg" className="ppp-btn-primary w-full h-12 text-base" onClick={() => setActiveStep((s) => s + 1)}>
              Próximo
            </Button>
          ) : (
            <Button type="submit" size="lg" className="ppp-btn-primary w-full h-12 text-base">
              Enviar solicitação de PPP
            </Button>
          )}
        </div>
        </form>
      </div>
    </div>
  );
}
