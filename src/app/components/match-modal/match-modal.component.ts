import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-match-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './match-modal.component.html',
    styleUrls: ['./match-modal.component.scss']
})
export class MatchModalComponent {
    @Input() matchedUser: {
        id: number;
        firstName: string;
        lastName: string;
        photo: string;
    } | null = null;

    @Input() currentUserPhoto: string = '';

    @Output() close = new EventEmitter<void>();
    @Output() sendMessage = new EventEmitter<number>();

    constructor(private router: Router) { }

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

    getImageUrl(imageData: string): string {
        if (!imageData) return '';
        if (imageData.startsWith('data:')) {
            return imageData;
        }
        return `data:image/jpeg;base64,${imageData}`;
    }
}
