import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, type AuthLocals } from '../middleware/auth.js';

const router: Router = Router();
router.use(authMiddleware);

function getAuth(res: Response): AuthLocals {
  return (res.locals as unknown as { auth: AuthLocals }).auth;
}

function requireAdmin(res: Response): boolean {
  if (getAuth(res).role !== 'admin') {
    res.status(403).json({ mensagem: 'Acesso restrito a administradores' });
    return false;
  }
  return true;
}

// GET /api/empresas
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(res)) return;
  const list = await prisma.empresa.findMany({ orderBy: { razaoSocial: 'asc' } });
  const dados = list.map((e) => ({
    id: e.id,
    razao_social: e.razaoSocial,
    nome_fantasia: e.nomeFantasia ?? undefined,
    cnpj: e.cnpj,
    endereco: e.endereco ?? undefined,
    telefone: e.telefone ?? undefined,
  }));
  res.json({ sucesso: true, dados });
});

// POST /api/empresas
router.post('/', async (req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(res)) return;
  const body = req.body as {
    razaoSocial?: string;
    nomeFantasia?: string;
    cnpj?: string;
    endereco?: string;
    telefone?: string;
  };
  if (!body.razaoSocial || !body.cnpj) {
    res.status(400).json({ mensagem: 'razaoSocial e cnpj são obrigatórios' });
    return;
  }
  const existente = await prisma.empresa.findUnique({ where: { cnpj: body.cnpj } });
  if (existente) {
    res.status(409).json({ mensagem: 'Já existe empresa com este CNPJ' });
    return;
  }
  const empresa = await prisma.empresa.create({
    data: {
      razaoSocial: body.razaoSocial,
      nomeFantasia: body.nomeFantasia ?? null,
      cnpj: body.cnpj,
      endereco: body.endereco ?? null,
      telefone: body.telefone ?? null,
    },
  });
  res.status(201).json({
    sucesso: true,
    dados: {
      id: empresa.id,
      razao_social: empresa.razaoSocial,
      nome_fantasia: empresa.nomeFantasia ?? undefined,
      cnpj: empresa.cnpj,
      endereco: empresa.endereco ?? undefined,
      telefone: empresa.telefone ?? undefined,
    },
  });
});

// PATCH /api/empresas/:id
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(res)) return;
  const id = String(req.params.id);
  const body = req.body as { nome_fantasia?: string | string[]; endereco?: string | string[]; telefone?: string | string[] };
  const nomeFantasia = body.nome_fantasia == null ? undefined : String(body.nome_fantasia);
  const endereco = body.endereco == null ? undefined : String(body.endereco);
  const telefone = body.telefone == null ? undefined : String(body.telefone);
  const empresa = await prisma.empresa.findUnique({ where: { id } });
  if (!empresa) {
    res.status(404).json({ mensagem: 'Empresa não encontrada' });
    return;
  }
  const updated = await prisma.empresa.update({
    where: { id },
    data: {
      ...(nomeFantasia !== undefined && { nomeFantasia: nomeFantasia || null }),
      ...(endereco !== undefined && { endereco: endereco || null }),
      ...(telefone !== undefined && { telefone: telefone || null }),
    },
  });
  res.json({
    sucesso: true,
    dados: {
      id: updated.id,
      razao_social: updated.razaoSocial,
      nome_fantasia: updated.nomeFantasia ?? undefined,
      cnpj: updated.cnpj,
      endereco: updated.endereco ?? undefined,
      telefone: updated.telefone ?? undefined,
    },
  });
});

export { router as empresasRouter };
