using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SafeSite.Api.Data;
using SafeSite.Api.DTOs;
using BCryptNet = BCrypt.Net.BCrypt;

namespace SafeSite.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var start = TimeProvider.System.GetUtcNow().Ticks / TimeSpan.TicksPerMillisecond;
        var reqId = Guid.NewGuid().ToString();

        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Ok(new LoginResponse
            {
                Sucesso = false,
                Mensagem = "Usuário e senha são obrigatórios",
                TempoProcessamento = 0,
                RequisicaoId = reqId,
                Resultado = null
            });
        }

        var email = request.Username.Trim().ToLowerInvariant();
        var user = await _db.Usuarios
            .Include(u => u.Empresa)
            .FirstOrDefaultAsync(u => u.Email == email, ct);

        if (user == null)
        {
            return Ok(new LoginResponse
            {
                Sucesso = false,
                Mensagem = "Credenciais inválidas",
                TempoProcessamento = (TimeProvider.System.GetUtcNow().Ticks / TimeSpan.TicksPerMillisecond) - start,
                RequisicaoId = reqId,
                Resultado = null
            });
        }

        if (!BCryptNet.Verify(request.Password, user.PasswordHash))
        {
            return Ok(new LoginResponse
            {
                Sucesso = false,
                Mensagem = "Credenciais inválidas",
                TempoProcessamento = (TimeProvider.System.GetUtcNow().Ticks / TimeSpan.TicksPerMillisecond) - start,
                RequisicaoId = reqId,
                Resultado = null
            });
        }

        var token = GerarJwt(user.Id, user.Email, user.Role, user.EmpresaId);
        var expiresIn = _config.GetValue("Jwt:ExpiresInMinutes", 30) * 60;

        return Ok(new LoginResponse
        {
            Sucesso = true,
            Mensagem = null,
            TempoProcessamento = (TimeProvider.System.GetUtcNow().Ticks / TimeSpan.TicksPerMillisecond) - start,
            RequisicaoId = reqId,
            Resultado = new AuthResult
            {
                AccessToken = token,
                TokenType = "Bearer",
                ExpiresIn = expiresIn,
                Role = user.Role,
                EmpresaId = user.EmpresaId,
                EmpresaNome = user.Empresa?.NomeFantasia ?? user.Empresa?.RazaoSocial,
                EmpresaRazaoSocial = user.Empresa?.RazaoSocial,
                EmpresaCnpj = user.Empresa?.Cnpj
            }
        });
    }

    private string GerarJwt(string userId, string email, string role, string? empresaId)
    {
        var secret = _config["Jwt:Secret"] ?? "dev-secret-min-32-chars!!!!!!!!!!!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(_config.GetValue("Jwt:ExpiresInMinutes", 30));

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new(JwtRegisteredClaimNames.Email, email),
            new("role", role),
            new(ClaimTypes.Role, role) // padrão .NET para autorização por role
        };
        if (!string.IsNullOrEmpty(empresaId))
            claims.Add(new Claim("empresa_id", empresaId));

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
