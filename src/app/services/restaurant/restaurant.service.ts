import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/app/Envirment/environment';
import { PayoutRequestDTO } from 'src/app/Models/payroll/payroll.model';
import { Restaurant } from 'src/app/Models/restaurant.model';
import { RestaurantOwnerProfile } from 'src/app/Models/Users/profile.model';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  private apiUrl = `${environment.apiUrl}/api`; // Backend URL

  constructor(private http: HttpClient) {}


    // Restaurants
    getRestaurants(): Observable<Restaurant[]> {
      return this.http.get<Restaurant[]>(`${this.apiUrl}/restaurants`);
    }

    getRestaurantById(id: number): Observable<Restaurant> {
      return this.http.get<Restaurant>(`${this.apiUrl}/restaurants/${id}`);
    }
    getRestaurantBycategoryName(name: string): Observable<Restaurant[]> {
      return this.http.get<Restaurant[]>(`${this.apiUrl}/restaurants/category/${name}`);
    }

    createRestaurant(restaurant: Omit<Restaurant, 'id'>): Observable<Restaurant> {
      return this.http.post<Restaurant>(`${this.apiUrl}/restaurants`, restaurant);
    }

    updateRestaurant(id: number, restaurant: Partial<Restaurant>): Observable<Restaurant> {

      return this.http.put<Restaurant>(`${this.apiUrl}/restaurants/${id}`, restaurant);

    }

  //  Toggle restaurant open/close status
  toggleRestaurantStatus(id: number, status: boolean): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.apiUrl}/restaurants/${id}/toggle-status?status=${status}`, {});
  }

      getRestaurantsByOwner(ownerId: number): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/restaurants/owner/${ownerId}`);
  }

    deleteRestaurant(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/restaurants/${id}`);
    }

    closeAllRestaurantsByOwner(ownerId: number): Observable<string> {
  return this.http.put(`${this.apiUrl}/restaurants/close-all/${ownerId}`, {}, { responseType: 'text' });
}

 processPayout(restaurantId: number, payoutRequest: PayoutRequestDTO): Observable<RestaurantOwnerProfile> {
    return this.http.post<RestaurantOwnerProfile>(
      `${this.apiUrl}/${restaurantId}/payout`,
      payoutRequest
    );
  }

}
