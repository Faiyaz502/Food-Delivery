import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/Envirment/environment';
import { PaymentMethodPayroll, RiderPayroll } from 'src/app/Models/payroll/payroll.model';




@Injectable({
  providedIn: 'root'
})
export class PayrollService {

   private apiUrl = `${environment.apiUrl}/api/payroll`;

  constructor(private http: HttpClient) {}

  /**
   * Generate monthly payroll for a rider
   */
  generatePayroll(riderId: number, year: number, month: number): Observable<RiderPayroll> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.post<RiderPayroll>(`${this.apiUrl}/generate/${riderId}`, null, { params });
  }

  /**
   * Pay a generated payroll
   */
  payPayroll(payrollId: number, method: PaymentMethodPayroll): Observable<RiderPayroll> {
    const params = new HttpParams().set('method', method);
    return this.http.post<RiderPayroll>(`${this.apiUrl}/pay/${payrollId}`, null, { params });
  }

  /**
   * Get all payrolls for a specific month
   */
  getPayrollsByMonth(year: number, month: number): Observable<RiderPayroll[]> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get<RiderPayroll[]>(`${this.apiUrl}/month`, { params });
  }

  /**
   * Get all payrolls for a specific rider
   */
  getPayrollsForRider(riderId: number): Observable<RiderPayroll[]> {
    return this.http.get<RiderPayroll[]>(`${this.apiUrl}/rider/${riderId}`);
  }
}
