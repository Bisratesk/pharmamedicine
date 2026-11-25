using System.ComponentModel.DataAnnotations;

namespace Pharmacy.API.DTOs;
//what 
public class UpdateStatusRequest
{
    // "Pending", "Approved" or "Rejected"
    [Required]
    public string Status { get; set; } = string.Empty;
}
