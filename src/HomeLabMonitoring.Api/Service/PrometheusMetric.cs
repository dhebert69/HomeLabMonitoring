namespace HomeLabMonitoring.Api.Services;

public class PrometheusMetric{
    public string Name { get; set; }
    public Dictionary<string, string> Labels { get; set; }
    public double Value { get; set; }

    public PrometheusMetric(string name, Dictionary<string, string>? labels, double value){
        Name = name;
        Labels = labels ?? new Dictionary<string, string>();
        Value = value;
    }
}