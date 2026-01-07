import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatchService, MatchDto } from '../../services/match/match.service';

interface LikeUser {
    id: number;
    firstName: string;
    lastName: string;
    age?: number;
    location?: string;
    bio?: string;
    profilePhotoUrl?: string;
    matchId: number;
}

@Component({
    selector: 'app-likes',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './likes.html',
    styleUrls: ['./likes.scss']
})
export class LikesComponent implements OnInit {
    private matchService = inject(MatchService);
    private router = inject(Router);

    likes: LikeUser[] = [];
    isLoading = true;
    error = '';

    ngOnInit(): void {
        this.loadLikes();
    }

    loadLikes(): void {
        this.isLoading = true;
        this.error = '';

        // Get all matches (includes one-way likes where others liked us)
        this.matchService.getCurrentUserMatches().subscribe({
            next: (matches: MatchDto[]) => {
                console.log('All matches:', matches);

                // Filter to show only users who liked us but we haven't matched with yet
                // These are matches where matchedUserId is current user and not mutual
                this.likes = matches
                    .filter(match => !match.isMutual && match.matchedUserDetails)
                    .map(match => ({
                        id: match.matchedUserDetails!.id,
                        firstName: match.matchedUserDetails!.firstName,
                        lastName: match.matchedUserDetails!.lastName,
                        age: match.matchedUserDetails!.age,
                        location: match.matchedUserDetails!.location,
                        bio: match.matchedUserDetails!.bio,
                        profilePhotoUrl: match.matchedUserDetails!.profilePhotoUrl,
                        matchId: match.id
                    }));

                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading likes:', err);
                this.error = 'Failed to load likes. Please try again.';
                this.isLoading = false;
            }
        });
    }

    getImageUrl(imageData?: string): string {
        if (!imageData) return 'assets/default-avatar.png';
        if (imageData.startsWith('data:')) {
            return imageData;
        }
        return `data:image/jpeg;base64,${imageData}`;
    }

    viewProfile(userId: number): void {
        // Navigate to user profile or open modal
        console.log('View profile:', userId);
    }

    likeBack(user: LikeUser): void {
        // Create a match (like back)
        this.matchService.createMatch(user.id).subscribe({
            next: (response) => {
                console.log('Liked back:', response);
                if (response.isMutual) {
                    alert(`It's a match with ${user.firstName}!`);
                }
                // Reload likes to update the list
                this.loadLikes();
            },
            error: (error) => {
                console.error('Error liking back:', error);
                this.error = 'Failed to like back. Please try again.';
            }
        });
    }

    pass(matchId: number): void {
        // Delete the match (pass/reject)
        this.matchService.deleteMatch(matchId).subscribe({
            next: () => {
                console.log('Passed on like');
                this.loadLikes();
            },
            error: (error) => {
                console.error('Error passing:', error);
                this.error = 'Failed to pass. Please try again.';
            }
        });
    }
}
