import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Message {
  id: string;
  nume: string;
  maj: string;
  read: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.html',
  styleUrls: ['./inbox.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class InboxComponent implements OnInit {
  messages: Message[] = [];
  selectedMessage: Message | null = null;

  ngOnInit(): void {
    // Load messages - replace with actual service call
    this.loadMessages();
  }

  loadMessages(): void {
    // Mock data - replace with actual API call
    this.messages = [
      {
        id: '1',
        nume: 'John Doe',
        maj: 'Meeting reminder',
        read: false,
        timestamp: new Date()
      },
      {
        id: '2',
        nume: 'Jane Smith',
        maj: 'Project update',
        read: false,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: '3',
        nume: 'Admin',
        maj: 'System notification',
        read: true,
        timestamp: new Date(Date.now() - 86400000)
      }
    ];
  }

  selectMessage(message: Message): void {
    this.selectedMessage = message;
    if (!message.read) {
      message.read = true;
      // Call service to mark as read
    }
  }

  deleteMessage(message: Message, event: Event): void {
    event.stopPropagation();
    this.messages = this.messages.filter(m => m.id !== message.id);
    if (this.selectedMessage?.id === message.id) {
      this.selectedMessage = null;
    }
  }

  getUnreadCount(): number {
    return this.messages.filter(m => !m.read).length;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }
}