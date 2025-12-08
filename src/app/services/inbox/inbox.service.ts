import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

interface MessageDto {
  id: number;
  text: string;
  senderId: number;
  recipientId: number;
}

interface AddMessageRequest {
  text: string;
  senderId: number;
  recipientId: number;
}

interface EditMessageRequest {
  id: number;
  content: string;
}

interface DeleteMessageRequest {
  id: number;
}

interface GetMessagesBetween2UsersRequest {
  firstUserId: number;
  secondUserId: number;
}

interface GetPaginatedMessagesBetween2UsersRequest {
  pageNumber: number;
  pageSize: number;
}

interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class InboxService {
  private apiUrl = 'http://localhost:5098/api/messages'; // URL-ul backend-ului

  constructor(private http: HttpClient) { }

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
}
