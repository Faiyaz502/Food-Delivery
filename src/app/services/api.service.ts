import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CateringPackage, CateringOrder } from '../Models/catering-package.model';
import { MenuItem } from '../Models/menu-item.model';
import { Order } from '../Models/order.model';
import { Payment } from '../Models/payment.model';
import { Restaurant } from '../Models/restaurant.model';
import { Rider } from '../Models/rider.model';
import { User } from '../Models/user.model';
import { PendingRequest } from '../Models/pending-request.model';
import { TeamMember } from '../Models/team-member.model';
import { CustomerLocation } from '../Models/customer-location.model';
import { Review } from '../Models/review.model';
import { Sales } from '../Models/sales.model';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`);
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  // Restaurants
  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/restaurants`);
  }

  getRestaurantById(id: number): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.baseUrl}/restaurants/${id}`);
  }

  createRestaurant(restaurant: Omit<Restaurant, 'id'>): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.baseUrl}/restaurants`, restaurant);
  }

  updateRestaurant(id: number, restaurant: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.patch<Restaurant>(`${this.baseUrl}/restaurants/${id}`, restaurant);
  }

  deleteRestaurant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/restaurants/${id}`);
  }

  // Menu Items
  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/menuItems`);
  }

  getMenuItemsByRestaurant(restaurantId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/menuItems?restaurant_id=${restaurantId}`);
  }

  createMenuItem(menuItem: Omit<MenuItem, 'id'>): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.baseUrl}/menuItems`, menuItem);
  }

  updateMenuItem(id: number, menuItem: Partial<MenuItem>): Observable<MenuItem> {
    return this.http.patch<MenuItem>(`${this.baseUrl}/menuItems/${id}`, menuItem);
  }

  deleteMenuItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/menuItems/${id}`);
  }

  // Orders
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }


 createOrder(order: Omit<Order, 'id'>): Observable<Order> {
  return this.http.post<Order>(`${this.baseUrl}/orders`, order);
}

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/orders/${id}`, { status });
  }

  updateOrder(id: number, order: Partial<Order>): Observable<Order> {
  return this.http.patch<Order>(`${this.baseUrl}/orders/${id}`, order);
}

  // Payments
  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/payments`);
  }

  // Riders
  getRiders(): Observable<Rider[]> {
    return this.http.get<Rider[]>(`${this.baseUrl}/riders`);
  }

  updateRiderAvailability(id: number, availability: boolean): Observable<Rider> {
    return this.http.patch<Rider>(`${this.baseUrl}/riders/${id}`, { availability });
  }

  // Catering Packages
  getCateringPackages(): Observable<CateringPackage[]> {
    return this.http.get<CateringPackage[]>(`${this.baseUrl}/cateringPackages`);
  }

  createCateringPackage(pkg: Omit<CateringPackage, 'id'>): Observable<CateringPackage> {
    return this.http.post<CateringPackage>(`${this.baseUrl}/cateringPackages`, pkg);
  }

  updateCateringPackage(id: number, pkg: Partial<CateringPackage>): Observable<CateringPackage> {
    return this.http.patch<CateringPackage>(`${this.baseUrl}/cateringPackages/${id}`, pkg);
  }

  deleteCateringPackage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cateringPackages/${id}`);
  }

  // Catering Orders
  getCateringOrders(): Observable<CateringOrder[]> {
    return this.http.get<CateringOrder[]>(`${this.baseUrl}/cateringOrders`);
  }


  // Sales
  getSales(): Observable<Sales[]> {
    return this.http.get<Sales[]>(`${this.baseUrl}/sales`);
  }

  // Reviews
  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews`);
  }

  // Pending Requests
  getPendingRequests(): Observable<PendingRequest[]> {
    return this.http.get<PendingRequest[]>(`${this.baseUrl}/pendingRequests`);
  }

  approveRequest(id: string): Observable<PendingRequest> {
    return this.http.patch<PendingRequest>(`${this.baseUrl}/pendingRequests/${id}`, { status: 'approved' });
  }

  rejectRequest(id: string): Observable<PendingRequest> {
    return this.http.patch<PendingRequest>(`${this.baseUrl}/pendingRequests/${id}`, { status: 'rejected' });
  }

  // Team Members
  getTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.baseUrl}/teamMembers`);
  }

  // Customer Locations
  getCustomerLocations(): Observable<CustomerLocation[]> {
    return this.http.get<CustomerLocation[]>(`${this.baseUrl}/customerLocations`);
  }



}
