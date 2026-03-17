import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, type AuthLocals } from '../middleware/auth.js';
import { criarSolicitacao } from '../lib/solicitacao.js';

const router: Router = Router();
router.use(authMiddleware);

function getAuth(res: Response): AuthLocals {
  return (res.locals as unknown as { auth: AuthLocals }).auth;
}

async function proximoNumeroChamado(ano: number): Promise<string> {
  const count = await prisma.chamado.count({
    where: {
      dataAbertura: {
        gte: new Date(ano, 0, 1),
        lt: new Date(ano + 1, 0, 1),
      },
    },
  });
  const seq = String(count + 1).padStart(3, '0');
  return `${ano}-${seq}`;
}

// GET /api/chamados — listagem (dados só do BD)
router.get('/', async (_req, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const where: { empresaId?: string } = {};
  if (auth.role === 'client' && auth.empresaId) where.empresaId = auth.empresaId;

  const list = await prisma.chamado.findMany({
    where,
    include: { empresa: true },
    orderBy: { dataAbertura: 'desc' },
  });

  const dados = list.map((c) => ({
    id: c.id,
    numero: c.numero,
    titulo: c.titulo,
    prioridade: c.prioridade,
    status: c.status,
    dataAbertura: c.dataAbertura.toISOString().slice(0, 10),
    empresa: c.empresa.nomeFantasia ?? c.empresa.razaoSocial,
  }));
  res.json({ sucesso: true, dados });
});

// GET /api/chamados/:id
router.get('/:id', async (req, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const chamado = await prisma.chamado.findUnique({
    where: { id: req.params.id },
    include: { empresa: true },
  });
  if (!chamado) {
    res.status(404).json({ mensagem: 'Chamado não encontrado' });
    return;
  }
  if (auth.role === 'client' && auth.empresaId && chamado.empresaId !== auth.empresaId) {
    res.status(403).json({ mensagem: 'Sem permissão' });
    return;
  }
  res.json({
    sucesso: true,
    dados: {
      ...chamado,
      dataAbertura: chamado.dataAbertura.toISOString().slice(0, 10),
      empresa: chamado.empresa.nomeFantasia ?? chamado.empresa.razaoSocial,
    },
  });
});

// POST /api/chamados — criar (dados do body; empresa do token ou body)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const auth = getAuth(res);
  const body = req.body as {
    empresa?: { cnpj?: string; razaoSocial?: string };
    chamado?: { titulo: string; descricao?: string; prioridade: string; categoria?: string };
    solicitante?: { nome?: string; email?: string; telefone?: string };
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

  const ano = new Date().getFullYear();
  const numero = await proximoNumeroChamado(ano);

  const chamado = await prisma.chamado.create({
    data: {
      numero,
      empresaId,
      titulo: body.chamado?.titulo ?? 'Sem título',
      descricao: body.chamado?.descricao ?? null,
      prioridade: body.chamado?.prioridade ?? 'Média',
      categoria: body.chamado?.categoria ?? null,
      solicitanteNome: body.solicitante?.nome ?? null,
      solicitanteEmail: body.solicitante?.email ?? null,
      solicitanteTelefone: body.solicitante?.telefone ?? null,
      status: 'Aberto',
    },
  });

  const dataStr = chamado.dataAbertura.toISOString().slice(0, 10);
  await criarSolicitacao('CHAMADO', chamado.id, empresaId, dataStr, 'Aberto', chamado.titulo);

  res.status(201).json({
    sucesso: true,
    dados: {
      id: chamado.id,
      numero: chamado.numero,
      titulo: chamado.titulo,
      status: chamado.status,
      dataAbertura: dataStr,
    },
  });
});

export { router as chamadosRouter };
