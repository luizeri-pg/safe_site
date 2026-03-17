import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  Building2,
  User,
  MapPin,
  Clock,
  Heart,
  Shield,
  Wrench,
  Stethoscope,
  FileSignature,
  Activity,
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
import { PageHeader } from '@/components/PageHeader';
import { PageContent } from '@/components/PageContent';
import SolicitacoesPorTipoList from '@/components/SolicitacoesPorTipoList';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch, getApiBase } from '@/services/api';
import './AberturaCat.css';

const CAT_STEPS = [
  { step: 1, title: 'Empregador', description: 'Dados da empresa', icon: Building2 },
  { step: 2, title: 'Trabalhador', description: 'Identificação', icon: User },
  { step: 3, title: 'Atividade/Ocorrência', description: 'O que aconteceu', icon: Activity },
  { step: 4, title: 'Local', description: 'Local do incidente', icon: MapPin },
  { step: 5, title: 'Dados do acidente', description: 'Datas e tipo', icon: Clock },
  { step: 6, title: 'Lesão e complementos', description: 'Parte do corpo, agente', icon: Heart },
  { step: 7, title: 'EPC e EPI', description: 'Proteções', icon: Shield },
  { step: 8, title: 'Segurança e ferramentas', description: 'Análise de risco, PT', icon: Wrench },
  { step: 9, title: 'Atendimento médico', description: 'Unidade, médico, CID', icon: Stethoscope },
  { step: 10, title: 'Responsável', description: 'Quem preencheu', icon: FileSignature },
] as const;

const PARTES_CORPO = [
  'Cabeça',
  'Tronco',
  'Braço esquerdo',
  'Braço direito',
  'Mão esquerda',
  'Mão direita',
  'Perna esquerda',
  'Perna direita',
  'Pé esquerdo',
  'Pé direito',
  'Via respiratória',
  'Outros',
] as const;

const EPIS_LIST = [
  'Capacete',
  'Óculos',
  'Protetor auditivo',
  'Protetor facial',
  'Luvas',
  'Botina',
  'Cinto de segurança',
  'Respirador',
] as const;

