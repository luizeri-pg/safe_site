import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../pages/Dashboard';

/** Rota inicial: admin vai para Acompanhamento, cliente para Dashboard. */
export default function DashboardOrRedirect() {
  const { isAdmin } = useAuth();
  if (isAdmin) return <Navigate to="/acompanhamento" replace />;
  return <Dashboard />;
}
