import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroment';
import { LoginDto } from '../../interfaces/login-dto';

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.baseUrl;
  private http = inject(HttpClient);

  login(loginDto: LoginDto): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}api/login`, loginDto);
  }

  register(user: { name?: string; firstName?: string; lastName?: string; email: string; password: string }): Observable<LoginResponse> {
    const nameParts = user.name ? user.name.split(' ') : [];
    const firstName = user.firstName || nameParts[0] || '';
    const lastName = user.lastName || nameParts.slice(1).join(' ') || '';
    
    const request = {
      firstName,
      lastName,
      email: user.email,
      password: user.password
    };
    
    return this.http.post<LoginResponse>(`${this.apiUrl}api/auth/register`, request);
  }

  registerComplete(formData: FormData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}api/users/register`, formData);
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

