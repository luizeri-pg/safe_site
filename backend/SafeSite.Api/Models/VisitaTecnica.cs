namespace SafeSite.Api.Models;

public class VisitaTecnica
{
    public string Id { get; set; } = null!;
    public string EmpresaId { get; set; } = null!;
    public string? ObjetivoVisita { get; set; }
    public string? DataPreferencial { get; set; }
    public string? EnderecoVisita { get; set; }
    public string? Municipio { get; set; }
    public string? Uf { get; set; }
    public string? DescricaoNecessidade { get; set; }
    public string? TipoVisita { get; set; }
    public string? DataSolicitacao { get; set; }
    public string? NomeSolicitante { get; set; }
    public string? EmailSolicitante { get; set; }
    public string? TelefoneSolicitante { get; set; }
    public string Status { get; set; } = "Pendente";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Empresa Empresa { get; set; } = null!;
}
