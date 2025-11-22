import { Component, HostListener, inject } from '@angular/core';
import { PingService } from '../../services/ping/ping.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface User {
  id: number;
  name: string;
  img: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {

  private pingService = inject(PingService);

  cards: User[] = [
  { 
    id: 5, 
    name: 'Sophie, 24', 
    img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80' 
  },
  { 
    id: 4, 
    name: 'Daniel, 27',  
    img: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  { 
    id: 3, 
    name: 'Emma, 23', 
    img: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600'

  },
  { 
    id: 2, 
    name: 'Michael, 26', 
    img: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  { 
    id: 1, 
    name: 'Isabella, 22', 
    img: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600'
  }
];


  animationState: '' | 'swipeleft' | 'swiperight' = '';
  isAnimating = false;

  constructor() {
    // Reverse cards so User 1 is shown first
    this.cards.reverse();
  }

  ngOnInit(): void {
    this.pingService.ping().subscribe({
      next: (value: string) => {
        console.log(value);
      },
      error: (err: any) => {
        console.error('Ping error:', err);
      }
    });
  }

  swipe(direction: 'left' | 'right') {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.animationState =
      direction === 'left' ? 'swipeleft' : 'swiperight';

    setTimeout(() => {
      this.cards.pop();  // Remove top card
      this.animationState = '';
      this.isAnimating = false;
    }, 500); // Matches CSS animation duration
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      this.swipe('left');
    } else if (event.key === 'ArrowRight') {
      this.swipe('right');
    }
  }
}
