using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<Match> Matches { get; set; }
        public DbSet<Pronostic> Pronostics { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Match>()
                .HasOne(m => m.Team1)
                .WithMany(t => t.MatchesAsTeam1)
                .HasForeignKey(m => m.Team1Id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Match>()
                .HasOne(m => m.Team2)
                .WithMany(t => t.MatchesAsTeam2)
                .HasForeignKey(m => m.Team2Id)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuration de la relation Pronostic -> User
            modelBuilder.Entity<Pronostic>()
                .HasOne(p => p.User)
                .WithMany(u => u.Pronostics)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Pronostic>()
                .HasOne(p => p.Match)
                .WithMany(m => m.Pronostics)
                .HasForeignKey(p => p.MatchId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Pronostic>()
                .Property(p => p.UserId)
                .IsRequired(false);

            modelBuilder.Entity<Pronostic>()
                .Property(p => p.MatchId)
                .IsRequired(false);
        }
    }
}