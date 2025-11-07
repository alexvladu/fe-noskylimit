import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faCog, faHeart, faUserCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navigation',
  imports: [RouterModule, FontAwesomeModule],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss'
})
export class NavigationComponent {
  faEnvelope = faEnvelope;
  faCog = faCog;
  faHeart = faHeart;
  faUserCircle = faUserCircle;
}
