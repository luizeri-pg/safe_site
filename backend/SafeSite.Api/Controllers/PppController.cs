using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeSite.Api.Data;
using SafeSite.Api.Models;
using SafeSite.Api.DTOs;
using SafeSite.Api.Services;

namespace SafeSite.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PppController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly SolicitacaoService _solicitacaoService;

    public PppController(AppDbContext db, SolicitacaoService solicitacaoService)
    {
        _db = db;
        _solicitacaoService = solicitacaoService;
    }

    [HttpGet]
    public async Task<ActionResult<object>> Listar(CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var query = _db.SolicitacoesPpp.AsQueryable();
        if (u.Role == "client" && !string.IsNullOrEmpty(u.EmpresaId))
            query = query.Where(p => p.EmpresaId == u.EmpresaId);
        var list = await query.OrderByDescending(p => p.CreatedAt).ToListAsync(ct);
        var dados = list.Select(p => new
        {
            id = p.Id,
            empresaId = p.EmpresaId,
            status = p.Status,
            createdAt = p.CreatedAt,
            payload = string.IsNullOrEmpty(p.Payload) ? null : System.Text.Json.JsonSerializer.Deserialize<object>(p.Payload)
        });
        return Ok(new { sucesso = true, dados });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> Obter(string id, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var p = await _db.SolicitacoesPpp.FindAsync(new object[] { id }, ct);
        if (p == null) return NotFound(new { mensagem = "Solicitação PPP não encontrada" });
        if (u.Role == "client" && u.EmpresaId != p.EmpresaId)
            return StatusCode(403, new { mensagem = "Sem permissão" });
        return Ok(new
        {
            sucesso = true,
            dados = new
            {
                id = p.Id,
                empresaId = p.EmpresaId,
                status = p.Status,
                createdAt = p.CreatedAt,
                payload = string.IsNullOrEmpty(p.Payload) ? null : System.Text.Json.JsonSerializer.Deserialize<object>(p.Payload)
            }
        });
    }

    [HttpPost]
    public async Task<ActionResult<object>> Criar([FromBody] CriarPppBody body, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        string empresaId = u.EmpresaId ?? "";
        object? payload = body.Payload ?? body;
        if (payload is System.Text.Json.JsonElement je)
        {
            if (je.TryGetProperty("empresa", out var emp) && emp.TryGetProperty("cnpj", out var c))
            {
                var cnpj = c.GetString();
                if (!string.IsNullOrEmpty(cnpj))
                {
                    var empEntity = await _db.Empresas.FirstOrDefaultAsync(e => e.Cnpj == cnpj, ct);
                    if (empEntity != null) empresaId = empEntity.Id;
                }
            }
        }
        if (string.IsNullOrEmpty(empresaId))
            return BadRequest(new { mensagem = "Empresa não identificada" });

        var payloadStr = payload == null ? "{}" : System.Text.Json.JsonSerializer.Serialize(payload);
        var ppp = new SolicitacaoPpp
        {
            Id = Guid.NewGuid().ToString(),
            EmpresaId = empresaId,
            Payload = payloadStr,
            Status = "Pendente"
        };
        _db.SolicitacoesPpp.Add(ppp);
        await _db.SaveChangesAsync(ct);
        var dataStr = DateTime.UtcNow.ToString("yyyy-MM-dd");
        await _solicitacaoService.CriarAsync(SolicitacaoTipos.Ppp, ppp.Id, empresaId, dataStr, "Pendente", null, ct);
        return StatusCode(201, new { sucesso = true, dados = new { id = ppp.Id, status = ppp.Status } });
    }
}
