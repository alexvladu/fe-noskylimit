import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  isLoading = false;
  error = '';

  private router = inject(Router);

  onRegister() {
    this.error = '';
    this.isLoading = true;

    // Validate fields
    if (!this.name || !this.email || !this.password) {
      this.error = 'All fields are required.';
      this.isLoading = false;
      return;
    }

    // Basic validation
    if (!this.email.includes('@')) {
      this.error = 'Please enter a valid email address.';
      this.isLoading = false;
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters long.';
      this.isLoading = false;
      return;
    }

    // Split name into first and last name (simple approach)
    const nameParts = this.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || nameParts[0] || ''; // Use first name as last name if only one name provided

    // Store credentials in sessionStorage to pass to setup-profile
    const credentials = {
      firstName: firstName,
      lastName: lastName,
      email: this.email,
      password: this.password
    };

    sessionStorage.setItem('registrationCredentials', JSON.stringify(credentials));

    // Navigate to setup-profile to complete registration
    this.router.navigate(['/setup-profile']);
  }
}
