/**
 * Base da API e helpers para chamadas autenticadas.
 */
export const getApiBase = (): string => import.meta.env.VITE_API_URL ?? '';

export function getAuthHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function apiFetch(
  path: string,
  token: string | null,
  options: RequestInit = {}
): Promise<Response> {
  const base = getApiBase();
  if (!base) throw new Error('VITE_API_URL não configurada');
  const url = path.startsWith('http') ? path : `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  return fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(token), ...(options.headers as Record<string, string>) },
  });
}
