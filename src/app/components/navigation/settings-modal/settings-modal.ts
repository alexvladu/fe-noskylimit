// src/app/navigation/settings-modal/settings-modal.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faKey, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './settings-modal.component.html',
  styleUrl: './settings-modal.component.scss'
})
export class SettingsModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  faTimes = faTimes;
  faKey = faKey;
  faSignOutAlt = faSignOutAlt;

  showPasswordForm = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  error = '';
  success = '';

  openChangePassword() {
    this.showPasswordForm = true;
    this.error = '';
    this.success = '';
  }

  cancelChangePassword() {
    this.showPasswordForm = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.error = '';
    this.success = '';
  }

  submitChangePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'New passwords do not match';
      return;
    }
    if (this.newPassword.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    // TODO: Call your auth service here
    // this.authService.changePassword(this.currentPassword, this.newPassword).subscribe(...)

    this.success = 'Password changed successfully!';
    this.error = '';

    setTimeout(() => {
      this.cancelChangePassword();
    }, 2000);
  }
}