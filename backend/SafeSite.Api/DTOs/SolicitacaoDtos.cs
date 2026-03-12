using System.Text.Json.Serialization;

namespace SafeSite.Api.DTOs;

public class SolicitacaoDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("empresa")]
    public string Empresa { get; set; } = string.Empty;

    [JsonPropertyName("tipo")]
    public string Tipo { get; set; } = string.Empty;

    [JsonPropertyName("data")]
    public string Data { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("descricao")]
    public string? Descricao { get; set; }
}

public class SolicitacoesListResponse
{
    [JsonPropertyName("sucesso")]
    public bool Sucesso { get; set; }

    [JsonPropertyName("dados")]
    public List<SolicitacaoDto> Dados { get; set; } = new();
}

public class AtualizarSolicitacaoRequest
{
    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("descricao")]
    public string? Descricao { get; set; }
}
