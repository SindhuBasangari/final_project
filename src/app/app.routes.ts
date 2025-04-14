import { Routes } from '@angular/router';
import { WeatherSearchComponent } from './components/weather-search/weather-search.component';
import { WeatherComponent } from './components/weather/weather.component';
import { WeatherDetailsComponent } from './components/weather-details/weather-details.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'weather-search', component: WeatherSearchComponent },
  { path: 'weather/:city', component: WeatherComponent },
  { path: 'weather/:city/details', component: WeatherDetailsComponent }
];
