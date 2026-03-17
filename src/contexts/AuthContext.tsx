import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { login as apiLogin } from '../services/auth';
import type { LoginRequest } from '../types/auth';

const STORAGE_TOKEN = 'safe_site_access_token';
const STORAGE_EXPIRES_AT = 'safe_site_token_expires_at';
const STORAGE_ROLE = 'safe_site_user_role';
const STORAGE_EMPRESA_ID = 'safe_site_user_empresa_id';
const STORAGE_EMPRESA_NOME = 'safe_site_user_empresa_nome';
const STORAGE_EMPRESA_RAZAO_SOCIAL = 'safe_site_user_empresa_razao_social';
const STORAGE_EMPRESA_CNPJ = 'safe_site_user_empresa_cnpj';
/** Token expira em 30 minutos (em segundos) */
const TOKEN_EXPIRY_SECONDS = 30 * 60;

function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_TOKEN);
}

function getStoredExpiresAt(): number | null {
  const value = localStorage.getItem(STORAGE_EXPIRES_AT);
  return value ? parseInt(value, 10) : null;
}

function getStoredRole(): 'client' | 'admin' | null {
  const v = localStorage.getItem(STORAGE_ROLE);
  return v === 'admin' || v === 'client' ? v : null;
}

function getStoredEmpresaId(): string | null {
  const v = localStorage.getItem(STORAGE_EMPRESA_ID);
  return v || null;
}

function getStoredEmpresaNome(): string | null {
  return localStorage.getItem(STORAGE_EMPRESA_NOME);
}

function getStoredEmpresaRazaoSocial(): string | null {
  return localStorage.getItem(STORAGE_EMPRESA_RAZAO_SOCIAL);
}

function getStoredEmpresaCnpj(): string | null {
  return localStorage.getItem(STORAGE_EMPRESA_CNPJ);
}

function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  /** client = área do cliente; admin = pode acessar acompanhamento de todas as empresas */
  userRole: 'client' | 'admin' | null;
  isAdmin: boolean;
  /** Empresa à qual o usuário está vinculado (null se admin ou não informado) */
  userEmpresaId: string | null;
  userEmpresaNome: string | null;
  /** Razão social e CNPJ da empresa (para preencher e travar em formulários) */
  userEmpresaRazaoSocial: string | null;
  userEmpresaCnpj: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [expiresAt, setExpiresAt] = useState<number | null>(() =>
    getStoredExpiresAt()
  );
  const [userRole, setUserRole] = useState<'client' | 'admin' | null>(() =>
    getStoredRole()
  );
  const [userEmpresaId, setUserEmpresaId] = useState<string | null>(() =>
    getStoredEmpresaId()
  );
  const [userEmpresaNome, setUserEmpresaNome] = useState<string | null>(() =>
    getStoredEmpresaNome()
  );
  const [userEmpresaRazaoSocial, setUserEmpresaRazaoSocial] = useState<string | null>(() =>
    getStoredEmpresaRazaoSocial()
  );
  const [userEmpresaCnpj, setUserEmpresaCnpj] = useState<string | null>(() =>
    getStoredEmpresaCnpj()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = userRole === 'admin';

  const isAuthenticated = useMemo(() => {
    if (!token || !expiresAt) return false;
    if (isTokenExpired(expiresAt)) return false;
    return true;
  }, [token, expiresAt]);

  const clearError = useCallback(() => setError(null), []);

  const logout = useCallback(() => {
    setToken(null);
    setExpiresAt(null);
    setUserRole(null);
    setUserEmpresaId(null);
    setUserEmpresaNome(null);
    setUserEmpresaRazaoSocial(null);
    setUserEmpresaCnpj(null);
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_EXPIRES_AT);
    localStorage.removeItem(STORAGE_ROLE);
    localStorage.removeItem(STORAGE_EMPRESA_ID);
    localStorage.removeItem(STORAGE_EMPRESA_NOME);
    localStorage.removeItem(STORAGE_EMPRESA_RAZAO_SOCIAL);
    localStorage.removeItem(STORAGE_EMPRESA_CNPJ);
    setError(null);
  }, []);

  /** Verifica expiração ao montar e a cada minuto */
  useEffect(() => {
    if (!token || !expiresAt) return;
    if (isTokenExpired(expiresAt)) {
      logout();
      return;
    }
    const interval = setInterval(() => {
      if (isTokenExpired(expiresAt)) {
        logout();
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [token, expiresAt, logout]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiLogin(credentials);
        const { access_token, expires_in, role, empresa_id, empresa_nome, empresa_razao_social, empresa_cnpj } = response.resultado;
        const expirySeconds = Math.min(expires_in, TOKEN_EXPIRY_SECONDS);
        const newExpiresAt = Date.now() + expirySeconds * 1000;
        const roleToStore = role === 'admin' ? 'admin' : 'client';
        const empresaId = empresa_id != null ? String(empresa_id) : null;
        const empresaNome = empresa_nome ?? null;
        const empresaRazaoSocial = empresa_razao_social ?? null;
        const empresaCnpj = empresa_cnpj ?? null;

        setToken(access_token);
        setExpiresAt(newExpiresAt);
        setUserRole(roleToStore);
        setUserEmpresaId(empresaId);
        setUserEmpresaNome(empresaNome);
        setUserEmpresaRazaoSocial(empresaRazaoSocial);
        setUserEmpresaCnpj(empresaCnpj);
        localStorage.setItem(STORAGE_TOKEN, access_token);
        localStorage.setItem(STORAGE_EXPIRES_AT, String(newExpiresAt));
        localStorage.setItem(STORAGE_ROLE, roleToStore);
        if (empresaId) localStorage.setItem(STORAGE_EMPRESA_ID, empresaId);
        else localStorage.removeItem(STORAGE_EMPRESA_ID);
        if (empresaNome) localStorage.setItem(STORAGE_EMPRESA_NOME, empresaNome);
        else localStorage.removeItem(STORAGE_EMPRESA_NOME);
        if (empresaRazaoSocial) localStorage.setItem(STORAGE_EMPRESA_RAZAO_SOCIAL, empresaRazaoSocial);
        else localStorage.removeItem(STORAGE_EMPRESA_RAZAO_SOCIAL);
        if (empresaCnpj) localStorage.setItem(STORAGE_EMPRESA_CNPJ, empresaCnpj);
        else localStorage.removeItem(STORAGE_EMPRESA_CNPJ);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao autenticar';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Em desenvolvimento: se o usuário é cliente, usa fallback para exibir razão social e CNPJ travados (mesmo quando a API não enviou ou sessão antiga sem esses dados)
  const isDev = import.meta.env.DEV;
  const isClient = userRole === 'client';
  const effectiveRazaoSocial = userEmpresaRazaoSocial ?? (isDev && isClient ? (userEmpresaNome ?? 'Empresa Alpha Ltda') : null);
  const effectiveCnpj = userEmpresaCnpj ?? (isDev && isClient ? '00.000.000/0001-00' : null);

  const value: AuthContextValue = useMemo(
    () => ({
      token,
      isAuthenticated,
      userRole,
      isAdmin,
      userEmpresaId,
      userEmpresaNome,
      userEmpresaRazaoSocial: effectiveRazaoSocial,
      userEmpresaCnpj: effectiveCnpj,
      isLoading,
      login,
      logout,
      error,
      clearError,
    }),
    [token, isAuthenticated, userRole, isAdmin, userEmpresaId, userEmpresaNome, effectiveRazaoSocial, effectiveCnpj, isLoading, login, logout, error, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
}
