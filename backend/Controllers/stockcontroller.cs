using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy.API.Data;
using Pharmacy.API.DTOs;
using Pharmacy.API.Models;
using Pharmacy.API.Interfaces;
namespace Pharmacy.API.Controllers;
/*
 it has endpoints for getting the stock of a pharmacy, 
 adding a stock item, updating a stock item, removing a stock item, 
 and getting all stock items (for admin) */
[ApiController]
[Authorize]
[Route("api")]
public class StockController : ControllerBase
{
    private readonly ApplicationDbContext _db;
private readonly IActivityService _activity;

public StockController(ApplicationDbContext db, IActivityService activity)
{
    _db = db;
    _activity = activity;
}
    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    private bool IsAdmin => User.IsInRole("Admin");
        // GET /api/pharmacies/{pharmacyId}/stock
    [HttpGet("pharmacies/{pharmacyId:int}/stock")]
    [Authorize(Roles = "PharmacyOwner,Admin")]
    public async Task<IActionResult> GetByPharmacy(int pharmacyId)
    {
        var pharmacy = await _db.Pharmacies.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == pharmacyId);

        if (pharmacy is null)
            return NotFound(new { message = "Pharmacy not found." });

        if (!IsAdmin && pharmacy.OwnerId != UserId)
            return StatusCode(403, new { message = "This is not your pharmacy." });

        var items = await _db.StockItems.AsNoTracking()
            .Where(s => s.PharmacyId == pharmacyId)
            .OrderBy(s => s.MedicineName)
            .ToListAsync();

        return Ok(items.Select(ToDto));
    }
        // POST /api/pharmacies/{pharmacyId}/stock
    [HttpPost("pharmacies/{pharmacyId:int}/stock")]
    [Authorize(Roles = "PharmacyOwner")]
    public async Task<IActionResult> Add(int pharmacyId, StockRequest req)
    {
        var pharmacy = await _db.Pharmacies.FirstOrDefaultAsync(p => p.Id == pharmacyId);

        if (pharmacy is null)
            return NotFound(new { message = "Pharmacy not found." });

        if (pharmacy.OwnerId != UserId)
            return StatusCode(403, new { message = "This is not your pharmacy." });

        if (pharmacy.Status != PharmacyStatus.Approved)
            return StatusCode(403, new { message = "Your pharmacy must be approved before adding medicines." });

        var name = req.MedicineName.Trim();

        if (await _db.StockItems.AnyAsync(s => s.PharmacyId == pharmacyId && s.MedicineName == name))
            return Conflict(new { message = "This medicine is already in your stock. Edit it instead." });

        var item = new StockItemEntity
        {
            PharmacyId = pharmacyId,
            MedicineName = name,
            Price = req.Price,
            Quantity = req.Quantity
        };

        _db.StockItems.Add(item);
        await _db.SaveChangesAsync();
        await _activity.LogAsync(
    $"{pharmacy.Name} added {item.MedicineName} (qty {item.Quantity}, price {item.Price})");   // <- new

        return CreatedAtAction(nameof(GetByPharmacy), new { pharmacyId }, ToDto(item));
    }
        // PUT /api/stock/{id}
    [HttpPut("stock/{id:int}")]
    [Authorize(Roles = "PharmacyOwner,Admin")]
    public async Task<IActionResult> Update(int id, StockRequest req)
    {
        var item = await _db.StockItems.Include(s => s.Pharmacy)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (item is null)
            return NotFound(new { message = "Stock item not found." });

        if (!IsAdmin)
        {
            if (item.Pharmacy.OwnerId != UserId)
                return StatusCode(403, new { message = "This is not your pharmacy." });

            if (item.Pharmacy.Status != PharmacyStatus.Approved)
                return StatusCode(403, new { message = "Your pharmacy is not approved." });
        }

        var name = req.MedicineName.Trim();

        if (await _db.StockItems.AnyAsync(s =>
                s.PharmacyId == item.PharmacyId && s.Id != id && s.MedicineName == name))
            return Conflict(new { message = "Another item in this pharmacy already has that name." });

        item.MedicineName = name;
        item.Price = req.Price;
        item.Quantity = req.Quantity;
        item.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        var actor = IsAdmin ? "Admin" : item.Pharmacy.Name;                                      // <- new
await _activity.LogAsync(                                                                // <- new
    $"{actor} updated {item.MedicineName} at {item.Pharmacy.Name} (qty {item.Quantity}, price {item.Price})");

        return Ok(ToDto(item));
    }
        // DELETE /api/stock/{id}
    [HttpDelete("stock/{id:int}")]
    [Authorize(Roles = "PharmacyOwner,Admin")]
    public async Task<IActionResult> Remove(int id)
    {
        var item = await _db.StockItems.Include(s => s.Pharmacy)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (item is null)
            return NotFound(new { message = "Stock item not found." });

        if (!IsAdmin && item.Pharmacy.OwnerId != UserId)
            return StatusCode(403, new { message = "This is not your pharmacy." });

        var medicineName = item.MedicineName;
var pharmacyName = item.Pharmacy.Name;

_db.StockItems.Remove(item);
await _db.SaveChangesAsync();

var who = IsAdmin ? "Admin" : pharmacyName;
await _activity.LogAsync($"{who} removed {medicineName} from {pharmacyName}");

return NoContent();
    }
        // GET /api/stock?search=
    [HttpGet("stock")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        var query = _db.StockItems.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim();
            query = query.Where(s => s.MedicineName.Contains(q) || s.Pharmacy.Name.Contains(q));
        }

        var rows = await query
            .OrderBy(s => s.Pharmacy.Name)
            .ThenBy(s => s.MedicineName)
            .Select(s => new AdminStockDto
            {
                Id = s.Id,
                PharmacyId = s.PharmacyId,
                PharmacyName = s.Pharmacy.Name,
                MedicineName = s.MedicineName,
                Price = s.Price,
                Quantity = s.Quantity
            })
            .ToListAsync();

        return Ok(rows);
    }
        private static StockDto ToDto(StockItemEntity s) => new()
    {
        Id = s.Id,
        PharmacyId = s.PharmacyId,
        MedicineName = s.MedicineName,
        Price = s.Price,
        Quantity = s.Quantity
    };
}