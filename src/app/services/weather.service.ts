import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  timestamp: Date;
}

export interface DailyForecast {
  date: Date;
  maxTemp: number;
  minTemp: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

export interface Weather {
  city: string;
  current: CurrentWeather;
  forecast: DailyForecast[];
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = '5d49677faemsha6de335676d94afp11521ajsn36ea3bb005e1'; // IMPORTANT: Verify this key is active on RapidAPI
  private apiUrl = 'https://weatherapi-com.p.rapidapi.com';

  constructor(private http: HttpClient) {}

  getWeather(city: string): Observable<Weather> {
    const headers = new HttpHeaders({
      'X-RapidAPI-Key': this.apiKey,
      'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
    });

    const options = {
      headers: headers,
      params: {
        q: city,
        days: '5' // Fetching 5 days for forecast
      }
    };

    // Use forecast.json endpoint
    return this.http.get<any>(`${this.apiUrl}/forecast.json`, options).pipe(
      map(response => {
        // --- Map the raw API response to the Weather interface ---
        if (!response || !response.location || !response.current || !response.forecast || !response.forecast.forecastday) {
          throw new Error('Invalid API response structure');
        }

        const current: CurrentWeather = {
          temperature: response.current.temp_c,
          humidity: response.current.humidity,
          windSpeed: response.current.wind_kph,
          description: response.current.condition.text,
          icon: response.current.condition.icon,
          timestamp: new Date(response.location.localtime_epoch * 1000) // Convert epoch to Date
        };

        const forecast: DailyForecast[] = response.forecast.forecastday.map((day: any) => ({
          date: new Date(day.date_epoch * 1000),
          maxTemp: day.day.maxtemp_c,
          minTemp: day.day.mintemp_c,
          humidity: day.day.avghumidity,
          windSpeed: day.day.maxwind_kph,
          description: day.day.condition.text,
          icon: day.day.condition.icon
        }));

        const weatherData: Weather = {
          city: `${response.location.name}, ${response.location.region || response.location.country}`,
          current: current,
          forecast: forecast
        };
        return weatherData;
        // --- End mapping ---
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error Details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          headers: error.headers,
          url: error.url,
          message: error.message
        });

        let errorMessage = 'Failed to fetch weather data. Please try again.';

        if (error instanceof Error && error.message === 'Invalid API response structure') {
            errorMessage = 'Received an unexpected response from the weather service.';
        } else if (error.status === 0) {
          errorMessage = 'Network error: Could not connect. Please check your internet connection.';
        } else if (error.status === 404 || error.error?.error?.code === 1006) { // WeatherAPI specific code for no location found
          errorMessage = `City '${city}' not found. Please check the spelling.`;
        } else if (error.status === 401 || error.status === 403) { // 403 can also mean invalid key/host on RapidAPI
          errorMessage = 'Authentication failed. Please check the API key configuration.';
        } else if (error.status === 429) {
          errorMessage = 'API request limit reached. Please try again later.';
        } else if (error.error?.error?.message) { // Check for error message within the API's error object
          errorMessage = `API Error: ${error.error.error.message}`;
        } else if (error.message) {
          errorMessage = error.message; // Use error message if available
        }

        // Pass the user-friendly message
        return throwError(() => new Error(errorMessage));
      })
    );
  }
} 