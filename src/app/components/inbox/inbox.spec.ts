import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { InboxComponent, Contact, Message } from './inbox';

describe('InboxComponent', () => {
  let component: InboxComponent;
  let fixture: ComponentFixture<InboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InboxComponent],
      imports: [FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(InboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load contacts on init', () => {
    expect(component.contacts.length).toBeGreaterThan(0);
  });

  it('should select a contact and load conversation', () => {
    const contact = component.contacts[0];
    component.selectContact(contact);
    
    expect(component.selectedContact).toBe(contact);
    expect(component.messages.length).toBeGreaterThan(0);
  });

  it('should send a message', () => {
    const contact = component.contacts[0];
    component.selectContact(contact);
    
    const initialMessageCount = component.messages.length;
    component.newMessage = 'Test message';
    component.sendMessage();
    
    expect(component.messages.length).toBe(initialMessageCount + 1);
    expect(component.messages[component.messages.length - 1].text).toBe('Test message');
    expect(component.newMessage).toBe('');
  });

  it('should not send empty message', () => {
    const contact = component.contacts[0];
    component.selectContact(contact);
    
    const initialMessageCount = component.messages.length;
    component.newMessage = '   ';
    component.sendMessage();
    
    expect(component.messages.length).toBe(initialMessageCount);
  });

  it('should mark messages as read when selecting contact', () => {
    const contact = component.contacts.find(c => c.unreadCount > 0);
    if (contact) {
      const unreadCount = contact.unreadCount;
      component.selectContact(contact);
      
      const updatedContact = component.contacts.find(c => c.id === contact.id);
      expect(updatedContact?.unreadCount).toBe(0);
    }
  });

  it('should get initials correctly', () => {
    const initials = component.getInitials('John', 'Doe');
    expect(initials).toBe('JD');
  });

  it('should format time correctly', () => {
    const now = new Date();
    const justNow = new Date(now.getTime() - 30000); // 30 seconds ago
    const result = component.formatTime(justNow);
    expect(result).toBe('Just now');
  });

  it('should format message time', () => {
    const date = new Date();
    const result = component.formatMessageTime(date);
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('should update contact last message after sending', () => {
    const contact = component.contacts[0];
    component.selectContact(contact);
    
    component.newMessage = 'New test message';
    component.sendMessage();
    
    const updatedContact = component.contacts.find(c => c.id === contact.id);
    expect(updatedContact?.lastMessage?.text).toBe('New test message');
  });

  it('should handle Enter key to send message', () => {
    const contact = component.contacts[0];
    component.selectContact(contact);
    
    component.newMessage = 'Test message';
    const event = new KeyboardEvent('keypress', { key: 'Enter' });
    spyOn(event, 'preventDefault');
    
    component.onKeyPress(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not send message on Shift+Enter', () => {
    const contact = component.contacts[0];
    component.selectContact(contact);
    
    const initialMessageCount = component.messages.length;
    component.newMessage = 'Test message';
    const event = new KeyboardEvent('keypress', { key: 'Enter', shiftKey: true });
    
    component.onKeyPress(event);
    
    expect(component.messages.length).toBe(initialMessageCount);
  });
});