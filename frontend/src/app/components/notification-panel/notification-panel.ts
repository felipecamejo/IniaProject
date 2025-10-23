
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationData {
  id?: string;
  title: string;
  message: string;
  type: NotificationType;
  icon?: string;
  autoDismiss?: boolean;
  duration?: number;
  timestamp?: Date;
  read?: boolean;
}

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-panel.html',
  styleUrls: ['./notification-panel.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-10px)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ transform: 'translateY(-10px)', opacity: 0 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('400ms ease-in', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(20px)' }))
      ])
    ])
  ]
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  @Input() notifications: NotificationData[] = [];
  @Input() isOpen: boolean = false;
  @Input() maxNotifications: number = 10;
  @Input() autoDismissDuration: number = 5000;
  
  @Output() notificationRead = new EventEmitter<NotificationData>();
  @Output() notificationDismissed = new EventEmitter<NotificationData>();
  @Output() panelToggled = new EventEmitter<boolean>();

  private autoDismissTimeouts: Map<string, any> = new Map();

  constructor() {}

  ngOnInit() {
    this.setupAutoDismiss();
  }

  ngOnDestroy() {
    this.clearAllTimeouts();
  }

  togglePanel() {
    this.isOpen = !this.isOpen;
    this.panelToggled.emit(this.isOpen);
  }

  closePanel() {
    this.isOpen = false;
    this.panelToggled.emit(false);
  }

  markAsRead(notification: NotificationData) {
    notification.read = true;
    this.notificationRead.emit(notification);
    this.clearTimeout(notification.id);
  }

  dismissNotification(notification: NotificationData) {
    const index = this.notifications.findIndex(n => n.id === notification.id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notificationDismissed.emit(notification);
    }
    this.clearTimeout(notification.id);
  }

  clearAll() {
    this.clearAllTimeouts();
    this.notifications = [];
  }

  addNotification(notification: NotificationData) {
    // Generate ID if not provided
    if (!notification.id) {
      notification.id = this.generateId();
    }
    
    // Set timestamp if not provided
    if (!notification.timestamp) {
      notification.timestamp = new Date();
    }

    // Add to beginning of array
    this.notifications.unshift(notification);

    // Limit notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    // Setup auto dismiss if enabled
    if (notification.autoDismiss !== false) {
      this.setupAutoDismissForNotification(notification);
    }
  }

  getNotificationIcon(notification: NotificationData): string {
    if (notification.icon) {
      return notification.icon;
    }

    switch (notification.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  }

  getNotificationClass(notification: NotificationData): string {
    return `notification-${notification.type}`;
  }

  private setupAutoDismiss() {
    this.notifications.forEach(notification => {
      if (notification.autoDismiss !== false) {
        this.setupAutoDismissForNotification(notification);
      }
    });
  }

  private setupAutoDismissForNotification(notification: NotificationData) {
    if (!notification.id) return;

    const duration = notification.duration || this.autoDismissDuration;
    const timeout = setTimeout(() => {
      this.dismissNotification(notification);
    }, duration);

    this.autoDismissTimeouts.set(notification.id, timeout);
  }

  private clearTimeout(notificationId?: string) {
    if (notificationId && this.autoDismissTimeouts.has(notificationId)) {
      clearTimeout(this.autoDismissTimeouts.get(notificationId));
      this.autoDismissTimeouts.delete(notificationId);
    }
  }

  private clearAllTimeouts() {
    this.autoDismissTimeouts.forEach(timeout => clearTimeout(timeout));
    this.autoDismissTimeouts.clear();
  }

  trackByNotificationId(index: number, notification: NotificationData): string {
    return notification.id || index.toString();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
