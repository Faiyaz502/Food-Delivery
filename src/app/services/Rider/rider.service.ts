import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/app/Envirment/environment';
import { LocationUpdate, Rider } from 'src/app/Models/rider.model';


interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}



interface RiderStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  successRate: number;
  avgRating: number;
  earningsToday: number;
  totalEarnings: number;
}

@Injectable({
  providedIn: 'root'
})
export class RiderService {
  private apiUrl = `${environment.apiUrl}/api/delivery-persons`;
  private ridersSubject = new BehaviorSubject<Rider[]>([]);
  public riders$ = this.ridersSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Get all riders with pagination and sorting
   */
  getAllRiders(page: number = 0, size: number = 20, sortBy: string = 'createdAt', sortDir: string = 'DESC'): Observable<PaginatedResponse<Rider>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PaginatedResponse<Rider>>(this.apiUrl, { params });
  }

  /**
   * Get riders by availability status
   */
  getRidersByStatus(status: string, page: number = 0, size: number = 20): Observable<PaginatedResponse<Rider>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<Rider>>(`${this.apiUrl}/status/${status}`, { params });
  }

  /**
   * Get available riders (AVAILABLE status only)
   */
  getAvailableRiders(): Observable<Rider[]> {
    return this.http.get<Rider[]>(`${this.apiUrl}/available`);
  }

  /**
   * Get single rider by ID
   */
  getRiderById(id: number): Observable<Rider> {
    return this.http.get<Rider>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get rider delivery statistics
   */
  getDeliveryStats(riderId: number): Observable<RiderStats> {
    return this.http.get<RiderStats>(`${this.apiUrl}/${riderId}/stats`);
  }

  /**
   * Get rider heatmap data for specific month
   */
  getRiderHeatmapData(riderId: number, year: number, month: number): Observable<any[]> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get<any[]>(`${this.apiUrl}/${riderId}/heatmap`, { params });
  }

  /**
   * Get nearby riders by coordinates
   */
  findNearbyRiders(latitude: number, longitude: number, radiusKm: number = 10): Observable<Rider[]> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('radiusKm', radiusKm.toString());

    return this.http.get<Rider[]>(`${this.apiUrl}/nearby`, { params });
  }

  /**
   * Update rider profile
   */
  updateRiderProfile(id: number, updateData: any): Observable<Rider> {
    return this.http.put<Rider>(`${this.apiUrl}/${id}`, updateData);
  }

  /**
   * Update rider location
   */
updateRiderLocation(riderId: number, location: LocationUpdate): Observable<any> {
  return this.http.patch(`${this.apiUrl}/${riderId}/location`, location);
}
  /**
   * Change rider status - Go Online
   */
  goOnline(id: number): Observable<Rider> {
    return this.http.patch<Rider>(`${this.apiUrl}/${id}/online`, null);
  }

  /**
   * Change rider status - Go Offline
   */
  goOffline(id: number): Observable<Rider> {
    return this.http.patch<Rider>(`${this.apiUrl}/${id}/offline`, null);
  }

  /**
   * Change rider status - Set Busy
   */
  setBusy(id: number): Observable<Rider> {
    return this.http.patch<Rider>(`${this.apiUrl}/${id}/busy`, null);
  }

  /**
   * Start shift
   */
  startShift(id: number): Observable<Rider> {
    return this.http.post<Rider>(`${this.apiUrl}/${id}/shift/start`, null);
  }

  /**
   * End shift
   */
  endShift(id: number): Observable<Rider> {
    return this.http.post<Rider>(`${this.apiUrl}/${id}/shift/end`, null);
  }

  /**
   * Verify rider (admin action)
   */
  verifyRider(id: number): Observable<Rider> {
    return this.http.patch<Rider>(`${this.apiUrl}/${id}/verify`, null);
  }

  /**
   * Complete delivery and add earnings
   */
  completeDelivery(id: number, earnings: number): Observable<Rider> {
    const params = new HttpParams().set('earnings', earnings.toString());
    return this.http.post<Rider>(`${this.apiUrl}/${id}/complete-delivery`, null, { params });
  }

  /**
   * Update rider rating
   */
  updateRating(id: number, rating: number): Observable<Rider> {
    const params = new HttpParams().set('rating', rating.toString());
    return this.http.patch<Rider>(`${this.apiUrl}/${id}/rating`, null, { params });
  }

  /**
   * Get top rated riders
   */
  getTopRatedRiders(limit: number = 10): Observable<Rider[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Rider[]>(`${this.apiUrl}/top-rated`, { params });
  }

    getRiderLocation(riderId: number): Observable<LocationUpdate> {
    return this.http.get<LocationUpdate>(`${this.apiUrl}/${riderId}/currentLocation`);
  }

  /**
   * Get top earners
   */
  getTopEarners(limit: number = 10): Observable<Rider[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Rider[]>(`${this.apiUrl}/top-earners`, { params });
  }
}
