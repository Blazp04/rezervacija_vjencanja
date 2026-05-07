using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rezervacija_vjencanja_be.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAllDomainTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "PartnerTypes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "PartnerTypes",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETDATE()");

            migrationBuilder.AddColumn<string>(
                name: "FieldSchema",
                table: "PartnerTypes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Partners",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PartnerTypeId = table.Column<int>(type: "int", nullable: false),
                    CommissionPercent = table.Column<decimal>(type: "decimal(5,2)", nullable: false, defaultValue: 0m),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExtraFields = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Partners", x => x.Id);
                    table.CheckConstraint("CHK_Partners_Commission", "CommissionPercent >= 0 AND CommissionPercent <= 100");
                    table.CheckConstraint("CHK_Partners_ExtraFields_JSON", "ExtraFields IS NULL OR ISJSON(ExtraFields) = 1");
                    table.ForeignKey(
                        name: "FK_Partners_PartnerTypes_PartnerTypeId",
                        column: x => x.PartnerTypeId,
                        principalTable: "PartnerTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WeddingTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequiredPartnerTypes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DefaultNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActivityOrder = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeddingTemplates", x => x.Id);
                    table.CheckConstraint("CHK_WeddingTemplates_ActivityOrder_JSON", "ActivityOrder IS NULL OR ISJSON(ActivityOrder) = 1");
                    table.CheckConstraint("CHK_WeddingTemplates_PartnerTypes_JSON", "RequiredPartnerTypes IS NULL OR ISJSON(RequiredPartnerTypes) = 1");
                });

            migrationBuilder.CreateTable(
                name: "BandMembers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PartnerId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BandMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BandMembers_Partners_PartnerId",
                        column: x => x.PartnerId,
                        principalTable: "Partners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PartnerCatalogItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PartnerId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ItemType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "SERVICE"),
                    BasePrice = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    Metadata = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartnerCatalogItems", x => x.Id);
                    table.CheckConstraint("CHK_PartnerCatalogItems_BasePrice", "BasePrice IS NULL OR BasePrice >= 0");
                    table.CheckConstraint("CHK_PartnerCatalogItems_ItemType", "ItemType IN ('SERVICE', 'PRODUCT', 'SONG')");
                    table.CheckConstraint("CHK_PartnerCatalogItems_Metadata", "Metadata IS NULL OR ISJSON(Metadata) = 1");
                    table.ForeignKey(
                        name: "FK_PartnerCatalogItems_Partners_PartnerId",
                        column: x => x.PartnerId,
                        principalTable: "Partners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Weddings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TemplateId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "PREPARATION"),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Weddings", x => x.Id);
                    table.CheckConstraint("CHK_Weddings_Status", "Status IN ('PREPARATION', 'CONFIRMED', 'COMPLETED', 'CANCELLED')");
                    table.ForeignKey(
                        name: "FK_Weddings_WeddingTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "WeddingTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PricingRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CatalogItemId = table.Column<int>(type: "int", nullable: false),
                    RuleType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DayOfWeek = table.Column<byte>(type: "tinyint", nullable: true),
                    SpecificDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    ValidFrom = table.Column<DateOnly>(type: "date", nullable: true),
                    ValidTo = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PricingRules", x => x.Id);
                    table.CheckConstraint("CHK_PricingRules_DateRange", "ValidFrom IS NULL OR ValidTo IS NULL OR ValidFrom <= ValidTo");
                    table.CheckConstraint("CHK_PricingRules_DayOfWeek", "DayOfWeek IS NULL OR (DayOfWeek >= 1 AND DayOfWeek <= 7)");
                    table.CheckConstraint("CHK_PricingRules_Price", "Price >= 0");
                    table.CheckConstraint("CHK_PricingRules_RuleType", "RuleType IN ('SPECIAL_DAY', 'SPECIFIC_DATE')");
                    table.ForeignKey(
                        name: "FK_PricingRules_PartnerCatalogItems_CatalogItemId",
                        column: x => x.CatalogItemId,
                        principalTable: "PartnerCatalogItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WeddingPartners",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WeddingId = table.Column<int>(type: "int", nullable: false),
                    PartnerId = table.Column<int>(type: "int", nullable: false),
                    CatalogItemId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "PROPOSED"),
                    PlannedPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    ActualPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    CommissionPercent = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeddingPartners", x => x.Id);
                    table.CheckConstraint("CHK_WeddingPartners_ActualPrice", "ActualPrice IS NULL OR ActualPrice >= 0");
                    table.CheckConstraint("CHK_WeddingPartners_CommissionPercent", "CommissionPercent IS NULL OR (CommissionPercent >= 0 AND CommissionPercent <= 100)");
                    table.CheckConstraint("CHK_WeddingPartners_Status", "Status IN ('PROPOSED', 'OFFERED', 'CONFIRMED', 'CANCELLED')");
                    table.ForeignKey(
                        name: "FK_WeddingPartners_PartnerCatalogItems_CatalogItemId",
                        column: x => x.CatalogItemId,
                        principalTable: "PartnerCatalogItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_WeddingPartners_Partners_PartnerId",
                        column: x => x.PartnerId,
                        principalTable: "Partners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WeddingPartners_Weddings_WeddingId",
                        column: x => x.WeddingId,
                        principalTable: "Weddings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PartnerId = table.Column<int>(type: "int", nullable: false),
                    WeddingId = table.Column<int>(type: "int", nullable: false),
                    WeddingPartnerId = table.Column<int>(type: "int", nullable: false),
                    StartDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.CheckConstraint("CHK_Bookings_DateRange", "EndDateTime > StartDateTime");
                    table.ForeignKey(
                        name: "FK_Bookings_Partners_PartnerId",
                        column: x => x.PartnerId,
                        principalTable: "Partners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bookings_WeddingPartners_WeddingPartnerId",
                        column: x => x.WeddingPartnerId,
                        principalTable: "WeddingPartners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bookings_Weddings_WeddingId",
                        column: x => x.WeddingId,
                        principalTable: "Weddings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "PartnerTypes",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Code", "CreatedAt", "FieldSchema", "Name" },
                values: new object[] { "BAND", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Bend / DJ" });

            migrationBuilder.UpdateData(
                table: "PartnerTypes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Code", "CreatedAt", "FieldSchema", "Name" },
                values: new object[] { "FLORIST", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Cvjećar" });

            migrationBuilder.UpdateData(
                table: "PartnerTypes",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Code", "CreatedAt", "FieldSchema", "Name" },
                values: new object[] { "PASTRY", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Slastičar" });

            migrationBuilder.UpdateData(
                table: "PartnerTypes",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Code", "CreatedAt", "FieldSchema", "Name" },
                values: new object[] { "PHOTOGRAPHER", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Fotograf / Snimatelj" });

            migrationBuilder.UpdateData(
                table: "PartnerTypes",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Code", "CreatedAt", "FieldSchema", "Name" },
                values: new object[] { "VENUE", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Sala / Dvorana" });

            migrationBuilder.UpdateData(
                table: "PartnerTypes",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Code", "CreatedAt", "FieldSchema", "Name" },
                values: new object[] { "CATERING", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Catering" });

            migrationBuilder.UpdateData(
                table: "PartnerTypes",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Code", "CreatedAt", "FieldSchema", "Name" },
                values: new object[] { "GENERIC", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Ostalo" });

            migrationBuilder.CreateIndex(
                name: "UQ_PartnerTypes_Code",
                table: "PartnerTypes",
                column: "Code",
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CHK_PartnerTypes_JSON",
                table: "PartnerTypes",
                sql: "FieldSchema IS NULL OR ISJSON(FieldSchema) = 1");

            migrationBuilder.CreateIndex(
                name: "IX_BandMembers_PartnerId",
                table: "BandMembers",
                column: "PartnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_DateRange",
                table: "Bookings",
                columns: new[] { "PartnerId", "StartDateTime", "EndDateTime" });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_PartnerId",
                table: "Bookings",
                column: "PartnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_WeddingId",
                table: "Bookings",
                column: "WeddingId");

            migrationBuilder.CreateIndex(
                name: "UQ_Bookings_WeddingPartner",
                table: "Bookings",
                column: "WeddingPartnerId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PartnerCatalogItems_IsActive",
                table: "PartnerCatalogItems",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_PartnerCatalogItems_ItemType",
                table: "PartnerCatalogItems",
                column: "ItemType");

            migrationBuilder.CreateIndex(
                name: "IX_PartnerCatalogItems_PartnerId",
                table: "PartnerCatalogItems",
                column: "PartnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Partners_IsActive",
                table: "Partners",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Partners_PartnerTypeId",
                table: "Partners",
                column: "PartnerTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_PricingRules_CatalogItemId",
                table: "PricingRules",
                column: "CatalogItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PricingRules_RuleType",
                table: "PricingRules",
                column: "RuleType");

            migrationBuilder.CreateIndex(
                name: "IX_WeddingPartners_CatalogItemId",
                table: "WeddingPartners",
                column: "CatalogItemId");

            migrationBuilder.CreateIndex(
                name: "IX_WeddingPartners_PartnerId",
                table: "WeddingPartners",
                column: "PartnerId");

            migrationBuilder.CreateIndex(
                name: "IX_WeddingPartners_Status",
                table: "WeddingPartners",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_WeddingPartners_WeddingId",
                table: "WeddingPartners",
                column: "WeddingId");

            migrationBuilder.CreateIndex(
                name: "IX_Weddings_DateTime",
                table: "Weddings",
                column: "DateTime");

            migrationBuilder.CreateIndex(
                name: "IX_Weddings_Status",
                table: "Weddings",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Weddings_TemplateId",
                table: "Weddings",
                column: "TemplateId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BandMembers");

            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "PricingRules");

            migrationBuilder.DropTable(
                name: "WeddingPartners");

            migrationBuilder.DropTable(
                name: "PartnerCatalogItems");

            migrationBuilder.DropTable(
                name: "Weddings");

            migrationBuilder.DropTable(
                name: "Partners");

            migrationBuilder.DropTable(
                name: "WeddingTemplates");

            migrationBuilder.DropIndex(
                name: "UQ_PartnerTypes_Code",
                table: "PartnerTypes");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_PartnerTypes_JSON",
                table: "PartnerTypes");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "PartnerTypes");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "PartnerTypes");

            migrationBuilder.DropColumn(
                name: "FieldSchema",
                table: "PartnerTypes");

            migrationBuilder.UpdateData(
                table: "PartnerTypes",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "BAND");

            migrationBuilder.UpdateData(
                table: "PartnerTypes",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "FLORIST");

            migrationBuilder.UpdateData(
                table: "PartnerTypes",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "PASTRY");

            migrationBuilder.UpdateData(
                table: "PartnerTypes",
                keyColumn: "Id",
                keyValue: 4,
                column: "Name",
                value: "PHOTOGRAPHER");

            migrationBuilder.UpdateData(
                table: "PartnerTypes",
                keyColumn: "Id",
                keyValue: 5,
                column: "Name",
                value: "VENUE");

            migrationBuilder.UpdateData(
                table: "PartnerTypes",
                keyColumn: "Id",
                keyValue: 6,
                column: "Name",
                value: "CATERING");

            migrationBuilder.UpdateData(
                table: "PartnerTypes",
                keyColumn: "Id",
                keyValue: 7,
                column: "Name",
                value: "GENERIC");
        }
    }
}
