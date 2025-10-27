import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/Envirment/environment';


interface PendingOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  totalAmount: number;
  orderDate: string;
  orderStatus: string;
}

export interface DeliveryResponse {
  id: number;
  deliveryId: number;
  orderId: number;
  riderName: string;
  status: string;
  message: string;
  assignedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private apiUrl = `${environment.apiUrl}/api/deliveries`;
  private orderApiUrl = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) { }

  /**
   * Get all pending orders (PLACED status, not assigned)
   */
getPendingOrders(): Observable<PendingOrder[]> {
  return this.http.get<PendingOrder[]>(`${this.orderApiUrl}/pending`);
}
  /**
   * Get delivery by order ID
   */
  getDeliveryByOrderId(orderId: number): Observable<DeliveryResponse> {
    return this.http.get<DeliveryResponse>(`${this.apiUrl}/order/${orderId}`);
  }

  /**
   * Assign delivery to a rider
   */
  assignDeliveryPerson(deliveryId: number, riderId: number): Observable<DeliveryResponse> {
    console.log('Assigning delivery:', deliveryId, 'to rider:', riderId);
    return this.http.post<DeliveryResponse>(
      `${this.apiUrl}/${deliveryId}/assign/${riderId}`,
      {}
    );
  }

  /**
   * Get delivery details
   */
  getDeliveryDetails(deliveryId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${deliveryId}`);
  }

  /**
   * Update delivery status
   */
  updateDeliveryStatus(deliveryId: number, status: string): Observable<DeliveryResponse> {
    return this.http.put<DeliveryResponse>(`${this.apiUrl}/${deliveryId}/status`, { status });
  }

  /**
   * Get rider's deliveries
   */
  getRiderDeliveries(riderId: number, page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/rider/${riderId}`, { params });
  }

  /**
   * Get deliveries by status
   */
  getDeliveriesByStatus(status: string, page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('status', status)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/status`, { params });
  }

  /**
   * Rate a delivery
   */
  rateDelivery(deliveryId: number, rating: number, notes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${deliveryId}/rate`, {
      rating,
      notes: notes || ''
    });
  }

  /**
   * Cancel delivery
   */
  cancelDelivery(deliveryId: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${deliveryId}/cancel`, { reason });
  }

  /**
   * Get delivery analytics for date range
   */
  getDeliveryAnalytics(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<any>(`${this.apiUrl}/analytics`, { params });
  }

  /**
   * Auto-assign pending orders to nearest available riders
   */
  autoAssignOrders(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auto-assign`, {});
  }

  /**
   * Bulk assign orders to riders
   */
  bulkAssignOrders(assignments: Array<{ orderId: number; riderId: number }>): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-assign`, assignments);
  }

  /**
   * Get delivery performance metrics
   */
  getDeliveryPerformance(riderId: number, startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<any>(`${this.apiUrl}/rider/${riderId}/performance`, { params });
  }
}
