using System.Text.Json.Serialization;

namespace SafeSite.Api.DTOs;

public class LoginRequest
{
    [JsonPropertyName("username")]
    public string Username { get; set; } = "";

    [JsonPropertyName("password")]
    public string Password { get; set; } = "";
}

public class LoginResponse
{
    [JsonPropertyName("sucesso")]
    public bool Sucesso { get; set; }

    [JsonPropertyName("mensagem")]
    public string? Mensagem { get; set; }

    [JsonPropertyName("tempoProcessamento")]
    public long TempoProcessamento { get; set; }

    [JsonPropertyName("requisicaoId")]
    public string RequisicaoId { get; set; } = "";

    [JsonPropertyName("resultado")]
    public AuthResult? Resultado { get; set; }
}

public class AuthResult
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = "";

    [JsonPropertyName("token_type")]
    public string TokenType { get; set; } = "Bearer";

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }

    [JsonPropertyName("role")]
    public string? Role { get; set; }

    [JsonPropertyName("empresa_id")]
    public string? EmpresaId { get; set; }

    [JsonPropertyName("empresa_nome")]
    public string? EmpresaNome { get; set; }

    [JsonPropertyName("empresa_razao_social")]
    public string? EmpresaRazaoSocial { get; set; }

    [JsonPropertyName("empresa_cnpj")]
    public string? EmpresaCnpj { get; set; }
}
