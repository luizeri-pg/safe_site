using Microsoft.EntityFrameworkCore;
using SafeSite.Api.Models;
using BCryptNet = BCrypt.Net.BCrypt;

namespace SafeSite.Api.Data;

/// <summary>
/// Seed alternativo (empresa + usuários). O Program.cs usa Seed.RunAsync; este arquivo fica apenas para compatibilidade.
/// </summary>
public static class DbSeed
{
    public static async Task SeedAsync(AppDbContext db, CancellationToken ct = default)
    {
        if (await db.Usuarios.AnyAsync(ct))
            return;

        var empresa = new Empresa
        {
            Id = Guid.NewGuid().ToString(),
            RazaoSocial = "Empresa Alpha Ltda",
            NomeFantasia = "Empresa Alpha",
            Cnpj = "00000000000191",
            Endereco = "Rua Exemplo, 100",
            Telefone = "(11) 3000-0000"
        };
        db.Empresas.Add(empresa);

        var hash = BCryptNet.HashPassword("admin123", 12);

        db.Usuarios.Add(new Usuario
        {
            Id = Guid.NewGuid().ToString(),
            Email = "admin@safesite.com",
            PasswordHash = hash,
            Role = "admin",
            EmpresaId = null
        });

        db.Usuarios.Add(new Usuario
        {
            Id = Guid.NewGuid().ToString(),
            Email = "cliente@empresaalpha.com",
            PasswordHash = hash,
            Role = "client",
            EmpresaId = empresa.Id
        });

        await db.SaveChangesAsync(ct);
    }
}
