import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroment';

@Injectable({
  providedIn: 'root'
})
export class SetupProfileService {
  private apiUrl = environment.baseUrl;
  private http = inject(HttpClient);

  /**
   * Register a new user with complete profile using the backend's register endpoint
   * POST /api/users/register
   * Accepts multipart/form-data with all user information including credentials and photos
   */
  registerUserWithProfile(formData: FormData): Observable<any> {
    return this.http.post(
      `${this.apiUrl}api/users/register`,
      formData
    );
  }

  // Fetching hobbies from backend (TODO: backend needs to implement this endpoint)
  getAvailableHobbies(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}api/hobbies`);
  }

  // Fetching languages from backend (TODO: backend needs to implement this endpoint)
  getAvailableLanguages(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}api/languages`);
  }
}

