using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Infrastructure;
using RezervacijaVjencanja.Data;
using RezervacijaVjencanja.GraphQL;
using RezervacijaVjencanja.Middleware;
using RezervacijaVjencanja.Services.BandMembers;
using RezervacijaVjencanja.Services.CatalogItems;
using RezervacijaVjencanja.Services.Documents;
using RezervacijaVjencanja.Services.Partners;
using RezervacijaVjencanja.Services.PartnerTypes;
using RezervacijaVjencanja.Services.PricingRules;
using RezervacijaVjencanja.Services.Settings;
using RezervacijaVjencanja.Services.WeddingPartners;
using RezervacijaVjencanja.Services.WeddingTemplates;
using RezervacijaVjencanja.Services.Weddings;
using Scalar.AspNetCore;

QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// -- Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// -- Services (unchanged)
builder.Services.AddScoped<IPartnerTypeService, PartnerTypeService>();
builder.Services.AddScoped<IPartnerService, PartnerService>();
builder.Services.AddScoped<ICatalogItemService, CatalogItemService>();
builder.Services.AddScoped<IPricingRuleService, PricingRuleService>();
builder.Services.AddScoped<IBandMemberService, BandMemberService>();
builder.Services.AddScoped<IWeddingService, WeddingService>();
builder.Services.AddScoped<IWeddingTemplateService, WeddingTemplateService>();
builder.Services.AddScoped<IWeddingPartnerService, WeddingPartnerService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();

// -- REST API
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// -- GraphQL (HotChocolate)
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>();

// -- Auth0 JWT Bearer authentication
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Auth0:Authority"];
        options.Audience  = builder.Configuration["Auth0:Audience"];
    });

builder.Services.AddAuthorization();

// -- CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// -- Auto-migrate and seed on startup (skip in test environment)
if (!app.Environment.IsEnvironment("Testing"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    await DbSeeder.SeedAsync(db);
}

// -- Middleware pipeline
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseCors("ReactApp");

// Scalar REST API docs
app.MapOpenApi();
app.MapScalarApiReference(options =>
{
    options.Title = "Rezervacija Vjencanja API";
    options.Theme = ScalarTheme.Purple;
});

// Authentication MUST come before Authorization
app.UseAuthentication();
app.UseAuthorization();

// REST controllers (unchanged)
app.MapControllers();

// GraphQL endpoint + Banana Cake Pop IDE
app.MapGraphQL("/graphql");

app.Run();

// Expose Program for WebApplicationFactory in test projects
public partial class Program { }
