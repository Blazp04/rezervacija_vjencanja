using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using RezervacijaVjencanja.Data;

namespace RezervacijaVjencanja.Tests.Helpers;

public sealed class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove the SQL Server DbContext registration from Program.cs
            var toRemove = services
                .Where(d =>
                    d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                    d.ServiceType == typeof(AppDbContext))
                .ToList();
            foreach (var d in toRemove)
                services.Remove(d);

            // Register AppDbContext via a factory lambda instead of AddDbContext.
            // This makes EF Core build an isolated internal service provider from
            // the options object alone — it never scans the application DI for
            // IDatabaseProvider registrations, so the SqlServer provider that
            // Program.cs registered cannot conflict with InMemory.
            var dbName = _dbName;
            services.AddScoped<AppDbContext>(_ =>
            {
                var options = new DbContextOptionsBuilder<AppDbContext>()
                    .UseInMemoryDatabase(dbName)
                    .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                    .Options;
                return new AppDbContext(options);
            });
        });

        builder.UseEnvironment("Testing");
    }
}
