namespace Pharmacy.API.Models;

public class PharmacyEntity
{
    public int Id { get; set; }

    public string OwnerId { get; set; } = string.Empty;
    public ApplicationUser Owner { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public TimeOnly OpeningTime { get; set; }
    public TimeOnly ClosingTime { get; set; }

    public PharmacyStatus Status { get; set; } = PharmacyStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}