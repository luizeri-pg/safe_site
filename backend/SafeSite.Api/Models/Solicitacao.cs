namespace SafeSite.Api.Models;

public class Solicitacao
{
    public int Id { get; set; }
    public string Tipo { get; set; } = null!;
    public string ReferenciaId { get; set; } = null!;
    public string EmpresaId { get; set; } = null!;
    public string Data { get; set; } = null!;
    public string Status { get; set; } = "Pendente";
    public string? Descricao { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Empresa Empresa { get; set; } = null!;
}
