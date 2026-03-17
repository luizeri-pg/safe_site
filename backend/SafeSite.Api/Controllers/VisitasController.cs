using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeSite.Api.Data;
using SafeSite.Api.DTOs;
using SafeSite.Api.Models;
using SafeSite.Api.Services;

namespace SafeSite.Api.Controllers;

[ApiController]
[Route("api/visitas")]
[Authorize]
public class VisitasController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly SolicitacaoService _solicitacaoService;

    public VisitasController(AppDbContext db, SolicitacaoService solicitacaoService)
    {
        _db = db;
        _solicitacaoService = solicitacaoService;
    }

    [HttpGet]
    public async Task<ActionResult<object>> Listar(CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var query = _db.VisitasTecnicas.AsQueryable();
        if (u.Role == "client" && !string.IsNullOrEmpty(u.EmpresaId))
            query = query.Where(v => v.EmpresaId == u.EmpresaId);
        var list = await query.OrderByDescending(v => v.CreatedAt).ToListAsync(ct);
        return Ok(new { sucesso = true, dados = list });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> Obter(string id, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var v = await _db.VisitasTecnicas.FindAsync(new object[] { id }, ct);
        if (v == null) return NotFound(new { mensagem = "Solicitação de visita não encontrada" });
        if (u.Role == "client" && u.EmpresaId != v.EmpresaId)
            return StatusCode(403, new { mensagem = "Sem permissão" });
        return Ok(new { sucesso = true, dados = v });
    }

    [HttpPost]
    public async Task<ActionResult<object>> Criar([FromBody] CriarVisitaBody body, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        string empresaId = u.EmpresaId ?? "";
        if (string.IsNullOrEmpty(empresaId) && body.Empresa?.Cnpj != null)
        {
            var emp = await _db.Empresas.FirstOrDefaultAsync(e => e.Cnpj == body.Empresa.Cnpj, ct);
            empresaId = emp?.Id ?? "";
        }
        if (string.IsNullOrEmpty(empresaId))
            return BadRequest(new { mensagem = "Empresa não identificada" });

        var vis = body.Visita;
        var sol = body.Solicitacao;
        var visita = new VisitaTecnica
        {
            Id = Guid.NewGuid().ToString(),
            EmpresaId = empresaId,
            ObjetivoVisita = vis?.ObjetivoVisita,
            DataPreferencial = vis?.DataPreferencial,
            EnderecoVisita = vis?.EnderecoVisita,
            Municipio = vis?.Municipio,
            Uf = vis?.Uf,
            DescricaoNecessidade = vis?.DescricaoNecessidade,
            TipoVisita = vis?.TipoVisita,
            DataSolicitacao = sol?.DataSolicitacao,
            NomeSolicitante = sol?.NomeSolicitante,
            EmailSolicitante = sol?.EmailSolicitante,
            TelefoneSolicitante = sol?.TelefoneSolicitante,
            Status = "Pendente"
        };
        _db.VisitasTecnicas.Add(visita);
        await _db.SaveChangesAsync(ct);
        var dataStr = sol?.DataSolicitacao ?? DateTime.UtcNow.ToString("yyyy-MM-dd");
        await _solicitacaoService.CriarAsync(SolicitacaoTipos.Visita, visita.Id, empresaId, dataStr, "Pendente", null, ct);
        return StatusCode(201, new { sucesso = true, dados = new { id = visita.Id, status = visita.Status } });
    }
}
