import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import DashboardOrRedirect from './components/DashboardOrRedirect';
import Login from './pages/Login';
import Manuais from './pages/Manuais';
import SectionPage from './pages/SectionPage';
import SolicitacaoPpp from './pages/SolicitacaoPpp';
import Acompanhamento from './pages/Acompanhamento';
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
            <Route path="acompanhamento" element={<Acompanhamento />} />
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
            <Route path="abertura-cat">
              <Route index element={<Navigate to="arquivos" replace />} />
              <Route path="arquivos" element={<SectionPage title="Abertura de CAT" basePath="/abertura-cat" />} />
              <Route path="adicionar" element={<SectionPage title="Abertura de CAT" basePath="/abertura-cat" />} />
            </Route>
            <Route path="inclusao-cargo">
              <Route index element={<Navigate to="arquivos" replace />} />
              <Route path="arquivos" element={<SectionPage title="Inclusão de Cargo" basePath="/inclusao-cargo" />} />
              <Route path="adicionar" element={<SectionPage title="Inclusão de Cargo" basePath="/inclusao-cargo" />} />
            </Route>
            <Route path="inclusao-setor-ghe">
              <Route index element={<Navigate to="arquivos" replace />} />
              <Route path="arquivos" element={<SectionPage title="Inclusão de Setor | GHE" basePath="/inclusao-setor-ghe" />} />
              <Route path="adicionar" element={<SectionPage title="Inclusão de Setor | GHE" basePath="/inclusao-setor-ghe" />} />
            </Route>
            <Route path="inclusao-nova-unidade">
              <Route index element={<Navigate to="arquivos" replace />} />
              <Route path="arquivos" element={<SectionPage title="Inclusão de Nova Unidade" basePath="/inclusao-nova-unidade" />} />
              <Route path="adicionar" element={<SectionPage title="Inclusão de Nova Unidade" basePath="/inclusao-nova-unidade" />} />
            </Route>
            <Route path="solicitacao-visita-tecnica">
              <Route index element={<Navigate to="arquivos" replace />} />
              <Route path="arquivos" element={<SectionPage title="Solicitação de Visita Técnica" basePath="/solicitacao-visita-tecnica" />} />
              <Route path="adicionar" element={<SectionPage title="Solicitação de Visita Técnica" basePath="/solicitacao-visita-tecnica" />} />
            </Route>
            <Route path="abertura-chamado">
              <Route index element={<Navigate to="gera-chamado" replace />} />
              <Route path="gera-chamado" element={<SectionPage title="Abertura de Chamado" basePath="/abertura-chamado" viewLabel="Gera chamado" />} />
              <Route path="painel" element={<SectionPage title="Abertura de Chamado" basePath="/abertura-chamado" viewLabel="Painel de acompanhamento" />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
