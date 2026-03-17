namespace SafeSite.Api.Models;

public class Empresa
{
    public string Id { get; set; } = null!;
    public string RazaoSocial { get; set; } = null!;
    public string? NomeFantasia { get; set; }
    public string Cnpj { get; set; } = null!;
    public string? Endereco { get; set; }
    public string? Telefone { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    public ICollection<Cat> Cats { get; set; } = new List<Cat>();
    public ICollection<Chamado> Chamados { get; set; } = new List<Chamado>();
    public ICollection<Cargo> Cargos { get; set; } = new List<Cargo>();
    public ICollection<SetorGhe> SetoresGhe { get; set; } = new List<SetorGhe>();
    public ICollection<Unidade> Unidades { get; set; } = new List<Unidade>();
    public ICollection<SolicitacaoPpp> Ppps { get; set; } = new List<SolicitacaoPpp>();
    public ICollection<VisitaTecnica> Visitas { get; set; } = new List<VisitaTecnica>();
    public ICollection<Solicitacao> Solicitacoes { get; set; } = new List<Solicitacao>();
}
