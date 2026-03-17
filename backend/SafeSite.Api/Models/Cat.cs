namespace SafeSite.Api.Models;

public class Cat
{
    public string Id { get; set; } = null!;
    public string EmpresaId { get; set; } = null!;
    public string Payload { get; set; } = "{}";
    public string Status { get; set; } = "Pendente";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Empresa Empresa { get; set; } = null!;
}
