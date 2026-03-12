import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { FileCheck, Clock, FileText } from 'lucide-react';
import './Dashboard.css';

const BAR_DATA = [
  { name: 'Jan', valor: 12 },
  { name: 'Fev', valor: 19 },
  { name: 'Mar', valor: 15 },
  { name: 'Abr', valor: 22 },
  { name: 'Mai', valor: 18 },
  { name: 'Jun', valor: 25 },
];

const LINE_DATA = [
  { name: 'Seg', qtd: 4 },
  { name: 'Ter', qtd: 7 },
  { name: 'Qua', qtd: 5 },
  { name: 'Qui', qtd: 9 },
  { name: 'Sex', qtd: 6 },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Visão geral da Área do Cliente</p>
      </header>

      <div className="dashboard-kpis">
        <div className="dashboard-kpi">
          <div className="dashboard-kpi-icon dashboard-kpi-icon--teal">
            <FileCheck size={24} />
          </div>
          <div className="dashboard-kpi-content">
            <span className="dashboard-kpi-value">68%</span>
            <span className="dashboard-kpi-label">Concluídos</span>
          </div>
        </div>
        <div className="dashboard-kpi">
          <div className="dashboard-kpi-icon dashboard-kpi-icon--blue">
            <Clock size={24} />
          </div>
          <div className="dashboard-kpi-content">
            <span className="dashboard-kpi-value">22%</span>
            <span className="dashboard-kpi-label">Em andamento</span>
          </div>
        </div>
        <div className="dashboard-kpi">
          <div className="dashboard-kpi-icon dashboard-kpi-icon--gray">
            <FileText size={24} />
          </div>
          <div className="dashboard-kpi-content">
            <span className="dashboard-kpi-value">10%</span>
            <span className="dashboard-kpi-label">Pendentes</span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <section className="dashboard-card">
          <h2 className="dashboard-card-title">Atividade mensal</h2>
          <div className="dashboard-chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={BAR_DATA} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(241,245,249,0.6)" fontSize={13} tickLine={false} />
                <YAxis stroke="rgba(241,245,249,0.6)" fontSize={13} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(30,41,59,0.98)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                  }}
                  labelStyle={{ color: '#f1f5f9', marginBottom: 4 }}
                />
                <Bar dataKey="valor" fill="#00ACD4" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="dashboard-card">
          <h2 className="dashboard-card-title">Solicitações na semana</h2>
          <div className="dashboard-chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={LINE_DATA} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(241,245,249,0.6)" fontSize={13} tickLine={false} />
                <YAxis stroke="rgba(241,245,249,0.6)" fontSize={13} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(30,41,59,0.98)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="qtd"
                  stroke="#00ACD4"
                  strokeWidth={2.5}
                  dot={{ fill: '#00ACD4', strokeWidth: 0, r: 5 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
