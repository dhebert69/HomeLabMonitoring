using HomeLabMonitoring.Api.Data;
using HomeLabMonitoring.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddHttpClient<MetricsCollector>();
builder.Services.AddHostedService<MetricsCollector>();

var app = builder.Build();

app.UseRouting();

app.UseAuthorization();

app.MapControllers();
app.Run();