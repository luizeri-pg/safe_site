using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeSite.Api.Data;
using SafeSite.Api.Services;

namespace SafeSite.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db) => _db = db;

    [HttpGet("dashboard")]
    public async Task<ActionResult<object>> Dashboard([FromQuery] int diasPendenteAlerta = 7, CancellationToken ct = default)
    {
        var u = User.GetCurrentUser();
        if (u.Role != "admin")
            return StatusCode(403, new { mensagem = "Acesso restrito a administradores" });

        var query = _db.Solicitacoes.Include(s => s.Empresa).AsQueryable();
        var todas = await query.ToListAsync(ct);

        var total = todas.Count;
        var porStatus = todas
            .GroupBy(s => s.Status)
            .ToDictionary(g => g.Key, g => g.Count());
        var pendentes = porStatus.GetValueOrDefault("Pendente", 0);
        var emAnalise = porStatus.GetValueOrDefault("Em análise", 0);
        var concluidas = porStatus.GetValueOrDefault("Concluído", 0);

        var porTipo = todas
            .GroupBy(s => s.Tipo)
            .Select(g => new { tipo = g.Key, quantidade = g.Count() })
            .OrderByDescending(x => x.quantidade)
            .ToList();

        var dataLimite = DateTime.UtcNow.Date.AddDays(-diasPendenteAlerta);
        var pendentesHaMaisDias = todas
            .Where(s => s.Status == "Pendente" && DateTime.TryParse(s.Data, out var d) && d.Date <= dataLimite)
            .Count();

        var ultimas = todas
            .OrderByDescending(s => s.CreatedAt)
            .Take(10)
            .Select(s => new
            {
                id = s.Id,
                empresa = s.Empresa.NomeFantasia ?? s.Empresa.RazaoSocial,
                tipo = s.Tipo,
                data = s.Data,
                status = s.Status
            })
            .ToList();

        var porMes = todas
            .Where(s => DateTime.TryParse(s.Data, out _))
            .GroupBy(s =>
            {
                if (DateTime.TryParse(s.Data, out var d)) return new { d.Year, d.Month };
                return new { Year = DateTime.UtcNow.Year, Month = DateTime.UtcNow.Month };
            })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Take(12)
            .Select(g => new
            {
                ano = g.Key.Year,
                mes = g.Key.Month,
                label = $"{g.Key.Month:D2}/{g.Key.Year}",
                quantidade = g.Count()
            })
            .ToList();

        return Ok(new
        {
            sucesso = true,
            dados = new
            {
                total,
                pendentes,
                emAnalise,
                concluidas,
                porTipo,
                porMes,
                pendentesHaMaisDias,
                diasPendenteAlerta,
                ultimas
            }
        });
    }
}
