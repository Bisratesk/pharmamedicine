using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pharmacy.API.Data;
using Pharmacy.API.DTOs;

namespace Pharmacy.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/activity")]
public class ActivityController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ActivityController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET /api/activity?take=50&afterId=120
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int take = 50, [FromQuery] int? afterId = null)
    {
        if (take < 1 || take > 200)
            return BadRequest(new { message = "take must be between 1 and 200." });

        var query = _db.ActivityLogs.AsNoTracking().AsQueryable();

        if (afterId.HasValue)
            query = query.Where(a => a.Id > afterId.Value);

        var rows = await query
            .OrderByDescending(a => a.Id)
            .Take(take)
            .ToListAsync();

        var result = rows.Select(a => new ActivityLogDto
        {
            Id = a.Id,
            Message = a.Message,
            Timestamp = DateTime.SpecifyKind(a.CreatedAt, DateTimeKind.Utc)
        });

        return Ok(result);
    }
}