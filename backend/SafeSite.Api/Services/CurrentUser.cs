using System.Security.Claims;

namespace SafeSite.Api.Services;

public class CurrentUser
{
    public string UserId { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = ""; // "client" | "admin"
    public string? EmpresaId { get; set; }
}

public static class CurrentUserExtensions
{
    public static CurrentUser GetCurrentUser(this ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub") ?? "";
        var email = user.FindFirstValue(ClaimTypes.Email) ?? user.FindFirstValue("email") ?? "";
        // JWT pode enviar "role" como tipo; o .NET às vezes mapeia para ClaimTypes.Role
        var role = user.FindFirstValue("role")
            ?? user.FindFirstValue(ClaimTypes.Role)
            ?? "";
        var empresaId = user.FindFirstValue("empresa_id");
        return new CurrentUser { UserId = sub, Email = email, Role = role, EmpresaId = empresaId };
    }
}
