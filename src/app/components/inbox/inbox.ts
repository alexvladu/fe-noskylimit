import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InboxService } from '../../services/inbox/inbox.service';

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

  readonly CURRENT_USER_ID = 1;
  readonly OTHER_USER_ID = 2;
  contacts: Contact[] = [];
  selectedContact: Contact | null = null;
  messages: Message[] = [];
  newMessage = '';
  private shouldScroll = false;
  isLoading = false;

  constructor(private inboxService: InboxService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Load single mock contact (Dorel)
    this.loadContacts();
    
  }

  loadMessagesFromBackend(): void {
    this.isLoading = true;
    this.messages = []; // Clear messages while loading
    this.cdr.markForCheck();
    
    // Load messages between user 1 and user 2 from backend
    this.inboxService.getMessagesBetween2Users(this.CURRENT_USER_ID, this.OTHER_USER_ID).subscribe({
      next: (data) => {
        console.log('Raw data from backend:', data);
        this.messages = data.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          recipientId: msg.recipientId,
          text: msg.text,
          timestamp: new Date(),
          isRead: false
        }));
        this.isLoading = false;
        this.shouldScroll = true;
        console.log('Messages loaded and mapped:', this.messages);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.isLoading = false;
        // Show fallback message if backend fails
        this.messages = [
          {
            id: 1,
            senderId: this.OTHER_USER_ID,
            recipientId: this.CURRENT_USER_ID,
            text: 'Nu au fost găsite mesaje. Conectează backend-ul!',
            timestamp: new Date(),
            isRead: true
          }
        ];
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

  loadContacts(): void {
    // Single mock contact - Dorel
    this.contacts = [
      {
        id: 2,
        firstName: 'Dorel',
        lastName: 'Asd',
        email: 'email2@email.com',
        isOnline: true,
        unreadCount: 0,
        lastMessage: undefined
      }
    ];
  }

  loadMockContacts(): void {
    this.loadContacts();
  }

  loadConversation(contact: Contact): void {
    // Load messages from backend when contact is selected
    this.loadMessagesFromBackend();
  }

  selectContact(contact: Contact): void {
    this.selectedContact = contact;
    this.loadConversation(contact);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedContact) {
      return;
    }

    const addMessageRequest = {
      text: this.newMessage.trim(),
      senderId: this.CURRENT_USER_ID,
      recipientId: this.selectedContact.id
    };

    this.inboxService.addMessage(addMessageRequest).subscribe({
      next: (response) => {
        const message: Message = {
          id: response.id,
          senderId: this.CURRENT_USER_ID,
          recipientId: this.selectedContact!.id,
          text: response.text,
          timestamp: new Date(),
          isRead: false
        };

        this.messages.push(message);
        this.newMessage = '';
        this.shouldScroll = true;
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
        // Fallback to local message
        const message: Message = {
          id: this.messages.length + 1,
          senderId: this.CURRENT_USER_ID,
          recipientId: this.selectedContact!.id,
          text: this.newMessage.trim(),
          timestamp: new Date(),
          isRead: false
        };

        this.messages.push(message);
        this.newMessage = '';
        this.shouldScroll = true;
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
}