namespace SafeSite.Api.Models;

public class Usuario
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "client"; // "client" | "admin"
    public string? Empresa { get; set; }
}
