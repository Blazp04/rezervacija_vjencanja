using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rezervacija_vjencanja_be.Migrations
{
    /// <inheritdoc />
    public partial class AddSettingsAndPriceRange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PriceMax",
                table: "PartnerCatalogItems",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PriceMin",
                table: "PartnerCatalogItems",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AgencySettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false, defaultValue: ""),
                    Oib = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AgencySettings", x => x.Id);
                });

            migrationBuilder.AddCheckConstraint(
                name: "CHK_PartnerCatalogItems_PriceMax",
                table: "PartnerCatalogItems",
                sql: "PriceMax IS NULL OR PriceMax >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CHK_PartnerCatalogItems_PriceMin",
                table: "PartnerCatalogItems",
                sql: "PriceMin IS NULL OR PriceMin >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CHK_PartnerCatalogItems_PriceRange",
                table: "PartnerCatalogItems",
                sql: "PriceMin IS NULL OR PriceMax IS NULL OR PriceMin <= PriceMax");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AgencySettings");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_PartnerCatalogItems_PriceMax",
                table: "PartnerCatalogItems");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_PartnerCatalogItems_PriceMin",
                table: "PartnerCatalogItems");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_PartnerCatalogItems_PriceRange",
                table: "PartnerCatalogItems");

            migrationBuilder.DropColumn(
                name: "PriceMax",
                table: "PartnerCatalogItems");

            migrationBuilder.DropColumn(
                name: "PriceMin",
                table: "PartnerCatalogItems");
        }
    }
}
