import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { Prisma } from '@prisma/client';
import { authMiddleware, type AuthLocals } from '../middleware/auth.js';

const router: Router = Router();
router.use(authMiddleware);

// GET /api/solicitacoes?tipo=&status=&busca= — listagem unificada (dados só do BD)
router.get('/', async (req, res: Response): Promise<void> => {
  const auth = (res.locals as unknown as { auth: AuthLocals }).auth;
  const { tipo, status, busca } = req.query as { tipo?: string; status?: string; busca?: string };

  const where: Prisma.SolicitacaoWhereInput = {};
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
    empresa: s.empresa?.nomeFantasia ?? s.empresa?.razaoSocial ?? '',
    tipo: s.tipo,
    data: s.data,
    status: s.status,
    descricao: s.descricao ?? undefined,
  }));

  res.json({ sucesso: true, dados });
});

// GET /api/solicitacoes/:id/detalhe — detalhes completos (empresa, solicitante, payload) para o modal do admin
router.get('/:id/detalhe', async (req, res: Response): Promise<void> => {
  const auth = (res.locals as unknown as { auth: AuthLocals }).auth;
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ mensagem: 'ID inválido' });
    return;
  }
  const s = await prisma.solicitacao.findUnique({
    where: { id },
    include: { empresa: true },
  });
  if (!s) {
    res.status(404).json({ mensagem: 'Solicitação não encontrada' });
    return;
  }
  if (auth.role === 'client' && auth.empresaId && s.empresaId !== auth.empresaId) {
    res.status(403).json({ mensagem: 'Sem permissão para esta solicitação' });
    return;
  }

  let solicitante: { nome?: string; email?: string; telefone?: string } = {};
  let payload: unknown = undefined;

  const refId = s.referenciaId;
  const tipo = s.tipo;

  try {
    if (tipo === 'Abertura de CAT') {
      const cat = await prisma.cat.findUnique({ where: { id: refId } });
      if (cat?.payload) payload = JSON.parse(cat.payload) as object;
    } else if (tipo === 'Abertura de Chamado') {
      const chamado = await prisma.chamado.findUnique({ where: { id: refId } });
      if (chamado) {
        solicitante = {
          nome: chamado.solicitanteNome ?? undefined,
          email: chamado.solicitanteEmail ?? undefined,
          telefone: chamado.solicitanteTelefone ?? undefined,
        };
        payload = {
          titulo: chamado.titulo,
          descricao: chamado.descricao,
          prioridade: chamado.prioridade,
          categoria: chamado.categoria,
          numero: chamado.numero,
        };
      }
    } else if (tipo === 'Inclusão de Cargo') {
      const c = await prisma.cargo.findUnique({ where: { id: refId } });
      if (c) {
        solicitante = { nome: c.nomeSolicitante ?? undefined };
        payload = {
          nomeCargo: c.nomeCargo,
          cbo: c.cbo,
          setor: c.setor,
          descricaoAtividades: c.descricaoAtividades,
          grauRisco: c.grauRisco,
          dataSolicitacao: c.dataSolicitacao,
        };
      }
    } else if (tipo === 'Inclusão de Setor | GHE') {
      const sg = await prisma.setorGhe.findUnique({ where: { id: refId } });
      if (sg) {
        solicitante = { nome: sg.nomeSolicitante ?? undefined };
        payload = {
          nomeSetor: sg.nomeSetor,
          codigoSetor: sg.codigoSetor,
          codigoGhe: sg.codigoGhe,
          descricaoSetor: sg.descricaoSetor,
          dataSolicitacao: sg.dataSolicitacao,
        };
      }
    } else if (tipo === 'Inclusão de Nova Unidade') {
      const u = await prisma.unidade.findUnique({ where: { id: refId } });
      if (u) {
        solicitante = { nome: u.nomeSolicitante ?? undefined };
        payload = {
          nomeUnidade: u.nomeUnidade,
          cnpjUnidade: u.cnpjUnidade,
          enderecoUnidade: u.enderecoUnidade,
          municipio: u.municipio,
          uf: u.uf,
          telefoneUnidade: u.telefoneUnidade,
          dataSolicitacao: u.dataSolicitacao,
        };
      }
    } else if (tipo === 'Solicitação de PPP') {
      const ppp = await prisma.solicitacaoPpp.findUnique({ where: { id: refId } });
      if (ppp?.payload) payload = JSON.parse(ppp.payload) as object;
    } else if (tipo === 'Solicitação de Visita Técnica') {
      const v = await prisma.visitaTecnica.findUnique({ where: { id: refId } });
      if (v) {
        solicitante = {
          nome: v.nomeSolicitante ?? undefined,
          email: v.emailSolicitante ?? undefined,
          telefone: v.telefoneSolicitante ?? undefined,
        };
        payload = {
          objetivoVisita: v.objetivoVisita,
          dataPreferencial: v.dataPreferencial,
          enderecoVisita: v.enderecoVisita,
          municipio: v.municipio,
          uf: v.uf,
          descricaoNecessidade: v.descricaoNecessidade,
          tipoVisita: v.tipoVisita,
        };
      }
    }
  } catch {
    // payload JSON inválido ou erro ao buscar referência; seguir com o que temos
  }

  const empresa = s.empresa;
  res.json({
    sucesso: true,
    dados: {
      id: s.id,
      tipo: s.tipo,
      data: s.data,
      status: s.status,
      descricao: s.descricao ?? undefined,
      referenciaId: s.referenciaId,
      empresa: empresa
        ? {
            id: empresa.id,
            razaoSocial: empresa.razaoSocial,
            nomeFantasia: empresa.nomeFantasia ?? undefined,
            cnpj: empresa.cnpj,
            endereco: empresa.endereco ?? undefined,
            telefone: empresa.telefone ?? undefined,
          }
        : undefined,
      solicitante,
      payload,
    },
  });
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
    empresa: updated.empresa?.nomeFantasia ?? updated.empresa?.razaoSocial ?? '',
    tipo: updated.tipo,
    data: updated.data,
    status: updated.status,
    descricao: updated.descricao ?? undefined,
  });
});

export { router as solicitacoesRouter };
