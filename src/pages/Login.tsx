import { type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '@/components/login-form';

export default function Login() {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearError();
    const form = e.currentTarget;
    const username = (form.elements.namedItem('username') as HTMLInputElement)?.value ?? '';
    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value ?? '';
    try {
      await login({ username, password });
      navigate('/', { replace: true });
    } catch {
      // erro tratado no contexto
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Coluna esquerda: imagem de design espelhada */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="/Elemento%20de%20Design.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </div>

      {/* Coluna direita: formulário */}
      <div className="flex flex-1 flex-col items-center justify-center bg-primary p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm
            onSubmit={handleSubmit}
            error={error}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
