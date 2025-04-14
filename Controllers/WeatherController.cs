using Microsoft.AspNetCore.Mvc;
using WeatherApp.API.Models;
using System.Net.Http;
using System.Threading.Tasks;
using System.Diagnostics;
using Newtonsoft.Json;

namespace WeatherApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<WeatherController> _logger;
        private const string ApiKey = "78a038f36dca153be1fe62102493f81b";

        public WeatherController(IHttpClientFactory httpClientFactory, ILogger<WeatherController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [HttpGet("{city}")]
        public async Task<ActionResult<Weather>> GetWeather(string city)
        {
            var stopwatch = Stopwatch.StartNew();
            try
            {
                var client = _httpClientFactory.CreateClient();
                
                _logger.LogInformation($"Starting geocoding API call for city: {city}");
                var geoStopwatch = Stopwatch.StartNew();
                
                // First, get coordinates using geocoding API
                var geoResponse = await client.GetAsync($"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={ApiKey}");
                
                _logger.LogInformation($"Geocoding API call completed in {geoStopwatch.ElapsedMilliseconds}ms");
                
                if (!geoResponse.IsSuccessStatusCode)
                {
                    return NotFound($"City not found: {city}");
                }

                var geoContent = await geoResponse.Content.ReadAsStringAsync();
                var geoData = JsonConvert.DeserializeObject<dynamic[]>(geoContent);
                
                if (geoData == null || geoData.Length == 0)
                {
                    return NotFound($"City not found: {city}");
                }

                var lat = (double)geoData[0].lat;
                var lon = (double)geoData[0].lon;
                var cityName = (string)geoData[0].name;

                _logger.LogInformation($"Starting weather API call for coordinates: {lat}, {lon}");
                var weatherStopwatch = Stopwatch.StartNew();

                // Get current weather and forecast using 2.5 version API
                var weatherResponse = await client.GetAsync($"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units=metric&appid={ApiKey}");
                
                _logger.LogInformation($"Weather API call completed in {weatherStopwatch.ElapsedMilliseconds}ms");

                if (!weatherResponse.IsSuccessStatusCode)
                {
                    return StatusCode((int)weatherResponse.StatusCode, "Error fetching weather data");
                }

                var content = await weatherResponse.Content.ReadAsStringAsync();
                dynamic weatherData = JsonConvert.DeserializeObject(content);

                var weather = new Weather
                {
                    City = cityName,
                    Current = new CurrentWeather
                    {
                        Temperature = Math.Round((double)weatherData.list[0].main.temp, 1),
                        Humidity = (double)weatherData.list[0].main.humidity,
                        WindSpeed = Math.Round((double)weatherData.list[0].wind.speed, 1),
                        Description = (string)weatherData.list[0].weather[0].description,
                        Icon = (string)weatherData.list[0].weather[0].icon,
                        Timestamp = DateTimeOffset.FromUnixTimeSeconds((long)weatherData.list[0].dt).DateTime
                    },
                    Forecast = new List<DailyForecast>()
                };

                // Add forecast for next 4 days
                for (int i = 0; i < 4; i++)
                {
                    var day = weatherData.list[i * 8]; // Get one reading per day (every 8 readings)
                    weather.Forecast.Add(new DailyForecast
                    {
                        Date = DateTimeOffset.FromUnixTimeSeconds((long)day.dt).DateTime,
                        MaxTemp = Math.Round((double)day.main.temp_max, 1),
                        MinTemp = Math.Round((double)day.main.temp_min, 1),
                        Humidity = (double)day.main.humidity,
                        WindSpeed = Math.Round((double)day.wind.speed, 1),
                        Description = (string)day.weather[0].description,
                        Icon = (string)day.weather[0].icon
                    });
                }

                stopwatch.Stop();
                _logger.LogInformation($"Total request completed in {stopwatch.ElapsedMilliseconds}ms");

                return Ok(weather);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError($"Error processing request after {stopwatch.ElapsedMilliseconds}ms: {ex.Message}");
                return StatusCode(500, $"Error fetching weather data: {ex.Message}");
            }
        }
    }
} 