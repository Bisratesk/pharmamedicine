namespace Pharmacy.API.DTOs;

public class ActivityLogDto
{
    public int Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}