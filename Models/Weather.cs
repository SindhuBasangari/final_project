namespace WeatherApp.API.Models
{
    public class Weather
    {
        public string City { get; set; }
        public CurrentWeather Current { get; set; }
        public List<DailyForecast> Forecast { get; set; }
    }

    public class CurrentWeather
    {
        public double Temperature { get; set; }
        public double Humidity { get; set; }
        public double WindSpeed { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class DailyForecast
    {
        public DateTime Date { get; set; }
        public double MaxTemp { get; set; }
        public double MinTemp { get; set; }
        public double Humidity { get; set; }
        public double WindSpeed { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
    }
} 