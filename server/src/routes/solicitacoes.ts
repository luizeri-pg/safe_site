import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, type AuthLocals } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/solicitacoes?tipo=&status=&busca= — listagem unificada (dados só do BD)
router.get('/', async (req, res: Response): Promise<void> => {
  const auth = (res.locals as unknown as { auth: AuthLocals }).auth;
  const { tipo, status, busca } = req.query as { tipo?: string; status?: string; busca?: string };

  const where: { empresaId?: string; tipo?: string; status?: string; OR?: unknown[] } = {};
  if (auth.role === 'client' && auth.empresaId) {
    where.empresaId = auth.empresaId;
  }
  if (tipo) where.tipo = tipo;
  if (status) where.status = status;
  if (busca && busca.trim()) {
    const b = busca.trim();
    where.OR = [
      { descricao: { contains: b } },
      { referenciaId: { contains: b } },
    ];
  }

  const list = await prisma.solicitacao.findMany({
    where,
    include: { empresa: true },
    orderBy: { createdAt: 'desc' },
  });

  const dados = list.map((s) => ({
    id: s.id,
    empresa: s.empresa.nomeFantasia ?? s.empresa.razaoSocial,
    tipo: s.tipo,
    data: s.data,
    status: s.status,
    descricao: s.descricao ?? undefined,
  }));

  res.json({ sucesso: true, dados });
});

// PATCH /api/solicitacoes/:id — atualiza status e/ou descricao (dados no BD)
router.patch('/:id', async (req, res: Response): Promise<void> => {
  const auth = (res.locals as unknown as { auth: AuthLocals }).auth;
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ mensagem: 'ID inválido' });
    return;
  }
  const body = req.body as { status?: string; descricao?: string };

  const s = await prisma.solicitacao.findUnique({ where: { id } });
  if (!s) {
    res.status(404).json({ mensagem: 'Solicitação não encontrada' });
    return;
  }
  if (auth.role === 'client' && auth.empresaId && s.empresaId !== auth.empresaId) {
    res.status(403).json({ mensagem: 'Sem permissão para esta solicitação' });
    return;
  }

  const updated = await prisma.solicitacao.update({
    where: { id },
    data: {
      ...(body.status != null && { status: body.status }),
      ...(body.descricao != null && { descricao: body.descricao }),
    },
    include: { empresa: true },
  });

  res.json({
    id: updated.id,
    empresa: updated.empresa.nomeFantasia ?? updated.empresa.razaoSocial,
    tipo: updated.tipo,
    data: updated.data,
    status: updated.status,
    descricao: updated.descricao ?? undefined,
  });
});

export { router as solicitacoesRouter };
