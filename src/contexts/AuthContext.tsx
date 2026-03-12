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

function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  /** client = área do cliente; admin = pode acessar acompanhamento de todas as empresas */
  userRole: 'client' | 'admin' | null;
  isAdmin: boolean;
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
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_EXPIRES_AT);
    localStorage.removeItem(STORAGE_ROLE);
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
        const { access_token, expires_in, role } = response.resultado;
        const expirySeconds = Math.min(expires_in, TOKEN_EXPIRY_SECONDS);
        const newExpiresAt = Date.now() + expirySeconds * 1000;
        const roleToStore = role === 'admin' ? 'admin' : 'client';

        setToken(access_token);
        setExpiresAt(newExpiresAt);
        setUserRole(roleToStore);
        localStorage.setItem(STORAGE_TOKEN, access_token);
        localStorage.setItem(STORAGE_EXPIRES_AT, String(newExpiresAt));
        localStorage.setItem(STORAGE_ROLE, roleToStore);
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

  const value: AuthContextValue = useMemo(
    () => ({
      token,
      isAuthenticated,
      userRole,
      isAdmin,
      isLoading,
      login,
      logout,
      error,
      clearError,
    }),
    [token, isAuthenticated, userRole, isAdmin, isLoading, login, logout, error, clearError]
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
