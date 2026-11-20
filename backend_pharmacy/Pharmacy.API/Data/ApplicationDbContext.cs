using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Pharmacy.API.Models;


namespace Pharmacy.API.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<PharmacyEntity> Pharmacies => Set<PharmacyEntity>();

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
    });
}
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
}
