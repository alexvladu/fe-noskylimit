import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroment';

export interface ProfilePhoto {
  id: number;
  url: string;
  isPrimary?: boolean;
}

export interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  age?: number;
  photos?: ProfilePhoto[];
  photoUrls?: string[]; // Alternative: if backend returns array of URLs directly
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.baseUrl;
  private http = inject(HttpClient);

  /**
   * Fetch potential matches/profiles for the home screen
   * GET /api/profiles/matches or /api/matches
   */
  getMatches(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.apiUrl}api/profiles/matches`);
  }

  /**
   * Alternative endpoint names to try:
   * - /api/matches
   * - /api/users/matches
   * - /api/profiles
   */
  getProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.apiUrl}api/matches`);
  }
}
