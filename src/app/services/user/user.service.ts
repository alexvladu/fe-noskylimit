import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroment';

export interface UserDto {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    age?: number;
    height?: number;
    gender?: number;
    city?: string;
    bio?: string;
    relationshipGoal?: number;
    sexualOrientation?: number;
    preferredAgeMin?: number;
    preferredAgeMax?: number;
    photos?: string[]; // Base64 encoded strings
    languages?: number[];
    interests?: number[];
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private baseUrl = `${environment.baseUrl}api/users`;

    constructor(private http: HttpClient) { }

    /**
     * Gets the current user's profile.
     */
    getCurrentUser(): Observable<UserDto> {
        return this.http.get<UserDto>(`${this.baseUrl}/me`);
    }

    /**
     * Updates user profile.
     */
    updateProfile(userId: number, formData: FormData): Observable<any> {
        return this.http.put(`${this.baseUrl}/${userId}/setup-profile`, formData);
    }
}
