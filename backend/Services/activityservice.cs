using Pharmacy.API.Data;
using Pharmacy.API.Interfaces;
using Pharmacy.API.Models;

namespace Pharmacy.API.Services;

public class ActivityService : IActivityService
{
    private readonly ApplicationDbContext _db;

    public ActivityService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task LogAsync(string message)
    {
        // Keep messages inside the column limit (300)
        if (message.Length > 300)
            message = message[..300];

        _db.ActivityLogs.Add(new ActivityLogEntity { Message = message });
        await _db.SaveChangesAsync();
    }
}