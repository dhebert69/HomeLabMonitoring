namespace HomeLabMonitoring.Api.Services;

public class PrometheusParser{
    private List<PrometheusMetric> PrometheusMetrics = new();

    public void Parse(string rawText){
        string[] lines = rawText.Split('\n');
        foreach (string line in lines){
            if(string.IsNullOrWhiteSpace(line) || line[0] == '#') continue;
            else{
                var parts = line.Split(' ');
                string name = string.Empty;
                Dictionary<string, string> labels = new Dictionary<string, string>();
                double value = double.Parse(parts[1]);
                if(parts[0].Contains("{")){
                    var nameAndLabels = parts[0].Split('{');
                    name = nameAndLabels[0];

                    var labelsRaw = nameAndLabels[1].TrimEnd('}');
                    var labelsParts = labelsRaw.Split(',');
                    foreach (string label in labelsParts){
                        var keyAndValue = label.Split('=');
                        var key = keyAndValue[0];
                        var labelValue = keyAndValue[1].Trim('"');
                        labels.Add(key, labelValue);
                    }
                }
                else{
                    name = parts[0];
                    labels = new Dictionary<string, string>();
                }
                PrometheusMetric metric = new PrometheusMetric(name, labels, value);
                PrometheusMetrics.Add(metric);
            }
        }
    }

    public PrometheusMetric? GetMetric(string name, Dictionary<string, string>? labels){
        return PrometheusMetrics.FirstOrDefault(metric => metric.Name == name && (labels == null || labels.All(filter => metric.Labels.ContainsKey(filter.Key) && metric.Labels[filter.Key] == filter.Value)));
    }
}