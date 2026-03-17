namespace SafeSite.Api.Models;

public class Unidade
{
    public string Id { get; set; } = null!;
    public string EmpresaId { get; set; } = null!;
    public string NomeUnidade { get; set; } = null!;
    public string? CnpjUnidade { get; set; }
    public string? EnderecoUnidade { get; set; }
    public string? Municipio { get; set; }
    public string? Uf { get; set; }
    public string? TelefoneUnidade { get; set; }
    public string? DataSolicitacao { get; set; }
    public string? NomeSolicitante { get; set; }
    public string Status { get; set; } = "Pendente";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Empresa Empresa { get; set; } = null!;
}
