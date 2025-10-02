import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/app/Envirment/environment';
import { RestaurantOwnerCreateDTO, RestaurantOwnerProfile } from 'src/app/Models/Users/profile.model';
import { PaginatedResponse } from 'src/app/Models/Users/user.models';

@Injectable({
  providedIn: 'root'
})
export class RestaurantOwnerService {

  private apiUrl = `${environment.apiUrl}/api/restaurant-owners`;

  constructor(private http: HttpClient) {}

  createRestaurantOwner(userId: number, profile: RestaurantOwnerCreateDTO): Observable<RestaurantOwnerProfile> {
    return this.http.post<RestaurantOwnerProfile>(`${this.apiUrl}/user/${userId}`, profile);
  }

  getRestaurantOwnerById(id: number): Observable<RestaurantOwnerProfile> {
    return this.http.get<RestaurantOwnerProfile>(`${this.apiUrl}/${id}`);
  }

  getAllRestaurantOwners(page = 0, size = 10, sortBy = 'totalEarnings', sortDir = 'DESC'): Observable<PaginatedResponse<RestaurantOwnerProfile>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<PaginatedResponse<RestaurantOwnerProfile>>(this.apiUrl, { params });
  }

  getApprovedOwners(page = 0, size = 10): Observable<PaginatedResponse<RestaurantOwnerProfile>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<RestaurantOwnerProfile>>(`${this.apiUrl}/approved`, { params });
  }

  getPendingOwners(page = 0, size = 10): Observable<PaginatedResponse<RestaurantOwnerProfile>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<RestaurantOwnerProfile>>(`${this.apiUrl}/pending`, { params });
  }

  updateProfile(id: number, profile: Partial<RestaurantOwnerCreateDTO>): Observable<RestaurantOwnerProfile> {
    return this.http.put<RestaurantOwnerProfile>(`${this.apiUrl}/${id}`, profile);
  }

  approveOwner(id: number): Observable<RestaurantOwnerProfile> {
    return this.http.patch<RestaurantOwnerProfile>(`${this.apiUrl}/${id}/approve`, null);
  }

  revokeApproval(id: number): Observable<RestaurantOwnerProfile> {
    return this.http.patch<RestaurantOwnerProfile>(`${this.apiUrl}/${id}/revoke-approval`, null);
  }

  addEarnings(id: number, amount: number): Observable<RestaurantOwnerProfile> {
    const params = new HttpParams().set('amount', amount.toString());
    return this.http.post<RestaurantOwnerProfile>(`${this.apiUrl}/${id}/earnings`, null, { params });
  }

  processPayout(id: number, amount: number): Observable<RestaurantOwnerProfile> {
    return this.http.post<RestaurantOwnerProfile>(`${this.apiUrl}/${id}/payout`, { amount });
  }

  getFinancialSummary(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/financial-summary`);
  }

  deleteRestaurantOwner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
