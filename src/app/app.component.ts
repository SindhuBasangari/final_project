import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styles: [`
    .app-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    mat-toolbar {
      display: flex;
      justify-content: center;
    }
    .logout-button {
      background-color: #f44336 !important;
      color: white !important;
    }
  `]
})
export class AppComponent {
  title = 'Weather App';
  showLogoutButton = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.url === '/login' || event.url === '/registration') {
        this.showLogoutButton = false;
      } else {
        this.showLogoutButton = true;
      }
    });
  }

  logout() {
    console.log('Logging out...');
    this.router.navigate(['/login']);
  }
}
