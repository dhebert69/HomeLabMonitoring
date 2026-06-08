using HomeLabMonitoring.Api.Data;
using Microsoft.Extensions.Hosting;

namespace HomeLabMonitoring.Api.Services;

public class MetricsCollector : BackgroundService
{
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _db;

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

            await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);
        }
    }
}