import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, type AuthLocals } from '../middleware/auth.js';

const router: Router = Router();
router.use(authMiddleware);

function getAuth(res: Response): AuthLocals {
  return (res.locals as unknown as { auth: AuthLocals }).auth;
}

function requireAdmin(res: Response): boolean {
  const auth = getAuth(res);
  if (auth.role !== 'admin') {
    res.status(403).json({ mensagem: 'Acesso restrito a administradores' });
    return false;
  }
  return true;
}

// GET /api/admin/dashboard?diasPendenteAlerta=7
router.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(res)) return;
  const diasPendenteAlerta = req.query.diasPendenteAlerta
    ? parseInt(String(req.query.diasPendenteAlerta), 10)
    : 7;
  if (Number.isNaN(diasPendenteAlerta)) {
    res.status(400).json({ mensagem: 'diasPendenteAlerta inválido' });
    return;
  }

  const dataLimitePendente = new Date(Date.now() - diasPendenteAlerta * 24 * 60 * 60 * 1000);

  const [
    list,
    porTipoRaw,
    totalSolicitacoes,
    totalPendentes,
    totalEmAnalise,
    totalConcluidas,
    pendentesHaMaisDias,
  ] = await Promise.all([
    prisma.solicitacao.findMany({
      where: {},
      include: { empresa: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.solicitacao.groupBy({
      by: ['tipo'],
      _count: { id: true },
      where: {},
    }),
    prisma.solicitacao.count(),
    prisma.solicitacao.count({ where: { status: 'Pendente' } }),
    prisma.solicitacao.count({ where: { status: 'Em análise' } }),
    prisma.solicitacao.count({ where: { status: 'Concluído' } }),
    prisma.solicitacao.count({
      where: {
        status: 'Pendente',
        createdAt: { lt: dataLimitePendente },
      },
    }),
  ]);

  const porTipo = porTipoRaw.map((r) => ({ tipo: r.tipo, quantidade: r._count.id }));
  const porMes: { ano: number; mes: number; label: string; quantidade: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const ano = d.getFullYear();
    const mes = d.getMonth() + 1;
    const quantidade = await prisma.solicitacao.count({
      where: {
        createdAt: {
          gte: new Date(ano, mes - 1, 1),
          lt: new Date(ano, mes, 1),
        },
      },
    });
    const mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    porMes.push({ ano, mes, label: `${mesesLabels[mes - 1]}/${ano}`, quantidade });
  }

  const ultimas = list.map((s) => ({
    id: s.id,
    empresa: s.empresa?.nomeFantasia ?? s.empresa?.razaoSocial ?? '',
    tipo: s.tipo,
    data: s.data,
    status: s.status,
  }));

  res.json({
    sucesso: true,
    dados: {
      total: totalSolicitacoes,
      pendentes: totalPendentes,
      em_analise: totalEmAnalise,
      concluidas: totalConcluidas,
      por_tipo: porTipo,
      por_mes: porMes,
      pendentes_ha_mais_dias: pendentesHaMaisDias,
      dias_pendente_alerta: diasPendenteAlerta,
      ultimas,
    },
  });
});

export { router as adminRouter };
