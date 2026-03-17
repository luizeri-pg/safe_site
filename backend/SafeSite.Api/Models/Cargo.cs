namespace SafeSite.Api.Models;

public class Cargo
{
    public string Id { get; set; } = null!;
    public string EmpresaId { get; set; } = null!;
    public string NomeCargo { get; set; } = null!;
    public string? Cbo { get; set; }
    public string? Setor { get; set; }
    public string? DescricaoAtividades { get; set; }
    public string? GrauRisco { get; set; }
    public string? DataSolicitacao { get; set; }
    public string? NomeSolicitante { get; set; }
    public string Status { get; set; } = "Pendente";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Empresa Empresa { get; set; } = null!;
}
