using Microsoft.EntityFrameworkCore;
using HomeLabMonitoring.Api.Models;

namespace HomeLabMonitoring.Api.Data;


public class AppDbContext : DbContext{
    public DbSet<HostMetric> HostMetrics { get; set; }
    public DbSet<DiskMetric> DiskMetrics { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
}