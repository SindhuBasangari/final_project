import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Weather, WeatherService } from '../../services/weather.service';

Chart.register(...registerables);

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    DatePipe
  ]
})
export class WeatherComponent implements OnInit, OnDestroy {
  @ViewChild('temperatureChart') temperatureChart!: ElementRef;
  
  city: string = '';
  error: string = '';
  weatherData: Weather | null = null;
  isLoading: boolean = false;
  chart: Chart | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private weatherService: WeatherService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.city = params['city'];
        if (this.city) {
          this.fetchWeatherData();
        } else {
          this.error = 'No city specified in the route.';
          this.isLoading = false;
        }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  fetchWeatherData() {
    this.isLoading = true;
    this.error = '';
    this.weatherData = null;
    if (this.chart) {
        this.chart.destroy();
        this.chart = null;
    }

    this.weatherService.getWeather(this.city)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Weather data received in component:', data);
          this.weatherData = data;
          this.isLoading = false;
          setTimeout(() => this.createChart(), 0);
        },
        error: (err) => {
          console.error('Error fetching weather in component:', err);
          this.error = err.message || 'An unknown error occurred while fetching weather data.';
          this.isLoading = false;
          this.snackBar.open(this.error, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  goBack() {
    this.router.navigate(['/weather-search']);
  }

  private createChart() {
    if (!this.weatherData?.forecast || !this.temperatureChart || !this.temperatureChart.nativeElement) {
        console.warn('Chart cannot be created. Missing data or canvas element.');
        return;
    }
    const ctx = this.temperatureChart.nativeElement.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D context from canvas element.');
        return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const dates = this.weatherData.forecast.map(day =>
      new DatePipe('en-US').transform(day.date, 'EEE') || ''
    );
    const maxTemps = this.weatherData.forecast.map(day => day.maxTemp);
    const minTemps = this.weatherData.forecast.map(day => day.minTemp);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Max Temperature',
            data: maxTemps,
            borderColor: '#e53935',
            backgroundColor: 'rgba(229, 57, 53, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Min Temperature',
            data: minTemps,
            borderColor: '#1e88e5',
            backgroundColor: 'rgba(30, 136, 229, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Temperature Forecast for ${this.weatherData.city}`,
            font: {
              size: 16
            }
          },
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Temperature (°C)'
            }
          }
        }
      }
    });
    console.log('Chart created successfully.');
  }
}