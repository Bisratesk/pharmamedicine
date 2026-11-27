using System.ComponentModel.DataAnnotations;

namespace Pharmacy.API.DTOs;

public class PharmacyRequest
{
    [Required, MinLength(3), MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(250)]
    public string Address { get; set; } = string.Empty;

    [Required, MinLength(7), MaxLength(30)]
    public string Phone { get; set; } = string.Empty;

    [Required, MaxLength(60)]
    public string LicenseNumber { get; set; } = string.Empty;

    [Range(-90, 90)]
    public double Latitude { get; set; }

    [Range(-180, 180)]
    public double Longitude { get; set; }

    // "HH:mm", exactly what Angular's time input sends
    [Required, RegularExpression(@"^([01]\d|2[0-3]):[0-5]\d$")]
    public string OpeningTime { get; set; } = "08:00";

    [Required, RegularExpression(@"^([01]\d|2[0-3]):[0-5]\d$")]
    public string ClosingTime { get; set; } = "20:00";
}
//difference between PharmacyRequest and PharmacyDto is that PharmacyRequest is used for creating or updating a pharmacy, while PharmacyDto is used for retrieving pharmacy data. PharmacyRequest has validation attributes to ensure that the data sent to the API is valid, while PharmacyDto does not have any validation attributes.    