import type { LoginRequest, LoginResponse } from '../types/auth';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data: LoginResponse = await res.json();

  if (!res.ok) {
    throw new Error(data.mensagem ?? 'Falha ao fazer login');
  }

  if (!data.sucesso || !data.resultado?.access_token) {
    throw new Error(data.mensagem ?? 'Resposta inválida do servidor');
  }

  return data;
}