export default function AberturaCat() {
  const location = useLocation();
  const { token, userEmpresaRazaoSocial, userEmpresaCnpj } = useAuth();
  const basePath = '/abertura-cat';
  const pathEnd = location.pathname.replace(basePath, '').replace(/^\//, '') || 'arquivos';
  const isAdicionar = pathEnd === 'adicionar' || location.pathname.endsWith('/adicionar');

  // 1. Dados do empregador
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpjEmpregador, setCnpjEmpregador] = useState('');
  const [enderecoEmpregador, setEnderecoEmpregador] = useState('');
  const [telefoneEmpregador, setTelefoneEmpregador] = useState('');

  // 2. Dados do trabalhador
  const [nomeTrabalhador, setNomeTrabalhador] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpfTrabalhador, setCpfTrabalhador] = useState('');
  const [sexo, setSexo] = useState('');
  const [estadoCivil, setEstadoCivil] = useState('');
  const [filiacaoInss, setFiliacaoInss] = useState('');
  const [funcao, setFuncao] = useState('');
  const [cbo, setCbo] = useState('');
  const [matriculaEsocial, setMatriculaEsocial] = useState('');
  const [enderecoTrabalhador, setEnderecoTrabalhador] = useState('');
  const [telefoneTrabalhador, setTelefoneTrabalhador] = useState('');
  const [emailTrabalhador, setEmailTrabalhador] = useState('');

  // 3. Atividade e ocorrência
  const [atividadeMomento, setAtividadeMomento] = useState('');
  const [descricaoOcorrencia, setDescricaoOcorrencia] = useState('');
  const [_fotosLocal, setFotosLocal] = useState<FileList | null>(null);

  // 4. Local do incidente
  const [localIncidente, setLocalIncidente] = useState('');
  const [cnpjLocalIncidente, setCnpjLocalIncidente] = useState('');
  const [enderecoLocalIncidente, setEnderecoLocalIncidente] = useState('');
  const [municipioLocal, setMunicipioLocal] = useState('');
  const [ufLocal, setUfLocal] = useState('');

  // 5. Dados do acidente
  const [ultimoDiaTrabalhado, setUltimoDiaTrabalhado] = useState('');
  const [horarioSaida, setHorarioSaida] = useState('');
  const [dataOcorrencia, setDataOcorrencia] = useState('');
  const [inicioJornada, setInicioJornada] = useState('');
  const [ultimaPausa, setUltimaPausa] = useState('');
  const [horaIncidente, setHoraIncidente] = useState('');
  const [tipoIncidente, setTipoIncidente] = useState<'pessoal' | 'trajeto' | 'material' | 'ambiental'>('pessoal');
  const [temBoletimOcorrencia, setTemBoletimOcorrencia] = useState(false);
  const [numeroBoletimOcorrencia, setNumeroBoletimOcorrencia] = useState('');

  // 6. Lesão e complementos
  const [partesCorpo, setPartesCorpo] = useState<Record<string, boolean>>({});
  const [outrosParteCorpo, setOutrosParteCorpo] = useState('');
  const [agenteCausador, setAgenteCausador] = useState('');
  const [situacaoCausadora, setSituacaoCausadora] = useState('');

  // 7. EPC e EPI
  const [epcSinalizacao, setEpcSinalizacao] = useState(false);
  const [epcLinhaVida, setEpcLinhaVida] = useState(false);
  const [epcBloqueioEnergia, setEpcBloqueioEnergia] = useState(false);
  const [epcOutros, setEpcOutros] = useState('');
  const [episUtilizados, setEpisUtilizados] = useState<Record<string, boolean>>({});

  // 8. Segurança e ferramentas
  const [existeAnaliseRisco, setExisteAnaliseRisco] = useState<'sim' | 'nao'>('nao');
  const [existePermissaoTrabalho, setExistePermissaoTrabalho] = useState<'sim' | 'nao'>('nao');
  const [atividadeEmDupla, setAtividadeEmDupla] = useState<'sim' | 'nao'>('nao');
  const [ferramentasUtilizadas, setFerramentasUtilizadas] = useState('');
  const [ferramentasBoasCondicoes, setFerramentasBoasCondicoes] = useState<'sim' | 'nao'>('nao');
  const [ferramentasAdequadas, setFerramentasAdequadas] = useState<'sim' | 'nao'>('nao');
  const [numeroOsOm, setNumeroOsOm] = useState('');
  const [setorOcorrencia, setSetorOcorrencia] = useState('');

  // 9. Atendimento médico
  const [nomeUnidadeAtendimento, setNomeUnidadeAtendimento] = useState('');
  const [enderecoUnidade, setEnderecoUnidade] = useState('');
  const [horarioAtendimento, setHorarioAtendimento] = useState('');
  const [nomeMedico, setNomeMedico] = useState('');
  const [crmMedico, setCrmMedico] = useState('');
  const [cid10, setCid10] = useState('');
  const [_atestadoMedico, setAtestadoMedico] = useState<FileList | null>(null);

  // 10. Responsável
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [funcaoResponsavel, setFuncaoResponsavel] = useState('');
  const [dataPreenchimento, setDataPreenchimento] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [assinaturaResponsavel, setAssinaturaResponsavel] = useState('');

  const [activeStep, setActiveStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const toggleParteCorpo = (parte: string) =>
    setPartesCorpo((prev) => ({ ...prev, [parte]: !prev[parte] }));

  const toggleEpi = (epi: string) =>
    setEpisUtilizados((prev) => ({ ...prev, [epi]: !prev[epi] }));

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const enviarQuestionario = async () => {
    if (activeStep !== CAT_STEPS.length) return;
    const payload = {
      empregador: {
        razaoSocial: userEmpresaRazaoSocial ?? razaoSocial,
        cnpj: userEmpresaCnpj ?? cnpjEmpregador,
        endereco: enderecoEmpregador,
        telefone: telefoneEmpregador,
      },
      trabalhador: {
        nome: nomeTrabalhador,
        dataNascimento,
        cpf: cpfTrabalhador,
        sexo,
        estadoCivil,
        filiacaoInss,
        funcao,
        cbo,
        matriculaEsocial,
        endereco: enderecoTrabalhador,
        telefone: telefoneTrabalhador,
        email: emailTrabalhador,
      },
      atividadeMomento,
      descricaoOcorrencia,
      localIncidente: {
        local: localIncidente,
        cnpj: cnpjLocalIncidente,
        endereco: enderecoLocalIncidente,
        municipio: municipioLocal,
        uf: ufLocal,
      },
      dadosAcidente: {
        ultimoDiaTrabalhado,
        horarioSaida,
        dataOcorrencia,
        inicioJornada,
        ultimaPausa,
        horaIncidente,
        tipoIncidente,
        boletimOcorrencia: tipoIncidente === 'trajeto' ? (temBoletimOcorrencia ? numeroBoletimOcorrencia : null) : null,
      },
      lesao: { partesCorpo, outrosParteCorpo, agenteCausador, situacaoCausadora },
      epc: { epcSinalizacao, epcLinhaVida, epcBloqueioEnergia, epcOutros },
      episUtilizados,
      seguranca: {
        existeAnaliseRisco,
        existePermissaoTrabalho,
        atividadeEmDupla,
        ferramentasUtilizadas,
        ferramentasBoasCondicoes,
        ferramentasAdequadas,
        numeroOsOm,
        setorOcorrencia,
      },
      atendimentoMedico: {
        nomeUnidadeAtendimento,
        enderecoUnidade,
        horarioAtendimento,
        nomeMedico,
        crmMedico,
        cid10,
      },
      responsavel: { nomeResponsavel, funcaoResponsavel, dataPreenchimento, assinaturaResponsavel },
    };
    if (!getApiBase() || !token) {
      alert('Questionário registrado (modo offline). Configure a API e faça login para enviar ao servidor.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/cats', token, {
        method: 'POST',
        body: JSON.stringify({ payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { mensagem?: string }).mensagem ?? 'Falha ao enviar');
      alert('Questionário para Análise e Comunicação de Incidente registrado. Em breve você poderá gerar a CAT no INSS.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao enviar');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdicionar) {
    return (
      <SolicitacoesPorTipoList
        tipo="Abertura de CAT"
        title="Abertura de CAT"
        description="Questionário para Análise e Comunicação de Incidente (INSS) — suas solicitações"
        basePath="/abertura-cat"
        addLabel="Adicionar"
      />
    );
  }

  return (
    <PageContent maxWidth="6xl" className="pb-16 cat-form-page">
      <PageHeader
        title="Abertura de CAT"
        description="Questionário para Análise e Comunicação de Incidente — acidente de trabalho, trajeto ou doença ocupacional"
        className="cat-page-header"
      />

      <div className="cat-step-indicator">
        <span className="cat-step-label">
          Passo {activeStep} de {CAT_STEPS.length}
        </span>
        <span className="cat-step-title">{CAT_STEPS[activeStep - 1].title}</span>
        <div className="cat-step-bar" role="progressbar" aria-valuenow={activeStep} aria-valuemin={1} aria-valuemax={CAT_STEPS.length}>
          <div className="cat-step-bar-fill" style={{ width: `${(activeStep / CAT_STEPS.length) * 100}%` }} />
        </div>
      </div>

      <form onSubmit={handleSubmitForm} className="cat-form w-full space-y-6 mt-6">
        <div className="cat-form__step min-h-[320px] w-full">
          {/* 1. Dados do empregador */}
          {activeStep === 1 && (
            <Card className="cat-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">1. Dados do empregador</CardTitle>
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
                        value={userEmpresaCnpj ?? cnpjEmpregador}
                        onChange={(e) => setCnpjEmpregador(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        readOnly={!!userEmpresaCnpj}
                        className={userEmpresaCnpj ? 'bg-muted/50' : ''}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Telefone de contato</FieldLabel>
                      <Input value={telefoneEmpregador} onChange={(e) => setTelefoneEmpregador(e.target.value)} placeholder="(00) 00000-0000" />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Endereço</FieldLabel>
                    <Input value={enderecoEmpregador} onChange={(e) => setEnderecoEmpregador(e.target.value)} placeholder="Endereço completo" />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {/* 2. Dados do trabalhador */}
          {activeStep === 2 && (
            <Card className="cat-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">2. Dados do trabalhador</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Nome, CPF, função, CBO, matrícula eSocial, endereço e contato</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>Nome</FieldLabel>
                    <Input value={nomeTrabalhador} onChange={(e) => setNomeTrabalhador(e.target.value)} placeholder="Nome completo" />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Data de nascimento</FieldLabel>
                      <Input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel>CPF</FieldLabel>
                      <Input value={cpfTrabalhador} onChange={(e) => setCpfTrabalhador(e.target.value)} placeholder="000.000.000-00" />
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
                      <FieldLabel>Estado civil</FieldLabel>
                      <Select value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)}>
                        <option value="">Selecione</option>
                        <option value="solteiro">Solteiro(a)</option>
                        <option value="casado">Casado(a)</option>
                        <option value="divorciado">Divorciado(a)</option>
                        <option value="viuvo">Viúvo(a)</option>
                        <option value="uniao_estavel">União estável</option>
                      </Select>
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Filiação ao INSS</FieldLabel>
                    <Input value={filiacaoInss} onChange={(e) => setFiliacaoInss(e.target.value)} placeholder="Número de filiação ao INSS" />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Função</FieldLabel>
                      <Input value={funcao} onChange={(e) => setFuncao(e.target.value)} placeholder="Função" />
                    </Field>
                    <Field>
                      <FieldLabel>CBO</FieldLabel>
                      <Input value={cbo} onChange={(e) => setCbo(e.target.value)} placeholder="Código CBO" />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Matrícula no eSocial</FieldLabel>
                    <Input value={matriculaEsocial} onChange={(e) => setMatriculaEsocial(e.target.value)} placeholder="Matrícula" />
                  </Field>
                  <Field>
                    <FieldLabel>Endereço completo</FieldLabel>
                    <Input value={enderecoTrabalhador} onChange={(e) => setEnderecoTrabalhador(e.target.value)} placeholder="Endereço" />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Telefone</FieldLabel>
                      <Input value={telefoneTrabalhador} onChange={(e) => setTelefoneTrabalhador(e.target.value)} placeholder="(00) 00000-0000" />
                    </Field>
                    <Field>
                      <FieldLabel>E-mail</FieldLabel>
                      <Input type="email" value={emailTrabalhador} onChange={(e) => setEmailTrabalhador(e.target.value)} placeholder="e-mail@exemplo.com" />
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {/* 3. Atividade e descrição da ocorrência */}
          {activeStep === 3 && (
            <Card className="cat-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">3. Atividade no momento do acidente e descrição da ocorrência</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Descreva o que o trabalhador fazia e o que aconteceu — não apontar causas</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>Qual atividade o trabalhador estava executando?</FieldLabel>
                    <Textarea value={atividadeMomento} onChange={(e) => setAtividadeMomento(e.target.value)} placeholder="Descreva a atividade" rows={3} />
                  </Field>
                  <Field>
                    <FieldLabel>Descrição da ocorrência (o que aconteceu e como aconteceu)</FieldLabel>
                    <Textarea value={descricaoOcorrencia} onChange={(e) => setDescricaoOcorrencia(e.target.value)} placeholder="Descreva o ocorrido. Não apontar causas." rows={4} />
                  </Field>
                  <Field>
                    <FieldLabel>Fotos do local do acidente</FieldLabel>
                    <Input type="file" accept="image/*" multiple onChange={(e) => setFotosLocal(e.target.files)} className="cursor-pointer" />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {/* 4. Local do incidente */}
          {activeStep === 4 && (
            <Card className="cat-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">4. Local do incidente</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Local, CNPJ/CAEPF/CNO, endereço, município e UF</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>Local do incidente</FieldLabel>
                    <Input value={localIncidente} onChange={(e) => setLocalIncidente(e.target.value)} placeholder="Nome ou descrição do local" />
                  </Field>
                  <Field>
                    <FieldLabel>CNPJ / CAEPF / CNO do local</FieldLabel>
                    <Input value={cnpjLocalIncidente} onChange={(e) => setCnpjLocalIncidente(e.target.value)} placeholder="00.000.000/0000-00 ou CAEPF ou CNO" />
                  </Field>
                  <Field>
                    <FieldLabel>Endereço</FieldLabel>
                    <Input value={enderecoLocalIncidente} onChange={(e) => setEnderecoLocalIncidente(e.target.value)} placeholder="Endereço completo" />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Município</FieldLabel>
                      <Input value={municipioLocal} onChange={(e) => setMunicipioLocal(e.target.value)} placeholder="Município" />
                    </Field>
                    <Field>
                      <FieldLabel>UF</FieldLabel>
                      <Select value={ufLocal} onChange={(e) => setUfLocal(e.target.value)}>
                        <option value="">Selecione</option>
                        {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {/* 5. Dados do acidente */}
          {activeStep === 5 && (
            <Card className="cat-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">5. Dados do acidente</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Datas, horários e tipo de incidente (pessoal, trajeto, material, ambiental)</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Último dia trabalhado</FieldLabel>
                      <Input type="date" value={ultimoDiaTrabalhado} onChange={(e) => setUltimoDiaTrabalhado(e.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel>Horário de saída</FieldLabel>
                      <Input type="time" value={horarioSaida} onChange={(e) => setHorarioSaida(e.target.value)} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Data da ocorrência</FieldLabel>
                      <Input type="date" value={dataOcorrencia} onChange={(e) => setDataOcorrencia(e.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel>Hora do incidente</FieldLabel>
                      <Input type="time" value={horaIncidente} onChange={(e) => setHoraIncidente(e.target.value)} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Início da jornada</FieldLabel>
                      <Input type="time" value={inicioJornada} onChange={(e) => setInicioJornada(e.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel>Última pausa</FieldLabel>
                      <Input type="time" value={ultimaPausa} onChange={(e) => setUltimaPausa(e.target.value)} />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Tipo de incidente</FieldLabel>
                    <Select value={tipoIncidente} onChange={(e) => setTipoIncidente(e.target.value as typeof tipoIncidente)}>
                      <option value="pessoal">Pessoal (acidente de trabalho)</option>
                      <option value="trajeto">Trajeto (enviar Boletim de Ocorrência)</option>
                      <option value="material">Material</option>
                      <option value="ambiental">Ambiental</option>
                    </Select>
                  </Field>
                  {tipoIncidente === 'trajeto' && (
                    <>
                      <div className="flex items-center gap-3">
                        <Checkbox id="tem-bo" checked={temBoletimOcorrencia} onChange={(e) => setTemBoletimOcorrencia(e.target.checked)} />
                        <Label htmlFor="tem-bo" className="text-sm font-medium cursor-pointer">Boletim de Ocorrência anexado</Label>
                      </div>
                      {temBoletimOcorrencia && (
                        <Field>
                          <FieldLabel>Número do Boletim de Ocorrência</FieldLabel>
                          <Input value={numeroBoletimOcorrencia} onChange={(e) => setNumeroBoletimOcorrencia(e.target.value)} placeholder="Nº BO" />
                        </Field>
                      )}
                    </>
                  )}
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {/* 6. Lesão no corpo e informações complementares */}
          {activeStep === 6 && (
            <Card className="cat-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">6. Lesão no corpo e informações complementares</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Parte(s) atingida(s), agente causador e situação causadora</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <div>
                    <FieldLabel className="block mb-3 text-sm font-medium">Parte do corpo atingida</FieldLabel>
                    <div className="cat-checkbox-group">
                      {PARTES_CORPO.map((p) => (
                        <div key={p} className="cat-checkbox-item">
                          <Checkbox id={`parte-${p}`} checked={!!partesCorpo[p]} onChange={() => toggleParteCorpo(p)} />
                          <Label htmlFor={`parte-${p}`}>{p}</Label>
                        </div>
                      ))}
                    </div>
                    {partesCorpo['Outros'] && (
                      <Input className="mt-2" value={outrosParteCorpo} onChange={(e) => setOutrosParteCorpo(e.target.value)} placeholder="Especificar outros" />
                    )}
                  </div>
                  <Field>
                    <FieldLabel>Agente causador (ex.: veículo, máquina, ferramenta)</FieldLabel>
                    <Input value={agenteCausador} onChange={(e) => setAgenteCausador(e.target.value)} placeholder="Agente causador" />
                  </Field>
                  <Field>
                    <FieldLabel>Situação causadora (ex.: colisão, queda, impacto)</FieldLabel>
                    <Input value={situacaoCausadora} onChange={(e) => setSituacaoCausadora(e.target.value)} placeholder="Situação causadora" />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {/* 7. EPC e EPI utilizados */}
          {activeStep === 7 && (
            <Card className="cat-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">7. EPC (Proteção coletiva) e EPI utilizados</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Se existia EPC no local e quais EPIs o trabalhador usava</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <div>
                    <FieldLabel className="block mb-3 text-sm font-medium">EPC no local</FieldLabel>
                    <div className="cat-checkbox-group">
                      <div className="cat-checkbox-item">
                        <Checkbox id="epc-sinal" checked={epcSinalizacao} onChange={(e) => setEpcSinalizacao(e.target.checked)} />
                        <Label htmlFor="epc-sinal">Sinalização de segurança</Label>
                      </div>
                      <div className="cat-checkbox-item">
                        <Checkbox id="epc-linha" checked={epcLinhaVida} onChange={(e) => setEpcLinhaVida(e.target.checked)} />
                        <Label htmlFor="epc-linha">Linha de vida</Label>
                      </div>
                      <div className="cat-checkbox-item">
                        <Checkbox id="epc-bloqueio" checked={epcBloqueioEnergia} onChange={(e) => setEpcBloqueioEnergia(e.target.checked)} />
                        <Label htmlFor="epc-bloqueio">Bloqueio de energia</Label>
                      </div>
                    </div>
                    <Input className="mt-3" value={epcOutros} onChange={(e) => setEpcOutros(e.target.value)} placeholder="Outros EPC" />
                  </div>
                  <div>
                    <FieldLabel className="block mb-3 text-sm font-medium">EPI utilizados pelo trabalhador</FieldLabel>
                    <div className="cat-checkbox-group">
                      {EPIS_LIST.map((epi) => (
                        <div key={epi} className="cat-checkbox-item">
                          <Checkbox id={`epi-${epi}`} checked={!!episUtilizados[epi]} onChange={() => toggleEpi(epi)} />
                          <Label htmlFor={`epi-${epi}`}>{epi}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {/* 8. Segurança da tarefa e ferramentas */}
          {activeStep === 8 && (
            <Card className="cat-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">8. Segurança da tarefa e ferramentas</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Análise de risco, permissão de trabalho, dupla, ferramentas, OS/OM e setor</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <div className="space-y-3">
                    {[
                      { label: 'Existe análise de risco da atividade?', value: existeAnaliseRisco, set: setExisteAnaliseRisco },
                      { label: 'Existe permissão de trabalho?', value: existePermissaoTrabalho, set: setExistePermissaoTrabalho },
                      { label: 'A atividade era realizada em dupla?', value: atividadeEmDupla, set: setAtividadeEmDupla },
                    ].map(({ label, value, set }) => (
                      <div key={label} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <Label className="text-sm font-medium">{label}</Label>
                        <Select value={value} onChange={(e) => set(e.target.value as 'sim' | 'nao')} className="w-full sm:w-28">
                          <option value="nao">Não</option>
                          <option value="sim">Sim</option>
                        </Select>
                      </div>
                    ))}
                  </div>
                  <Field>
                    <FieldLabel>Quais ferramentas foram utilizadas?</FieldLabel>
                    <Textarea value={ferramentasUtilizadas} onChange={(e) => setFerramentasUtilizadas(e.target.value)} placeholder="Ferramentas" rows={2} />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Ferramentas em boas condições?</FieldLabel>
                      <Select value={ferramentasBoasCondicoes} onChange={(e) => setFerramentasBoasCondicoes(e.target.value as 'sim' | 'nao')}>
                        <option value="nao">Não</option>
                        <option value="sim">Sim</option>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Ferramentas adequadas para a atividade?</FieldLabel>
                      <Select value={ferramentasAdequadas} onChange={(e) => setFerramentasAdequadas(e.target.value as 'sim' | 'nao')}>
                        <option value="nao">Não</option>
                        <option value="sim">Sim</option>
                      </Select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Número da OS / OM</FieldLabel>
                      <Input value={numeroOsOm} onChange={(e) => setNumeroOsOm(e.target.value)} placeholder="OS / OM" />
                    </Field>
                    <Field>
                      <FieldLabel>Setor da ocorrência</FieldLabel>
                      <Input value={setorOcorrencia} onChange={(e) => setSetorOcorrencia(e.target.value)} placeholder="Setor" />
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {/* 9. Atendimento médico */}
          {activeStep === 9 && (
            <Card className="cat-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">9. Atendimento médico</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Unidade, médico, CRM, CID-10 e atestado médico</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>Nome da unidade de atendimento</FieldLabel>
                    <Input value={nomeUnidadeAtendimento} onChange={(e) => setNomeUnidadeAtendimento(e.target.value)} placeholder="Unidade de saúde" />
                  </Field>
                  <Field>
                    <FieldLabel>Endereço da unidade</FieldLabel>
                    <Input value={enderecoUnidade} onChange={(e) => setEnderecoUnidade(e.target.value)} placeholder="Endereço" />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Horário de atendimento</FieldLabel>
                      <Input type="time" value={horarioAtendimento} onChange={(e) => setHorarioAtendimento(e.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel>CID-10 (diagnóstico provável)</FieldLabel>
                      <Input value={cid10} onChange={(e) => setCid10(e.target.value)} placeholder="Ex.: S00.0" />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Nome do médico</FieldLabel>
                      <Input value={nomeMedico} onChange={(e) => setNomeMedico(e.target.value)} placeholder="Médico" />
                    </Field>
                    <Field>
                      <FieldLabel>Número do CRM</FieldLabel>
                      <Input value={crmMedico} onChange={(e) => setCrmMedico(e.target.value)} placeholder="CRM" />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Atestado médico (anexar)</FieldLabel>
                    <Input type="file" accept=".pdf,image/*" onChange={(e) => setAtestadoMedico(e.target.files)} className="cursor-pointer" />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {/* 10. Responsável pelas informações */}
          {activeStep === 10 && (
            <Card className="cat-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">10. Responsável pelas informações</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Nome, função, data e assinatura de quem preencheu o questionário</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Nome</FieldLabel>
                      <Input value={nomeResponsavel} onChange={(e) => setNomeResponsavel(e.target.value)} placeholder="Nome completo" />
                    </Field>
                    <Field>
                      <FieldLabel>Função</FieldLabel>
                      <Input value={funcaoResponsavel} onChange={(e) => setFuncaoResponsavel(e.target.value)} placeholder="Cargo/função" />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Data</FieldLabel>
                      <Input type="date" value={dataPreenchimento} onChange={(e) => setDataPreenchimento(e.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel>Assinatura (nome por extenso ou digital)</FieldLabel>
                      <Input value={assinaturaResponsavel} onChange={(e) => setAssinaturaResponsavel(e.target.value)} placeholder="Assinatura" />
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="cat-form-actions">
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
          {activeStep < 10 ? (
            <Button type="button" variant="default" size="lg" className="w-full min-w-0" onClick={() => setActiveStep((s) => s + 1)}>
              Próximo
            </Button>
          ) : (
            <Button type="button" variant="default" size="lg" className="w-full min-w-0" disabled={submitting} onClick={enviarQuestionario}>
              {submitting ? 'Enviando...' : 'Enviar questionário e gerar CAT'}
            </Button>
          )}
        </div>
      </form>
    </PageContent>
  );
}
