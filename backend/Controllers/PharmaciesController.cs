using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy.API.Data;
using Pharmacy.API.DTOs;
using Pharmacy.API.Models;

namespace Pharmacy.API.Controllers;

[ApiController]
[Route("api/pharmacies")]
[Authorize]
public class PharmaciesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public PharmaciesController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    [Authorize(Roles = "PharmacyOwner")]
    public async Task<IActionResult> Register(PharmacyRequest req)
    {
        var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        if (!TimeOnly.TryParseExact(req.OpeningTime, "HH:mm", out var opens) ||
            !TimeOnly.TryParseExact(req.ClosingTime, "HH:mm", out var closes))
            return BadRequest(new { message = "Times must look like 08:00." });

        if (closes <= opens)
            return BadRequest(new { message = "Closing time must be after opening time." });

        if (await _db.Pharmacies.AnyAsync(p => p.OwnerId == ownerId))
            return Conflict(new { message = "You have already registered a pharmacy." });

        if (await _db.Pharmacies.AnyAsync(p => p.LicenseNumber == req.LicenseNumber))
            return Conflict(new { message = "A pharmacy with this license number already exists." });

        var pharmacy = new PharmacyEntity
        {
            OwnerId = ownerId,
            Name = req.Name.Trim(),
            Address = req.Address.Trim(),
            Phone = req.Phone.Trim(),
            LicenseNumber = req.LicenseNumber.Trim(),
            Latitude = req.Latitude,
            Longitude = req.Longitude,
            OpeningTime = opens,
            ClosingTime = closes
            // Status stays Pending, set by the entity's default
        };

        _db.Pharmacies.Add(pharmacy);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMine), null, ToDto(pharmacy));
    }

    [HttpGet("mine")]
    [Authorize(Roles = "PharmacyOwner")]
    public async Task<IActionResult> GetMine()
    {
        var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var pharmacy = await _db.Pharmacies.AsNoTracking()
            .FirstOrDefaultAsync(p => p.OwnerId == ownerId);

        if (pharmacy is null)
            return NotFound(new { message = "You have not registered a pharmacy yet." });

        return Ok(ToDto(pharmacy));
    }

    private static PharmacyDto ToDto(PharmacyEntity p) => new()
    {
        Id = p.Id,
        OwnerId = p.OwnerId,
        Name = p.Name,
        Address = p.Address,
        Phone = p.Phone,
        LicenseNumber = p.LicenseNumber,
        Latitude = p.Latitude,
        Longitude = p.Longitude,
        OpeningTime = p.OpeningTime.ToString("HH:mm"),
        ClosingTime = p.ClosingTime.ToString("HH:mm"),
        Status = p.Status.ToString()
    };
}