using System.Text.Json.Serialization;

namespace SafeSite.Api.DTOs;

public class LoginRequest
{
    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;

    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
}

public class AuthResult
{
    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }

    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;

    [JsonPropertyName("token_type")]
    public string TokenType { get; set; } = "Bearer";

    [JsonPropertyName("role")]
    public string? Role { get; set; }
}

public class LoginResponse
{
    [JsonPropertyName("sucesso")]
    public bool Sucesso { get; set; }

    [JsonPropertyName("mensagem")]
    public string? Mensagem { get; set; }

    [JsonPropertyName("tempoProcessamento")]
    public int TempoProcessamento { get; set; }

    [JsonPropertyName("requisicaoId")]
    public string RequisicaoId { get; set; } = Guid.NewGuid().ToString();

    [JsonPropertyName("resultado")]
    public AuthResult? Resultado { get; set; }
}
