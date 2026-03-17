using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeSite.Api.Data;
using SafeSite.Api.DTOs;
using SafeSite.Api.Models;
using SafeSite.Api.Services;

namespace SafeSite.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CargosController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly SolicitacaoService _solicitacaoService;

    public CargosController(AppDbContext db, SolicitacaoService solicitacaoService)
    {
        _db = db;
        _solicitacaoService = solicitacaoService;
    }

    [HttpGet]
    public async Task<ActionResult<object>> Listar(CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var query = _db.Cargos.AsQueryable();
        if (u.Role == "client" && !string.IsNullOrEmpty(u.EmpresaId))
            query = query.Where(c => c.EmpresaId == u.EmpresaId);
        var list = await query.OrderByDescending(c => c.CreatedAt).ToListAsync(ct);
        return Ok(new { sucesso = true, dados = list });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> Obter(string id, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var c = await _db.Cargos.FindAsync(new object[] { id }, ct);
        if (c == null) return NotFound(new { mensagem = "Cargo não encontrado" });
        if (u.Role == "client" && u.EmpresaId != c.EmpresaId)
            return StatusCode(403, new { mensagem = "Sem permissão" });
        return Ok(new { sucesso = true, dados = c });
    }

    [HttpPost]
    public async Task<ActionResult<object>> Criar([FromBody] CriarCargoBody body, CancellationToken ct)
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

        var cargo = new Cargo
        {
            Id = Guid.NewGuid().ToString(),
            EmpresaId = empresaId,
            NomeCargo = body.Cargo?.NomeCargo ?? "",
            Cbo = body.Cargo?.Cbo,
            Setor = body.Cargo?.Setor,
            DescricaoAtividades = body.Cargo?.DescricaoAtividades,
            GrauRisco = body.Cargo?.GrauRisco,
            DataSolicitacao = body.Solicitacao?.DataSolicitacao,
            NomeSolicitante = body.Solicitacao?.NomeSolicitante,
            Status = "Pendente"
        };
        _db.Cargos.Add(cargo);
        await _db.SaveChangesAsync(ct);
        var dataStr = body.Solicitacao?.DataSolicitacao ?? DateTime.UtcNow.ToString("yyyy-MM-dd");
        await _solicitacaoService.CriarAsync(SolicitacaoTipos.Cargo, cargo.Id, empresaId, dataStr, "Pendente", null, ct);
        return StatusCode(201, new { sucesso = true, dados = new { id = cargo.Id, status = cargo.Status } });
    }
}
