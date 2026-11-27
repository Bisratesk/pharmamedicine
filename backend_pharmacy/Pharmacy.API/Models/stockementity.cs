namespace Pharmacy.API.Models;

public class StockItemEntity
{
    public int Id { get; set; }

    public int PharmacyId { get; set; }
    public PharmacyEntity Pharmacy { get; set; } = null!;

    public string MedicineName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}