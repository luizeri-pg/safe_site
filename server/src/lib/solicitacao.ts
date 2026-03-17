import { prisma } from './prisma.js';

const TIPOS = {
  CAT: 'Abertura de CAT',
  CHAMADO: 'Abertura de Chamado',
  CARGO: 'Inclusão de Cargo',
  SETOR_GHE: 'Inclusão de Setor | GHE',
  UNIDADE: 'Inclusão de Nova Unidade',
  PPP: 'Solicitação de PPP',
  VISITA: 'Solicitação de Visita Técnica',
} as const;

export async function criarSolicitacao(
  tipo: keyof typeof TIPOS,
  referenciaId: string,
  empresaId: string,
  data: string,
  status = 'Pendente',
  descricao?: string | null
): Promise<void> {
  await prisma.solicitacao.create({
    data: {
      tipo: TIPOS[tipo],
      referenciaId,
      empresaId,
      data,
      status,
      descricao: descricao ?? null,
    },
  });
}

export async function atualizarStatusSolicitacao(
  tipo: keyof typeof TIPOS,
  referenciaId: string,
  status: string
): Promise<void> {
  await prisma.solicitacao.updateMany({
    where: { referenciaId, tipo: TIPOS[tipo] },
    data: { status },
  });
}
