import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, type AuthLocals } from '../middleware/auth.js';
import { criarSolicitacao } from '../lib/solicitacao.js';

const router: Router = Router();
router.use(authMiddleware);

function getAuth(res: Response): AuthLocals {
  return (res.locals as unknown as { auth: AuthLocals }).auth;
}

// GET /api/ppp
router.get('/', async (_req, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const where: { empresaId?: string } = {};
  if (auth.role === 'client' && auth.empresaId) where.empresaId = auth.empresaId;

  const list = await prisma.solicitacaoPpp.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  const dados = list.map((p) => ({
    id: p.id,
    empresaId: p.empresaId,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    payload: p.payload ? (JSON.parse(p.payload) as object) : undefined,
  }));
  res.json({ sucesso: true, dados });
});

// GET /api/ppp/:id
router.get('/:id', async (req, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const ppp = await prisma.solicitacaoPpp.findUnique({ where: { id: req.params.id } });
  if (!ppp) {
    res.status(404).json({ mensagem: 'Solicitação PPP não encontrada' });
    return;
  }
  if (auth.role === 'client' && auth.empresaId && ppp.empresaId !== auth.empresaId) {
    res.status(403).json({ mensagem: 'Sem permissão' });
    return;
  }
  res.json({
    sucesso: true,
    dados: {
      id: ppp.id,
      empresaId: ppp.empresaId,
      status: ppp.status,
      createdAt: ppp.createdAt.toISOString(),
      payload: ppp.payload ? (JSON.parse(ppp.payload) as object) : undefined,
    },
  });
});

// POST /api/ppp
router.post('/', async (req: Request<object, object, { payload?: unknown }>, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const payload = req.body?.payload ?? req.body;
  let empresaId: string | null = auth.empresaId;

  if (!empresaId && payload && typeof payload === 'object') {
    const p = payload as { empresa?: { cnpj?: string } };
    if (p.empresa?.cnpj) {
      const emp = await prisma.empresa.findFirst({ where: { cnpj: p.empresa!.cnpj } });
      empresaId = emp?.id ?? null;
    }
  }
  if (!empresaId) {
    res.status(400).json({ mensagem: 'Empresa não identificada' });
    return;
  }

  const ppp = await prisma.solicitacaoPpp.create({
    data: {
      empresaId,
      payload: JSON.stringify(payload ?? {}),
      status: 'Pendente',
    },
  });

  const dataStr = new Date().toISOString().slice(0, 10);
  await criarSolicitacao('PPP', ppp.id, empresaId, dataStr, 'Pendente');

  res.status(201).json({ sucesso: true, dados: { id: ppp.id, status: ppp.status } });
});

export { router as pppRouter };
