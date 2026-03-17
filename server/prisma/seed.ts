import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);

  const empresa = await prisma.empresa.upsert({
    where: { cnpj: '00000000000191' },
    update: {},
    create: {
      razaoSocial: 'Empresa Alpha Ltda',
      nomeFantasia: 'Empresa Alpha',
      cnpj: '00000000000191',
      endereco: 'Rua Exemplo, 100',
      telefone: '(11) 3000-0000',
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'admin@safesite.com' },
    update: {},
    create: {
      email: 'admin@safesite.com',
      passwordHash: hash,
      role: 'admin',
      empresaId: null,
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'cliente@empresaalpha.com' },
    update: {},
    create: {
      email: 'cliente@empresaalpha.com',
      passwordHash: hash,
      role: 'client',
      empresaId: empresa.id,
    },
  });

  console.log('Seed concluído. Usuários: admin@safesite.com (admin), cliente@empresaalpha.com (client). Senha: admin123');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
