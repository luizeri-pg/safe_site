import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
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

// GET /api/usuarios
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(res)) return;
  const list = await prisma.usuario.findMany({
    include: { empresa: true },
    orderBy: { email: 'asc' },
  });
  const dados = list.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    empresa_id: u.empresaId ?? undefined,
    empresa_nome: u.empresa?.nomeFantasia ?? u.empresa?.razaoSocial ?? undefined,
  }));
  res.json({ sucesso: true, dados });
});

// POST /api/usuarios
router.post('/', async (req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(res)) return;
  const body = req.body as { email?: string | string[]; senha?: string | string[]; role?: string | string[]; empresaId?: string | string[] };
  const email = body.email == null ? '' : String(body.email);
  const senha = body.senha == null ? '' : String(body.senha);
  const role = body.role == null ? '' : String(body.role);
  const empresaId = body.empresaId == null ? undefined : String(body.empresaId) || undefined;
  if (!email || !senha || !role) {
    res.status(400).json({ mensagem: 'email, senha e role são obrigatórios' });
    return;
  }
  const existente = await prisma.usuario.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existente) {
    res.status(409).json({ mensagem: 'Já existe usuário com este e-mail' });
    return;
  }
  const passwordHash = await bcrypt.hash(senha, 10);
  const usuario = await prisma.usuario.create({
    data: {
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
      empresaId: empresaId || null,
    },
    include: { empresa: true },
  });
  res.status(201).json({
    sucesso: true,
    dados: {
      id: usuario.id,
      email: usuario.email,
      role: usuario.role,
      empresa_id: usuario.empresaId ?? undefined,
      empresa_nome: usuario.empresa?.nomeFantasia ?? usuario.empresa?.razaoSocial ?? undefined,
    },
  });
});

// PATCH /api/usuarios/:id
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(res)) return;
  const id = String(req.params.id);
  const body = req.body as { email?: string | string[]; senha?: string | string[]; role?: string | string[]; empresaId?: string | string[] };
  const usuario = await prisma.usuario.findUnique({ where: { id }, include: { empresa: true } });
  if (!usuario) {
    res.status(404).json({ mensagem: 'Usuário não encontrado' });
    return;
  }
  const data: { email?: string; passwordHash?: string; role?: string; empresaId?: string | null } = {};
  if (body.email !== undefined) data.email = String(body.email).trim().toLowerCase();
  if (body.role !== undefined) data.role = String(body.role);
  if (body.empresaId !== undefined) data.empresaId = String(body.empresaId) || null;
  if (body.senha !== undefined && String(body.senha)) {
    data.passwordHash = await bcrypt.hash(String(body.senha), 10);
  }
  const updated = await prisma.usuario.update({
    where: { id },
    data,
    include: { empresa: true },
  });
  const withEmpresa = updated as typeof updated & { empresa?: { nomeFantasia: string | null; razaoSocial: string } | null };
  res.json({
    sucesso: true,
    dados: {
      id: updated.id,
      email: updated.email,
      role: updated.role,
      empresa_id: updated.empresaId ?? undefined,
      empresa_nome: withEmpresa.empresa?.nomeFantasia ?? withEmpresa.empresa?.razaoSocial ?? undefined,
    },
  });
});

export { router as usuariosRouter };
