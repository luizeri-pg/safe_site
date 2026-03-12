using SafeSite.Api.DTOs;

namespace SafeSite.Api.Services;

public interface ISolicitacoesService
{
    Task<List<SolicitacaoDto>> ListarTodasAsync(string? tipo, string? status, string? busca, CancellationToken ct = default);
    Task<SolicitacaoDto?> AtualizarAsync(int id, AtualizarSolicitacaoRequest request, CancellationToken ct = default);
}
