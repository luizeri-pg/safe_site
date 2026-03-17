import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';

export interface JwtPayload {
  sub: string;      // usuario id
  email: string;
  role: 'client' | 'admin';
  empresaId: string | null;
}

export interface AuthLocals {
  userId: string;
  email: string;
  role: 'client' | 'admin';
  empresaId: string | null;
  empresaRazaoSocial: string | null;
  empresaCnpj: string | null;
  empresaNome: string | null;
}

export async function authMiddleware(
  req: Request,
  res: Response<{ mensagem?: string }, Record<string, unknown>, unknown>,
  next: NextFunction
): Promise<void> {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ mensagem: 'Token ausente ou inválido' });
    return;
  }
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.sub },
      include: { empresa: true },
    });
    if (!user) {
      res.status(401).json({ mensagem: 'Usuário não encontrado' });
      return;
    }
    (res.locals as unknown as { auth: AuthLocals }).auth = {
      userId: user.id,
      email: user.email,
      role: user.role as 'client' | 'admin',
      empresaId: user.empresaId,
      empresaRazaoSocial: user.empresa?.razaoSocial ?? null,
      empresaCnpj: user.empresa?.cnpj ?? null,
      empresaNome: user.empresa?.nomeFantasia ?? user.empresa?.razaoSocial ?? null,
    };
    next();
  } catch {
    res.status(401).json({ mensagem: 'Token inválido ou expirado' });
  }
}

/** Opcional: só exige auth se token for enviado; útil para rotas que podem ser públicas */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    next();
    return;
  }
  return authMiddleware(req, res, next);
}
