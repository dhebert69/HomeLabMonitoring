using HomeLabMonitoring.Api.Data;
using HomeLabMonitoring.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using HomeLabMonitoring.Api.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.Configure<List<MetricsHostConfig>>(
    builder.Configuration.GetSection("MetricsCollection:Hosts"));

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddHttpClient<MetricsCollector>();
builder.Services.AddHostedService<MetricsCollector>();

var app = builder.Build();
app.UseCors("AllowFrontend");
app.UseRouting();

app.UseAuthorization();

app.MapControllers();
app.Run();