import { getApiBase, getAuthHeaders } from './api';

export interface DashboardStats {
  total: number;
  pendentes: number;
  em_analise: number;
  concluidas: number;
  por_tipo: { tipo: string; quantidade: number }[];
  por_mes: { ano: number; mes: number; label: string; quantidade: number }[];
  pendentes_ha_mais_dias: number;
  dias_pendente_alerta: number;
  ultimas: { id: number; empresa: string; tipo: string; data: string; status: string }[];
}

export async function getDashboardStats(
  token: string,
  diasPendenteAlerta?: number
): Promise<{ sucesso: boolean; dados: DashboardStats }> {
  const base = getApiBase();
  if (!base) throw new Error('API não configurada');
  const qs = diasPendenteAlerta != null ? `?diasPendenteAlerta=${diasPendenteAlerta}` : '';
  const res = await fetch(`${base.replace(/\/$/, '')}/api/admin/dashboard${qs}`, {
    headers: getAuthHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { mensagem?: string }).mensagem ?? 'Falha ao carregar dashboard');
  return data;
}

export interface EmpresaItem {
  id: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  endereco?: string;
  telefone?: string;
}

export async function listarEmpresas(token: string): Promise<{ sucesso: boolean; dados: EmpresaItem[] }> {
  const base = getApiBase();
  if (!base) throw new Error('API não configurada');
  const res = await fetch(`${base.replace(/\/$/, '')}/api/empresas`, { headers: getAuthHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { mensagem?: string }).mensagem ?? 'Falha ao listar empresas');
  return data;
}

export async function criarEmpresa(
  token: string,
  body: { razaoSocial: string; nomeFantasia?: string; cnpj: string; endereco?: string; telefone?: string }
): Promise<{ sucesso: boolean; dados: EmpresaItem }> {
  const base = getApiBase();
  if (!base) throw new Error('API não configurada');
  const res = await fetch(`${base.replace(/\/$/, '')}/api/empresas`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { mensagem?: string }).mensagem ?? 'Falha ao criar empresa');
  return data;
}

/** Campos editáveis da empresa (CNPJ e razão social não são alteráveis) */
export async function atualizarEmpresa(
  token: string,
  id: string,
  body: { nome_fantasia?: string; endereco?: string; telefone?: string }
): Promise<{ sucesso: boolean; dados: EmpresaItem }> {
  const base = getApiBase();
  if (!base) throw new Error('API não configurada');
  const res = await fetch(`${base.replace(/\/$/, '')}/api/empresas/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { mensagem?: string }).mensagem ?? 'Falha ao atualizar empresa');
  return data;
}

export interface UsuarioItem {
  id: string;
  email: string;
  role: string;
  empresa_id?: string;
  empresa_nome?: string;
}

export async function listarUsuarios(token: string): Promise<{ sucesso: boolean; dados: UsuarioItem[] }> {
  const base = getApiBase();
  if (!base) throw new Error('API não configurada');
  const res = await fetch(`${base.replace(/\/$/, '')}/api/usuarios`, { headers: getAuthHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { mensagem?: string }).mensagem ?? 'Falha ao listar usuários');
  return data;
}

export async function criarUsuario(
  token: string,
  body: { email: string; senha: string; role: string; empresaId?: string }
): Promise<{ sucesso: boolean; dados: UsuarioItem }> {
  const base = getApiBase();
  if (!base) throw new Error('API não configurada');
  const res = await fetch(`${base.replace(/\/$/, '')}/api/usuarios`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { mensagem?: string }).mensagem ?? 'Falha ao criar usuário');
  return data;
}

export async function atualizarUsuario(
  token: string,
  id: string,
  body: { email?: string; senha?: string; role?: string; empresaId?: string }
): Promise<{ sucesso: boolean; dados: UsuarioItem }> {
  const base = getApiBase();
  if (!base) throw new Error('API não configurada');
  const res = await fetch(`${base.replace(/\/$/, '')}/api/usuarios/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { mensagem?: string }).mensagem ?? 'Falha ao atualizar usuário');
  return data;
}
