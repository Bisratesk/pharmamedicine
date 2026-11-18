using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pharmacy.API.Migrations
{
    /// <inheritdoc />
    public partial class SyncPharmacies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PharmacyEntity_AspNetUsers_OwnerId",
                table: "PharmacyEntity");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PharmacyEntity",
                table: "PharmacyEntity");

            migrationBuilder.RenameTable(
                name: "PharmacyEntity",
                newName: "Pharmacies");

            migrationBuilder.RenameIndex(
                name: "IX_PharmacyEntity_OwnerId",
                table: "Pharmacies",
                newName: "IX_Pharmacies_OwnerId");

            migrationBuilder.RenameIndex(
                name: "IX_PharmacyEntity_LicenseNumber",
                table: "Pharmacies",
                newName: "IX_Pharmacies_LicenseNumber");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Pharmacies",
                table: "Pharmacies",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Pharmacies_AspNetUsers_OwnerId",
                table: "Pharmacies",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pharmacies_AspNetUsers_OwnerId",
                table: "Pharmacies");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Pharmacies",
                table: "Pharmacies");

            migrationBuilder.RenameTable(
                name: "Pharmacies",
                newName: "PharmacyEntity");

            migrationBuilder.RenameIndex(
                name: "IX_Pharmacies_OwnerId",
                table: "PharmacyEntity",
                newName: "IX_PharmacyEntity_OwnerId");

            migrationBuilder.RenameIndex(
                name: "IX_Pharmacies_LicenseNumber",
                table: "PharmacyEntity",
                newName: "IX_PharmacyEntity_LicenseNumber");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PharmacyEntity",
                table: "PharmacyEntity",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PharmacyEntity_AspNetUsers_OwnerId",
                table: "PharmacyEntity",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
