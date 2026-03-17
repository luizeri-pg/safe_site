using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeSite.Api.Data;
using SafeSite.Api.DTOs;
using SafeSite.Api.Services;

namespace SafeSite.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CatsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly SolicitacaoService _solicitacaoService;

    public CatsController(AppDbContext db, SolicitacaoService solicitacaoService)
    {
        _db = db;
        _solicitacaoService = solicitacaoService;
    }

    [HttpGet]
    public async Task<ActionResult<object>> Listar(CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var query = _db.Cats.AsQueryable();
        if (u.Role == "client" && !string.IsNullOrEmpty(u.EmpresaId))
            query = query.Where(c => c.EmpresaId == u.EmpresaId);
        var list = await query.OrderByDescending(c => c.CreatedAt).ToListAsync(ct);
        var dados = list.Select(c => new
        {
            id = c.Id,
            empresaId = c.EmpresaId,
            status = c.Status,
            createdAt = c.CreatedAt,
            payload = string.IsNullOrEmpty(c.Payload) ? null : System.Text.Json.JsonSerializer.Deserialize<object>(c.Payload)
        });
        return Ok(new { sucesso = true, dados });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> Obter(string id, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var cat = await _db.Cats.FindAsync(new object[] { id }, ct);
        if (cat == null) return NotFound(new { mensagem = "CAT não encontrada" });
        if (u.Role == "client" && u.EmpresaId != cat.EmpresaId)
            return StatusCode(403, new { mensagem = "Sem permissão" });
        return Ok(new
        {
            sucesso = true,
            dados = new
            {
                id = cat.Id,
                empresaId = cat.EmpresaId,
                status = cat.Status,
                createdAt = cat.CreatedAt,
                payload = string.IsNullOrEmpty(cat.Payload) ? null : System.Text.Json.JsonSerializer.Deserialize<object>(cat.Payload)
            }
        });
    }

    [HttpPost]
    public async Task<ActionResult<object>> Criar([FromBody] CriarCatBody body, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        string empresaId;
        if (u.Role == "client")
        {
            if (string.IsNullOrEmpty(u.EmpresaId))
                return BadRequest(new { mensagem = "Empresa não identificada" });
            empresaId = u.EmpresaId;
        }
        else
        {
            var payload = body.Payload as System.Text.Json.JsonElement?;
            string? cnpj = null;
            if (payload.HasValue && payload.Value.ValueKind == System.Text.Json.JsonValueKind.Object)
            {
                if (payload.Value.TryGetProperty("empregador", out var emp) && emp.TryGetProperty("cnpj", out var c))
                    cnpj = c.GetString();
            }
            if (!string.IsNullOrEmpty(cnpj))
            {
                var emp = await _db.Empresas.FirstOrDefaultAsync(e => e.Cnpj == cnpj, ct);
                empresaId = emp?.Id ?? "";
            }
            else
                empresaId = "";
            if (string.IsNullOrEmpty(empresaId))
                return BadRequest(new { mensagem = "Empresa não encontrada no cadastro" });
        }

        var payloadStr = body.Payload == null ? "{}" : System.Text.Json.JsonSerializer.Serialize(body.Payload);
        var cat = new Models.Cat
        {
            Id = Guid.NewGuid().ToString(),
            EmpresaId = empresaId,
            Payload = payloadStr,
            Status = "Pendente"
        };
        _db.Cats.Add(cat);
        await _db.SaveChangesAsync(ct);
        var dataStr = DateTime.UtcNow.ToString("yyyy-MM-dd");
        await _solicitacaoService.CriarAsync(SolicitacaoTipos.Cat, cat.Id, empresaId, dataStr, "Pendente", null, ct);
        return StatusCode(201, new { sucesso = true, dados = new { id = cat.Id, empresaId = cat.EmpresaId, status = cat.Status, createdAt = cat.CreatedAt } });
    }
}
