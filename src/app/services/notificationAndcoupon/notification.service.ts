import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/app/Envirment/environment';

export interface NotificationResponseDTO {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'ORDER' | 'PROMOTION' | 'SYSTEM' | 'DELIVERY';
  isRead: boolean;
  createdAt: string;
  orderId?: number;
  actionUrl?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/api/notifications`;

  private notificationsSubject = new BehaviorSubject<NotificationResponseDTO[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUserNotifications(userId: number, page: number = 0, size: number = 20): Observable<Page<NotificationResponseDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'createdAt,desc');

    return this.http.get<Page<NotificationResponseDTO>>(`${this.apiUrl}/user/${userId}`, { params }).pipe(
      tap(response => {
        this.notificationsSubject.next(response.content);
        this.updateUnreadCount(response.content);
      })
    );
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${notificationId}/read`, null).pipe(
      tap(() => {
        const notifications = this.notificationsSubject.value.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        );
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount(notifications);
      })
    );
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/user/${userId}/read-all`, null).pipe(
      tap(() => {
        const notifications = this.notificationsSubject.value.map(n => ({ ...n, isRead: true }));
        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(0);
      })
    );
  }

  private updateUnreadCount(notifications: NotificationResponseDTO[]): void {
    const unread = notifications.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unread);
  }

}
