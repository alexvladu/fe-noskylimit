import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../enviroment';

export interface MatchNotification {
  isMutual: boolean;
  matchedUser: {
    id: number;
    firstName: string;
    lastName: string;
    profilePhotoUrl?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection: signalR.HubConnection | null = null;
  private matchNotificationSubject = new Subject<MatchNotification>();

  // Observable that components can subscribe to
  public matchNotification$ = this.matchNotificationSubject.asObservable();

  constructor() { }

  /**
   * Start SignalR connection
   */
  public startConnection(token: string): void {
    if (this.hubConnection) {
      console.log('SignalR connection already exists');
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.baseUrl}hubs/notifications`, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR Connected!');
        this.registerEventHandlers();
      })
      .catch(err => console.error('Error while starting SignalR connection: ', err));
  }

  /**
   * Register event handlers for SignalR messages
   */
  private registerEventHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('ReceiveMatchNotification', (notification: MatchNotification) => {
      console.log('Received match notification:', notification);
      this.matchNotificationSubject.next(notification);
    });
  }

  /**
   * Stop SignalR connection
   */
  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => console.log('SignalR Disconnected'))
        .catch(err => console.error('Error while stopping SignalR connection: ', err));
      this.hubConnection = null;
    }
  }

  /**
   * Check if connection is active
   */
  public isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }
}

