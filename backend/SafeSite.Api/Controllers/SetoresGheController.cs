using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeSite.Api.Data;
using SafeSite.Api.DTOs;
using SafeSite.Api.Models;
using SafeSite.Api.Services;

namespace SafeSite.Api.Controllers;

[ApiController]
[Route("api/setores-ghe")]
[Authorize]
public class SetoresGheController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly SolicitacaoService _solicitacaoService;

    public SetoresGheController(AppDbContext db, SolicitacaoService solicitacaoService)
    {
        _db = db;
        _solicitacaoService = solicitacaoService;
    }

    [HttpGet]
    public async Task<ActionResult<object>> Listar(CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var query = _db.SetoresGhe.AsQueryable();
        if (u.Role == "client" && !string.IsNullOrEmpty(u.EmpresaId))
            query = query.Where(s => s.EmpresaId == u.EmpresaId);
        var list = await query.OrderByDescending(s => s.CreatedAt).ToListAsync(ct);
        return Ok(new { sucesso = true, dados = list });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> Obter(string id, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var s = await _db.SetoresGhe.FindAsync(new object[] { id }, ct);
        if (s == null) return NotFound(new { mensagem = "Setor/GHE não encontrado" });
        if (u.Role == "client" && u.EmpresaId != s.EmpresaId)
            return StatusCode(403, new { mensagem = "Sem permissão" });
        return Ok(new { sucesso = true, dados = s });
    }

    [HttpPost]
    public async Task<ActionResult<object>> Criar([FromBody] CriarSetorGheBody body, CancellationToken ct)
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

        var setor = new SetorGhe
        {
            Id = Guid.NewGuid().ToString(),
            EmpresaId = empresaId,
            NomeSetor = body.SetorGhe?.NomeSetor ?? "",
            CodigoSetor = body.SetorGhe?.CodigoSetor,
            CodigoGhe = body.SetorGhe?.CodigoGhe,
            DescricaoSetor = body.SetorGhe?.DescricaoSetor,
            DataSolicitacao = body.Solicitacao?.DataSolicitacao,
            NomeSolicitante = body.Solicitacao?.NomeSolicitante,
            Status = "Pendente"
        };
        _db.SetoresGhe.Add(setor);
        await _db.SaveChangesAsync(ct);
        var dataStr = body.Solicitacao?.DataSolicitacao ?? DateTime.UtcNow.ToString("yyyy-MM-dd");
        await _solicitacaoService.CriarAsync(SolicitacaoTipos.SetorGhe, setor.Id, empresaId, dataStr, "Pendente", null, ct);
        return StatusCode(201, new { sucesso = true, dados = new { id = setor.Id, status = setor.Status } });
    }
}
