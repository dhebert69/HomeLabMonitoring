using System.ComponentModel.DataAnnotations;

namespace HomeLabMonitoring.Api.Models;

public class HostMetric{
    public int Id { get; set; }
    [Required]
    public string HostName { get; set; }
    public double CPU { get; set; }
    public long MemoryUsed { get; set; }
    public long MemoryTotal { get; set; }
    public long NetworkDownload { get; set; }
    public long NetworkUpload { get; set; }
    public long NetworkDownloadSpeed { get; set; }
    public long NetworkUploadSpeed { get; set; }
    //uptime in seconds
    public long Uptime { get; set; }

    public double LoadAverage1m { get; set; }
    public double LoadAverage5m { get; set; }
    public double LoadAverage15m { get; set; }

    public DateTime CollectedAt { get; set; }
}