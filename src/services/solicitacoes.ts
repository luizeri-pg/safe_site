import { getApiBase, getAuthHeaders } from './api';

export interface SolicitacaoItem {
  id: number;
  empresa: string;
  tipo: string;
  data: string;
  status: string;
  descricao?: string;
}

export interface SolicitacoesResponse {
  sucesso: boolean;
  dados: SolicitacaoItem[];
}

export async function listarSolicitacoes(
  token: string,
  params?: { tipo?: string; status?: string; busca?: string }
): Promise<SolicitacoesResponse> {
  const base = getApiBase();
  if (!base) throw new Error('API não configurada (VITE_API_URL)');
  const search = new URLSearchParams();
  if (params?.tipo) search.set('tipo', params.tipo);
  if (params?.status) search.set('status', params.status);
  if (params?.busca) search.set('busca', params.busca);
  const qs = search.toString();
  const url = `${base.replace(/\/$/, '')}/api/solicitacoes${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, {
    headers: getAuthHeaders(token),
  });
  const data: SolicitacoesResponse = await res.json();
  if (!res.ok) {
    throw new Error('Falha ao carregar solicitações');
  }
  return data;
}

export async function atualizarSolicitacao(
  token: string,
  id: number,
  body: { status?: string; descricao?: string }
): Promise<SolicitacaoItem> {
  const base = getApiBase();
  if (!base) throw new Error('API não configurada (VITE_API_URL)');
  const url = `${base.replace(/\/$/, '')}/api/solicitacoes/${id}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error((msg as { mensagem?: string })?.mensagem ?? 'Falha ao atualizar');
  }
  return res.json();
}

export interface DetalheSolicitacaoEmpresa {
  id: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  endereco?: string;
  telefone?: string;
}

export interface DetalheSolicitacaoSolicitante {
  nome?: string;
  email?: string;
  telefone?: string;
}

export interface DetalheSolicitacao {
  id: number;
  tipo: string;
  data: string;
  status: string;
  descricao?: string;
  referencia_id: string;
  empresa: DetalheSolicitacaoEmpresa;
  solicitante: DetalheSolicitacaoSolicitante;
  payload?: unknown;
}

/** Resposta bruta da API (camelCase) */
interface DetalheSolicitacaoApi {
  id: number;
  tipo: string;
  data: string;
  status: string;
  descricao?: string;
  referenciaId: string;
  empresa: {
    id: string;
    razaoSocial: string;
    nomeFantasia?: string;
    cnpj: string;
    endereco?: string;
    telefone?: string;
  };
  solicitante: { nome?: string; email?: string; telefone?: string };
  payload?: unknown;
}

function detalheApiParaFrontend(api: DetalheSolicitacaoApi): DetalheSolicitacao {
  return {
    id: api.id,
    tipo: api.tipo,
    data: api.data,
    status: api.status,
    descricao: api.descricao,
    referencia_id: api.referenciaId,
    empresa: {
      id: api.empresa.id,
      razao_social: api.empresa.razaoSocial,
      nome_fantasia: api.empresa.nomeFantasia,
      cnpj: api.empresa.cnpj,
      endereco: api.empresa.endereco,
      telefone: api.empresa.telefone,
    },
    solicitante: api.solicitante,
    payload: api.payload,
  };
}

export async function obterDetalheSolicitacao(
  token: string,
  id: number
): Promise<{ sucesso: boolean; dados: DetalheSolicitacao | null; naoEncontrado?: boolean }> {
  const base = getApiBase();
  if (!base) throw new Error('API não configurada (VITE_API_URL)');
  const url = `${base.replace(/\/$/, '')}/api/solicitacoes/${id}/detalhe`;
  const res = await fetch(url, { headers: getAuthHeaders(token) });
  const data = (await res.json()) as { sucesso?: boolean; dados?: DetalheSolicitacaoApi; mensagem?: string };
  if (res.status === 404) {
    return { sucesso: false, dados: null, naoEncontrado: true };
  }
  if (!res.ok) {
    throw new Error(data.mensagem ?? 'Falha ao carregar detalhes');
  }
  const dados = data.dados ? detalheApiParaFrontend(data.dados) : null;
  return { sucesso: !!dados, dados };
}
