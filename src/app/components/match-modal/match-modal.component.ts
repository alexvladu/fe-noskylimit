import { Component, EventEmitter, Input, Output, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-match-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './match-modal.component.html',
    styleUrls: ['./match-modal.component.scss']
})
export class MatchModalComponent implements OnChanges {
    @Input() matchedUser: {
        id: number;
        firstName: string;
        lastName: string;
        photo: string;
    } | null = null;

    @Input() currentUserPhoto: string = '';

    @Output() close = new EventEmitter<void>();
    @Output() sendMessage = new EventEmitter<number>();

    constructor(private router: Router, private cdr: ChangeDetectorRef) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['matchedUser'] || changes['currentUserPhoto']) {
            console.log('MatchModal inputs changed:', {
                matchedUser: this.matchedUser,
                currentUserPhoto: this.currentUserPhoto
            });
            // Force change detection when inputs change
            this.cdr.detectChanges();
        }
    }

    onClose() {
        this.close.emit();
    }

    onSendMessage() {
        if (this.matchedUser) {
            this.sendMessage.emit(this.matchedUser.id);
            this.router.navigate(['/inbox']);
        }
    }

    onKeepSwiping() {
        this.close.emit();
    }

    onImageError(event: Event, imageType: string) {
        console.error(`Image failed to load for ${imageType}:`, event);
    }

    onImageLoad(event: Event, imageType: string) {
        console.log(`Image loaded successfully for ${imageType}`);
    }

    getImageUrl(imageData: string): string {
        if (!imageData) {
            console.warn('No image data provided');
            return '';
        }
        if (imageData.startsWith('data:')) {
            console.log('Image already has data URL prefix');
            return imageData;
        }
        const result = `data:image/jpeg;base64,${imageData}`;
        console.log('Image URL formatted:', result.substring(0, 50) + '...');
        return result;
    }
}
