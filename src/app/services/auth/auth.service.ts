import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../enviroment';
import { LoginDto } from '../../interfaces/login-dto';
import { LoginResponse } from '../../interfaces/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  register(user: { name: string; email: string; password: string }): Observable<any> {
    // Replace with actual HTTP request logic
    return of({ success: true });
  }
  private apiUrl = environment.baseUrl;
  private http = inject(HttpClient);

  login(loginDto: LoginDto): Observable<LoginResponse> {
    console.log(loginDto);
    return this.http.post<LoginResponse>(`${this.apiUrl}api/login`, loginDto);
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
