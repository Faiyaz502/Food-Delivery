// src/app/services/coupon.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/Envirment/environment';
import {
  CouponCreateRequest,
  CouponResponse,
  CouponUpdateRequest,
  CouponApplyRequest,
  CouponDiscountResponse,
  CouponType
} from 'src/app/Models/NotificationAndCoupon/coupon.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  private apiUrl = `${environment.apiUrl}/api/coupons`;

  constructor(private http: HttpClient) {}

  // ✅ POST /api/coupons
  createCoupon(request: CouponCreateRequest): Observable<CouponResponse> {
    return this.http.post<CouponResponse>(this.apiUrl, request);
  }

  // ✅ PUT /api/coupons/{id}
  updateCoupon(id: number, request: CouponUpdateRequest): Observable<CouponResponse> {
    return this.http.put<CouponResponse>(`${this.apiUrl}/${id}`, request);
  }

  // ✅ GET /api/coupons/{id}
  getCouponById(id: number): Observable<CouponResponse> {
    return this.http.get<CouponResponse>(`${this.apiUrl}/${id}`);
  }

  // ✅ GET /api/coupons/code/{code}
  getCouponByCode(code: string): Observable<CouponResponse> {
    return this.http.get<CouponResponse>(`${this.apiUrl}/code/${code}`);
  }

  //validate
   validateCode(code: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/validate/${code}`);
  }

  // ✅ GET /api/coupons (paginated)
  getAllCoupons(page: number = 0, size: number = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'createdAt,desc');
    return this.http.get(`${this.apiUrl}`, { params });
  }

  // ✅ GET /api/coupons/valid
  getValidCoupons(): Observable<CouponResponse[]> {
    return this.http.get<CouponResponse[]>(`${this.apiUrl}/valid`);
  }
  //Get Active coupon

    getActiveCoupons(): Observable<CouponResponse[]> {
    return this.http.get<CouponResponse[]>(`${this.apiUrl}/active`);
  }


  // ✅ GET /api/coupons/valid/type/{type}
  getValidCouponsByType(couponType: CouponType): Observable<CouponResponse[]> {
    return this.http.get<CouponResponse[]>(`${this.apiUrl}/valid/type/${couponType}`);
  }

  // ✅ POST /api/coupons/apply → requires CouponApplyRequest body
  applyCoupon(request: CouponApplyRequest): Observable<CouponDiscountResponse> {
    return this.http.post<CouponDiscountResponse>(`${this.apiUrl}/apply`, request);
  }

  // ✅ POST /api/coupons/{code}/use
  useCoupon(code: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${code}/use`, {});
  }

  // ✅ PATCH /api/coupons/{id}/deactivate
  deactivateCoupon(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  // ✅ DELETE /api/coupons/{id}
  deleteCoupon(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}