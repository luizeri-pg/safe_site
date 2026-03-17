namespace SafeSite.Api.Models;

public class Usuario
{
    public string Id { get; set; } = null!;
    public string? EmpresaId { get; set; }
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Role { get; set; } = null!; // "client" | "admin"
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Empresa? Empresa { get; set; }
}
