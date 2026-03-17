namespace SafeSite.Api.Models;

public class Chamado
{
    public string Id { get; set; } = null!;
    public string? Numero { get; set; }
    public string EmpresaId { get; set; } = null!;
    public string Titulo { get; set; } = null!;
    public string? Descricao { get; set; }
    public string Prioridade { get; set; } = "Média";
    public string? Categoria { get; set; }
    public string? SolicitanteNome { get; set; }
    public string? SolicitanteEmail { get; set; }
    public string? SolicitanteTelefone { get; set; }
    public string Status { get; set; } = "Aberto";
    public DateTime DataAbertura { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Empresa Empresa { get; set; } = null!;
}
