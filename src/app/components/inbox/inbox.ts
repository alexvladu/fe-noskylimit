import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  contacts: Contact[] = [];
  selectedContact: Contact | null = null;
  messages: Message[] = [];
  newMessage = '';
  private shouldScroll = false;

  ngOnInit(): void {
    this.loadContacts();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  loadContacts(): void {
    // Mock contacts data
    this.contacts = [
      {
        id: 2,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isOnline: true,
        unreadCount: 2,
        lastMessage: {
          id: 1,
          senderId: 2,
          recipientId: 1,
          text: 'Hey! Are we still meeting today?',
          timestamp: new Date(Date.now() - 300000),
          isRead: false
        }
      },
      {
        id: 3,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        isOnline: false,
        unreadCount: 0,
        lastMessage: {
          id: 2,
          senderId: 1,
          recipientId: 3,
          text: 'Thanks for the update!',
          timestamp: new Date(Date.now() - 3600000),
          isRead: true
        }
      },
      {
        id: 4,
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike@example.com',
        isOnline: true,
        unreadCount: 5,
        lastMessage: {
          id: 3,
          senderId: 4,
          recipientId: 1,
          text: 'Can you review the PR?',
          timestamp: new Date(Date.now() - 7200000),
          isRead: false
        }
      },
      {
        id: 5,
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah@example.com',
        isOnline: false,
        unreadCount: 0,
        lastMessage: {
          id: 4,
          senderId: 1,
          recipientId: 5,
          text: 'See you tomorrow!',
          timestamp: new Date(Date.now() - 86400000),
          isRead: true
        }
      }
    ];
  }

  loadConversation(contact: Contact): void {
    // Mock conversation data
    this.messages = [
      {
        id: 1,
        senderId: contact.id,
        recipientId: this.CURRENT_USER_ID,
        text: 'Hi there! How are you doing?',
        timestamp: new Date(Date.now() - 7200000),
        isRead: true
      },
      {
        id: 2,
        senderId: this.CURRENT_USER_ID,
        recipientId: contact.id,
        text: 'Hey! I\'m doing great, thanks for asking!',
        timestamp: new Date(Date.now() - 7100000),
        isRead: true
      },
      {
        id: 3,
        senderId: contact.id,
        recipientId: this.CURRENT_USER_ID,
        text: 'That\'s awesome! I wanted to discuss the project with you.',
        timestamp: new Date(Date.now() - 7000000),
        isRead: true
      },
      {
        id: 4,
        senderId: this.CURRENT_USER_ID,
        recipientId: contact.id,
        text: 'Sure! What would you like to know?',
        timestamp: new Date(Date.now() - 6900000),
        isRead: true
      },
      {
        id: 5,
        senderId: contact.id,
        recipientId: this.CURRENT_USER_ID,
        text: contact.lastMessage?.text || 'Latest message',
        timestamp: contact.lastMessage?.timestamp || new Date(),
        isRead: contact.lastMessage?.isRead || false
      }
    ];

    this.shouldScroll = true;

    // Mark messages as read
    if (contact.unreadCount > 0) {
      this.contacts = this.contacts.map(c =>
        c.id === contact.id ? { ...c, unreadCount: 0 } : c
      );
    }
  }

  selectContact(contact: Contact): void {
    this.selectedContact = contact;
    this.loadConversation(contact);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedContact) {
      return;
    }

    const message: Message = {
      id: this.messages.length + 1,
      senderId: this.CURRENT_USER_ID,
      recipientId: this.selectedContact.id,
      text: this.newMessage.trim(),
      timestamp: new Date(),
      isRead: false
    };

    this.messages.push(message);
    this.newMessage = '';
    this.shouldScroll = true;

    // Update contact's last message
    this.contacts = this.contacts.map(c =>
      c.id === this.selectedContact?.id
        ? { ...c, lastMessage: message }
        : c
    );
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