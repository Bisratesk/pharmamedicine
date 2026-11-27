namespace Pharmacy.API.DTOs;

// One search result = one medicine at one pharmacy
public class SearchResultDto
{
    public int StockItemId { get; set; }
    public int PharmacyId { get; set; }
    public string PharmacyName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string MedicineName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }

    // Null when the customer didn't send a location
    public double? DistanceKm { get; set; }
}