import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, inject, OnDestroy } from '@angular/core';
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
export class InboxComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  private inboxService = inject(InboxService);
  private matchService = inject(MatchService);
  private cdr = inject(ChangeDetectorRef);
  private intervalId: any;

  currentUserId: number | null = null;
  contacts: Contact[] = [];
  selectedContact: Contact | null = null;
  messages: Message[] = [];
  newMessage = '';
  private shouldScroll = false;
  isLoading = false;
  private lastMessageId: number = 0;
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
    this.lastMessageId = 0; // Reset when loading all messages
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

        // Update last message ID
        if (this.messages.length > 0) {
          this.lastMessageId = Math.max(...this.messages.map(m => m.id));
        }

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

  updateMessages(): void {
    if (!this.selectedContact || !this.currentUserId) return;

    // Load messages between current user and selected contact
    this.inboxService.getMessagesBetween2Users(this.currentUserId, this.selectedContact.id).subscribe({
      next: (data) => {
        const newMessages = data.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          recipientId: msg.recipientId,
          text: msg.text,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          isRead: false
        }));

        // Filter out messages that are already in the array
        const existingIds = new Set(this.messages.map(m => m.id));
        const messagesToAdd = newMessages.filter(msg => !existingIds.has(msg.id));

        // Add new messages to the existing array
        if (messagesToAdd.length > 0) {
          this.messages.push(...messagesToAdd);

          // Update last message ID
          this.lastMessageId = Math.max(this.lastMessageId, ...messagesToAdd.map(m => m.id));

          // Sort messages by timestamp to ensure correct order
          this.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

          this.shouldScroll = true;
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error updating messages:', error);
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  selectContact(contact: Contact): void {
    this.selectedContact = contact;
    this.error = '';
    this.loadMessagesFromBackend();

    // Clear any existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Start refreshing messages every 500ms (twice per second)
    this.intervalId = setInterval(() => {
      if (this.selectedContact) {
        this.updateMessages();
      }
    }, 500);
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
        this.lastMessageId = Math.max(this.lastMessageId, message.id); // Update last message ID
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

  getImageUrl(imageUrl?: string): string {
    if (!imageUrl) return '';
    // If it's already a data URL or a full URL, return as is
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Otherwise, assume it's base64 and add the prefix
    return `data:image/jpeg;base64,${imageUrl}`;
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
