import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly STORAGE_KEY = 'app-notifications';
  private notificationsSubject = new BehaviorSubject<Notification[]>(this.loadNotifications());
  
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {}

  private loadNotifications(): Notification[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  private saveNotifications(notifications: Notification[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  showSuccess(title: string, message: string, action?: Notification['action']): void {
    this.addNotification('success', title, message, action);
    this.showSnackBar(message, 'success');
  }

  showError(title: string, message: string, action?: Notification['action']): void {
    this.addNotification('error', title, message, action);
    this.showSnackBar(message, 'error');
  }

  showWarning(title: string, message: string, action?: Notification['action']): void {
    this.addNotification('warning', title, message, action);
    this.showSnackBar(message, 'warning');
  }

  showInfo(title: string, message: string, action?: Notification['action']): void {
    this.addNotification('info', title, message, action);
    this.showSnackBar(message, 'info');
  }

  private addNotification(
    type: Notification['type'], 
    title: string, 
    message: string, 
    action?: Notification['action']
  ): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      action
    };

    const current = this.notificationsSubject.value;
    const updated = [notification, ...current].slice(0, 50); // Keep only last 50
    
    this.saveNotifications(updated);
    this.notificationsSubject.next(updated);
  }

  private showSnackBar(message: string, type: string): void {
    const config: MatSnackBarConfig = {
      duration: type === 'error' ? 5000 : 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    };

    this.snackBar.open(message, 'Cerrar', config);
  }

  markAsRead(id: string): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    
    this.saveNotifications(updated);
    this.notificationsSubject.next(updated);
  }

  markAllAsRead(): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => ({ ...n, read: true }));
    
    this.saveNotifications(updated);
    this.notificationsSubject.next(updated);
  }

  deleteNotification(id: string): void {
    const current = this.notificationsSubject.value;
    const updated = current.filter(n => n.id !== id);
    
    this.saveNotifications(updated);
    this.notificationsSubject.next(updated);
  }

  clearAllNotifications(): void {
    this.saveNotifications([]);
    this.notificationsSubject.next([]);
  }

  getUnreadCount(): Observable<number> {
    return this.notifications$.pipe(
      map(notifications => notifications.filter(n => !n.read).length)
    );
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}