import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroment';
import { AuthService } from '../auth/auth.service';

export interface MessageDto {
  id: number;
  text: string;
  senderId: number;
  recipientId: number;
  timestamp?: string;
  sender?: { id: number; firstName: string; lastName: string };
  recipient?: { id: number; firstName: string; lastName: string };
}

export interface AddMessageRequest {
  text: string;
  senderId: number;
  recipientId: number;
}

export interface EditMessageRequest {
  id: number;
  text: string;
}

export interface DeleteMessageRequest {
  id: number;
}

export interface GetMessagesBetween2UsersRequest {
  firstUserId: number;
  secondUserId: number;
}

export interface GetPaginatedMessagesBetween2UsersRequest {
  pageNumber: number;
  pageSize: number;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class InboxService {
  private apiUrl = `${environment.baseUrl}api/messages`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Get all messages
  getAllMessages(): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(this.apiUrl);
  }

  // Get message by ID
  getMessageById(id: number): Observable<MessageDto> {
    return this.http.get<MessageDto>(`${this.apiUrl}/${id}`);
  }

  // Add new message
  addMessage(request: AddMessageRequest): Observable<MessageDto> {
    return this.http.post<MessageDto>(this.apiUrl, request);
  }

  // Update message
  updateMessage(id: number, request: EditMessageRequest): Observable<MessageDto> {
    return this.http.put<MessageDto>(`${this.apiUrl}/${id}`, request);
  }

  // Delete message
  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get messages between two users
  getMessagesBetween2Users(firstUserId: number, secondUserId: number): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(`${this.apiUrl}/users/${firstUserId}/users/${secondUserId}`);
  }

  // Get paginated messages between two users
  getPaginatedMessagesBetween2Users(
    recipientId: number,
    request: GetPaginatedMessagesBetween2UsersRequest
  ): Observable<PagedResponse<MessageDto>> {
    let params = new HttpParams()
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString());

    return this.http.get<PagedResponse<MessageDto>>(
      `${this.apiUrl}/users/${recipientId}/paginated`,
      { params }
    );
  }

  /**
   * Extract userId from JWT token claims
   */
  getCurrentUserId(): number | null {
    const token = this.authService.getToken();
    if (!token) return null;

    try {
      const payload = this.parseJwt(token);
      return payload?.userId ? parseInt(payload.userId, 10) : null;
    } catch (e) {
      console.error('Error parsing JWT token:', e);
      return null;
    }
  }

  /**
   * Parse JWT token to extract claims
   */
  private parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }
}

