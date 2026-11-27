using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy.API.Data;
using Pharmacy.API.DTOs;
using Pharmacy.API.Models;

namespace Pharmacy.API.Controllers;

[ApiController]
[Authorize(Roles = "Customer")]
[Route("api/search")]
public class SearchController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public SearchController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string? medicine,
        [FromQuery] decimal? maxPrice,
        [FromQuery] double? lat,
        [FromQuery] double? lng,
        [FromQuery] double? maxKm,
        [FromQuery] string? sort)
    {
       //validation
        if (string.IsNullOrWhiteSpace(medicine))
            return BadRequest(new { message = "Enter a medicine name to search." });

        if (lat.HasValue != lng.HasValue)
            return BadRequest(new { message = "Send both lat and lng, or neither." });

        if (lat is < -90 or > 90 || lng is < -180 or > 180)
            return BadRequest(new { message = "Latitude must be -90 to 90 and longitude -180 to 180." });

        var hasLocation = lat.HasValue && lng.HasValue;

        if (maxKm.HasValue && (!hasLocation || maxKm <= 0))
            return BadRequest(new { message = "maxKm needs lat and lng, and must be above 0." });

        var allowedSorts = new[] { "priceAsc", "priceDesc", "nearest" };
        if (!string.IsNullOrWhiteSpace(sort) && !allowedSorts.Contains(sort))
            return BadRequest(new { message = "sort must be priceAsc, priceDesc or nearest." });

        if (sort == "nearest" && !hasLocation)
            return BadRequest(new { message = "Sorting by nearest needs lat and lng." });

        // ---------- 2. Build ONE database query ----------
        var text = medicine.Trim();

        var query = _db.StockItems.AsNoTracking()
            .Where(s => s.Quantity > 0
                     && s.Pharmacy.Status == PharmacyStatus.Approved
                     && s.MedicineName.Contains(text));

        if (maxPrice.HasValue)
            query = query.Where(s => s.Price <= maxPrice.Value);

        // Rough "box" around the customer so the database skips far-away pharmacies
        if (hasLocation && maxKm.HasValue)
        {
            var la = lat!.Value;
            var ln = lng!.Value;
            var dLat = maxKm.Value / 111.0;
            var dLng = maxKm.Value / (111.0 * Math.Max(Math.Cos(la * Math.PI / 180), 0.01));

            query = query.Where(s =>
                s.Pharmacy.Latitude >= la - dLat && s.Pharmacy.Latitude <= la + dLat &&
                s.Pharmacy.Longitude >= ln - dLng && s.Pharmacy.Longitude <= ln + dLng);
        }

        var rows = await query
            .Select(s => new SearchResultDto
            {
                StockItemId = s.Id,
                PharmacyId = s.PharmacyId,
                PharmacyName = s.Pharmacy.Name,
                Address = s.Pharmacy.Address,
                Phone = s.Pharmacy.Phone,
                Latitude = s.Pharmacy.Latitude,
                Longitude = s.Pharmacy.Longitude,
                MedicineName = s.MedicineName,
                Price = s.Price,
                Quantity = s.Quantity
            })
            .ToListAsync();

        // ---------- 3. Exact distance, exact filter, sorting ----------
        if (hasLocation)
        {
            foreach (var r in rows)
                r.DistanceKm = Math.Round(DistanceKm(lat!.Value, lng!.Value, r.Latitude, r.Longitude), 2);

            if (maxKm.HasValue)
                rows = rows.Where(r => r.DistanceKm <= maxKm.Value).ToList();
        }

        IEnumerable<SearchResultDto> ordered = sort switch
        {
            "priceAsc"  => rows.OrderBy(r => r.Price),
            "priceDesc" => rows.OrderByDescending(r => r.Price),
            "nearest"   => rows.OrderBy(r => r.DistanceKm),
            _           => rows.OrderBy(r => r.MedicineName).ThenBy(r => r.Price)
        };

        return Ok(ordered.Take(100));
    }

    // Haversine formula: distance between two latitude/longitude points on Earth, in km
    private static double DistanceKm(double lat1, double lng1, double lat2, double lng2)
    {
        static double Rad(double degrees) => degrees * Math.PI / 180;

        var dLat = Rad(lat2 - lat1);
        var dLng = Rad(lng2 - lng1);
        var a = Math.Pow(Math.Sin(dLat / 2), 2) +
                Math.Cos(Rad(lat1)) * Math.Cos(Rad(lat2)) * Math.Pow(Math.Sin(dLng / 2), 2);

        return 6371 * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }
}
//what this controller does is that it allows customers to search for medicines in approved pharmacies, filter by price and distance, and sort the results by price or distance.
//  It also validates the input parameters and returns appropriate error messages if the input is invalid.