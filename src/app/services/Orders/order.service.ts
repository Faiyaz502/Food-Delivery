import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { OrderFilters, Order, OrderStatus, CustomerOrderStats, RestaurantOrderStats, PaymentStatus, DeliveryStats } from 'src/app/Models/Order/order.models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return httpParams;
  }

  // --- Orders ---
getOrders(page: number = 1, limit: number = 20, filters?: OrderFilters): Observable<{ orders: Order[], total: number }> {
  const params = this.buildParams({ page: page - 1, size: limit, ...filters }); // Spring pages are 0-based
  return this.http.get<any>(`${this.baseUrl}/api/orders`, { params }).pipe(
    map(res => ({
      orders: res.content || [],
      total: res.totalElements || 0
    }))
  );
}
  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/api/orders/${id}`);
  }

  getOrdersByStatus(status: OrderStatus): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/api/orders/status/${status}`);
  }

  getOrdersByDateRange(startDate: string, endDate: string): Observable<Order[]> {
    const params = this.buildParams({ startDate, endDate });
    return this.http.get<Order[]>(`${this.baseUrl}/api/orders/date-range`, { params });
  }

  getCustomerOrders(customerId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/api/orders/customer/${customerId}`);
  }

  getCustomerOrderStatistics(customerId: string): Observable<CustomerOrderStats> {
    return this.http.get<CustomerOrderStats>(`${this.baseUrl}/api/orders/customer/${customerId}/statistics`);
  }

  getRestaurantOrders(restaurantId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/api/orders/restaurant/${restaurantId}`);
  }

  getRestaurantActiveOrders(restaurantId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/api/orders/restaurant/${restaurantId}/active`);
  }

  getRestaurantOrderStatistics(restaurantId: string): Observable<RestaurantOrderStats> {
    return this.http.get<RestaurantOrderStats>(`${this.baseUrl}/api/orders/restaurant/${restaurantId}/statistics`);
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/api/orders/${orderId}/status`, { status });
  }

  updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/api/orders/${orderId}/payment-status`, { paymentStatus });
  }

  updateEstimatedDeliveryTime(orderId: string, estimatedTime: string): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/api/orders/${orderId}/estimated-delivery-time`, { estimatedTime });
  }

  cancelOrder(orderId: string, reason: string): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/api/orders/${orderId}/cancel`, { reason });
  }

  deleteOrder(orderId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/orders/${orderId}`);
  }

  // --- Delivery & Restaurant stats ---
  getDeliveryStats(deliveryPersonId: string): Observable<DeliveryStats> {
    return this.http.get<DeliveryStats>(`${this.baseUrl}/api/delivery-persons/${deliveryPersonId}/stats`);
  }

  getAvailableDeliveryPersons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/delivery-persons/available`);
  }

  getRestaurantFinancialSummary(restaurantOwnerId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/restaurant-owners/${restaurantOwnerId}/financial-summary`);
  }
}
