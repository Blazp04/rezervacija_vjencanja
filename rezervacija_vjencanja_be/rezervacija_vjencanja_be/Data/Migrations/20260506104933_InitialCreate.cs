using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace rezervacija_vjencanja_be.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PartnerTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    HasBooking = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartnerTypes", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "PartnerTypes",
                columns: new[] { "Id", "HasBooking", "Name" },
                values: new object[] { 1, true, "BAND" });

            migrationBuilder.InsertData(
                table: "PartnerTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 2, "FLORIST" },
                    { 3, "PASTRY" }
                });

            migrationBuilder.InsertData(
                table: "PartnerTypes",
                columns: new[] { "Id", "HasBooking", "Name" },
                values: new object[,]
                {
                    { 4, true, "PHOTOGRAPHER" },
                    { 5, true, "VENUE" }
                });

            migrationBuilder.InsertData(
                table: "PartnerTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 6, "CATERING" },
                    { 7, "GENERIC" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_PartnerTypes_Name",
                table: "PartnerTypes",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PartnerTypes");
        }
    }
}
