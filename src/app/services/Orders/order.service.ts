import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from 'src/app/Envirment/environment';
import { OrderResponseDTO, OrderStatistics, CreateOrderDTO, OrderStatus, PaymentStatus, OrderFilters, DeliveryOTP } from 'src/app/Models/Order/order.models';
import { PaginatedResponse } from 'src/app/Models/rider.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = `${environment.apiUrl}/api/orders`; // Change to your API URL

  // State management
  private ordersSubject = new BehaviorSubject<OrderResponseDTO[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  private statsSubject = new BehaviorSubject<OrderStatistics>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ============================================
  // CREATE ORDER
  // ============================================
  createOrder(order: CreateOrderDTO): Observable<OrderResponseDTO> {
    return this.http.post<OrderResponseDTO>(`${this.apiUrl}`, order).pipe(
      tap(newOrder => {
        const currentOrders = this.ordersSubject.value;
        this.ordersSubject.next([newOrder, ...currentOrders]);
        this.updateStats();
      })
    );
  }

  // ============================================
  // GET ORDERS
  // ============================================
  getAllOrders(page: number = 0, size: number = 100, sortBy: string = 'orderDate', sortDir: string = 'DESC'): Observable<OrderResponseDTO[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<any>(`${this.apiUrl}`, { params }).pipe(
      map(response => {
        // Handle paginated response
        if (response.content) {
          return response.content;
        }
        // Handle array response
        return response;
      }),
      tap(orders => {
        this.ordersSubject.next(orders);
        this.calculateStats(orders);
      })
    );
  }

  getOrderById(id: number): Observable<OrderResponseDTO> {
    return this.http.get<OrderResponseDTO>(`${this.apiUrl}/${id}`);
  }

  getOrderByOrderNumber(orderNumber: string): Observable<OrderResponseDTO> {
    return this.http.get<OrderResponseDTO>(`${this.apiUrl}/order-number/${orderNumber}`);
  }

  getOrdersByCustomer(customerId: number, page: number = 0, size: number = 10): Observable<OrderResponseDTO[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/customer/${customerId}`, { params }).pipe(
      map(response => response.content || response)
    );
  }

  //OTP


  getOrderOTP(orderId: number): Observable<DeliveryOTP> {
    return this.http.get<DeliveryOTP>(`${this.apiUrl}/${orderId}/otp`);
  }

  // Customer order list
getOrdersByCustomermain(customerId: number, page: number, size: number): Observable<PaginatedResponse<OrderResponseDTO>> {
  return this.http.get<PaginatedResponse<OrderResponseDTO>>(
    `${this.apiUrl}/customer/${customerId}`,
    { params: { page, size } }
  );
}

  getOrdersByRestaurant(restaurantId: number, page: number = 0, size: number = 10): Observable<OrderResponseDTO[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/restaurant/${restaurantId}`, { params }).pipe(
      map(response => response.content || response)
    );
  }

    //  Get all orders for a rider
  getOrdersByRider(riderId: number): Observable<OrderResponseDTO[]> {
    return this.http.get<OrderResponseDTO[]>(`${this.apiUrl}/rider/${riderId}`);
  }

  //  Get orders of a rider filtered by status
  getOrdersByRiderAndStatus(riderId: number, status: string): Observable<OrderResponseDTO[]> {
    return this.http.get<OrderResponseDTO[]>(`${this.apiUrl}/rider/${riderId}/status/${status}`);
  }
  getOrdersByRiderAndStatuses(riderId: number, statuses: string[]): Observable<OrderResponseDTO[]> {
  const params = statuses.map(s => `status=${s}`).join('&');
  return this.http.get<OrderResponseDTO[]>(`${this.apiUrl}/rider/${riderId}/status?${params}`);
}

