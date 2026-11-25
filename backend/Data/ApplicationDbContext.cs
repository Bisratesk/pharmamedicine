using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Pharmacy.API.Models;



namespace Pharmacy.API.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<PharmacyEntity> Pharmacies => Set<PharmacyEntity>();
    public DbSet<StockItemEntity> StockItems => Set<StockItemEntity>();
    

    protected override void OnModelCreating(ModelBuilder builder)
{
    base.OnModelCreating(builder);

    builder.Entity<PharmacyEntity>(e =>
    {
        e.Property(p => p.Name).HasMaxLength(150).IsRequired();
        e.Property(p => p.Address).HasMaxLength(250).IsRequired();
        e.Property(p => p.Phone).HasMaxLength(30).IsRequired();
        e.Property(p => p.LicenseNumber).HasMaxLength(60).IsRequired();
        e.HasIndex(p => p.LicenseNumber).IsUnique();

        e.HasOne(p => p.Owner)
         .WithMany()
         .HasForeignKey(p => p.OwnerId)
         .OnDelete(DeleteBehavior.Restrict);
         builder.Entity<StockItemEntity>(e =>
{
    e.Property(s => s.MedicineName).HasMaxLength(150).IsRequired();
    e.Property(s => s.Price).HasPrecision(18, 2);

    e.HasIndex(s => new { s.PharmacyId, s.MedicineName }).IsUnique();

    e.HasOne(s => s.Pharmacy)
     .WithMany()
     .HasForeignKey(s => s.PharmacyId)
     .OnDelete(DeleteBehavior.Cascade);
});
    });
    builder.Entity<ActivityLogEntity>(e =>
{
    e.Property(a => a.Message).HasMaxLength(300).IsRequired();
    e.HasIndex(a => a.CreatedAt);
});
}
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    public DbSet<ActivityLogEntity> ActivityLogs => Set<ActivityLogEntity>();
}
