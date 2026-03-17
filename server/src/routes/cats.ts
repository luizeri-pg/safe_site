import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, type AuthLocals } from '../middleware/auth.js';
import { criarSolicitacao } from '../lib/solicitacao.js';

const router = Router();
router.use(authMiddleware);

function getAuth(res: Response): AuthLocals {
  return (res.locals as unknown as { auth: AuthLocals }).auth;
}

// GET /api/cats — listagem (dados só do BD)
router.get('/', async (_req, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const where: { empresaId?: string } = {};
  if (auth.role === 'client' && auth.empresaId) where.empresaId = auth.empresaId;

  const list = await prisma.cat.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const dados = list.map((c) => ({
    id: c.id,
    empresaId: c.empresaId,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    payload: c.payload ? (JSON.parse(c.payload) as object) : undefined,
  }));
  res.json({ sucesso: true, dados });
});

// GET /api/cats/:id — um registro (do BD)
router.get('/:id', async (req, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const cat = await prisma.cat.findUnique({ where: { id: req.params.id } });
  if (!cat) {
    res.status(404).json({ mensagem: 'CAT não encontrada' });
    return;
  }
  if (auth.role === 'client' && auth.empresaId && cat.empresaId !== auth.empresaId) {
    res.status(403).json({ mensagem: 'Sem permissão' });
    return;
  }
  res.json({
    sucesso: true,
    dados: {
      id: cat.id,
      empresaId: cat.empresaId,
      status: cat.status,
      createdAt: cat.createdAt.toISOString(),
      payload: cat.payload ? (JSON.parse(cat.payload) as object) : undefined,
    },
  });
});

// POST /api/cats — criar (body vem do front; persiste no BD)
router.post('/', async (req: Request<object, object, { payload: unknown }>, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const empresaId = auth.empresaId ?? (req.body?.payload as { empregador?: { cnpj?: string } } | undefined)?.empregador?.cnpj;
  if (!empresaId && auth.role === 'client') {
    res.status(400).json({ mensagem: 'Empresa não identificada' });
    return;
  }

  // Se cliente, usar empresa do token; senão pode vir no body (admin criando por outra empresa)
  let empresaIdFinal = auth.empresaId;
  if (req.body?.payload && typeof req.body.payload === 'object') {
    const p = req.body.payload as { empregador?: { cnpj?: string } };
    if (p.empregador?.cnpj && !empresaIdFinal) {
      const emp = await prisma.empresa.findFirst({ where: { cnpj: p.empregador.cnpj } });
      empresaIdFinal = emp?.id ?? undefined;
    }
  }
  if (!empresaIdFinal) {
    res.status(400).json({ mensagem: 'Empresa não encontrada no cadastro' });
    return;
  }

  const payloadStr = JSON.stringify(req.body?.payload ?? {});
  const cat = await prisma.cat.create({
    data: {
      empresaId: empresaIdFinal,
      payload: payloadStr,
      status: 'Pendente',
    },
  });

  const dataStr = new Date().toISOString().slice(0, 10);
  await criarSolicitacao('CAT', cat.id, empresaIdFinal, dataStr, 'Pendente');

  res.status(201).json({
    sucesso: true,
    dados: {
      id: cat.id,
      empresaId: cat.empresaId,
      status: cat.status,
      createdAt: cat.createdAt.toISOString(),
    },
  });
});

export { router as catsRouter };
