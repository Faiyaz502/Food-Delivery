import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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

    // ✅ Subjects to manage state
  private notificationsSubject = new BehaviorSubject<NotificationResponseDTO[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  // ✅ Public observables
  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

// ✅ Get latest 10 notifications
getLatestNotifications(userId: number): Observable<NotificationResponseDTO[]> {
  const params = {
    page: '0',
    size: '10',
    sort: 'createdAt,desc'
  };

  return this.http.get<Page<NotificationResponseDTO>>(`${this.apiUrl}/user/${userId}`, { params }).pipe(
    map(response => response.content), // ✅ Extract the array
    tap(notifications => {
      // Update local state
      this.notificationsSubject.next(notifications);
      this.updateUnreadCount(notifications);
    })
  );
}

  // ✅ Mark single notification as read
  markAsRead(notificationId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${notificationId}/read`, null).pipe(
      tap(() => {
        // Optimistically update local state
        const current = this.notificationsSubject.value;
        const updated = current.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        );
        this.notificationsSubject.next(updated);
        this.updateUnreadCount(updated);
      })
    );
  }

    getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/user/${userId}/unread-count`);
  }

  // ✅ Mark all as read
  markAllAsRead(userId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/user/${userId}/read-all`, {});
  }

  // ✅ Helper: Recalculate unread count
  private updateUnreadCount(notifications: NotificationResponseDTO[]): void {
    const unread = notifications.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unread);
  }


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







}
