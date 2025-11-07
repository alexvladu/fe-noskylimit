import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InboxComponent } from './inbox';

describe('InboxComponent', () => {
  let component: InboxComponent;
  let fixture: ComponentFixture<InboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load messages on init', () => {
    expect(component.messages.length).toBeGreaterThan(0);
  });

  it('should calculate unread count correctly', () => {
    const unreadCount = component.getUnreadCount();
    const expectedUnread = component.messages.filter(m => !m.read).length;
    expect(unreadCount).toBe(expectedUnread);
  });

  it('should mark message as read when selected', () => {
    const unreadMessage = component.messages.find(m => !m.read);
    if (unreadMessage) {
      component.selectMessage(unreadMessage);
      expect(unreadMessage.read).toBe(true);
    }
  });

  it('should delete message', () => {
    const initialLength = component.messages.length;
    const messageToDelete = component.messages[0];
    const event = new Event('click');
    
    component.deleteMessage(messageToDelete, event);
    
    expect(component.messages.length).toBe(initialLength - 1);
    expect(component.messages.find(m => m.id === messageToDelete.id)).toBeUndefined();
  });
});