confirmDelivery(orderId: number, otp: string): Observable<string> {
  return this.http.post(
    `${this.apiUrl}/confirm-delivery?orderId=${orderId}&otp=${otp}`,
    null,
    { responseType: 'text' } // ✅ Important change
  );
}

  //restaurant pannel

    getOrdersByRestaurantAndStatus(restaurantId: number, status: string): Observable<OrderResponseDTO[]> {
    return this.http.get<OrderResponseDTO[]>(`${this.apiUrl}/${restaurantId}/status/${status}`);
  }

  getTodayStats(restaurantId: number) {
  return this.http.get<any>(`${this.apiUrl}/restaurant/${restaurantId}/today-stats`);
}



  getOrdersByStatus(status: OrderStatus, page: number = 0, size: number = 10): Observable<OrderResponseDTO[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/status/${status}`, { params }).pipe(
      map(response => response.content || response)
    );
  }

  getOrdersByDateRange(startDate: string, endDate: string): Observable<OrderResponseDTO[]> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<OrderResponseDTO[]>(`${this.apiUrl}/date-range`, { params });
  }

  getPendingOrders(): Observable<OrderResponseDTO[]> {
    return this.http.get<OrderResponseDTO[]>(`${this.apiUrl}/pending`);
  }

  getActiveOrdersForRestaurant(restaurantId: number): Observable<OrderResponseDTO[]> {
    return this.http.get<OrderResponseDTO[]>(`${this.apiUrl}/restaurant/${restaurantId}/active`);
  }

  // ============================================
  // UPDATE ORDER
  // ============================================
  updateOrderStatus(orderId: number, status: OrderStatus): Observable<OrderResponseDTO> {
    let params = new HttpParams().set('status', status);

    return this.http.patch<OrderResponseDTO>(`${this.apiUrl}/${orderId}/status`, null, { params }).pipe(
      tap(updatedOrder => {
        const orders = this.ordersSubject.value.map(order =>
          order.id === orderId ? updatedOrder : order
        );
        this.ordersSubject.next(orders);
        this.updateStats();
      })
    );
  }

  updateOrderStatus2(orderId: number, status: OrderStatus): Observable<OrderResponseDTO> {
  // 🔒 VALIDATE orderId BEFORE using it
  if (orderId == null || orderId <= 0 || isNaN(orderId)) {
    throw new Error(`Invalid order ID: ${orderId}`);
  }

  const params = new HttpParams().set('status', status);

  return this.http.patch<OrderResponseDTO>(
    `${this.apiUrl}/${orderId}/status`,
    null,
    { params }
  ).pipe(
    tap(updatedOrder => {
      const orders = this.ordersSubject.value.map(order =>
        order.id === orderId ? updatedOrder : order
      );
      this.ordersSubject.next(orders);
      this.updateStats();
    })
  );
}

  updatePaymentStatus(orderId: number, status: PaymentStatus): Observable<OrderResponseDTO> {
    let params = new HttpParams().set('status', status);

    return this.http.patch<OrderResponseDTO>(`${this.apiUrl}/${orderId}/payment-status`, null, { params }).pipe(
      tap(updatedOrder => {
        const orders = this.ordersSubject.value.map(order =>
          order.id === orderId ? updatedOrder : order
        );
        this.ordersSubject.next(orders);
      })
    );
  }

  updateEstimatedDeliveryTime(orderId: number, estimatedTime: string): Observable<OrderResponseDTO> {
    let params = new HttpParams().set('estimatedTime', estimatedTime);

    return this.http.patch<OrderResponseDTO>(`${this.apiUrl}/${orderId}/estimated-delivery-time`, null, { params });
  }

  // ============================================
  // CANCEL ORDER
  // ============================================
  cancelOrder(orderId: number, reason?: string): Observable<OrderResponseDTO> {
    let params = new HttpParams();
    if (reason) {
      params = params.set('reason', reason);
    }

    return this.http.post<OrderResponseDTO>(`${this.apiUrl}/${orderId}/cancel`, null, { params }).pipe(
      tap(cancelledOrder => {
        const orders = this.ordersSubject.value.map(order =>
          order.id === orderId ? cancelledOrder : order
        );
        this.ordersSubject.next(orders);
        this.updateStats();
      })
    );
  }

  // ============================================
  // DELETE ORDER
  // ============================================
  deleteOrder(orderId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${orderId}`).pipe(
      tap(() => {
        const orders = this.ordersSubject.value.filter(order => order.id !== orderId);
        this.ordersSubject.next(orders);
        this.updateStats();
      })
    );
  }

  // ============================================
  // STATISTICS
  // ============================================
  getRestaurantStatistics(restaurantId: number): Observable<OrderStatistics> {
    return this.http.get<OrderStatistics>(`${this.apiUrl}/restaurant/${restaurantId}/statistics`);
  }

  getCustomerStatistics(customerId: number): Observable<OrderStatistics> {
    return this.http.get<OrderStatistics>(`${this.apiUrl}/customer/${customerId}/statistics`);
  }

  // ============================================
  // LOCAL FILTERING
  // ============================================
  filterOrders(filters: OrderFilters): OrderResponseDTO[] {
    let filtered = [...this.ordersSubject.value];

    if (filters.status) {
      filtered = filtered.filter(o => o.orderStatus === filters.status);
    }

    if (filters.paymentStatus) {
      filtered = filtered.filter(o => o.paymentStatus === filters.paymentStatus);
    }

    if (filters.deliveryType) {
      filtered = filtered.filter(o => o.deliveryType === filters.deliveryType);
    }

    if (filters.priorityLevel) {
      filtered = filtered.filter(o => o.priorityLevel === filters.priorityLevel);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.restaurantName.toLowerCase().includes(query) ||
        (o.customerPhone && o.customerPhone.includes(query))
      );
    }

    if (filters.minAmount) {
      filtered = filtered.filter(o => o.totalAmount >= filters.minAmount!);
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(o => o.totalAmount <= filters.maxAmount!);
    }

    return filtered;
  }

  // ============================================
  // STATS CALCULATION
  // ============================================
  private calculateStats(orders: OrderResponseDTO[]): void {
    const totalRevenue = orders.reduce((sum, order) =>
      order.orderStatus === 'DELIVERED' ? sum + order.totalAmount : sum, 0
    );
    const completedOrders = orders.filter(o => o.orderStatus === 'DELIVERED').length;

    this.statsSubject.next({
      totalOrders: orders.length,
      totalRevenue: totalRevenue,
      averageOrderValue: completedOrders > 0 ? totalRevenue / completedOrders : 0,
      pendingOrders: orders.filter(o => ['PLACED', 'CONFIRMED'].includes(o.orderStatus)).length,
      completedOrders: completedOrders,
      cancelledOrders: orders.filter(o => o.orderStatus === 'CANCELLED').length
    });
  }

    getCompanyStatistics(): Observable<OrderStatistics> {
    return this.http.get<OrderStatistics>(`${this.apiUrl}/company`);
  }

  private updateStats(): void {
    this.calculateStats(this.ordersSubject.value);
  }
}
