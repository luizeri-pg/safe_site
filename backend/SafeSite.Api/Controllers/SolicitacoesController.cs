using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeSite.Api.Data;
using SafeSite.Api.Models;
using SafeSite.Api.Services;

namespace SafeSite.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SolicitacoesController : ControllerBase
{
    private readonly AppDbContext _db;

    public SolicitacoesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<object>> Listar([FromQuery] string? tipo, [FromQuery] string? status, [FromQuery] string? busca, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var query = _db.Solicitacoes.Include(s => s.Empresa).AsQueryable();

        if (u.Role == "client" && !string.IsNullOrEmpty(u.EmpresaId))
            query = query.Where(s => s.EmpresaId == u.EmpresaId);
        if (!string.IsNullOrWhiteSpace(tipo))
            query = query.Where(s => s.Tipo == tipo);
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(s => s.Status == status);
        if (!string.IsNullOrWhiteSpace(busca))
        {
            var b = busca.Trim().ToLower();
            query = query.Where(s =>
                (s.Descricao != null && s.Descricao.ToLower().Contains(b)) ||
                (s.ReferenciaId != null && s.ReferenciaId.ToLower().Contains(b)) ||
                (s.Empresa.RazaoSocial != null && s.Empresa.RazaoSocial.ToLower().Contains(b)) ||
                (s.Empresa.NomeFantasia != null && s.Empresa.NomeFantasia.ToLower().Contains(b)) ||
                (s.Empresa.Cnpj != null && s.Empresa.Cnpj.Contains(b)));
        }

        var list = await query.OrderByDescending(s => s.CreatedAt).ToListAsync(ct);
        var dados = list.Select(s => new
        {
            id = s.Id,
            empresa = s.Empresa.NomeFantasia ?? s.Empresa.RazaoSocial,
            tipo = s.Tipo,
            data = s.Data,
            status = s.Status,
            descricao = s.Descricao
        });
        return Ok(new { sucesso = true, dados });
    }

