import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerTier } from 'src/app/Enums/profileEnums';
import { environment } from 'src/app/Envirment/environment';
import { CustomerLocation } from 'src/app/Models/customer-location.model';
import { UserProfileCreateDTO, UserProfile } from 'src/app/Models/Users/profile.model';
import { PaginatedResponse } from 'src/app/Models/Users/user.models';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private apiUrl = `${environment.apiUrl}/api/user-profiles`;

  constructor(private http: HttpClient) {}

  createUserProfile(userId: number, profile: UserProfileCreateDTO): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.apiUrl}/user/${userId}`, profile);
  }

  getUserProfileById(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${id}`);
  }

  getUserProfileByUserId(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/user/${userId}`);
  }

  getAllUserProfiles(page = 0, size = 10, sortBy = 'totalOrders', sortDir = 'DESC'): Observable<PaginatedResponse<UserProfile>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<PaginatedResponse<UserProfile>>(this.apiUrl, { params });
  }

  getTopCustomersByOrders(limit = 10): Observable<UserProfile[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<UserProfile[]>(`${this.apiUrl}/top-customers/orders`, { params });
  }

  getTopCustomersBySpending(limit = 10): Observable<UserProfile[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<UserProfile[]>(`${this.apiUrl}/top-customers/spending`, { params });
  }

  getCustomersByTier(tier: CustomerTier, page = 0, size = 10): Observable<PaginatedResponse<UserProfile>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<UserProfile>>(`${this.apiUrl}/tier/${tier}`, { params });
  }

  getCustomersWithMinimumOrders(minOrders: number, page = 0, size = 10): Observable<PaginatedResponse<UserProfile>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<UserProfile>>(`${this.apiUrl}/min-orders/${minOrders}`, { params });
  }

  updateUserProfile(id: number, profile: UserProfileCreateDTO): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/${id}`, profile);
  }

  addLoyaltyPoints(id: number, points: number): Observable<UserProfile> {
    const params = new HttpParams().set('points', points.toString());
    return this.http.patch<UserProfile>(`${this.apiUrl}/${id}/loyalty-points/add`, null, { params });
  }

  deductLoyaltyPoints(id: number, points: number): Observable<UserProfile> {
    const params = new HttpParams().set('points', points.toString());
    return this.http.patch<UserProfile>(`${this.apiUrl}/${id}/loyalty-points/deduct`, null, { params });
  }

  addOrder(id: number, orderAmount: number): Observable<UserProfile> {
    const params = new HttpParams().set('orderAmount', orderAmount.toString());
    return this.http.post<UserProfile>(`${this.apiUrl}/${id}/orders`, null, { params });
  }

  getCustomerStats(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/stats`);
  }

  deleteUserProfile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCustomerLocations(): Observable<CustomerLocation[]> {
  return this.http.get<CustomerLocation[]>(`${this.apiUrl}/customers/locations`);
}
}
