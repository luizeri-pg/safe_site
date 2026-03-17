namespace SafeSite.Api.DTOs;

public class EmpresaBody
{
    public string? Cnpj { get; set; }
    public string? RazaoSocial { get; set; }
}

public class ChamadoBody
{
    public string? Titulo { get; set; }
    public string? Descricao { get; set; }
    public string? Prioridade { get; set; }
    public string? Categoria { get; set; }
}

public class SolicitanteBody
{
    public string? Nome { get; set; }
    public string? Email { get; set; }
    public string? Telefone { get; set; }
}

public class CargoBody
{
    public string? NomeCargo { get; set; }
    public string? Cbo { get; set; }
    public string? Setor { get; set; }
    public string? DescricaoAtividades { get; set; }
    public string? GrauRisco { get; set; }
}

public class SolicitacaoBody
{
    public string? DataSolicitacao { get; set; }
    public string? NomeSolicitante { get; set; }
}

public class SetorGheBody
{
    public string? NomeSetor { get; set; }
    public string? CodigoSetor { get; set; }
    public string? CodigoGhe { get; set; }
    public string? DescricaoSetor { get; set; }
}

public class UnidadeBody
{
    public string? NomeUnidade { get; set; }
    public string? CnpjUnidade { get; set; }
    public string? EnderecoUnidade { get; set; }
    public string? Municipio { get; set; }
    public string? Uf { get; set; }
    public string? TelefoneUnidade { get; set; }
}

public class VisitaBody
{
    public string? ObjetivoVisita { get; set; }
    public string? DataPreferencial { get; set; }
    public string? EnderecoVisita { get; set; }
    public string? Municipio { get; set; }
    public string? Uf { get; set; }
    public string? DescricaoNecessidade { get; set; }
    public string? TipoVisita { get; set; }
}

public class VisitaSolicitacaoBody
{
    public string? DataSolicitacao { get; set; }
    public string? NomeSolicitante { get; set; }
    public string? EmailSolicitante { get; set; }
    public string? TelefoneSolicitante { get; set; }
}

public class CriarChamadoBody
{
    public EmpresaBody? Empresa { get; set; }
    public ChamadoBody? Chamado { get; set; }
    public SolicitanteBody? Solicitante { get; set; }
}

public class CriarCargoBody
{
    public EmpresaBody? Empresa { get; set; }
    public CargoBody? Cargo { get; set; }
    public SolicitacaoBody? Solicitacao { get; set; }
}

public class CriarSetorGheBody
{
    public EmpresaBody? Empresa { get; set; }
    public SetorGheBody? SetorGhe { get; set; }
    public SolicitacaoBody? Solicitacao { get; set; }
}

public class CriarUnidadeBody
{
    public EmpresaBody? Empresa { get; set; }
    public UnidadeBody? Unidade { get; set; }
    public SolicitacaoBody? Solicitacao { get; set; }
}

public class CriarVisitaBody
{
    public EmpresaBody? Empresa { get; set; }
    public VisitaBody? Visita { get; set; }
    public VisitaSolicitacaoBody? Solicitacao { get; set; }
}

public class CriarPppBody
{
    public object? Payload { get; set; }
}

public class CriarCatBody
{
    public object? Payload { get; set; }
}
