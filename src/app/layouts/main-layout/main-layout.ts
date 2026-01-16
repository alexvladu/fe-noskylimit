import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '../../components/navigation/navigation';
import { NotificationService } from '../../services/notification/notification.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Initialize SignalR connection with JWT token
    const token = this.authService.getToken();
    if (token) {
      this.notificationService.startConnection(token);
    }
  }

  ngOnDestroy(): void {
    // Clean up SignalR connection
    this.notificationService.stopConnection();
  }
}

