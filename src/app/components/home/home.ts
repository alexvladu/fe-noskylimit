import { Component, HostListener, inject, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { PingService } from '../../services/ping/ping.service';
import { MatchService, RandomUserDto } from '../../services/match/match.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchModalComponent } from '../match-modal/match-modal.component';
import { UserService } from '../../services/user/user.service';
import { NotificationService } from '../../services/notification/notification.service';
import { Subscription } from 'rxjs';

export interface Card {
  id: number;
  firstName: string;
  lastName: string;
  age?: number;
  height?: number;
  location?: string;
  bio?: string;
  photos: Array<{ id: number; imageUrl: string }>;
  currentPhotoIndex?: number; // Track current photo being viewed
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MatchModalComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  private pingService = inject(PingService);
  private matchService = inject(MatchService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  cards: Card[] = [];
  animationState: '' | 'swipeleft' | 'swiperight' = '';
  isAnimating = false;
  isLoading = true;
  error = '';

  // Match modal state
  showMatchModal = false;
  matchedUser: { id: number; firstName: string; lastName: string; photo: string } | null = null;
  currentUserPhoto: string = '';

  private matchNotificationSubscription?: Subscription;

  ngOnInit(): void {
    this.pingService.ping().subscribe({
      next: (value: string) => {
        console.log(value);
      },
      error: (err: any) => {
        console.error('Ping error:', err);
      }
    });

    // Load current user photo for match modal
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user.photos && user.photos.length > 0) {
          this.currentUserPhoto = user.photos[0];
        }
      },
      error: (err) => {
        console.error('Error loading current user:', err);
      }
    });

    // Subscribe to SignalR match notifications
    this.matchNotificationSubscription = this.notificationService.matchNotification$.subscribe({
      next: (notification) => {
        console.log('Received SignalR match notification:', notification);
        if (notification.isMutual && notification.matchedUser) {
          // Ensure current user photo is loaded
          if (!this.currentUserPhoto) {
            this.userService.getCurrentUser().subscribe({
              next: (user) => {
                if (user.photos && user.photos.length > 0) {
                  this.currentUserPhoto = user.photos[0];
                }
                this.showMatchModalWithData(notification);
              },
              error: (err) => {
                console.error('Error loading current user:', err);
                // Show modal anyway even if photo fails to load
                this.showMatchModalWithData(notification);
              }
            });
          } else {
            this.showMatchModalWithData(notification);
          }
        }
      },
      error: (err) => {
        console.error('Error receiving match notification:', err);
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
          photos: user.photos || [],
          currentPhotoIndex: 0 // Start at first photo
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
            if (response.isMutual && response.matchedUser) {
              console.log('Mutual match!');
              // Show match modal with data from backend response
              this.matchedUser = {
                id: response.matchedUser.id,
                firstName: response.matchedUser.firstName,
                lastName: response.matchedUser.lastName,
                photo: response.matchedUser.profilePhotoUrl || ''
              };
              this.showMatchModal = true;
              this.cdr.markForCheck();
            }
            // Load next user after successful like
            this.finishSwipe();
          },
          error: (error) => {
            console.error('Error creating match:', error);
            // Load next user even if there was an error
            this.finishSwipe();
          }
        });
      } else {
        // Create a dislike (swipe left)
        this.matchService.addDislike(currentCard.id).subscribe({
          next: (response) => {
            console.log('Dislike recorded:', response);
            // Load next user after successful dislike
            this.finishSwipe();
          },
          error: (error) => {
            console.error('Error recording dislike:', error);
            // Load next user even if there was an error
            this.finishSwipe();
          }
        });
      }
    }, 500); // Matches CSS animation duration
  }

  private finishSwipe() {
    this.cards.pop();  // Remove top card
    this.animationState = '';
    this.isAnimating = false;

    // Load next user
    this.loadNextUser();
    this.cdr.markForCheck();
  }

  private showMatchModalWithData(notification: any) {
    console.log('Showing match modal with notification:', notification);
    console.log('Current user photo:', this.currentUserPhoto);
    console.log('Matched user photo:', notification.matchedUser.profilePhotoUrl);

    this.matchedUser = {
      id: notification.matchedUser.id,
      firstName: notification.matchedUser.firstName,
      lastName: notification.matchedUser.lastName,
      photo: notification.matchedUser.profilePhotoUrl || ''
    };
    this.showMatchModal = true;

    // Force immediate change detection
    this.cdr.detectChanges();

    // Also mark for check to ensure Angular processes this in the next cycle
    this.cdr.markForCheck();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // If Shift is held, use arrows for photo navigation
    if (event.shiftKey) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.previousPhoto();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.nextPhoto();
      }
    } else {
      // Normal swipe left/right
      if (event.key === 'ArrowLeft') {
        this.swipe('left');
      } else if (event.key === 'ArrowRight') {
        this.swipe('right');
      }
    }
  }

  // Navigate to next photo (circular)
  nextPhoto() {
    if (this.cards.length === 0) return;
    const currentCard = this.cards[this.cards.length - 1];
    if (!currentCard.photos || currentCard.photos.length <= 1) return;

    const currentIndex = currentCard.currentPhotoIndex || 0;
    // Circular navigation: go to first photo if at the end
    currentCard.currentPhotoIndex = (currentIndex + 1) % currentCard.photos.length;
    this.cdr.markForCheck();
  }

  // Navigate to previous photo (circular)
  previousPhoto() {
    if (this.cards.length === 0) return;
    const currentCard = this.cards[this.cards.length - 1];
    if (!currentCard.photos || currentCard.photos.length <= 1) return;

    const currentIndex = currentCard.currentPhotoIndex || 0;
    // Circular navigation: go to last photo if at the beginning
    currentCard.currentPhotoIndex = currentIndex === 0
      ? currentCard.photos.length - 1
      : currentIndex - 1;
    this.cdr.markForCheck();
  }

  // Jump to specific photo
  goToPhoto(index: number) {
    if (this.cards.length === 0) return;
    const currentCard = this.cards[this.cards.length - 1];
    if (!currentCard.photos || index < 0 || index >= currentCard.photos.length) return;

    currentCard.currentPhotoIndex = index;
    this.cdr.markForCheck();
  }

  // Get current photo for display
  getCurrentPhoto(card: Card): string {
    if (!card.photos || card.photos.length === 0) return '';
    const index = card.currentPhotoIndex || 0;
    return card.photos[index]?.imageUrl || '';
  }

  closeMatchModal() {
    this.showMatchModal = false;
    this.matchedUser = null;
    this.cdr.markForCheck();
  }

  handleSendMessage(userId: number) {
    // Modal component will handle navigation to inbox
    this.closeMatchModal();
  }

  ngOnDestroy(): void {
    // Unsubscribe from match notifications
    if (this.matchNotificationSubscription) {
      this.matchNotificationSubscription.unsubscribe();
    }
  }
}