    [HttpGet("{id:int}/detalhe")]
    public async Task<ActionResult<object>> Detalhe(int id, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var s = await _db.Solicitacoes.Include(x => x.Empresa).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (s == null)
            return NotFound(new { mensagem = "Solicitação não encontrada" });
        if (u.Role == "client" && u.EmpresaId != s.EmpresaId)
            return StatusCode(403, new { mensagem = "Sem permissão para esta solicitação" });

        var empresa = new
        {
            id = s.Empresa.Id,
            razaoSocial = s.Empresa.RazaoSocial,
            nomeFantasia = s.Empresa.NomeFantasia,
            cnpj = s.Empresa.Cnpj,
            endereco = s.Empresa.Endereco,
            telefone = s.Empresa.Telefone
        };

        string? solicitanteNome = null;
        string? solicitanteEmail = null;
        string? solicitanteTelefone = null;
        object? payload = null;

        static string? GetStr(System.Text.Json.JsonElement el, string prop) =>
            el.TryGetProperty(prop, out var v) ? v.GetString() : null;
        static string? GetStrFrom(System.Text.Json.JsonElement root, string parent, string child)
        {
            if (!root.TryGetProperty(parent, out var p)) return null;
            return GetStr(p, child);
        }

        switch (s.Tipo)
        {
            case SolicitacaoTipos.Ppp:
                var ppp = await _db.SolicitacoesPpp.FindAsync(new object[] { s.ReferenciaId }, ct);
                if (ppp != null && !string.IsNullOrEmpty(ppp.Payload))
                {
                    try
                    {
                        payload = System.Text.Json.JsonSerializer.Deserialize<object>(ppp.Payload);
                        if (payload is System.Text.Json.JsonElement je)
                        {
                            solicitanteNome = GetStrFrom(je, "solicitacao", "nomeSolicitante") ?? GetStrFrom(je, "solicitacao", "nome_solicitante");
                            if (je.TryGetProperty("solicitacao", out var solPpp))
                            {
                                var email = GetStr(solPpp, "emailSolicitante") ?? GetStr(solPpp, "email_solicitante");
                                var tel = GetStr(solPpp, "telefoneSolicitante") ?? GetStr(solPpp, "telefone_solicitante");
                                if (!string.IsNullOrEmpty(email)) solicitanteEmail = email;
                                if (!string.IsNullOrEmpty(tel)) solicitanteTelefone = tel;
                            }
                        }
                    }
                    catch { /* ignore */ }
                }
                break;
            case SolicitacaoTipos.Cat:
                var cat = await _db.Cats.FindAsync(new object[] { s.ReferenciaId }, ct);
                if (cat != null && !string.IsNullOrEmpty(cat.Payload))
                {
                    try
                    {
                        payload = System.Text.Json.JsonSerializer.Deserialize<object>(cat.Payload);
                        if (payload is System.Text.Json.JsonElement je)
                        {
                            solicitanteNome = GetStrFrom(je, "solicitacao", "nomeSolicitante") ?? GetStrFrom(je, "solicitacao", "nome_solicitante")
                                ?? GetStrFrom(je, "responsavel", "nomeResponsavel") ?? GetStrFrom(je, "responsavel", "nome_responsavel");
                            if (string.IsNullOrEmpty(solicitanteNome) && je.TryGetProperty("trabalhador", out var trab))
                            {
                                solicitanteNome = GetStr(trab, "nome");
                                solicitanteEmail ??= GetStr(trab, "email");
                                solicitanteTelefone ??= GetStr(trab, "telefone");
                            }
                        }
                    }
                    catch { /* ignore */ }
                }
                break;
            case SolicitacaoTipos.Chamado:
                var chamado = await _db.Chamados.FindAsync(new object[] { s.ReferenciaId }, ct);
                if (chamado != null)
                {
                    solicitanteNome = chamado.SolicitanteNome;
                    solicitanteEmail = chamado.SolicitanteEmail;
                    solicitanteTelefone = chamado.SolicitanteTelefone;
                }
                break;
            case SolicitacaoTipos.Visita:
                var visita = await _db.VisitasTecnicas.FindAsync(new object[] { s.ReferenciaId }, ct);
                if (visita != null)
                {
                    solicitanteNome = visita.NomeSolicitante;
                    solicitanteEmail = visita.EmailSolicitante;
                    solicitanteTelefone = visita.TelefoneSolicitante;
                }
                break;
            case SolicitacaoTipos.Cargo:
                var cargo = await _db.Cargos.FindAsync(new object[] { s.ReferenciaId }, ct);
                if (cargo != null) solicitanteNome = cargo.NomeSolicitante;
                break;
            case SolicitacaoTipos.SetorGhe:
                var setor = await _db.SetoresGhe.FindAsync(new object[] { s.ReferenciaId }, ct);
                if (setor != null) solicitanteNome = setor.NomeSolicitante;
                break;
            case SolicitacaoTipos.Unidade:
                var unidade = await _db.Unidades.FindAsync(new object[] { s.ReferenciaId }, ct);
                if (unidade != null) solicitanteNome = unidade.NomeSolicitante;
                break;
        }

        return Ok(new
        {
            sucesso = true,
            dados = new
            {
                id = s.Id,
                tipo = s.Tipo,
                data = s.Data,
                status = s.Status,
                descricao = s.Descricao,
                referenciaId = s.ReferenciaId,
                empresa,
                solicitante = new
                {
                    nome = solicitanteNome,
                    email = solicitanteEmail,
                    telefone = solicitanteTelefone
                },
                payload
            }
        });
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult<object>> Atualizar(int id, [FromBody] AtualizarSolicitacaoBody body, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var s = await _db.Solicitacoes.Include(x => x.Empresa).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (s == null)
            return NotFound(new { mensagem = "Solicitação não encontrada" });
        if (u.Role == "client" && u.EmpresaId != s.EmpresaId)
            return StatusCode(403, new { mensagem = "Sem permissão para esta solicitação" });

        if (body.Status != null)
        {
            s.Status = body.Status;
            // Propagar status para a entidade vinculada (PPP, CAT, Visita, etc.)
            await PropagarStatusParaEntidadeAsync(s.Tipo, s.ReferenciaId, body.Status, ct);
        }
        if (body.Descricao != null) s.Descricao = body.Descricao;
        await _db.SaveChangesAsync(ct);

        return Ok(new
        {
            id = s.Id,
            empresa = s.Empresa.NomeFantasia ?? s.Empresa.RazaoSocial,
            tipo = s.Tipo,
            data = s.Data,
            status = s.Status,
            descricao = s.Descricao
        });
    }

    private async Task PropagarStatusParaEntidadeAsync(string tipo, string referenciaId, string status, CancellationToken ct)
    {
        switch (tipo)
        {
            case SolicitacaoTipos.Ppp:
                var ppp = await _db.SolicitacoesPpp.FindAsync(new object[] { referenciaId }, ct);
                if (ppp != null) { ppp.Status = status; }
                break;
            case SolicitacaoTipos.Cat:
                var cat = await _db.Cats.FindAsync(new object[] { referenciaId }, ct);
                if (cat != null) { cat.Status = status; }
                break;
            case SolicitacaoTipos.Visita:
                var visita = await _db.VisitasTecnicas.FindAsync(new object[] { referenciaId }, ct);
                if (visita != null) { visita.Status = status; }
                break;
            case SolicitacaoTipos.Cargo:
                var cargo = await _db.Cargos.FindAsync(new object[] { referenciaId }, ct);
                if (cargo != null) { cargo.Status = status; }
                break;
            case SolicitacaoTipos.SetorGhe:
                var setor = await _db.SetoresGhe.FindAsync(new object[] { referenciaId }, ct);
                if (setor != null) { setor.Status = status; }
                break;
            case SolicitacaoTipos.Unidade:
                var unidade = await _db.Unidades.FindAsync(new object[] { referenciaId }, ct);
                if (unidade != null) { unidade.Status = status; }
                break;
            case SolicitacaoTipos.Chamado:
                var chamado = await _db.Chamados.FindAsync(new object[] { referenciaId }, ct);
                if (chamado != null) { chamado.Status = status; }
                break;
        }
    }
}

public class AtualizarSolicitacaoBody
{
    public string? Status { get; set; }
    public string? Descricao { get; set; }
}
