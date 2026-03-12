const API_BASE = import.meta.env.VITE_API_URL ?? '';

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
  const search = new URLSearchParams();
  if (params?.tipo) search.set('tipo', params.tipo);
  if (params?.status) search.set('status', params.status);
  if (params?.busca) search.set('busca', params.busca);
  const qs = search.toString();
  const url = `${API_BASE}/api/solicitacoes${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
  const url = `${API_BASE}/api/solicitacoes/${id}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error((msg as { mensagem?: string })?.mensagem ?? 'Falha ao atualizar');
  }
  return res.json();
}
