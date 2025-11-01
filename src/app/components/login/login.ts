import { ChangeDetectorRef, Component, inject, NgZone, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class LoginComponent{
  email = '';
  password = '';
  isLoading = false;
  error = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  onSubmit() {
    this.error = '';
    this.isLoading = true;

    if (!this.email || !this.password) {
      this.error = 'Completează ambele câmpuri.';
      return;
    }

    this.authService.login({
      email: this.email,
      password: this.password
    })
    .subscribe({
      next: (response:LoginResponse) => {
        this.authService.saveToken(response.token);
        this.router.navigate(['/']);
      },
      error: (err:any) => {
        this.error="Access denied";
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}