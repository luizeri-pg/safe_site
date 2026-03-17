using Microsoft.EntityFrameworkCore;
using SafeSite.Api.Models;
using BCryptNet = BCrypt.Net.BCrypt;

namespace SafeSite.Api.Data;

public static class Seed
{
    private const string CnpjSafeGestao = "31104951000134";

    public static async Task RunAsync(AppDbContext db, CancellationToken ct = default)
    {
        if (!await db.Empresas.AnyAsync(ct))
        {
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
        }

        var safeGestao = await db.Empresas.FirstOrDefaultAsync(e => e.Cnpj == CnpjSafeGestao, ct);
        if (safeGestao == null)
        {
            safeGestao = new Empresa
            {
                Id = Guid.NewGuid().ToString(),
                RazaoSocial = "Safe Gestao em Medicina Ocupacional e Seguranca do Trabalho LTDA",
                NomeFantasia = "Safe Gestão",
                Cnpj = CnpjSafeGestao
            };
            db.Empresas.Add(safeGestao);
        }

        var usuarioSafeTeste = await db.Usuarios.FirstOrDefaultAsync(u => u.Email == "safe.teste", ct);
        if (usuarioSafeTeste == null)
        {
            db.Usuarios.Add(new Usuario
            {
                Id = Guid.NewGuid().ToString(),
                Email = "safe.teste",
                PasswordHash = BCryptNet.HashPassword("safeteste", 12),
                Role = "client",
                EmpresaId = safeGestao.Id
            });
        }

        await db.SaveChangesAsync(ct);
    }
}
