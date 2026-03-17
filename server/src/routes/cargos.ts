import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, type AuthLocals } from '../middleware/auth.js';
import { criarSolicitacao } from '../lib/solicitacao.js';

const router = Router();
router.use(authMiddleware);

function getAuth(res: Response): AuthLocals {
  return (res.locals as unknown as { auth: AuthLocals }).auth;
}

// GET /api/cargos
router.get('/', async (_req, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const where: { empresaId?: string } = {};
  if (auth.role === 'client' && auth.empresaId) where.empresaId = auth.empresaId;

  const list = await prisma.cargo.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ sucesso: true, dados: list });
});

// GET /api/cargos/:id
router.get('/:id', async (req, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const cargo = await prisma.cargo.findUnique({ where: { id: req.params.id } });
  if (!cargo) {
    res.status(404).json({ mensagem: 'Cargo não encontrado' });
    return;
  }
  if (auth.role === 'client' && auth.empresaId && cargo.empresaId !== auth.empresaId) {
    res.status(403).json({ mensagem: 'Sem permissão' });
    return;
  }
  res.json({ sucesso: true, dados: cargo });
});

// POST /api/cargos
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const body = req.body as {
    empresa?: { cnpj?: string };
    cargo?: { nomeCargo: string; cbo?: string; setor?: string; descricaoAtividades?: string; grauRisco?: string };
    solicitacao?: { dataSolicitacao?: string; nomeSolicitante?: string };
  };

  let empresaId = auth.empresaId;
  if (!empresaId && body.empresa?.cnpj) {
    const emp = await prisma.empresa.findFirst({ where: { cnpj: body.empresa!.cnpj } });
    empresaId = emp?.id ?? undefined;
  }
  if (!empresaId) {
    res.status(400).json({ mensagem: 'Empresa não identificada' });
    return;
  }

  const c = body.cargo ?? {};
  const s = body.solicitacao ?? {};
  const cargo = await prisma.cargo.create({
    data: {
      empresaId,
      nomeCargo: c.nomeCargo ?? '',
      cbo: c.cbo ?? null,
      setor: c.setor ?? null,
      descricaoAtividades: c.descricaoAtividades ?? null,
      grauRisco: c.grauRisco ?? null,
      dataSolicitacao: s.dataSolicitacao ?? null,
      nomeSolicitante: s.nomeSolicitante ?? null,
      status: 'Pendente',
    },
  });

  const dataStr = s.dataSolicitacao ?? new Date().toISOString().slice(0, 10);
  await criarSolicitacao('CARGO', cargo.id, empresaId, dataStr, 'Pendente');

  res.status(201).json({ sucesso: true, dados: { id: cargo.id, status: cargo.status } });
});

export { router as cargosRouter };
