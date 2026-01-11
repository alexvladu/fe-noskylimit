import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faCog, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { SettingsModalComponent } from './settings-modal/settings-modal';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    SettingsModalComponent
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  faEnvelope = faEnvelope;
  faCog = faCog;
  faUserCircle = faUserCircle;

  showSettings = signal(false);

  openSettings() {
    this.showSettings.set(true);
  }

  closeSettings() {
    this.showSettings.set(false);
  }

  onLogout() {
    // Clear your auth (adjust to your auth service if you have one)
    localStorage.clear();
    sessionStorage.clear();
    // Or: this.authService.logout();

    this.closeSettings();
    this.router.navigate(['/login']);
  }

  constructor(private router: Router) { }
}
