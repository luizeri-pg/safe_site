/**
 * Utilitário para chamadas autenticadas.
 * Use useAuth().token no componente e passe para getAuthHeaders().
 */
export function getAuthHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}
