using SafeSite.Api.Data;
using SafeSite.Api.Models;

namespace SafeSite.Api.Services;

public static class SolicitacaoTipos
{
    public const string Cat = "Abertura de CAT";
    public const string Chamado = "Abertura de Chamado";
    public const string Cargo = "Inclusão de Cargo";
    public const string SetorGhe = "Inclusão de Setor | GHE";
    public const string Unidade = "Inclusão de Nova Unidade";
    public const string Ppp = "Solicitação de PPP";
    public const string Visita = "Solicitação de Visita Técnica";
}

public class SolicitacaoService
{
    private readonly AppDbContext _db;

    public SolicitacaoService(AppDbContext db) => _db = db;

    public async Task CriarAsync(string tipo, string referenciaId, string empresaId, string data, string status = "Pendente", string? descricao = null, CancellationToken ct = default)
    {
        _db.Solicitacoes.Add(new Solicitacao
        {
            Tipo = tipo,
            ReferenciaId = referenciaId,
            EmpresaId = empresaId,
            Data = data,
            Status = status,
            Descricao = descricao
        });
        await _db.SaveChangesAsync(ct);
    }
}
