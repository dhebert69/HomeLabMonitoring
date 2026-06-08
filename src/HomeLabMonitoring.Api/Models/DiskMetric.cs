using System.ComponentModel.DataAnnotations;

namespace HomeLabMonitoring.Api.Models;

public class DiskMetric{
    public int Id { get; set;}
    [Required]
    public string MountPoint { get; set; }
    [Required]
    public string Hostname { get; set; }
    public long DiskTotal { get; set; }
    public long DiskAvailable { get; set; }

    public DateTime CollectedAt { get; set; }

}