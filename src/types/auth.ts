/** Request do endpoint POST /auth/login */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Resultado do token na resposta de login */
export interface AuthResult {
  expires_in: number;
  access_token: string;
  token_type: string;
  /** Perfil do usuário: client = cliente da empresa, admin = acompanhamento de todas as solicitações */
  role?: 'client' | 'admin';
  /** Empresa à qual o usuário está vinculado (para cliente: só vê dados da própria empresa) */
  empresa_id?: string | number;
  empresa_nome?: string;
  /** Razão social e CNPJ da empresa (para preencher e travar em formulários) */
  empresa_razao_social?: string;
  empresa_cnpj?: string;
}

/** Response do endpoint POST /auth/login */
export interface LoginResponse {
  sucesso: boolean;
  mensagem: string | null;
  tempoProcessamento: number;
  requisicaoId: string;
  resultado: AuthResult;
}
