using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SafeSite.Api.Data;
using SafeSite.Api.Models;
using SafeSite.Api.Services;
using BCryptNet = BCrypt.Net.BCrypt;

namespace SafeSite.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsuariosController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<object>> Listar(CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        if (u.Role != "admin")
            return StatusCode(403, new { mensagem = "Acesso restrito a administradores" });

        var list = await _db.Usuarios
            .Include(x => x.Empresa)
            .OrderBy(x => x.Email)
            .ToListAsync(ct);
        var dados = list.Select(x => new
        {
            id = x.Id,
            email = x.Email,
            role = x.Role,
            empresaId = x.EmpresaId,
            empresaNome = x.Empresa != null ? (x.Empresa.NomeFantasia ?? x.Empresa.RazaoSocial) : null
        });
        return Ok(new { sucesso = true, dados });
    }

    [HttpPost]
    public async Task<ActionResult<object>> Criar([FromBody] CriarUsuarioBody body, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        if (u.Role != "admin")
            return StatusCode(403, new { mensagem = "Acesso restrito a administradores" });

        var email = (body.Email ?? "").Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(email))
            return BadRequest(new { mensagem = "E-mail é obrigatório" });

        if (await _db.Usuarios.AnyAsync(x => x.Email == email, ct))
            return BadRequest(new { mensagem = "Já existe usuário com este e-mail" });

        var senha = body.Senha ?? "";
        if (senha.Length < 4)
            return BadRequest(new { mensagem = "Senha deve ter no mínimo 4 caracteres" });

        var role = (body.Role ?? "client").Trim().ToLowerInvariant();
        if (role != "admin" && role != "client") role = "client";

        string? empresaId = string.IsNullOrWhiteSpace(body.EmpresaId) ? null : body.EmpresaId.Trim();
        if (empresaId != null && !await _db.Empresas.AnyAsync(e => e.Id == empresaId, ct))
            return BadRequest(new { mensagem = "Empresa não encontrada" });

        var usuario = new Usuario
        {
            Id = Guid.NewGuid().ToString(),
            Email = email,
            PasswordHash = BCryptNet.HashPassword(senha, 12),
            Role = role,
            EmpresaId = empresaId
        };
        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync(ct);

        return StatusCode(201, new
        {
            sucesso = true,
            dados = new
            {
                id = usuario.Id,
                email = usuario.Email,
                role = usuario.Role,
                empresaId = usuario.EmpresaId
            }
        });
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<object>> Atualizar(string id, [FromBody] AtualizarUsuarioBody body, CancellationToken ct)
    {
        var u = User.GetCurrentUser();
        if (u.Role != "admin")
            return StatusCode(403, new { mensagem = "Acesso restrito a administradores" });

        var usuario = await _db.Usuarios.FindAsync(new object[] { id }, ct);
        if (usuario == null)
            return NotFound(new { mensagem = "Usuário não encontrado" });

        if (body.Email != null)
        {
            var email = body.Email.Trim().ToLowerInvariant();
            if (email != usuario.Email && await _db.Usuarios.AnyAsync(x => x.Email == email, ct))
                return BadRequest(new { mensagem = "Já existe usuário com este e-mail" });
            usuario.Email = email;
        }
        if (body.Role != null)
        {
            var role = body.Role.Trim().ToLowerInvariant();
            usuario.Role = role == "admin" ? "admin" : "client";
        }
        if (body.EmpresaId != null)
        {
            var empresaId = string.IsNullOrWhiteSpace(body.EmpresaId) ? null : body.EmpresaId.Trim();
            if (empresaId != null && !await _db.Empresas.AnyAsync(e => e.Id == empresaId, ct))
                return BadRequest(new { mensagem = "Empresa não encontrada" });
            usuario.EmpresaId = empresaId;
        }
        if (!string.IsNullOrEmpty(body.Senha))
        {
            if (body.Senha!.Length < 4)
                return BadRequest(new { mensagem = "Senha deve ter no mínimo 4 caracteres" });
            usuario.PasswordHash = BCryptNet.HashPassword(body.Senha, 12);
        }

        await _db.SaveChangesAsync(ct);

        return Ok(new
        {
            sucesso = true,
            dados = new
            {
                id = usuario.Id,
                email = usuario.Email,
                role = usuario.Role,
                empresaId = usuario.EmpresaId
            }
        });
    }
}

public class CriarUsuarioBody
{
    public string? Email { get; set; }
    public string? Senha { get; set; }
    public string? Role { get; set; }
    public string? EmpresaId { get; set; }
}

public class AtualizarUsuarioBody
{
    public string? Email { get; set; }
    public string? Senha { get; set; }
    public string? Role { get; set; }
    public string? EmpresaId { get; set; }
}
