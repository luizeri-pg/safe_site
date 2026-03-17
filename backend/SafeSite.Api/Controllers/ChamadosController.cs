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
public class ChamadosController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly SolicitacaoService _solicitacaoService;

    public ChamadosController(AppDbContext db, SolicitacaoService solicitacaoService)
    {
        _db = db;
        _solicitacaoService = solicitacaoService;
    }

    [HttpGet]
    public async Task<ActionResult<object>> Listar(CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var query = _db.Chamados.Include(c => c.Empresa).AsQueryable();
        if (u.Role == "client" && !string.IsNullOrEmpty(u.EmpresaId))
            query = query.Where(c => c.EmpresaId == u.EmpresaId);
        var list = await query.OrderByDescending(c => c.DataAbertura).ToListAsync(ct);
        var dados = list.Select(c => new
        {
            id = c.Id,
            numero = c.Numero,
            titulo = c.Titulo,
            prioridade = c.Prioridade,
            status = c.Status,
            dataAbertura = c.DataAbertura.ToString("yyyy-MM-dd"),
            empresa = c.Empresa.NomeFantasia ?? c.Empresa.RazaoSocial
        });
        return Ok(new { sucesso = true, dados });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> Obter(string id, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        var c = await _db.Chamados.Include(x => x.Empresa).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (c == null) return NotFound(new { mensagem = "Chamado não encontrado" });
        if (u.Role == "client" && u.EmpresaId != c.EmpresaId)
            return StatusCode(403, new { mensagem = "Sem permissão" });
        return Ok(new { sucesso = true, dados = new { c.Id, c.Numero, c.Titulo, c.Descricao, c.Prioridade, c.Categoria, c.Status, dataAbertura = c.DataAbertura.ToString("yyyy-MM-dd"), empresa = c.Empresa.NomeFantasia ?? c.Empresa.RazaoSocial } });
    }

    [HttpPost]
    public async Task<ActionResult<object>> Criar([FromBody] CriarChamadoBody body, CancellationToken ct)
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

        var ano = DateTime.UtcNow.Year;
        var count = await _db.Chamados.CountAsync(c => c.DataAbertura >= new DateTime(ano, 1, 1) && c.DataAbertura < new DateTime(ano + 1, 1, 1), ct);
        var numero = $"{ano}-{(count + 1):D3}";

        var chamado = new Chamado
        {
            Id = Guid.NewGuid().ToString(),
            Numero = numero,
            EmpresaId = empresaId,
            Titulo = body.Chamado?.Titulo ?? "Sem título",
            Descricao = body.Chamado?.Descricao,
            Prioridade = body.Chamado?.Prioridade ?? "Média",
            Categoria = body.Chamado?.Categoria,
            SolicitanteNome = body.Solicitante?.Nome,
            SolicitanteEmail = body.Solicitante?.Email,
            SolicitanteTelefone = body.Solicitante?.Telefone,
            Status = "Aberto"
        };
        _db.Chamados.Add(chamado);
        await _db.SaveChangesAsync(ct);
        var dataStr = chamado.DataAbertura.ToString("yyyy-MM-dd");
        await _solicitacaoService.CriarAsync(SolicitacaoTipos.Chamado, chamado.Id, empresaId, dataStr, "Aberto", chamado.Titulo, ct);
        return StatusCode(201, new { sucesso = true, dados = new { id = chamado.Id, numero = chamado.Numero, titulo = chamado.Titulo, status = chamado.Status, dataAbertura = dataStr } });
    }
}
