using HomeLabMonitoring.Api.Data;
using HomeLabMonitoring.Api.Models;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using HomeLabMonitoring.Api.Configuration;

namespace HomeLabMonitoring.Api.Services;

public class MetricsCollector : BackgroundService
{
    private readonly HttpClient _httpClient;
    private List<PrometheusMetric> _previousCpuMetrics = new();
    private long _previousNetworkDownload;
    private long _previousNetworkUpload;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly List<MetricsHostConfig> _hosts;


    public MetricsCollector(HttpClient httpClient, IServiceScopeFactory scopeFactory, IOptions<List<MetricsHostConfig>> hosts)
    {
        _httpClient = httpClient;
        _scopeFactory = scopeFactory;
        _hosts = hosts.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                string rawText = await _httpClient.GetStringAsync(_hosts[0].NodeExporterUrl, stoppingToken);
                PrometheusParser parser = new PrometheusParser();
                parser.Parse(rawText);

                double cpu_percentage = CalculateCpuPercentage(parser);
                (long memory_used, long memory_total) = GetMemoryUsed(parser);
                (long network_download, long network_upload, long downloadSpeed, long uploadSpeed) = GetNetworkMetrics(parser);
                long uptime = GetUptime(parser);
                (double load1m, double load5m, double load15m) = GetLoadAverages(parser);

                HostMetric hostMetric = new HostMetric
                {
                    HostName = _hosts[0].Name,
                    CPU = cpu_percentage,
                    MemoryUsed = memory_used,
                    MemoryTotal = memory_total,
                    NetworkDownload = network_download,
                    NetworkUpload = network_upload,
                    NetworkDownloadSpeed = downloadSpeed,
                    NetworkUploadSpeed = uploadSpeed,
                    Uptime = uptime,
                    LoadAverage1m = load1m,
                    LoadAverage5m = load5m,
                    LoadAverage15m = load15m,
                    CollectedAt = DateTime.UtcNow
                };

                db.HostMetrics.Add(hostMetric);
                await db.SaveChangesAsync(stoppingToken);

                List<DiskMetric> diskMetrics = GetDiskMetrics(parser);
                db.DiskMetrics.AddRange(diskMetrics);
                await db.SaveChangesAsync(stoppingToken);
            } catch (Exception ex)
            {
                Console.WriteLine($"Error collecting metrics: {ex.Message}");
            }

            await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);
        }
    }

    private double CalculateCpuPercentage(PrometheusParser parser)
    {
        double cpu_percentage = 0;
        List<PrometheusMetric> CPUs = parser.GetMetrics(NodeExporterMetrics.CpuSecondsTotal);
        if (!_previousCpuMetrics.Any())
        {
            _previousCpuMetrics = new List<PrometheusMetric>(CPUs);
            return 0;
        }
        else
        {
            double totalDelta = CPUs.Sum(metric => metric.Value) - _previousCpuMetrics.Sum(metric => metric.Value);
            double idleDelta = CPUs.Where(metric => metric.Labels["mode"] == "idle").Sum(metric => metric.Value) - _previousCpuMetrics.Where(metric => metric.Labels["mode"] == "idle").Sum(metric => metric.Value);
            cpu_percentage = (1 - idleDelta / totalDelta) * 100;
            _previousCpuMetrics = new List<PrometheusMetric>(CPUs);
        }
        return cpu_percentage;
    }

    private (long used, long total) GetMemoryUsed(PrometheusParser parser)
    {
        PrometheusMetric? total_mem = parser.GetMetric(NodeExporterMetrics.MemTotal, null);
        PrometheusMetric? mem_available = parser.GetMetric(NodeExporterMetrics.MemAvailable, null);
        if (total_mem != null && mem_available != null)
        {
            long used = (long)(total_mem.Value - mem_available.Value);
            long total = (long)total_mem.Value;
            return (used, total);
        }
        return (0, 0);
    }

    private (long download, long upload, long downloadSpeed, long uploadSpeed) GetNetworkMetrics(PrometheusParser parser)
    {
        PrometheusMetric? network_download = parser.GetMetric(NodeExporterMetrics.NetworkDownload, new Dictionary<string, string> { { "device", _hosts[0].NetworkInterface } });
        PrometheusMetric? network_upload = parser.GetMetric(NodeExporterMetrics.NetworkUpload, new Dictionary<string, string> { { "device", _hosts[0].NetworkInterface } });
        if (network_download != null && network_upload != null)
        {
            long downloadSpeed, uploadSpeed;
            if (_previousNetworkDownload == 0 || _previousNetworkUpload == 0)
            {
                _previousNetworkDownload = (long)network_download.Value;
                _previousNetworkUpload = (long)network_upload.Value;
                return ((long)network_download.Value, (long)network_upload.Value, 0, 0);
            }
            downloadSpeed = ((long)network_download.Value - _previousNetworkDownload) / 60;
            uploadSpeed = ((long)network_upload.Value - _previousNetworkUpload) / 60;
            _previousNetworkDownload = (long)network_download.Value;
            _previousNetworkUpload = (long)network_upload.Value;

            return ((long)network_download.Value, (long)network_upload.Value, downloadSpeed, uploadSpeed);
        }
        return (0, 0, 0, 0);
    }

    private long GetUptime(PrometheusParser parser)
    {
        PrometheusMetric? uptime = parser.GetMetric(NodeExporterMetrics.Uptime, null);
        if(uptime != null)
        {
            return DateTimeOffset.UtcNow.ToUnixTimeSeconds() - (long)uptime.Value;
        }
        return 0;
    }

    private (double load1m, double load5m, double load15m) GetLoadAverages(PrometheusParser parser)
    {
        PrometheusMetric? load1m = parser.GetMetric(NodeExporterMetrics.LoadAverage1m, null);
        PrometheusMetric? load5m = parser.GetMetric(NodeExporterMetrics.LoadAverage5m, null);
        PrometheusMetric? load15m = parser.GetMetric(NodeExporterMetrics.LoadAverage15m, null);

        if(load1m != null && load5m != null && load15m != null)
        {
            return (load1m.Value, load5m.Value, load15m.Value);
        }

        return (0, 0, 0);
    }

    private List<DiskMetric> GetDiskMetrics(PrometheusParser parser)
    {
        List<PrometheusMetric> disksFreeSpace = parser.GetMetrics(NodeExporterMetrics.FilesystemAvail);
        List<PrometheusMetric> diskSize = parser.GetMetrics(NodeExporterMetrics.FilesystemSize);

        return diskSize.Where(disk => !disk.Labels["mountpoint"].StartsWith("/run")
                    && disk.Labels["fstype"] != "tmpfs").Select(disk => {
            var freeSpace = disksFreeSpace.FirstOrDefault(d => d.Labels["mountpoint"] == disk.Labels["mountpoint"]);
            return new DiskMetric
            {
                MountPoint = disk.Labels["mountpoint"],
                Hostname = _hosts[0].Name,
                DiskTotal = (long)disk.Value,
                DiskAvailable = (long)(freeSpace?.Value ?? 0),
                CollectedAt = DateTime.UtcNow
            };
        }).ToList();
    }
}