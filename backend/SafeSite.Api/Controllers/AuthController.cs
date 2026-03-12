using Microsoft.AspNetCore.Mvc;
using SafeSite.Api.DTOs;
using SafeSite.Api.Services;

namespace SafeSite.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new LoginResponse
            {
                Sucesso = false,
                Mensagem = "Usuário e senha são obrigatórios",
                TempoProcessamento = 0,
                Resultado = null
            });
        }

        var response = await _auth.LoginAsync(request, ct);

        if (!response.Sucesso)
            return BadRequest(response);

        return Ok(response);
    }
}
