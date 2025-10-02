import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AvailabilityStatus } from 'src/app/Enums/profileEnums';
import { environment } from 'src/app/Envirment/environment';
import { DeliveryPersonCreateDTO, DeliveryPersonProfile, LocationUpdateDTO } from 'src/app/Models/Users/profile.model';
import { PaginatedResponse } from 'src/app/Models/Users/user.models';

@Injectable({
  providedIn: 'root'
})
export class DeliveryPersonService {

  private apiUrl = `${environment.apiUrl}/api/delivery-persons`;

  constructor(private http: HttpClient) {}

  createDeliveryPerson(userId: number, profile: DeliveryPersonCreateDTO): Observable<DeliveryPersonProfile> {
    return this.http.post<DeliveryPersonProfile>(`${this.apiUrl}/user/${userId}`, profile);
  }

  getDeliveryPersonById(id: number): Observable<DeliveryPersonProfile> {
    return this.http.get<DeliveryPersonProfile>(`${this.apiUrl}/${id}`);
  }

  getAllDeliveryPersons(page = 0, size = 10, sortBy = 'avgRating', sortDir = 'DESC'): Observable<PaginatedResponse<DeliveryPersonProfile>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<PaginatedResponse<DeliveryPersonProfile>>(this.apiUrl, { params });
  }

  getByAvailabilityStatus(status: AvailabilityStatus, page = 0, size = 10): Observable<PaginatedResponse<DeliveryPersonProfile>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<DeliveryPersonProfile>>(`${this.apiUrl}/status/${status}`, { params });
  }

  getAvailableDeliveryPersons(): Observable<DeliveryPersonProfile[]> {
    return this.http.get<DeliveryPersonProfile[]>(`${this.apiUrl}/available`);
  }

  findNearbyDeliveryPersons(latitude: number, longitude: number, radiusKm: number): Observable<DeliveryPersonProfile[]> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('radiusKm', radiusKm.toString());
    return this.http.get<DeliveryPersonProfile[]>(`${this.apiUrl}/nearby`, { params });
  }

  updateProfile(id: number, profile: Partial<DeliveryPersonCreateDTO>): Observable<DeliveryPersonProfile> {
    return this.http.put<DeliveryPersonProfile>(`${this.apiUrl}/${id}`, profile);
  }

  updateLocation(id: number, location: LocationUpdateDTO): Observable<DeliveryPersonProfile> {
    return this.http.patch<DeliveryPersonProfile>(`${this.apiUrl}/${id}/location`, location);
  }

  startShift(id: number): Observable<DeliveryPersonProfile> {
    return this.http.post<DeliveryPersonProfile>(`${this.apiUrl}/${id}/shift/start`, null);
  }

  endShift(id: number): Observable<DeliveryPersonProfile> {
    return this.http.post<DeliveryPersonProfile>(`${this.apiUrl}/${id}/shift/end`, null);
  }

  goOnline(id: number): Observable<DeliveryPersonProfile> {
    return this.http.patch<DeliveryPersonProfile>(`${this.apiUrl}/${id}/online`, null);
  }

  goOffline(id: number): Observable<DeliveryPersonProfile> {
    return this.http.patch<DeliveryPersonProfile>(`${this.apiUrl}/${id}/offline`, null);
  }

  setBusy(id: number): Observable<DeliveryPersonProfile> {
    return this.http.patch<DeliveryPersonProfile>(`${this.apiUrl}/${id}/busy`, null);
  }

  verifyDeliveryPerson(id: number): Observable<DeliveryPersonProfile> {
    return this.http.patch<DeliveryPersonProfile>(`${this.apiUrl}/${id}/verify`, null);
  }

  completeDelivery(id: number, earnings: number): Observable<DeliveryPersonProfile> {
    const params = new HttpParams().set('earnings', earnings.toString());
    return this.http.post<DeliveryPersonProfile>(`${this.apiUrl}/${id}/complete-delivery`, null, { params });
  }

  updateRating(id: number, rating: number): Observable<DeliveryPersonProfile> {
    const params = new HttpParams().set('rating', rating.toString());
    return this.http.patch<DeliveryPersonProfile>(`${this.apiUrl}/${id}/rating`, null, { params });
  }

  getDeliveryStats(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/stats`);
  }
}
