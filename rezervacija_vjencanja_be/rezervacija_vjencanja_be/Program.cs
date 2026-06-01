using Microsoft.EntityFrameworkCore;
using QuestPDF.Infrastructure;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.Middleware;
using RezervacijaVjencanja.Services.CatalogItems;
using RezervacijaVjencanja.Services.Documents;
using RezervacijaVjencanja.Services.Partners;
using RezervacijaVjencanja.Services.PartnerTypes;
using RezervacijaVjencanja.Services.PricingRules;
using RezervacijaVjencanja.Services.WeddingPartners;
using RezervacijaVjencanja.Services.WeddingTemplates;
using RezervacijaVjencanja.Services.Weddings;
using Scalar.AspNetCore;

QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// -- Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// -- Services
builder.Services.AddScoped<IPartnerTypeService, PartnerTypeService>();
builder.Services.AddScoped<IPartnerService, PartnerService>();
builder.Services.AddScoped<ICatalogItemService, CatalogItemService>();
builder.Services.AddScoped<IPricingRuleService, PricingRuleService>();
builder.Services.AddScoped<IWeddingService, WeddingService>();
builder.Services.AddScoped<IWeddingTemplateService, WeddingTemplateService>();
builder.Services.AddScoped<IWeddingPartnerService, WeddingPartnerService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();

// -- API
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// -- CORS (React dev server)
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
        policy.SetIsOriginAllowed(origin =>
        {
            var uri = new Uri(origin);
            return uri.Host == "localhost";
        })
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

// -- Auto-migrate on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// -- Middleware pipeline
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseCors("ReactApp");

// Scalar API docs
app.MapOpenApi();
app.MapScalarApiReference(options =>
{
    options.Title = "Rezervacija Vjencanja API";
    options.Theme = ScalarTheme.Purple;
});

app.UseAuthorization();
app.MapControllers();
app.Run();
