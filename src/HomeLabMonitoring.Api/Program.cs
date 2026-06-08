using HomeLabMonitoring.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql("Default"));

var app = builder.Build();

app.UseRouting();

app.UseAuthorization();

app.MapControllers();
app.Run();