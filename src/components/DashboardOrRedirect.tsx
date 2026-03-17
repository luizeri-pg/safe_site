import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../pages/Dashboard';

/** Rota inicial: admin vai para Dashboard Admin, cliente para Dashboard. */
export default function DashboardOrRedirect() {
  const { isAdmin } = useAuth();
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return <Dashboard />;
}
