import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroment';

export interface MatchDto {
  id: number;
  userId: number;
  matchedUserId: number;
  isMutual: boolean;
  createdAt: string;
  matchedUserDetails?: MatchedUserDto;
}

export interface MatchedUserDto {
  id: number;
  firstName: string;
  lastName: string;
  age?: number;
  location?: string;
  bio?: string;
  profilePhotoUrl?: string;
}

export interface AddMatchRequest {
  matchedUserId: number;
}

export interface MatchResponse {
  id: number;
  isMutual: boolean;
  message: string;
  matchedUser?: {
    id: number;
    firstName: string;
    lastName: string;
    profilePhotoUrl?: string;
  };
}

export interface RandomUserDto {
  id: number;
  firstName: string;
  lastName: string;
  age?: number;
  height?: number;
  location?: string;
  bio?: string;
  photos: Array<{ id: number; imageUrl: string }>;
}

export interface CheckMatchResponse {
  isMatched: boolean;
  isMutual: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private baseUrl = `${environment.baseUrl}api/matches`;

  constructor(private http: HttpClient) { }

  /**
   * Creates a new match (like) with another user.
   */
  createMatch(matchedUserId: number): Observable<MatchResponse> {
    const request: AddMatchRequest = { matchedUserId };
    return this.http.post<MatchResponse>(this.baseUrl, request);
  }

  /**
   * Gets all matches for the current user.
   */
  getCurrentUserMatches(): Observable<MatchDto[]> {
    return this.http.get<MatchDto[]>(`${this.baseUrl}/current-user`);
  }

  /**
   * Gets only mutual matches for the current user.
   */
  getCurrentUserMutualMatches(): Observable<MatchDto[]> {
    return this.http.get<MatchDto[]>(`${this.baseUrl}/current-user/mutual`);
  }

  /**
   * Checks if the current user has matched with a specific user.
   */
  checkMatch(otherUserId: number): Observable<CheckMatchResponse> {
    return this.http.get<CheckMatchResponse>(`${this.baseUrl}/check/${otherUserId}`);
  }

  /**
   * Deletes a match (unlike).
   */
  deleteMatch(matchId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${matchId}`);
  }

  /**
   * Adds a dislike for a user (swipe left).
   */
  addDislike(dislikedUserId: number): Observable<MatchResponse> {
    return this.http.post<MatchResponse>(`${this.baseUrl}/dislike/${dislikedUserId}`, {});
  }

  /**
   * Gets a random unmatched user for swiping.
   */
  getRandomUnmatchedUser(): Observable<RandomUserDto> {
    return this.http.get<RandomUserDto>(`${this.baseUrl}/random-unmatched`);
  }
}
