using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SafeSite.Api.Data;
using SafeSite.Api.DTOs;

namespace SafeSite.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _db.Usuarios
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.UserName == request.Username, ct);

        if (user == null || user.PasswordHash != request.Password)
        {
            return new LoginResponse
            {
                Sucesso = false,
                Mensagem = "Usuário ou senha inválidos",
                TempoProcessamento = 0,
                Resultado = null
            };
        }

        var expiresMinutes = _config.GetValue<int>("Jwt:ExpiresMinutes", 30);
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "SafeSite-ChaveSecreta-Minimo32Caracteres!");
        var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature);

        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.UserName),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
            signingCredentials: credentials
        );
        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return new LoginResponse
        {
            Sucesso = true,
            Mensagem = null,
            TempoProcessamento = new Random().Next(30, 80),
            Resultado = new AuthResult
            {
                ExpiresIn = expiresMinutes * 60,
                AccessToken = tokenString,
                TokenType = "Bearer",
                Role = user.Role
            }
        };
    }
}
