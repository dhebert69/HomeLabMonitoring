using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeLabMonitoring.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddNetworkSpeedColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "NetworkDownloadSpeed",
                table: "HostMetrics",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "NetworkUploadSpeed",
                table: "HostMetrics",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NetworkDownloadSpeed",
                table: "HostMetrics");

            migrationBuilder.DropColumn(
                name: "NetworkUploadSpeed",
                table: "HostMetrics");
        }
    }
}
