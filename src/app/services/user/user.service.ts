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
    gender?: string; // 'Male', 'Female', 'NonBinary' from backend
    city?: string;
    bio?: string;
    relationshipGoal?: string; // 'CasualDating', 'SeriousRelationship', 'Marriage' from backend
    sexualOrientation?: string; // 'Straight', 'Gay', 'Lesbian', 'Bisexual', 'Other' from backend
    preferredAgeMin?: number;
    preferredAgeMax?: number;
    photos?: string[]; // Base64 encoded strings
    languages?: string[]; // Language names from backend
    interests?: string[]; // Interest names from backend
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
