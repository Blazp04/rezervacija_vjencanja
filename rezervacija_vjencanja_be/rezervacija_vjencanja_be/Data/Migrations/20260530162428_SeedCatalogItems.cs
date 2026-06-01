using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace rezervacija_vjencanja_be.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedCatalogItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "PartnerCatalogItems",
                columns: new[] { "Id", "BasePrice", "Category", "CreatedAt", "Description", "IsActive", "ItemType", "Metadata", "Name", "PartnerId", "SortOrder" },
                values: new object[,]
                {
                    { 1, 800m, "Bend", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "SERVICE", null, "4-satna svirka", 1, 1 },
                    { 2, 1200m, "Bend", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "SERVICE", null, "6-satna svirka", 1, 2 },
                    { 3, 500m, "DJ", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "SERVICE", null, "DJ za plesnu muziku", 1, 3 },
                    { 4, 600m, "DJ", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "SERVICE", null, "DJ svirka (4h)", 2, 1 },
                    { 5, 1000m, "DJ", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "SERVICE", null, "DJ svirka (8h)", 2, 2 },
                    { 6, 1500m, "Dekoracija", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "SERVICE", null, "Dekoracija sale", 3, 1 },
                    { 7, 150m, "Cvijeće", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "PRODUCT", null, "Cvjetni aranžman za stol", 3, 2 },
                    { 8, 400m, "Torte", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "SERVICE", null, "Torta sa jagodama", 4, 1 },
                    { 9, 100m, "Kolačići", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "PRODUCT", null, "Kolačići (1kg)", 4, 2 },
                    { 10, 2000m, "Fotografija", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "SERVICE", null, "Fotografiranje (8h)", 5, 1 },
                    { 11, 500m, "Proizvodi", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "PRODUCT", null, "Foto album (100 str)", 5, 2 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "PartnerCatalogItems",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "PartnerCatalogItems",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "PartnerCatalogItems",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "PartnerCatalogItems",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "PartnerCatalogItems",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "PartnerCatalogItems",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "PartnerCatalogItems",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "PartnerCatalogItems",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "PartnerCatalogItems",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "PartnerCatalogItems",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "PartnerCatalogItems",
                keyColumn: "Id",
                keyValue: 11);
        }
    }
}
