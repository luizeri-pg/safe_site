using Microsoft.EntityFrameworkCore;
using SafeSite.Api.Models;

namespace SafeSite.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Empresa> Empresas => Set<Empresa>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Solicitacao> Solicitacoes => Set<Solicitacao>();
    public DbSet<Cat> Cats => Set<Cat>();
    public DbSet<Chamado> Chamados => Set<Chamado>();
    public DbSet<Cargo> Cargos => Set<Cargo>();
    public DbSet<SetorGhe> SetoresGhe => Set<SetorGhe>();
    public DbSet<Unidade> Unidades => Set<Unidade>();
    public DbSet<SolicitacaoPpp> SolicitacoesPpp => Set<SolicitacaoPpp>();
    public DbSet<VisitaTecnica> VisitasTecnicas => Set<VisitaTecnica>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Snake_case para PostgreSQL
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            entity.SetTableName(ToSnakeCase(entity.GetTableName() ?? entity.ClrType.Name));
            foreach (var prop in entity.GetProperties())
                prop.SetColumnName(ToSnakeCase(prop.Name));
        }

        modelBuilder.Entity<Empresa>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Cnpj).IsUnique();
        });

        modelBuilder.Entity<Usuario>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.HasOne(x => x.Empresa).WithMany(x => x.Usuarios).HasForeignKey(x => x.EmpresaId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Solicitacao>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Empresa).WithMany(x => x.Solicitacoes).HasForeignKey(x => x.EmpresaId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Cat>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Empresa).WithMany(x => x.Cats).HasForeignKey(x => x.EmpresaId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Chamado>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Empresa).WithMany(x => x.Chamados).HasForeignKey(x => x.EmpresaId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Cargo>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Empresa).WithMany(x => x.Cargos).HasForeignKey(x => x.EmpresaId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SetorGhe>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Empresa).WithMany(x => x.SetoresGhe).HasForeignKey(x => x.EmpresaId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Unidade>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Empresa).WithMany(x => x.Unidades).HasForeignKey(x => x.EmpresaId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SolicitacaoPpp>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Empresa).WithMany(x => x.Ppps).HasForeignKey(x => x.EmpresaId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<VisitaTecnica>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Empresa).WithMany(x => x.Visitas).HasForeignKey(x => x.EmpresaId).OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static string ToSnakeCase(string name)
    {
        if (string.IsNullOrEmpty(name)) return name;
        var result = new System.Text.StringBuilder();
        for (int i = 0; i < name.Length; i++)
        {
            var c = name[i];
            if (char.IsUpper(c))
            {
                if (i > 0) result.Append('_');
                result.Append(char.ToLowerInvariant(c));
            }
            else
                result.Append(c);
        }
        return result.ToString();
    }
}
