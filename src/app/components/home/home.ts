import { Component, HostListener, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { PingService } from '../../services/ping/ping.service';
import { MatchService, RandomUserDto } from '../../services/match/match.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Card {
  id: number;
  firstName: string;
  lastName: string;
  age?: number;
  height?: number;
  location?: string;
  bio?: string;
  photos: Array<{ id: number; imageUrl: string }>;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {

  private pingService = inject(PingService);
  private matchService = inject(MatchService);
  private cdr = inject(ChangeDetectorRef);

  cards: Card[] = [];
  animationState: '' | 'swipeleft' | 'swiperight' = '';
  isAnimating = false;
  isLoading = true;
  error = '';

  ngOnInit(): void {
    this.pingService.ping().subscribe({
      next: (value: string) => {
        console.log(value);
      },
      error: (err: any) => {
        console.error('Ping error:', err);
      }
    });

    this.loadNextUser();
  }

  loadNextUser(): void {
    if (this.isAnimating) return;

    this.isLoading = true;
    this.error = '';
    this.cdr.markForCheck();

    this.matchService.getRandomUnmatchedUser().subscribe({
      next: (user: RandomUserDto) => {
        console.log('Loaded user:', user);
        const card: Card = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age,
          height: user.height,
          location: user.location,
          bio: user.bio,
          photos: user.photos || []
        };
        
        console.log('Card created:', card);
        this.cards.push(card);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.isLoading = false;
        this.error = 'No more users available';
        this.cdr.markForCheck();
      }
    });
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    // Check if it already has the data URL prefix
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    // Otherwise add the base64 prefix
    return `data:image/jpeg;base64,${imageUrl}`;
  }

  onImageError(event: Event): void {
    console.error('Image failed to load:', event);
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  swipe(direction: 'left' | 'right') {
    if (this.isAnimating || this.cards.length === 0) return;

    this.isAnimating = true;
    this.animationState =
      direction === 'left' ? 'swipeleft' : 'swiperight';

    const currentCard = this.cards[this.cards.length - 1];

    setTimeout(() => {
      if (direction === 'right') {
        // Create a match (like)
        this.matchService.createMatch(currentCard.id).subscribe({
          next: (response) => {
            console.log('Match created:', response);
            if (response.isMutual) {
              console.log('Mutual match!');
            }
          },
          error: (error) => {
            console.error('Error creating match:', error);
          }
        });
      }

      this.cards.pop();  // Remove top card
      this.animationState = '';
      this.isAnimating = false;
      
      // Load next user
      this.loadNextUser();
      this.cdr.markForCheck();
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
