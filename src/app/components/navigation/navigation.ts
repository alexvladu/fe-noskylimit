import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faCog, faUserCircle, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
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
  faBars = faBars;
  faTimes = faTimes;

  showSettings = signal(false);
  mobileMenuOpen = signal(false);

  openSettings() {
    this.showSettings.set(true);
  }

  closeSettings() {
    this.showSettings.set(false);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  onLogout() {
    // Clear your auth (adjust to your auth service if you have one)
    localStorage.clear();
    sessionStorage.clear();
    // Or: this.authService.logout();

    this.closeSettings();
    this.closeMobileMenu();
    this.router.navigate(['/login']);
  }

  constructor(private router: Router) { }
}
