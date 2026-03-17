using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SafeSite.Api.Data;
using SafeSite.Api.DTOs;
using BCryptNet = BCrypt.Net.BCrypt;

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
        var email = (request.Username ?? "").Trim().ToLowerInvariant();
        var user = await _db.Usuarios
            .Include(u => u.Empresa)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email, ct);

        if (user == null || !BCryptNet.Verify(request.Password ?? "", user.PasswordHash))
        {
            return new LoginResponse
            {
                Sucesso = false,
                Mensagem = "Usuário ou senha inválidos",
                TempoProcessamento = 0,
                RequisicaoId = Guid.NewGuid().ToString(),
                Resultado = null
            };
        }

        var expiresMinutes = _config.GetValue("Jwt:ExpiresInMinutes", 30);
        var secret = _config["Jwt:Secret"] ?? "dev-secret-min-32-chars!!!!!!!!!!!";
        var key = Encoding.UTF8.GetBytes(secret);
        var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role)
        };
        if (!string.IsNullOrEmpty(user.EmpresaId))
            claims.Add(new Claim("empresa_id", user.EmpresaId));

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
            signingCredentials: credentials
        );
        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return new LoginResponse
        {
            Sucesso = true,
            Mensagem = null,
            TempoProcessamento = 0,
            RequisicaoId = Guid.NewGuid().ToString(),
            Resultado = new AuthResult
            {
                ExpiresIn = expiresMinutes * 60,
                AccessToken = tokenString,
                TokenType = "Bearer",
                Role = user.Role,
                EmpresaId = user.EmpresaId,
                EmpresaNome = user.Empresa?.NomeFantasia ?? user.Empresa?.RazaoSocial,
                EmpresaRazaoSocial = user.Empresa?.RazaoSocial,
                EmpresaCnpj = user.Empresa?.Cnpj
            }
        };
    }
}
