using HomeLabMonitoring.Api.Data;
using Microsoft.Extensions.Hosting;

namespace HomeLabMonitoring.Api.Services;

public class MetricsCollector : BackgroundService
{
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _db;
    private List<PrometheusMetric> _previousCpuMetrics = new();

    public MetricsCollector(HttpClient httpClient, AppDbContext db)
    {
        _httpClient = httpClient;
        _db = db;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // do your work here
            string rawText = await _httpClient.GetStringAsync("http://192.168.2.233:9101/metrics", stoppingToken);
            PrometheusParser parser  = new PrometheusParser();
            parser.Parse(rawText);

            double cpu_percentage = CalculateCpuPercentage(parser);
            (long memory_used, long memory_total) = GetMemoryUsed(parser);
            (long network_download, long network_upload) = GetNetworkMetrics(parser);

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

    private (long download, long upload) GetNetworkMetrics(PrometheusParser parser)
    {
        PrometheusMetric? network_download = parser.GetMetric(NodeExporterMetrics.NetworkDownload, new Dictionary<string, string> { { "device", "eth0" } });
        PrometheusMetric? network_upload = parser.GetMetric(NodeExporterMetrics.NetworkUpload, new Dictionary<string, string> { { "device", "eth0" } });
        if (network_download != null && network_upload != null)
        {
            return ((long)network_download.Value, (long)network_upload.Value);
        }
        return (0, 0);
    }
}