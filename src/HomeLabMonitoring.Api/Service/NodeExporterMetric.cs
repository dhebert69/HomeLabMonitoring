public static class NodeExporterMetrics
{
    public const string CpuSecondsTotal = "node_cpu_seconds_total";
    public const string MemTotal = "node_memory_MemTotal_bytes";
    public const string MemAvailable = "node_memory_MemAvailable_bytes";
    public const string NetworkDownload = "node_network_receive_bytes_total";
    public const string NetworkUpload = "node_network_transmit_bytes_total";
    public const string Uptime = "node_boot_time_seconds";
    public const string LoadAverage1m = "node_load1";
    public const string LoadAverage5m = "node_load5";
    public const string LoadAverage15m = "node_load15";
    public const string FilesystemSize = "node_filesystem_size_bytes";
    public const string FilesystemAvail = "node_filesystem_avail_bytes";
}