import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, type AuthLocals } from '../middleware/auth.js';
import { criarSolicitacao } from '../lib/solicitacao.js';

const router = Router();
router.use(authMiddleware);

function getAuth(res: Response): AuthLocals {
  return (res.locals as unknown as { auth: AuthLocals }).auth;
}

// GET /api/visitas
router.get('/', async (_req, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const where: { empresaId?: string } = {};
  if (auth.role === 'client' && auth.empresaId) where.empresaId = auth.empresaId;

  const list = await prisma.visitaTecnica.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ sucesso: true, dados: list });
});

// GET /api/visitas/:id
router.get('/:id', async (req, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const visita = await prisma.visitaTecnica.findUnique({ where: { id: req.params.id } });
  if (!visita) {
    res.status(404).json({ mensagem: 'Solicitação de visita não encontrada' });
    return;
  }
  if (auth.role === 'client' && auth.empresaId && visita.empresaId !== auth.empresaId) {
    res.status(403).json({ mensagem: 'Sem permissão' });
    return;
  }
  res.json({ sucesso: true, dados: visita });
});

// POST /api/visitas
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const body = req.body as {
    empresa?: { cnpj?: string };
    visita?: {
      objetivoVisita?: string;
      dataPreferencial?: string;
      enderecoVisita?: string;
      municipio?: string;
      uf?: string;
      descricaoNecessidade?: string;
      tipoVisita?: string;
    };
    solicitacao?: { dataSolicitacao?: string; nomeSolicitante?: string; emailSolicitante?: string; telefoneSolicitante?: string };
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

  const v = body.visita ?? {};
  const s = body.solicitacao ?? {};
  const visita = await prisma.visitaTecnica.create({
    data: {
      empresaId,
      objetivoVisita: v.objetivoVisita ?? null,
      dataPreferencial: v.dataPreferencial ?? null,
      enderecoVisita: v.enderecoVisita ?? null,
      municipio: v.municipio ?? null,
      uf: v.uf ?? null,
      descricaoNecessidade: v.descricaoNecessidade ?? null,
      tipoVisita: v.tipoVisita ?? null,
      dataSolicitacao: s.dataSolicitacao ?? null,
      nomeSolicitante: s.nomeSolicitante ?? null,
      emailSolicitante: s.emailSolicitante ?? null,
      telefoneSolicitante: s.telefoneSolicitante ?? null,
      status: 'Pendente',
    },
  });

  const dataStr = s.dataSolicitacao ?? new Date().toISOString().slice(0, 10);
  await criarSolicitacao('VISITA', visita.id, empresaId, dataStr, 'Pendente');

  res.status(201).json({ sucesso: true, dados: { id: visita.id, status: visita.status } });
});

export { router as visitasRouter };
