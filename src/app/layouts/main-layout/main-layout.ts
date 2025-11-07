import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '../../components/navigation/navigation';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent {

}
