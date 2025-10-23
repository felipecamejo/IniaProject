import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationPanelComponent, NotificationData, NotificationType } from './notification-panel';

describe('NotificationPanelComponent', () => {
  let component: NotificationPanelComponent;
  let fixture: ComponentFixture<NotificationPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle panel visibility', () => {
    expect(component.isOpen).toBeFalse();
    component.togglePanel();
    expect(component.isOpen).toBeTrue();
    component.togglePanel();
    expect(component.isOpen).toBeFalse();
  });

  it('should mark notification as read', () => {
    const notification: NotificationData = { 
      id: '1',
      read: false, 
      title: 'Test', 
      message: 'Test message',
      type: 'success'
    };
    component.notifications = [notification];
    component.markAsRead(notification);
    expect(notification.read).toBeTrue();
  });

  it('should clear all notifications', () => {
    component.notifications = [
      { id: '1', read: false, title: 'Test 1', message: 'Message 1', type: 'success' },
      { id: '2', read: true, title: 'Test 2', message: 'Message 2', type: 'info' }
    ];
    component.clearAll();
    expect(component.notifications.length).toBe(0);
  });

  it('should add notification with auto-generated ID', () => {
    const notification: NotificationData = {
      title: 'New Notification',
      message: 'This is a test notification',
      type: 'success'
    };
    
    component.addNotification(notification);
    
    expect(component.notifications.length).toBe(1);
    expect(component.notifications[0].id).toBeDefined();
    expect(component.notifications[0].timestamp).toBeDefined();
  });

  it('should get correct icon for notification type', () => {
    const successNotification: NotificationData = {
      id: '1',
      title: 'Success',
      message: 'Success message',
      type: 'success'
    };
    
    const errorNotification: NotificationData = {
      id: '2',
      title: 'Error',
      message: 'Error message',
      type: 'error'
    };

    expect(component.getNotificationIcon(successNotification)).toBe('✓');
    expect(component.getNotificationIcon(errorNotification)).toBe('✕');
  });

  it('should get correct CSS class for notification type', () => {
    const notification: NotificationData = {
      id: '1',
      title: 'Test',
      message: 'Test message',
      type: 'success'
    };

    expect(component.getNotificationClass(notification)).toBe('notification-success');
  });

  it('should dismiss notification', () => {
    const notification: NotificationData = {
      id: '1',
      title: 'Test',
      message: 'Test message',
      type: 'success'
    };
    
    component.notifications = [notification];
    component.dismissNotification(notification);
    
    expect(component.notifications.length).toBe(0);
  });
});
