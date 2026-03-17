using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeSite.Api.Data;
using SafeSite.Api.Models;
using SafeSite.Api.Services;

namespace SafeSite.Api.Controllers;

[ApiController]
[Route("api/empresas")]
[Authorize]
public class EmpresasController : ControllerBase
{
    private readonly AppDbContext _db;

    public EmpresasController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<object>> Listar(CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        if (u.Role != "admin")
            return StatusCode(403, new { mensagem = "Acesso restrito a administradores" });

        var list = await _db.Empresas.OrderBy(e => e.RazaoSocial).ToListAsync(ct);
        var dados = list.Select(e => new
        {
            id = e.Id,
            razaoSocial = e.RazaoSocial,
            nomeFantasia = e.NomeFantasia,
            cnpj = e.Cnpj,
            endereco = e.Endereco,
            telefone = e.Telefone
        });
        return Ok(new { sucesso = true, dados });
    }

    [HttpPost]
    public async Task<ActionResult<object>> Criar([FromBody] CriarEmpresaBody body, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        if (u.Role != "admin")
            return StatusCode(403, new { mensagem = "Acesso restrito a administradores" });

        var cnpj = (body.Cnpj ?? "").Replace(".", "").Replace("/", "").Replace("-", "").Trim();
        if (string.IsNullOrEmpty(cnpj) || cnpj.Length != 14)
            return BadRequest(new { mensagem = "CNPJ inválido" });

        if (await _db.Empresas.AnyAsync(e => e.Cnpj == cnpj, ct))
            return BadRequest(new { mensagem = "Já existe empresa com este CNPJ" });

        var empresa = new Empresa
        {
            Id = Guid.NewGuid().ToString(),
            RazaoSocial = (body.RazaoSocial ?? "").Trim(),
            NomeFantasia = string.IsNullOrWhiteSpace(body.NomeFantasia) ? null : body.NomeFantasia.Trim(),
            Cnpj = cnpj,
            Endereco = string.IsNullOrWhiteSpace(body.Endereco) ? null : body.Endereco.Trim(),
            Telefone = string.IsNullOrWhiteSpace(body.Telefone) ? null : body.Telefone.Trim()
        };
        _db.Empresas.Add(empresa);
        await _db.SaveChangesAsync(ct);

        return StatusCode(201, new
        {
            sucesso = true,
            dados = new
            {
                id = empresa.Id,
                razaoSocial = empresa.RazaoSocial,
                nomeFantasia = empresa.NomeFantasia,
                cnpj = empresa.Cnpj,
                endereco = empresa.Endereco,
                telefone = empresa.Telefone
            }
        });
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<object>> Atualizar(string id, [FromBody] AtualizarEmpresaBody body, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        if (u.Role != "admin")
            return StatusCode(403, new { mensagem = "Acesso restrito a administradores" });

        var empresa = await _db.Empresas.FindAsync(new object[] { id }, ct);
        if (empresa == null)
            return NotFound(new { mensagem = "Empresa não encontrada" });

        if (body.NomeFantasia != null)
            empresa.NomeFantasia = string.IsNullOrWhiteSpace(body.NomeFantasia) ? null : body.NomeFantasia.Trim();
        if (body.Endereco != null)
            empresa.Endereco = string.IsNullOrWhiteSpace(body.Endereco) ? null : body.Endereco.Trim();
        if (body.Telefone != null)
            empresa.Telefone = string.IsNullOrWhiteSpace(body.Telefone) ? null : body.Telefone.Trim();

        empresa.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Ok(new
        {
            sucesso = true,
            dados = new
            {
                id = empresa.Id,
                razaoSocial = empresa.RazaoSocial,
                nomeFantasia = empresa.NomeFantasia,
                cnpj = empresa.Cnpj,
                endereco = empresa.Endereco,
                telefone = empresa.Telefone
            }
        });
    }
}

public class CriarEmpresaBody
{
    public string? RazaoSocial { get; set; }
    public string? NomeFantasia { get; set; }
    public string? Cnpj { get; set; }
    public string? Endereco { get; set; }
    public string? Telefone { get; set; }
}

public class AtualizarEmpresaBody
{
    public string? NomeFantasia { get; set; }
    public string? Endereco { get; set; }
    public string? Telefone { get; set; }
}
