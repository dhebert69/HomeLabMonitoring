using HomeLabMonitoring.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeLabMonitoring.Api.Controllers;

[ApiController]
[Route("api/metrics")]
public class MetricsController : ControllerBase{
    private readonly AppDbContext _db;

    public MetricsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("hosts")]
    public async Task<IActionResult> GetHosts()
    {
        var metrics = await _db.HostMetrics
        .OrderByDescending(m => m.CollectedAt)
        .FirstOrDefaultAsync();

        return Ok(metrics);
    }

    [HttpGet("hosts/history")]
    public async Task<IActionResult> GetHistory([FromQuery] int minutes = 5)
    {
        if (minutes <= 0 || minutes > 525600)
            return BadRequest("minutes must be between 1 and 525600 (1 year)");

        var from = DateTime.UtcNow.AddMinutes(-minutes);

        var metrics = await _db.HostMetrics
            .Where(m => m.CollectedAt >= from)
            .OrderByDescending(m => m.CollectedAt)
            .ToListAsync();

        return Ok(metrics);
    }
}