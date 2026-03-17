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
import { PageHeader } from '@/components/PageHeader';
import { PageContent } from '@/components/PageContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

const CHART_GRID_STROKE = 'hsl(var(--border))';
const CHART_AXIS_FILL = 'hsl(var(--muted-foreground))';
const CHART_TOOLTIP_BG = 'hsl(var(--card))';
const CHART_TOOLTIP_BORDER = 'hsl(var(--border))';
const CHART_PRIMARY = 'hsl(var(--primary))';

export default function Dashboard() {
  return (
    <PageContent>
      <PageHeader
        title="Dashboard"
        description="Visão geral da Área do Cliente"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-row items-center gap-4 pt-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <FileCheck className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                68%
              </span>
              <span className="text-sm text-muted-foreground">Concluídos</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-row items-center gap-4 pt-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/30 text-primary">
              <Clock className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                22%
              </span>
              <span className="text-sm text-muted-foreground">Em andamento</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-row items-center gap-4 pt-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <FileText className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                10%
              </span>
              <span className="text-sm text-muted-foreground">Pendentes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Atividade mensal</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BAR_DATA} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
                  <XAxis dataKey="name" stroke={CHART_AXIS_FILL} fontSize={12} tickLine={false} />
                  <YAxis stroke={CHART_AXIS_FILL} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: CHART_TOOLTIP_BG,
                      border: `1px solid ${CHART_TOOLTIP_BORDER}`,
                      borderRadius: 'var(--radius)',
                      padding: '8px 12px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', marginBottom: 4 }}
                  />
                  <Bar dataKey="valor" fill={CHART_PRIMARY} radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Solicitações na semana</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={LINE_DATA} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
                  <XAxis dataKey="name" stroke={CHART_AXIS_FILL} fontSize={12} tickLine={false} />
                  <YAxis stroke={CHART_AXIS_FILL} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: CHART_TOOLTIP_BG,
                      border: `1px solid ${CHART_TOOLTIP_BORDER}`,
                      borderRadius: 'var(--radius)',
                      padding: '8px 12px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="qtd"
                    stroke={CHART_PRIMARY}
                    strokeWidth={2}
                    dot={{ fill: CHART_PRIMARY, strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
}
