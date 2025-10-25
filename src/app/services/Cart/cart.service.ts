import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AddCartItemDTO, CartResponseDTO, CartSummaryDTO, CheckoutDTO } from 'src/app/Models/cart/cart.models';
import { OrderResponseDTO } from 'src/app/Models/Order/order.models';

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

updateCartItemQuantity(userId: number, cartItemId: number, quantity: number) {
  return this.http.put<CartResponseDTO>(
    `${this.apiUrl}/user/${userId}/items/${cartItemId}?quantity=${quantity}`,
    {}
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
  getCartSummary(userId: number): Observable<CartSummaryDTO> {
    return this.http.get<CartSummaryDTO>(`${this.apiUrl}/user/${userId}/summary`);
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
