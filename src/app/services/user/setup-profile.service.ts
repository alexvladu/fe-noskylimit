import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroment';
import { SetupProfileDto, SetupProfileResponse } from '../../interfaces/setup-profile-dto';

@Injectable({
  providedIn: 'root'
})
export class SetupProfileService {
  private apiUrl = environment.baseUrl;
  private http = inject(HttpClient);

  // Complete user profile with FormData (including photos)
  completeProfile(userId: number, formData: FormData): Observable<SetupProfileResponse> {
    return this.http.put<SetupProfileResponse>(
      `${this.apiUrl}api/users/${userId}/setup-profile`,
      formData
    );
  }

  // JSON version of completeProfile
  completeProfileJson(userId: number, profileData: SetupProfileDto): Observable<SetupProfileResponse> {
    return this.http.put<SetupProfileResponse>(
      `${this.apiUrl}api/users/${userId}/setup-profile`,
      profileData
    );
  }

  // Upload photos to backend
  uploadPhotos(userId: number, photos: File[]): Observable<any> {
    const formData = new FormData();
    photos.forEach((photo, index) => {
      formData.append('photos', photo, photo.name);
    });

    return this.http.post(
      `${this.apiUrl}api/users/${userId}/photos`,
      formData
    );
  }

  // Fetching hobbies from backend
  getAvailableHobbies(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}api/hobbies`);
  }

  // Fetching languages from backend
  getAvailableLanguages(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}api/languages`);
  }
}

