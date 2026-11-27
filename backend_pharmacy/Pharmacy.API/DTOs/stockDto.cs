using System.ComponentModel.DataAnnotations;

namespace Pharmacy.API.DTOs;

// What the owner or admin SENDS
public class StockRequest
{
    [Required, MinLength(2), MaxLength(150)]
    public string MedicineName { get; set; } = string.Empty;

    [Range(0.01, 1000000)]
    public decimal Price { get; set; }

    [Range(0, 100000)]
    public int Quantity { get; set; }
}

// What the API SENDS BACK for one item
public class StockDto
{
    public int Id { get; set; }
    public int PharmacyId { get; set; }
    public string MedicineName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

// The admin's table row: a stock item plus its pharmacy's name
public class AdminStockDto : StockDto
{
    public string PharmacyName { get; set; } = string.Empty;
}