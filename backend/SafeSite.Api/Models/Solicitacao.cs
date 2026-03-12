namespace SafeSite.Api.Models;

public class Solicitacao
{
    public int Id { get; set; }
    public string Empresa { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pendente"; // Pendente | Em análise | Concluído
    public string? Descricao { get; set; }
    public int? UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }
}
