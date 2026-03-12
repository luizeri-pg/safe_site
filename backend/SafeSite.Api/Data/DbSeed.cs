using Microsoft.EntityFrameworkCore;
using SafeSite.Api.Models;

namespace SafeSite.Api.Data;

public static class DbSeed
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Usuarios.AnyAsync())
            return;

        // Senha "admin" e "123" em hash simples (apenas para desenvolvimento; em produção use BCrypt/Identity)
        var usuarios = new List<Usuario>
        {
            new() { UserName = "admin", PasswordHash = "admin", Role = "admin" },
            new() { UserName = "cliente1", PasswordHash = "123", Role = "client", Empresa = "Empresa Alpha" },
            new() { UserName = "cliente2", PasswordHash = "123", Role = "client", Empresa = "Empresa Beta" }
        };
        await db.Usuarios.AddRangeAsync(usuarios);

        var tipos = new[]
        {
            "Manuais e Procedimentos", "Solicitação de PPP", "Abertura de CAT", "Inclusão de Cargo",
            "Inclusão de Setor | GHE", "Inclusão de Nova Unidade", "Solicitação de Visita Técnica", "Abertura de Chamado"
        };
        var solicitacoes = new List<Solicitacao>();
        var rand = new Random(42);
        for (int i = 0; i < 12; i++)
        {
            solicitacoes.Add(new Solicitacao
            {
                Empresa = new[] { "Empresa Alpha", "Empresa Beta", "Empresa Gamma" }[rand.Next(3)],
                Tipo = tipos[rand.Next(tipos.Length)],
                DataCriacao = DateTime.UtcNow.AddDays(-rand.Next(1, 10)),
                Status = new[] { "Pendente", "Em análise", "Concluído" }[rand.Next(3)]
            });
        }
        await db.Solicitacoes.AddRangeAsync(solicitacoes);

        await db.SaveChangesAsync();
    }
}
