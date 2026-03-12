using Microsoft.EntityFrameworkCore;
using SafeSite.Api.Data;
using SafeSite.Api.DTOs;

namespace SafeSite.Api.Services;

public class SolicitacoesService : ISolicitacoesService
{
    private readonly AppDbContext _db;

    public SolicitacoesService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<SolicitacaoDto>> ListarTodasAsync(string? tipo, string? status, string? busca, CancellationToken ct = default)
    {
        var query = _db.Solicitacoes.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(tipo))
            query = query.Where(s => s.Tipo == tipo);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(s => s.Status == status);

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var b = busca.Trim().ToLower();
            query = query.Where(s =>
                s.Empresa.ToLower().Contains(b) ||
                (s.Tipo != null && s.Tipo.ToLower().Contains(b)));
        }

        return await query
            .OrderByDescending(s => s.DataCriacao)
            .Select(s => new SolicitacaoDto
            {
                Id = s.Id,
                Empresa = s.Empresa,
                Tipo = s.Tipo,
                Data = s.DataCriacao.ToString("yyyy-MM-dd"),
                Status = s.Status,
                Descricao = s.Descricao
            })
            .ToListAsync(ct);
    }

    public async Task<SolicitacaoDto?> AtualizarAsync(int id, AtualizarSolicitacaoRequest request, CancellationToken ct = default)
    {
        var item = await _db.Solicitacoes.FindAsync(new object[] { id }, ct);
        if (item == null) return null;

        if (!string.IsNullOrWhiteSpace(request.Status))
            item.Status = request.Status.Trim();
        if (request.Descricao != null)
            item.Descricao = request.Descricao;

        await _db.SaveChangesAsync(ct);

        return new SolicitacaoDto
        {
            Id = item.Id,
            Empresa = item.Empresa,
            Tipo = item.Tipo,
            Data = item.DataCriacao.ToString("yyyy-MM-dd"),
            Status = item.Status,
            Descricao = item.Descricao
        };
    }
}
