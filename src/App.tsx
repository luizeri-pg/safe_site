import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import DashboardOrRedirect from './components/DashboardOrRedirect';
import Login from './pages/Login';
import Manuais from './pages/Manuais';
import SolicitacaoPpp from './pages/SolicitacaoPpp';
import AberturaCat from './pages/AberturaCat';
import InclusaoCargo from './pages/InclusaoCargo';
import InclusaoSetorGhe from './pages/InclusaoSetorGhe';
import InclusaoNovaUnidade from './pages/InclusaoNovaUnidade';
import AberturaChamado from './pages/AberturaChamado';
import SolicitacaoVisitaTecnica from './pages/SolicitacaoVisitaTecnica';
import Acompanhamento from './pages/Acompanhamento';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEmpresas from './pages/admin/AdminEmpresas';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminRelatorios from './pages/admin/AdminRelatorios';
import AdminConfiguracoes from './pages/admin/AdminConfiguracoes';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOrRedirect />} />
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/empresas" element={<AdminEmpresas />} />
            <Route path="admin/usuarios" element={<AdminUsuarios />} />
            <Route path="admin/relatorios" element={<AdminRelatorios />} />
            <Route path="admin/configuracoes" element={<AdminConfiguracoes />} />
            <Route path="acompanhamento" element={<Acompanhamento />} />
            <Route path="abertura-cat/arquivos" element={<AberturaCat />} />
            <Route path="abertura-cat/adicionar" element={<AberturaCat />} />
            <Route path="abertura-cat" element={<Navigate to="/abertura-cat/arquivos" replace />} />
            <Route path="manuais-e-procedimentos">
              <Route index element={<Navigate to="arquivos" replace />} />
              <Route path="arquivos" element={<Manuais />} />
              <Route path="adicionar" element={<Manuais />} />
            </Route>
            <Route path="solicitacao-ppp">
              <Route index element={<Navigate to="arquivos" replace />} />
              <Route path="arquivos" element={<SolicitacaoPpp />} />
              <Route path="adicionar" element={<SolicitacaoPpp />} />
            </Route>
            <Route path="inclusao-cargo/adicionar" element={<InclusaoCargo />} />
            <Route path="inclusao-cargo/arquivos" element={<InclusaoCargo />} />
            <Route path="inclusao-cargo" element={<Navigate to="/inclusao-cargo/arquivos" replace />} />
            <Route path="inclusao-setor-ghe/adicionar" element={<InclusaoSetorGhe />} />
            <Route path="inclusao-setor-ghe/arquivos" element={<InclusaoSetorGhe />} />
            <Route path="inclusao-setor-ghe" element={<Navigate to="/inclusao-setor-ghe/arquivos" replace />} />
            <Route path="inclusao-nova-unidade/adicionar" element={<InclusaoNovaUnidade />} />
            <Route path="inclusao-nova-unidade/arquivos" element={<InclusaoNovaUnidade />} />
            <Route path="inclusao-nova-unidade" element={<Navigate to="/inclusao-nova-unidade/arquivos" replace />} />
            <Route path="solicitacao-visita-tecnica/adicionar" element={<SolicitacaoVisitaTecnica />} />
            <Route path="solicitacao-visita-tecnica/arquivos" element={<SolicitacaoVisitaTecnica />} />
            <Route path="solicitacao-visita-tecnica" element={<Navigate to="/solicitacao-visita-tecnica/arquivos" replace />} />
            <Route path="abertura-chamado/gera-chamado" element={<AberturaChamado />} />
            <Route path="abertura-chamado/painel" element={<AberturaChamado />} />
            <Route path="abertura-chamado" element={<Navigate to="/abertura-chamado/painel" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
