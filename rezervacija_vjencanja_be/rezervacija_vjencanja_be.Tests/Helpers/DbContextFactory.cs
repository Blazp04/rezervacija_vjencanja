using Microsoft.EntityFrameworkCore;
using RezervacijaVjencanja.Data;

namespace RezervacijaVjencanja.Tests.Helpers;




public static class DbContextFactory
{
    public static AppDbContext Create(string? dbName = null)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }
}
