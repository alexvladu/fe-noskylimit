import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

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

  private authService = inject(AuthService);
  private router = inject(Router);

  onRegister() {
    this.error = '';
    this.isLoading = true;

    if (!this.name || !this.email || !this.password) {
      this.error = 'All fields are required.';
      this.isLoading = false;
      return;
    }

    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.error = 'Registration failed';
        this.isLoading = false;
      }
    });
  }
}
