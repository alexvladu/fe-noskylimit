import { Component, inject } from '@angular/core';
import { PingService } from '../../services/ping/ping.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {

  private pingService = inject(PingService);
  
  ngOnInit(): void {
    this.pingService.ping().subscribe({
      next:(value:string)=>{
        console.log(value);
      },
      error: (err: any) => {
        console.error('Ping error:', err);
      }
    });
  }
}
