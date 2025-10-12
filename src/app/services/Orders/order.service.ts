import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { OrderResponseDTO, OrderStatistics, CreateOrderDTO, OrderStatus, PaymentStatus, OrderFilters, CartResponseDTO, AddCartItemDTO, CartSummary, CheckoutDTO } from 'src/app/Models/Order/order.models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:8080/api/orders'; // Change to your API URL

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
  getAllOrders(page: number = 0, size: number = 50, sortBy: string = 'orderDate', sortDir: string = 'DESC'): Observable<OrderResponseDTO[]> {
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

  getOrdersByRestaurant(restaurantId: number, page: number = 0, size: number = 10): Observable<OrderResponseDTO[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/restaurant/${restaurantId}`, { params }).pipe(
      map(response => response.content || response)
    );
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

  private updateStats(): void {
    this.calculateStats(this.ordersSubject.value);
  }
}

// ============================================
// 4. CART SERVICE (services/cart.service.ts)
// ============================================

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api/carts'; // Change to your API URL

  // State management
  private cartsSubject = new BehaviorSubject<CartResponseDTO[]>([]);
  public carts$ = this.cartsSubject.asObservable();

  private currentCartSubject = new BehaviorSubject<CartResponseDTO | null>(null);
  public currentCart$ = this.currentCartSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ============================================
  // GET CART
  // ============================================
  getOrCreateCart(userId: number): Observable<CartResponseDTO> {
    return this.http.get<CartResponseDTO>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(cart => this.currentCartSubject.next(cart))
    );
  }

  getAllActiveCarts(): Observable<CartResponseDTO[]> {

    return this.http.get<CartResponseDTO[]>(this.apiUrl);
  }

  // ============================================
  // CART ITEMS OPERATIONS
  // ============================================
  addItemToCart(userId: number, item: AddCartItemDTO): Observable<CartResponseDTO> {
    return this.http.post<CartResponseDTO>(`${this.apiUrl}/user/${userId}/items`, item).pipe(
      tap(cart => this.currentCartSubject.next(cart))
    );
  }

  updateCartItemQuantity(userId: number, cartItemId: number, quantity: number): Observable<CartResponseDTO> {
    let params = new HttpParams().set('quantity', quantity.toString());

    return this.http.put<CartResponseDTO>(`${this.apiUrl}/user/${userId}/items/${cartItemId}`, null, { params }).pipe(
      tap(cart => this.currentCartSubject.next(cart))
    );
  }

  removeItemFromCart(userId: number, cartItemId: number): Observable<CartResponseDTO> {
    return this.http.delete<CartResponseDTO>(`${this.apiUrl}/user/${userId}/items/${cartItemId}`).pipe(
      tap(cart => this.currentCartSubject.next(cart))
    );
  }

  clearCart(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/user/${userId}/clear`).pipe(
      tap(() => this.currentCartSubject.next(null))
    );
  }

  // ============================================
  // CART SUMMARY
  // ============================================
  getCartSummary(userId: number): Observable<CartSummary> {
    return this.http.get<CartSummary>(`${this.apiUrl}/user/${userId}/summary`);
  }

  // ============================================
  // CHECKOUT
  // ============================================
  checkout(userId: number, checkoutData: CheckoutDTO): Observable<OrderResponseDTO> {
    return this.http.post<OrderResponseDTO>(`${this.apiUrl}/user/${userId}/checkout`, checkoutData).pipe(
      tap(() => this.currentCartSubject.next(null))
    );
  }

  // ============================================
  // HELPER METHODS
  // ============================================
  calculateCartTotal(cart: CartResponseDTO): number {
    const tax = cart.subtotal * 0.1;
    const estimatedDeliveryFee = 75; // Average delivery fee
    return cart.subtotal + tax + estimatedDeliveryFee;
  }

  getLastActivityMinutes(updatedAt: string): number {
    const now = new Date().getTime();
    const updated = new Date(updatedAt).getTime();
    return Math.floor((now - updated) / 60000);
  }
}
