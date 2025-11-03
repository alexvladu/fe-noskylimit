import { inject, Injectable } from '@angular/core';
import { environment } from '../../../enviroment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PingService {
  private apiUrl = environment.baseUrl;
  private http = inject(HttpClient);

  ping(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}health`);
  }
}
