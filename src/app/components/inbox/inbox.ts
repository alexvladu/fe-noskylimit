import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InboxService, MessageDto } from '../../services/inbox/inbox.service';
import { MatchService, MatchDto } from '../../services/match/match.service';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto?: string;
  isOnline?: boolean;
}

export interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  text: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Contact extends User {
  lastMessage?: Message;
  unreadCount: number;
}

@Component({
  selector: 'inbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inbox.html',
  styleUrls: ['./inbox.scss']
})
export class InboxComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  private inboxService = inject(InboxService);
  private matchService = inject(MatchService);
  private cdr = inject(ChangeDetectorRef);

  currentUserId: number | null = null;
  contacts: Contact[] = [];
  selectedContact: Contact | null = null;
  messages: Message[] = [];
  newMessage = '';
  private shouldScroll = false;
  isLoading = false;
  error = '';

  ngOnInit(): void {
    // Extract userId from JWT token
    this.currentUserId = this.inboxService.getCurrentUserId();
    if (!this.currentUserId) {
      this.error = 'User not authenticated';
      return;
    }

    // Load matched users as contacts
    this.loadMatchedUserContacts();
  }

  loadMatchedUserContacts(): void {
    if (!this.currentUserId) return;

    this.isLoading = true;
    this.error = '';
    this.cdr.markForCheck();

    // Get only mutual matches (both users have liked each other)
    this.matchService.getCurrentUserMutualMatches().subscribe({
      next: (matches: MatchDto[]) => {
        console.log('Mutual matches loaded:', matches);
        
        if (matches.length === 0) {
          this.contacts = [];
          this.isLoading = false;
          this.cdr.markForCheck();
          return;
        }

        // Convert matches to contacts
        this.contacts = matches
          .filter(match => match.matchedUserDetails) // Filter out matches without user details
          .map(match => {
            const userDetails = match.matchedUserDetails!;
            return {
              id: userDetails.id,
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
              email: '', // Email not available in MatchedUserDto
              profilePhoto: userDetails.profilePhotoUrl,
              isOnline: undefined,
              unreadCount: 0,
              lastMessage: undefined
            };
          });

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading matched users:', error);
        this.isLoading = false;
        this.error = 'Failed to load your matches';
        this.cdr.markForCheck();
      }
    });
  }

  loadMessagesFromBackend(): void {
    if (!this.selectedContact || !this.currentUserId) return;

    this.isLoading = true;
    this.messages = [];
    this.cdr.markForCheck();
    
    // Load messages between current user and selected contact
    this.inboxService.getMessagesBetween2Users(this.currentUserId, this.selectedContact.id).subscribe({
      next: (data) => {
        console.log('Messages loaded:', data);
        this.messages = data.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          recipientId: msg.recipientId,
          text: msg.text,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          isRead: false
        }));
        this.isLoading = false;
        this.shouldScroll = true;
        this.error = '';
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.isLoading = false;
        this.error = 'Failed to load messages';
        this.cdr.markForCheck();
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  selectContact(contact: Contact): void {
    this.selectedContact = contact;
    this.error = '';
    this.loadMessagesFromBackend();
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedContact || !this.currentUserId) {
      return;
    }

    const addMessageRequest = {
      text: this.newMessage.trim(),
      senderId: this.currentUserId,
      recipientId: this.selectedContact.id
    };

    this.inboxService.addMessage(addMessageRequest).subscribe({
      next: (response) => {
        const message: Message = {
          id: response.id,
          senderId: this.currentUserId!,
          recipientId: this.selectedContact!.id,
          text: response.text,
          timestamp: response.timestamp ? new Date(response.timestamp) : new Date(),
          isRead: false
        };

        this.messages.push(message);
        this.newMessage = '';
        this.shouldScroll = true;
        this.error = '';
        this.cdr.markForCheck();

        // Update contact's last message
        this.contacts = this.contacts.map(c =>
          c.id === this.selectedContact?.id
            ? { ...c, lastMessage: message }
            : c
        );
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.error = 'Failed to send message';
        this.cdr.markForCheck();
      }
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom(): void {
    try {
      this.messagesEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  formatMessageTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  isCurrentUserMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }
}