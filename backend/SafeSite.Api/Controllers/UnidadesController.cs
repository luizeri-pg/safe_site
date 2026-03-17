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
public class UnidadesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly SolicitacaoService _solicitacaoService;

    public UnidadesController(AppDbContext db, SolicitacaoService solicitacaoService)
    {
        _db = db;
        _solicitacaoService = solicitacaoService;
    }

    [HttpGet]
    public async Task<ActionResult<object>> Listar(CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var query = _db.Unidades.AsQueryable();
        if (u.Role == "client" && !string.IsNullOrEmpty(u.EmpresaId))
            query = query.Where(x => x.EmpresaId == u.EmpresaId);
        var list = await query.OrderByDescending(x => x.CreatedAt).ToListAsync(ct);
        return Ok(new { sucesso = true, dados = list });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> Obter(string id, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var x = await _db.Unidades.FindAsync(new object[] { id }, ct);
        if (x == null) return NotFound(new { mensagem = "Unidade não encontrada" });
        if (u.Role == "client" && u.EmpresaId != x.EmpresaId)
            return StatusCode(403, new { mensagem = "Sem permissão" });
        return Ok(new { sucesso = true, dados = x });
    }

    [HttpPost]
    public async Task<ActionResult<object>> Criar([FromBody] CriarUnidadeBody body, CancellationToken ct)
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

        var un = body.Unidade;
        var unidade = new Unidade
        {
            Id = Guid.NewGuid().ToString(),
            EmpresaId = empresaId,
            NomeUnidade = un?.NomeUnidade ?? "",
            CnpjUnidade = un?.CnpjUnidade,
            EnderecoUnidade = un?.EnderecoUnidade,
            Municipio = un?.Municipio,
            Uf = un?.Uf,
            TelefoneUnidade = un?.TelefoneUnidade,
            DataSolicitacao = body.Solicitacao?.DataSolicitacao,
            NomeSolicitante = body.Solicitacao?.NomeSolicitante,
            Status = "Pendente"
        };
        _db.Unidades.Add(unidade);
        await _db.SaveChangesAsync(ct);
        var dataStr = body.Solicitacao?.DataSolicitacao ?? DateTime.UtcNow.ToString("yyyy-MM-dd");
        await _solicitacaoService.CriarAsync(SolicitacaoTipos.Unidade, unidade.Id, empresaId, dataStr, "Pendente", null, ct);
        return StatusCode(201, new { sucesso = true, dados = new { id = unidade.Id, status = unidade.Status } });
    }
}
