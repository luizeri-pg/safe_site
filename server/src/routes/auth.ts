import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '30m';

interface LoginBody {
  username?: string;
  password?: string;
}

router.post('/login', async (req: Request<object, object, LoginBody>, res: Response): Promise<void> => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    res.status(400).json({
      sucesso: false,
      mensagem: 'Usuário e senha são obrigatórios',
      tempoProcessamento: 0,
      requisicaoId: '',
      resultado: null,
    });
    return;
  }

  const start = Date.now();
  const email = username.trim().toLowerCase();

  const user = await prisma.usuario.findUnique({
    where: { email },
    include: { empresa: true },
  });

  if (!user) {
    res.status(401).json({
      sucesso: false,
      mensagem: 'Credenciais inválidas',
      tempoProcessamento: Date.now() - start,
      requisicaoId: crypto.randomUUID(),
      resultado: null,
    });
    return;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({
      sucesso: false,
      mensagem: 'Credenciais inválidas',
      tempoProcessamento: Date.now() - start,
      requisicaoId: crypto.randomUUID(),
      resultado: null,
    });
    return;
  }

  const expiresInSeconds = 30 * 60; // 30 min
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      empresaId: user.empresaId,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    sucesso: true,
    mensagem: null,
    tempoProcessamento: Date.now() - start,
    requisicaoId: crypto.randomUUID(),
    resultado: {
      access_token: token,
      token_type: 'Bearer',
      expires_in: expiresInSeconds,
      role: user.role as 'client' | 'admin',
      empresa_id: user.empresaId ?? undefined,
      empresa_nome: user.empresa?.nomeFantasia ?? user.empresa?.razaoSocial ?? undefined,
      empresa_razao_social: user.empresa?.razaoSocial ?? undefined,
      empresa_cnpj: user.empresa?.cnpj ?? undefined,
    },
  });
});

export { router as authRouter };
