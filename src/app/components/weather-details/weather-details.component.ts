import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { WeatherService, Weather } from '../../services/weather.service';

@Component({
  selector: 'app-weather-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatDividerModule, DatePipe],
  template: `
    <div class="details-container">
      <div *ngIf="isLoading" class="loading-spinner">
        <mat-spinner></mat-spinner>
        <p>Loading weather data...</p>
      </div>

      <div *ngIf="error" class="error-card">
        <mat-card>
          <mat-card-content>
            <p class="error-message">{{ error }}</p>
            <button mat-raised-button color="primary" (click)="goBack()">Back to Search</button>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="weather-card" *ngIf="weather && !isLoading">
        <mat-card-header>
          <mat-card-title>{{ weather.city }}</mat-card-title>
          <mat-card-subtitle>Current Weather</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="current-weather">
            <img [src]="'https:' + weather.current.icon" [alt]="weather.current.description">
            <div class="weather-info">
              <p class="temperature">{{ weather.current.temperature }}°C</p>
              <p class="description">{{ weather.current.description | titlecase }}</p>
              <div class="details">
                <p>Humidity: {{ weather.current.humidity }}%</p>
                <p>Wind Speed: {{ weather.current.windSpeed }} m/s</p>
              </div>
            </div>
          </div>

          <mat-divider class="divider"></mat-divider>

          <div class="forecast">
            <h3>5-Day Forecast</h3>
            <div class="forecast-grid">
              <div class="forecast-day" *ngFor="let day of weather.forecast">
                <p class="date">{{ day.date | date:'EEE, MMM d' }}</p>
                <img [src]="'https:' + day.icon" [alt]="day.description">
                <p class="temp-range">
                  <span class="max-temp">{{ day.maxTemp }}°C</span>
                  <span class="min-temp">{{ day.minTemp }}°C</span>
                </p>
                <p class="description">{{ day.description | titlecase }}</p>
              </div>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="goBack()">Back to Search</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .details-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #00b4db, #0083b0);
      padding: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .weather-card {
      width: 100%;
      max-width: 800px;
      padding: 2rem;
      text-align: center;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    .current-weather {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      margin: 2rem 0;
    }
    .current-weather img {
      width: 100px;
      height: 100px;
    }
    .weather-info {
      text-align: left;
    }
    .temperature {
      font-size: 3.5rem;
      margin: 0;
      font-weight: 300;
      line-height: 1;
    }
    .description {
      font-size: 1.5rem;
      margin: 0.5rem 0;
      text-transform: capitalize;
      color: #666;
    }
    .details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 1rem;
    }
    .details p {
      margin: 0;
      padding: 0.8rem;
      background: #f5f5f5;
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .divider {
      margin: 2rem 0;
    }
    .forecast {
      h3 {
        margin-bottom: 1.5rem;
        color: #333;
      }
    }
    .forecast-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
    }
    .forecast-day {
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 12px;
      .date {
        font-weight: 500;
        margin-bottom: 0.5rem;
      }
      .temp-range {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin: 0.5rem 0;
        .max-temp {
          color: #e53935;
        }
        .min-temp {
          color: #1e88e5;
        }
      }
      .description {
        font-size: 0.9rem;
        margin: 0;
        text-transform: capitalize;
      }
      img {
        width: 50px;
        height: 50px;
      }
    }
    .loading-spinner {
      text-align: center;
      color: white;
      p {
        margin-top: 1rem;
        font-size: 1.2rem;
      }
    }
    .error-card {
      width: 100%;
      max-width: 500px;
      mat-card {
        padding: 2rem;
        text-align: center;
        background: rgba(255, 255, 255, 0.95);
        .error-message {
          color: #f44336;
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
        }
      }
    }
  `]
})
export class WeatherDetailsComponent implements OnInit {
  weather: Weather | null = null;
  isLoading: boolean = false;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private weatherService: WeatherService
  ) {}

  ngOnInit() {
    const city = this.route.snapshot.paramMap.get('city');
    if (city) {
      this.isLoading = true;
      this.error = '';
      this.weatherService.getWeather(city).subscribe({
        next: (data) => {
          console.log('Weather data received:', data);
          this.weather = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching weather:', error);
          this.error = error.message || 'Failed to fetch weather data';
          this.isLoading = false;
        }
      });
    } else {
      this.error = 'No city specified';
    }
  }

  goBack() {
    this.router.navigate(['/weather-search']);
  }
} 