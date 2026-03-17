import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, type AuthLocals } from '../middleware/auth.js';
import { criarSolicitacao } from '../lib/solicitacao.js';

const router = Router();
router.use(authMiddleware);

function getAuth(res: Response): AuthLocals {
  return (res.locals as unknown as { auth: AuthLocals }).auth;
}

// GET /api/setores-ghe
router.get('/', async (_req, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const where: { empresaId?: string } = {};
  if (auth.role === 'client' && auth.empresaId) where.empresaId = auth.empresaId;

  const list = await prisma.setorGhe.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ sucesso: true, dados: list });
});

// GET /api/setores-ghe/:id
router.get('/:id', async (req, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const setor = await prisma.setorGhe.findUnique({ where: { id: req.params.id } });
  if (!setor) {
    res.status(404).json({ mensagem: 'Setor/GHE não encontrado' });
    return;
  }
  if (auth.role === 'client' && auth.empresaId && setor.empresaId !== auth.empresaId) {
    res.status(403).json({ mensagem: 'Sem permissão' });
    return;
  }
  res.json({ sucesso: true, dados: setor });
});

// POST /api/setores-ghe
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const body = req.body as {
    empresa?: { cnpj?: string };
    setorGhe?: { nomeSetor: string; codigoSetor?: string; codigoGhe?: string; descricaoSetor?: string };
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

  const sg = body.setorGhe ?? {};
  const s = body.solicitacao ?? {};
  const setor = await prisma.setorGhe.create({
    data: {
      empresaId,
      nomeSetor: sg.nomeSetor ?? '',
      codigoSetor: sg.codigoSetor ?? null,
      codigoGhe: sg.codigoGhe ?? null,
      descricaoSetor: sg.descricaoSetor ?? null,
      dataSolicitacao: s.dataSolicitacao ?? null,
      nomeSolicitante: s.nomeSolicitante ?? null,
      status: 'Pendente',
    },
  });

  const dataStr = s.dataSolicitacao ?? new Date().toISOString().slice(0, 10);
  await criarSolicitacao('SETOR_GHE', setor.id, empresaId, dataStr, 'Pendente');

  res.status(201).json({ sucesso: true, dados: { id: setor.id, status: setor.status } });
});

export { router as setoresGheRouter };
