import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RiderPayroll {
  id: number;
  riderId: number;
  year: number;
  month: number;
  totalWorkHours: number;
  totalBreakHours: number;
  totalDeliveries: number;
  workPayment: number;
  deliveryBonus: number;
  overtimeBonus: number;
  deductionAmount: number;
  finalPay: number;
  paymentMethod?: string;
  paymentDate?: string;
  isPaid: boolean;
  receiptNumber?: string;
}

export interface PaymentMethod {
  id: string;
  customer_id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'wallet' | 'CASH' | 'CARD';
  last_four: string;
  is_default: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PayrollService {

  private baseUrl = '/api/payroll';

  constructor(private http: HttpClient) { }

  getPayrollsByMonth(year: number, month: number): Observable<RiderPayroll[]> {
    return this.http.get<RiderPayroll[]>(`${this.baseUrl}/month?year=${year}&month=${month}`);
  }

  generatePayroll(riderId: number, year: number, month: number): Observable<RiderPayroll> {
    return this.http.post<RiderPayroll>(`${this.baseUrl}/generate/${riderId}?year=${year}&month=${month}`, {});
  }

  payPayroll(payrollId: number, method: string): Observable<RiderPayroll> {
    return this.http.post<RiderPayroll>(`${this.baseUrl}/pay/${payrollId}?method=${method}`, {});
  }

  getPayrollsForRider(riderId: number): Observable<RiderPayroll[]> {
    return this.http.get<RiderPayroll[]>(`${this.baseUrl}/rider/${riderId}`);
  }

  getReceipt(payrollId: number): Observable<string> {
    return this.http.get(`${this.baseUrl}/receipt/${payrollId}`, { responseType: 'text' });
  }
}
