import { Component, HostListener, inject, OnInit } from '@angular/core';
import { PingService } from '../../services/ping/ping.service';
import { ProfileService, Profile } from '../../services/user/profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface User {
  id: number;
  name: string;
  img: string;
  photos?: string[]; // Array of photos for the profile
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
  private profileService = inject(ProfileService);

  cards: User[] = [];
  
  // Fallback hardcoded data if API fails
  private fallbackCards: User[] = [
    { 
      id: 5, 
      name: 'Sophie, 24', 
      img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
      photos: [
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600'
      ]
    },
    { 
      id: 4, 
      name: 'Daniel, 27',  
      img: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600',
      photos: [
        'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
      ]
    },
    { 
      id: 3, 
      name: 'Emma, 23', 
      img: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
      photos: [
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600'
      ]
    },
    { 
      id: 2, 
      name: 'Michael, 26', 
      img: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=600',
      photos: [
        'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
      ]
    },
    { 
      id: 1, 
      name: 'Isabella, 22', 
      img: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
      photos: [
        'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80'
      ]
    }
  ];


  animationState: '' | 'swipeleft' | 'swiperight' = '';
  isAnimating = false;
  currentPhotoIndex: { [key: number]: number } = {}; // Track current photo index for each card

  constructor() {
    // Will be initialized in ngOnInit after fetching from API
  }

  ngOnInit(): void {
    // Ping service for health check
    this.pingService.ping().subscribe({
      next: (value: string) => {
        console.log(value);
      },
      error: (err: any) => {
        console.error('Ping error:', err);
      }
    });

    // Fetch profiles from API
    this.loadProfiles();
  }

  /**
   * Load profiles from API and map them to User format
   */
  loadProfiles(): void {
    // Try the matches endpoint first
    this.profileService.getMatches().subscribe({
      next: (profiles: Profile[]) => {
        console.log('Fetched profiles from API:', profiles);
        this.cards = this.mapProfilesToUsers(profiles);
        this.initializeCards();
      },
      error: (err) => {
        console.warn('Failed to fetch from /api/profiles/matches, trying /api/matches:', err);
        // Try alternative endpoint
        this.profileService.getProfiles().subscribe({
          next: (profiles: Profile[]) => {
            console.log('Fetched profiles from alternative endpoint:', profiles);
            this.cards = this.mapProfilesToUsers(profiles);
            this.initializeCards();
          },
          error: (err2) => {
            console.error('Failed to fetch profiles from API, using fallback data:', err2);
            // Fallback to hardcoded data
            this.cards = [...this.fallbackCards];
            this.initializeCards();
          }
        });
      }
    });
  }

  /**
   * Map API Profile response to User interface format
   */
  mapProfilesToUsers(profiles: Profile[]): User[] {
    return profiles.map(profile => {
      // Extract photo URLs from API response
      let photos: string[] = [];
      let primaryImg = '';

      // Handle different API response formats
      if (profile.photoUrls && profile.photoUrls.length > 0) {
        // If API returns array of URLs directly
        photos = profile.photoUrls;
        primaryImg = profile.photoUrls[0];
      } else if (profile.photos && profile.photos.length > 0) {
        // If API returns array of photo objects
        photos = profile.photos.map(photo => photo.url);
        // Find primary photo or use first one
        const primaryPhoto = profile.photos.find(p => p.isPrimary) || profile.photos[0];
        primaryImg = primaryPhoto.url;
      }

      // Build name with age if available
      const name = profile.age 
        ? `${profile.firstName} ${profile.lastName}, ${profile.age}`
        : `${profile.firstName} ${profile.lastName}`;

      return {
        id: profile.id,
        name: name,
        img: primaryImg || '', // Fallback to empty string if no photos
        photos: photos.length > 0 ? photos : undefined
      };
    });
  }

  /**
   * Initialize cards after loading (reverse and set photo indices)
   */
  initializeCards(): void {
    // Reverse cards so first profile is shown on top
    this.cards.reverse();
    // Initialize photo indices
    this.cards.forEach(card => {
      this.currentPhotoIndex[card.id] = 0;
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

  getCurrentPhoto(card: User): string {
    if (card.photos && card.photos.length > 0) {
      const index = this.currentPhotoIndex[card.id] || 0;
      return card.photos[index];
    }
    return card.img;
  }

  getPhotos(card: User): string[] {
    return card.photos && card.photos.length > 0 ? card.photos : [card.img];
  }

  hasMultiplePhotos(card: User): boolean {
    return card.photos ? card.photos.length > 1 : false;
  }

  nextPhoto(card: User, event: Event): void {
    event.stopPropagation(); // Prevent card swipe when clicking on photo
    const photos = this.getPhotos(card);
    const currentIndex = this.currentPhotoIndex[card.id] || 0;
    this.currentPhotoIndex[card.id] = (currentIndex + 1) % photos.length;
  }

  prevPhoto(card: User, event: Event): void {
    event.stopPropagation(); // Prevent card swipe when clicking on photo
    const photos = this.getPhotos(card);
    const currentIndex = this.currentPhotoIndex[card.id] || 0;
    this.currentPhotoIndex[card.id] = (currentIndex - 1 + photos.length) % photos.length;
  }

  goToPhoto(card: User, index: number, event: Event): void {
    event.stopPropagation(); // Prevent card swipe when clicking on dots
    this.currentPhotoIndex[card.id] = index;
  }
}
