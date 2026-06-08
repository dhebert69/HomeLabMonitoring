using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace HomeLabMonitoring.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DiskMetrics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MountPoint = table.Column<string>(type: "text", nullable: false),
                    Hostname = table.Column<string>(type: "text", nullable: false),
                    DiskTotal = table.Column<long>(type: "bigint", nullable: false),
                    DiskAvailable = table.Column<long>(type: "bigint", nullable: false),
                    CollectedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiskMetrics", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HostMetrics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    HostName = table.Column<string>(type: "text", nullable: false),
                    CPU = table.Column<double>(type: "double precision", nullable: false),
                    MemoryUsed = table.Column<long>(type: "bigint", nullable: false),
                    MemoryTotal = table.Column<long>(type: "bigint", nullable: false),
                    NetworkDownload = table.Column<long>(type: "bigint", nullable: false),
                    NetworkUpload = table.Column<long>(type: "bigint", nullable: false),
                    Uptime = table.Column<long>(type: "bigint", nullable: false),
                    LoadAverage1m = table.Column<double>(type: "double precision", nullable: false),
                    LoadAverage5m = table.Column<double>(type: "double precision", nullable: false),
                    LoadAverage15m = table.Column<double>(type: "double precision", nullable: false),
                    CollectedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HostMetrics", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DiskMetrics");

            migrationBuilder.DropTable(
                name: "HostMetrics");
        }
    }
}
