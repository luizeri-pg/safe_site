import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, type AuthLocals } from '../middleware/auth.js';
import { criarSolicitacao } from '../lib/solicitacao.js';

const router = Router();
router.use(authMiddleware);

function getAuth(res: Response): AuthLocals {
  return (res.locals as unknown as { auth: AuthLocals }).auth;
}

// GET /api/unidades
router.get('/', async (_req, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const where: { empresaId?: string } = {};
  if (auth.role === 'client' && auth.empresaId) where.empresaId = auth.empresaId;

  const list = await prisma.unidade.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ sucesso: true, dados: list });
});

// GET /api/unidades/:id
router.get('/:id', async (req, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const unidade = await prisma.unidade.findUnique({ where: { id: req.params.id } });
  if (!unidade) {
    res.status(404).json({ mensagem: 'Unidade não encontrada' });
    return;
  }
  if (auth.role === 'client' && auth.empresaId && unidade.empresaId !== auth.empresaId) {
    res.status(403).json({ mensagem: 'Sem permissão' });
    return;
  }
  res.json({ sucesso: true, dados: unidade });
});

// POST /api/unidades
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const body = req.body as {
    empresa?: { cnpj?: string };
    unidade?: {
      nomeUnidade: string;
      cnpjUnidade?: string;
      enderecoUnidade?: string;
      municipio?: string;
      uf?: string;
      telefoneUnidade?: string;
    };
    solicitacao?: { dataSolicitacao?: string; nomeSolicitante?: string };
  };

  let empresaId: string | null = auth.empresaId;
  if (!empresaId && body.empresa?.cnpj) {
    const emp = await prisma.empresa.findFirst({ where: { cnpj: body.empresa!.cnpj } });
    empresaId = emp?.id ?? null;
  }
  if (!empresaId) {
    res.status(400).json({ mensagem: 'Empresa não identificada' });
    return;
  }

  type UnidadeBody = { nomeUnidade?: string; cnpjUnidade?: string; enderecoUnidade?: string; municipio?: string; uf?: string; telefoneUnidade?: string };
  const u = (body.unidade ?? {}) as UnidadeBody;
  const s = body.solicitacao ?? {};
  const unidade = await prisma.unidade.create({
    data: {
      empresaId,
      nomeUnidade: u.nomeUnidade ?? '',
      cnpjUnidade: u.cnpjUnidade ?? null,
      enderecoUnidade: u.enderecoUnidade ?? null,
      municipio: u.municipio ?? null,
      uf: u.uf ?? null,
      telefoneUnidade: u.telefoneUnidade ?? null,
      dataSolicitacao: s.dataSolicitacao ?? null,
      nomeSolicitante: s.nomeSolicitante ?? null,
      status: 'Pendente',
    },
  });

  const dataStr = s.dataSolicitacao ?? new Date().toISOString().slice(0, 10);
  await criarSolicitacao('UNIDADE', unidade.id, empresaId, dataStr, 'Pendente');

  res.status(201).json({ sucesso: true, dados: { id: unidade.id, status: unidade.status } });
});

export { router as unidadesRouter };
