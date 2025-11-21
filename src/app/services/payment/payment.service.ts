import { environment } from './../../Envirment/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';


export interface PaymentFilter {
  paymentType?: string;
  paymentStatus?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface Payment {
  id: number;
  transactionId: string;
  orderId?: number;
  orderNumber?: string;
  userId: number;
  userName: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
  paymentGateway?: string;
  gatewayTransactionId?: string;
  failureReason?: string;
  cardLastFour?: string;
  cardBrand?: string;
  currency: string;
  paymentDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResponse {
  success: boolean;
  data: Payment[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  message?: string;
}

export interface PaymentStatistics {
  totalRevenue: number;
  customerPaymentCount: number;
  customerPaymentAmount: number;
  riderCollectionCount: number;
  riderCollectionAmount: number;
  riderSalaryCount: number;
  riderSalaryAmount: number;
  restaurantPayoutCount: number;
  restaurantPayoutAmount: number;
  startDate: string;
  endDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl =`${environment.apiUrl}/api/v1/admin/payments`;

  constructor(private http: HttpClient) {}

  getAllPayments(filter: PaymentFilter): Observable<PaymentResponse> {
    let params = new HttpParams();

    if (filter.paymentType) params = params.set('paymentType', filter.paymentType);
    if (filter.paymentStatus) params = params.set('paymentStatus', filter.paymentStatus);
    if (filter.userId) params = params.set('userId', filter.userId.toString());
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);
    if (filter.page !== undefined) params = params.set('page', filter.page.toString());
    if (filter.size) params = params.set('size', filter.size.toString());
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);

    return this.http.get<PaymentResponse>(this.apiUrl, { params });
  }

  getPaymentStatistics(startDate?: string, endDate?: string): Observable<{ success: boolean; data: PaymentStatistics }> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<{ success: boolean; data: PaymentStatistics }>(`${this.apiUrl}/statistics`, { params });
  }

  getPaymentTypes(): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.apiUrl}/types`);
  }

  getPaymentStatuses(): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.apiUrl}/statuses`);
  }

   //  Download BULK payment slips (filtered)
  downloadBulkPaymentSlip(filter: PaymentFilter): Observable<Blob> {
    let params = new HttpParams();

    if (filter.paymentType) params = params.set('paymentType', filter.paymentType);
    if (filter.paymentStatus) params = params.set('paymentStatus', filter.paymentStatus);
    if (filter.userId) params = params.set('userId', filter.userId.toString());
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);

    // Note: We omit `page` & `size` — backend handles full export
    return this.http.get(`${environment.apiUrl}/api/reports/paymentSlip`, {
      params,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map((res: HttpResponse<Blob>) => {
        const filename = res.headers.get('content-disposition')?.split(';')[1]?.split('=')[1]?.replace(/"/g, '') || 'payment_slips.pdf';
        return new Blob([res.body as BlobPart], { type: 'application/pdf' });
      })
    );
  }

  // ✅ Download SINGLE payment slip
  downloadSinglePaymentSlip(id: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/api/reports/${id}/slip`, {
      responseType: 'blob'
    });
  }
}
