import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  error = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  onLogin() {
    this.error = '';
    this.isLoading = true;

    if (!this.email || !this.password) {
      this.error = 'Complete both fields.';
      this.isLoading = false;
      return;
    }

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response: any) => {
        if (response && response.token) {
          this.authService.saveToken(response.token);
          this.router.navigate(['/']);
        } else {
          this.error = 'Login successful but no token received.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        this.error = err?.error?.message || 'Access denied. Check your credentials.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
