namespace SafeSite.Api.Models;

public class SetorGhe
{
    public string Id { get; set; } = null!;
    public string EmpresaId { get; set; } = null!;
    public string NomeSetor { get; set; } = null!;
    public string? CodigoSetor { get; set; }
    public string? CodigoGhe { get; set; }
    public string? DescricaoSetor { get; set; }
    public string? DataSolicitacao { get; set; }
    public string? NomeSolicitante { get; set; }
    public string Status { get; set; } = "Pendente";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Empresa Empresa { get; set; } = null!;
}
